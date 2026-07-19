#!/bin/bash
# ============================================================================
# move_verified_ssd_to_nas.sh — Verifizierte Migration SSD -> NAS
# Kopieren -> SHA-256-Verifikation -> (nur explizit) Quelle in den PAPIERKORB.
#
# EISERNE REGEL: NICHTS hart löschen (kein rm). Entfernt wird
# AUSSCHLIESSLICH in den Papierkorb und NUR, was zuvor per Prüfsumme bit-genau
# am Ziel verifiziert wurde. Die Lösch-Phase läuft NIE automatisch — nur im
# expliziten Modus 'delete-verified'. Ohne dieses Kommando wird nichts entfernt.
#
# Stil/Vorlage: nas_icloud_sync_v2_echo-fix.sh (GNU-rsync-Zwang, Lock, Log).
#
# Modi:
#   run (default)      Schritt A (Kopie) + Schritt B (Verifikation). KEIN Löschen.
#   copy               nur Schritt A (rsync -a --info=progress2, Metadaten erhalten)
#   verify             nur Schritt B (SHA-256 SRC vs DST, Manifest, OK/FEHLER)
#   delete-verified    Schritt C: NUR verifizierte Dateien -> Papierkorb (EXPLIZIT!)
#   status | selftest | help
# Optionen: --src PFAD  --dst PFAD  --dry-run  --trash-method finder|home  --reverify
# ============================================================================
set -uo pipefail

# ---- Konfiguration (per Umgebungsvariable / Flags überschreibbar) ----------
SRC_DEFAULT="/Volumes/MyData-SSD"        # externe SSD (Beispiel)
DST_DEFAULT="/Volumes/MyData-NAS"      # NAS-Share (SMB, Beispiel)
SRC="${MV_SRC:-$SRC_DEFAULT}"
DST="${MV_DST:-$DST_DEFAULT}"
STATE_DIR="${MV_STATE:-$HOME/Library/Application Support/move_verified_ssd_to_nas}"
LOG="${MV_LOG:-$HOME/Library/Logs/move_verified_ssd_to_nas.log}"
TRASH_METHOD="${MV_TRASH:-finder}"       # finder = AppleScript "move to trash" (Put-Back); home = mv nach ~/.Trash
DRYRUN=0
REVERIFY=0
LOCKDIR="$HOME/Library/Caches/move_verified_ssd_to_nas.lock"

# System-Rauschen: nie kopieren, nie verifizieren, nie löschen (keine Inhalte)
NOISE_EXCLUDES=(--exclude ".DS_Store" --exclude "._*" --exclude "*.icloud"
  --exclude ".Spotlight-V100" --exclude ".Trashes" --exclude ".fseventsd"
  --exclude ".TemporaryItems" --exclude ".DocumentRevisions-V100")

# rsync: -a Archiv (Metadaten/Zeiten/Symlinks), plus robuste SMB-Flags
BASE=(-a --info=progress2 --no-perms --no-owner --no-group --modify-window=2)

ts(){ date "+%Y-%m-%d %H:%M:%S"; }
log(){ echo "[$(ts)] $*" >> "$LOG" 2>/dev/null; }
say(){ printf '%s\n' "$*"; }
die(){ log "ABBRUCH: $*"; say "ABBRUCH: $*"; exit 1; }

# ---- SHA-256-Werkzeug wählen (coreutils bevorzugt, sonst shasum) -----------
SHA=()
pick_sha(){
  if [ -x /opt/homebrew/bin/sha256sum ]; then SHA=(/opt/homebrew/bin/sha256sum)
  elif command -v sha256sum >/dev/null 2>&1; then SHA=(sha256sum)
  else SHA=(/usr/bin/shasum -a 256); fi
}
sha_of(){ "${SHA[@]}" "$1" 2>/dev/null | awk '{print $1}'; }

