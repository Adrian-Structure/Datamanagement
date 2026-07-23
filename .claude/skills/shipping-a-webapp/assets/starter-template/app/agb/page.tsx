/*
  PLATZHALTER-CHECKLISTE (AGB) — vor Veröffentlichung von Roberto ausfüllen:
  1. [ROBERTO: Vor- und Nachname]
  2. [ROBERTO: Straße + Hausnummer]
  3. [ROBERTO: PLZ + Ort]
  4. [ROBERTO: Name des Bezahl-Anbieters — erst nach Anbieter-Entscheidung]
  5. [ROBERTO: Satz zum Vertragsmodell des Bezahl-Anbieters — Merchant-of-Record (Anbieter verkauft in eigenem Namen)
      ODER reiner Zahlungsdienst (Vertrag kommt direkt mit uns zustande). Vom Anwalt formulieren lassen.]
  6. [ROBERTO: Preisangabe-Klausel — „Alle Preise verstehen sich inkl. USt." ODER Kleinunternehmer-Satz nach § 19 UStG.
      Je nach USt-Status.]
  Hinweis: Wenn der Bezahl-Anbieter Merchant-of-Record ist, gelten für den Kauf primär DESSEN Bedingungen —
  § 2 und § 5 dann entsprechend anpassen lassen.
  Quelle der Pflichten: IHK-Anforderungen an Websites nach der DSGVO (verbraucherschützende Angaben im
  Vertragsschluss, Preisangaben).
*/
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AGB · BRAND-NAME — Shop",
};

