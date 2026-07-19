#!/bin/bash
# ============================================================================
# move_verified_parallel.sh — PARALLELE verifizierte Migration SSD -> NAS
# Additive Erweiterung von move_verified_ssd_to_nas.sh:
#   * PARALLELE Kopie: N rsync-Worker gleichzeitig (Top-Level-Aufteilung)
#   * PARALLELE Verifikation: SHA-256 ueber viele Kerne (Hauptnutzen 14-Core)
#   * LIVE-STATUS: ~/nas_migration_status.json + selbst-refreshendes Dashboard
#   * LOESCHEN: nur 'delete-verified' -> PAPIERKORB (osascript), NIE rm, NIE auto
#
# EISERNE REGEL: NICHTS hart loeschen (kein rm). Entfernt wird
# AUSSCHLIESSLICH in den Papierkorb und NUR bit-genau verifizierte Dateien,
# mit Re-Check unmittelbar vor jeder Entfernung. Lauf ist idempotent/resumierbar.
#
#
# Modi:
#   run (default)     Schritt A (PARALLELE Kopie) + Schritt B (PARALLELE Verify)
#   copy              nur PARALLELE Kopie
#   verify            nur PARALLELE Verifikation (SHA-256 SRC vs DST)
#   delete-verified   Schritt C: NUR verifizierte Dateien -> Papierkorb (EXPLIZIT!)
#   status | help
# Optionen: --src P --dst P --workers N --verify-procs P --dry-run
#           --trash-method finder|home --reverify --no-dashboard
# ============================================================================
set -uo pipefail

# ---- Konfiguration ---------------------------------------------------------
SRC_DEFAULT="/Volumes/MyData-SSD"
DST_DEFAULT="/Volumes/MyData-NAS"
SRC="${MV_SRC:-$SRC_DEFAULT}"
DST="${MV_DST:-$DST_DEFAULT}"
WORKERS="${MV_WORKERS:-4}"           # parallele rsync-Kopier-Worker
VERIFY_P="${MV_VERIFY_P:-10}"        # parallele SHA-256-Prozesse
STATUS_INTERVAL="${MV_STATUS_INTERVAL:-4}"
MAKE_DASHBOARD=1

STATE_DIR="${MV_STATE:-$HOME/Library/Application Support/move_verified_parallel}"
RUN_DIR="$STATE_DIR/run"
LOG="${MV_LOG:-$HOME/Library/Logs/move_verified_parallel.log}"
STATUS_JSON="${MV_STATUS_JSON:-$HOME/nas_migration_status.json}"
DASHBOARD="${MV_DASHBOARD:-$HOME/nas_dashboard.html}"
TRASH_METHOD="${MV_TRASH:-finder}"
LOCKDIR="$HOME/Library/Caches/move_verified_parallel.lock"
DRYRUN=0; REVERIFY=0

# System-Rauschen: nie kopieren/verifizieren/loeschen
NOISE_EXCLUDES=(--exclude ".DS_Store" --exclude "._*" --exclude "*.icloud"
  --exclude ".Spotlight-V100" --exclude ".Trashes" --exclude ".fseventsd"
  --exclude ".TemporaryItems" --exclude ".DocumentRevisions-V100")
# Worker-rsync: OHNE progress2 (stoert %l-Parsing), Metadaten erhalten
WBASE=(-a --no-perms --no-owner --no-group --modify-window=2)
# Gate-Test-rsync
TBASE=(-a --no-perms --no-owner --no-group --modify-window=2)
SHACMD="/usr/bin/shasum -a 256"

ts(){ date "+%Y-%m-%d %H:%M:%S"; }
log(){ echo "[$(ts)] $*" >> "$LOG" 2>/dev/null; }
say(){ printf '%s\n' "$*"; }
die(){ log "ABBRUCH: $*"; say "ABBRUCH: $*"; exit 1; }

# ---- GNU-rsync erzwingen ---------------------------------------------------
RSYNC=""
require_gnu_rsync(){
  RSYNC="/opt/homebrew/bin/rsync"; [ -x "$RSYNC" ] || RSYNC="$(command -v rsync 2>/dev/null || true)"
  [ -n "${RSYNC:-}" ] || { die "kein rsync gefunden."; }
  local t; t="$(mktemp -d)"
  if ! "$RSYNC" "${TBASE[@]}" -n "$t/" "$t/" >/dev/null 2>&1; then
    rm -rf "$t"; die "untaugliches rsync ($RSYNC)."
  fi
  rm -rf "$t"
}

