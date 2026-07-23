# Negative cases first — the failure-first playbook

A skill that only describes the happy path abandons the user at the first surprise.
Binding rule: **verify reality before giving instructions, and attach the failure branch
to every step that can fail.** These cases are distilled from real deployments.

## 1. Verify reality BEFORE writing instructions

Never describe a panel, contract or DNS zone from memory. First measure:

- `dig +short domain.tld A` + `curl -sL http://domain.tld` — what actually answers?
  A tiny page with `Refresh: 0;url=defaultsite` = registrar parking page (no site connected).
- HTTPS check: `curl -s -o /dev/null -w "%{http_code}" https://domain.tld` — `000` means
  no SSL exists at all; plan for certificate issuance.
- Ask the user for a **screenshot of their hosting panel** and read the CONTRACT TYPE on it
  before choosing a path. "Domain (add-on)" / "Instant Domain" = domain WITHOUT webspace —
  file-upload instructions would be wrong. A "website builder" product cannot host custom
  HTML at all.
- Adapt the instructions to what the screenshot shows — the user's panel wins over the docs.

## 2. Domain exists but has no webspace (domain-only contract)

Options, in order of preference:
1. **DNS → GitHub Pages** (free, real SSL from GitHub): apex A records
   185.199.108.153 / .109. / .110. / .111. + CNAME `www` → `<account>.github.io`,
   plus the custom domain in the repo's Pages settings and a CNAME file in the deploy.
   ⚠️ Tell the user NOT to buy the registrar's SSL upsell — GitHub issues the certificate
   free once DNS points there ("Enforce HTTPS" becomes clickable later; this can take
   minutes to ~1 h).
2. Registrar redirect to an existing URL (fastest, but the address bar shows the target —
   looks unprofessional; only as a stopgap).
3. Buy real webspace (cost; only if the user wants server features).

Remember the base-path trap: a site built for `github.io/<repo>/sub` needs a rebuild with
the new base path (`/sub`) when it moves to a custom domain — otherwise every asset 404s.

## 3. Git steps that fail silently or confusingly

- `git commit` in a fresh clone fails with "Please tell me who you are" → always commit with
  `git -c user.name=... -c user.email=...` or set the config first. A failed commit followed
  by `git push` prints **"Everything up-to-date"** — which looks like success but shipped
  NOTHING. Verify with `git ls-remote origin main` vs `git rev-parse HEAD`, never with the
  push message alone.
- The agent's own `git push` may be blocked by a permission gate. Expected, not an error:
  announce it in advance (see the handoff rule), prepare the commit, and hand the user ONE
  copy-paste line. Never bypass the gate by slicing commands.
- Force-push/reverts: a revert removes content from the branch but NOT from history; a
  history rewrite (`reset --hard` + `push --force`) removes the commits, yet the platform
  may still serve orphaned commits by SHA for a while. Say so honestly.

## 4. Deploy "done" but the site shows something else

Check in this order:
1. **Propagation/caching** — DNS changes take minutes to hours; browsers cache old pages
   (hard reload ⌘⇧R, second device). GitHub Pages rebuilds take 1–2 minutes.
2. **Wrong web root** — upload targets like `/`, `htdocs/`, `kunden/...` differ per host;
   the files belong where the old placeholder page lives.
3. **Jekyll ate the assets** — GitHub Pages ignores `_next/`/underscore dirs without a
   `.nojekyll` file at the published root.
4. **ZIP uploaded but not unpacked** — some file managers store the archive as a file;
   unpack it or upload the folder contents instead.
5. **SSL not yet issued** — HTTPS failing right after DNS change is normal; give the ETA
   instead of debugging phantom errors.

## 5. Writing instructions that survive contact with reality

- For every numbered step, add the "if you DON'T see this" branch (button missing, dialog
  different, error text) — with a stop-word: "if X, STOP and tell me, we switch to plan B".
- Keep a prepared plan B before sending the user off (e.g. redirect instead of DNS,
  file manager instead of SFTP).
- After the user reports "done", VERIFY yourself (curl status + content fingerprint) and
  report proof — never treat "I clicked it" as "it works".
