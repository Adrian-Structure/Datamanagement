#!/usr/bin/env node
// report_gen.js — macht aus einem Inspektions-Befund (JSON) einen fertigen
// DSGVO/TDDDG-Prüfbericht als eigenständige, druckbare HTML-Datei.
// Aufruf:  node report_gen.js befund.json > report.html
//          node report_gen.js befund.json report.html
// Der Befund (website.json) wird von Claudes Inspektion (Scout/Auditor) erzeugt —
// der Nutzer sieht davon nichts, nur die report.html. KEINE Rückfragen.
'use strict';
const fs = require('fs');

const SEV = {
  critical:      {rang:0, label:'Critical',      farbe:'#b00020', bg:'#fdecef'},
  high:          {rang:1, label:'High',          farbe:'#c2410c', bg:'#fdeee3'},
  medium:        {rang:2, label:'Medium',        farbe:'#a16207', bg:'#fbf3e0'},
  low:           {rang:3, label:'Low',           farbe:'#1f7a3d', bg:'#e9f6ee'},
  informational: {rang:4, label:'Informational', farbe:'#334155', bg:'#eef2f7'}
};
function sev(s){ return SEV[(s||'').toLowerCase()] || SEV.informational; }
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}

function css(){return `
:root{--tinte:#0f2036;--navy:#123a6b;--mut:#5a6b7d;--linie:#dfe5ec;--panel:#f7f9fc}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;color:var(--tinte);background:#fff;line-height:1.6;font-size:15px}
.wrap{max-width:880px;margin:0 auto;padding:40px 32px}
header{border-bottom:3px solid var(--navy);padding-bottom:18px;margin-bottom:6px}
.kicker{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--navy);font-weight:700}
h1{font-size:27px;margin:6px 0 8px;color:var(--navy);letter-spacing:-.3px}
.meta{font-size:13px;color:var(--mut)}
.meta b{color:var(--tinte)}
.disc{display:inline-block;background:#fff7e6;border:1px solid #f0d17a;color:#7a5b00;border-radius:6px;padding:5px 10px;font-size:12px;margin-top:10px}
h2{font-size:17px;color:var(--navy);margin:30px 0 10px;padding-bottom:6px;border-bottom:1px solid var(--linie)}
h2 .n{color:var(--mut);font-weight:600;margin-right:8px}
p{margin:8px 0}
ul{margin:8px 0 8px 22px}
li{margin:5px 0}
.comp{width:100%;border-collapse:collapse;font-size:14px;margin-top:8px}
.comp th,.comp td{text-align:left;padding:8px 10px;border-bottom:1px solid var(--linie);vertical-align:top}
.comp th{background:var(--panel);color:var(--navy);font-size:12px;text-transform:uppercase;letter-spacing:.05em}
.card{border:1px solid var(--linie);border-left-width:5px;border-radius:8px;padding:16px 18px;margin:12px 0;background:#fff}
.badge{display:inline-block;font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;padding:3px 9px;border-radius:999px;margin-bottom:8px}
.card h3{font-size:16px;margin:2px 0 6px}
.row{font-size:13.5px;margin:4px 0}
.row .k{color:var(--mut);display:inline-block;min-width:96px;font-weight:600}
.evid{font-family:ui-monospace,Menlo,monospace;font-size:12.5px;background:var(--panel);border:1px solid var(--linie);border-radius:6px;padding:8px 10px;margin:6px 0;white-space:pre-wrap;word-break:break-word}
.fixes li{margin:7px 0}
.prio{display:inline-block;font-size:11px;font-weight:700;color:#fff;background:var(--navy);border-radius:4px;padding:1px 7px;margin-right:8px}
.brief{font-family:ui-monospace,Menlo,monospace;font-size:12.5px;background:#0f2036;color:#e7eef7;border-radius:8px;padding:16px;white-space:pre-wrap;word-break:break-word}
footer{margin-top:34px;padding-top:14px;border-top:1px solid var(--linie);font-size:12px;color:var(--mut)}
.tally{display:flex;gap:8px;flex-wrap:wrap;margin:14px 0 2px}
.tally span{font-size:12px;font-weight:700;border-radius:6px;padding:4px 10px}
@media print{.wrap{max-width:none;padding:0}body{font-size:12px}.card{break-inside:avoid}h2{break-after:avoid}}
`;}

function tally(findings){
  const c={}; findings.forEach(f=>{const k=sev(f.severity).label; c[k]=(c[k]||0)+1;});
  return ['Critical','High','Medium','Low','Informational'].filter(l=>c[l]).map(l=>{
    const s=Object.values(SEV).find(x=>x.label===l);
    return `<span style="background:${s.bg};color:${s.farbe};border:1px solid ${s.farbe}33">${c[l]} ${l}</span>`;
  }).join('');
}

