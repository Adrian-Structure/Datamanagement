#!/usr/bin/env python3
"""Generate the 7 scoped landing-page prompts from a JSON brief.

Local-only, stdlib-only, no network access, no telemetry. Reads a JSON brief
file, validates it against the constraints in references/section-formulas.md,
and prints (or writes) 7 ready-to-paste prompts, each ending with the
scope-lock sentence that stops an AI page builder from regenerating the whole
page from a single-section request.

Usage:
    generate_prompts.py --example
    generate_prompts.py brief.json
    generate_prompts.py brief.json --out prompts.md
"""

import argparse
import json
import sys

SCOPE_LOCK = "Build only this section, no other content."

EXAMPLE_BRIEF = {
    "product_name": "Pilotly",
    "category": "B2B SaaS",
    "audience": "customer success managers and heads of onboarding",
    "problem": (
        "manual onboarding checklists cause missed steps and an inconsistent "
        "first-90-days experience"
    ),
    "solution": (
        "Pilotly runs the entire onboarding workflow automatically and flags "
        "what's stalled"
    ),
    "features": [
        {
            "name": "automated task sequencing",
            "benefit": "every account gets the right steps in the right order without a manager assembling it by hand",
        },
        {
            "name": "stall detection",
            "benefit": "managers see exactly which account is stuck and why, same day it happens",
        },
        {
            "name": "customer-facing progress view",
            "benefit": "customers see their own onboarding status instead of asking your team for updates",
        },
        {
            "name": "native CRM sync",
            "benefit": "onboarding status updates the CRM automatically, no double entry",
        },
    ],
    "steps": [
        "Connect your CRM",
        "Map your onboarding playbook once",
        "Pilotly runs every new account against it automatically",
    ],
    "testimonial_roles": [
        "Head of Customer Success",
        "Onboarding Manager",
        "VP of Customer Experience",
    ],
    "pricing_tiers": [
        {"name": "Starter", "price": "$39/month", "highlight": False},
        {"name": "Team", "price": "$129/month", "highlight": True},
        {"name": "Enterprise", "price": "Contact us", "highlight": False},
    ],
    "cta_text": "Start Free Trial",
    "style": {
        "background": "dark navy",
        "accent": "teal",
        "tone": "premium, enterprise-grade",
    },
    "footer_links": ["Product", "Pricing", "About", "Contact"],
}


def validate(brief):
    errors = []

    for field in ("product_name", "category", "audience", "problem", "solution", "cta_text"):
        if not brief.get(field):
            errors.append(f"'{field}' is required and must be non-empty")

    features = brief.get("features", [])
    if not (3 <= len(features) <= 4):
        errors.append(f"'features' must contain 3 or 4 items, got {len(features)}")
    for i, f in enumerate(features):
        if not f.get("name") or not f.get("benefit"):
            errors.append(f"features[{i}] needs both 'name' and 'benefit'")

    steps = brief.get("steps", [])
    if len(steps) != 3:
        errors.append(f"'steps' must contain exactly 3 items, got {len(steps)}")

    roles = brief.get("testimonial_roles", [])
    if len(roles) != 3:
        errors.append(f"'testimonial_roles' must contain exactly 3 items, got {len(roles)}")

    tiers = brief.get("pricing_tiers", [])
    if not (2 <= len(tiers) <= 4):
        errors.append(f"'pricing_tiers' must contain 2 to 4 items, got {len(tiers)}")
    highlighted = [t for t in tiers if t.get("highlight")]
    if len(highlighted) > 1:
        errors.append("'pricing_tiers' must have at most one item with highlight=true")

    style = brief.get("style", {})
    for field in ("background", "accent", "tone"):
        if not style.get(field):
            errors.append(f"'style.{field}' is required and must be non-empty")

    if errors:
        raise ValueError("Brief failed validation:\n- " + "\n- ".join(errors))


def hero_prompt(b):
    return (
        f"Build the hero section of a landing page for a {b['category']} company called "
        f"{b['product_name']} that helps {b['audience']}. The hero should have a bold "
        f"headline that communicates the core benefit, a supporting subheading that "
        f"clarifies what the product does, and a single primary call-to-action button that "
        f"says \"{b['cta_text']}\". Use a {b['style']['background']} background with "
        f"{b['style']['accent']} as the accent color and make the overall aesthetic feel "
        f"{b['style']['tone']}. {SCOPE_LOCK}"
    )


