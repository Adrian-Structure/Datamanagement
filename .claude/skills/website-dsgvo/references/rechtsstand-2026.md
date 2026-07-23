# Rechtsstand 2026 — Update-Schicht über dem Skill-Kern

> **STATUS: GEPRÜFT — fachliche Prüfung durch den BDSG-Fachberater am 19.07.2026.**
> Quelle: Roberto-Recherche 07/2026 (RECHERCHE_rechtsstand-2026-07_ROH.md),
> plausibilisiert am BDSG-Volltext (Fassung „zuletzt geändert 12.05.2026") und der
> bekannten EuGH/BGH-Linie. **Keine Rechtsberatung.** Mit ⚠️ markierte Punkte:
> ungeprüft übernommen — Primärquelle checken, bevor sie in ein Kundendokument
> wandern. Primärquellen (Gesetz/Urteil/Behörde) schlagen Blogs.

## 1. Rechtsgrundlagen-Updates (prüfrelevant, Severity HOCH)

| Alt (falsch ab 14.05.2024) | Neu (richtig) |
|---|---|
| „§ 5 TMG" (Impressum) | **§ 5 DDG** — TMG außer Kraft; ein „§ 5 TMG"-Zitat im Impressum gilt als abmahnbar irreführend. Sicherste Praxis: Rechtsgrundlage gar nicht nennen, oder „§ 5 DDG". |
| „TTDSG" | **TDDDG** (nur umbenannt; § 25 Cookies/Endgerätezugriff inhaltlich unverändert) |
| „§ 13 Abs. 7 TMG" (HTTPS-Pflicht) | **§ 19 TDDDG** (Abs. 1–2) **i.V.m. Art. 32 DSGVO**. Kein „Abs. 4" zitieren. |

- Technische Konkretisierung der Verschlüsselungspflicht: **BSI TR-02102-2**
  (TLS 1.2/1.3, Perfect Forward Secrecy, AEAD-Cipher). ⚠️ Version „2026-01" und die
  Aussage „klassische Schlüsseleinigung nur bis Ende 2031 (PQC-Migration)" sind
  ungeprüft übernommen — vor Zitat aktuelle TR-Version beim BSI checken. Die
  BSI-PQC-Linie an sich (Migration bis Anfang der 2030er) ist konsistent bekannt.
- Bußgeldrahmen: Impressumsverstoß bis 50.000 € (DDG-OWi); § 25 TDDDG-Verstoß
  bis 300.000 € (§ 28 TDDDG).

## 2. Abmahnlage 2025/26 — warum Konformität jetzt einklagbar ist (Basis der Severity-Einstufung im Prüfbericht)

- **BGH, Urteile v. 27.03.2025 — I ZR 186/17 („App-Zentrum"), I ZR 222/19, I ZR 223/19:**
  DSGVO-Verstöße sind über § 3a UWG durch **Mitbewerber und Verbände abmahnbar**
  (folgt EuGH C-21/23 „Lindenapotheke" 04.10.2024 und C-757/22). Praxisfolge: eine
  fehlerhafte Datenschutzerklärung oder ein illegaler Tracker ist nicht mehr nur
  ein Behördenthema, sondern Konkurrenzangriff.
- **KMU-Schutzschirm: § 13 Abs. 4 UWG** — bei Verstößen gegen Informations-/
  Kennzeichnungspflichten in Telemedien und gegen die DSGVO haben Mitbewerber
  gegenüber Unternehmen mit **< 250 Mitarbeitern keinen Anspruch auf Ersatz der
  Abmahnkosten** (und § 13a Abs. 2: keine Vertragsstrafe beim ersten Mal).
  Der Unterlassungsanspruch selbst bleibt — Schutz vor Kosten, nicht vor Pflicht.
- **BGH 18.11.2024, VI ZR 10/24 (Facebook-Scraping):** schon der **bloße, kurzzeitige
  Kontrollverlust** über eigene Daten ist ein immaterieller Schaden (Art. 82);
  Größenordnung **~100 €** je Betroffenem nicht zu beanstanden; keine Bagatellgrenze.
  Konsistent mit der EuGH-Serie (C-300/21 u. a.): Verstoß allein reicht nicht,
  aber weiter Schadensbegriff ohne Erheblichkeitsschwelle, Ausgleichsfunktion.
- **Google Fonts bleibt der Klassiker:** LG München I 20.01.2022 (3 O 17493/20,
  100 € Schadensersatz für dynamisches Nachladen). Massenabmahnungen wurden als
  rechtsmissbräuchlich eingestuft (LG München I 2023, LG Hannover 2024);
  ⚠️ „BGH 28.08.2025, VI ZR 258/24: EuGH-Vorlage zum provozierten Verstoß" —
  plausibel, aber Aktenzeichen/Datum vor Zitat prüfen. Fazit unverändert:
  **Fonts lokal hosten**, Thema erledigt.
- **Cookie-Banner: VG Hannover 19.03.2025 (10 A 5385/22):** Banner ohne
  **gleichwertige Ablehnen-Möglichkeit auf der ersten Ebene** unzulässig;
  Google Tag Manager selbst einwilligungspflichtig. Erstinstanzlich — aber die
  sichere Praxis ist ohnehin: Ablehnen-Button gleichrangig (Größe/Farbe/Ebene)
  neben „Akzeptieren", kein Vorankreuzen, Widerruf jederzeit erreichbar.
- **Pay-or-Okay:** EDSA 08/2024 (bei großen Plattformen i. d. R. keine wirksame
  Einwilligung). Für Einzelunternehmer ohne Werbemodell praktisch irrelevant.

## 3. Merchant of Record (Lemon Squeezy) — BEIDE Szenarien dokumentieren

Kern des Problems: Die Lemon-Squeezy-DPA nennt LS „**Processor**" (Auftragsverarbeiter).
Die nach deutscher/EU-Dogmatik überwiegende Einordnung sagt das Gegenteil:

- **Szenario A (empfohlene Arbeitshypothese): eigenständiger Verantwortlicher.**
  EDSA-Leitlinien 07/2020: Die Rollenverteilung wird **funktional** bestimmt —
  das Vertragslabel bindet keine Behörde. Ein Merchant of Record ist rechtlicher
  **Wiederverkäufer** mit eigenen Zwecken (Steuer, AML/Geldwäsche, Betrugsprävention,
  Chargebacks, PCI) und nicht weisungsgebunden → Verantwortlicher (Art. 4 Nr. 7),
  ggf. gemeinsame Verantwortlichkeit (Art. 26) für Teilstrecken. Dazu passt
  **DSK-Kurzpapier Nr. 13 (Anhang B):** Zahlungsdienstleister/Banken sind **keine
  Auftragsverarbeiter** — ein Art.-28-AV-Vertrag ist hier das **falsche Instrument**.
  Konsequenz für die DSE: Datenfluss Käufer→LS als **Übermittlung an einen Dritten**
  offenlegen, eigene Rechtsgrundlage **Art. 6 Abs. 1 lit. b** (Vertrag) + **lit. f**
  (Betrugsprävention) nennen.
- **Szenario B (Fallback, falls man dem DPA-Label folgt): Processor.** Dann trägt
  der LS-DPA als AV-Vertrag; DSE nennt LS unter „Auftragsverarbeiter". Nicht die
  bevorzugte Lesart, aber dokumentieren, dass das Label existiert — so ist man in
  beiden Welten auskunftsfähig.
- **Drittland/USA:** LS-DPA stützt sich auf **SCC** (Art. 46). ⚠️ Vertragsentität
  „Sold through Link, LLC, Salt Lake City" (nach Stripe-Übernahme 2024) und deren
  fehlende eigene DPF-Zertifizierung: ungeprüft übernommen — Entität + DPF-Liste
  vor Einsatz des Textbausteins prüfen. Sicherste Formulierung: **SCC als tragende
  Grundlage** nennen (nicht DPF).
- **Reine Payment-Provider** (z. B. Stripe direkt angebunden): DSK Nr. 13 Anhang B —
  kein AV-Vertrag nötig, Übermittlung an Dritten in der DSE ausweisen.
- **Die 4 Prüfpunkte auf jeder Verkaufs-Site (für den Prüfbericht):**
  1. MoR in der DSE als **eigenständiger Verantwortlicher** dargestellt
     (nicht fälschlich als „Auftragsverarbeiter")?
  2. Rechtsgrundlage **lit. b** (+ **lit. f** Betrugsprävention) genannt?
  3. US-Transfer über **SCC** benannt (nicht nur DPF behauptet)?
  4. **Delivery-Kanal** offengelegt (z. B. GitHub: Konto-Pflicht = Info-Pflicht;
     DPF-Zertifizierung + SCC-Fallback)?

## 4. DPF-Volatilität — SCC-Rückfall immer vorhalten

- EU-US Data Privacy Framework (Angemessenheitsbeschluss Art. 45) ist **formal gültig**:
  EuG hat die Nichtigkeitsklage Latombe (T-553/23) am 03.09.2025 abgewiesen;
  ⚠️ Rechtsmittel beim EuGH (C-703/25 P) anhängig — Az. ungeprüft.
- ⚠️ **US-Supreme-Court „Trump v. Slaughter" (29.06.2026)** — Kippen der
  FTC-Unabhängigkeit — liegt nach Wissensstand des Prüfers und ist nicht
  verifizierbar; die Sorge ist aber **konsistent** mit der bekannten Linie
  (PCLOB-Schwächung 2025, Abhängigkeit des DPF von unabhängiger US-Aufsicht).
- **Praxisregel (urteilsfest, egal wie es ausgeht):** Für jeden US-Dienst
  **SCC als dokumentierten Rückfall** bereithalten (+ ggf. Transfer Impact
  Assessment); DSE so formulieren, dass ein DPF-Wegfall keinen Rewrite erzwingt.
  Neubewertung ausdrücklich vorgesehen bei DPF-Rücknahme/EuGH-Entscheid.

## 5. Bestandskunden-Mails ohne Einwilligung (§ 7 Abs. 3 UWG)

- **EuGH 13.11.2025, C-654/23 (Inteligo Media):** Art. 13 Abs. 2 ePrivacy-RL
  (dt. Umsetzung: § 7 Abs. 3 UWG) ist **lex specialis** — sind die Voraussetzungen
  erfüllt, braucht es **keine zusätzliche Art.-6-Einwilligung**. Auch eine E-Mail-
  Adresse aus einem **kostenlosen** Konto kann „im Zusammenhang mit dem Verkauf"
  erlangt sein.
- **Die 4 Voraussetzungen (alle nötig):**
  1. E-Mail-Adresse **beim Verkauf** einer Ware/Dienstleistung vom Kunden erhalten;
  2. Werbung nur für **eigene, ähnliche** Produkte (Update zum gekauften Skill = eher
     „ähnlich"; breiter Newsletter = NICHT ähnlich → Double-Opt-In-Einwilligung);
  3. Kunde hat **nicht widersprochen**;
  4. **Hinweis auf jederzeitigen kostenlosen Widerspruch** bei Erhebung UND in
     jeder E-Mail.
- In der DSE ausweisen (Rechtsgrundlage Art. 6 Abs. 1 lit. f + § 7 Abs. 3 UWG).

## 6. DSB-Pflicht (§ 38 BDSG) — Stand am Gesetzestext geprüft

- **Geltendes Recht (BDSG-Volltext, Fassung Stand 12.05.2026, gegengelesen):**
  Benennungspflicht ab **in der Regel mindestens 20 Personen**, die ständig mit
  automatisierter Verarbeitung beschäftigt sind; unabhängig von der Zahl bei
  DSFA-Pflicht oder geschäftsmäßiger Übermittlung/Markt-/Meinungsforschung.
  Für den Solo-Betreiber einer Verkaufs-Website: regelmäßig **kein DSB nötig**.
- ⚠️ Streichungsplan der 20er-Schwelle („Föderale Modernisierungsagenda",
  Beschluss 04.12.2025, Umsetzung bis Ende 2026 geplant): ungeprüft übernommen —
  im Juli-2026-Gesetzestext steht § 38 unverändert. Als „geplant, nicht in Kraft"
  behandeln.

## 7. Prüf-Tools (kostenlos, für den Technik-Pass und die laufende Pflege)

| Tool | prüft | Grenze |
|---|---|---|
| webbkoll.dataskydd.net | Third-Party-Requests, Cookies, Header | kein Consent-Durchklicken |
| Blacklight (themarkup.org) | Tracker, Fingerprinting, Session-Recorder, Pixel | Einzelseite; CLI für Batch |
| Google-Fonts-Checker (z. B. easyRechtssicher) | Rest-Einbindungen von Google Fonts | nur Fonts |
| SSL Labs (Note mindestens A) + CryptCheck | TLS-Konfiguration, Cipher | nur Transport-Ebene |
| securityheaders.com / Mozilla Observatory | Header (HSTS, CSP …) | keine Rechtsbewertung |
| Browser-DevTools | Netzwerk-Tab VOR Consent — Goldstandard: kein nicht-essenzieller Third-Party-Request darf feuern | manuell |
| CI-Pipeline: Blacklight-CLI, Lighthouse, testssl.sh | laufende Pflege, monatlich empfohlen | Interpretation bleibt beim Prüfer |

Regel für den Bericht: **Jeder Befund trägt seinen Beleg** (Tool + Fundstelle);
Severities nach Abschnitt 2 dieser Datei gewichten.

## 8. Textbausteine (MUSTER — keine Rechtsberatung, vor Einsatz prüfen/anpassen)

### MUSTER: Zahlungsabwicklung über Merchant of Record (Lemon Squeezy)
> Zur Abwicklung von Käufen digitaler Produkte nutzen wir Lemon Squeezy
> (⚠️ Entität prüfen: „Sold through Link, LLC", 222 South Main Street Suite 500,
> Salt Lake City, UT 84101, USA) als „Merchant of Record". Lemon Squeezy tritt als
> rechtlicher Wiederverkäufer auf und ist für die Zahlungsabwicklung eigenständig
> datenschutzrechtlich verantwortlich. Bei einem Kauf werden Ihre Angaben (Name,
> E-Mail-Adresse, Zahlungs- und Rechnungsdaten, IP-Adresse) an Lemon Squeezy
> übermittelt. Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)
> sowie lit. f (Betrugsprävention). Die Übermittlung in die USA erfolgt auf
> Grundlage der EU-Standardvertragsklauseln (Art. 46 DSGVO). Weitere
> Informationen: [Link zur Lemon-Squeezy-Datenschutzerklärung].

### MUSTER: Produkt-Auslieferung über GitHub
> Die Auslieferung gekaufter digitaler Produkte erfolgt über zugangsbeschränkte
> GitHub-Repositories (GitHub, Inc., USA). Hierfür ist ein GitHub-Konto
> erforderlich; wir erhalten Ihren GitHub-Benutzernamen zur Zugangsgewährung.
> Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO. GitHub ist nach dem EU-US Data
> Privacy Framework zertifiziert; ergänzend gelten Standardvertragsklauseln.

### MUSTER: Newsletter (Double-Opt-In)
> Mit der Anmeldung willigen Sie in den Empfang unseres Newsletters ein
> (Art. 6 Abs. 1 lit. a DSGVO). Die Anmeldung wird erst nach Bestätigung über
> den Link in der Bestätigungs-E-Mail wirksam (Double-Opt-In). Sie können sich
> jederzeit über den Link in jeder E-Mail abmelden; der Widerruf ist so einfach
> wie die Erteilung.

### MUSTER: Bestandskunden-Produktupdates (§ 7 Abs. 3 UWG)
> Wir verwenden die bei Ihrem Kauf angegebene E-Mail-Adresse, um Sie über
> Updates und ähnliche eigene Produkte zu informieren (Art. 6 Abs. 1 lit. f
> DSGVO i.V.m. § 7 Abs. 3 UWG). Sie können dem jederzeit kostenlos widersprechen,
> z. B. per E-Mail an […] oder über den Link in jeder Nachricht.

### MUSTER: Cookie-Banner, erste Ebene (konforme Gestaltung)
> Drei gleichwertige Schaltflächen: **[Alle akzeptieren] [Alle ablehnen]
> [Einstellungen]** — gleiche Größe, Farbe und Ebene; nichts vorangekreuzt;
> Widerruf jederzeit über dauerhaft erreichbares Icon/Link im Footer.

### MUSTER: 2-Klick-Einbettung (youtube-nocookie)
> „Dieses Video wird erst nach Ihrer Einwilligung von YouTube (Google Ireland
> Ltd.) geladen. Dabei können Daten an Google übermittelt werden.
> [Video laden] [Immer laden]"

### MUSTER: Server-Logs (Art. 6 Abs. 1 lit. f)
> Beim Aufruf dieser Website werden automatisch Informationen (IP-Adresse,
> Datum/Uhrzeit, aufgerufene Seite, Browser/Betriebssystem) in Server-Logfiles
> gespeichert. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (sicherer und
> stabiler Betrieb). Löschung nach [7] Tagen.

## 9. Neubewertungs-Trigger (in die laufende Pflege übernehmen)

Neu bewerten bei: EuGH-Entscheid zum DPF (C-703/25 P) oder DPF-Rücknahme ·
jedem neuen Drittdienst · Erreichen von ~20 ständig mit Datenverarbeitung
beschäftigten Personen (§ 38 BDSG, sofern dann noch in Kraft) · EuGH-Antwort
auf die Google-Fonts-Vorlage (⚠️ VI ZR 258/24) · neuer BSI-TR-02102-Version.