# ---- GNU/taugliches rsync erzwingen (openrsync-No-Op-Schutz, Array-Übergabe)
RSYNC=""
require_gnu_rsync(){
  RSYNC="/opt/homebrew/bin/rsync"; [ -x "$RSYNC" ] || RSYNC="$(command -v rsync 2>/dev/null || true)"
  [ -n "${RSYNC:-}" ] || { log "ABBRUCH: kein rsync."; say "ABBRUCH: kein rsync."; return 3; }
  local t; t="$(mktemp -d)"
  if ! "$RSYNC" "${BASE[@]}" -n "$t/" "$t/" >/dev/null 2>&1; then
    rm -rf "$t"; log "ABBRUCH: untaugliches rsync ($RSYNC)."; say "ABBRUCH: untaugliches rsync ($RSYNC)."; return 4
  fi
  rm -rf "$t"; return 0
}

# ---- Sicherheits-Gate: SRC & DST müssen ZWEI VERSCHIEDENE Volumes sein ------
assert_ready(){
  [ -d "$SRC" ] || die "Quelle nicht gefunden: $SRC"
  [ -d "$DST" ] || die "Ziel (NAS) nicht gemountet: $DST — bitte NAS-Share zuerst mounten."
  local ds dd; ds="$(stat -f %d "$SRC" 2>/dev/null)"; dd="$(stat -f %d "$DST" 2>/dev/null)"
  [ -n "$ds" ] && [ -n "$dd" ] || die "Konnte Device-IDs nicht ermitteln."
  [ "$SRC" = "$DST" ] && die "SRC == DST."
  [ "$ds" = "$dd" ] && die "SRC und DST liegen auf DEMSELBEN Volume (dev=$ds) — Migration abgelehnt."
  if ! mount | grep -F " on $DST " | grep -qi smbfs; then
    log "WARN: DST '$DST' ist laut mount kein smbfs — aber verschieden von SRC (dev $ds!=$dd), fahre fort."
  fi
  log "Volumes OK: SRC dev=$ds ('$SRC') != DST dev=$dd ('$DST')."
}

# ---- Einzelinstanz-Sperre (verhindert überlappende Läufe) ------------------
acquire_lock(){
  if mkdir "$LOCKDIR" 2>/dev/null; then
    trap 'rmdir "$LOCKDIR" 2>/dev/null' EXIT INT TERM; return 0
  fi
  local now mt age; now="$(date +%s)"; mt="$(stat -f %m "$LOCKDIR" 2>/dev/null || echo "$now")"; age=$((now - mt))
  if [ "$age" -gt 43200 ]; then   # >12h = verwaistes Lock übernehmen
    rmdir "$LOCKDIR" 2>/dev/null
    if mkdir "$LOCKDIR" 2>/dev/null; then trap 'rmdir "$LOCKDIR" 2>/dev/null' EXIT INT TERM; log "altes Lock (>12h) übernommen"; return 0; fi
  fi
  log "Lauf läuft bereits (Lock $LOCKDIR) — übersprungen."; say "Ein Lauf läuft bereits — übersprungen."; return 1
}

# ---- SRC-Dateiliste ohne System-Rauschen (NUL-getrennt, Leerzeichen-fest) --
find_src(){
  find "$SRC" \
    -type d \( -name ".Spotlight-V100" -o -name ".Trashes" -o -name ".fseventsd" \
               -o -name ".TemporaryItems" -o -name ".DocumentRevisions-V100" \) -prune -o \
    -type f ! -name ".DS_Store" ! -name "._*" ! -name "*.icloud" -print0
}

# ---- Schritt A: Kopie ------------------------------------------------------
_copy(){
  require_gnu_rsync || exit $?
  assert_ready
  local flags=("${BASE[@]}"); [ "$DRYRUN" = 1 ] && flags+=(-n)
  log "=== COPY START (dry=$DRYRUN) SRC='$SRC' -> DST='$DST' rsync=$RSYNC ==="
  say "Schritt A — Kopie '$SRC' -> '$DST' ..."
  "$RSYNC" "${flags[@]}" "${NOISE_EXCLUDES[@]}" "$SRC"/ "$DST"/ 2>&1 | tee -a "$LOG"
  local rc=${PIPESTATUS[0]}
  log "=== COPY FERTIG rc=$rc ==="; say "Schritt A fertig (rc=$rc)."
  return $rc
}

