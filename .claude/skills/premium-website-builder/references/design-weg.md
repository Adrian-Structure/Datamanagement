# The design-canvas route — design system → assets → reusable skills → live

The alternative to hand-cloning: start in an AI design canvas, end with a repo
that generates business assets on demand. Seven moves.

## 1. Design system first
Create a design system: company name + one-paragraph blurb (identity anchor),
optionally import a GitHub repo / local code / Figma file, drop in fonts,
logos, assets. Logo tip: generate in vector mode (Recraft V4.1) → real SVG →
recolor/retext without design tools. Use a cheap chat model (medium effort) to
shortlist Google-font pairings and color palettes from the blurb; paste the
winners into the system's notes. Generate the brand guide on a strong model —
it returns logo variations, color ramps, semantic status colors, cards, forms,
motion ideas. Publish it; every later template inherits the brand.

## 2. Website from the system
Prompt the website template with: sections, a lead form above the fold, nav
behavior, and — critically — "add placeholders for all images and give me a
generation prompt + aspect ratio for each". Answer the clarifying questions
(services, trust stats, service area, form fields). Generate assets from the
returned prompts, name them by number, drop them in: "insert these images by
number".

## 3. Ad studio
The animation template can build a small ad dashboard: all major feed formats,
editable copy/accent/speed tweaks. Scene pattern that converts: pain →
response → resolution (leak bucket → crew tarping → happy owner). Generate
scene images, animate each (image-to-video), then have the canvas cut them
together with big text and the logo at the end.

## 4. Decks and documents
Slides template → client-facing pitch deck (e.g. product options as a swatch
grid); document template → branded contract/proposal with swappable name and
line items (have a lawyer check real contracts).

## 5. Export: share → send to the coding agent
Each artifact (site, deck, document, design system) exports a ready handover
prompt. Paste them all into one coding-agent session.

## 6. Consolidate into a factory repo
Tell the agent: one repo containing the website (deployable) plus internal
tools — and SKILLS for each recurring job: document generator, deck creator,
video-ad creator, lead qualifier. The agent scaffolds the repo (skills
directory, project instructions file, README, deploy config) — from now on the
business talks to the repo, not to the canvas.

## 7. Deploy with a working back door
Deploy via the host's CLI/connector. Add environment variables (admin
username/password, marked secret) for the built-in admin login; redeploy; test
the lead form end-to-end (submit → appears in admin). Only then hand over.

**Why this matters:** this chain turns one-off design work into standing
infrastructure — the factory pattern. Each new client = new design system +
same seven moves.
