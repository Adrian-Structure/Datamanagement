# Datamanagement

Verifiziertes Datenmigrations- und Fortschritts-Toolkit für macOS. Kernidee: Daten
von einer lokalen SSD auf ein NAS-Share verschieben, **ohne jemals etwas hart zu
löschen** — kopieren, per SHA-256 bit-genau verifizieren, und die Quelle
ausschließlich in den **Papierkorb** legen (und nur auf ausdrücklichen Befehl).


## Was das Toolkit macht

- **Verifizierter Move SSD → NAS** (`move_verified_ssd_to_nas.sh`)
  Kopie via `rsync -a` (Metadaten/Zeiten erhalten) → SHA-256-Verifikation
  Quelle vs. Ziel → optionale Entfernung der Quelle **in den Papierkorb**.
  Ein Volume-Gate stellt sicher, dass Quelle und Ziel zwei verschiedene
  Volumes sind. GNU-taugliches `rsync` wird erzwungen (Schutz vor No-Op-rsync).
- **Parallele Variante** (`move_verified_parallel.sh`)
  Mehrere `rsync`-Worker gleichzeitig plus SHA-256-Verifikation über viele
  Kerne; schreibt einen Live-Status (`~/nas_migration_status.json`) und
  aktualisiert das Dashboard laufend. Idempotent und resümierbar.
- **Selbst-ETA-Monitor** (`nas_eta.sh`)
  Liest den `rsync`-Fortschritt read-only aus dem Live-Log (ohne langsames
  `du` über SMB), berechnet eigene Rate und ETA. Einmal-Ausgabe oder `watch`.
- **Fortschritts-Dashboard** (`nas_dashboard.html`)
  Selbst-aktualisierende HTML-Ansicht im Windows-Explorer-Stil: Gesamt-
  Fortschrittsbalken, Durchsatz, ETA, Worker-Balken und Verifikations-Status.
- **Kontinuierlicher Auto-Sync NAS ↔ iCloud** (`nas_icloud_sync.sh`)
  Laufender, bidirektionaler Zwei-Wege-Spiegel zwischen einem NAS-Share (SMB)
  und einem iCloud-/Lokalordner, **ohne Löschen** (newer-wins, `-u`). Läuft
  unbeaufsichtigt per LaunchAgent (alle 30 Min + RunAtLoad), weckt eine
  schlafende/heruntergefahrene NAS via SMB bzw. Wake-on-LAN, erzwingt
  GNU-`rsync` und ist pro Top-Level-Eintrag resilient.

## Nutzung

```bash
# Kopie + Verifikation (löscht NICHTS)
bash move_verified_ssd_to_nas.sh run --src "/Volumes/Quelle" --dst "/Volumes/Ziel"

# Nur einzelne Phasen
bash move_verified_ssd_to_nas.sh copy
bash move_verified_ssd_to_nas.sh verify

# Entfernen NUR verifizierter Dateien -> Papierkorb (ausdrücklich!)
bash move_verified_ssd_to_nas.sh delete-verified

# Parallel (N Worker), mit Live-Dashboard
bash move_verified_parallel.sh run --workers 4 --verify-procs 10

# Fortschritt / ETA
bash nas_eta.sh            # einmalige Ausgabe
bash nas_eta.sh watch      # Dauer-Modus

# Dashboard ansehen
open nas_dashboard.html

# Kontinuierlicher Auto-Sync NAS <-> iCloud (bidirektional, löscht NICHTS)
bash nas_icloud_sync.sh run          # einmal jetzt synchronisieren
bash nas_icloud_sync.sh --dry        # Trockenlauf
bash nas_icloud_sync.sh status       # rsync/SRC/DST/Agent/FDA
bash nas_icloud_sync.sh install      # als LaunchAgent einrichten (alle 30 Min)
bash nas_icloud_sync.sh uninstall    # Agent entfernen (Tool/Logs bleiben)
```

Weitere Optionen: `--dry-run`, `--reverify`, `--trash-method finder|home`,
`--no-dashboard`, sowie Modi `status`, `selftest`, `help`.

## Sicherheitsprinzip

- **Nichts wird hart gelöscht.** Es gibt keinen `rm`-Aufruf auf Nutzdaten.
- Entfernt wird **ausschließlich in den Papierkorb** und **nur**, was zuvor per
  SHA-256 bit-genau am Ziel verifiziert wurde.
- Die Lösch-Phase läuft **nie automatisch** — nur im expliziten Modus
  `delete-verified`, mit Re-Check unmittelbar vor jeder Entfernung.
- Volume-Gate: Quelle und Ziel müssen verschiedene Volumes sein.
- Läufe sind idempotent und resümierbar.

## Voraussetzungen

macOS, `bash`, GNU-`rsync` (z. B. via Homebrew), `shasum`/`sha256sum`.
Papierkorb-Entfernung nutzt den Finder (AppleScript, „Zurücklegen" möglich)
oder alternativ `~/.Trash`.

## Kontinuierlicher Auto-Sync vs. verifizierter Move

Zwei bewusst getrennte Werkzeugklassen:

- Die **verifizierten Move-Skripte** (`move_verified_*`) sind ein **einmaliger,
  gerichteter** Vorgang SSD → NAS mit **SHA-256-Verifikation** und optionaler
  Papierkorb-Entfernung der Quelle. Sie werden **von Hand** angestoßen.
- `nas_icloud_sync.sh` ist dagegen ein **dauerhaft laufender, bidirektionaler
  Spiegel** NAS ↔ iCloud, der **automatisch im Hintergrund** synchronisiert
  (LaunchAgent) — ohne Verifikationsphase und ohne jede Löschung von Nutzdaten
  (nur newer-wins). Er hält zwei Ablageorte fortlaufend deckungsgleich, statt
  Daten einmalig umzuziehen.

Konfiguration erfolgt über Variablen am Skriptkopf (`SRC`/`DST`, WoL-Werte) bzw.
über Umgebungsvariablen (`SYNC_SRC`, `SYNC_DST`, `SYNC_SMB`, `SYNC_MAC`, …); die
im Repo hinterlegten Pfade/Adressen sind generische Beispielwerte.

Automatischer Start: `bash nas_icloud_sync.sh install` richtet einen
LaunchAgent ein (alle 30 Min + beim Login). Für den Hintergrundlauf braucht der
ausführende Prozess (bzw. eine optionale Wrapper-App) einmalig **Full Disk
Access**, damit iCloud-Dateien lesbar sind.

---

No license — all rights reserved.

## Alternativen (Standard-Werkzeuge)

Für viele Fälle reichen etablierte Werkzeuge — erst prüfen, bevor man Skripte einsetzt:

- **`rsync -ac`** direkt auf dem NAS (Checksummen-Vergleich eingebaut; auf Synology
  auch ohne SSH über den Aufgabenplaner ausführbar).
- **Synology USB Copy** (Paket-Zentrum) — USB→NAS-Kopien direkt am Gerät.
- **Synology Drive Client / Hyper Backup** — laufende Spiegel und Backups mit GUI.
- **TeraCopy** u.ä. — verifiziertes Kopieren am PC/Mac.

Dieses Toolkit lohnt sich dort, wo diese Werkzeuge nicht hinreichen: Papierkorb-statt-
Löschen-Disziplin, SHA-256-Beweisprotokoll, Fortschritts-Dashboard mit ETA, und der
newer-wins-Zweiwege-Sync mit Wake-on-LAN.
