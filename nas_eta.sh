#!/usr/bin/env bash
# ~/nas_eta.sh - NAS-Kopierfortschritt / ETA (read-only, additiv)
# Liest den rsync-Fortschritt aus dem Live-Log, ohne langsames du ueber SMB.
# Benutzung:  bash ~/nas_eta.sh          (einmalige Ausgabe)
#             bash ~/nas_eta.sh watch    (Dauer-Modus, alle 30 s)

set -u

# ================= KONFIG =================
TOTAL_GB=1319   # Gesamtmenge der Quelle in GB. Fuer 2 TB einfach auf 2000 setzen.
LOG="$HOME/Library/Logs/move_verified_ssd_to_nas.log"
SAMPLE_SEC=20   # Abstand der zwei Messpunkte fuer die eigene Rate
WATCH_SEC=30    # Aktualisierungsintervall im watch-Modus
PROC_MATCH="move_verified_ssd_to_nas|rsync"
# ==========================================

# Letzte progress2-Zeile aus dem Log (CR-getrennt) holen; leer wenn keine da.
_last_line() {
    tail -c 300000 "$LOG" 2>/dev/null \
        | tr '\r' '\n' \
        | grep -E '[0-9]+%' \
        | grep -E '[0-9.]+[kKmMgG]?B/s' \
        | tail -n 1
}

# Kumulierte Bytes aus einer progress2-Zeile (erstes Zahl-mit-Komma-Feld).
_bytes_from() {
    printf '%s' "$1" | grep -oE '[0-9][0-9,]*' | head -n 1 | tr -d ','
}

_proc_state() {
    if pgrep -f "$PROC_MATCH" >/dev/null 2>&1; then echo "laeuft"; else echo "gestoppt"; fi
}

show_once() {
    local total_bytes line b0 b1 pct rate_disp state
    total_bytes=$(awk -v g="$TOTAL_GB" 'BEGIN{printf "%.0f", g*1e9}')
    state=$(_proc_state)

    line=$(_last_line)
    b0=$(_bytes_from "$line")
    pct=$(printf '%s' "$line" | grep -oE '[0-9]+%' | head -n 1 | tr -d '%')
    rate_disp=$(printf '%s' "$line" | grep -oE '[0-9.]+[kKmMgG]?B/s' | head -n 1)

    # Fallback: keine progress2-Zeile im Log verfuegbar -> nicht crashen.
    if [ -z "${b0:-}" ]; then
        echo "Noch kein Fortschrittswert im Log (keine progress2-Zeile). Prozess: $state - Log: $LOG"
        return 0
    fi

    # Zweiter Messpunkt fuer die eigene Rate.
    sleep "$SAMPLE_SEC"
    b1=$(_bytes_from "$(_last_line)")
    [ -z "${b1:-}" ] && b1="$b0"

    awk -v b0="$b0" -v b1="$b1" -v dt="$SAMPLE_SEC" -v tot="$total_bytes" \
        -v totgb="$TOTAL_GB" -v pct="$pct" -v rd="$rate_disp" -v state="$state" 'BEGIN{
        copied_gb = b1/1e9;
        p = (pct=="") ? (b1/tot*100) : pct+0;
        rate = (dt>0) ? (b1-b0)/dt : 0;      # eigene Rate in Bytes/s
        rate_mb = rate/1e6;
        eta = "n/a";
        if (rate > 0) {
            rem = tot - b1; if (rem < 0) rem = 0;
            secs = rem/rate; h = int(secs/3600); m = int((secs-h*3600)/60);
            eta = sprintf("~%d h %d min", h, m);
        }
        if (rate_mb > 0) rl = sprintf("%.1f MB/s", rate_mb);
        else rl = (rd=="") ? "n/a" : rd " (Log)";
        printf "kopiert %.1f GB / %d GB (%.1f %%) - %s - ETA %s - Prozess: %s\n", \
               copied_gb, totgb, p, rl, eta, state;
    }'
}

if [ "${1:-}" = "watch" ]; then
    while true; do
        printf '%s  ' "$(date '+%H:%M:%S')"
        show_once
        sleep "$WATCH_SEC"
    done
else
    show_once
fi
