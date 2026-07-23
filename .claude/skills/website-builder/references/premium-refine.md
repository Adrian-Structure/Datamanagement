# Premium refine — from "not generic" to "feels expensive"

Optional escalation on top of the design corrective, not a default. Use only when the user
asks for a premium/expensive feel, a clone of a specific reference, or says the result
"looks generic/AI-made" after the baseline corrective was already applied.

## Reference-site cloning (context beats prompting)

Words alone under-deliver here. For each of the 3-5 reference sites gathered in Required
Inputs: take a full-page screenshot AND copy the page's rendered CSS/HTML (browser DevTools
→ Elements → Styles). Screenshot + code + words is the context package that gets a
faithful style match in one pass; words alone typically land ~50%, not ~80%.

Clone the STYLE, not the brand: never reproduce a specific site's actual content,
copy, or unique brand assets — only the direction (palette, layout rhythm, motion feel).
Cloning a stranger's live site pixel-perfect (their exact content, not just their visual
language) is a legal gray zone; keep a battle-tested starter of your own to restyle instead
of hand-scaffolding from someone else's markup.

## The 8-point quality bar

Three groups: taste (1-4), substance (5-6), felt quality (7-8). Paste this list into the
session and ask "where does this land against each point, be honest" — expect a
strong/mixed/missing split, that's the work list.

1. **Point of view** — a chosen style answer, not a mood board.
2. **Typography** — distinctive heading font + restrained body font. Same red flag as the
   design corrective: Inter is the single most overused AI-generated-site tell; Geist is a
   safe swap.
3. **Color** — ~5 hex values max (near-dark, warm light, one accent, one metallic/secondary,
   one neutral). Restraint reads as quality; a rainbow palette reads as template.
4. **Hierarchy** — every block signals what to read first/second/third by size alone. If
   everything is the same size, the page feels flat regardless of how polished each element
   is individually.
5. **Imagery** — custom or generated assets matching the brand; never ship obvious stock.
   The agent writes its own generation prompts (it already knows the palette/mood).
6. **Motion** — one restrained cursor/motion interaction per section that needs it (subtle
   parallax, a trailing highlight, word-by-word reveals, a hairline animation). Iterate
   "more subtle" until it stops reading as an effect — that's the actual signal of "feels
   expensive" rather than "has animations."
7. **Mobile** — designed for phones, not shrunk: collapsed nav, tightened spacing, a smaller
   button variant. Must be requested explicitly; responsive is not the same as designed.
8. **The invisible** — fast load, no layout jank, finished details (favicon, focus states,
   consistent spacing rhythm). Felt, not seen, but its absence is felt immediately.

## The batch-fix prompt pattern

Don't fix quality-bar gaps one at a time. State the feeling, not the feature list:

> "The lower sections feel a bit generic. We don't need them busier — just more expensive."

Let the agent translate that intent into a specific batch (grain, hairlines, reveals,
tightened hierarchy). Approve the batch, ship it at once — fewer iterations, more
cohesion across sections than fixing them independently. Then do a human pass yourself:
scroll every section; the agent cannot feel which ones are still flat.

## Component libraries (skip re-describing what already exists)

Never describe a complex interactive component in prose when a component library already
has it built. Browse a component library with copy-prompt buttons (backgrounds, scroll
effects, cards), copy the prompt, paste it to the agent to recreate in-project as editable
code, then tune color/speed/opacity to match the brand. Rule of thumb: browse when you
don't know what you want yet — recognition is faster than description here.
