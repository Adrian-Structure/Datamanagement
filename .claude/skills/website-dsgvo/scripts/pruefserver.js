#!/usr/bin/env node
/**
 * pruefserver.js — lokaler Ausführungs-Server für das website-dsgvo-Cockpit.
 *
 * Zweck: Die Cockpit-HTML (assets/wizard.html) kann fremde Live-URLs wegen
 * CORS nicht selbst laden. Dieser Server serviert das Cockpit same-origin
 * und holt Live-Seiten SERVERSEITIG — rein lokal, keine Cloud, keine Dritten.
 *
 * Zero-Dependency: nur node:http, node:https, node:fs, node:path, node:url.
 * Node >= 16. Bindet NUR an 127.0.0.1.
 *
 * API-Vertrag (für das Cockpit):
 *   GET /api/ping   -> {"ok":true,"version":"1.1"}
 *   GET /api/pruefe?url=<encoded>
 *     -> { ok, finalUrl, https, status, headers:{...}, cookiesGesetzt:[Namen],
 *          html, proben:{pfad:status,...}, impUrl, impText, dseUrl, dseText,
 *          fehler:null }
 *     -> bei Fehler: { ok:false, fehler:"..." }
 *   GET  /api/key    -> {"vorhanden":true|false}   (NIE der Key-Wert selbst)
 *   POST /api/key    {key:"sk-ant-…"} -> speichert scripts/.anthropic_key (mode 600)
 *   POST /api/claude {prompt, maxTokens} -> {ok:true, text:"…"}
 *     Fehler: kein_key | key_ungueltig | kein_guthaben_oder_limit | netz
 *
 * Hygiene-Regeln (DSGVO-Baunorm, Vorbild Team-1 serve_cockpit.py):
 *   - Logs enthalten NUR Methode + Pfad (ohne Query), keine IPs, keine Inhalte.
 *   - Key-Wert, Prompt und Claude-Antwort werden NIE geloggt und NIE auf
 *     Platte geschrieben (außer der Key selbst in .anthropic_key, mode 600).
 *   - Idle-Watchdog: 60 min ohne Request -> Server beendet sich sauber
 *     (kein vergessener lokaler Server).
 */
'use strict';

const http = require('node:http');
const https = require('node:https');
const fs = require('node:fs');
const path = require('node:path');
const { URL } = require('node:url');

const PORTS = [8483, 8484, 8485];
const HOST = '127.0.0.1';
const ASSETS_DIR = path.resolve(__dirname, '..', 'assets');
const USER_AGENT = 'website-dsgvo-skill/1.0 (+local compliance check)';
const FETCH_TIMEOUT_MS = 15000;
const MAX_REDIRECTS = 5;
const BODY_CAP_MAIN = 2 * 1024 * 1024;   // 2 MB Hauptseite
const BODY_CAP_LEGAL = 500 * 1024;       // 500 KB Rechtsseiten
const VERSION = '1.1';

// --- /api/key + /api/claude ---
const KEY_FILE = path.resolve(__dirname, '.anthropic_key');
const POST_BODY_CAP = 2 * 1024 * 1024;       // 2 MB für POST-Bodies
const CLAUDE_TIMEOUT_MS = 60000;             // 60 s für api.anthropic.com
const CLAUDE_MODEL = 'claude-sonnet-5';
const CLAUDE_MAX_TOKENS_DEFAULT = 1500;

// --- Idle-Watchdog (Team-1-Hygiene): 60 min ohne Request -> sauber beenden ---
const IDLE_LIMIT_MS = 60 * 60 * 1000;
let lastRequestAt = Date.now();

const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8'
};

// ---------------------------------------------------------------- Logging
function log(line) {
  const ts = new Date().toISOString().replace('T', ' ').slice(0, 19);
  console.log(`[${ts}] ${line}`);
}

// Der Server darf NIE durch einen einzelnen Fehler sterben.
process.on('uncaughtException', (err) => log(`UNCAUGHT: ${err && err.message}`));
process.on('unhandledRejection', (err) => log(`UNHANDLED: ${err && (err.message || err)}`));

// ---------------------------------------------------------------- HTTP-Fetch
/**
 * Holt eine URL (http/https), folgt Redirects (max 5), Timeout gesamt 15 s,
 * Body-Cap in Bytes. Sammelt Set-Cookie-Namen über die ganze Redirect-Kette.
 * Ergebnis: { finalUrl, status, headers, body (String), cookieNames [] }
 */
