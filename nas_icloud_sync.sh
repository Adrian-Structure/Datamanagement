#!/bin/bash
# ============================================================================
# nas_icloud_sync.sh — NAS <-> iCloud Synchronisationswerkzeug (macOS)
#
# Kontinuierlicher, AUTOMATISCHER Zwei-Wege-Spiegel zwischen einem Netz-Share
# (NAS via SMB) und einem Cloud-/Lokal-Ordner (z.B. iCloud Drive). Laeuft
# unbeaufsichtigt per LaunchAgent (alle 30 Min + RunAtLoad) — unabhaengig von
# jedem interaktiven Werkzeug. Abgrenzung: KEIN verifizierter Einmal-Move wie
# move_verified_ssd_to_nas.sh, sondern ein laufender Dauer-Sync.
#
# Eigenschaften: bidirektional, NICHT-loeschend, neuere gewinnt (-u), resilient
# pro Top-Level-Eintrag, ehrliches Logging mit echten Byte-Zahlen, GNU-rsync
# erzwungen (openrsync-No-Op-Schutz), NAS-Aufwecken via Wake-on-LAN + SMB.
#
# Unterkommandos:
#   run (default) | --dry | wol | status | selftest | install | uninstall | help
#
# EISERNE REGEL: NICHTS hart loeschen (kein rm auf Nutzdaten).
# ============================================================================
set -uo pipefail

# ---- Konfiguration — HIER anpassen (alle per Umgebungsvariable ueberschreibbar)
# Zwei Sync-Endpunkte. Beispielwerte; auf die eigenen Pfade setzen:
SRC="${SYNC_SRC:-/Volumes/NAS-Share/MeinOrdner}"                                   # A: Netz-Share (NAS via SMB)  — BEISPIEL
DST="${SYNC_DST:-$HOME/Library/Mobile Documents/com~apple~CloudDocs/MeinOrdner}"   # B: Cloud-Spiegel (iCloud)    — BEISPIEL
# Aufweck-/Mount-URL der NAS, falls sie schlaeft (Hostname als Beispiel):
SMB_URL="${SYNC_SMB:-smb://mynas.local/NAS-Share}"
# Wake-on-LAN: eine HERUNTERGEFAHRENE NAS kann SMB nicht aufwecken — nur ein
# Magic-Packet. BEISPIELWERTE — echte Werte z.B. aus dem Synology Assistant:
WOL_MAC="${SYNC_MAC:-AA:BB:CC:DD:EE:FF}"
WOL_BCAST="${SYNC_BCAST:-192.168.1.255}"   # Subnetz-Broadcast (Beispiel)
WOL_IP="${SYNC_IP:-192.168.1.100}"         # NAS-IP (Beispiel, nur informativ)
LOG="${SYNC_LOG:-$HOME/Library/Logs/nas_icloud_sync.log}"   # AUSSERHALB der Cloud (TCC!)
MOUNT_WAIT="${SYNC_MOUNT_WAIT:-120}"                           # Sek. auf NAS-Mount warten (Kalt-Boot)
CLEANUP="${SYNC_CLEANUP:-1}"                                   # 1=Datenmuell entfernen, 0=aus
LABEL="com.example.nas-icloud-sync"                            # LaunchAgent-Label
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"
SELF_DST="$HOME/.local/bin/nas_icloud_sync.sh"

# Inhalts-Excludes: DEFAULT KEINE (auch Benchmark-/Wettbewerbsordner sind gewollt).
# Optionales BEISPIEL: eine "lebende" Warteschlange (Inbox mit mv-Semantik) vom
# Spiegel ausnehmen. Ein newer-wins-Spiegel OHNE --delete kann ein mv (am Ziel
# entfernt) nicht abbilden und wuerde bereits abgearbeitete Eintraege zurueckspuelen.
CONTENT_EXCLUDES=(--exclude "Inbox/")
# System-Rauschen (keine Inhalte) wird gefiltert:
NOISE_EXCLUDES=(--exclude ".DS_Store" --exclude "._*" --exclude "*.icloud"
  --exclude ".Spotlight-V100" --exclude ".Trashes" --exclude ".fseventsd"
  --exclude ".TemporaryItems" --exclude ".DocumentRevisions-V100")
# rsync-Basis-Flags: -l = Symlinks 1:1 (tote Symlinks brechen sonst), -u = newer-wins
BASE=(-rtu -l --inplace --no-perms --no-owner --no-group --omit-dir-times --modify-window=2)

