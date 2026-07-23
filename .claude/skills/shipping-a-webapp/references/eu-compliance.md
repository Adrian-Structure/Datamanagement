# EU compliance (GDPR) — build it in from day one

In the EU a website is not "done" without its legal layer. Retrofitting is rework;
the starter template ships compliant by design. Distilled from a real compliance pass
(3-agent build + audit) on a live shop.

## The four mandatory pages
Imprint (Impressum), privacy policy, terms, withdrawal — as first-class routes, linked
from the footer of every page. **Never invent the operator's mandatory data**: ship them
as loud `[OWNER: ...]` placeholders with a per-page checklist; each page carries
"Draft — have it reviewed legally before publishing."

## Privacy policy = the app's REAL processing
Write it against the actual code, not from boilerplate: hosting/server logs, auth
provider (name the region, e.g. Supabase EU/Frankfurt), payment provider (merchant of
record), what reviews display publicly (partly anonymized e-mail), local-storage use.
If the site sets no cookies and loads nothing from third parties at runtime, SAY so.

## No-tracker architecture beats consent banners
Design so no consent banner is NEEDED: no third-party fonts/scripts/analytics, assets
self-hosted, localStorage only for functional state (language, session) — that falls
under the "strictly necessary" exemption. Verify with grep (cookie|analytics|gtag|fbq|
pixel|fetch to foreign hosts) and document the zero-findings as evidence. Do not add a
banner "just in case" — consent theater erodes trust.

## Data-subject rights as UI, honestly
"My data" (Art. 15): show exactly what is stored (e-mail, purchases, own reviews).
"Delete account & data" (Art. 17): delete what the client CAN delete (own rows via RLS),
sign out — and state honestly that final account deletion is confirmed by the operator
via e-mail (a browser client has no service role). Never fake a deletion.

## Transparency at the point of entry
One visible sentence BEFORE each form submits: what data, what purpose, where stored,
link to the privacy policy. Plain data minimization instead of checkbox rituals for
pure contract data.

## The hosting third-party trap
"No third parties" claims must include the HOST: GitHub Pages/Vercel etc. process every
visitor's IP in server logs — a US host means a US transfer to disclose (Data Privacy
Framework note), or choose an EU host. The template's placeholder forces this decision.

## Operator's contract-level duties (not code)
Data-processing agreements (AVV) with the auth provider and payment provider; supervisory
authority named; legal review before go-live. List these as the owner's go-list.