function fetchUrl(rawUrl, maxBytes, deadline) {
  const cookieNames = [];
  const startDeadline = deadline || (Date.now() + FETCH_TIMEOUT_MS);

  return new Promise((resolve, reject) => {
    let redirects = 0;

    function collectCookies(res) {
      const sc = res.headers['set-cookie'];
      if (Array.isArray(sc)) {
        for (const c of sc) {
          const name = String(c).split(';')[0].split('=')[0].trim();
          if (name && !cookieNames.includes(name)) cookieNames.push(name);
        }
      }
    }

    function once(urlStr) {
      let u;
      try { u = new URL(urlStr); } catch (e) {
        return reject(new Error(`Ungültige URL: ${urlStr}`));
      }
      if (u.protocol !== 'http:' && u.protocol !== 'https:') {
        return reject(new Error(`Nur http/https erlaubt (bekommen: ${u.protocol})`));
      }
      const remaining = startDeadline - Date.now();
      if (remaining <= 0) return reject(new Error('Timeout (15 s) überschritten'));

      const mod = u.protocol === 'https:' ? https : http;
      const req = mod.get(u, {
        headers: {
          'User-Agent': USER_AGENT,
          'Accept': 'text/html,application/xhtml+xml,*/*;q=0.8',
          'Accept-Language': 'de-DE,de;q=0.9,en;q=0.7'
        },
        timeout: remaining
      }, (res) => {
        collectCookies(res);
        const status = res.statusCode || 0;

        // Redirect?
        if (status >= 300 && status < 400 && res.headers.location) {
          res.resume(); // Body wegwerfen
          redirects += 1;
          if (redirects > MAX_REDIRECTS) {
            return reject(new Error(`Zu viele Redirects (> ${MAX_REDIRECTS})`));
          }
          let next;
          try { next = new URL(res.headers.location, u).toString(); } catch (e) {
            return reject(new Error(`Kaputter Redirect: ${res.headers.location}`));
          }
          return once(next);
        }

        const chunks = [];
        let size = 0;
        let capped = false;
        res.on('data', (chunk) => {
          if (capped) return;
          size += chunk.length;
          if (size > maxBytes) {
            capped = true;
            chunks.push(chunk.subarray(0, chunk.length - (size - maxBytes)));
            res.destroy(); // Cap erreicht — Rest verwerfen
          } else {
            chunks.push(chunk);
          }
        });
        const finish = () => resolve({
          finalUrl: u.toString(),
          status,
          headers: res.headers,
          body: Buffer.concat(chunks).toString('utf8'),
          cookieNames,
          bodyCapped: capped
        });
        res.on('end', finish);
        res.on('close', finish); // nach destroy() beim Cap
        res.on('error', finish); // Teilkörper reicht
      });

      req.on('timeout', () => { req.destroy(new Error('Timeout (15 s) überschritten')); });
      req.on('error', (err) => reject(err));
    }

    once(rawUrl);
  });
}

/** Nur der Status zählt (Rechtsseiten-Proben): kleiner Cap, Fehler -> null. */
async function probeStatus(urlStr, deadline) {
  try {
    const r = await fetchUrl(urlStr, 4096, deadline);
    return r.status;
  } catch (e) {
    return null;
  }
}

// ---------------------------------------------------------------- HTML-Hilfen
function stripHtml(html) {
  if (!html) return '';
  return String(html)
    .replace(/<script[\s\S]*?<\/script\s*>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style\s*>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;|&apos;/gi, "'")
    .replace(/&auml;/gi, 'ä').replace(/&ouml;/gi, 'ö').replace(/&uuml;/gi, 'ü')
    .replace(/&szlig;/gi, 'ß')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Findet den ersten href, dessen URL eines der Muster enthält. */
function findLegalLink(html, baseUrl, patterns) {
  const re = /href\s*=\s*["']([^"'#]+)["']/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const href = m[1].trim();
    if (/^(mailto:|tel:|javascript:|data:)/i.test(href)) continue;
    if (!patterns.some((p) => href.toLowerCase().includes(p))) continue;
    try {
      const abs = new URL(href, baseUrl);
      if (abs.protocol === 'http:' || abs.protocol === 'https:') return abs.toString();
    } catch (e) { /* kaputter href — weiter */ }
  }
  return null;
}

