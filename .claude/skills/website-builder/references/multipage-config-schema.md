# Multi-service vertical path — config schema and build checklist

## One config file per client — the only file that changes between clients/industries

Required fields:

- `business_name`, `founding_year`, `industry_claim` (e.g. "Meisterbetrieb für Heizung,
  Sanitär und Bad")
- `services`: list of `{title, description}` — each becomes its own auto-generated subpage.
  Use an even count where practical so grid layouts don't leave a gap (see design
  corrective on varying layout instead of forcing every section into the same grid).
- `service_area`: list of city/district names actually served — real, not invented; each
  can optionally become its own local-SEO subpage (city × service combination).
- `social_proof`: `{rating, review_count, source}` — real numbers only (e.g. from Google),
  never fabricated.
- `experience`: `{years_in_business, employee_count}`
- `lead_magnet`: `{title, format, hook}` — tie the hook to the trade itself (e.g. a
  10-point PDF checklist relevant to that service) rather than a generic "contact us" form;
  a checklist download that requires an email address is a warmer lead than a blank
  contact form because the visitor has already signaled specific intent.
- `emergency_contact`: boolean + phrasing, only if the trade genuinely offers 24/7 service.
- `industry_switch_notes`: one paragraph documenting exactly what changed the last time
  this config was adapted from a different industry — keeps the swap auditable.

## Build step

One prompt against the fixed technical blueprint below, this config, and the design
corrective, generates the full site in one pass. To re-skin for a different client or
industry: edit only this config file, then tell the agent the config changed and to adapt
the existing site accordingly — do not rebuild from scratch.

## Fixed technical/legal checklist (identical on every build, not industry-specific)

- Impressum and Datenschutzerklärung reachable from first load, not stubbed
- Sitemap generated and kept in sync with routes automatically
- `robots.txt` present
- The lead-magnet/contact form posts to a real API route, not a dead end
- Every external service the site needs (transactional email, maps embed, analytics) is a
  declared env var placeholder in the project's env example file — never a hardcoded key
  in source
- Hand off to the `website-dsgvo` skill for the legal layer before go-live — do not
  duplicate that check here

## Scope note

This path is for a business with **several services under one brand** wanting one
multi-page site. For a **single product/single offer**, use the single-offer path instead.
For a **multi-product hub of an already-trusted brand**, see
`scope-and-reality-check.md` — neither path here applies as-is.