function render(d){
  const findings=(d.findings||[]).slice().sort((a,b)=>sev(a.severity).rang-sev(b.severity).rang);
  const comps=d.components||[];
  const sec=(n,t,inner)=>`<h2><span class="n">${n}.</span>${esc(t)}</h2>${inner}`;
  let html=`<!doctype html><html lang="de"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>DSGVO-Prüfbericht — ${esc(d.target||'')}</title><style>${css()}</style></head><body><div class="wrap">
<header>
  <div class="kicker">DSGVO · TDDDG — Technisch-organisatorischer Prüfbericht</div>
  <h1>${esc(d.title||'Website-Compliance-Prüfung')}</h1>
  <div class="meta">Geprüft: <b>${esc(d.target||'—')}</b> &nbsp;·&nbsp; Datum: <b>${esc(d.inspectedAt||'')}</b> &nbsp;·&nbsp; Quelle: <b>${esc(d.sourceType||'Live-URL')}</b></div>
  <div class="disc">Keine Rechtsberatung — technisch-organisatorische Prüfung; abschließende Prüfung durch qualifizierte Anwältin/Anwalt.</div>
</header>`;

  // 1 Executive Summary
  html += sec(1,'Executive Summary',
    `<div class="tally">${tally(findings)}</div><p>${esc(d.summary||'—')}</p>`);

  // 2 Detected Components
  html += sec(2,'Detected Components', comps.length
    ? `<table class="comp"><tr><th>Komponente</th><th>Detail</th><th>Fundort</th></tr>`+
      comps.map(c=>`<tr><td>${esc(c.type)}</td><td>${esc(c.detail||'')}</td><td>${esc(c.location||'')}</td></tr>`).join('')+`</table>`
    : `<p class="meta">Keine berichtenswerten Komponenten erkannt.</p>`);

  // 3 Findings
  html += sec(3,'Findings', findings.length ? findings.map(f=>{
    const s=sev(f.severity);
    return `<div class="card" style="border-left-color:${s.farbe}">
      <span class="badge" style="background:${s.bg};color:${s.farbe}">${s.label}</span>
      <h3>${esc(f.title||'')}</h3>
      ${f.location?`<div class="row"><span class="k">Fundort</span>${esc(f.location)}</div>`:''}
      ${f.evidence?`<div class="evid">${esc(f.evidence)}</div>`:''}
      ${f.explanation?`<div class="row"><span class="k">Warum</span>${esc(f.explanation)}${f.norm?` <em>(${esc(f.norm)})</em>`:''}</div>`:''}
      ${f.action?`<div class="row"><span class="k">Maßnahme</span>${esc(f.action)}</div>`:''}
    </div>`;
  }).join('') : `<p class="meta">Keine Verstöße festgestellt.</p>`);

  // 4 Missing Information
  html += sec(4,'Missing Information (technisch nicht feststellbar)',
    (d.missing&&d.missing.length)?`<ul>${d.missing.map(m=>`<li>${esc(m)}</li>`).join('')}</ul>`
      :`<p class="meta">Nichts offen — alles Relevante war technisch feststellbar.</p>`);

  // 5 Recommended Fixes
  html += sec(5,'Recommended Fixes (nach Priorität)',
    (d.fixes&&d.fixes.length)?`<ul class="fixes" style="list-style:none;margin-left:0">${
      d.fixes.map((x,i)=>`<li><span class="prio">${x.prio||('P'+(i+1))}</span>${esc(x.text||x)}</li>`).join('')}</ul>`
      :`<p class="meta">—</p>`);

  // 6 Implementation Brief
  if(d.implementationBrief){
    html += sec(6,'Claude Implementation Brief (kopierfertig, nur technisch)',
      `<div class="brief">${esc(d.implementationBrief)}</div>`);
  }

  // 7 Legal Review Required
  html += sec(d.implementationBrief?7:6,'Legal Review Required',
    (d.legalReview&&d.legalReview.length)?`<ul>${d.legalReview.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`
      :`<p class="meta">Vor Livegang das Gesamtergebnis anwaltlich prüfen lassen.</p>`);

  html += `<footer>Erzeugt vom Skill „Website DSGVO" (Modus PRÜFEN). Befund-basiert: jeder Fund mit Beleg.
    Technisch-organisatorische Prüfung, <b>keine Rechtsberatung</b>.</footer></div></body></html>`;
  return html;
}

if(require.main===module){
  const inp=process.argv[2], outp=process.argv[3];
  if(!inp){ console.error('Aufruf: node report_gen.js befund.json [report.html]'); process.exit(1); }
  const d=JSON.parse(fs.readFileSync(inp,'utf8'));
  const html=render(d);
  if(outp){ fs.writeFileSync(outp,html); console.error('geschrieben:',outp); }
  else process.stdout.write(html);
}
module.exports={render};