# ---- Schritt B: Verifikation (SHA-256 SRC vs DST) --------------------------
# Manifest verified.tsv:  RELPFAD \t HASH \t OK|FAIL_HASH|FAIL_MISSING_DST
# Idempotent/resumierbar: bereits als OK verzeichnete Dateien werden übersprungen.
_verify(){
  assert_ready; pick_sha
  mkdir -p "$STATE_DIR"
  local MAN="$STATE_DIR/verified.tsv" FAILS="$STATE_DIR/failed.tsv"
  [ "$REVERIFY" = 1 ] && { : > "$MAN"; : > "$FAILS"; }
  touch "$MAN" "$FAILS"
  log "=== VERIFY START (dry=$DRYRUN, sha=${SHA[*]}) ==="
  say "Schritt B — SHA-256-Verifikation (SRC vs DST) …"
  if [ "$DRYRUN" = 1 ]; then
    local n; n="$(find_src | tr -d '\0' | wc -c)"  # nur grobe Info im Dry-Run
    local c; c="$(find_src | grep -zc . 2>/dev/null || echo '?')"
    say "DRY: $c Dateien wären zu verifizieren. Kein Hashing ausgeführt."
    log "=== VERIFY DRY: $c Kandidaten ==="; return 0
  fi
  # bereits verifizierte Rel-Pfade laden (Resume)
  declare -A DONE
  if [ "$REVERIFY" != 1 ] && [ -s "$MAN" ]; then
    while IFS=$'\t' read -r r h s; do [ "$s" = OK ] && DONE["$r"]=1; done < "$MAN"
  fi
  local total=0 ok=0 fail=0 skip=0 rel dstf hs hd f
  while IFS= read -r -d '' f; do
    rel="${f#$SRC/}"; total=$((total+1))
    if [ -n "${DONE[$rel]:-}" ]; then skip=$((skip+1)); continue; fi
    dstf="$DST/$rel"
    if [ ! -f "$dstf" ]; then
      printf '%s\t-\tFAIL_MISSING_DST\n' "$rel" >> "$MAN"
      printf '%s\tFEHLT_AM_ZIEL\n' "$rel" >> "$FAILS"; fail=$((fail+1)); continue
    fi
    hs="$(sha_of "$f")"; hd="$(sha_of "$dstf")"
    if [ -n "$hs" ] && [ "$hs" = "$hd" ]; then
      printf '%s\t%s\tOK\n' "$rel" "$hs" >> "$MAN"; ok=$((ok+1))
    else
      printf '%s\t%s\tFAIL_HASH\n' "$rel" "${hs:-?}:${hd:-?}" >> "$MAN"
      printf '%s\tHASH_MISMATCH src=%s dst=%s\n' "$rel" "${hs:-?}" "${hd:-?}" >> "$FAILS"; fail=$((fail+1))
    fi
    [ $((total % 500)) -eq 0 ] && log "verify: total=$total ok=$ok fail=$fail skip=$skip (…$rel)"
  done < <(find_src)
  log "=== VERIFY FERTIG. total=$total ok=$ok FEHLER=$fail skip=$skip ==="
  say "Schritt B fertig: geprüft=$total  OK=$ok  FEHLER=$fail  übersprungen=$skip"
  say "Manifest: $MAN   Fehlerliste: $FAILS"
  [ "$fail" -eq 0 ]
}

# ---- Papierkorb-Helfer (NIE rm) --------------------------------------------
trash_file(){
  local f="$1"
  case "$TRASH_METHOD" in
    finder)   # AppleScript: korrektes "In den Papierkorb legen" inkl. Zurücklegen
      /usr/bin/osascript - "$f" >/dev/null 2>>"$LOG" <<'OSA'
