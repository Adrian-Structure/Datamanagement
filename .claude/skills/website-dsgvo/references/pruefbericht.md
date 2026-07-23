# Prüfbericht-Format (Modus PRÜFEN / Review)

Erhält der Skill einen **PRÜFAUFTRAG** (Kennung `modus: review` aus dem
Wizard, oder der Nutzer bittet um Prüfung einer bestehenden Site), gilt:

## Die nicht verhandelbare Regel
**Wer prüfen will, wird NIE durch die 8-Stufen-Neuplanung gezwungen — und NIE
befragt.** Keine Design-Fragen, keine Planungs-Pipeline, keine Rückfragen.
Der Nutzer gibt nur die Quelle; Claude inspiziert ALLES selbst und liefert das
Ergebnis. Jede Frage, die aus der Inspektion beantwortbar ist, ist ein Fehler.

## Ein-/Ausgabe
- **Eingabe:** EINE Quelle in EINEM Feld — der Typ wird NICHT erfragt, sondern
  erkannt: `http(s)://` oder Domain = Live-URL · `github.com` = Repository ·
  Pfad = lokales Projekt/Build · Upload/Drop = Datei (HTML oder ZIP).
  Der Wizard übergibt Live-Quellen als kompakten Maschinen-Auftrag
  (`modus: review` + `typ` + `quelle`) über einen einzigen Kopierknopf —
  der Auftrag ist interne Kommunikation und wird dem Nutzer NIE als
  Prompt-Text gezeigt.
- **Ausgabe:** eine **HTML-Datei** — `node scripts/report_gen.js website.json
  report.html`. Claude schreibt den Befund als `website.json`, erzeugt daraus
  die `report.html` und gibt sie dem Nutzer. Kein Prompt/Zettel, kein Chat-Wust.

## Interne Rollen & Statusmeldungen (für den Nutzer unsichtbar)
Drei Rollen, EIN Erlebnis:
1. **Scout** — liest die Quelle (Browser/Scan) und strukturiert den Befund
   als `website.json`. Meldung: `Inspecting…`
2. **Auditor** — bewertet `website.json` gegen die references (Normen,
   Severities) und erzeugt den Bericht. Meldungen: `Analysing…` →
   `Checking compliance…` → `Generating report…`
3. **Builder** — optional, NUR wenn der Nutzer Fixes will: setzt die
   technischen Empfehlungen um.
Der Nutzer sieht ausschließlich die Statusmeldungen und am Ende `Done` +
report.html — nie Rollen-Interna, nie den Auftragstext.

## Selbst ableiten statt fragen (aus der Inspektion)
- **betrieb** (gewerblich/privat) ← Impressum, USt-IdNr., Shop-/Preis-Elemente.
- **betreiber_sitz** ← Anschrift im Impressum · **status** = live (erreichbar).
- **Dienste/Fonts/Analytics/Cookies/Forms** ← Netzwerk-Requests + `dienste_scan.sh`.
- **DSE-Inhalte** (Beschwerderecht, Matomo/Brevo genannt, Rechtsgrundlage) ←
  Datenschutz-Seite **selbst lesen**.
Nur was danach WIRKLICH nicht feststellbar ist (z. B. ob IP-Anonymisierung
serverseitig aktiv ist, ob AV-Verträge existieren) → Abschnitt „Missing
Information", NICHT als Frage.

## website.json — die Felder, die report_gen.js erwartet
`title` · `target` · `inspectedAt` · `sourceType` · `summary` ·
`components[]{type,detail,location}` ·
`findings[]{severity,title,location,evidence,explanation,norm,action}`
(severity = critical|high|medium|low|informational) ·
`missing[]` · `fixes[]{prio,text}` · `implementationBrief` · `legalReview[]`.

## Inspektion je Quelle
- **Live-URL / Staging-URL:** Seite(n) im Browser laden; Netzwerk-Requests,
  Cookies, Konsole prüfen; Impressum/Datenschutz-Links suchen (2-Klick-Regel);
  TLS prüfen. `dienste_scan.sh` auf heruntergeladene HTML anwenden.
