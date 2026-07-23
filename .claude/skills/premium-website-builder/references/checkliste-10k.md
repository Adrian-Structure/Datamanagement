# The 8-point checklist — what separates a $10,000 site from a $200 one

Three groups: **taste** (1–4), **substance** (5–6), **felt quality** (7–8).

1. **Point of view** — the site has a real direction (a chosen style answer,
   not a mood board). Comes from answering the clarifying questions
   specifically: style direction, sections, tone, primary CTA.
2. **Typography** — distinctive heading font + restrained body font. Red flag:
   Inter (the single most overused AI font — swap for Geist or similar).
3. **Color** — ~5 hex values max (near-dark, warm light, one accent, one
   metallic/secondary, one neutral). Restraint signals quality; rainbow
   palettes signal template.
4. **Hierarchy** — every block tells the eye what to read first/second/third
   by size. If everything is the same size the site feels flat and cheap.
5. **Imagery** — custom or AI-generated assets that match the brand. The agent
   writes the generation prompts itself (it knows the palette and mood); never
   ship obvious stock.
6. **Motion** — one restrained cursor/motion interaction per section that
   needs it (parallax embers, trailing halo, word-by-word reveals, animated
   hairlines, film grain). Iterate "more subtle" until it stops reading as an
   effect. This is the "feels expensive" layer.
7. **Mobile** — designed for phones, not shrunk: collapse nav, tighten
   wordmark spacing, smaller button variants. Must be requested explicitly —
   responsive ≠ designed.
8. **The invisible** — fast load, no jank, finished details (favicons, focus
   states, spacing rhythm). Felt, not seen.

## How to grade

Paste this checklist into the session and ask: "Where does this site land
against each of these criteria? Be honest." Expect a strong/mixed/missing
split — that is the work list, not a failure.

## The batch-fix prompt pattern

Do not fix items one at a time. State the FEELING, not the features:

> "We need more handcrafted micro-interactions. The lower sections feel a bit
> generic. We don't need to make them busier — just more expensive."

The agent translates intent into a batch of specific fixes (grain, hairlines,
reveals, glows). Approve the batch, ship it at once: fewer tokens, more
cohesion. Then do the human pass — scroll every section yourself; the agent
cannot feel which sections are still flat.
