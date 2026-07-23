---
name: website-dsgvo
description: "Macht eine Website DSGVO/TDDDG-konform (deutsches Recht, Stand 07/2026): Zwei-Stufen-Prüfung je Technologie (§ 25 TDDDG, dann Art. 6 DSGVO), Dienste-Scan-Skript, A–N-Prüfliste, vorgefertigte Gerüste für Datenschutzerklärung und Impressum, zwei Wege — ohne Tracking (kein Cookie-Banner nötig) oder mit Consent vor dem Laden — plus Technik-Pass (HTTPS/TLS 1.3, Fonts lokal, youtube-nocookie + Einwilligung, Shariff) und AV-Vertrags-Sammlung. Nutzen wenn der Nutzer sagt: 'Website DSGVO-konform machen', 'Datenschutzerklärung erstellen', 'brauche ich ein Cookie-Banner', 'Impressum/Datenschutz fehlt', 'Abmahnung Google Fonts', 'Muster AV-Vertrag herunterladen', 'Praxishilfen', 'make my site GDPR-compliant', 'EU-ready'. Bietet amtliche Praxishilfen der Aufsichtsbehörde aktiv zum Download an (verweist, spiegelt nicht). KEINE Rechtsberatung — Ergebnis vor Livegang juristisch prüfen lassen. NICHT für: unternehmensweite Datenschutz-Audits, Arbeitnehmerdatenschutz, Verträge jenseits der Website."
license: "Proprietary. LICENSE.txt has complete terms."
metadata:
  author: "Roberto Adrian"
  version: "2.3"
  qualitaet: "2.3: Cockpit mit ECHTER lokaler Ausführung (scripts/pruefserver.js :8483 + start-cockpit.command; /api/pruefe holt Live-URLs auf DIESEM Rechner, keine Cloud) + optionales KI-Audit mit eigenem Anthropic-Key (liegt NUR lokal in scripts/.anthropic_key, mode 600; ohne Key volle deterministische Prüfung) + references/rechtsstand-2026.md GEPRÜFT durch BDSG-Fachberater 2026-07-19; Kern 2.2 (Ein-Feld-PRÜFEN mit Autoerkennung, offline ZIP-Reader) unverändert — Fable5-Merge 2026-07-19"
  built_by: "fable-5"
  triage_verkaufswert_eur: 39
  abnahme: "IN ABNAHME 2026-07-19 (mit Roberto) — Cockpit + echte Ausführung + KI-Audit; wartet auf Robertos Re-Check."
  quellenstand: "2026-07-08 (Kern) / 2026-07-19 (rechtsstand-2026.md, GEPRÜFT)"
  compatibility: "Beliebiges OS; Bash für das Scan-Skript; Node ≥16 für Cockpit/Prüfserver (ohne Node: Chat-Weg); Zielgruppe: Websites für deutsches/EU-Publikum"
---

# Website DSGVO — von „irgendwie online" zu belegbar konform

Eine schöne Website ohne Rechts-Schicht ist nicht fertig. Dieser Skill führt
den kompletten Weg: erst sehen, was die Site wirklich lädt, dann je Fund die
Zwei-Stufen-Prüfung, dann die Pflichtseiten aus mitgelieferten Gerüsten —
und am Ende die A–N-Prüfliste als Beleg. **Keine Rechtsberatung**; das
Ergebnis ist die vorbereitete, dokumentierte Vorlage für den finalen
Anwalts-Check.

## Workflow

### Zwei Modi — ZUERST unterscheiden
Der Skill hat zwei Produkte in einem:
- **ERSTELLEN (Planning Pipeline):** neue Website → Schritte 0–7 unten. Am Ende
  fragt Claude „Soll ich es bauen?" — bei Ja baut er selbst, bei Nein gibt es nur
  den Auftrag (Schritt 0.5).