on run argv
  set p to POSIX file (item 1 of argv)
  tell application "Finder" to delete (p as alias)
end run
OSA
      ;;
    home)     # mv in ~/.Trash (Achtung: SSD->intern = kopieren+löschen, langsam/gross)
      mkdir -p "$HOME/.Trash"; mv -f "$f" "$HOME/.Trash/" ;;
    *) log "unbekannte TRASH_METHOD=$TRASH_METHOD"; return 2 ;;
  esac
}

# ---- Schritt C: NUR verifizierte Dateien -> Papierkorb (EXPLIZIT) ----------
_delete_verified(){
  assert_ready; pick_sha
  local MAN="$STATE_DIR/verified.tsv"
  [ -s "$MAN" ] || die "Kein Verifikations-Manifest ($MAN). Erst 'verify' laufen lassen."
  local nfail; nfail="$(grep -c $'\tFAIL' "$MAN" 2>/dev/null || echo 0)"
  log "=== DELETE-VERIFIED START (dry=$DRYRUN, trash=$TRASH_METHOD). Fehler im Manifest: $nfail ==="
  say "Schritt C — Papierkorb NUR für SHA-256-verifizierte Dateien (Fehlerhafte bleiben unangetastet)."
  local moved=0 blocked=0 rel h s f dstf hs hd
  while IFS=$'\t' read -r rel h s; do
    [ "$s" = OK ] || continue
    f="$SRC/$rel"; dstf="$DST/$rel"
    [ -f "$f" ] || continue   # schon entfernt -> idempotent
    # DOPPELTE ABSICHERUNG vor JEDER Entfernung: erneut bit-genau prüfen
    hs="$(sha_of "$f")"; hd="$(sha_of "$dstf")"
    if [ -z "$hd" ] || [ "$hs" != "$h" ] || [ "$hs" != "$hd" ]; then
      log "BLOCK '$rel': Re-Check fehlgeschlagen (manifest=$h src=${hs:-?} dst=${hd:-?}) — NICHT entfernt."
      blocked=$((blocked+1)); continue
    fi
    if [ "$DRYRUN" = 1 ]; then log "DRY: würde in Papierkorb: '$f'"
    else trash_file "$f" && moved=$((moved+1)) || { log "WARN: Papierkorb fehlgeschlagen: '$f'"; blocked=$((blocked+1)); }; fi
  done < "$MAN"
  log "=== DELETE-VERIFIED FERTIG. Papierkorb=$moved Blockiert=$blocked ==="
  say "Schritt C fertig: in Papierkorb=$moved  blockiert(Sicherheit)=$blocked"
}

# ---- Status ----------------------------------------------------------------
cmd_status(){
  say "== Verifizierte Migration — Status =="
  say "SRC: $SRC"; say "DST: $DST"
  if [ -d "$SRC" ] && [ -d "$DST" ]; then
    local ds dd; ds="$(stat -f %d "$SRC")"; dd="$(stat -f %d "$DST")"
    [ "$ds" != "$dd" ] && say "Volumes: verschieden (dev $ds != $dd) — OK" || say "Volumes: GLEICH — GEFAHR"
  else
    [ -d "$SRC" ] || say "SRC nicht gefunden"; [ -d "$DST" ] || say "DST (NAS) NICHT gemountet"
  fi
  if require_gnu_rsync 2>/dev/null; then say "rsync: $RSYNC ($("$RSYNC" --version 2>&1|head -1))"; else say "rsync: untauglich/keins"; fi
  local MAN="$STATE_DIR/verified.tsv"
  if [ -s "$MAN" ]; then
    local ok fa; ok="$(grep -c $'\tOK$' "$MAN")"; fa="$(grep -c $'\tFAIL' "$MAN")"
    say "Manifest: OK=$ok  FEHLER=$fa  ($MAN)"
  else say "Manifest: noch keins (verify nicht gelaufen)"; fi
  say "Log: $LOG"; say "Letzte Logzeilen:"; tail -4 "$LOG" 2>/dev/null | sed 's/^/  /'
}