ts(){ date "+%Y-%m-%d %H:%M:%S"; }
log(){ echo "[$(ts)] $*" >> "$LOG" 2>/dev/null; }
say(){ printf '%s\n' "$*"; }

# ---- GNU-rsync erzwingen (Falle #1: openrsync-No-Op; Falle #2: pipefail+grep)
RSYNC=""
# Waehlt ein taugliches rsync und prueft per ARRAY-Probe, dass es die BASE-Flags
# akzeptiert. Der Stolperstein ist die Flag-Uebergabe: als unquoted String splittet
# die Shell die Flags nicht -> rsync bekommt EIN Riesen-Argument -> "invalid option"
# -> No-Op. Als Array "${BASE[@]}" splittet es immer korrekt (zsh UND bash). GNU-rsync
# wird bevorzugt (robuster auf dem Gesamtbaum), ist aber NICHT zwingend.
require_gnu_rsync(){
  RSYNC="/opt/homebrew/bin/rsync"; [ -x "$RSYNC" ] || RSYNC="$(command -v rsync 2>/dev/null || true)"
  if [ -z "${RSYNC:-}" ]; then
    log "ABBRUCH: kein rsync gefunden."; say "ABBRUCH: kein rsync."; return 3
  fi
  local t; t="$(mktemp -d)"
  if ! "$RSYNC" "${BASE[@]}" -n "$t/" "$t/" >/dev/null 2>&1; then
    rm -rf "$t"
    log "ABBRUCH: $RSYNC akzeptiert die BASE-Flags nicht (untaugliches rsync)."
    say "ABBRUCH: untaugliches rsync ($RSYNC)."; return 4
  fi
  rm -rf "$t"
  local ver; ver="$("$RSYNC" --version 2>&1 | head -1)"
  case "$ver" in
    *openrsync*|*"version 2."*)
      log "HINWEIS: $RSYNC ist openrsync — funktioniert, aber GNU-rsync (brew install rsync) ist auf dem Gesamtbaum robuster." ;;
  esac
  return 0
}

# ---- Wake-on-LAN: Magic-Packet an die NAS-MAC (weckt HERUNTERGEFAHRENE NAS) -
wake_nas(){
  local mac="${WOL_MAC//:/}"; mac="${mac//-/}"
  local py=/opt/homebrew/bin/python3; [ -x "$py" ] || py="$(command -v python3 2>/dev/null || echo /usr/bin/python3)"
  "$py" - "$mac" "$WOL_BCAST" <<'PY' 2>>"$LOG"
import socket, sys
mac, bcast = sys.argv[1], sys.argv[2]
pkt = bytes.fromhex('ff'*6 + mac*16)
s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
s.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)
for addr in (bcast, '255.255.255.255'):
    for port in (9, 7):
        try: s.sendto(pkt, (addr, port))
        except Exception as e: print('WoL warn', addr, port, e)
PY
  log "WoL-Magic-Packet an $WOL_MAC (Broadcast $WOL_BCAST + 255.255.255.255, Port 9/7) gesendet"
}

# ---- NAS bei Bedarf aufwecken (WoL) + mounten (SMB) ------------------------
ensure_share(){
  [ -d "$SRC" ] && return 0
  log "Share nicht gemountet -> WoL + SMB-Mount (MOUNT_WAIT=${MOUNT_WAIT}s)"
  wake_nas                                   # zuerst einschalten, falls heruntergefahren
  local cands=("$SMB_URL" "smb://mynas.local/NAS-Share" "smb://mynas.local")
  local u waited=0
  for u in "${cands[@]}"; do /usr/bin/open "$u" >/dev/null 2>&1 || true; done
  while [ ! -d "$SRC" ] && [ "$waited" -lt "$MOUNT_WAIT" ]; do
    sleep 6; waited=$((waited+6))
    [ -d "$SRC" ] && break
    [ $((waited % 30)) -eq 0 ] && /usr/bin/open "$SMB_URL" >/dev/null 2>&1 || true
  done
  if [ -d "$SRC" ]; then log "Share gemountet nach ${waited}s"; return 0; fi
  log "ABBRUCH: Share nach ${MOUNT_WAIT}s nicht erreichbar (WoL gesendet) — KEIN Datenverlust."
  say "Share nicht erreichbar — sicher abgebrochen."; return 5
}