- **PRÜFEN (Inspection Agent):** bestehende Site/HTML/Repo/Build → KEINE
  Planungs-Pipeline, KEINE Fragen, KEIN sichtbarer Prompt. Der Nutzer gibt
  **eine** Quelle in **ein** Feld (der Typ wird automatisch erkannt: `http(s)://`
  oder Domain = Live-URL, `github.com` = Repo, Pfad = lokales Projekt, Upload =
  Datei), Claude **inspiziert alles selbst** und liefert einen **Prüfbericht
  als HTML-Datei**. Intern drei Rollen — für den Nutzer unsichtbar:
  - **Scout** liest die Quelle (Browser: Seiten, Netzwerk-Requests, Cookies,
    Header, Fonts, Analytics, Forms, Third-Party; `scripts/dienste_scan.sh` auf
    Ordner/HTML; Impressum + Datenschutzerklärung **selbst lesen**) →
    strukturiert den Befund als `website.json`.
  - **Auditor** bewertet `website.json` gegen die references (Normen,
    Severities) → `node scripts/report_gen.js website.json report.html`.
  - **Builder** (optional, nur auf Wunsch): setzt die technischen Fixes um.
  Der Nutzer sieht nur Statusmeldungen: `Inspecting… → Analysing… →
  Checking compliance… → Generating report… → Done` — dann die report.html.
  **Nichts fragen, was ableitbar ist:** betrieb (Impressum/USt-IdNr →
  gewerblich), betreiber_sitz (Anschrift), status (live, weil erreichbar),
  Dienste (Netzwerk), Fonts/Analytics (Requests). Nur technisch
  Unfeststellbares kommt unter „Missing Information" — NICHT als Frage.
  Format/Regeln/Severities: `references/pruefbericht.md`. Erkennungszeichen:
  `modus: review`, oder der Nutzer will „prüfen/checken/reviewen".
**Nicht verhandelbar:** Wer prüfen will, durchläuft NIE die 8 Stufen und wird
NIE mit Fragen belästigt, die aus der Inspektion beantwortbar sind. Jede Frage,
die die Inspektion beantworten könnte, ist ein UX-Fehler.

### Echte Ausführung im Cockpit (PRÜFEN mit laufendem Prüfserver)
Zwei gleichwertige Starts — der Nutzer wählt:
- **Doppelklick** auf `start-cockpit.command` im Skill-Root (macOS: findet
  Node selbst, startet den Server, öffnet den Browser), ODER
- **Terminal:** `node "${CLAUDE_SKILL_DIR}/scripts/pruefserver.js"`

Der Server loggt Port (8483, sonst 8484/8485) und Adresse — das Cockpit
läuft unter **`http://127.0.0.1:8483/wizard.html`**. Ab jetzt werden
Live-URLs **LOKAL AUSGEFÜHRT geprüft**: der Server holt die Seite auf
diesem Rechner (keine Cloud, keine Dritten) und liefert per
`GET /api/pruefe?url=…` HTTPS-Status, Header, Cookies, HTML,
Rechtsseiten-Proben sowie den Volltext von Impressum und
Datenschutzerklärung; `GET /api/ping` ist der Lebenszeichen-Check.

**Worked Example — Live-URL end-to-end:**
1. Doppelklick `start-cockpit.command` → Terminal zeigt
   `Cockpit: http://127.0.0.1:8483/wizard.html` und der Browser öffnet sich.
2. Im Cockpit auf PRÜFEN, in das EINE Feld `beispiel-shop.de` tippen →
   Autoerkennung: Live-URL → Prüfen-Klick.
3. Das Cockpit ruft `GET /api/pruefe?url=https%3A%2F%2Fbeispiel-shop.de`;
   der Server holt Startseite + Rechtsseiten lokal und gibt den Rohbefund
   zurück (Status, Header, Cookies, Drittdienst-Spuren, Impressums-/
   DSE-Volltext).
4. Das Cockpit bewertet deterministisch gegen die references-Regeln →
   `report.html` mit Severities und Belegen, Download + Vorschau.
5. Optional ein Klick „KI-Audit" (nur mit hinterlegtem Key, s. u.) für die
   Zweitmeinung auf dem schon erhobenen Befund.