// ---------------------------------------------------------------- /api/pruefe
async function apiPruefe(targetUrl) {
  let urlStr = String(targetUrl || '').trim();
  if (!urlStr) return { ok: false, fehler: 'Parameter url fehlt' };
  if (!/^https?:\/\//i.test(urlStr)) {
    if (/^[a-z0-9.-]+\.[a-z]{2,}([\/?#].*)?$/i.test(urlStr)) {
      urlStr = 'https://' + urlStr; // nackte Domain freundlich behandeln
    } else {
      return { ok: false, fehler: `Nur http/https-Ziele erlaubt: ${urlStr}` };
    }
  }

  // 1) Hauptseite
  let main;
  try {
    main = await fetchUrl(urlStr, BODY_CAP_MAIN);
  } catch (e) {
    return { ok: false, fehler: `Hauptseite nicht ladbar: ${e.message}` };
  }

  const finalU = new URL(main.finalUrl);
  const origin = `${finalU.protocol}//${finalU.host}`;
  const h = main.headers || {};
  const setCookie = Array.isArray(h['set-cookie']) ? h['set-cookie'] : [];

  const headersOut = {
    'set-cookie': { anzahl: setCookie.length, namen: main.cookieNames },
    'strict-transport-security': h['strict-transport-security'] || null,
    'content-security-policy': h['content-security-policy'] || null,
    'x-frame-options': h['x-frame-options'] || null,
    'referrer-policy': h['referrer-policy'] || null,
    'x-content-type-options': h['x-content-type-options'] || null,
    'server': h['server'] || null,
    'content-type': h['content-type'] || null
  };

  // 2) Rechtsseiten-Proben (gleiche Origin), parallel, eigene Deadlines
  const probePaths = ['/impressum', '/impressum.html', '/datenschutz',
    '/datenschutz.html', '/privacy', '/robots.txt'];
  const proben = {};
  const probeResults = await Promise.all(
    probePaths.map((p) => probeStatus(origin + p, Date.now() + 8000))
  );
  probePaths.forEach((p, i) => { proben[p] = probeResults[i]; });

  // 3) Links im HTML suchen und die Seiten SELBST laden (der Auditor liest sie)
  const impUrl = findLegalLink(main.body, main.finalUrl, ['impressum', 'imprint', 'legal-notice']);
  const dseUrl = findLegalLink(main.body, main.finalUrl, ['datenschutz', 'privacy']);

  let impText = null;
  let dseText = null;
  if (impUrl) {
    try {
      const r = await fetchUrl(impUrl, BODY_CAP_LEGAL);
      if (r.status >= 200 && r.status < 300) impText = stripHtml(r.body);
    } catch (e) { log(`  impressum-Laden fehlgeschlagen: ${e.message}`); }
  }
  if (dseUrl) {
    try {
      const r = await fetchUrl(dseUrl, BODY_CAP_LEGAL);
      if (r.status >= 200 && r.status < 300) dseText = stripHtml(r.body);
    } catch (e) { log(`  datenschutz-Laden fehlgeschlagen: ${e.message}`); }
  }

  return {
    ok: true,
    finalUrl: main.finalUrl,
    https: finalU.protocol === 'https:',
    status: main.status,
    headers: headersOut,
    cookiesGesetzt: main.cookieNames,
    html: main.body,
    proben,
    impUrl: impUrl || null,
    impText,
    dseUrl: dseUrl || null,
    dseText,
    fehler: null
  };
}

// ---------------------------------------------------------------- API-Key
/** Liest den POST-Body (max cap Bytes) als String. */
function readBody(req, maxBytes) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > maxBytes) {
        req.destroy();
        return reject(new Error('Body zu groß'));
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', (err) => reject(err));
  });
}

/** true, wenn ein nicht-leerer Key gespeichert ist. Der Wert bleibt intern. */
function keyVorhanden() {
  try {
    const k = fs.readFileSync(KEY_FILE, 'utf8').trim();
    return k.length > 0;
  } catch (e) {
    return false;
  }
}

/** Liest den Key oder null. Wert NIE loggen, NIE in Responses geben. */
function keyLesen() {
  try {
    const k = fs.readFileSync(KEY_FILE, 'utf8').trim();
    return k.length > 0 ? k : null;
  } catch (e) {
    return null;
  }
}

/** Speichert den Key mit mode 600. Der Wert taucht in keiner Ausgabe auf. */
function keySpeichern(key) {
  fs.writeFileSync(KEY_FILE, key, { encoding: 'utf8', mode: 0o600 });
  fs.chmodSync(KEY_FILE, 0o600); // writeFileSync-mode greift nur bei Neuanlage
}

