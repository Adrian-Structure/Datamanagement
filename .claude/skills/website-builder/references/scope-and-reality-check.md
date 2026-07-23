# Scope decision and reality check

## Three page shapes — pick one before writing anything

1. **Single-offer conversion page** — unfamiliar brand, one product, one desired action
   (trial signup, demo request), cold/lukewarm traffic that needs convincing before it will
   act. → single-offer path (`single-offer-schema.md` + `scripts/generate_prompts.py`).
2. **Multi-service vertical site** — one brand, several services under one roof, wants a
   full multi-page site reusable across clients/industries by swapping one config file
   (a craftsman, a clinic, a local multi-service business). → multi-service path
   (`multipage-config-schema.md`).
3. **Multi-product brand hub** — an already-trusted brand routing visitors across many
   distinct product lines. **Not covered by this skill's formulas as-is.**

If the request is ambiguous between these, ask which job the page has to do before picking
a structure.

## Why shape 3 is out of scope, checked against real sites

Checked against Windows (live-fetched) and Apple, Tesla, Mercedes-Benz, Nvidia (from
stable, well-documented public knowledge — their domains blocked live fetch when this was
checked; re-verify live if a real decision depends on current detail). None of the five use
a single-CTA/problem-solution formula:

- Every product/segment block carries its **own CTA** (5+ distinct CTAs on the Windows
  homepage alone) — one CTA is the wrong rule for a page representing many offers at once.
- **No problem/pain-point section** — visitors already trust the brand and know why they
  might want the product; that section only earns its place when trust must be built first.
- **Testimonials, if present, are sparse and informal** (one social-media quote on Windows,
  no 3-testimonial name/title/company block) — that pattern belongs to unfamiliar brands
  manufacturing trust, not established ones.
- **No SaaS-style tiered pricing table on the homepage** — pricing, where shown, is a single
  reference point; comparisons live on a dedicated product page.
- Two patterns not in either formula here but observed on Windows and worth borrowing for
  competitive categories: a **comparison table** (us vs. named alternatives) and an
  **FAQ accordion**.

If a request turns out to be shape 3: drop the single-CTA rule (one CTA per product block
instead), drop the forced problem/solution section, treat testimonials and tiered pricing
as optional, and say so rather than forcing shape 1 or 2 onto it.