**KI-Audit (optional):** Der Nutzer kann in der Einstellungen-View des
Cockpits einen **eigenen Anthropic-API-Key** hinterlegen. Der Key liegt
danach NUR lokal in `scripts/.anthropic_key` (mode 600) — `POST /api/key`
speichert ihn, `GET /api/key` meldet ausschließlich vorhanden ja/nein, nie
den Wert; `POST /api/claude` proxyt die Audit-Frage von 127.0.0.1 direkt zu
api.anthropic.com. **Kosten trägt der Nutzer** (sein Key, sein Kontingent).
**Ohne Key läuft die vollständige deterministische Prüfung** — das KI-Audit
ist eine Zweitmeinung obendrauf, keine Voraussetzung.

### Schritt 0 — Geführter Start: der Wizard (bei Neubau oder unklarem Projekt)
Bei einer NEUEN Website (oder wenn der Nutzer die Fragen lieber klickt statt
chattet) den mitgelieferten Wizard öffnen:

```bash
open "${CLAUDE_SKILL_DIR}/assets/wizard.html"      # macOS
# Linux: xdg-open, Windows: start
```

Der Wizard (mehrsprachig: DE·EN·中文·日本語, automatische Browser-Sprach-Erkennung) führt lokal (kein Netz, keine Tracker) durch die **8-Stufen-
Gesprächsreihenfolge** — erst WER/WAS, dann Datenflüsse, dann Technik, DANN
erst Design, weil jede bejahte Funktion einen Rechtsbaustein erzeugt:
1. Rolle & Zweck (realistisches Erst-Ziel statt Ambition)
2. Publikum & **Zielgruppe** · 3. Funktionen & **Menüstruktur** (jedes Häkchen = ein Datenfluss)
4. Statistik-Entscheidung (keine = kein Banner) · 5. Hosting/Technik (AV! CMS-Blindfleck)
6. **Inhalte-Status (Content first: erst Texte/Bilder, dann Design)** & Stil
7. Impressums-Daten · 8. **Auftragszettel** (inkl. Nach-Go-Live: Weiterleitungen, mobile Ansicht, Pflege-Rhythmus)

### Schritt 0.5 — Die Bau-Frage (verbindlich): erst der Auftrag, dann bauen
Am Ende der 8 Stufen erzeugt der Wizard den Auftragszettel und zeigt „Fertig".
Dieser Zettel ist die **interne Übergabe an Claude**, kein Rezept, das der
Nutzer selbst abarbeiten soll. Sobald der Auftrag in der Sitzung liegt (Nutzer
fügt ihn ein, oder der Skill hat ihn selbst erzeugt), gilt **zwingend**:

1. Den Auftrag NICHT nur zurückgeben und die Schritte 1–7 NICHT als To-do an
   den Nutzer delegieren.
2. **Genau eine Frage stellen:** „Soll ich die Website jetzt nach diesem
   Auftrag bauen? (Ja / Nein)".
3. **Bei JA → SELBST BAUEN:** Claude setzt die Schritte 1–7 unten selbst um —
   legt die Seitenstruktur an, baut die Pflichtseiten aus den Gerüsten (mit den
   Auftragsdaten gefüllt), macht den Technik-Pass, geht die A–N-Prüfliste durch
   und liefert die **fertigen Dateien**. Nicht erklären, wie man es macht — es
   machen. Der Nutzer sieht das Ergebnis, nicht den Prompt.
4. **Bei NEIN → nur der Prompt:** den Auftragszettel formatiert und kopierbar
   aushändigen und stoppen — der Nutzer will ihn selbst weiterverwenden.

Der Wizard selbst hat schon einen **„▶ Website jetzt bauen"-Button**: er erzeugt
offline eine Starter-Website (Rechtsseiten gefüllt, 2-Klick-Einbettungen,
Fonts lokal) als Download-ZIP — die schnelle Ja-Variante ohne Claude. Claudes
Bau (Schritt 3 oben) ist die vollständige, verfeinerte Ausführung mit Inhalten,
Stil-Bau und A–N-Beleg. Beide ehren „Ja → bauen".

