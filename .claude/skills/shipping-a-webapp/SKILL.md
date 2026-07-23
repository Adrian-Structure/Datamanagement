---
name: shipping-a-webapp
description: "Build a real web app from scratch with an agentic coding assistant and put it live on the internet: login and user accounts with role-based access (row-level security), file uploads, a persistent database, and hosting on an EU server. Covers the plan-first sparring-partner method, generating the UI from a design system supplied as images, connecting a Postgres backend (Supabase, Frankfurt) plus a Context7 docs connector, version control (GitHub), deploying to hosting (Hostinger or Vercel), and an optional multi-agent setup that runs several coding agents in parallel. Use when the user says 'build me a web app', 'I want to make an app', 'add login and a database', 'add file uploads', 'set up roles and permissions', 'deploy my app', 'put my app online', 'host my app', 'take it live', 'push my changes live', or 'run several agents in parallel'. Do NOT use for native iOS/Android apps, non-web desktop software, or static one-page sites with no backend."
license: "Proprietary. LICENSE.txt has complete terms."
metadata:
  author: "Roberto Adrian"
  version: "1.8.0"
  abnahme_webapp: "Roberto Adrian, 2026-07-17 — bestanden (Live-Beweis: eigener Shop mit SSL unter eigener Domain)"
  abnahme_sellapp: "OFFEN — Ziel-Kriterium: echter Kauf fliesst (Checkout-Link -> Zahlung -> Auslieferung); Beweis-Lauf ausstehend"
---

# SHIPPING A WEBAPP — from idea to live, no code typed by hand

Takes a non-developer from a plain-language app idea to a working web app that is live on
the internet with user login, a persistent database, and hosting on an EU server. The agent
writes all the code and runs all the commands; the user orchestrates. This skill encodes the
opinionated toolchain and — more importantly — the working *method* that makes the first
version come out right.

**The binding stack** (chosen for cost, EU/GDPR data residency, and native agent connectors):

- **Coding agent** — an agentic coding assistant that edits files and runs commands directly
  from a desktop app; no terminal or IDE knowledge required.
- **Database + auth + file storage — Supabase**, server region Frankfurt. One backend covers
  three jobs: the Postgres database, user authentication, and file/asset uploads (images,
  logos, documents). Free tier is enough for most apps; the agent drives the whole instance
  through an official connector (MCP), including row-level security so each user sees only
  their own rows.
- **Up-to-date docs — Context7 connector** (free): gives the agent current Supabase/framework
  documentation instead of relying on possibly-stale training data, which makes the backend
  wiring more reliable. Connect it before building.
- **Version control — GitHub** (free): code backup, history to roll back to, and the pipe
  the host pulls new code from.
- **Hosting — Hostinger Node.js hosting**, EU server, fixed monthly price (no usage fees),
  up to 5 apps per plan, domain + business email included the first year. **Alternative:
  Vercel** — free tier, deploys straight from GitHub, fastest for prototypes; note the
  trade-off (usage-based fees at scale, non-EU default region). See
  `references/deploy-and-update.md`.
- **Framework — Next.js** (the agent scaffolds it).

Do not substitute pieces silently; the connectors and the deploy path below assume this stack.
If the user insists on another host or database, say plainly which steps change.

## Workflow

**Template-first rule (binding):** Do not scaffold from scratch. After the plan is locked:
(1) Fastest path: clone the public template repo
`https://github.com/Adrian-Structure/webapp-templates` (MIT) — seconds instead of hours,
and crash-proof. Otherwise ask the user for their own template library location (the user
names it, never search), or fall back to the bundled `assets/starter-template/`. The user's own GitHub repos
(template or finished app) are first-class template sources whenever the user points to
them — respect each repo's license; strongly-licensed app repos are the user's own
rebuild base, the MIT template repo is for everyone (a proven, build-tested Next.js skeleton: catalog + detail
pages, DE/EN i18n, dark design tokens, login/account, buyers-only reviews, Supabase
schema with row-level security, payment-provider webhook function, mock mode so
everything is clickable before any account exists).
(2) Copy the template, `npm install`, build, and push the UNCHANGED standard to GitHub
first — the standard is online fast and every later step is an iteration on a working
deploy. (3) Then individualize per the plan interview, following the template's
`TEMPLATE-ANPASSEN.md` checklist (brand strings, products, design tokens from the user's
own assets, base path, contact address, sales layer go-list).


