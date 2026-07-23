/*
  PLATZHALTER-CHECKLISTE (Widerrufsbelehrung) — vor Veröffentlichung von Roberto ausfüllen:
  1. [ROBERTO: Vor- und Nachname]
  2. [ROBERTO: Straße + Hausnummer]
  3. [ROBERTO: PLZ + Ort]
  (Name/Anschrift erscheinen ZWEIMAL: in der Belehrung und im Muster-Widerrufsformular.)
  Hinweis: Wenn der Bezahl-Anbieter als Merchant-of-Record in eigenem Namen verkauft, ist ER Adressat des Widerrufs —
  Belehrung dann vom Anwalt anpassen lassen.
  Wichtig für den Checkout (Bezahl-Anbieter): Das Erlöschen des Widerrufsrechts (§ 356 Abs. 5 BGB) setzt VOR
  Lieferbeginn zwei Klicks des Kunden voraus: ausdrückliche Zustimmung zum sofortigen Beginn + Kenntnisnahme des
  Erlöschens. Das muss der Checkout technisch abbilden (Checkbox), sonst bleibt das Widerrufsrecht bestehen.
  Quelle der Pflichten: IHK-Anforderungen an Websites nach der DSGVO / Fernabsatzrecht für digitale Inhalte.
*/
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Widerrufsbelehrung · BRAND-NAME — Shop",
};

export default function WiderrufPage() {
  return (
    <main className="legal">
      <p className="lang-hint">German legal pages — legally binding version.</p>
      <h1>Widerrufsbelehrung</h1>

      <h2>Widerrufsrecht</h2>
      <p>
        Verbrauchern steht das folgende Widerrufsrecht zu. Verbraucher ist jede natürliche Person, die ein
        Rechtsgeschäft zu Zwecken abschließt, die überwiegend weder ihrer gewerblichen noch ihrer selbständigen
        beruflichen Tätigkeit zugerechnet werden können (§ 13 BGB).
      </p>
      <p>
        Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen. Die
        Widerrufsfrist beträgt vierzehn Tage ab dem Tag des Vertragsschlusses.
      </p>
      <p>Um Ihr Widerrufsrecht auszuüben, müssen Sie uns</p>
      <p>
        [ROBERTO: Vor- und Nachname]
        <br />
        [ROBERTO: Straße + Hausnummer]
        <br />
        [ROBERTO: PLZ + Ort], Deutschland
        <br />
        E-Mail: <a href="mailto:kontakt@BRAND-DOMAIN.tld">kontakt@BRAND-DOMAIN.tld</a>
      </p>
      <p>
        mittels einer eindeutigen Erklärung (z. B. ein mit der Post versandter Brief oder eine E-Mail) über Ihren
        Entschluss, diesen Vertrag zu widerrufen, informieren. Sie können dafür das beigefügte
        Muster-Widerrufsformular verwenden, das jedoch nicht vorgeschrieben ist.
      </p>
      <p>
        Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung über die Ausübung des Widerrufsrechts vor
        Ablauf der Widerrufsfrist absenden.
      </p>

      <h2>Folgen des Widerrufs</h2>
      <p>
        Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen erhalten haben,
        unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über Ihren
        Widerruf dieses Vertrags bei uns eingegangen ist. Für diese Rückzahlung verwenden wir dasselbe Zahlungsmittel,
        das Sie bei der ursprünglichen Transaktion eingesetzt haben, es sei denn, mit Ihnen wurde ausdrücklich etwas
        anderes vereinbart; in keinem Fall werden Ihnen wegen dieser Rückzahlung Entgelte berechnet.
      </p>

      <h2>Erlöschen des Widerrufsrechts bei digitalen Inhalten</h2>
      <p>
        Das Widerrufsrecht erlischt bei einem Vertrag über die Bereitstellung nicht auf einem körperlichen Datenträger
        befindlicher digitaler Inhalte (hier: Download der Skill-Pakete) gemäß § 356 Abs. 5 BGB, wenn wir mit der
        Ausführung des Vertrags begonnen haben, nachdem Sie
      </p>
      <ul>
        <li>ausdrücklich zugestimmt haben, dass wir mit der Ausführung des Vertrags vor Ablauf der Widerrufsfrist beginnen,</li>
        <li>
          Ihre Kenntnis davon bestätigt haben, dass Sie durch Ihre Zustimmung mit Beginn der Ausführung des Vertrags
          Ihr Widerrufsrecht verlieren, und
        </li>
        <li>wir Ihnen eine Bestätigung des Vertrags auf einem dauerhaften Datenträger (z. B. per E-Mail) zur Verfügung gestellt haben.</li>
      </ul>
      <p>
        Diese Zustimmung und Kenntnisnahme erfolgen im Bestellvorgang vor der Bereitstellung des Downloads.
      </p>

      <h2>Muster-Widerrufsformular</h2>
      <p>Wenn Sie den Vertrag widerrufen wollen, dann füllen Sie bitte dieses Formular aus und senden Sie es zurück:</p>
      <p>
        An:
        <br />
        [ROBERTO: Vor- und Nachname]
        <br />
        [ROBERTO: Straße + Hausnummer]
        <br />
        [ROBERTO: PLZ + Ort], Deutschland
        <br />
        E-Mail: <a href="mailto:kontakt@BRAND-DOMAIN.tld">kontakt@BRAND-DOMAIN.tld</a>
      </p>
      <p>
        Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über den Kauf der folgenden Waren
        (*) / die Erbringung der folgenden Dienstleistung (*):
        <br />
        ____________________________________________
        <br />
        <br />
        Bestellt am (*) / erhalten am (*): ____________________
        <br />
        Name des/der Verbraucher(s): ____________________
        <br />
        Anschrift des/der Verbraucher(s): ____________________
        <br />
        Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf Papier): ____________________
        <br />
        Datum: ____________________
      </p>
      <p>(*) Unzutreffendes streichen.</p>

      <p className="buy-note">Entwurf — vor Veröffentlichung juristisch prüfen lassen.</p>
    </main>
  );
}