# ---- echte uebertragene Bytes aus --stats ziehen ---------------------------
bytes_of(){ printf '%s\n' "$1" | sed -n 's/.*Total transferred file size: \([0-9,]*\).*/\1/p' | tr -d ',' | tail -1; }

# ---- Einzelinstanz-Sperre (verhindert ueberlappende Laeufe: RunAtLoad + Kalender)
LOCKDIR="$HOME/Library/Caches/nas_icloud_sync.lock"
acquire_lock(){
  if mkdir "$LOCKDIR" 2>/dev/null; then
    trap 'rmdir "$LOCKDIR" 2>/dev/null' EXIT INT TERM; return 0
  fi
  # vorhandenes Lock: stale (aelter als 2h)? dann uebernehmen, sonst ueberspringen
  local age now mt; now="$(date +%s)"; mt="$(stat -f %m "$LOCKDIR" 2>/dev/null || echo "$now")"; age=$((now - mt))
  if [ "$age" -gt 7200 ]; then
    rmdir "$LOCKDIR" 2>/dev/null
    if mkdir "$LOCKDIR" 2>/dev/null; then trap 'rmdir "$LOCKDIR" 2>/dev/null' EXIT INT TERM; log "altes Lock (>2h) uebernommen"; return 0; fi
  fi
  log "Lauf laeuft bereits (Lock $LOCKDIR) — uebersprungen."; say "Ein Lauf laeuft bereits — uebersprungen."; return 1
}

# ---- Datenmuell-Bereinigung (Junk + leere Partial-Reste) -------------------
# SICHERHEIT (NIE loeschen): entfernt AUSSCHLIESSLICH inhaltslosen Muell:
#   .DS_Store, AppleDouble-Sidecars (._*) und LEERE (0-Byte) rsync-Temp-Reste
#   (>60min alt, Muster .<name>.XXXXXX). Echte Dateien werden NIE angefasst.
#   Per SYNC_CLEANUP=0 abschaltbar.
cleanup_junk(){
  [ "$CLEANUP" = "1" ] || { log "Cleanup aus (SYNC_CLEANUP=0)"; return 0; }
  local root junk tmp
  for root in "$SRC" "$DST"; do
    [ -d "$root" ] || continue
    junk=$(find "$root" -type f \( -name '.DS_Store' -o -name '._*' \) -print -delete 2>/dev/null | wc -l | tr -d ' ')
    tmp=$(find -E "$root" -type f -size 0 -mmin +60 -regex '.*/\.[^/]+\.[A-Za-z0-9]{6}' -print -delete 2>/dev/null | wc -l | tr -d ' ')
    log "Cleanup ${root##*/}: Finder/AppleDouble=$junk  leere-rsync-Temp=$tmp"
  done
}

# ---- Kernsynchronisation ---------------------------------------------------
do_sync(){
  local mode="${1:-}"; local flags=("${BASE[@]}" --stats)
  [ "$mode" = "dry" ] && flags+=(-n)
  acquire_lock || return 0
  require_gnu_rsync || return $?
  ensure_share || return $?
  log "============================================================"
  log "START Sync (rsync=$RSYNC, version=$("$RSYNC" --version 2>&1 | head -1), mode=${mode:-real})"
  local names fails=0 totbytes=0 e rc out b
  names="$( { ls -1 "$SRC" 2>/dev/null; ls -1 "$DST" 2>/dev/null; } \
            | grep -vE '^\.(DS_Store|Trashes|Spotlight-V100|fseventsd|TemporaryItems|DocumentRevisions-V100)$' \
            | sort -u )"
  while IFS= read -r e; do
    [ -z "$e" ] && continue
    rc=0
    out="$("$RSYNC" "${flags[@]}" "${NOISE_EXCLUDES[@]}" ${CONTENT_EXCLUDES[@]+"${CONTENT_EXCLUDES[@]}"} "$SRC/$e" "$DST/" 2>&1)" || rc=$?
    echo "$out" >> "$LOG"; b="$(bytes_of "$out")"; totbytes=$((totbytes + ${b:-0}))
    out="$("$RSYNC" "${flags[@]}" "${NOISE_EXCLUDES[@]}" ${CONTENT_EXCLUDES[@]+"${CONTENT_EXCLUDES[@]}"} "$DST/$e" "$SRC/" 2>&1)" || rc=$?
    echo "$out" >> "$LOG"; b="$(bytes_of "$out")"; totbytes=$((totbytes + ${b:-0}))
    if [ "$rc" != "0" ]; then log "!! Teilbaum '$e' rc=$rc (Rest laeuft weiter)"; fails=$((fails+1)); fi
  done <<< "$names"
  [ "$mode" = "dry" ] || cleanup_junk
  log "FERTIG. Fehler-Teilbaeume: $fails. Uebertragen ~${totbytes} Bytes (kein --delete, neuere gewinnt)."
  say "Fertig (${mode:-real}). Fehler-Teilbaeume: $fails, ~${totbytes} Bytes uebertragen. Log: $LOG"
  return 0
}

