/*
  PLATZHALTER-CHECKLISTE (Impressum) — vor Veröffentlichung von Roberto ausfüllen:
  1. [ROBERTO: Vor- und Nachname]
  2. [ROBERTO: Straße + Hausnummer]
  3. [ROBERTO: PLZ + Ort]
  4. [ROBERTO: Telefonnummer — optional, aber empfohlen; Zeile sonst löschen]
  5. [ROBERTO: USt-IdNr. eintragen ODER den ganzen Absatz löschen, falls keine vorhanden]
  6. [ROBERTO: Vor- und Nachname + Anschrift des inhaltlich Verantwortlichen (§ 18 Abs. 2 MStV) — meist identisch mit oben]
  Hinweis: Ein Einzelunternehmer ohne Handelsregistereintrag braucht KEINE Registerangaben.
  Falls doch eingetragen: Registergericht + Registernummer ergänzen.
  Quelle der Pflichten: IHK-Anforderungen an Websites nach der DSGVO (§ 5 DDG / § 18 MStV).
*/
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Impressum · BRAND-NAME — Shop",
};

export default function ImpressumPage() {
  return (
    <main className="legal">
      <p className="lang-hint">German legal pages — legally binding version.</p>
      <h1>Impressum</h1>

      <h2>Angaben gemäß § 5 DDG</h2>
      <p>
        [ROBERTO: Vor- und Nachname]
        <br />
        [ROBERTO: Straße + Hausnummer]
        <br />
        [ROBERTO: PLZ + Ort]
        <br />
        Deutschland
      </p>

      <h2>Kontakt</h2>
      <p>
        E-Mail: <a href="mailto:kontakt@BRAND-DOMAIN.tld">kontakt@BRAND-DOMAIN.tld</a>
        <br />
        Telefon: [ROBERTO: Telefonnummer — optional, aber empfohlen; Zeile sonst löschen]
      </p>

      <h2>Umsatzsteuer-Identifikationsnummer</h2>
      <p>
        Umsatzsteuer-Identifikationsnummer gemäß § 27a Umsatzsteuergesetz:
        <br />
        [ROBERTO: USt-IdNr. eintragen ODER den ganzen Absatz löschen, falls keine vorhanden]
      </p>

      <h2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
      <p>
        [ROBERTO: Vor- und Nachname + Anschrift des inhaltlich Verantwortlichen (§ 18 Abs. 2 MStV) — meist identisch mit
        oben]
      </p>

      <h2>Verbraucherstreitbeilegung</h2>
      <p>
        Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle
        teilzunehmen (§ 36 VSBG).
      </p>

      <h2>Haftung für Inhalte</h2>
      <p>
        Die Inhalte dieser Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und
        Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. Als Diensteanbieter sind wir für eigene Inhalte
        auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Verpflichtungen zur Entfernung oder Sperrung der
        Nutzung von Informationen nach den allgemeinen Gesetzen bleiben unberührt.
      </p>

      <p className="buy-note">Entwurf — vor Veröffentlichung juristisch prüfen lassen.</p>
    </main>
  );
}
