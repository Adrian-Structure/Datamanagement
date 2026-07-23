# Deploy and go-live — verified reality, not promised timelines

## The deployment-reality-check discipline (binding, learned the hard way)

Never promise a "live" timeline before confirming, in THIS session, right now:
- A real domain exists and its hosting is actually reachable — test with `curl`/`dig`, don't
  assume. A 403/timeout means either the target blocks this environment's egress, or there's
  no host behind the domain yet — find out which before giving instructions.
- Real hosting credentials (FTP/SSH/API key/panel login) that THIS session can use are
  actually present — check for them explicitly, don't infer from "the user said they deploy
  daily." Credentials are scoped per environment/session; a different Claude session having
  them configured does not mean this one does.
- If either check fails: stop, name exactly what's missing (which credential, which host),
  and hand the user either (a) the exact manual step they can do themselves in under a
  minute, or (b) what they'd need to give this session to do it directly. Never claim "live"
  on the strength of a pushed-to-repo file alone if going live still requires a manual
  toggle (e.g. enabling GitHub Pages in repo settings) that this session cannot click itself.

## What "done" actually requires beyond the build

A scaffold with generated copy is not a launch-ready site. Still needed, and none of it is
fast: real photography and business-owner-approved final copy, real customer reviews (never
fabricate testimonials or ratings), legal sign-off on Impressum/Datenschutz text beyond the
technical scaffold, a real email/API integration actually wired in and tested (not just an
env var placeholder), a client revision cycle, cross-device QA, and organic SEO ranking,
which takes months. Say this distinction up front every time.

## Hosting decision (static vs. backend)

- **Static site, no login/database** → cheapest static host, or GitHub + Vercel/Netlify free
  tier, or a budget host's static plan.
- **Accounts, payments, a database** → a Node-capable hosting tier, or Netlify/Vercel with
  environment variables for secrets (mark them as secret values in the host's panel, never
  commit them).

## The zip-contents trap

Zip the folder's CONTENTS, not the folder itself. `index.html` must sit at the zip root —
one level too deep (a folder inside the zip containing `index.html`) gives a blank page on
most static hosts.

## Git/GitHub Pages go-live traps

- **GitHub Pages needs `.nojekyll`** at the served root — without it, folders starting with
  an underscore (or other Jekyll-reserved patterns) silently 404.
- **The host may auto-commit into the repo** (e.g. a `CNAME` file added by the Pages UI):
  always `git pull` before the next push, or the push fails.
- **"Everything up-to-date" can be a lie.** After a failed commit, `git push` can report
  "Everything up-to-date" while nothing new is actually live. Verify with `git ls-remote`
  and compare the hash to what you expect — never trust the push message alone.
- **Never keep the only copy in a temp/scratch directory** — it can die on container
  restart or reboot. The project folder (or the repo itself) is the source of truth; temp
  paths are for scratch work only.
- **DNS propagation takes real time** — if a custom domain is involved, start the DNS change
  early and keep working on content while it propagates; don't schedule a go-live around it
  finishing instantly.

## Deploy errors

Copy the host's exact error message back to the agent verbatim — most deploy failures are
missing or misnamed environment variables, and the exact error is enough to fix them without
re-diagnosing from scratch.
