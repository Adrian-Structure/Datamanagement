---
name: conversion-landingpage-builder
description: "Builds a high-converting SaaS or product landing page by decomposing it into one focused prompt per section (hero, problem/solution, features+benefits, how-it-works, social proof, pricing, final CTA+footer) instead of one giant prompt, each following a tested, audience-specific formula with a single primary call-to-action. Includes a script that generates the full 7-prompt sequence from a short product brief. Use when the user asks to 'build a landing page', 'erstelle eine Landingpage', wants a 'conversion page', 'sales page', 'B2B SaaS landing page', asks for hero/problem-solution/pricing/testimonial sections, or wants to turn a product idea into a page for Base44, v0, Bolt, Lovable, or plain HTML/Claude Code. Do NOT use for purely informational pages without a conversion goal, blog posts, or pure visual/graphic-design requests without copy."
license: "Proprietary. LICENSE.txt has complete terms."
compatibility: "Universal. Optional script (scripts/generate_prompts.py) needs Python 3 stdlib only — no packages, no network access."
metadata:
  author: "Roberto Adrian"
  version: "1.0.0"
---

# Conversion Landingpage Builder

Builds a landing page as seven independently-scoped prompts instead of one monolithic
request. Each section has exactly one job, a fixed formula, and a scope lock that stops
the model from generating the whole page at once. This is a house standard (W2) plus an
executable tool (W1): without it, a model asked for "a landing page" typically returns one
undifferentiated block with diluted messaging and more than one competing call-to-action.

## Workflow

1. **Collect the brief before writing anything.** You need, at minimum: product name,
   category (e.g. "B2B SaaS"), one-line audience description, the problem in one sentence,
   the solution in one sentence, 3-4 features each paired with a benefit, exactly 3
   how-it-works steps, 3 testimonial roles (titles, not real people), 2-4 pricing tiers,
   one primary CTA phrase, and a style triple (background, accent color, tone). If the user
   hasn't given these, ask — do not invent a fake audience or fake pricing for a real
   deliverable. See the intake schema in `references/section-formulas.md`.
2. **Generate the 7 prompts.** Either run `${CLAUDE_SKILL_DIR}/scripts/generate_prompts.py`
   against a JSON brief (fast, deterministic, validates the constraints above), or write
   them by hand following the exact formulas in `references/section-formulas.md`. Order is
   fixed: hero → problem/solution → features+benefits → how-it-works → social proof →
   pricing → final CTA + footer.
3. **Every prompt ends with a scope lock**, e.g. "Build only this section, no other
   content." Without it, page builders tend to regenerate the whole page and undo earlier
   sections.
4. **Carry the style forward explicitly.** Restate the exact background/accent/tone from
   the hero prompt in every later prompt (or paste the hero's output back in as context) —
   otherwise sections drift stylistically from each other.
5. **Enforce one CTA phrase, everywhere.** The same call-to-action text appears in the
   hero and the final section and nowhere else as a competing button. More than one
   distinct CTA on the page is a defect, not a stylistic choice.
6. **Build or hand off the sections**, in order, to whatever the user is using (Claude
   directly for HTML, or a page builder such as Base44, v0, Bolt, Lovable).
7. **Coherence pass** once all 7 sections exist: same CTA text throughout, same
   background/accent colors throughout, no section repeats a claim already made earlier,
   audience language stays consistent (same job titles, same tone) from problem/solution
   through testimonials.
8. **Legal layer — do not skip.** This skill builds a website. Hand off to the
   `website-dsgvo` skill for Impressum, Datenschutzerklärung and cookie-consent review
   before the page goes live. If `website-dsgvo` is not installed in this environment, say
   so explicitly to the user — do not silently omit the legal check.
9. **After launch**, note headline, CTA copy and pricing presentation as the first A/B test
   candidates — this skill does not run the tests, it just flags where to start.

## Worked example

Brief: product `Pilotly`, category "B2B SaaS", audience "customer success managers and
heads of onboarding", problem "manual onboarding checklists cause missed steps and an
inconsistent first-90-days experience", solution "Pilotly runs the entire onboarding
workflow automatically and flags what's stalled", features = [(automated task sequencing,
"every account gets the right steps in the right order without a manager assembling it by
hand"), (stall detection, "managers see exactly which account is stuck and why, same day it
happens"), (customer-facing progress view, "customers see their own onboarding status
instead of asking your team for updates"), (native CRM sync, "onboarding status updates the
CRM automatically, no double entry")], steps = ["Connect your CRM", "Map your onboarding
playbook once", "Pilotly runs every new account against it automatically"], testimonial
roles = ["Head of Customer Success", "Onboarding Manager", "VP of Customer Experience"],
pricing = Starter $39/mo, Team $129/mo, Enterprise "Contact us" (Team highlighted), CTA =
"Start Free Trial", style = dark navy background / teal accent / "premium, enterprise-grade".

Running `generate_prompts.py` against this brief produces 7 ready-to-paste prompts, each
scoped to one section, each ending in the scope-lock sentence, each using "Start Free
Trial" as the only CTA text and "customer success managers and heads of onboarding" as the
only audience phrase throughout.

## Troubleshooting

Check in this order:

1. **Copy reads generic** — the audience or problem in the brief is too abstract ("business
   owners", "workflow issues"). Ask for a specific job title and a specific, named pain
   point before regenerating.
2. **Builder regenerates the whole page from a one-section prompt** — the scope-lock
   sentence is missing or buried in a long prompt. Move it to the very last sentence and
   keep the prompt itself short.
3. **More than one call-to-action shows up** — re-open every generated section and remove
   any button that isn't the single agreed CTA text.
4. **Sections look stylistically inconsistent** — the exact background/accent/tone wording
   from the hero prompt wasn't repeated in later prompts. Restate it verbatim each time.
5. **Testimonials or pricing look obviously placeholder** — before the page goes live,
   swap in real customer quotes and real prices; do not ship fabricated numbers as if real.

## Escalation

If the user cannot name a specific target reader (job title, not "everyone") or refuses to
give even a one-sentence problem/solution after being asked: stop, state plainly that
persuasive copy needs a defined reader, name exactly what's missing (e.g. "I need one
sentence naming who this is for"), and wait for that input rather than inventing a persona
for a real deliverable.

## References

- `references/section-formulas.md` — the exact formula, required fields and constraints for
  each of the 7 sections, plus the intake JSON schema used by the script.
- `scripts/generate_prompts.py` — generates and validates the 7-prompt sequence from a JSON
  brief; run with `--example` to see it against the worked example above, or point it at
  your own brief file.
