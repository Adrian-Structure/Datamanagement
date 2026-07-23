#!/bin/bash
# dienste_scan.sh — findet bekannte Drittdienst-Domains in einem Website-Ordner.
# Heuristik, kein Beweis: server-seitige Dienste (Hoster, Newsletter, Backend)
# sieht dieser Scan nicht — beim Nutzer erfragen.
# Nutzung: dienste_scan.sh <site-ordner>   Exit 0 = keine Funde, 1 = Funde, 2 = Fehler
set -u
DIR="${1:-}"
[ -d "$DIR" ] || { echo "FEHLER: kein Ordner: $DIR"; exit 2; }

PATTERN='fonts\.googleapis\.com|fonts\.gstatic\.com|googletagmanager\.com|google-analytics\.com|analytics\.js|gtag/js|matomo|youtube\.com/embed|youtube-nocookie\.com|player\.vimeo\.com|maps\.google|google\.com/maps|facebook\.net|facebook\.com/plugins|connect\.facebook|platform\.twitter|platform\.x\.com|instagram\.com/embed|linkedin\.com/embed|tiktok\.com/embed|cdn\.jsdelivr\.net|cdnjs\.cloudflare\.com|unpkg\.com|typekit\.net|use\.fontawesome\.com|hotjar|doubleclick\.net'

FUNDE=$(grep -rniE "$PATTERN" "$DIR" \
  --include='*.html' --include='*.htm' --include='*.css' --include='*.js' \
  --include='*.php' --include='*.vue' --include='*.jsx' --include='*.tsx' \
  2>/dev/null | grep -v 'node_modules/')

if [ -z "$FUNDE" ]; then
  echo "OK: keine bekannten Drittdienst-Domains im Ordner gefunden."
  echo "WICHTIG: Server-seitige Dienste (Hoster, Newsletter, Formular-Backend) trotzdem erfragen."
  exit 0
fi

echo "FUNDE (Datei:Zeile — Treffer):"
echo "$FUNDE" | sed 's/^/  /' | head -60
N=$(echo "$FUNDE" | wc -l | tr -d ' ')
[ "$N" -gt 60 ] && echo "  … insgesamt $N Treffer (gekürzt)"
echo
echo "→ Jeden gefundenen Dienst durch die Zwei-Stufen-Prüfung nehmen (§25 TDDDG, dann Art. 6 DSGVO)."
exit 1