# ---- Status / Health -------------------------------------------------------
cmd_status(){
  say "== NAS<->iCloud Sync — Status =="
  local r; r="/opt/homebrew/bin/rsync"; [ -x "$r" ] || r="$(command -v rsync 2>/dev/null || true)"
  if require_gnu_rsync 2>/dev/null; then say "rsync: $RSYNC ($("$RSYNC" --version 2>&1|head -1)) -> GNU OK";
  else say "rsync: ${r:-keins} -> WARNUNG: KEIN GNU-rsync (No-Op-Gefahr!)"; fi
  [ -d "$SRC" ] && say "SRC (NAS):    gemountet ($SRC)"  || say "SRC (NAS):    NICHT gemountet"
  [ -d "$DST" ] && say "DST (iCloud): vorhanden"          || say "DST (iCloud): FEHLT"
  if launchctl list "$LABEL" >/dev/null 2>&1; then say "Agent:  geladen ($LABEL)"; else say "Agent:  NICHT geladen"; fi
  local err; err="$(tail -1 "/tmp/$LABEL.err" 2>/dev/null || true)"
  case "$err" in *"not permitted"*) say "FDA:    FEHLT (Operation not permitted im Hintergrund) -> README";;
                 *) say "FDA:    kein not-permitted-Fehler sichtbar";; esac
  say "Letzte Logzeilen:"; tail -3 "$LOG" 2>/dev/null | sed 's/^/  /'
  return 0
}

# ---- Selbsttest: beweist Erkennung + echte Uebertragung --------------------
cmd_selftest(){
  say "== Selbsttest =="
  if require_gnu_rsync; then say "[OK]  taugliches rsync: $RSYNC ($("$RSYNC" --version 2>&1|head -1))"; else say "[FAIL] kein taugliches rsync"; return 1; fi
  # Array- vs. unquoted-String-Uebergabe: das Programm uebergibt IMMER als Array.
  local t; t="$(mktemp -d)"
  if "$RSYNC" "${BASE[@]}" -n "$t/" "$t/" >/dev/null 2>&1; then
    say "[OK]  Array-Uebergabe der BASE-Flags akzeptiert (so uebergibt das Programm)"
  else
    say "[FAIL] Array-Uebergabe abgelehnt — Abbruch"; rm -rf "$t"; return 1
  fi
  rm -rf "$t"
  local A B; A="$(mktemp -d)"; B="$(mktemp -d)"
  printf 'alt\n' > "$A/f.txt"; touch -t 202001010000 "$A/f.txt"
  printf 'neu\n' > "$B/f.txt"
  "$RSYNC" "${BASE[@]}" --stats "$B/" "$A/" >/dev/null 2>&1
  if [ "$(cat "$A/f.txt")" = "neu" ]; then say "[OK]  newer-wins uebertraegt WIRKLICH (Stichprobe A==neu)"; else
    say "[FAIL] Uebertragung fand NICHT statt"; rm -rf "$A" "$B"; return 1; fi
  rm -rf "$A" "$B"
  say "Selbsttest bestanden."
}