# ---- Sicherheits-Gate: SRC & DST muessen VERSCHIEDENE Volumes sein ---------
assert_ready(){
  [ -d "$SRC" ] || die "Quelle nicht gefunden: $SRC"
  [ -d "$DST" ] || die "Ziel (NAS) nicht gemountet: $DST"
  local ds dd; ds="$(stat -f %d "$SRC" 2>/dev/null)"; dd="$(stat -f %d "$DST" 2>/dev/null)"
  [ -n "$ds" ] && [ -n "$dd" ] || die "Konnte Device-IDs nicht ermitteln."
  [ "$SRC" = "$DST" ] && die "SRC == DST."
  [ "$ds" = "$dd" ] && die "SRC und DST auf DEMSELBEN Volume (dev=$ds) — abgelehnt."
  log "Volumes OK: SRC dev=$ds != DST dev=$dd."
}

# ---- Einzelinstanz-Sperre --------------------------------------------------
acquire_lock(){
  if mkdir "$LOCKDIR" 2>/dev/null; then
    trap 'cleanup' EXIT INT TERM; return 0
  fi
  local now mt age; now="$(date +%s)"; mt="$(stat -f %m "$LOCKDIR" 2>/dev/null || echo "$now")"; age=$((now - mt))
  if [ "$age" -gt 43200 ]; then
    rmdir "$LOCKDIR" 2>/dev/null
    if mkdir "$LOCKDIR" 2>/dev/null; then trap 'cleanup' EXIT INT TERM; log "verwaistes Lock uebernommen"; return 0; fi
  fi
  say "Ein Lauf laeuft bereits (Lock $LOCKDIR) — uebersprungen."; return 1
}
cleanup(){
  [ -n "${STATUS_PID:-}" ] && kill "$STATUS_PID" 2>/dev/null
  rmdir "$LOCKDIR" 2>/dev/null
}

# ---- SRC-Dateiliste ohne Rauschen (NUL-getrennt) ---------------------------
find_src(){
  find "$SRC" \
    -type d \( -name ".Spotlight-V100" -o -name ".Trashes" -o -name ".fseventsd" \
               -o -name ".TemporaryItems" -o -name ".DocumentRevisions-V100" \) -prune -o \
    -type f ! -name ".DS_Store" ! -name "._*" ! -name "*.icloud" -print0
}

# ---- Top-Level-Eintraege (Basenames) einsammeln, NUL-sicher ----------------
# Fuellt globale Arrays: ENTRY_DIRS[], HAS_TOPFILES (0/1)
ENTRY_DIRS=(); HAS_TOPFILES=0
collect_entries(){
  ENTRY_DIRS=(); HAS_TOPFILES=0
  local d b
  while IFS= read -r -d '' d; do
    b="${d##*/}"
    case "$b" in
      .Spotlight-V100|.Trashes|.fseventsd|.TemporaryItems|.DocumentRevisions-V100) continue;;
    esac
    ENTRY_DIRS+=("$b")
  done < <(find "$SRC" -mindepth 1 -maxdepth 1 -type d -print0 2>/dev/null)
  # Top-Level-Dateien vorhanden?
  local f
  while IFS= read -r -d '' f; do HAS_TOPFILES=1; break; done < <(
    find "$SRC" -mindepth 1 -maxdepth 1 -type f ! -name ".DS_Store" ! -name "._*" ! -name "*.icloud" -print0 2>/dev/null)
}

# ---- Gesamt-Bytes SRC + Basis-Bytes (bereits am Ziel) im Hintergrund -------
# Nur die von SRC verwalteten Top-Level-Eintraege (schliesst NAS-#recycle aus).
compute_totals(){
  collect_entries
  local sp=() dp=() e
  for e in "${ENTRY_DIRS[@]}"; do sp+=("$SRC/$e"); dp+=("$DST/$e"); done
  [ "$HAS_TOPFILES" = 1 ] && {
    local ff
    while IFS= read -r -d '' ff; do sp+=("$ff"); dp+=("$DST/${ff##*/}"); done < <(
      find "$SRC" -mindepth 1 -maxdepth 1 -type f ! -name ".DS_Store" ! -name "._*" ! -name "*.icloud" -print0 2>/dev/null)
  }
  local sk dk
  sk="$(du -sck "${sp[@]}" 2>/dev/null | tail -1 | awk '{print $1}')"
  echo $(( ${sk:-0} * 1024 )) > "$RUN_DIR/src_total"
  dk="$(du -sck "${dp[@]}" 2>/dev/null | tail -1 | awk '{print $1}')"
  echo $(( ${dk:-0} * 1024 )) > "$RUN_DIR/dst_base"
  # Kandidatenzahl fuer Verify-Fortschritt
  find_src 2>/dev/null | tr -cd '\0' | wc -c | awk '{print $1}' > "$RUN_DIR/verify_total"
  : > "$RUN_DIR/totals_ready"
}

