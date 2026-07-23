# Consent & Drittdienste — die Zwei-Stufen-Prüfung (Fachquellen-Stand: 08.07.2026)

## Die Methode: Zwei Stufen, beide müssen bestehen
1. **§ 25 TDDDG** (Nachfolger des TTDSG): Einwilligung ist Pflicht, sobald
   Informationen auf dem Endgerät **gespeichert oder ausgelesen** werden —
   Cookies, Tracking-Pixel, Local Storage, Fingerprinting. Ausnahmen NUR:
   reine Nachrichtenübermittlung oder technisch zwingend für den ausdrücklich
   gewünschten Dienst (Warenkorb, Login, Session-Sicherheit, Sprachwahl).
2. **DSGVO**: Werden dabei personenbezogene Daten verarbeitet (IP reicht!),
   braucht es zusätzlich eine Rechtsgrundlage nach Art. 6.

Praxisregel der Quelle: erst vollständigen Technologie-Überblick verschaffen,
dann jeden Dienst nach BEIDEN Gesetzen bewerten, dann Datenschutzerklärung
und Consent-Banner daran anpassen.

## Einwilligung — Anforderungen
Freiwillig, informiert, **aktiv** (kein vorangekreuztes Kästchen), **vor**
Aktivierung des Dienstes.
- **Nachweispflicht (Art. 7 Abs. 1):** Jede Einwilligung muss nachweisbar
  sein; elektronisch erteilte Einwilligungen sind zu **protokollieren** — der
  bloße Verweis auf die „ordnungsgemäße Gestaltung der Webseite" genügt der
  Aufsicht nicht.
- **Widerruf:** jederzeit, Wirkung für die Zukunft; Hinweis auf die
  Widerruflichkeit VOR Abgabe ist Pflicht; der Widerruf muss **so einfach
  sein wie die Erteilung** (Consent-Aufruf dauerhaft erreichbar, z. B.
  Footer-Link).
- **Kopplungsverbot (Art. 7 Abs. 4):** Die Vertragserfüllung darf nicht von
  einer Einwilligung abhängen, die für den Vertrag nicht erforderlich ist
  (Beispiel: Newsletter-Häkchen als Bestell-Bedingung).
- **Kinder:** Richtet sich ein Dienst an Kinder, ist die Einwilligung in
  Deutschland erst ab **16 Jahren** wirksam (Art. 8 DSGVO), darunter
  Eltern-Einwilligung → Anwalts-Fall.

## Dienst für Dienst
- **Tracking/Analyse (Google Analytics, Matomo …):** laut Aufsichtsbehörden
  regelmäßig NICHT technisch erforderlich → einwilligungspflichtig; Banner
  muss VOR dem Tool greifen. Bei Google Analytics zusätzlich:
  Vertragsdokumentation mit Google + Drittlandübermittlung in der Erklärung
  (Behördenauffassung zur Rollenverteilung uneinheitlich).
- **Social-Media-Plugins:** übertragen schon beim Seitenaufruf IP + Geräteinfos
  — ohne Klick. Lösungen: **Shariff/2-Klick** oder (datenschutzfreundlichste
  Variante) ganz verzichten und nur zu den Profilen verlinken.
- **Eingebettete Videos (YouTube):** senden ebenfalls beim bloßen Aufruf.
  Erweiterter Datenschutzmodus (youtube-nocookie.com) hilft, **ersetzt die
  Einwilligung aber NICHT** — Vorschaubild + Klick-Freigabe einbauen.
- **Webfonts:** dynamisches Nachladen von Drittservern überträgt die IP →
  **lokal hosten** ist die datenschutzfreundlichste Lösung (Urteil siehe
  Pflichten-Reference).
- **Cookies:** technisch notwendige ohne Einwilligung erlaubt; alles andere
  (Marketing, Retargeting, Reichweite, Dritt-Inhalte) nur mit vorheriger
  Einwilligung.

## Ehrliche Lücken der Quelle (gesondert prüfen)
Keine ePrivacy-Richtlinie, keine konkreten Consent-Tool-Empfehlungen, keine
granulare Cookie-Kategorisierung (nur notwendig/nicht notwendig), Google Maps
nicht behandelt, TDDDG-Anzeigepflicht bei Weiterleitung ohne Detail.
