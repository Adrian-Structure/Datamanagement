# Section formulas and intake schema

## Intake schema (JSON)

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
  "steps": [
    "Connect your CRM",
    "Map your onboarding playbook once",
    "Pilotly runs every new account against it automatically"
  ],
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

### Field constraints (enforced by `scripts/generate_prompts.py`)

- `product_name`, `category`, `audience`, `problem`, `solution`, `cta_text`: required, non-empty.
- `features`: 3 to 4 items, each with `name` and `benefit`.
- `steps`: exactly 3 items.
- `testimonial_roles`: exactly 3 items — job titles, never real people's names.
- `pricing_tiers`: 2 to 4 items; at most one `highlight: true`.
- `style`: all three of `background`, `accent`, `tone` required.
- `footer_links`: optional, defaults to `["Product", "Pricing", "About", "Contact"]`.

## The 7 section formulas

Each formula below is a template. Every generated prompt ends with the scope-lock sentence
("Build only this section, no other content.") — never omit it, even when writing by hand.

### 1. Hero

State: category + product name + audience + what it automates/solves. Require: one bold
headline that states the outcome (not a feature list), one supporting subheadline that
clarifies what the product does, exactly one primary CTA button using `cta_text`. Set the
visual tone here (`style.background` / `style.accent` / `style.tone`) — every later section
must match it.

### 2. Problem → Solution

Problem first, solution second, never combined into one paragraph. The problem names the
specific pain from the brief (`problem`) in language the named `audience` would recognize.
The solution positions the product as the direct answer to that exact pain, not a generic
description of the product category.

### 3. Features + benefits

One card per `features` item. A feature name alone is never enough — every card pairs the
feature with its benefit, in the audience's terms, in 1-2 sentences. 3-4 cards is the
ceiling: more overwhelms a first-time visitor.

### 4. How it works

Exactly 3 steps from `steps`, phrased so a non-technical member of `audience` reads them as
simple and low-effort. No step should require the reader to already understand the product.

### 5. Social proof

3 testimonials, one per `testimonial_roles` entry. Each shows a name, title and company
(placeholder names only until real customer quotes are collected — never fabricate real
people). Testimonials cite a specific result, never a generic compliment ("great product").

### 6. Pricing

One tier per `pricing_tiers` entry, side by side. Exactly one tier visually highlighted
(the one marked `highlight: true`) so it becomes the default anchor without hiding the
others. Lower-risk cues (e.g. "no credit card required") belong on the entry-level tiers,
not the enterprise tier.

### 7. Final CTA + footer

Closing headline restates the core benefit from the hero — same claim, different words.
One more instance of the same `cta_text` button, nothing new introduced. Footer carries:
logo, nav links (`footer_links`), social icons, copyright + privacy-policy link. This is
the last chance for visitors who scrolled past every earlier CTA.

## Why the order is fixed

Each section answers the question the previous one raised: hero earns attention → problem
proves relevance → solution earns belief → features show how → how-it-works removes
setup fear → social proof adds outside credibility → pricing removes ambiguity → final CTA
catches everyone who scrolled without clicking. Reordering breaks that chain — e.g. pricing
before social proof asks for a decision before trust is established.
