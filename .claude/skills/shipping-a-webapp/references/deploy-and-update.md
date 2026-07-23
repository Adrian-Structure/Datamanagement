# Deploy and update

## Preflight check first

Before deploying, run the bundled check against the project folder:

```bash
bash ${CLAUDE_SKILL_DIR}/scripts/preflight.sh /path/to/project
```

It verifies that **Git** and **Node** are installed and that the project's **`.env`** carries
the required Supabase variables (project URL + keys). Reading the output:

- **`✅ ALL CHECKS PASSED`**, exit code 0 — safe to deploy.
- **`⛔ ACTION NEEDED`**, non-zero exit — the listed item is missing. Fix exactly that (install
  Git/Node, or add the missing key to `.env`) and re-run. Do **not** start the deploy until it
  passes; a missing env var is the most common cause of a failed first deploy.

## Step 1 — push the code to GitHub

Tell the agent: "I've given you access to my GitHub account — create a new repository for my
app and push the code." The agent asks **public or private** (choose **private** so only you
see the code) and a repo name. It creates the repo, pushes the code, and generates a README on
GitHub describing the app and its Supabase setup. The code now exists in the cloud and can be
pulled onto other machines.

## Step 2 — deploy on Hostinger (Node.js hosting)

1. Choose the Node.js hosting plan and term; add a **domain** and
   mailbox if offered.
2. After payment, set the domain, then **deploy from GitHub** — link the GitHub account and
   select the app's repo.
3. The host **auto-detects Next.js** — confirm it.
4. **Add environment variables.** These are the secrets the app needs (the Supabase project
   URL and keys), stored in the project's **`.env`** file that the agent created. In the
   agent's app, open the project files, find `.env`, and **import** it in the host's deploy
   settings so the values are filled in automatically.
5. Click **deploy**. The host pulls from GitHub and builds. When it finishes, the app is
   reachable on the domain — log in and confirm data persisted (the same items appear).

If a deploy error appears, copy the exact message, paste it to the agent, and ask it to fix —
usually an env-var issue.

### Alternative host — Vercel

For a prototype you want online fast and free, Vercel is the quickest path:

1. A free account is enough. Create a **new project** and import the app's GitHub repo (it
   often offers the repo you just pushed).
2. Vercel auto-detects Next.js. Add the same Supabase environment variables, then **deploy**.
3. After a minute the app is live on a Vercel URL you can share.

Trade-off vs Hostinger: Vercel is free and fastest to start, but bills by usage as traffic
grows and does not default to an EU region — for a fixed price and EU/GDPR data residency,
prefer the Hostinger path above. If a Vercel deploy fails, copy the error to the senior agent
(`references/parallel-agents.md`) and let it fix, then redeploy.

## Step 3 — the update loop

New features are built locally first, so they are not yet live. To ship them, just tell the
agent: "push my changes live" (or "push my code to GitHub" / "update my app"). Behind the
scenes the agent snapshots the current state, pushes to GitHub, GitHub notifies the host, and
the host redeploys. The host dashboard shows the deployment running, then **complete**; reload
the live app to see the new feature.

This same loop also lets you work from another machine: on that machine, start the agent and
say "pull my code from GitHub", and continue there.

**With parallel agents** (`references/parallel-agents.md`), features arrive as pull requests
on GitHub instead of local edits. Review and merge each PR, then have the senior agent pull
the merged code locally, verify, and redeploy. Merging to the main branch is what triggers the
host to rebuild — so a merged PR goes live the same way a local push does.

## What the host dashboard gives you

Domain management, email setup, deployment history (with success/failure and logs),
performance and analytics. Everything is logged, so a bad deploy is diagnosable.

## Hostinger: connect the Supabase database, and two deploy gotchas

After importing the GitHub repo and deploying, wire the backend from Hostinger's dashboard:
**Database → Connect → Supabase**, authorize access to the Supabase organization, choose
**"connect existing database"**, and pick the project. Hostinger imports the needed
environment variables automatically.

Two specific first-deploy failures to expect:

1. **Internal Server Error right after deploy → env-var *name* mismatch.** The variable names
   in the host must match the app's `.env.local` exactly. A frequent case: the app expects
   `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` but the host imported them as
   `SUPABASE_URL` / `SUPABASE_ANON_KEY`. Open the host's env-var editor, rename to match the
   `.env.local` keys exactly, apply, and it rebuilds. Check the runtime/deploy logs to
   confirm which name is wrong.

2. **Admin-creates-users fails → missing `SUPABASE_SERVICE_ROLE_KEY`.** Creating user accounts
   from inside the app needs Supabase's **service-role key**, which the agent deliberately does
   NOT put in the repo (it's a secret). Generate it in Supabase (Project Settings → API Keys →
   secret key) and add it manually as an environment variable in the host, then apply. The
   agent usually leaves a placeholder for it in `.env.local` and tells you it's required.