Bei BESTEHENDEN Sites gilt der PRÜFEN-Modus (nicht diese 8 Stufen); dort
inspiziert Claude zuerst und liefert den Bericht (`references/pruefbericht.md`).

### Schritt 1 — Bestandsaufnahme: Was lädt die Site wirklich?
Erst Überblick, dann Urteil. Das mitgelieferte Skript durchsucht den
Site-Ordner nach bekannten Drittdienst-Domains (Fonts, Analytics, YouTube,
Social, Maps, CDNs):

```bash
bash "${CLAUDE_SKILL_DIR}/scripts/dienste_scan.sh" "<site-ordner>"
```

Exit 0 = keine Drittdienste gefunden · Exit 1 = Funde (aufgelistet mit Datei).
Der Scan ist Heuristik, kein Beweis — die Fundliste anschließend mit dem
Nutzer durchgehen (auch server-seitige Dienste erfragen: Hoster, Newsletter,
Formular-Backend).

**Zwei Triage-Fragen, die der Skill IMMER zuerst stellt:**
1. „Bietet die Website Waren/Dienstleistungen an (Shop/Gewerbe) — oder ist
   sie rein privat/informativ?" → entscheidet über AGB/Widerruf/Preisangaben
   zusätzlich zu Impressum + Datenschutzerklärung.
2. „Läuft ein CMS wie WordPress?" → CMS/Plugins laden oft im Hintergrund
   Google Fonts, Emojis (s.w.org) oder Tracker, die im statischen Scan
   **nicht sichtbar** sind — dann die gerenderte Live-Seite prüfen
   (Browser-Netzwerkanalyse), nicht nur den Quellordner.

### Schritt 2 — Zwei-Stufen-Prüfung je Technologie
Für JEDEN Fund aus Schritt 1:
1. **Stufe 1 (§ 25 TDDDG):** Wird auf dem Endgerät gespeichert/ausgelesen
   (Cookies, Local Storage, Pixel, Fingerprinting)? → Einwilligung nötig,
   AUSSER technisch zwingend für den gewünschten Dienst (Warenkorb, Login,
   Session-Sicherheit).
2. **Stufe 2 (DSGVO):** Werden personenbezogene Daten verarbeitet (schon die
   IP-Übertragung an Dritte zählt)? → Rechtsgrundlage nach Art. 6 nennen
   (lit. f berechtigtes Interesse z. B. für Server-Logs; lit. a Einwilligung).
Details und die Dienst-für-Dienst-Bewertung: `references/consent-und-drittdienste.md`.
Aktuelle Rechtslage (Abmahnbarkeit durch Mitbewerber, Banner-1.-Ebene,
Merchant-of-Record/Payment, DPF/SCC, Bestandskunden-Mails) und geprüfte
Muster-Textbausteine: `references/rechtsstand-2026.md`.

### Schritt 3 — Weg wählen (vorgerechnete Optionen)
`assets/options.json` enthält zwei fertige Wege:
- **no-tracker** (empfohlener Startpunkt): keine Analyse-Tools, keine
  Dritt-Embeds → **kein Cookie-Banner nötig**, schlanke Datenschutzerklärung.
- **mit-tracking**: Consent-Banner VOR dem Laden jedes Dienstes, jede
  Drittdienst-Passage in der Erklärung, Drittland je Dienst prüfen.
Der Nutzer wählt; die Swap-Points der Option steuern die nächsten Schritte.

### Schritt 4 — Pflichtseiten aus den Gerüsten
`assets/datenschutzerklaerung-geruest.md` und `assets/impressum-geruest.md`
füllen (Platzhalter = Swap-Points aus options.json), als echte Seiten
einbauen, im Footer verlinken. Pflichtinhalte und Rechtsgrundlagen:
`references/pflichten-und-rechtsgrundlagen.md`.

