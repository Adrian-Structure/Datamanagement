# Design corrective — the actual value in this skill

A generic "make it look good" instruction adds nothing — that's training knowledge. What a
model does not reliably do on its own is avoid a small, well-known set of visual defaults
that make AI-built sites recognizable at a glance. Naming them and forcing a deliberate
choice against each is the corrective.

## Default failure pattern — do not ship any of these unless deliberately chosen

- Purple/indigo/violet gradient as the primary brand color
- Inter, Poppins, or Montserrat as the body/heading font
- Uniform large border-radius on every element alike (buttons, cards, images all
  `rounded-xl`/`rounded-2xl`)
- A drop shadow on every card, applied identically regardless of hierarchy
- Centered hero text over a blurred gradient blob, with a floating glassmorphism card
- Icon-in-a-circle feature grids as the default way to present any 3-4 items
- Every section using the same centered-text-over-icon-grid layout

## The corrective — make each of these a decision, not a default

1. **Font**: pick something outside {Inter, Poppins, Montserrat, system-ui defaults}, and
   justify the pick against the brand's register in one line (a slab serif signals
   established/traditional; a rounded sans signals approachable; DM Sans / Public Sans are
   safe non-default choices when unsure).
2. **Border-radius**: fix one value, or a deliberate 2-step scale (e.g. 4px for inputs and
   buttons, 12px for cards) — never let every element default to maximal roundness.
3. **Shadows**: reserve them for what should visually lead (primary CTA, hero visual). Flat
   cards with a 1px border read as more premium than shadow-on-everything, especially for
   trade/B2B audiences.
4. **Accent color**: choose and justify it against the brand/industry — do not default to
   the purple-gradient palette that has become the AI-generated-website tell.
5. **Section rhythm**: vary layout between sections (text-left/image-right, full-bleed
   image bands, dense tables) — not every section should be a centered-icon-grid.