# ---- Selbsttest (beweist Kopie+Verifikation+Papierkorb an Wegwerf-Daten) ---
cmd_selftest(){
  say "== Selbsttest =="
  require_gnu_rsync && say "[OK] rsync: $RSYNC" || { say "[FAIL] kein taugliches rsync"; return 1; }
  pick_sha; say "[OK] sha: ${SHA[*]}"
  local A B; A="$(mktemp -d)"; B="$(mktemp -d)"
  printf 'inhalt-123\n' > "$A/probe.txt"; mkdir -p "$A/unter"; printf 'x\n' > "$A/unter/y.txt"
  "$RSYNC" -a "$A"/ "$B"/ >/dev/null 2>&1
  local ha hb; ha="$(sha_of "$A/probe.txt")"; hb="$(sha_of "$B/probe.txt")"
  [ "$ha" = "$hb" ] && say "[OK] Kopie+SHA identisch" || { say "[FAIL] SHA weicht ab"; rm -rf "$A" "$B"; return 1; }
  # Papierkorb-Logik (home-Methode) an Wegwerf-Datei
  local T="$HOME/.Trash"; mkdir -p "$T"
  ( TRASH_METHOD=home; trash_file "$A/probe.txt" ) && [ ! -f "$A/probe.txt" ] \
    && say "[OK] Papierkorb (home) verschiebt" || say "[WARN] Papierkorb-Test unklar"
  rm -rf "$A" "$B"; say "Selbsttest fertig."
}

usage(){ cat <<U
move_verified_ssd_to_nas.sh — verifizierte Migration SSD -> NAS (Papierkorb, nie rm)
  run              Schritt A Kopie + Schritt B Verifikation (KEIN Löschen) [Default]
  copy             nur Kopie (rsync -a --info=progress2)
  verify           nur SHA-256-Verifikation (Manifest, OK/FEHLER)
  delete-verified  Schritt C: nur verifizierte Dateien -> Papierkorb (EXPLIZIT)
  status | selftest | help
Optionen: --src PFAD  --dst PFAD  --dry-run  --trash-method finder|home  --reverify
  Default SRC: $SRC_DEFAULT
  Default DST: $DST_DEFAULT
  Eiserne Regel: nie hart löschen; entfernt wird nur verifiziert & nur in den Papierkorb.
U
}

# ---- Argumente -------------------------------------------------------------
CMD="run"
case "${1:-run}" in
  run|copy|verify|delete-verified|status|selftest|help|-h|--help) CMD="${1:-run}"; shift || true ;;
  --*) CMD="run" ;;
  *) [ -n "${1:-}" ] && { say "Unbekanntes Kommando: $1"; usage; exit 64; } ;;
esac
while [ $# -gt 0 ]; do
  case "$1" in
    --src) SRC="$2"; shift 2 ;;
    --dst) DST="$2"; shift 2 ;;
    --dry-run|-n) DRYRUN=1; shift ;;
    --reverify) REVERIFY=1; shift ;;
    --trash-method) TRASH_METHOD="$2"; shift 2 ;;
    *) say "Unbekannte Option: $1"; exit 64 ;;
  esac
done

mkdir -p "$(dirname "$LOG")" "$STATE_DIR" 2>/dev/null

# ---- Dispatch --------------------------------------------------------------
case "$CMD" in
  run)              acquire_lock || exit 0; _copy && _verify ;;
  copy)             acquire_lock || exit 0; _copy ;;
  verify)           acquire_lock || exit 0; _verify ;;
  delete-verified)  acquire_lock || exit 0; _delete_verified ;;
  status|health)    cmd_status ;;
  selftest|test)    cmd_selftest ;;
  help|-h|--help)   usage ;;
  *) usage; exit 64 ;;
esac
