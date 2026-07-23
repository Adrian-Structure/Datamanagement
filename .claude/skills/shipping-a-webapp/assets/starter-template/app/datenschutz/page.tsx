/*
  PLATZHALTER-CHECKLISTE (Datenschutz) — vor Veröffentlichung von Roberto ausfüllen:
  1. [ROBERTO: Vor- und Nachname]
  2. [ROBERTO: Straße + Hausnummer]
  3. [ROBERTO: PLZ + Ort]
  4. [ROBERTO: Name + Anschrift des Hosting-Anbieters (z. B. der Webspace-Anbieter, bei dem die Seite liegt)]
  5. [ROBERTO: Supabase-Vertragspartner + Anschrift + AVV-Status (Art. 28 DSGVO) — vor Live-Gang mit echtem
      Konto-System ergänzen; Region ist EU/Frankfurt]
  6. [ROBERTO: Name + Anschrift + Sitzland des Bezahl-Anbieters (Checkout-Dienst) — erst nach Anbieter-Entscheidung]
  7. [ROBERTO: Link zur Datenschutzerklärung des Bezahl-Anbieters]
  8. [ROBERTO: zuständige Datenschutz-Aufsichtsbehörde des Bundeslandes + Anschrift]
  Hinweis: Abschnitt „Bezahl-Anbieter" erst finalisieren, wenn der Anbieter feststeht
  (Merchant-of-Record oder reiner Zahlungsdienst — Formulierung ggf. anpassen lassen).
  Quelle der Pflichten: IHK-Anforderungen an Websites nach der DSGVO (Informationspflichten Art. 13 DSGVO,
  Rechtsgrundlagen-Nennung, Cookie-/Tracking-Offenlegung).
*/
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Datenschutzerklärung · BRAND-NAME — Shop",
};

