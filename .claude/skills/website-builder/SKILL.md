---
name: website-builder
description: "Builds a single-offer conversion page, a multi-service vertical website (client-config-driven, reusable across industries), or refines either to a premium finish (reference-site cloning, an 8-point quality bar, restrained motion) — plus a corrective against the generic AI-website look (purple gradients, Inter font, uniform rounded corners, shadow-on-every-card) a model doesn't avoid by default. Demands its required inputs (brief fields, deployment reality, shape) up front instead of guessing. Scripts/schemas validate output deterministically instead of relying on prose. Use for 'build a website/landing page', 'make it premium/expensive', 'erstelle eine Website/Landingpage', 'Handwerker-Website', 'conversion page', 'sales page', or turning a product into a page for Base44, v0, Bolt, Lovable, Claude Code, plain HTML. Do NOT use for informational pages, blog posts, pure visual-design requests, or brand-hub homepages of an already-trusted multi-product brand (see references/scope-and-reality-check.md)."
license: "Proprietary. LICENSE.txt has complete terms."
compatibility: "Universal. Optional script (scripts/generate_prompts.py) needs Python 3 stdlib only — no packages, no network access."
metadata:
  author: "Roberto Adrian"
  version: "2.0.0"
---

# Website Builder

Two build paths, an optional premium-refine pass, plus one step that applies to all of them
and is the actual reason this skill exists: a model asked to "build a website" already knows
persuasive-copy structure and page anatomy from training — restating that would be worthless.
What it does **not** reliably do on its own is avoid the small set of visual defaults that
make AI-built sites recognizable at a glance, deterministically enforce structural
constraints (exactly one CTA, exactly 3 steps, a scope lock per prompt) without a script
backing it, or **stop and ask** for the inputs it actually needs instead of guessing them.
That's what's kept here; copywriting theory is not.

## Required inputs — ask before building anything

Do not start writing prompts, config, or code before these are answered. A skill that
silently assumes its inputs and fails deep into a build is worse than one that asks first.

1. **Deployment reality, first.** Is there a real domain with working hosting access
   *right now* (FTP/SSH/hosting-panel/API credentials this session can actually use), or is
   this a local demo/scaffold with no live target yet? Never assume hosting access exists —
   credentials are scoped per environment/session, not something every session inherits.
   Ask before promising any timeline for "live," and re-verify reachability (`curl`/`dig`)
   before claiming a deploy path will work, per `references/deploy-and-golive.md`.
2. **Shape.** Single-offer conversion page, multi-service vertical site, or multi-product
   brand hub (the third is out of scope — see `references/scope-and-reality-check.md`). Ask
   which job the page has to do if it isn't obvious.
3. **Brand basics.** Name, one-line audience, core offering/problem solved.
4. **Path-specific brief**, in full, before generating anything:
   - Single-offer → every field in `references/single-offer-schema.md` (product, category,
     audience, problem, solution, 3-4 features+benefits, 3 steps, 3 testimonial roles, 2-4
     pricing tiers, one CTA phrase, style triple).
   - Multi-service → every field in `references/multipage-config-schema.md` (services,
     service area, real social proof numbers, experience, lead magnet, etc.).
   Missing fields get asked for by name, one list, not discovered one at a time mid-build.
5. **Reference material for the premium-refine pass (optional).** If the user wants a
   premium finish, ask for 3-5 reference sites (screenshots + copied CSS) now — see
   `references/premium-refine.md`. Words alone under-deliver here; this input is worth
   asking for explicitly, not skipping to save a question.
6. **`website-dsgvo` availability.** Confirm it's installed before building (step 1 below);
   if it isn't, say so now, not after the legal pages are already faked.

## Workflow

0. **Pick the shape** from the required inputs above. Only single-offer and multi-service
   are built by this skill.
1. **Consult `website-dsgvo` before building anything, not just before go-live.** Every
   page this skill builds is a website: Impressum/Datenschutz are not a bolt-on step at
   the end, they're part of the build from the first pass. If `website-dsgvo` is
   installed, use its actual scaffolds (`assets/impressum-geruest.md`,
   `assets/datenschutzerklaerung-geruest.md`) as the legal-page content from the start
   instead of inventing ad-hoc placeholder text — a hand-rolled placeholder is exactly how
   a "[Firmenname], [Straße]" stub ends up shipped instead of a structurally correct
   scaffold. If `website-dsgvo` is not installed, say so explicitly — do not silently
   proceed without it.
2. **Apply the design corrective, always, regardless of shape.** `references/design-corrective.md`
   lists the default failure pattern (purple/indigo gradient, Inter/Poppins/Montserrat,
   uniform max border-radius, shadow on every card, centered-hero-over-gradient-blob,
   icon-in-circle feature grids) and the deliberate choices to make instead. Skipping this
   step is the single biggest reason a build looks AI-generated.