Follow in order. The single most important rule is step 1 — rushing it is the top cause of a
bad first version.

1. **Plan first, in plan mode — treat the agent as a senior sparring partner.** Switch the
   agent to a read-only *plan mode* (it can read, research and reason, but not yet write).
   Have the user sketch the app's features on paper first. Then let the agent *interview*
   the user: ask clarifying questions about scope, rules, design and edge cases, propose
   alternatives, and push back honestly when an idea is weak. Expect 10-20 minutes and a
   dozen-plus questions. If the user has a visual style in mind, supply the design system as
   **images** (theme screenshots + typography) for the agent to match.
   **Binding image rule: never crop supplied artwork.** Product images, logos and
   theme art are displayed whole — match the container to the image's native aspect
   ratio (or use `object-fit: contain` with a background fill), never force a foreign
   aspect ratio with `object-fit: cover`. Cropped artwork is the fastest way to make
   a page look amateurish. See
   `references/planning.md` for the opening prompt, the sparring-partner instruction, and the
   design-from-images step.

2. **Lock the plan, then let the agent build in auto mode.** Review the written plan; edit
   anything missing or misread before a line is built. Tell the agent the app runs *locally
   first* and deploys later, and that Supabase handles both auth and data. Accept the plan in
   auto mode so the agent executes without asking permission at every step (it still asks
   before destructive actions). The agent creates the Supabase project (Frankfurt), the whole
   schema, and the admin user itself — the user configures nothing in Supabase by hand. See
   `references/build-and-verify.md`.

3. **Connect the services once.** Supabase and Context7 via the connector panel (MCP
   connections); GitHub via the plugins panel; install Git locally for versioning. Do this while the agent
   works. Full click-path and the cost breakdown in `references/stack-and-connectors.md`.

4. **Verify the local build.** The agent builds in phases (login first, then features) and
   often self-tests each phase — logging in as admin and as a test user, and checking that one
   user cannot reach another's data (row-level security). Log in locally yourself, confirm the
   auth user appears in Supabase, confirm the tables/schema and any file uploads, and confirm
   the RLS isolation holds. Only then say "continue". See `references/build-and-verify.md`.

   **Lock in project memory:** run the agent's `/init` command to generate a `CLAUDE.md` in
   the project folder. It auto-loads at the start of every future session, so a new chat
   already knows the project instead of starting from zero.

5. **Push to GitHub, then deploy to hosting.** Announce beforehand that the final
   push may require ONE command line typed by the user (permission gates often block
   an agent's own `git push`) — hand it over copy-paste-ready and say you are now
   waiting for the user, not the other way round. The agent creates a private repo and pushes.
   Deploy *from GitHub* — on Hostinger Node.js hosting (EU, fixed price) or on Vercel (free,
   fastest for a prototype). Let the host auto-detect Next.js and import the `.env`
   environment variables (the Supabase project URL and keys the agent generated). Go live on
   the domain. See `references/deploy-and-update.md`.

6. **Iterate and re-deploy.** Build features locally, then tell the agent "push my changes
   live". It snapshots, pushes to GitHub, GitHub notifies the host, the host redeploys. Same
   file: `references/deploy-and-update.md`.

7. **(Optional) Scale with parallel agents.** For bigger builds, run one agent as the
   **senior** on the local project (initialize, fix issues, merge) and several **junior**
   agents against the GitHub repo, each building one small feature in parallel as a pull
   request. Keep a separate planning chat as a **co-pilot** that generates the prompts. Use
   this only once the base app and deploy pipeline work. See `references/parallel-agents.md`.

**Preflight:** before deploying, run the bundled check to confirm Git and Node are present
and the `.env` carries the required Supabase variables:

```bash
bash ${CLAUDE_SKILL_DIR}/scripts/preflight.sh /path/to/project
```

It exits non-zero and lists exactly what is missing, so a broken deploy is caught before it
starts. See `references/deploy-and-update.md` for reading its output.


## Crash resilience and panel delegation (binding)

Keep source and build output in durable storage; temp clones are disposable and die with a
reboot. After any crash/restart: answer first "which tasks are running?" (usually none),
then measure what survived (ls/dig/curl/ls-remote), show a survival table, rebuild only the
disposable parts. Details: `references/crash-recovery.md`.
When registrar/hosting-panel work (DNS, domain settings) is needed and a browser-controlling
AI is available in the user's logged-in session, hand it a GOAL-STATE briefing (not a click
script): authority line, target table, ask-instead-of-refuse, pre-authorized confirmations,
exactly three hard limits (nothing paid, no nameserver/other domains, contract/payment =
only stop case), collateral services named, screenshot proof. Template:
`references/browser-agent-dns.md`.

