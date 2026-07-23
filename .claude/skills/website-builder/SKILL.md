---
name: website-builder
description: "Builds either a single-offer conversion page (unfamiliar brand, one product, one CTA) or a multi-service vertical website (one brand, several services, client-config-driven, reusable across industries by swapping one file) — and applies a mandatory corrective against the generic AI-website look (default purple gradients, Inter font, uniform rounded corners, shadow-on-every-card) that a model does not avoid by default. Includes scripts/schemas that generate and validate output deterministically instead of relying on copywriting prose. Use when the user asks to 'build a website', 'build a landing page', 'erstelle eine Website/Landingpage', wants a 'Handwerker-Website', 'conversion page', 'sales page', or wants a product/service turned into a page for Base44, v0, Bolt, Lovable, Claude Code, or plain HTML. Do NOT use for informational-only pages, blog posts, pure visual-design requests without copy, or multi-product brand-hub homepages of an already-trusted brand (see references/scope-and-reality-check.md)."
license: "Proprietary. LICENSE.txt has complete terms."
compatibility: "Universal. Optional script (scripts/generate_prompts.py) needs Python 3 stdlib only — no packages, no network access."
metadata:
  author: "Roberto Adrian"
  version: "1.2.0"
---

# Website Builder

Two build paths, plus one step that applies to both and is the actual reason this skill
exists: a model asked to "build a website" already knows persuasive-copy structure and
page anatomy from training — restating that would be worthless. What it does **not**
reliably do on its own is avoid the small set of visual defaults that make AI-built sites
recognizable at a glance, and it does not deterministically enforce structural constraints
(exactly one CTA, exactly 3 steps, a scope lock per prompt) without a script backing it.
That's what's kept here; copywriting theory is not.

## Workflow

0. **Pick the shape before writing anything.** Three shapes exist — single-offer
   conversion page, multi-service vertical site, multi-product brand hub — and only the
   first two are built by this skill. See `references/scope-and-reality-check.md`. If
   ambiguous, ask which job the page has to do.
1. **Consult `website-dsgvo` before building anything, not just before go-live.** Every
   page this skill builds is a website: Impressum/Datenschutz are not a bolt-on step at
   the end, they're part of the build from the first pass. If `website-dsgvo` is
   installed, use its actual scaffolds (`assets/impressum-geruest.md`,
   `assets/datenschutzerklaerung-geruest.md`) as the legal-page content from the start
   instead of inventing ad-hoc placeholder text — a hand-rolled placeholder is exactly how
   a "[Firmenname], [Straße]" stub ends up shipped instead of a structurally correct
   scaffold. If `website-dsgvo` is not installed in this environment, say so explicitly to
   the user before building — do not silently proceed without it.
2. **Apply the design corrective, always, regardless of shape.** `references/design-corrective.md`
   lists the default failure pattern (purple/indigo gradient, Inter/Poppins/Montserrat,
   uniform max border-radius, shadow on every card, centered-hero-over-gradient-blob,
   icon-in-circle feature grids) and the deliberate choices to make instead. Skipping this
   step is the single biggest reason a build looks AI-generated.
3. **Single-offer path.** Collect a brief per `references/single-offer-schema.md` and run
   `${CLAUDE_SKILL_DIR}/scripts/generate_prompts.py` against it. The script validates the
   brief and emits 7 section-scoped prompts (hero → problem/solution → features+benefits →
   how-it-works → social proof → pricing → final CTA + footer), each ending in a scope-lock
   sentence, each using exactly one CTA phrase throughout. Do not hand-write these prompts —
   the script is the enforcement mechanism; prose alone drifts.
4. **Multi-service vertical path.** Fill the one config file described in
   `references/multipage-config-schema.md` (the only file that changes per client/industry),
   then send one prompt against the fixed technical blueprint in the same file. Re-skinning
   for a different client or industry = edit only that config file, then tell the agent the
   config changed and to adapt the site accordingly — do not rebuild from scratch.
5. **Legal layer, again, before go-live.** Re-run `website-dsgvo` in PRÜFEN mode against
   the finished build (not just step 1's up-front scaffold) — content and third-party
   services added during the build (fonts, embeds, forms) need their own check. Do not
   duplicate that skill's logic here.

## What this produces — and what it doesn't

Running the script or the config build gives you a **code scaffold with generated copy
filled in** in minutes to about an hour of agent runtime. That is not the same claim as "a
finished, launchable website in a day," and this skill does not make that claim. Still
needed before go-live, and none of it is fast: real photography and business-owner-approved
final copy, real reviews (never fabricate testimonials or ratings), legal sign-off on
Impressum/Datenschutz text (the `website-dsgvo` handoff covers the technical scaffold, not
a lawyer's review), domain/DNS/hosting, a real email/API integration actually wired in and
tested (not just an env var placeholder), a client revision cycle, cross-device QA, and
organic SEO ranking — which takes months, not a build run. Tell the user this distinction
up front; presenting the scaffold as a launch-ready site is the same overclaim this skill
exists to avoid repeating.

## Troubleshooting

1. **Site still looks like generic AI output** — the design corrective was skipped or only
   partially applied. Check every item in `design-corrective.md` was actively decided, not
   left at the model's default.
2. **Builder regenerates the whole page from a one-section prompt** — the scope-lock
   sentence is missing or buried; it must be the last sentence of a short prompt.
3. **More than one call-to-action shows up** — remove every button that isn't the one
   agreed CTA text.
4. **The formula feels wrong for the request** — re-check the shape decision in step 0; a
   multi-product brand hub needs one CTA per product block, not one for the whole page, and
   does not need a forced problem/solution section.

## Escalation

If the user cannot name a specific target audience, or the request doesn't fit any of the
3 shapes even after asking: stop, state exactly what's missing, and wait — do not invent an
audience, fabricate testimonials/pricing, or force a shape that doesn't fit the request.

## References

- `references/scope-and-reality-check.md` — the 3-shape decision, checked against real
  homepages (Windows live-fetched; Apple/Tesla/Mercedes-Benz/Nvidia from stable public
  knowledge, their domains blocked live fetch at check time).
- `references/design-corrective.md` — the anti-generic-AI-design checklist. This is the
  core value of the skill.
- `references/single-offer-schema.md` — intake schema and constraints for the single-offer
  path (used by the script).
- `references/multipage-config-schema.md` — config schema and technical/legal build
  checklist for the multi-service vertical path.
- `scripts/generate_prompts.py` — generates and validates the 7-prompt sequence for the
  single-offer path from a JSON brief.
