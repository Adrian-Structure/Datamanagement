#!/bin/zsh
# start-cockpit.command — Doppelklick-Starter für das website-dsgvo-Cockpit.
# Startet den lokalen Prüfserver (scripts/pruefserver.js) und öffnet das
# Cockpit im Browser. Rein lokal (127.0.0.1), keine Cloud, keine Dritten.
# Fenster schließen / Ctrl+C beendet den Server.

DIR="${0:A:h}"

# Node finden (Doppelklick-Terminals haben oft kein Homebrew-PATH)
NODE="$(command -v node)"
[[ -z "$NODE" && -x /opt/homebrew/bin/node ]] && NODE=/opt/homebrew/bin/node
[[ -z "$NODE" && -x /usr/local/bin/node    ]] && NODE=/usr/local/bin/node

if [[ -z "$NODE" ]]; then
  echo ""
  echo "  Node.js wurde auf diesem Mac nicht gefunden."
  echo "  Bitte einmalig von https://nodejs.org installieren (LTS reicht),"
  echo "  dann diese Datei erneut doppelklicken."
  echo ""
  open "https://nodejs.org"
  read -s -k '?Taste drücken zum Schließen…'
  exit 1
fi

LOG="$(mktemp -t dsgvo-cockpit.log)"
echo "Starte Prüfserver… (Node: $NODE)"
"$NODE" "$DIR/scripts/pruefserver.js" 2>&1 | tee "$LOG" &
PIPE_PID=$!

sleep 1
URL="$(grep -o 'http://127\.0\.0\.1:[0-9]*/wizard\.html' "$LOG" | head -1)"
open "${URL:-http://127.0.0.1:8483/wizard.html}"

echo ""
echo "  Cockpit: ${URL:-http://127.0.0.1:8483/wizard.html}"
echo "  Dieses Fenster offen lassen. Schließen beendet den Prüfserver."
echo "  Hinweis: Nach 60 Minuten ohne Nutzung beendet sich der Server"
echo "  von selbst (Datenschutz-Baunorm). Einfach erneut doppelklicken."
echo ""
wait $PIPE_PID