## EU compliance from day one (binding)

An EU-facing site ships with its legal layer or it is not finished: the four mandatory
pages (imprint, privacy, terms, withdrawal) with `[OWNER:]` placeholders, transparency
notes at every form, data-subject rights as honest UI, and a no-tracker architecture so
no consent banner is needed. The starter template includes all of it; the playbook is
`references/eu-compliance.md`.

## Assume failure first (binding)

Never plan or instruct from the happy path alone. Before giving deploy/DNS/hosting
instructions: measure reality (dig/curl the domain, read the user's panel screenshot,
identify the contract type — a domain-only contract has no webspace, a website builder
cannot host custom HTML). Attach a failure branch to every step ("if you don't see X,
STOP and tell me — plan B is ready"), keep plan B prepared before sending the user off,
and verify the result yourself (status code + content) instead of trusting "done".
The distilled real-world cases live in `references/negative-cases.md` — read them before
every deploy phase.

## Progress, ETA, and user handoffs (binding communication rules)

The user must never sit in front of a silent hourglass. Three rules apply to every phase:

1. **State an ETA up front.** When the plan is accepted, list the build phases with a
   realistic time estimate per phase (e.g. "Phase 1 scaffold+catalog ~15 min, Phase 2
   login ~20 min, ..."). Update the estimate when it shifts by more than a few minutes —
   a corrected ETA beats a broken promise.

2. **Show a progress bar in every status update.** Use a plain text bar plus phase count
   and elapsed/remaining time, e.g.:
   `[######----] Phase 3/5 - Checkout wiring - ~12 min elapsed, ~10 min remaining`
   Post it at every phase start/end and at least every ~10 minutes during long phases.

3. **Announce user handoffs BEFORE they happen.** Some steps can only be done by the
   user's own hand: running a command line in their terminal (e.g. a `git push` the
   agent's permission gate blocks), logging into an account, clicking a host's deploy
   button. Say so **at plan time** ("at the end, ONE command line will wait for you in
   the terminal") and repeat it right before the step, with the exact copy-paste-ready
   command. Never let the user discover a required manual step by waiting.

## Worked example (real, from the field)

**User:** "Build a shop for my digital products under my own domain — visitors browse,
listen to a sample, and buy."

1. **Plan mode + sparring interview.** Scope questions: visitor features (browse, account,
   reviews — no newsletter), payment via a Merchant-of-Record provider, languages DE/EN
   switchable, design and product data from the user's OWN existing brand assets (the user
   names their location — the agent never scavenges folders unasked).
2. **Phase 1 build, shown before anything ships.** Catalog generated from the user's own
   material (13 products with images and per-language audio samples), dark brand design,
   language toggle, honest placeholders ("price to follow") instead of invented data.
   Verified locally in the browser: console clean, error page friendly, mobile uncropped.
3. **Ship.** Static export, deploy via the user's existing GitHub Pages repo; the domain's
   DNS at the registrar is changed by a browser agent with a goal-state briefing
   (`references/browser-agent-dns.md`); GitHub issues the SSL certificate free. Each
   publish step that the agent's permission gate blocks is handed to the user as ONE
   copy-paste line — announced in advance.
4. **Iterate live.** User feedback ("images are cropped, add hover sound") → fix, rebuild,
   verify, one push line → visibly live minutes later.

**Expected result:** the user's own domain serves their shop with SSL, at zero hosting
cost (Pages) — and the sales layer follows as the explicit last mile below.

## From web app to SALES app (the last mile — do not skip, do not fake)

A shop page is NOT a sales app until money can actually flow. The last mile:
1. Merchant-of-Record provider account (user's hand — announce it early), products mirrored
   there, one checkout link per product wired into the catalog.
2. Provider webhook -> app endpoint -> purchases table (Supabase) -> a REAL "my purchases"
   page; provider delivers files/license keys.
3. **Honest-storefront rule (binding):** never ship placeholder features into the public
   navigation. A "my purchases" menu item that leads to a "coming soon" text is a broken
   promise to every visitor — keep unfinished features out of the live nav until they work.

## Output guards (binding — from real QA failures)

- **Never reproduce a tutorial's example app 1:1.** Cloning a course's demo (same app, same
  look) into deliverables or into this skill's examples is a legal exposure. Examples and
  demos must be self-made, with own scope, data and design.
- **Never expose the user's private/internal assets** (their unreleased products, internal
  skills, personal data) in demos or test builds unless the user explicitly designates that
  material. When a test build accidentally surfaces internal material: stop, show, replace.

## Troubleshooting

Check in this order — cheapest and most common first:

1. **Agent won't build cleanly / plan is off** — the plan was rushed. Go back to plan mode,
   let the agent finish interviewing, edit the written plan before building.
2. **App only reachable on `localhost`** — that is expected before deploy; it is not live
   until pushed to GitHub and deployed on the host.
3. **Deploy error on the host** — copy the exact error shown by the host, paste it to the
   agent, say "I got this error, fix it." Most are missing/incorrect env vars.
4. **App loads but can't reach the database** — the `.env` / imported environment variables
   are missing the Supabase URL or keys; re-import the `.env` in the host's deploy settings.
5. **Agent can't drive Supabase or GitHub** — the connector/plugin isn't linked; reconnect
   in the connectors/plugins panel and confirm the account is authorized.
6. **Versioning/roll-back not working** — Git isn't installed locally; install it, then let
   the agent re-initialize the repo.

Detailed causes and fixes: `references/troubleshooting.md`.

## Escalation — stop, signal, wait

When a blocker cannot be cleared from here — the host rejects the deploy, an account/payment
step is required, a connector refuses to authorize — do **not** retry silently in a loop and
do **not** claim the app is live when it is not:

1. **Stop** and state the exact blocker plus the single action the user must take
   (e.g. "authorize the GitHub connector", "add the Supabase key to the host's env vars").
2. **Signal clearly** with a `⛔ ACTION NEEDED` line so the user notices.
3. **Wait** for confirmation, then resume from the failed step — not from the beginning.

## References

- `references/planning.md` — plan mode, the opening prompt, the sparring-partner instruction,
  the interview method.
- `references/stack-and-connectors.md` — the three building blocks, connecting Supabase (MCP)
  and GitHub (plugin), installing Git, and the full cost breakdown.
- `references/build-and-verify.md` — auto mode, phased build, running locally, verifying auth
  and schema in Supabase before continuing.
- `references/deploy-and-update.md` — GitHub push, Hostinger Node.js deploy from GitHub, env
  var import, framework detection, and the push-to-redeploy update loop; reading the preflight
  output.
- `references/parallel-agents.md` — optional scaling layer: co-pilot planning chat + one
  local senior agent + several cloud junior agents building features as parallel pull requests.
- `references/troubleshooting.md` — ordered failure checks with causes and fixes.
- `references/negative-cases.md` — failure-first playbook: reality checks before instructions, domain-without-webspace paths, silent git failures ("Everything up-to-date"), wrong web root, SSL/propagation ETAs.
- `references/crash-recovery.md` — reboot survival: durable vs. temp storage, the resume recipe, the survival-table first message.
- `references/browser-agent-dns.md` — delegating registrar-panel work to a browser agent: the goal-state briefing pattern with pre-authorized confirmations and the GitHub-Pages DNS template.
- `references/eu-compliance.md` — GDPR by design: the four mandatory pages with owner placeholders, real-processing privacy policy, no-tracker architecture instead of consent banners, honest Art. 15/17 self-service, the hosting third-party trap.