def problem_solution_prompt(b):
    return (
        f"Add a problem and solution section below the hero. The problem should describe, "
        f"for {b['audience']}: {b['problem']}. The solution should position "
        f"{b['product_name']} as: {b['solution']}. Keep the copy concise and written "
        f"specifically for {b['audience']}. {SCOPE_LOCK}"
    )


def features_prompt(b):
    feature_lines = []
    for f in b["features"]:
        feature_lines.append(f"\"{f['name']}\" with the benefit of {f['benefit']}")
    joined = "; ".join(feature_lines)
    return (
        f"Add a features and benefits section below the problem and solution section. "
        f"Include {len(b['features'])} feature cards: {joined}. Use icons and keep each "
        f"description to two sentences. {SCOPE_LOCK}"
    )


def how_it_works_prompt(b):
    step_lines = [f"Step {i + 1} is {s}" for i, s in enumerate(b["steps"])]
    joined = ". ".join(step_lines)
    return (
        f"Add a how it works section below the features section. Show three steps. "
        f"{joined}. Make the steps feel simple and achievable for a non-technical member "
        f"of {b['audience']}. {SCOPE_LOCK}"
    )


def social_proof_prompt(b):
    roles = ", ".join(b["testimonial_roles"])
    return (
        f"Add a social proof section below the how it works section. Include "
        f"{len(b['testimonial_roles'])} testimonials for these roles: {roles}. Display the "
        f"name, title and company for each testimonial, and have each one cite a specific, "
        f"concrete result rather than a generic compliment. {SCOPE_LOCK}"
    )


def pricing_prompt(b):
    tier_lines = []
    for t in b["pricing_tiers"]:
        marker = " (highlighted/most popular)" if t.get("highlight") else ""
        tier_lines.append(f"{t['name']} at {t['price']}{marker}")
    joined = ", ".join(tier_lines)
    return (
        f"Add a pricing section below the social proof section. Include these tiers: "
        f"{joined}. Include comprehensive info about each tier and make sure the "
        f"highlighted tier stands out visually while all tiers remain easy to compare. "
        f"{SCOPE_LOCK}"
    )


def final_cta_prompt(b):
    footer_links = ", ".join(b.get("footer_links") or ["Product", "Pricing", "About", "Contact"])
    return (
        f"Add a final call-to-action section at the bottom of the page with a bold "
        f"closing headline that reinforces the core benefit of {b['product_name']}, a "
        f"short supporting sentence, and a prominent \"{b['cta_text']}\" button. Below "
        f"that, add a clean footer with navigation links for {footer_links}, the "
        f"{b['product_name']} logo on the left, social media icons on the right, and a "
        f"copyright notice and privacy policy link at the very bottom. {SCOPE_LOCK}"
    )


SECTIONS = [
    ("1. Hero", hero_prompt),
    ("2. Problem / Solution", problem_solution_prompt),
    ("3. Features + Benefits", features_prompt),
    ("4. How It Works", how_it_works_prompt),
    ("5. Social Proof", social_proof_prompt),
    ("6. Pricing", pricing_prompt),
    ("7. Final CTA + Footer", final_cta_prompt),
]


def render(brief):
    lines = []
    for title, fn in SECTIONS:
        lines.append(f"## {title}\n")
        lines.append(fn(brief))
        lines.append("")
    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("brief", nargs="?", help="Path to a JSON brief file")
    parser.add_argument("--example", action="store_true", help="Use the bundled example brief")
    parser.add_argument("--out", help="Write output to this file instead of stdout")
    args = parser.parse_args()

    if args.example:
        brief = EXAMPLE_BRIEF
    elif args.brief:
        with open(args.brief, "r", encoding="utf-8") as fh:
            brief = json.load(fh)
    else:
        parser.error("provide a brief JSON file or --example")
        return

    try:
        validate(brief)
    except ValueError as e:
        print(str(e), file=sys.stderr)
        sys.exit(1)

    output = render(brief)

    if args.out:
        with open(args.out, "w", encoding="utf-8") as fh:
            fh.write(output)
    else:
        print(output)


if __name__ == "__main__":
    main()