export default function DatenschutzPage() {
  return (
    <main className="legal">
      <p className="lang-hint">German legal pages — legally binding version.</p>
      <h1>Datenschutzerklärung</h1>

      <h2>1. Verantwortlicher</h2>
      <p>Verantwortlicher im Sinne der Datenschutz-Grundverordnung (DSGVO) ist:</p>
      <p>
        [ROBERTO: Vor- und Nachname]
        <br />
        [ROBERTO: Straße + Hausnummer]
        <br />
        [ROBERTO: PLZ + Ort]
        <br />
        Deutschland
        <br />
        E-Mail: <a href="mailto:kontakt@BRAND-DOMAIN.tld">kontakt@BRAND-DOMAIN.tld</a>
      </p>

      <h2>2. Überblick</h2>
      <p>
        Diese Website ist ein statischer Shop für digitale Inhalte (Claude-Skill-Pakete als Download). Sie setzt selbst
        keine Cookies und bindet keine Analyse-, Marketing- oder Tracking-Dienste Dritter ein. Schriftarten (Arial) sowie
        Bilder und Hörproben werden von dieser Website selbst ausgeliefert, nicht von externen Servern nachgeladen.
        Personenbezogene Daten fallen nur in den folgenden Fällen an: beim Aufruf der Seiten (Server-Logs, Abschnitt 3),
        bei Anmeldung/Konto (Abschnitt 4), bei Bewertungen (Abschnitt 5), bei einem Kauf über den externen
        Bezahl-Anbieter (Abschnitt 6) sowie bei Kontakt per E-Mail (Abschnitt 7). Für rein funktionale Zwecke
        (Sprachwahl Deutsch/Englisch sowie, im Demo-/Mock-Modus, Anmeldestatus, Testkäufe und Bewertungsentwürfe) nutzt
        der Browser lokalen Speicher (localStorage). Diese Daten verlassen Ihr Gerät nicht und werden an keinen Server
        übertragen.
      </p>

      <h2>3. Hosting und Server-Logfiles</h2>
      <p>
        Diese Website wird bei einem externen Dienstleister gehostet:
        [ROBERTO: Name + Anschrift des Hosting-Anbieters (z. B. der Webspace-Anbieter, bei dem die Seite liegt)].
      </p>
      <p>
        Beim Aufruf der Website verarbeitet der Hosting-Anbieter automatisch Informationen in sogenannten
        Server-Logfiles, die Ihr Browser übermittelt. Dies sind in der Regel:
      </p>
      <ul>
        <li>IP-Adresse des anfragenden Geräts</li>
        <li>Datum und Uhrzeit des Zugriffs</li>
        <li>aufgerufene Seite bzw. Datei</li>
        <li>übertragene Datenmenge und Zugriffsstatus</li>
        <li>Browsertyp und Browserversion, verwendetes Betriebssystem</li>
        <li>Referrer-URL (die zuvor besuchte Seite)</li>
      </ul>
      <p>
        Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO. Unser berechtigtes Interesse liegt in der
        technisch fehlerfreien Darstellung und der Sicherheit der Website. Die Logdaten werden nicht mit anderen
        Datenquellen zusammengeführt und nach den Vorgaben des Hosting-Anbieters gelöscht. Mit dem Hosting-Anbieter
        besteht ein Vertrag über Auftragsverarbeitung (Art. 28 DSGVO).
      </p>

      <h2>4. Konto und Anmeldung</h2>
      <p>
        Für den Bereich „Meine Käufe" bieten wir ein Nutzerkonto (E-Mail-Adresse + Passwort) an. Sobald ein produktives
        Konto-System konfiguriert ist, läuft die Anmeldung über den Auftragsverarbeiter Supabase, dessen Datenbank- und
        Auth-Infrastruktur für dieses Projekt in der EU (Region Frankfurt am Main) betrieben wird. Verarbeitet werden
        dabei Ihre E-Mail-Adresse, ein gehashtes Passwort sowie die von Ihnen getätigten Käufe (Produktkennung).
        Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung bzw. vorvertragliche Maßnahmen). Mit dem
        Anbieter besteht bzw. wird vor Live-Gang ein Vertrag zur Auftragsverarbeitung (Art. 28 DSGVO) geschlossen:
        [ROBERTO: Supabase-Vertragspartner + Anschrift + AVV-Status ergänzen, sobald das Projekt produktiv geschaltet
        ist].
      </p>
      <p>
        Solange kein produktives Konto-System konfiguriert ist (Demo-/Mock-Modus), findet <strong>keine</strong>{" "}
        Übertragung an einen Server statt: E-Mail-Adresse und Passwort verbleiben ausschließlich im localStorage Ihres
        Browsers und werden nirgends sonst gespeichert oder abgeglichen.
      </p>

      <h2>5. Bewertungen</h2>
      <p>
        Käufer eines Skills können eine Bewertung (Sternebewertung + Freitext) abgeben. Die Bewertung wird öffentlich auf
        der jeweiligen Produktseite angezeigt, zusammen mit einer teil-anonymisierten Fassung Ihrer E-Mail-Adresse
        (z. B. „ro…@beispiel.de" — nur die ersten zwei Zeichen und die Domain bleiben sichtbar). Rechtsgrundlage ist
        Art. 6 Abs. 1 lit. a DSGVO (Einwilligung durch aktives Absenden der Bewertung) sowie Art. 6 Abs. 1 lit. f DSGVO
        (berechtigtes Interesse an Produktbewertungen für andere Kunden). Im Demo-/Mock-Modus wird die Bewertung nur im
        localStorage Ihres Browsers abgelegt; im produktiven Betrieb wird sie über Supabase (siehe Abschnitt 4)
        gespeichert.
      </p>

      <h2>6. Kauf über den Bezahl-Anbieter</h2>
      <p>
        Der Kauf der Skill-Pakete wird, sobald verfügbar, über einen externen Bezahl-Anbieter abgewickelt:
        [ROBERTO: Name + Anschrift + Sitzland des Bezahl-Anbieters (Checkout-Dienst) — erst nach Anbieter-Entscheidung].
      </p>
      <p>
        Wenn Sie einen Kauf abschließen, geben Sie Ihre Bestell- und Zahlungsdaten (z. B. Name, E-Mail-Adresse,
        Rechnungsanschrift, Zahlungsinformationen) direkt beim Bezahl-Anbieter ein. Dieser verarbeitet die Daten in
        eigener Verantwortung bzw. — je nach Vertragsmodell — als unser Auftragsverarbeiter zur Vertragsabwicklung. Wir
        erhalten vom Bezahl-Anbieter die für die Lieferung und Buchhaltung erforderlichen Angaben (z. B. Name,
        E-Mail-Adresse, gekauftes Produkt), jedoch keine vollständigen Zahlungsdaten. Rechtsgrundlage ist Art. 6 Abs. 1
        lit. b DSGVO (Vertragserfüllung) sowie Art. 6 Abs. 1 lit. c DSGVO (steuer- und handelsrechtliche
        Aufbewahrungspflichten).
      </p>
      <p>
        Einzelheiten zur Datenverarbeitung durch den Bezahl-Anbieter finden Sie in dessen Datenschutzerklärung:
        [ROBERTO: Link zur Datenschutzerklärung des Bezahl-Anbieters].
      </p>
      <p>
        Bis zur Anbindung eines Bezahl-Anbieters laufen Käufe ausschließlich per E-Mail-Anfrage (siehe Abschnitt 7);
        außerdem steht im Demo-/Mock-Modus ein reiner Testkauf zur Verfügung, der nur im localStorage Ihres Browsers
        vermerkt wird und keine Zahlungsdaten verarbeitet.
      </p>

      <h2>7. Kontakt per E-Mail</h2>
      <p>
        Wenn Sie uns per E-Mail kontaktieren (z. B. über den Button „Lizenz anfragen"), verarbeiten wir Ihre
        E-Mail-Adresse und die Angaben in Ihrer Nachricht, um Ihre Anfrage zu bearbeiten. Rechtsgrundlage ist Art. 6
        Abs. 1 lit. b DSGVO, soweit die Anfrage auf einen Vertragsschluss zielt, im Übrigen Art. 6 Abs. 1 lit. f DSGVO
        (berechtigtes Interesse an der Beantwortung von Anfragen). Die Daten werden gelöscht, sobald sie für die
        Bearbeitung nicht mehr erforderlich sind und keine gesetzlichen Aufbewahrungspflichten (z. B. für
        Geschäftskorrespondenz) entgegenstehen.
      </p>

      <h2>8. Speicherdauer</h2>
      <p>
        Soweit in dieser Erklärung nichts anderes angegeben ist, speichern wir personenbezogene Daten nur so lange, wie
        es für den jeweiligen Zweck erforderlich ist. Rechnungs- und Buchhaltungsdaten unterliegen gesetzlichen
        Aufbewahrungsfristen von bis zu zehn Jahren. Daten im localStorage Ihres Browsers bleiben bis zum manuellen
        Löschen der Browserdaten oder bis zur Nutzung der Löschfunktion im Konto gespeichert.
      </p>

      <h2>9. Ihre Rechte</h2>
      <p>Sie haben gegenüber uns folgende Rechte hinsichtlich Ihrer personenbezogenen Daten:</p>
      <ul>
        <li>Recht auf Auskunft (Art. 15 DSGVO)</li>
        <li>Recht auf Berichtigung (Art. 16 DSGVO)</li>
        <li>Recht auf Löschung (Art. 17 DSGVO)</li>
        <li>Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
        <li>Recht auf Datenübertragbarkeit (Art. 20 DSGVO)</li>
        <li>Recht auf Widerspruch gegen Verarbeitungen auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO (Art. 21 DSGVO)</li>
      </ul>
      <p>
        Zur Ausübung Ihrer Rechte genügt eine formlose E-Mail an{" "}
        <a href="mailto:kontakt@BRAND-DOMAIN.tld">kontakt@BRAND-DOMAIN.tld</a>. Im Konto-Bereich
        steht Ihnen außerdem eine Funktion zum Anzeigen und Löschen der zu Ihrem Konto gespeicherten Daten zur
        Verfügung.
      </p>
      <p>
        Sie haben außerdem das Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren (Art. 77 DSGVO), z. B.
        bei der für uns zuständigen Behörde: [ROBERTO: zuständige Datenschutz-Aufsichtsbehörde des Bundeslandes +
        Anschrift].
      </p>

      <h2>10. SSL-/TLS-Verschlüsselung</h2>
      <p>
        Diese Website nutzt aus Sicherheitsgründen eine SSL-/TLS-Verschlüsselung. Eine verschlüsselte Verbindung
        erkennen Sie an „https://" und dem Schloss-Symbol in der Adresszeile Ihres Browsers.
      </p>

      <p className="buy-note">Entwurf — vor Veröffentlichung juristisch prüfen lassen.</p>
    </main>
  );
}