# ---- Ein Worker: arbeitet seine Jobliste sequentiell ab --------------------
# Jobs als Zeilen "DIR:<name>" oder "FILES:." in $1 (Jobdatei). $2 = Worker-ID.
run_worker(){
  local jobfile="$1" id="$2"
  local prog="$RUN_DIR/w$id"
  local bytes=0 job kind name
  printf '%s' "0" > "$prog.bytes"
  printf '%s' "start" > "$prog.job"
  rm -f "$prog.done" 2>/dev/null
  while IFS= read -r job; do
    [ -n "$job" ] || continue
    kind="${job%%:*}"; name="${job#*:}"
    printf '%s' "$name" > "$prog.job"
    if [ "$kind" = DIR ]; then
      "$RSYNC" "${WBASE[@]}" "${NOISE_EXCLUDES[@]}" --out-format='%l' "$SRC/$name/" "$DST/$name/" 2>>"$LOG" \
        | awk -v f="$prog.bytes" -v base="$bytes" \
            '{ if($1 ~ /^[0-9]+$/) s+=$1; if(NR%25==0){printf "%d",base+s>f; close(f)} } END{printf "%d",base+s>f; close(f)}'
    else
      "$RSYNC" "${WBASE[@]}" "${NOISE_EXCLUDES[@]}" -f '- /*/' --out-format='%l' "$SRC/" "$DST/" 2>>"$LOG" \
        | awk -v f="$prog.bytes" -v base="$bytes" \
            '{ if($1 ~ /^[0-9]+$/) s+=$1; if(NR%25==0){printf "%d",base+s>f; close(f)} } END{printf "%d",base+s>f; close(f)}'
    fi
    bytes="$(cat "$prog.bytes" 2>/dev/null || echo "$bytes")"
  done < "$jobfile"
  printf '%s' "$bytes" > "$prog.bytes"
  printf '%s' "fertig" > "$prog.job"
  : > "$prog.done"
}

