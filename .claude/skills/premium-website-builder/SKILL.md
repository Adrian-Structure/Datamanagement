---
name: premium-website-builder
description: "Builds premium '$10k-grade' websites with AI coding/design tools using post-2026 workflows a stock model does not know: the Inspiration-Build-Refine-Deploy clone method, the 8-point expensive-site checklist, component libraries with copy-prompt buttons, a per-section motion/cursor polish pass, AI asset generation with current image/video models, the design-to-skills factory chain, plus field-tested go-live traps and an EU/GDPR legal layer (Impressum, Datenschutz, no-tracker) learned on real deployments. Use when the user says 'build me a premium website', '10k website', 'my site looks generic / AI-made', 'clone this landing page', 'make it feel expensive', 'add motion polish', 'make it EU-ready', or asks how to turn design assets into reusable skills and deploy them (Vercel/Netlify/Hostinger). Do NOT use for backend-only architecture, SEO audits, or pure copywriting tasks."
license: "Proprietary. LICENSE.txt has complete terms."
metadata:
  author: "Roberto Adrian"
  version: "1.1"
  built_by: "fable-5"
  triage_verkaufswert_eur: 29
  abnahme: "OFFEN — wartet auf Robertos Stempel"
  compatibility: "An agentic coding assistant with file access; optional: an AI design canvas, an image/video generation service, a static host account"
---

# Premium Website Builder — from idea to a site that feels expensive

Most AI-built websites look templated and cheap. The difference between a $200
result and a $10,000 result is not the prompt — it is context, a checklist, and
a polish pass most people skip. This skill encodes that entire workflow.

## Workflow

### Step 1 — Inspiration (context beats prompting)
Have the user pick 3–5 premium reference sites (design galleries: Dribbble,
Awwwards, godly.website, Pinterest). For the closest match: take full-page
screenshots AND copy the page's rendered CSS/HTML (DevTools → Elements →
Styles). Words + picture + code is the context package; words alone fail.

### Step 2 — Build (template-first, then clone the style)
Fastest clean path: clone your OWN battle-tested starter repo (legal pages +
deploy config included) and restyle it — seconds, no gray zone. Otherwise give
the coding agent the screenshots + code + URL and ask for a faithful
replication of the STYLE in the stack that fits (static single-file HTML for
brochure sites; React/Vite only when the project genuinely needs app behavior
— respect the agent when it pushes back to protect the architecture). One shot
typically lands ~80%. End the build prompt with **"Ask me clarifying
questions"** — the agent then offers style directions and asks for sections,
tone, and CTA before writing code. The answers become the site; be specific
here, fight less later.

### Step 2b — EU legal layer from day one (if the audience is in the EU)
Impressum + privacy page as real footer links, no-tracker instead of a cookie
banner, EU region for any backend. A beautiful site without this is not
finished — and "EU-ready" is a selling point no US template offers. Details
and the go-live traps: `references/field-notes.md`.

### Step 3 — Grade against the 8-point checklist
Paste `references/checkliste-10k.md` into the session and ask where the site
lands on each point. Fix gaps as ONE batch, leading with intent, not specifics
("more expensive, not busier"). Details in the reference.

### Step 4 — Refine (components + assets)
- Components: component libraries with copy-prompt buttons (e.g. 21st.dev,
  CodePen) — copy the prompt, paste it to the agent, then tune speed/opacity/
  color in code. Never describe a complex component in words when a library
  has it.
- Assets: have the agent WRITE the image/video prompts (it knows the brand),
  then generate with a current image/video service. Current model names and
  the aggregator workflow are in `references/tools-und-modelle.md`.

### Step 5 — The motion pass (looks → feels expensive)
Scroll the finished site section by section. For each section that feels flat,
ask for ONE restrained cursor/motion interaction — then say "more subtle" until
it stops being noticeable as an effect. Swap the font Inter out (overused AI
tell; Geist is a safe replacement). Do a dedicated mobile pass (designed, not
shrunk). This step separates this skill from every generic site builder.

### Step 6 — Deploy
Static site → zip the folder's CONTENTS (not the folder — one level too deep
gives a blank page) and upload to a budget host, or push to GitHub and connect
Vercel/Netlify. Site with accounts/backend → a Node-capable plan or Netlify
with environment variables for secrets. Copy deploy errors back to the agent
verbatim; it fixes them.

### Optional Step 7 — The factory chain (design → reusable skills)
If the user works in an AI design canvas with a design system, the whole asset
set (site, decks, documents, ad studio) can be exported to the coding agent and
consolidated into one repo that also generates REUSABLE SKILLS (document
generator, deck creator, ad creator, lead qualifier) plus a live deployment
with a working lead form. The chain is in `references/design-weg.md`.

## Troubleshooting

Check in this order — cheap causes first:

1. **Result looks generic/AI** — context was words-only. Go back to Step 1;
   add screenshots + copied CSS, and install a frontend-design skill that bans
   overused fonts (see `references/tools-und-modelle.md`).
2. **Component prompt fails** — the library component targets a different
   stack (e.g. React into a static site). Ask the agent to rebuild the effect
   idiomatically instead of forcing the dependency.
3. **Video/scroll effect broken** — tell the agent what you expected vs. what
   happens; if still broken, ask it to open the page itself and inspect live.
   Three layers deep is normal; keep pushing.
4. **Deployed page is blank** — the zip contained the folder, not its
   contents. Re-zip from inside the folder (index.html at the zip root).

If a blocker cannot be resolved here (host rejects upload, missing account,
paid service needed): stop, name the exact blocker and the single action the
user must take, and wait — do not retry in a loop.

## References

- `references/checkliste-10k.md` — the 8 points that separate $10k from $200,
  how to grade, and the batch-fix prompt pattern.
- `references/tools-und-modelle.md` — current (post-2026) tools, model names,
  helper skills, component libraries, hosting tiers, and prices.
- `references/design-weg.md` — the design-canvas route: design system →
  website/ads/decks/documents → export to code → auto-generated reusable
  skills → live deploy with admin login.
- `references/field-notes.md` — the skill's own life: EU/GDPR layer,
  template-first practice, go-live traps (`.nojekyll`, pull-before-push,
  "Everything up-to-date" lie, /tmp death), zsh/ffmpeg gotchas, the sell
  layer (proof artifacts, metadata stamps, mock-mode checkout), and the
  show→OK publish gate.