3. **Single-offer path.** Run `${CLAUDE_SKILL_DIR}/scripts/generate_prompts.py` against the
   brief gathered above. The script validates it and emits 7 section-scoped prompts (hero →
   problem/solution → features+benefits → how-it-works → social proof → pricing → final CTA
   + footer), each ending in a scope-lock sentence, each using exactly one CTA phrase
   throughout. Do not hand-write these prompts — the script is the enforcement mechanism;
   prose alone drifts.
4. **Multi-service vertical path.** Build against the one config file gathered above (the
   only file that changes per client/industry), then send one prompt against the fixed
   technical blueprint in `references/multipage-config-schema.md`. Re-skinning for a
   different client or industry = edit only that config file, then tell the agent the
   config changed and to adapt the site accordingly — do not rebuild from scratch.
5. **Optional: premium-refine pass.** Only if the user asked for a premium/expensive feel
   (not the default): clone the direction of the reference sites gathered above, grade
   against the 8-point bar, and do one restrained motion pass. Full method in
   `references/premium-refine.md`. Skip this step entirely for a plain conversion page —
   it's an escalation, not a default.
6. **Legal layer, again, before go-live.** Re-run `website-dsgvo` in PRÜFEN mode against
   the finished build (not just step 1's up-front scaffold) — content and third-party
   services added during the build (fonts, embeds, forms) need their own check. Do not
   duplicate that skill's logic here.
7. **Deploy, only with a real, verified target.** Never promise "live" without a
   deployment reality check from step 0 of Required Inputs. Go-live traps, the zip-contents
   trick, and git push pitfalls that cost real deploys: `references/deploy-and-golive.md`.

## What this produces — and what it doesn't

Running the script or the config build gives you a **code scaffold with generated copy
filled in** in minutes to about an hour of agent runtime. That is not the same claim as "a
finished, launchable website in a day," and this skill does not make that claim. What's
still needed before go-live, and why none of it is fast, is in
`references/deploy-and-golive.md` — real photography and business-owner-approved copy, real
reviews, legal sign-off, an actually-wired hosting/email integration, a client revision
cycle, and organic SEO ranking (months, not a build run). Say this distinction up front;
presenting the scaffold as a launch-ready site is the overclaim this skill exists to avoid.

## Troubleshooting

1. **Site still looks like generic AI output** — the design corrective was skipped or only
   partially applied. Check every item in `design-corrective.md` was actively decided, not
   left at the model's default. For a premium build, also check the reference-site cloning
   in step 5 actually happened (words-only context under-delivers — `premium-refine.md`).
2. **Builder regenerates the whole page from a one-section prompt** — the scope-lock
   sentence is missing or buried; it must be the last sentence of a short prompt.
3. **More than one call-to-action shows up** — remove every button that isn't the one
   agreed CTA text.
4. **The formula feels wrong for the request** — re-check the shape decision in step 0; a
   multi-product brand hub needs one CTA per product block, not one for the whole page, and
   does not need a forced problem/solution section.
5. **Deployed page is blank** — the zip contained the folder, not its contents; re-zip from
   inside the folder so `index.html` sits at the zip root (`deploy-and-golive.md`).
6. **Push says "Everything up-to-date" but nothing changed live** — that message can be a
   lie after a failed commit; verify with `git ls-remote` against the expected hash, not the
   push message (`deploy-and-golive.md`).

## Escalation

If the user cannot name a specific target audience, a required brief field stays
unanswered, or the request doesn't fit any of the 3 shapes even after asking: stop, state
exactly what's missing, and wait — do not invent an audience, fabricate testimonials/
pricing/hosting access, or force a shape that doesn't fit the request.

## References

- `references/scope-and-reality-check.md` — the 3-shape decision, checked against real
  homepages (Windows live-fetched; Apple/Tesla/Mercedes-Benz/Nvidia from stable public
  knowledge, their domains blocked live fetch at check time).
- `references/design-corrective.md` — the anti-generic-AI-design checklist. This is the
  baseline value of the skill.
- `references/premium-refine.md` — the optional escalation from "not generic" to "feels
  expensive": reference-site cloning (screenshots + copied CSS as context), the 8-point
  quality bar, the batch-fix prompt pattern, component-library copy-prompt workflow.
- `references/single-offer-schema.md` — intake schema and constraints for the single-offer
  path (used by the script).
- `references/multipage-config-schema.md` — config schema and technical/legal build
  checklist for the multi-service vertical path.
- `references/deploy-and-golive.md` — go-live traps (zip-contents, `.nojekyll`, the
  "Everything up-to-date" lie, `git ls-remote` verification), the hosting decision matrix,
  and the deployment-reality-check discipline this skill requires before promising "live".
- `scripts/generate_prompts.py` — generates and validates the 7-prompt sequence for the
  single-offer path from a JSON brief.