# ---- Schritt A: PARALLELE Kopie (Launch + Warten) --------------------------
NWORKERS=0
_copy_parallel(){
  collect_entries
  # Jobliste bauen: jede Top-Level-Dir ein Job, plus ein Sammel-Job Top-Dateien
  local jobs=() e
  for e in "${ENTRY_DIRS[@]}"; do jobs+=("DIR:$e"); done
  [ "$HAS_TOPFILES" = 1 ] && jobs+=("FILES:.")
  local njobs=${#jobs[@]}
  [ "$njobs" -gt 0 ] || { log "COPY: keine Jobs (leere Quelle?)"; NWORKERS=0; return 0; }
  local nw="$WORKERS"; [ "$nw" -gt "$njobs" ] && nw="$njobs"
  NWORKERS="$nw"; echo "$nw" > "$RUN_DIR/nworkers"
  # Round-Robin auf nw Jobdateien verteilen
  local i w
  for ((w=0; w<nw; w++)); do : > "$RUN_DIR/jobs.$w"; done
  for ((i=0; i<njobs; i++)); do
    w=$(( i % nw )); printf '%s\n' "${jobs[$i]}" >> "$RUN_DIR/jobs.$w"
  done
  log "=== COPY-PARALLEL START: $njobs Jobs auf $nw Worker (dry=$DRYRUN) ==="
  say "Schritt A — parallele Kopie: $njobs Top-Level-Jobs auf $nw Worker …"
  if [ "$DRYRUN" = 1 ]; then
    say "DRY: keine Kopie ausgefuehrt. Jobs:"; printf '  %s\n' "${jobs[@]}"; return 0
  fi
  : > "$RUN_DIR/worker_pids"
  for ((w=0; w<nw; w++)); do
    run_worker "$RUN_DIR/jobs.$w" "$w" &
    echo "$!" >> "$RUN_DIR/worker_pids"
  done
  # auf alle Worker warten
  local pid rc=0
  while IFS= read -r pid; do wait "$pid" 2>/dev/null || rc=$?; done < "$RUN_DIR/worker_pids"
  log "=== COPY-PARALLEL FERTIG (rc-sammel=$rc) ==="
  say "Schritt A fertig."
  return 0
}

# ---- Verify-Einzelpruefung (fuer xargs-Subshells exportiert) ---------------
verify_one(){
  local f="$1" rel dstf hs hd
  rel="${f#$SRC/}"; dstf="$DST/$rel"
  if [ ! -f "$dstf" ]; then
    printf '%s\t-\tFAIL_MISSING_DST\n' "$rel" >> "$MV_MAN"
    printf '%s\tFEHLT_AM_ZIEL\n' "$rel" >> "$MV_FAILS"; return 0
  fi
  hs="$($SHACMD "$f" 2>/dev/null | awk '{print $1}')"
  hd="$($SHACMD "$dstf" 2>/dev/null | awk '{print $1}')"
  if [ -n "$hs" ] && [ "$hs" = "$hd" ]; then
    printf '%s\t%s\tOK\n' "$rel" "$hs" >> "$MV_MAN"
  else
    printf '%s\t%s\tFAIL_HASH\n' "$rel" "${hs:-?}:${hd:-?}" >> "$MV_MAN"
    printf '%s\tHASH_MISMATCH src=%s dst=%s\n' "$rel" "${hs:-?}" "${hd:-?}" >> "$MV_FAILS"
  fi
}

# ---- Schritt B: PARALLELE SHA-256-Verifikation -----------------------------
_verify_parallel(){
  assert_ready
  mkdir -p "$STATE_DIR"
  local MAN="$STATE_DIR/verified.tsv" FAILS="$STATE_DIR/failed.tsv"
  [ "$REVERIFY" = 1 ] && { : > "$MAN"; : > "$FAILS"; }
  touch "$MAN" "$FAILS"
  export SRC DST SHACMD MV_MAN="$MAN" MV_FAILS="$FAILS"
  export -f verify_one
  log "=== VERIFY-PARALLEL START (P=$VERIFY_P, sha=$SHACMD, dry=$DRYRUN) ==="
  say "Schritt B — parallele SHA-256-Verifikation (P=$VERIFY_P) …"
  if [ "$DRYRUN" = 1 ]; then
    local c; c="$(find_src 2>/dev/null | tr -cd '\0' | wc -c | awk '{print $1}')"
    say "DRY: $c Dateien waeren zu verifizieren."; return 0
  fi
  find_src | xargs -0 -P "$VERIFY_P" -I{} /bin/bash -c 'verify_one "$1"' _ {}
  local ok fail; ok="$(grep -c $'\tOK$' "$MAN" 2>/dev/null )"; fail="$(grep -c $'\tFAIL' "$MAN" 2>/dev/null )"
  log "=== VERIFY-PARALLEL FERTIG: OK=$ok FEHLER=$fail ==="
  say "Schritt B fertig: OK=$ok  FEHLER=$fail  (Manifest: $MAN)"
}

# ---- kleine Helfer fuer Status/Dashboard -----------------------------------
jesc(){ printf '%s' "$1" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g'; }
gb(){ awk -v b="${1:-0}" 'BEGIN{printf "%.1f", b/1073741824}'; }

atomic_write(){ # $1=zielpfad, stdin=inhalt
  local tmp="$1.tmp.$$"; cat > "$tmp"; mv -f "$tmp" "$1"
}

# ---- Status-JSON + Dashboard bei jedem Tick schreiben ----------------------
write_status_and_dashboard(){
  local phase running verify_ok verify_fail verify_total
  phase="$(cat "$RUN_DIR/phase" 2>/dev/null || echo copy)"
  [ "$phase" = done ] && running=false || running=true
  local nw session=0 i b maxb=0
  nw="$(cat "$RUN_DIR/nworkers" 2>/dev/null || echo 0)"
  local pw_json="" pw_html=""
  for ((i=0; i<nw; i++)); do
    b="$(cat "$RUN_DIR/w$i.bytes" 2>/dev/null || echo 0)"; [ -n "$b" ] || b=0
    local jn dn; jn="$(cat "$RUN_DIR/w$i.job" 2>/dev/null || echo '-')"
    if [ -f "$RUN_DIR/w$i.done" ]; then dn=true; else dn=false; fi
    session=$(( session + b )); [ "$b" -gt "$maxb" ] && maxb="$b"
    [ -n "$pw_json" ] && pw_json="$pw_json,"
    pw_json="$pw_json{\"id\":$i,\"job\":\"$(jesc "$jn")\",\"bytes\":$b,\"done\":$dn}"
  done
  # Gesamtwerte
  local src_total dst_base bytes_total bytes_done percent
  src_total="$(cat "$RUN_DIR/src_total" 2>/dev/null || echo 0)"
  dst_base="$(cat "$RUN_DIR/dst_base" 2>/dev/null || echo 0)"
  bytes_total="$src_total"
  bytes_done=$(( dst_base + session ))
  [ "$bytes_total" -gt 0 ] && [ "$bytes_done" -gt "$bytes_total" ] && bytes_done="$bytes_total"
  # Rate/ETA aus Delta (Zustand in Dateien)
  local now prev_b prev_t dt rate eta
  now="$(date +%s)"
  prev_b="$(cat "$RUN_DIR/prev_bytes" 2>/dev/null || echo "$bytes_done")"
  prev_t="$(cat "$RUN_DIR/prev_time" 2>/dev/null || echo "$now")"
  dt=$(( now - prev_t )); [ "$dt" -lt 1 ] && dt=1
  rate="$(awk -v d="$bytes_done" -v p="$prev_b" -v t="$dt" 'BEGIN{r=(d-p)/t; if(r<0)r=0; printf "%.0f", r}')"
  echo "$bytes_done" > "$RUN_DIR/prev_bytes"; echo "$now" > "$RUN_DIR/prev_time"
  if [ "$bytes_total" -gt 0 ] && [ -f "$RUN_DIR/totals_ready" ]; then
    percent="$(awk -v d="$bytes_done" -v t="$bytes_total" 'BEGIN{p=100*d/t; if(p>100)p=100; printf "%.1f", p}')"
  else percent="null"; fi
  if [ -f "$RUN_DIR/totals_ready" ]; then
    eta="$(awk -v t="$bytes_total" -v d="$bytes_done" -v r="$rate" 'BEGIN{ if(r>0 && t>0){e=(t-d)/r; if(e<0)e=0; printf "%.0f", e} else printf "null" }')"
  else eta="null"; fi
  local mbps; mbps="$(awk -v r="$rate" 'BEGIN{printf "%.1f", r/1000000}')"

  # Verify-Zaehler
  local MAN="$STATE_DIR/verified.tsv"
  verify_total="$(cat "$RUN_DIR/verify_total" 2>/dev/null || echo 0)"
  if [ -s "$MAN" ]; then
    verify_ok="$(grep -c $'\tOK$' "$MAN" 2>/dev/null )"
    verify_fail="$(grep -c $'\tFAIL' "$MAN" 2>/dev/null )"
  else verify_ok=0; verify_fail=0; fi
  local updated; updated="$(ts)"

  # ---- status.json (atomar) ----
  atomic_write "$STATUS_JSON" <<JSON
{
  "phase": "$phase",
  "running": $running,
  "bytes_done": $bytes_done,
  "bytes_total": $bytes_total,
  "percent": $percent,
  "agg_MBps": $mbps,
  "eta_seconds": $eta,
  "verified_ok": $verify_ok,
  "verify_total": $verify_total,
  "failed_count": $verify_fail,
  "per_worker": [$pw_json],
  "updated_at": "$updated"
}
JSON

  # ---- Dashboard ----
  [ "$MAKE_DASHBOARD" = 1 ] && render_dashboard \
    "$phase" "$running" "$bytes_done" "$bytes_total" "$percent" "$mbps" "$eta" \
    "$verify_ok" "$verify_fail" "$verify_total" "$maxb" "$nw" "$updated"
}

# ---- Dashboard-HTML rendern (eingebettete Zahlen + meta-refresh) -----------
render_dashboard(){
  local phase="$1" running="$2" bdone="$3" btotal="$4" pct="$5" mbps="$6" eta="$7"
  local vok="$8" vfail="$9" vtotal="${10}" maxb="${11}" nw="${12}" updated="${13}"
  local phlabel badge barpct pctshow donegb totgb etatxt
  case "$phase" in
    copy) phlabel="Kopie läuft";;
    verify) phlabel="Prüfung (SHA-256)";;
    done) phlabel="Fertig";;
    *) phlabel="$phase";;
  esac
  if [ "$running" = false ]; then badge='<span class="b done">● fertig</span>'
  else badge='<span class="b run">● läuft</span>'; fi
  donegb="$(gb "$bdone")"; totgb="$(gb "$btotal")"
  if [ "$pct" = null ]; then barpct="15"; pctshow="kalibriere…"
  else barpct="$pct"; pctshow="${pct}%"; fi
  if [ "$eta" = null ]; then etatxt="—"
  else etatxt="$(awk -v s="$eta" 'BEGIN{h=int(s/3600); m=int((s%3600)/60); printf "%dh %02dmin", h, m}')"; fi
  # verify-Balken
  local vpct=0 vdone=$(( vok + vfail ))
  [ "$vtotal" -gt 0 ] && vpct="$(awk -v d="$vdone" -v t="$vtotal" 'BEGIN{printf "%.0f",100*d/t}')"
  # per-Worker HTML
  local i b jn w maxbb="$maxb" wpct wgb pwhtml=""
  [ "$maxbb" -lt 1 ] && maxbb=1
  for ((i=0; i<nw; i++)); do
    b="$(cat "$RUN_DIR/w$i.bytes" 2>/dev/null || echo 0)"; [ -n "$b" ] || b=0
    jn="$(cat "$RUN_DIR/w$i.job" 2>/dev/null || echo '-')"
    wpct="$(awk -v b="$b" -v m="$maxbb" 'BEGIN{printf "%.0f",100*b/m}')"
    wgb="$(gb "$b")"
    pwhtml="$pwhtml<div class=\"wrow\"><div class=\"wlab\">W$i · <span class=\"j\">$(jesc "$jn")</span></div><div class=\"wbar\"><i style=\"width:${wpct}%\"></i></div><div class=\"wval\">${wgb} GB</div></div>"
  done

  local verifyblock=""
  if [ "$phase" = verify ] || [ "$phase" = done ] || [ "$vdone" -gt 0 ]; then
    verifyblock="<div class=\"card\"><div class=\"ct\">Verifikation (SHA-256, 14 Kerne)</div>
      <div class=\"vbar\"><i style=\"width:${vpct}%\"></i></div>
      <div class=\"vrow\"><span class=\"ok\">✔ OK: $vok</span><span class=\"fail\">✘ Fehler: $vfail</span><span class=\"muted\">von $vtotal</span></div></div>"
  fi
  atomic_write "$DASHBOARD" <<HTML