- **GitHub-Repository / lokales Projekt / Build:** Ordner beschaffen,
  `dienste_scan.sh` ausführen; Rechtsseiten-Dateien suchen; Formulare/
  Storage-Nutzung im Code prüfen.
- **Einzelne HTML-Datei / Einzelseite:** nur DIESE Seite prüfen — Ergebnisse
  nie auf die Gesamt-Site hochrechnen; fehlende Site-Kontexte unter
  „Missing Information" führen, nicht erfragen-um-zu-erfragen.
- **HTML-/ZIP-Upload im Wizard:** prüft der Wizard SELBST clientseitig
  (eigener Offline-ZIP-Reader, alle .html im Archiv) und erzeugt die
  report.html direkt im Browser — Claude wird dafür nicht gebraucht.
- Liegt im Prüfauftrag ein **Sofort-Scan-Ergebnis** (vom Wizard lokal
  erhoben): übernehmen, verifizieren, NICHT erneut abfragen.

## Lokale Ausführung (Cockpit mit laufendem Prüfserver)
Läuft der Prüfserver (`start-cockpit.command` oder
`node scripts/pruefserver.js` → `http://127.0.0.1:8483/wizard.html`),
führt das **Cockpit Live-Prüfungen SELBST aus**: `GET /api/pruefe?url=…`
holt Startseite und Rechtsseiten lokal auf diesem Rechner (keine Cloud)
und liefert Status, Header, Cookies, HTML und die Rechtsseiten-Volltexte;
das Cockpit bewertet deterministisch und erzeugt die report.html.
**Claude-mit-Skill bleibt der Weg für die Tiefenprüfung:** Browser-Konsole,
Subseiten-Crawl, CMP-Klickwege (Requests vor/nach Consent), gerenderte
CMS-Seiten — alles, was ein einzelner HTTP-Abruf nicht sieht. Beide Wege
ergänzen sich; Befunde aus dem Cockpit werden übernommen und verifiziert,
nicht erneut erhoben.

## Der Bericht — exakt diese 7 Abschnitte
1. **Executive Summary** — 3–6 Sätze Ist-Zustand, gesamtes Risiko-Bild.
2. **Detected Components** — Technologien, Formulare, Dienste, externe
   Ressourcen (mit Fundort).
3. **Findings** — je Fund eine Karte:
   `Severity` · `Location` · `Evidence` (Zitat/Zeile/Request) ·
   `Explanation` (warum DSGVO-relevant, mit Norm) · `Recommended Action`.
4. **Missing Information** — NUR technisch nicht Feststellbares.
5. **Recommended Fixes** — konkret, nach Priorität sortiert.
6. **Claude Implementation Brief** — optionaler, kopierfertiger
   Behebungs-Auftrag (nur technische Punkte).
7. **Legal Review Required** — was nur eine Anwältin/ein Anwalt entscheiden
   kann, klar gekennzeichnet.

## Schweregrade
- **Critical** — aktiver Rechtsverstoß mit Abmahn-/Bußgeldrisiko JETZT
  (z. B. fehlendes Impressum auf Live-Site, Tracking ohne Consent,
  Platzhalter in Pflichtangaben).
- **High** — Verstoß wahrscheinlich, aber kontextabhängig (z. B. Google
  Fonts extern geladen, YouTube ohne 2-Klick).
- **Medium** — Pflicht unvollständig erfüllt (z. B. DSE ohne Beschwerderecht,
  Formular ohne Datenminimierung).
- **Low** — Verbesserung/Best Practice (z. B. TLS-Konfiguration härten).
- **Informational** — Hinweis ohne direkte Pflicht.

## Ton & Disziplin
Befund-basiert, jeder Fund mit Beleg — nichts behaupten, was nicht gesehen
wurde. Ein Disclaimer am Berichtsende genügt (keine Warnungs-Wiederholungen):
*„Technisch-organisatorische Prüfung — keine Rechtsberatung; abschließende
Prüfung durch qualifizierte Anwältin/Anwalt."*
