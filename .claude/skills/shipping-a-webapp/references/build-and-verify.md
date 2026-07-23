# Build and verify

## Accept the plan in auto mode

Once the plan reads correctly, accept it in **auto mode**. In auto mode the agent runs
commands without asking permission each time — but it still asks before **destructive**
actions (e.g. deleting data). The agent lays out tasks for itself and, in parallel, checks the
Supabase setup: it sees the organization, confirms the free tier, and **creates the project
itself** in Frankfurt.

Refresh Supabase and the new project (e.g. `skill-shop`, `eu-central`) appears. The agent
then builds the entire database schema — it knows which tables an app like this needs — with
no manual work in Supabase.

## Phased build

The agent splits the work into **phases** and does them in order, login first. After a phase
it pauses so the result can be checked. Typical order: auth/login → dashboard → core CRUD
(e.g. browse products, leave a review) → purchase list → any admin/owner views.

## Verify each phase before continuing

Do not just say "continue" blindly. After the **login phase**:

- Log in locally with the admin email/password; set a new password if prompted.
- In **Supabase → Authentication**, confirm the user was created. New users created later
  appear here too.
- In **Supabase → Database / Table editor**, confirm the tables the agent designed exist
  (e.g. a reviews table keyed per user, plus products and purchases tables). In **Profiles**, confirm who
  is admin.

When a phase looks right, tell the agent to continue to the next. When all phases are done,
open the app in the browser and exercise it end to end: create items, tick them, watch the
review flow, create a test user, copy its login details, confirm the
"password change pending" flag.

If something is wrong or a feature is missing, say so plainly — but a well-planned build often
needs no rework at all. The payoff of the planning step shows up here.

## Local vs live

At this point the app runs only locally — the address bar shows `localhost`. It is **not** on
the internet yet. Deploying is the next step (`references/deploy-and-update.md`).

## Row-level security, file storage, and self-testing

For any app with more than one user, the agent sets up **row-level security (RLS)** in
Supabase so each account can read only its own rows. During the phased build the agent often
**self-tests** this: it logs in as the admin and as a seeded test user, exercises the flows,
and explicitly tries to reach another user's data to confirm the RLS policies block it. When
it reports this, still verify yourself — log in as the test user and confirm you cannot see
other users' records.

If the app uploads files, confirm the **storage** path too: upload an asset, confirm it lands
in the Supabase Storage bucket, and confirm it renders back in the app. A first upload
sometimes surfaces a bucket-limit or policy error — copy the exact message to the agent and
have it fix, then re-test.

## Persist project memory with CLAUDE.md (/init)

A new chat session starts with no knowledge of the project and would have to re-discover it.
Prevent that: run the agent's **`/init`** command once. It writes a **`CLAUDE.md`** into the
project folder capturing the project context (domain, Supabase setup, upload flow, etc.).
That file auto-loads at the start of every future session, so the next chat already knows the
app. Re-run `/init` (or ask the agent to update `CLAUDE.md`) after big structural changes.