<!DOCTYPE html><html lang="de"><head><meta charset="utf-8">
<meta http-equiv="refresh" content="5">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>NAS-Migration · Dashboard</title>
<style>
:root{--bg:#0b0f14;--card:#131a22;--line:#22303c;--tx:#e8eef5;--mut:#7d90a3;--acc:#3ea6ff;--ok:#35d07f;--fail:#ff5c5c;--warn:#ffb020}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--tx);font:16px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;padding:28px}
.wrap{max-width:920px;margin:0 auto}
h1{font-size:22px;font-weight:600;margin:0 0 4px;letter-spacing:.2px}
.sub{color:var(--mut);font-size:14px;margin-bottom:22px}
.b{font-size:13px;padding:3px 10px;border-radius:999px;font-weight:600}
.b.run{background:rgba(62,166,255,.15);color:var(--acc)}
.b.done{background:rgba(53,208,127,.15);color:var(--ok)}
.hero{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:26px 28px;margin-bottom:18px}
.phase{font-size:15px;color:var(--mut);margin-bottom:14px;display:flex;justify-content:space-between;align-items:center}
.big{font-size:64px;font-weight:700;line-height:1;letter-spacing:-1px}
.big small{font-size:22px;color:var(--mut);font-weight:500;margin-left:8px}
.pbar{height:26px;background:#0a1017;border:1px solid var(--line);border-radius:999px;overflow:hidden;margin:20px 0 8px}
.pbar>i{display:block;height:100%;background:linear-gradient(90deg,var(--acc),#6fd3ff);border-radius:999px;transition:width .6s ease}
.gbrow{display:flex;justify-content:space-between;color:var(--mut);font-size:14px}
.stats{display:flex;gap:16px;margin-top:22px}
.stat{flex:1;background:#0a1017;border:1px solid var(--line);border-radius:14px;padding:16px}
.stat .k{color:var(--mut);font-size:13px}.stat .v{font-size:26px;font-weight:700;margin-top:4px}
.card{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:20px 22px;margin-bottom:16px}
.ct{font-size:14px;color:var(--mut);margin-bottom:14px;font-weight:600;text-transform:uppercase;letter-spacing:.6px}
.wrow{display:flex;align-items:center;gap:14px;margin:9px 0}
.wlab{width:200px;font-size:14px;color:var(--tx);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.wlab .j{color:var(--mut)}
.wbar{flex:1;height:12px;background:#0a1017;border:1px solid var(--line);border-radius:999px;overflow:hidden}
.wbar>i{display:block;height:100%;background:linear-gradient(90deg,#2b7fd0,var(--acc));transition:width .6s ease}
.wval{width:90px;text-align:right;font-size:13px;color:var(--mut);font-variant-numeric:tabular-nums}
.vbar{height:14px;background:#0a1017;border:1px solid var(--line);border-radius:999px;overflow:hidden;margin-bottom:12px}
.vbar>i{display:block;height:100%;background:linear-gradient(90deg,var(--ok),#7ee9b0);transition:width .6s ease}
.vrow{display:flex;gap:20px;font-size:15px}.vrow .ok{color:var(--ok)}.vrow .fail{color:var(--fail)}.vrow .muted{color:var(--mut)}
.foot{color:var(--mut);font-size:12px;text-align:center;margin-top:20px}
</style></head><body><div class="wrap">
<h1>NAS-Migration · SSD → NAS</h1>
<div class="sub">Quelle (SSD) → Ziel (NAS-Share)</div>
<div class="hero">
  <div class="phase"><span>Phase: <b style="color:var(--tx)">$phlabel</b></span>$badge</div>
  <div class="big">$pctshow</div>
  <div class="pbar"><i style="width:${barpct}%"></i></div>
  <div class="gbrow"><span>$donegb GB kopiert</span><span>von $totgb GB</span></div>
  <div class="stats">
    <div class="stat"><div class="k">Durchsatz (aggregiert)</div><div class="v">$mbps <small style="font-size:14px;color:var(--mut)">MB/s</small></div></div>
    <div class="stat"><div class="k">Verbleibend (ETA)</div><div class="v">$etatxt</div></div>
  </div>
</div>
<div class="card"><div class="ct">Parallele Worker ($nw)</div>$pwhtml</div>
$verifyblock
<div class="foot">Aktualisiert: $updated · Auto-Refresh alle 5 s · erneut öffnen: open ~/nas_dashboard.html</div>
</div></body></html>
HTML
}

# ---- Status-Schreiber-Schleife (Hintergrund) -------------------------------
status_writer(){
  local ph
  while :; do
    write_status_and_dashboard
    ph="$(cat "$RUN_DIR/phase" 2>/dev/null || echo copy)"
    [ "$ph" = done ] && break
    sleep "$STATUS_INTERVAL"
  done
  write_status_and_dashboard
}

# ---- Lauf-Initialisierung ---------------------------------------------------
STATUS_PID=""
init_run(){
  mkdir -p "$RUN_DIR" "$STATE_DIR" "$(dirname "$LOG")" 2>/dev/null
  rm -f "$RUN_DIR"/w*.bytes "$RUN_DIR"/w*.job "$RUN_DIR"/w*.done "$RUN_DIR"/jobs.* 2>/dev/null
  rm -f "$RUN_DIR/prev_bytes" "$RUN_DIR/prev_time" "$RUN_DIR/totals_ready" 2>/dev/null
  echo 0 > "$RUN_DIR/src_total"; echo 0 > "$RUN_DIR/dst_base"; echo 0 > "$RUN_DIR/verify_total"
  echo 0 > "$RUN_DIR/nworkers"
}
start_status(){ status_writer & STATUS_PID=$!; }
stop_status(){ echo done > "$RUN_DIR/phase"; kill "$STATUS_PID" 2>/dev/null; wait "$STATUS_PID" 2>/dev/null; STATUS_PID=""; write_status_and_dashboard; }

# ---- Orchestrierung: run / copy / verify -----------------------------------
do_run(){
  require_gnu_rsync; assert_ready; init_run
  echo copy > "$RUN_DIR/phase"
  compute_totals &
  start_status
  _copy_parallel
  echo verify > "$RUN_DIR/phase"
  _verify_parallel
  stop_status
  say "Lauf fertig. Status: $STATUS_JSON  Dashboard: $DASHBOARD"
}
do_copy(){
  require_gnu_rsync; assert_ready; init_run
  echo copy > "$RUN_DIR/phase"
  compute_totals &
  start_status
  _copy_parallel
  stop_status
  say "Kopie fertig. Dashboard: $DASHBOARD"
}
do_verify(){
  assert_ready; init_run
  echo verify > "$RUN_DIR/phase"
  compute_totals &
  start_status
  _verify_parallel
  stop_status
  say "Verifikation fertig. Manifest: $STATE_DIR/verified.tsv"
}

# ---- Papierkorb-Helfer (NIE rm) --------------------------------------------
trash_file(){
  local f="$1"
  case "$TRASH_METHOD" in
    finder)
      /usr/bin/osascript - "$f" >/dev/null 2>>"$LOG" <<'OSA'
on run argv
  set p to POSIX file (item 1 of argv)
  tell application "Finder" to delete (p as alias)
end run
OSA
      ;;
    home) mkdir -p "$HOME/.Trash"; mv -f "$f" "$HOME/.Trash/" ;;
    *) log "unbekannte TRASH_METHOD=$TRASH_METHOD"; return 2 ;;
  esac
}

# ---- Schritt C: NUR verifizierte Dateien -> PAPIERKORB (EXPLIZIT) -----------
_delete_verified(){
  assert_ready
  local MAN="$STATE_DIR/verified.tsv"
  [ -s "$MAN" ] || die "Kein Verifikations-Manifest ($MAN). Erst 'verify' laufen lassen."
  local nfail; nfail="$(grep -c $'\tFAIL' "$MAN" 2>/dev/null )"
  log "=== DELETE-VERIFIED START (dry=$DRYRUN, trash=$TRASH_METHOD, Fehler im Manifest=$nfail) ==="
  say "Schritt C — Papierkorb NUR fuer SHA-256-verifizierte Dateien (Re-Check vor jeder Entfernung)."
  local moved=0 blocked=0 rel h s f dstf hs hd
  while IFS=$'\t' read -r rel h s; do
    [ "$s" = OK ] || continue
    f="$SRC/$rel"; dstf="$DST/$rel"
    [ -f "$f" ] || continue
    hs="$($SHACMD "$f" 2>/dev/null | awk '{print $1}')"
    hd="$($SHACMD "$dstf" 2>/dev/null | awk '{print $1}')"
    if [ -z "$hd" ] || [ "$hs" != "$h" ] || [ "$hs" != "$hd" ]; then
      log "BLOCK '$rel': Re-Check fehlgeschlagen (manifest=$h src=${hs:-?} dst=${hd:-?}) — NICHT entfernt."
      blocked=$((blocked+1)); continue
    fi
    if [ "$DRYRUN" = 1 ]; then log "DRY: wuerde in Papierkorb: '$f'"; moved=$((moved+1))
    else trash_file "$f" && moved=$((moved+1)) || { log "WARN: Papierkorb fehlgeschlagen: '$f'"; blocked=$((blocked+1)); }; fi
  done < "$MAN"
  log "=== DELETE-VERIFIED FERTIG. Papierkorb=$moved Blockiert=$blocked ==="
  say "Schritt C fertig: in Papierkorb=$moved  blockiert(Sicherheit)=$blocked"
}

# ---- Status (Textausgabe) --------------------------------------------------
cmd_status(){
  say "== Parallele NAS-Migration — Status =="
  say "SRC: $SRC"; say "DST: $DST"
  if [ -d "$SRC" ] && [ -d "$DST" ]; then
    local ds dd; ds="$(stat -f %d "$SRC")"; dd="$(stat -f %d "$DST")"
    [ "$ds" != "$dd" ] && say "Volumes: verschieden (dev $ds != $dd) — OK" || say "Volumes: GLEICH — GEFAHR"
  fi
  [ -f "$STATUS_JSON" ] && { say "Letzter Status ($STATUS_JSON):"; cat "$STATUS_JSON"; }
  local MAN="$STATE_DIR/verified.tsv"
  if [ -s "$MAN" ]; then
    local ok fa; ok="$(grep -c $'\tOK$' "$MAN")"; fa="$(grep -c $'\tFAIL' "$MAN")"
    say "Manifest: OK=$ok FEHLER=$fa ($MAN)"
  fi
  say "Dashboard: $DASHBOARD"
}

usage(){ cat <<U
move_verified_parallel.sh — PARALLELE verifizierte Migration SSD -> NAS
  run              PARALLELE Kopie + PARALLELE SHA-256-Verifikation [Default]
  copy             nur PARALLELE Kopie
  verify           nur PARALLELE Verifikation
  delete-verified  Schritt C: nur verifizierte Dateien -> PAPIERKORB (EXPLIZIT)
  status | help
Optionen: --src P --dst P --workers N --verify-procs P --dry-run
          --trash-method finder|home --reverify --no-dashboard
  Default SRC: $SRC_DEFAULT   DST: $DST_DEFAULT
  Worker (Kopie): $WORKERS   Verify-Prozesse: $VERIFY_P
  Status-JSON: $STATUS_JSON   Dashboard: $DASHBOARD
  Eiserne Regel: nie hart loeschen; entfernt wird nur verifiziert & nur in den Papierkorb.
U
}

# ---- Argumente -------------------------------------------------------------
CMD="run"
case "${1:-run}" in
  run|copy|verify|delete-verified|status|help|-h|--help) CMD="${1:-run}"; shift || true ;;
  --*) CMD="run" ;;
  *) [ -n "${1:-}" ] && { say "Unbekanntes Kommando: $1"; usage; exit 64; } ;;
esac
while [ $# -gt 0 ]; do
  case "$1" in
    --src) SRC="$2"; shift 2 ;;
    --dst) DST="$2"; shift 2 ;;
    --workers) WORKERS="$2"; shift 2 ;;
    --verify-procs) VERIFY_P="$2"; shift 2 ;;
    --dry-run|-n) DRYRUN=1; shift ;;
    --reverify) REVERIFY=1; shift ;;
    --trash-method) TRASH_METHOD="$2"; shift 2 ;;
    --no-dashboard) MAKE_DASHBOARD=0; shift ;;
    *) say "Unbekannte Option: $1"; exit 64 ;;
  esac
done

mkdir -p "$(dirname "$LOG")" "$STATE_DIR" "$RUN_DIR" 2>/dev/null

case "$CMD" in
  run)              acquire_lock || exit 0; do_run ;;
  copy)             acquire_lock || exit 0; do_copy ;;
  verify)           acquire_lock || exit 0; do_verify ;;
  delete-verified)  acquire_lock || exit 0; _delete_verified ;;
  status)           cmd_status ;;
  help|-h|--help)   usage ;;
  *) usage; exit 64 ;;
esac
