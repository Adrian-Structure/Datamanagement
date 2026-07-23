# Parallel agents — an optional scaling layer

Once the base app builds and deploys (SKILL.md steps 1-6), you can go faster by running
several coding agents at once instead of one. The mindset shift: you stop coding and start
**managing AI processes**. Three roles.

Use this only when the foundation works. On a fresh, empty project it adds coordination
overhead for no gain — a single agent is faster until there is a repo to parallelize against.

## Role 1 — Co-pilot (a planning chat, not a coder)

Open a normal chat (not the coding agent), pin it, and treat it as a strategy partner. Its
job is **not** to write the app; it is to:

- brainstorm scope, features and monetization,
- **generate the prompts** you hand to the coding agents (the initial build prompt, and small
  feature prompts for the juniors),
- take your "where are we?" updates and suggest the next step.

You talk to this chat continuously throughout the build.

## Role 2 — Senior agent (one, working locally)

One coding-agent instance opened on the **local project folder** (local mode). It:

1. initializes and scaffolds the project from the co-pilot's build prompt (attach the design
   images here),
2. runs the app locally so you can inspect it,
3. **fixes issues** — e.g. paste a failed deploy error here and let it resolve,
4. **merges** work back: pulls merged pull requests into the local tree, keeps the main line
   coherent.

There is exactly one senior. It owns the local project and the integration.

## Role 3 — Junior agents (several, working on the repo)

After the senior has pushed the project to GitHub, open **additional** coding-agent instances
in **default / repository mode** (not local) pointed at that GitHub repo. Give each **one
small, self-contained feature** from the co-pilot's prompts — e.g. a toast notification, a
light-mode toggle. Each junior:

1. works directly against the repo in its own branch,
2. opens a **pull request** with just its feature.

Run three to five juniors in parallel. Because each touches a small, separate slice, they
rarely collide.

## The loop

```
co-pilot chat        →  generates build + feature prompts
   │
   ├─ senior (local) →  scaffold → run → push to GitHub
   │                        ↑ fixes errors, pulls merged PRs
   └─ juniors (repo) →  feature branches → pull requests
                              │
                        review & merge PRs on GitHub
                              │
                        senior pulls locally → verify → redeploy
```

Deploy/redeploy is unchanged (`references/deploy-and-update.md`): merged code on GitHub
triggers the host to rebuild.

## Guardrails

- **One senior, one local tree.** Multiple agents editing the same local folder corrupt each
  other. Juniors work on the repo, never on the senior's local copy.
- **Small, orthogonal junior tasks.** Overlapping features cause merge conflicts; split the
  work so branches touch different files.
- **Review PRs before merging.** Parallelism multiplies output, not correctness — read each PR
  (or have the senior review it) before it lands.
- **Escalate deploy failures to the senior**, not to a junior — the senior owns integration.
- **Model choice:** juniors can run a capable general model; there is little benefit to the
  most expensive tier for small, well-scoped features.

## When NOT to use this

- The app is a small prototype a single agent finishes in minutes.
- There is no repo yet (parallelize only after the first push).
- Features are tightly coupled (they will conflict; do them sequentially with the senior).