// ---------------------------------------------------------------- /api/claude
/**
 * HTTPS-POST an api.anthropic.com/v1/messages. Prompt und Antwort bleiben
 * im Speicher — nichts davon wird geloggt oder auf Platte geschrieben.
 * Fehler-Codes: kein_key | key_ungueltig | kein_guthaben_oder_limit | netz
 */
function apiClaude(prompt, maxTokens) {
  return new Promise((resolve) => {
    const key = keyLesen();
    if (!key) return resolve({ ok: false, fehler: 'kein_key' });

    let mt = parseInt(maxTokens, 10);
    if (!Number.isFinite(mt) || mt < 1) mt = CLAUDE_MAX_TOKENS_DEFAULT;
    if (mt > 8192) mt = 8192;

    const payload = JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: mt,
      messages: [{ role: 'user', content: String(prompt) }]
    });

    const req = https.request({
      host: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
        'content-length': Buffer.byteLength(payload)
      },
      timeout: CLAUDE_TIMEOUT_MS
    }, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        const status = res.statusCode || 0;
        if (status === 401 || status === 403) {
          return resolve({ ok: false, fehler: 'key_ungueltig' });
        }
        if (status === 402 || status === 429) {
          return resolve({ ok: false, fehler: 'kein_guthaben_oder_limit' });
        }
        let body;
        try { body = JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch (e) {
          return resolve({ ok: false, fehler: 'netz' });
        }
        if (status >= 200 && status < 300 && body && Array.isArray(body.content)) {
          const textBlock = body.content.find((b) => b && b.type === 'text');
          return resolve({ ok: true, text: textBlock ? textBlock.text : '' });
        }
        // Sonstige API-Fehler: Typ melden, aber keine Inhalte durchreichen.
        const typ = body && body.error && body.error.type ? body.error.type : `http_${status}`;
        return resolve({ ok: false, fehler: typ });
      });
      res.on('error', () => resolve({ ok: false, fehler: 'netz' }));
    });

    req.on('timeout', () => { req.destroy(new Error('timeout')); });
    req.on('error', () => resolve({ ok: false, fehler: 'netz' }));
    req.end(payload);
  });
}

// ---------------------------------------------------------------- Statik
function serveStatic(reqPath, res) {
  let decoded;
  try { decoded = decodeURIComponent(reqPath); } catch (e) { decoded = reqPath; }
  if (decoded === '/') decoded = '/wizard.html';

  // Path-Traversal abfangen: NUR Dateien innerhalb des assets-Ordners.
  const resolved = path.resolve(ASSETS_DIR, '.' + path.posix.normalize('/' + decoded));
  if (resolved !== ASSETS_DIR && !resolved.startsWith(ASSETS_DIR + path.sep)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('403 Forbidden');
    return 403;
  }

  let stat;
  try { stat = fs.statSync(resolved); } catch (e) { stat = null; }
  if (!stat || !stat.isFile()) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 Not Found');
    return 404;
  }

  const ct = CONTENT_TYPES[path.extname(resolved).toLowerCase()]
    || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': ct, 'Content-Length': stat.size });
  fs.createReadStream(resolved).pipe(res);
  return 200;
}

function sendJson(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  });
  res.end(body);
}

