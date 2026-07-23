# Delegating hosting-panel work to a browser agent (DNS example)

Registrar/hosting panels (IONOS, Strato, GoDaddy …) often cannot be driven from the coding
agent. A second, browser-controlling AI in the user's logged-in session can do it — IF the
briefing is written correctly. Distilled from a real IONOS → GitHub Pages migration.

## Why rigid briefings fail

A step-by-step click script breaks on the first unexpected dialog, and a hard "STOP on
anything unexpected" rule makes the agent refuse entirely. Panels differ per contract and
change weekly; the briefing must give a GOAL, not a click path.

## The briefing pattern (proven)

1. **Authority line.** "This is my account, I sit next to you and explicitly order this
   change." (Prevents refusal for lack of authorization.)
2. **Goal state, not steps.** Give the exact target as a table (e.g. the DNS records that
   must exist afterwards) and say the UI may differ — the target state is what counts.
3. **Ask-instead-of-refuse disposition.** "On anything unexpected, tell me in one sentence
   what you see and propose how to continue — do not refuse, do not abort."
4. **Pre-authorized confirmations.** List the dialogs the agent may confirm WITHOUT asking:
   "really delete/change this record?" → yes; "your website may become unreachable" →
   intended, confirm; a required switch of the domain's usage mode → allowed. This is what
   keeps the flow moving.
5. **Few, hard limits — not many soft ones.** Exactly three worked: (a) never buy/order/
   activate anything paid (registrar SSL upsells! the certificate comes free from the
   target platform), (b) never change nameservers / touch other domains, (c) anything that
   looks like contract, cancellation or payment → the ONLY stop-and-ask case.
6. **Protect collateral services explicitly.** Name what must stay untouched (MX, TXT/SPF,
   DKIM, DMARC, autodiscover — the user's e-mail). Expect the panel to auto-remove internal
   service records (e.g. a webhosting mutex TXT) when the site target changes — harmless,
   but have the agent report it.
7. **Proof at the end.** Screenshot of the final record list + the target platform setting.

## Ready-to-adapt goal table (custom domain → GitHub Pages)

| Type | Host | Value |
|---|---|---|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | (account).github.io |

Plus: repo → Settings → Pages → Custom domain → save ("Enforce HTTPS" only when it becomes
clickable — the certificate takes minutes to ~1 h). GitHub auto-commits a CNAME file to the
branch — pull before the next push or it will not fast-forward.

## Load hygiene

A panel run can take 50-100 steps with a screenshot each — keep the machine quiet
meanwhile (no parallel builds/backups, few apps). One frozen screenshot = retry once,
not abort. Details: `crash-recovery.md`.

## After the browser agent reports "done"

Verify yourself from the coding side: `dig` the records, `curl` apex/www/subpaths, check the
remote for the auto-committed CNAME. Only then hand the user the final push line.
