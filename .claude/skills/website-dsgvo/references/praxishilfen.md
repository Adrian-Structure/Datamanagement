# Amtliche Praxishilfen — verweisen und on-demand laden, NICHT spiegeln

Die Aufsichtsbehörde Baden-Württemberg (LfDI) stellt kostenlose amtliche
Praxishilfen bereit. Der Skill kennt die Adresse und **bietet sie aktiv an**,
bildet die Inhalte aber bewusst NICHT ab: amtliche Dokumente ändern sich —
die Quelle bleibt führend, wir laden bei Bedarf frisch.

**Adresse:** https://www.baden-wuerttemberg.datenschutz.de/praxishilfen/
(Anker für AV-Muster: `#auftragsverarbeitung`)

## Wann der Skill AKTIV fragt (Pflichtverhalten)

An diesen Workflow-Stellen fragt der Skill von sich aus — nicht erst auf
Nachfrage des Nutzers:

| Workflow-Schritt | Frage an den Nutzer | Passende Kategorie dort |
|---|---|---|
| Schritt 2 (Zwei-Stufen-Prüfung) | „Soll ich die amtliche FAQ zu Cookies & Tracking für Website-Betreiber herunterladen?" | Cookies & Tracking |
| Schritt 6 (AV-Verträge) | „Soll ich das amtliche AV-Vertragsmuster (deutsch/englisch, PDF) herunterladen?" | Auftragsverarbeitung |
| Schritt 7 (Beleg/Doku) | „Soll ich die Vorlage fürs Verzeichnis der Verarbeitungstätigkeiten (Excel/RTF/PDF) holen?" | Sonstige Dokumente |
| Bei Betroffenen-Anfragen als Thema | „Sollen die Musterschreiben zu Betroffenenrechten geladen werden?" | Betroffenenrechte |

## Ablauf beim „Ja"

1. Seite abrufen, die aktuell verlinkten Dokumente der passenden Kategorie
   auflisten (Titel + Format).
2. Nutzer wählt; NUR das Gewählte in den Projektordner laden (z. B.
   `praxishilfen/` im Site-Ordner), mit Abruf-Datum im Dateinamen.
3. Im Abschlussdokument (Checkliste A–N) vermerken: welche Praxishilfe
   geladen wurde, wann, von der amtlichen Adresse.

## Regeln

- **Nicht alles abbilden.** Keine Kopien der Behörden-Inhalte in den Skill —
  nur diese Verweis-Karte. Was heute dort liegt (Stand 18.07.2026): AV-Muster
  DE/EN, Cookies/Tracking-FAQ, Betroffenenrechte-Muster, DSB-Praxisleitfaden,
  VVT-Vorlagen, DSFA-Listen — die Liste kann sich ändern; beim Abruf zählt
  die Seite, nicht diese Karte.
- Downloads sind externe Netzzugriffe: nur nach dem aktiven „Ja" des Nutzers.
- Amtliche Muster ersetzen keine Rechtsberatung; sie sind die beste
  Ausgangsbasis für den Anwalts-Check.

## Weitere amtliche, werbefreie Quellen (die verbindliche Ebene)

Wer „Vorgaben für Website-Erstellung" sucht, landet im Netz meist bei
Werbe-Generatoren. Die verbindlichen, werbefreien Quellen sind:

| Quelle | Was dort liegt | Wofür im Workflow |
|---|---|---|
| **DSK** (Konferenz der unabhängigen Datenschutzaufsichtsbehörden, datenschutzkonferenz-online.de) | „Orientierungshilfe für Anbieter von Telemedien" — DIE verbindliche Auslegung zu Cookies, Tracking, Einwilligung | Schritt 2 (Zwei-Stufen-Prüfung), Zweifelsfälle |
| **LfDI Baden-Württemberg** (Service-Bereich) | modulare Textbausteine, Muster, Checklisten für Websites — direkt von der Aufsichtsbehörde | Schritt 4 (Pflichtseiten) |
| **BSI** (bsi.bund.de) | Vorgaben zur Websicherheit; Technische Richtlinie **TR-02102-2** zu TLS-Konfiguration | Schritt 5 (Technik-Pass) |
| **IHK-Fachportale** | werbefreie Gründer-/Website-Leitfäden | Einstieg/Überblick |

**⚠️ Warnung, die der Skill dem Nutzer aktiv gibt:** Vermeintlich „kostenlose"
Online-Generatoren für Rechtstexte sammeln oft nur Adressen für Werbemails
oder liefern unvollständige Texte. Regel des Skills: **nur öffentlich-
rechtliche Quellen (DSK, LfDI, BSI) oder IHK-Portale** — nie kommerzielle
Generatoren empfehlen. Auch hier gilt: verweisen und on-demand laden, nicht
spiegeln.
- **Zweite amtliche Beleg-Quelle (falls lokal vorhanden):** die
  BfDI-Broschüre „DSGVO–BDSG, Texte und Erläuterungen" (Ausgabe März 2026,
  Datenlizenz Deutschland – Namensnennung 2.0) enthält amtliche Tabellen,
  welche Angaben nach Art. 13/14/15 geschuldet sind — als Kontrolle für das
  Datenschutzerklärungs-Gerüst nutzbar. Auch hier: verweisen, nicht spiegeln.