// ---------------------------------------------------------------- Server
const server = http.createServer((req, res) => {
  const t0 = Date.now();
  lastRequestAt = Date.now(); // Idle-Watchdog: jeder Request resettet
  let logged = false;
  // Hygiene: NUR Methode + Pfad (ohne Query) loggen — keine IPs, keine Inhalte.
  let logPath = '?';
  const done = (status) => {
    if (logged) return;
    logged = true;
    log(`${req.method} ${logPath} -> ${status} (${Date.now() - t0} ms)`);
  };

  (async () => {
    let u;
    try { u = new URL(req.url, `http://${HOST}`); } catch (e) {
      sendJson(res, 400, { ok: false, fehler: 'Kaputte Anfrage-URL' });
      return done(400);
    }
    logPath = u.pathname;

    // POST-Routen (Key + Claude)
    if (req.method === 'POST' && u.pathname === '/api/key') {
      let data;
      try { data = JSON.parse(await readBody(req, POST_BODY_CAP)); } catch (e) {
        sendJson(res, 400, { ok: false, fehler: 'Kaputtes JSON' });
        return done(400);
      }
      const key = typeof data.key === 'string' ? data.key.trim() : '';
      if (!key) {
        sendJson(res, 400, { ok: false, fehler: 'key fehlt' });
        return done(400);
      }
      try {
        keySpeichern(key); // Wert wird NIRGENDS geloggt oder ausgegeben
        sendJson(res, 200, { ok: true, vorhanden: true });
        return done(200);
      } catch (e) {
        sendJson(res, 500, { ok: false, fehler: 'Key konnte nicht gespeichert werden' });
        return done(500);
      }
    }

    if (req.method === 'POST' && u.pathname === '/api/claude') {
      let data;
      try { data = JSON.parse(await readBody(req, POST_BODY_CAP)); } catch (e) {
        sendJson(res, 400, { ok: false, fehler: 'Kaputtes JSON' });
        return done(400);
      }
      if (typeof data.prompt !== 'string' || !data.prompt.trim()) {
        sendJson(res, 400, { ok: false, fehler: 'prompt fehlt' });
        return done(400);
      }
      const result = await apiClaude(data.prompt, data.maxTokens);
      sendJson(res, 200, result); // Prompt/Antwort: nie loggen, nie auf Platte
      return done(200);
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      sendJson(res, 405, { ok: false, fehler: 'Methode nicht erlaubt' });
      return done(405);
    }

    if (u.pathname === '/api/ping') {
      sendJson(res, 200, { ok: true, version: VERSION });
      return done(200);
    }

    if (u.pathname === '/api/key') {
      sendJson(res, 200, { vorhanden: keyVorhanden() });
      return done(200);
    }

    if (u.pathname === '/api/pruefe') {
      const target = u.searchParams.get('url');
      try {
        const result = await apiPruefe(target);
        sendJson(res, 200, result);
        return done(200); // Ziel-URL bewusst NICHT geloggt (keine Nutzerdaten)
      } catch (e) {
        sendJson(res, 200, { ok: false, fehler: `Interner Fehler: ${e.message}` });
        return done(200);
      }
    }

    const st = serveStatic(u.pathname, res);
    return done(st);
  })().catch((e) => {
    try {
      sendJson(res, 500, { ok: false, fehler: `Interner Fehler: ${e.message}` });
    } catch (_) { /* Response schon weg */ }
    done(500);
  });
});

server.on('clientError', (err, socket) => {
  try { socket.end('HTTP/1.1 400 Bad Request\r\n\r\n'); } catch (_) {}
});

// ---------------------------------------------------------------- Watchdog
// Team-1-Hygiene (Vorbild serve_cockpit.py): 60 min ohne Request -> Server
// beendet sich sauber. Kein vergessener lokaler Server.
const watchdog = setInterval(() => {
  if (Date.now() - lastRequestAt > IDLE_LIMIT_MS) {
    log(`[watchdog] ${IDLE_LIMIT_MS / 60000} min idle - Server beendet sich.`);
    clearInterval(watchdog);
    server.close(() => process.exit(0));
    // Falls offene Verbindungen das close blockieren: hart nachfassen.
    setTimeout(() => process.exit(0), 5000).unref();
  }
}, 30000);
watchdog.unref(); // Watchdog allein hält den Prozess nicht am Leben

function listenOn(index) {
  if (index >= PORTS.length) {
    log(`FEHLER: Alle Ports belegt (${PORTS.join(', ')}). Bitte einen freigeben.`);
    process.exit(1);
  }
  const port = PORTS[index];
  // SO_REUSEADDR setzt Node auf POSIX standardmäßig — nach einem Watchdog-
  // Selbst-Beenden ist der Port sofort wieder frei (kein TIME_WAIT-Hänger).
  server.once('error', (err) => {
    if (err && err.code === 'EADDRINUSE') {
      log(`Port ${port} belegt -> versuche ${PORTS[index + 1] || 'nichts mehr'}`);
      listenOn(index + 1);
    } else {
      log(`FEHLER beim Start: ${err.message}`);
      process.exit(1);
    }
  });
  server.listen(port, HOST);
}

// Einmal registriert, meldet den TATSÄCHLICH gebundenen Port (nicht den
// zuerst versuchten) — vermeidet Doppel-Logs bei Port-Fallback.
server.once('listening', () => {
  const port = server.address().port;
  log(`website-dsgvo Prüfserver läuft (Port ${port}, nur ${HOST})`);
  log(`Assets: ${ASSETS_DIR}`);
  log(`Idle-Watchdog aktiv: beendet sich nach ${IDLE_LIMIT_MS / 60000} min ohne Request`);
  console.log(`\n  Cockpit öffnen:  http://${HOST}:${port}/wizard.html\n`);
});

listenOn(0);