export default function AgbPage() {
  return (
    <main className="legal">
      <p className="lang-hint">German legal pages — legally binding version.</p>
      <h1>Allgemeine Geschäftsbedingungen (AGB)</h1>

      <h2>§ 1 Geltungsbereich und Anbieter</h2>
      <p>
        Diese Allgemeinen Geschäftsbedingungen gelten für alle Verträge über den Erwerb digitaler Inhalte
        (Claude-Skill-Pakete als Download, nachfolgend „Skills"), die über diese Website geschlossen oder angebahnt
        werden.
      </p>
      <p>
        Anbieter ist:
        <br />
        [ROBERTO: Vor- und Nachname]
        <br />
        [ROBERTO: Straße + Hausnummer]
        <br />
        [ROBERTO: PLZ + Ort], Deutschland
        <br />
        E-Mail: <a href="mailto:kontakt@BRAND-DOMAIN.tld">kontakt@BRAND-DOMAIN.tld</a>
      </p>

      <h2>§ 2 Vertragsschluss</h2>
      <p>Der Vertragsschluss erfolgt auf einem der beiden folgenden Wege:</p>
      <p>
        <strong>a) Kauf über den Bezahl-Anbieter:</strong> Die Darstellung der Skills auf dieser Website ist kein
        rechtlich bindendes Angebot, sondern eine Aufforderung zur Bestellung. Über den Button „Jetzt kaufen" werden Sie
        zum Checkout des externen Bezahl-Anbieters [ROBERTO: Name des Bezahl-Anbieters — erst nach
        Anbieter-Entscheidung] weitergeleitet. Dort geben Sie durch Abschluss des Bestellvorgangs ein verbindliches
        Angebot ab; der Vertrag kommt mit Zugang der Bestell- bzw. Lieferbestätigung zustande. [ROBERTO: Satz zum
        Vertragsmodell des Bezahl-Anbieters — Merchant-of-Record (Anbieter verkauft in eigenem Namen) ODER reiner
        Zahlungsdienst (Vertrag kommt direkt mit uns zustande). Vom Anwalt formulieren lassen.]
      </p>
      <p>
        <strong>b) Kauf per E-Mail-Anfrage:</strong> Über den Button „Lizenz anfragen" können Sie eine unverbindliche
        Anfrage per E-Mail stellen. Sie erhalten daraufhin ein Angebot per E-Mail. Der Vertrag kommt zustande, wenn Sie
        dieses Angebot per E-Mail annehmen. Die Lieferung erfolgt nach Zahlungseingang.
      </p>
      <p>
        Solange kein produktives Konto- und Bezahl-System aktiv ist, läuft diese Website im Demo-/Mock-Modus: ein
        „Demo-Testkauf" dient ausschließlich der Vorschau der Konto-Funktionen und begründet keinen Kaufvertrag.
      </p>

      <h2>§ 3 Leistungsgegenstand: Lizenz statt Eigentum</h2>
      <p>
        Gegenstand des Vertrags ist nicht der Erwerb von Eigentum oder von Urheberrechten an einem Skill, sondern die
        Einräumung eines einfachen, nicht ausschließlichen, nicht übertragbaren Nutzungsrechts. Umfang und Grenzen des
        Nutzungsrechts ergeben sich aus der proprietären Lizenz, die jedem Skill-Paket als Lizenzdatei beiliegt und
        deren Kernpunkte auf der jeweiligen Produktseite genannt werden. Insbesondere sind — soweit die Lizenz nichts
        anderes bestimmt — die Weitergabe, der Weiterverkauf, die Veröffentlichung und die Unterlizenzierung des Skills
        oder seiner Bestandteile nicht gestattet. Alle Urheber- und Schutzrechte verbleiben beim Anbieter.
      </p>

      <h2>§ 4 Lieferung</h2>
      <p>
        Die Lieferung erfolgt ausschließlich digital als Download (z. B. Download-Link nach Abschluss des Checkouts
        oder Zusendung per E-Mail). Es wird kein physischer Datenträger versandt. Die Bereitstellung erfolgt beim Kauf
        über den Bezahl-Anbieter unmittelbar nach Zahlungsabschluss, beim Kauf per E-Mail-Anfrage nach
        Zahlungseingang.
      </p>

      <h2>§ 5 Preise und Zahlung</h2>
      <p>
        Es gelten die zum Zeitpunkt der Bestellung auf der Website bzw. im Checkout des Bezahl-Anbieters angezeigten
        Preise in Euro. [ROBERTO: Preisangabe-Klausel — „Alle Preise verstehen sich inkl. USt." ODER
        Kleinunternehmer-Satz nach § 19 UStG. Je nach USt-Status.] Die verfügbaren Zahlungsarten werden im Checkout des
        Bezahl-Anbieters angezeigt; beim Kauf per E-Mail-Anfrage erfolgt die Zahlung per Überweisung nach Rechnung.
      </p>

      <h2>§ 6 Widerrufsrecht</h2>
      <p>
        Verbrauchern steht ein gesetzliches Widerrufsrecht zu. Einzelheiten, insbesondere zum Erlöschen des
        Widerrufsrechts bei digitalen Inhalten, ergeben sich aus der{" "}
        <a href="/widerruf">Widerrufsbelehrung</a>.
      </p>

      <h2>§ 7 Gewährleistung</h2>
      <p>
        Für Verbraucher gelten die gesetzlichen Vorschriften über die Bereitstellung digitaler Produkte (§§ 327 ff.
        BGB), einschließlich der gesetzlichen Mängelrechte. Die Skills werden in der auf der Produktseite beschriebenen
        Fassung geliefert; ein Anspruch auf künftige Aktualisierungen besteht nur, soweit gesetzlich vorgeschrieben
        oder ausdrücklich vereinbart.
      </p>

      <h2>§ 8 Haftung</h2>
      <p>
        Der Anbieter haftet unbeschränkt für Vorsatz und grobe Fahrlässigkeit sowie für Schäden aus der Verletzung des
        Lebens, des Körpers oder der Gesundheit. Bei einfacher Fahrlässigkeit haftet der Anbieter nur für die
        Verletzung wesentlicher Vertragspflichten (Pflichten, deren Erfüllung die ordnungsgemäße Durchführung des
        Vertrags überhaupt erst ermöglicht und auf deren Einhaltung der Vertragspartner regelmäßig vertrauen darf); in
        diesem Fall ist die Haftung auf den vertragstypischen, vorhersehbaren Schaden begrenzt. Die Haftung nach dem
        Produkthaftungsgesetz bleibt unberührt.
      </p>
      <p>
        Die Skills sind Arbeitswerkzeuge für KI-gestützte Arbeitsabläufe. Die Ergebnisse hängen von der Umgebung des
        Nutzers ab (verwendete KI-Modelle, Konten, Systemkonfiguration). Der Nutzer bleibt für die Prüfung und
        Verwendung der Ergebnisse selbst verantwortlich.
      </p>

      <h2>§ 9 Schlussbestimmungen</h2>
      <p>
        Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts. Ist der Kunde Verbraucher
        mit gewöhnlichem Aufenthalt im Ausland, bleiben zwingende verbraucherschützende Bestimmungen seines
        Aufenthaltsstaats unberührt. Sollten einzelne Bestimmungen dieser AGB unwirksam sein, bleibt die Wirksamkeit
        der übrigen Bestimmungen unberührt.
      </p>

      <p className="buy-note">Entwurf — vor Veröffentlichung juristisch prüfen lassen.</p>
    </main>
  );
}
