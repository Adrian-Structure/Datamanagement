# Stack and connectors

Three building blocks plus version control. All chosen so a beginner stays cheap, keeps data
in the EU, and lets the agent do the wiring.

## 1. Coding agent (desktop app)

Install the desktop app for the coding agent, sign in, and open its **code** section. Work
always happens inside one **project folder** on the machine — create an empty folder for the
app (e.g. `skill-shop`) and open it. The agent can then create, read, run and change files
in that folder. No terminal or IDE needed.

## 2. Supabase — database + authentication (connector)

Supabase covers **two** jobs: authenticating users and storing data (products, purchases, reviews, etc.).

Setup:

1. Create a free Supabase account; open the dashboard; create an **organization**. Do **not**
   create the project by hand — the agent does that.
2. In the agent's app: **Customize → Connectors**, find **Supabase**, click **Connect**, and
   log in to Supabase in the browser that opens.
3. This is an **MCP connection** (Model Context Protocol — a standard that lets AI agents work
   with external tools). From here the agent can create the project, tables, security rules
   and users itself.

Region: **Frankfurt (`eu-central`)** for GDPR data residency. The **free tier** is enough for
most apps.

## 3. GitHub — version control + deploy pipe (plugin)

GitHub is cloud storage for code: a backup, a version history to roll back to, and the source
the host pulls new code from. Free.

Setup:

1. Create a GitHub account.
2. In the agent's app: **Customize → Plugins → browse plugins**, search **GitHub**, click
   **+** to install it.
3. Open the GitHub plugin's **connectors** and log in to authorize the account.

Also install **Git** locally (the actual versioning system, distinct from GitHub the website).
The agent usually offers to install it; otherwise install it from the official Git site for the
OS. Without Git, snapshots and roll-back won't work.

Terminology: **push** = upload code to GitHub; **pull** = download it. A **repository** ("repo")
is just a project/folder on GitHub.

## 4. Hosting — Hostinger Node.js hosting

Deploy target (details in `references/deploy-and-update.md`). EU server, fixed monthly price,
no usage fees, up to 5 apps per plan, domain + business email free the first year.

## Cost breakdown

- **Coding agent:** a paid plan is needed to use the agent (~€18/mo). Can be paused after
  development is done.
- **Supabase:** free tier, typically €0.
- **Hosting:** from ~€4/mo; a 12-month term is well under €60 and hosts up to 5 apps.

So during development ~€18/mo, and ~€4/mo to keep an app live afterwards. Building custom
software this cheaply is new — it used to require hiring developers.

## Context7 — up-to-date documentation (connector)

Before building, connect the free **Context7** connector (Customize → Connectors → add →
search "Context7"; register once, free). It gives the agent current documentation for
Supabase and the framework, so it doesn't wire the backend from possibly-outdated training
data. In practice this removes a common class of "the integration code is subtly wrong"
failures. Connect it in the same pass as Supabase and GitHub.

Note on Supabase: the same backend also handles **file storage** (a `Storage` area with
buckets, e.g. a `project-assets` bucket) — uploaded images/logos/documents live there and are
served back into the app. The agent sets the storage bucket and its access rules up itself.