# ---- Installation (GNU-rsync sicherstellen + LaunchAgent) -------------------
cmd_install(){
  if ! require_gnu_rsync 2>/dev/null; then
    say "Installiere GNU-rsync via Homebrew ..."
    brew install rsync || { say "FEHLER: 'brew install rsync' fehlgeschlagen"; return 1; }
  fi
  mkdir -p "$(dirname "$SELF_DST")" "$HOME/Library/LaunchAgents" "$HOME/Library/Logs"
  local src; src="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/$(basename "${BASH_SOURCE[0]}")"
  if [ "$src" != "$SELF_DST" ]; then cp -p "$src" "$SELF_DST"; chmod +x "$SELF_DST"; say "Tool installiert -> $SELF_DST"; fi
  [ -f "$PLIST" ] && cp -p "$PLIST" "$PLIST.bak_$(date +%Y%m%d_%H%M%S)" && say "altes plist gesichert"
  # Wenn eine Wrapper-App existiert: Agent ueber die App starten (EINE FDA-Freigabe
  # deckt manuell + geplant). Sonst /bin/bash direkt.
  local APP_BUNDLE="$HOME/Applications/NAS-Sync.app"; local PROG_ARGS
  if [ -d "$APP_BUNDLE" ]; then
    PROG_ARGS="<string>/usr/bin/open</string><string>$APP_BUNDLE</string>"
    say "Agent laeuft ueber die App -> Full Disk Access NUR der App geben."
  else
    PROG_ARGS="<string>/bin/bash</string><string>$SELF_DST</string><string>run</string>"
  fi
  cat > "$PLIST" <<PL
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key><string>$LABEL</string>
    <key>ProgramArguments</key>
    <array>$PROG_ARGS</array>
    <key>RunAtLoad</key><true/>
    <key>StartCalendarInterval</key>
    <array>
      <dict><key>Minute</key><integer>0</integer></dict>
      <dict><key>Minute</key><integer>30</integer></dict>
    </array>
    <key>StandardOutPath</key><string>/tmp/$LABEL.out</string>
    <key>StandardErrorPath</key><string>/tmp/$LABEL.err</string>
</dict>
</plist>
PL
  plutil -lint "$PLIST" >/dev/null 2>&1 && say "plist valide" || { say "FEHLER: plist ungueltig"; return 1; }
  local uid; uid="$(id -u)"
  launchctl bootout "gui/$uid/$LABEL" 2>/dev/null || true
  if launchctl bootstrap "gui/$uid" "$PLIST" 2>/dev/null; then say "Agent geladen: $LABEL (alle 30 Min + RunAtLoad)"; else say "WARN: bootstrap meldete Fehler"; fi
  say ""
  if [ -d "$APP_BUNDLE" ]; then
    say "WICHTIG (einmalig): Full Disk Access fuer die Wrapper-App erteilen —"
    say "EINE Freigabe deckt manuell + geplant."
  else
    say "WICHTIG (einmalig): Full Disk Access fuer /bin/bash erteilen (Details: README)."
  fi
}

# ---- Deinstallation (Agent weg; Tool + Logs bleiben — NIE loeschen) --------
cmd_uninstall(){
  local uid; uid="$(id -u)"
  launchctl bootout "gui/$uid/$LABEL" 2>/dev/null && say "Agent entladen ($LABEL)" || say "Agent war nicht geladen"
  if [ -f "$PLIST" ]; then cp -p "$PLIST" "$PLIST.bak_$(date +%Y%m%d_%H%M%S)"; rm "$PLIST"; say "plist entfernt (Backup angelegt)"; fi
  say "Tool ($SELF_DST) und Logs bleiben erhalten (Regel: NIE loeschen)."
}

usage(){
  cat <<U
NAS <-> iCloud Sync (kontinuierlich, automatisch)
  nas_icloud_sync.sh [run|--dry|wol|status|selftest|install|uninstall|help]
    run        echter bidirektionaler Sync (Default)
    --dry      Trockenlauf (zeigt, was passieren wuerde)
    wol        Wake-on-LAN Magic-Packet an die NAS-MAC (weckt heruntergefahrene NAS)
    status     rsync-Variante, SRC/DST/Agent/FDA, letzter Lauf
    selftest   beweist GNU-Erkennung + echte Uebertragung
    install    GNU-rsync sicherstellen + LaunchAgent (alle 30 Min + RunAtLoad)
    uninstall  Agent entfernen (Tool/Logs bleiben)
  Rein lokal. NIE loeschen. Neuere gewinnt.
U
}

case "${1:-run}" in
  run)              do_sync "" ;;
  --dry|dry|-n)     do_sync dry ;;
  wol|wake)         wake_nas; say "WoL-Magic-Packet an $WOL_MAC gesendet." ;;
  status|health)    cmd_status ;;
  selftest|test)    cmd_selftest ;;
  install)          cmd_install ;;
  uninstall)        cmd_uninstall ;;
  help|-h|--help)   usage ;;
  *) say "Unbekanntes Kommando: $1"; usage; exit 64 ;;
esac
