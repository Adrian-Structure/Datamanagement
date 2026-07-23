# Single-offer path — intake schema

Used by `scripts/generate_prompts.py`. Do not hand-write the 7 prompts — the script is the
enforcement mechanism for the constraints below; prose alone drifts (CTA text varies
section to section, scope lock gets dropped, section count varies).

```json
{
  "product_name": "Pilotly",
  "category": "B2B SaaS",
  "audience": "customer success managers and heads of onboarding",
  "problem": "manual onboarding checklists cause missed steps and an inconsistent first-90-days experience",
  "solution": "Pilotly runs the entire onboarding workflow automatically and flags what's stalled",
  "features": [
    {"name": "automated task sequencing", "benefit": "every account gets the right steps in the right order without a manager assembling it by hand"},
    {"name": "stall detection", "benefit": "managers see exactly which account is stuck and why, same day it happens"},
    {"name": "customer-facing progress view", "benefit": "customers see their own onboarding status instead of asking your team for updates"},
    {"name": "native CRM sync", "benefit": "onboarding status updates the CRM automatically, no double entry"}
  ],
  "steps": ["Connect your CRM", "Map your onboarding playbook once", "Pilotly runs every new account against it automatically"],
  "testimonial_roles": ["Head of Customer Success", "Onboarding Manager", "VP of Customer Experience"],
  "pricing_tiers": [
    {"name": "Starter", "price": "$39/month", "highlight": false},
    {"name": "Team", "price": "$129/month", "highlight": true},
    {"name": "Enterprise", "price": "Contact us", "highlight": false}
  ],
  "cta_text": "Start Free Trial",
  "style": {"background": "dark navy", "accent": "teal", "tone": "premium, enterprise-grade"},
  "footer_links": ["Product", "Pricing", "About", "Contact"]
}
```

## Field constraints (enforced by the script)

- `product_name`, `category`, `audience`, `problem`, `solution`, `cta_text`: required,
  non-empty.
- `features`: 3 to 4 items, each with `name` and `benefit`.
- `steps`: exactly 3.
- `testimonial_roles`: exactly 3 — job titles, never real people's names.
- `pricing_tiers`: 2 to 4; at most one `highlight: true`.
- `style`: `background`, `accent`, `tone` all required — apply the design corrective when
  choosing these, don't default to a purple/violet gradient.
- `footer_links`: optional, defaults to `["Product", "Pricing", "About", "Contact"]`.

## Section order (fixed, script-enforced)

hero → problem/solution → features+benefits → how-it-works → social proof → pricing →
final CTA + footer. Each generated prompt ends with the scope-lock sentence
("Build only this section, no other content.").
