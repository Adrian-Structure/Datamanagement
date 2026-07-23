# Current tools, models, skills, hosting (post-2026 state — the part a stock model does not know)

> State as of mid-2026. Names and prices drift; verify before quoting to a client.

## Helper skills for the coding agent
- **Frontend-design skill** (vendor-built, free): runs in the background, bans
  the most overused fonts, pushes bold direction and restrained sensory copy.
  Install once, benefits every project.
- **UI/UX mega-skill** (community, npm-installed, slash-invoked): ~57 UI
  styles, ~95 color palettes, ~56 font pairings. Call it explicitly at build
  time for a big design intervention. Install phrasing matters: "install this
  plugin using npm".

## Component libraries
- **21st.dev** — pre-made components (backgrounds, scroll effects, buttons,
  cards) with a **copy-prompt button**: the prompt, pasted to the agent,
  recreates the component in-project. Everything stays editable code.
- **CodePen** — same pattern, browse + adapt.
- Rule: browse when you don't know what you want ("you don't know what you
  don't know — but once you see it, you know it").

## Image/video generation (current model names)
- **Aggregators** (one tab, many models): Higgsfield; also an aggregator tier
  from a well-known voice-AI company. Typical chain: image model → image as
  first frame → video model → upscaler (Topaz).
- Image: **GPT Image 2** (photoreal), **Seedream 4.5**, **Recraft V4.1 vector
  mode** (true SVGs — rescalable, recolorable, text-editable; use for logos).
- Video: **VO3.1**, **Kling 3.0**, **Seedance 2.0** (2D-illustration
  animation style works well for explainers).
- Workflow rule: the coding agent writes the generation prompt (it knows the
  brand); the user only pastes and picks.

## Open-model alternative: Kimi K3 (Moonshot AI, launched mid-2026)
- First open model in the ~3-trillion-parameter class; 1M-token context;
  natively multimodal; open weights released July 2026. Free tier at kimi.com.
- **Vision-in-the-loop**: when it builds a page or game it screenshots its own
  output, spots layout errors, and fixes them — strong for visual builds.
- **Websites mode with a built-in premium template gallery**, including
  full-stack templates (backend included) — template-first as a product
  feature. Worth checking before hand-building a stack.
- Caveats (vendor's own): unstable if switched to mid-session (start fresh);
  takes too much initiative — state boundaries explicitly up front.

## AI design canvas (the design-tool route)
A current-generation design canvas ships: design systems (brand assets,
GitHub/Figma import), templates (website, slides, documents, social, ad
studio), Figma-like direct editing + markup, present mode with speaker notes,
MCP connectors (image/video service, Google Workspace, Microsoft 365), export
to PPTX/PDF/ZIP/HTML — and a sync path to the coding agent (see
`design-weg.md`). Usage shares one session/weekly limit with the chat and
coding products.

## Hosting decision
- **Static site, no login/DB** → cheapest tier of a budget host (~$43/year
  with domain, 12-month minimum for the free domain) or GitHub + Vercel free.
- **Accounts, payments, database** → Node-capable tier (one step up), or
  Netlify with environment variables for secrets (mark them as secret values).
- **The zip trick**: zip the folder's CONTENTS, not the folder — index.html
  must sit at the zip root or the domain serves a blank page.
- Deploy errors: paste them verbatim back to the agent; it fixes them.
