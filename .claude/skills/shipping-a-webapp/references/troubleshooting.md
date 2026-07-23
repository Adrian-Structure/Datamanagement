# Troubleshooting

Ordered checks — rule out the cheap, common causes before assuming a deep bug.

## 1. The first version is off / the agent flails while building
**Cause:** planning was rushed; the agent never fully understood the request.
**Fix:** return to plan mode, let it finish interviewing, edit the written plan to fix scope
and misreadings, *then* build. Most "the app is wrong" problems are really "the plan was thin".

## 2. App only reachable on `localhost`
**Cause:** this is expected before deployment — the app is local until pushed and deployed.
**Fix:** none needed; proceed to deploy (`references/deploy-and-update.md`).

## 3. Deploy fails on the host
**Cause:** most often missing or wrong environment variables; sometimes a build error.
**Fix:** copy the exact error the host shows, paste it to the agent, say "I got this error,
fix it." Re-run the preflight script to confirm `.env` completeness before retrying.

## 4. App loads live but can't reach the database
**Cause:** the imported environment variables are missing the Supabase URL or keys.
**Fix:** in the agent's project files, open `.env`, confirm the Supabase variables are present,
and re-import `.env` into the host's deploy settings. Redeploy.

## 5. Agent can't create the Supabase project / tables
**Cause:** the Supabase connector (MCP) isn't linked or authorized.
**Fix:** Customize → Connectors → Supabase → Connect, log in, confirm it shows connected. Then
ask the agent to retry. Test independently: "use Supabase to list my projects" — if that fails,
the connector is the problem, not the build.

## 6. Agent can't push to GitHub
**Cause:** the GitHub plugin/connector isn't installed or authorized, or Git isn't installed
locally.
**Fix:** Customize → Plugins → install GitHub; open its connectors and log in. Install Git
locally if prompted. Then ask the agent to create the repo and push again.

## 7. Roll-back / version history doesn't work
**Cause:** Git (the local versioning system) isn't installed — distinct from GitHub the site.
**Fix:** install Git from its official site for the OS, then let the agent re-initialize the
repository. Snapshots and roll-back work afterwards.

## Escalation

If a blocker is outside this list — the host rejects the deploy for account reasons, a payment
or verification step is required, a connector refuses to authorize — stop, print a
`⛔ ACTION NEEDED` line naming the exact blocker and the single action the user must take, and
wait. Do not loop retries, and never report the app as live when it is not.

## 8. Live app shows "Internal Server Error" immediately after deploy
**Cause:** environment-variable *names* on the host don't match the app's `.env.local` keys
(e.g. `SUPABASE_URL` vs `NEXT_PUBLIC_SUPABASE_URL`).
**Fix:** open the host's env-var editor, rename each key to exactly match `.env.local`, apply,
let it rebuild. Confirm the offending name from the runtime logs.

## 9. Admin can't create user accounts on the live app
**Cause:** the `SUPABASE_SERVICE_ROLE_KEY` secret isn't set on the host (kept out of the repo
on purpose).
**Fix:** generate the service-role key in Supabase (Project Settings → API Keys), add it as an
environment variable in the host, apply, redeploy.