### Schritt 5 — Technik-Pass
HTTPS mit aktuellem TLS (empfohlen 1.3) + gültigem Zertifikat ·
Kontaktformular: nur nötige Felder, Optionales als freiwillig markiert ·
**Fonts lokal hosten** (dynamisches Nachladen war Gegenstand eines
Schadensersatz-Urteils, LG München I, 20.01.2022, 3 O 17493/20) ·
Videos: youtube-nocookie **plus** Einwilligung (der Datenschutzmodus ersetzt
sie nicht) · Social: Shariff/2-Klick oder nur verlinken · Server-Logs in der
Erklärung erläutern. Details: `references/technik-und-av.md`.

### Schritt 6 — AV-Verträge einsammeln
Hoster IMMER (bloße Zugriffs*möglichkeit* reicht); ebenso Newsletter-, Cloud-,
Wartungs-, SaaS-Dienstleister. Standard-AV des Anbieters auf Passung prüfen.
**Hier aktiv fragen:** „Soll ich das amtliche AV-Vertragsmuster (DE/EN, PDF)
von der Aufsichtsbehörde herunterladen?" — Adresse und Ablauf in
`references/praxishilfen.md`.

### Querschnitt — Amtliche Praxishilfen aktiv anbieten
Der Skill kennt die Praxishilfen-Seite der Aufsichtsbehörde Baden-Württemberg
(AV-Muster, Cookies-FAQ, Betroffenenrechte-Muster, VVT-Vorlagen) und **fragt
an den passenden Workflow-Stellen von sich aus**, ob der Nutzer sie
herunterladen möchte. Geladen wird NUR auf „Ja", NUR das Gewählte, mit
Abruf-Datum — die Inhalte werden bewusst nicht im Skill abgebildet, weil die
amtliche Quelle führend bleibt. Tabelle der Fragepunkte:
`references/praxishilfen.md`.

### Schritt 7 — A–N-Prüfliste als Abschluss-Beleg
`assets/checkliste-a-n.md` Punkt für Punkt durchgehen, je Punkt OK/OFFEN
markieren und das Ergebnis dem Nutzer als Abschlussdokument geben — mit dem
Satz: „Vorlage für den Anwalts-Check, keine Rechtsberatung."

## Troubleshooting

Reihenfolge einhalten — billige Ursachen zuerst:

**Cockpit / Prüfserver:**
1. **Cockpit lädt nicht / Port belegt** — `lsof -nP -iTCP:8483` zeigt den
   Belegten; der Server weicht selbst auf 8484/8485 aus — die tatsächliche
   Adresse steht IMMER im Terminal-Log, nicht raten.
2. **„Server weg" mitten in der Sitzung** — erst `GET /api/ping` (oder die
   Seite neu laden). Häufigste Ursache: das Terminal-Fenster von
   `start-cockpit.command` wurde geschlossen — das beendet den Server.
   Erneut doppelklicken, fertig.
3. **`node` fehlt** — ehrlich: der Prüfserver braucht **Node ≥16**, es gibt
   KEINEN python3-Ersatz. `start-cockpit.command` erklärt das und öffnet
   nodejs.org (LTS reicht). Ohne Node bleibt der Chat-Weg: Claude mit
   diesem Skill inspiziert die Quelle selbst.
4. **KI-Audit reagiert nicht** — `GET /api/key` → `vorhanden:false`? Dann
   fehlt der Key (Einstellungen-View). Sonst: eigener Key gültig/Guthaben?
   Der Fehlertext der API wird durchgereicht.

**Recht / Inhalt:**
1. **„Brauche ich ein Cookie-Banner?"** — Nur wenn Stufe 1 zutrifft und keine
   Ausnahme greift. Der no-tracker-Weg braucht KEINS; ein Banner „zur
   Sicherheit" ohne einwilligungspflichtige Dienste ist unnötig.
2. **Fonts-Abmahnrisiko** — `dienste_scan.sh` findet fonts.googleapis/gstatic
   → lokal hosten, Verweis aus CSS entfernen, fertig.
3. **Video lädt vor Einwilligung** — nocookie-Domain allein genügt nicht;
   Vorschaubild + Klick-Freigabe (2-Klick) einbauen.
4. **Analytics-Rollenfrage** — Behördenauffassung uneinheitlich; Vertragsdoku
   des Anbieters abschließen UND Drittlandübermittlung in der Erklärung nennen.
