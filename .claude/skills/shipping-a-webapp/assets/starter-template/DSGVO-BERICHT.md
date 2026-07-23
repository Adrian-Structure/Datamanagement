# DSGVO-Audit — BRAND-NAME Skill-Shop (Next.js, statischer Export)

Geprüft von: Agent S3 (Prüfer, kein Code-Autor außer ggf. `app/consent.tsx`)
Prüfzeitpunkt: 2026-07-17. **Hinweis zum Ablauf:** Die Prüfung begann auf dem Stand von genau einem Commit (`d2009b7`), in dem `Impressum · Datenschutz · AGB · Widerruf` laut Footer noch ausdrücklich fehlten. Während der Prüfung landeten S1 (Rechtsseiten) und S2 (Formular-/Datenrechte-Technik) ihre Arbeit unkommittiert im selben Arbeitsverzeichnis. Dieser Bericht bewertet den **finalen, am Ende der Prüfung vorgefundenen Stand** (`git status` zeigt die unten gelisteten neuen/geänderten Dateien, noch nicht committet).
Quelle der Pflichtenliste: IHK Regensburg, „Anforderungen an Websites nach der DS-GVO"
(https://www.ihk.de/regensburg/fachthemen/recht/online-recht-und-datenschutz/eu-datenschutzgrundverordnung/anforderungen-an-websites-nach-der-ds-gvo-4158848).
**Hinweis zur Quelle:** Direkter `WebFetch` auf die IHK-Seite wurde vom Server zweimal mit HTTP 403 blockiert. Die Pflichtenliste stützt sich deshalb auf die per Websuche erreichbare, URL-identisch bestätigte Zusammenfassung derselben Seite plus etablierte Rechtsgrundlagen (Art. 13/28 DSGVO, TTDSG §25, §5 DDG, §18 MStV, §§356/327 BGB). Kernaussage identisch: **Impressum + Datenschutzerklärung praktisch immer Pflicht; SSL/HTTPS Pflicht; Cookie-Offenlegungspflicht; bei Auftragsverarbeitung ein AVV.**

---

## 1. Consent-Banner-Entscheidung: **NEIN — kein Banner eingebaut**

**Befund per Grep (Beweise unten):** Die App setzt keine Cookies, lädt nichts von Drittservern (kein Analytics, kein Tracking-Pixel, keine externen Schriften/Skripte), `fetch()`/externe `http(s)://`-Aufrufe existieren im Code nicht. `localStorage` wird ausschließlich funktional verwendet:

1. Spracheinstellung (`shop-lang`, `lib/i18n.tsx`)
2. Demo-/Mock-Zustand ohne echten Server (`shop-mock-user`, `shop-mock-purchases`, `shop-mock-reviews`, `lib/supabase.ts`) — nur solange `NEXT_PUBLIC_SUPABASE_URL`/`_ANON_KEY` leer sind (`MOCK`-Modus, aktuell aktiv).

**Rechtliche Einordnung (TTDSG §25):** §25 TTDSG ist technologieneutral und erfasst auch `localStorage`, sieht aber eine Ausnahme von der Einwilligungspflicht vor (§25 Abs. 2 Nr. 2 TTDSG), wenn die Speicherung **unbedingt erforderlich** ist, um einen vom Nutzer **ausdrücklich gewünschten** Dienst bereitzustellen. Sprachpräferenz und (nach Aktivierung von Supabase) der Login-Sitzungszustand fallen unter diese Ausnahme — vergleichbar mit einem Session-Cookie für den Login. Ein Consent-Banner dafür wäre **Consent-Theater**.

Die inzwischen von S1 gebaute Datenschutzerklärung (`app/datenschutz/page.tsx`, Abschnitt 2 „Überblick") kommt unabhängig zum selben Ergebnis und formuliert es fast wortgleich: keine eigenen Cookies, keine Dritt-Tracking-Dienste, localStorage nur für rein funktionale Zwecke, Daten verlassen das Gerät nicht. Das bestätigt meinen Befund von unabhängiger Seite.

**Vorausschauender Hinweis:** Sobald echte Supabase-Zugangsdaten aktiv sind, speichert `@supabase/supabase-js` automatisch ein Auth-Session-Token in `localStorage` — ebenfalls funktional notwendig, fällt unter dieselbe TTDSG-Ausnahme, löst **keinen** Consent-Banner aus. `app/datenschutz/page.tsx` Abschnitt 4 deckt das bereits inhaltlich ab.

**Ergebnis:** `app/consent.tsx` wurde **nicht** gebaut — die einzige laut Auftrag erlaubte Code-Datei bleibt ungenutzt, weil der Befund NEIN lautet und von S1s unabhängig verfasstem Text bestätigt wird.

### Grep-Beweise

```
$ grep -rniE "document\.cookie|js-cookie|cookie\(" app lib --include='*.ts*'      → 0 Treffer
$ grep -rniE "gtag|analytics|googletagmanager|facebook|fbq|pixel|hotjar|mixpanel|segment\.io|plausible|matomo" app lib --include='*.ts*'  → 0 Treffer
$ grep -rniE "fetch\(|https?://" app lib --include='*.ts*'                        → 0 Treffer
$ grep -niE "@import|url\(|fonts\.googleapis|fonts\.gstatic|http" app/globals.css → 0 Treffer (keine externen Fonts/Ressourcen)
$ grep -rniE "localStorage|sessionStorage" app lib --include='*.ts*'
  → lib/i18n.tsx: shop-lang (Sprache)
  → lib/supabase.ts: shop-mock-user, shop-mock-purchases, shop-mock-reviews (nur MOCK-Modus)
```

---

## 2. IHK-Punkteliste mit Status (finaler Prüfzeitpunkt)

| # | Anforderung | Status | Befund |
|---|---|---|---|
| 1 | **Impressumspflicht** (§5 DDG, §18 MStV) | 🟢 **ERFÜLLT als Entwurf** | `app/impressum/page.tsx` jetzt vorhanden — Name/Anschrift, Kontakt, USt-ID, §18-MStV-Verantwortlicher, Verbraucherstreitbeilegung (§36 VSBG), Haftung. **6 `[ROBERTO:]`-Platzhalter** (Name, Straße, PLZ/Ort, Telefon, USt-IdNr., §18-MStV-Person) müssen vor Live-Gang gefüllt werden. Seite trägt selbst den Hinweis „Entwurf — vor Veröffentlichung juristisch prüfen lassen." |
| 2 | **Datenschutzerklärung nach Art. 13 DSGVO** | 🟢 **ERFÜLLT als Entwurf** | `app/datenschutz/page.tsx` — 10 Abschnitte: Verantwortlicher, Überblick, Hosting/Server-Logs (Art. 6 Abs. 1 lit. f), Konto/Supabase (Art. 6 Abs. 1 lit. b, AVV-Hinweis), Bewertungen (Art. 6 Abs. 1 lit. a+f, E-Mail-Maskierung erklärt), Bezahl-Anbieter (Art. 6 Abs. 1 lit. b+c, Hinweis auf dessen eigene Datenschutzerklärung), Kontakt per E-Mail, Speicherdauer, Betroffenenrechte (Art. 15–21, verweist korrekt auf die neue Selbstbedienungsfunktion im Konto), Aufsichtsbehörde, SSL/TLS. Inhaltlich sauber auf die tatsächliche Architektur gemappt (nicht generisch). **8 `[ROBERTO:]`-Platzhalter** offen (Anschrift, Hosting-Anbieter, Supabase-Vertragspartner+AVV-Status, Bezahl-Anbieter+Sitzland+Link, Aufsichtsbehörde). |
| 3 | **AGB** | 🟢 **ERFÜLLT als Entwurf** | `app/agb/page.tsx` — Vertragsschluss (zwei Wege: Bezahl-Anbieter-Checkout vs. E-Mail-Anfrage), Leistungsgegenstand als **Lizenz statt Eigentum** (passt zur `LICENSE.txt`-Logik der App), Lieferung, Preise, Verweis auf Widerrufsbelehrung, Gewährleistung nach §§327 ff. BGB (digitale Produkte), Haftung, Schlussbestimmungen. **6 `[ROBERTO:]`-Platzhalter** (Name, Straße, PLZ/Ort, Bezahl-Anbieter-Name, Vertragsmodell-Satz, Preisangabe-/Kleinunternehmer-Klausel). |
| 4 | **Widerrufsbelehrung** | 🟢 **ERFÜLLT als Entwurf** | `app/widerruf/page.tsx` — 14-Tage-Widerrufsrecht, Muster-Widerrufsformular, und korrekt der für digitale Inhalte kritische Punkt: **Erlöschen des Widerrufsrechts nach §356 Abs. 5 BGB** nur bei zwei expliziten Bestätigungen des Kunden VOR Lieferbeginn. Die Datei enthält im Code-Kommentar selbst den technisch wichtigen Hinweis, dass der künftige Checkout das per Checkbox abbilden muss — sonst bleibt das Widerrufsrecht bestehen. Das ist ein korrekter Vorgriff auf die noch fehlende Bezahl-Anbieter-Integration. **3 `[ROBERTO:]`-Platzhalter** (Anschrift, zweimal). |
| 5 | **Footer-Verlinkung der Rechtsseiten** | 🟢 **ERFÜLLT** | `app/chrome.tsx` verlinkt jetzt DE/EN-lokalisiert auf `/impressum`, `/datenschutz`, `/agb`, `/widerruf` (`lib/i18n.tsx`: `footerImpressum/Datenschutz/Agb/Widerruf`). Alle vier Ziel-Routen existieren. Kein toter Link mehr. |
| 6 | **SSL/TLS-Verschlüsselung** | ⚪ **NICHT PRÜFBAR aus dem Quellcode** | Statischer Export (`next.config.ts: output:"export"`, `basePath:"/shop"`) — HTTPS ist eine Hosting-Eigenschaft. `app/datenschutz/page.tsx` Abschnitt 10 behauptet bereits „Diese Website nutzt SSL/TLS" — das ist beim Live-Gang auf der echten Domain zu verifizieren, sonst wäre der Text falsch. |
| 7 | **Cookies / Consent (TTDSG)** | 🟢 **ERFÜLLT** (kein Banner nötig) | Siehe Abschnitt 1. |
| 8 | **Formulare / Transparenz bei Dateneingabe** | 🟢 **ERFÜLLT** | Login/Signup (`app/konto/page.tsx`) hat jetzt einen Datenschutzhinweis + Link zur Datenschutzerklärung direkt am Formular (`t.accountPrivacyNote`, `t.privacyLinkLabel`). Bewertungsformular (`app/skill/[slug]/view.tsx`) hat jetzt `t.reviewPrivacyNote` (Hinweis auf Veröffentlichung + E-Mail-Maskierung) direkt über dem Absenden-Button. „Jetzt kaufen"/„Lizenz anfragen" bleibt ein reiner `mailto:`-Link — keine serverseitige Datenübertragung durch die App selbst. |
| 9 | **Betroffenenrechte** (Auskunft, Löschung, Berichtigung, Widerspruch, Datenübertragbarkeit) | 🟢 **ERFÜLLT (Selbstbedienung im Konto-Bereich, ehrlich begrenzt)** | `lib/supabase.ts` jetzt mit `myData()` (Art. 15 Auskunft — zeigt E-Mail, Käufe, eigene Bewertungen) und `deleteMyData()` (Art. 17 Löschung). UI dazu in `app/konto/page.tsx`: „Meine Daten" mit Anzeigen/Ausblenden + Löschen-Bestätigungsdialog. Bemerkenswert sauber gelöst: Im **Mock-Modus** wird wirklich alles lokal gelöscht. Im **Echt-Modus** löscht der Client die eigenen Bewertungen (nutzt die vorhandene RLS-Policy `reviews_delete_own`) und meldet ab, kann aber den Supabase-Auth-User selbst **nicht** vom Browser aus löschen (kein Service-Role-Key im Client — technisch korrekt so) — die App verlangt dafür ehrlich eine Bestätigungs-Mail an den Betreiber, statt eine vollständige Löschung nur vorzutäuschen. Das ist genau die Art von Transparenz, die Art. 17 DSGVO verlangt: keine Behauptung, die die Architektur nicht einlösen kann. |
| 10 | **Auftragsverarbeitung / Drittanbieter (Supabase, Bezahl-Anbieter)** | 🟡 **OFFEN (Vertragsebene, nicht Code)** | Unverändert gegenüber dem ersten Durchgang: Supabase-Region ist korrekt auf Frankfurt/eu-central-1 vorgesehen, ersetzt aber nicht den Pflicht-AVV (Art. 28 DSGVO) — `app/datenschutz/page.tsx` verweist selbst korrekt darauf und lässt den Vertragspartner/AVV-Status als Platzhalter offen. Bezahl-Anbieter ist noch nicht endgültig benannt (Code/Kommentare deuten auf Lemon Squeezy hin — US-Unternehmen, seit 2024 Teil von Stripe — aber weder `app/datenschutz/page.tsx` noch `app/agb/page.tsx` nennen ihn fest, sondern lassen ihn bewusst als `[ROBERTO:]`-Platzhalter bis zur endgültigen Anbieter-Entscheidung). **Reine Vertrags-/Formulierungs-Pflicht, kein Code-Mangel.** |
| 11 | **Datensparsamkeit / Privacy by Design** | 🟢 **ERFÜLLT** | Unverändert: DB-Schema speichert nur Nötiges, Reviews zeigen nur maskierte E-Mail, RLS beschränkt Lesezugriffe, kein Tracking. |
| 12 | **Externe Ressourcen im Frontend** (Fonts, Skripte, Social-Plugins) | 🟢 **NICHT ZUTREFFEND** | Grep bestätigt weiterhin: keine externen Fonts/Skripte, alle Assets lokal unter `public/`. `app/datenschutz/page.tsx` bestätigt das unabhängig („Schriftarten (Arial) sowie Bilder und Hörproben werden von dieser Website selbst ausgeliefert"). |
| 13 | **Zahlungsdaten-Handling / PCI-Scope** | 🟢 **ERFÜLLT (durch Architektur)** | Kauf-Button ist aktuell noch `mailto:`-only, kein `checkoutUrl`-Feld in `data/products.json`. Sobald der Bezahl-Anbieter angebunden ist, läuft Checkout komplett auf dessen gehosteter Seite — kein Kartendaten-Handling im eigenen Code. `app/agb/page.tsx` §2 beschreibt diesen Ablauf bereits korrekt vorausschauend. |

---

## 3. Restpunkte-Liste für Roberto

**Vertrags-/Verwaltungsebene (kein Code):**
- [ ] **AVV/DPA mit Supabase** abschließen (Standard-DPA im Dashboard), trotz EU-Region Frankfurt weiterhin Pflicht.
- [ ] **Bezahl-Anbieter final entscheiden** (Lemon Squeezy oder Alternative), danach dessen Datenschutzerklärung/Sitzland prüfen und in `app/datenschutz/page.tsx` + `app/agb/page.tsx` eintragen.
- [ ] Beim Live-Gang **SSL/HTTPS auf der echten Domain verifizieren** — `app/datenschutz/page.tsx` behauptet es bereits als Text.

**Alle `[ROBERTO:]`-Platzhalter füllen (23 distinkte Angaben, vier Dateien — jede Angabe steht meist zusätzlich nochmal im Kommentar-Kopf der Datei, daher zeigt ein rohes `grep -c ROBERTO: <datei>` einen höheren Wert):**
- [ ] `app/impressum/page.tsx` — 6 Angaben (Name, Straße/Hausnr., PLZ/Ort, Telefon, USt-IdNr., §18-MStV-Person)
- [ ] `app/datenschutz/page.tsx` — 8 Angaben (Anschrift, Hosting-Anbieter, Supabase-Vertragspartner+AVV, Bezahl-Anbieter+Sitzland+Link, Aufsichtsbehörde)
- [ ] `app/agb/page.tsx` — 6 Angaben (Name, Straße/Hausnr., PLZ/Ort, Bezahl-Anbieter-Name, Vertragsmodell-Satz — **vom Anwalt formulieren lassen**, Preisangabe-/Kleinunternehmer-Klausel)
- [ ] `app/widerruf/page.tsx` — 3 Angaben (Name, Straße/Hausnr., PLZ/Ort — erscheinen je zweimal im Text: Belehrung + Muster-Formular)
- [ ] Alle vier Seiten tragen den Hinweis „Entwurf — vor Veröffentlichung juristisch prüfen lassen" — das gilt weiterhin, auch nach dem Ausfüllen der Platzhalter (S1 hat das selbst so markiert, nicht ich).

**Technischer Restpunkt für den künftigen Checkout (bereits im Code-Kommentar von `app/widerruf/page.tsx` vorgemerkt):**
- [ ] Sobald der Bezahl-Anbieter angebunden wird: Checkout braucht eine Checkbox für die zwei nach §356 Abs. 5 BGB nötigen Bestätigungen (sofortiger Ausführungsbeginn + Kenntnis vom Erlöschen des Widerrufsrechts), sonst bleibt das Widerrufsrecht trotz Downloads bestehen.

**Kein Handlungsbedarf (bereits sauber umgesetzt, in diesem Durchgang geprüft):**
- Kein Consent-Banner nötig (Abschnitt 1).
- Keine externen Trackingskripte/Fonts.
- Zahlungsdaten bleiben komplett beim künftigen Bezahl-Anbieter — kein PCI-Scope im eigenen Code.
- Datensparsamkeit im DB-Schema und in der Review-Anzeige (E-Mail-Maskierung).
- Betroffenenrechte-Selbstbedienung (Auskunft + Löschung) im Konto-Bereich funktional vorhanden und ehrlich in ihren technischen Grenzen kommuniziert.
- Datenschutzhinweise direkt an Login- und Bewertungsformular.
- Footer verlinkt alle vier Rechtsseiten, keine toten Links.

---

## 4. Hinweis zum Prüfverlauf

Diese Prüfung begann auf einem Ein-Commit-Stand ohne jede Rechtsseite und endete — weil S1 und S2 während der Prüfung parallel weitergearbeitet haben — auf einem Stand mit vollständigem Impressum/Datenschutz/AGB/Widerruf-Entwurf plus funktionierender Betroffenenrechte-Selbstbedienung. Der Bericht wurde entsprechend **einmal aktualisiert**, um den tatsächlich vorgefundenen Endstand zu bewerten, statt einen zwischenzeitlich überholten Zwischenstand zu berichten (Delta-Prinzip). Nichts an App-Code wurde von diesem Prüfer verändert; alle oben referenzierten `.tsx`-Änderungen stammen von S1/S2. Vor dem tatsächlichen Live-Gang ist eine erneute Prüfung gegen den dann finalen (committeten, Platzhalter-freien) Stand nötig — insbesondere sobald der Bezahl-Anbieter feststeht und der Checkout gebaut ist.

---
## Nachtrag Schlussabnahme (Anna, auf Robertos Einwand "lädt doch Templates von GitHub")

**Präzisierung Drittbezug:** Der Besucher-Browser lädt nichts von Dritt-Servern (Befund S3 bleibt korrekt — Templates/npm werden nur zur BAU-Zeit auf dem Entwickler-Rechner geladen). ABER: Solange die Seite auf **GitHub Pages** gehostet wird, ist GitHub Inc. (USA, Microsoft-Konzern) der Hosting-Dienstleister und verarbeitet Besucher-IPs in Server-Logs — Drittlandsbezug USA.

**Konsequenz für den Hosting-Platzhalter in datenschutz/page.tsx** — fertiger Textbaustein, falls es bei Pages bleibt:
> „GitHub Inc., 88 Colin P Kelly Jr St, San Francisco, CA 94107, USA (GitHub Pages). GitHub ist unter dem EU-U.S. Data Privacy Framework zertifiziert; Rechtsgrundlage der Log-Verarbeitung ist Art. 6 Abs. 1 lit. f DSGVO (sicherer, stabiler Betrieb)."

**Alternative (sauberste EU-Lösung):** Hosting zu einem EU-Anbieter umziehen (IONOS-Webspace-Paket dazubuchen oder Hostinger EU) — dann entfällt der US-Bezug im Hosting. Robertos Entscheidung; bis dahin gilt der Textbaustein oben.
