# Field notes — lessons paid for on real deployments (ours, not from any tutorial)

Everything below was learned shipping real sites and a real shop — each item
cost an evening or a broken deploy. No video teaches these; this is the
skill's own life.

## 1. EU legal layer from day one (the tutorials all skip this)
A site for an EU audience without a legal layer is NOT finished, no matter how
expensive it looks:
- **Impressum + Datenschutzerklärung** as real pages from day 1, linked in the
  footer — not "later".
- **No-tracker beats consent banner**: ship without analytics/tracking and no
  cookie banner is needed at all. Cleaner page, cleaner law. Add tracking only
  when the client insists — then the consent machinery comes with it.
- **Hosting is data processing**: a US host serving an EU audience is a
  third-country transfer question. For backends, pick an EU region
  (e.g. Frankfurt) — same product, zero extra cost, one less legal risk.
- Sell this as a feature: "EU-ready" is a differentiator US-made templates
  cannot claim.

## 2. Template-first beats clone-first (speed AND clean room)
Cloning a stranger's live site pixel-perfect is a legal gray zone and slow.
Keep an OWN battle-tested starter repo (build-tested, legal pages included,
deploy config working) and clone THAT: seconds instead of hours, no gray zone.
Use reference screenshots for *direction* (palette, mood, layout ideas), not
for 1:1 replication of someone's brand.

## 3. Go-live traps (each one cost us a deploy)
- **GitHub Pages needs `.nojekyll`** — without it, asset folders silently 404.
- **The host may auto-commit into your repo** (e.g. a CNAME file): always
  `git pull` before push, or the push fails.
- **"Everything up-to-date" can be a lie**: after a failed commit, push says
  up-to-date and NOTHING is live. Verify with `git ls-remote` (compare the
  hash), not with the push message.
- **Never keep the only copy in /tmp** — it dies on reboot. Source of truth
  lives in the project folder / cloud drive; temp is for scratch only.
- **DNS for a second domain** (a .de alias etc.) is a one-click at the
  registrar plus patience — do it on day 1 so propagation runs while you
  polish.

## 4. Build-script gotchas (macOS/zsh reality)
- zsh does NOT word-split `$VAR` in `for x in $VAR` — use `${=VAR}` or the
  loop runs once with the whole string.
- ffmpeg builds often lack `drawtext`: render text cards as HTML via headless
  Chrome → PNG instead of fighting the filter.

## 5. The sell layer (the site is not the product)
If the site exists to SELL something (skills, templates, services):
- Product pages need **proof artifacts**: audio samples, screenshots, demo
  links — not just claims.
- Every sellable artifact carries **metadata stamps**: author, version, who
  built it, an acceptance stamp ("abnahme") that is only set after a human
  approved the real thing.
- Checkout: webhook-based (e.g. Lemon Squeezy) into an EU database (Supabase
  Frankfurt) with row-level security; run in **mock mode** until one real
  purchase has flowed end-to-end — only then call the shop live.

## 6. The publish gate (discipline that saves relationships)
Never auto-publish a client-facing site. The rule is **show → OK → publish**:
the human sees the exact thing that goes live and says yes first. "I want to
see it" is not a yes. If a platform safety check blocks an upload, treat it as
a hard stop and change the content — never split or disguise it to slip past.