5. **Newsletter/Double-Opt-in, systematische Drittland-Prüfung** — von der
   zugrundeliegenden Fachquelle NICHT abgedeckt; ehrlich als offen markieren
   und gesondert prüfen (siehe references, Abschnitt „Lücken").

Bei echten Rechtsfragen (Streitfall, Abmahnung erhalten, Sonderbranchen wie
Gesundheit/Kinder): stoppen, den einen nötigen Schritt benennen — Anwalt —
und warten. Nicht weiterraten.

## Bundled files

- `assets/wizard.html` — ERSTELLEN: der geführte 8-Stufen-Start (lokal, ohne Netz); erzeugt den Auftragszettel UND baut auf Klick „▶ Website jetzt bauen" eine offline-Starter-Website (index + Impressum + Datenschutz [+ AGB/Widerruf bei Shop] + README) als Download-ZIP — kein Prompt-Ende. „Nur Auftrag kopieren" = der Nein-Weg. PRÜFEN: EIN Eingabefeld mit Autoerkennung (URL/Repo/Pfad) + Datei-Upload/Drop (HTML oder ZIP — eigener Offline-ZIP-Reader); Upload wird sofort clientseitig geprüft → report.html mit Download + Vorschau; Live-URL/Repo/Pfad → unsichtbar vorbereiteter Prüfauftrag, ein einziger „An Claude übergeben"-Knopf (kein sichtbarer Prompt-Text).
- `scripts/dienste_scan.sh` — Drittdienst-Scan über den Site-Ordner (Heuristik)
- `scripts/pruefserver.js` — Zero-Dependency-Prüfserver (Node ≥16, nur 127.0.0.1, Port 8483/8484/8485): serviert das Cockpit same-origin und führt die Live-URL-Inspektion SERVERSEITIG aus (`/api/ping`, `/api/pruefe?url=…` → Status, Header, Cookies, HTML, Rechtsseiten-Proben, Impressum-/Datenschutz-Volltext); KI-Audit-Endpunkte: `/api/key` (Key nur lokal in `scripts/.anthropic_key`, mode 600, Wert wird nie ausgegeben) + `/api/claude` (Proxy zum eigenen Anthropic-Konto)
- `start-cockpit.command` — macOS-Doppelklick-Starter: findet Node, startet den Prüfserver, öffnet `http://127.0.0.1:PORT/wizard.html`; ohne Node: Hinweis + nodejs.org
- `scripts/report_gen.js` — macht aus dem Inspektions-Befund (`website.json`) den fertigen **Prüfbericht als HTML** (`node report_gen.js website.json report.html`); Modus PRÜFEN, keine Fragen
- `assets/options.json` — die zwei vorgerechneten Wege mit Swap-Points
- `assets/datenschutzerklaerung-geruest.md` · `assets/impressum-geruest.md`
- `assets/checkliste-a-n.md` — die 14-Blöcke-Prüfliste als Abschluss-Beleg
- `references/pflichten-und-rechtsgrundlagen.md` · `references/consent-und-drittdienste.md` · `references/technik-und-av.md`
- `references/praxishilfen.md` — amtliche Muster/FAQ der Aufsichtsbehörde: wann aktiv anbieten, wie on-demand laden (nie spiegeln)
- `references/rechtsstand-2026.md` — Rechtslage 07/2026, **GEPRÜFT durch den BDSG-Fachberater (19.07.2026)**: DDG/TDDDG-Zitatumstellung, Abmahnlage (BGH-Serie 2024/25, VG Hannover, KMU-Schutz § 13 Abs. 4 UWG), Merchant of Record (beide Rollen-Szenarien + 4 Prüfpunkte), DPF-Volatilität + SCC-Rückfall, Bestandskunden-Mails (EuGH C-654/23), Prüf-Tools-Tabelle, MUSTER-Textbausteine; ⚠️-Punkte = Primärquelle checken
- `references/pruefbericht.md` — Modus PRÜFEN: Inspektions-Regeln je Quelle, das 7-Abschnitte-Berichtsformat, Schweregrade
