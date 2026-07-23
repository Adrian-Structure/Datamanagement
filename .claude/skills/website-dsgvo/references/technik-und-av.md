# Technik, Sicherheit & Auftragsverarbeitung (Fachquellen-Stand: 08.07.2026)

## HTTPS/TLS (§ 19 TDDDG i.V.m. Art. 32 DSGVO — Stand der Technik, BSI TR-02102-2)
Website über HTTPS mit aktueller TLS-Version (**empfohlen TLS 1.3**), gültiges
Zertifikat einer vertrauenswürdigen CA (Let's Encrypt genügt), rechtzeitig
erneuert. Besonders kritisch bei Registrierung, Bestellung, jeder
Datenübermittlung. Sobald Nutzer Daten eingeben können (schon ein einfaches
Kontaktformular), ist Verschlüsselung zusätzlich über **Art. 32 DSGVO**
(Sicherheit der Verarbeitung) zwingend. Verbindliche Konfigurations-Vorgaben:
BSI TR-02102-2 (siehe praxishilfen.md).

## Kontaktformular
- **Datenminimierung**: nur notwendige Felder abfragen.
- Optionale Felder ausdrücklich als **freiwillig** kennzeichnen.
- Übertragung nur per HTTPS.
- Das Formular in der Datenschutzerklärung beschreiben.
- **Sonderfall Karriere-/Bewerbungsformular:** Bewerber gelten als
  Beschäftigte (§ 26 Abs. 8 S. 2 BDSG) → Beschäftigtendatenschutz greift;
  Einwilligungen hier schriftlich/elektronisch mit Textform-Aufklärung über
  Zweck und Widerrufsrecht.

## Server-Logfiles
Rechtsgrundlage i. d. R. Art. 6 Abs. 1 lit. f (Sicherheit/Stabilität); Nutzung
NUR für Sicherheits-/Fehleranalyse/Verwaltung; in der Erklärung erläutern
(Kategorien, Zwecke, Rechtsgrundlage, Speicherdauer).

## Auftragsverarbeitung (AV-Verträge)
- **Hoster: immer.** Schon die bloße **Zugriffsmöglichkeit** auf
  personenbezogene Daten löst die AV-Pflicht aus — auch bei Wartungs-,
  Webdesign-, Backup-, Newsletter-, Cloud- und SaaS-Dienstleistern.
- Vertragsinhalt: Art/Zweck der Verarbeitung, Weisungsrechte, technische und
  organisatorische Maßnahmen (TOM), Pflichten des Auftragsverarbeiters.
- Standard-AV des Anbieters nicht blind übernehmen — auf Passung zur
  tatsächlich genutzten Leistung prüfen.

## Durchgehendes Prinzip
Datensparsamkeit bei Formularen, Tools und Fonts (lokal statt Drittserver).

## Ehrliche Lücken der Quelle (gesondert prüfen, nicht raten)
- **Newsletter/Double-Opt-in wird nicht behandelt** (Newsletter nur als
  AV-Beispiel erwähnt).
- **Drittlandübermittlung nicht systematisch** (keine SCC/
  Angemessenheitsbeschlüsse — nur Einzelbeispiele Analytics/Fonts/YouTube).
- TOM nur als Pflichtbegriff, ohne Maßnahmenliste.
