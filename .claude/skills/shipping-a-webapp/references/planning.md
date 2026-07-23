# Planning — the plan-first, sparring-partner method

This is the highest-leverage step. A good first version comes from planning well, not from
prompting hard afterwards. Time spent here saves hours of back-and-forth and tokens later.

## Before the agent: sketch the app

Have the user roughly sketch the app on paper — which screens, which features, who does what.
This clarifies the request and gives the agent something concrete to react to.

## Give the design system as images

If the user cares how the app looks, hand the agent the visual style as **images**, not prose.
Pick or assemble a theme (a design-system generator with named themes works well), take
screenshots of the palette and components, grab the typography, and attach them to the first
build prompt. The agent matches a concrete visual far better than a written description like
"make it modern". Attach these images alongside the prompt in step 2 (build), not during
read-only planning.

## Put the agent in plan mode

Switch the coding agent to its read-only **plan mode**. In this mode it can read files,
research on the web, and reason — but it does not yet write files or run build commands. The
goal is a shared, written plan before any code exists.

## The opening prompt (template)

Give one rich first message, not a terse command. Dictating it by voice usually communicates
intent better than typing. Adapt:

> I want to build a web app together with you: **[one-paragraph description of the app and who
> uses it]**. **[Key rules, e.g. how accounts/roles work.]**
>
> Please act as my sparring and discussion partner. Ask me questions so you understand exactly
> what I mean — about feature scope, design, and anything you need to build a clean app. If I'm
> unsure on a question, give me your recommendation with a short reason. You're allowed to be
> honest and disagree if you have concerns about my answer.
>
> Technical notes: it should later be hosted on Node.js web hosting. Use **Next.js**. Use
> **Supabase** (region Frankfurt) as the database, because you have a direct connector to it
> and can drive the whole instance.

## Why the sparring framing matters

Told to *interview* the user, the agent surfaces decisions the user hadn't considered
(review rules, privacy between users, owner scope, UI languages) and applies what it knows
about how apps are normally built. This is what makes the first build come out coherent
rather than needing rounds of correction.

Expect roughly **10-20 minutes and a dozen-plus questions**. Answer them; where unsure, take
the agent's recommendation.

## Edit the plan before building

When the plan is written, read it through. Common corrections:

- "Run **locally first**, deploy later" — stop the agent from trying to deploy immediately.
- "Use Supabase for **authentication** too, not just data."
- "Add **me** as the admin user."

Make these edits in plan mode. The agent revises the *plan*, doesn't start coding, and may ask
follow-ups (e.g. whether it should create the Supabase project itself — yes, it should).

Only once the plan reads correctly do you move to auto mode and let it build
(`references/build-and-verify.md`).


## Image rule (binding)

Never crop supplied artwork. Match containers to each image's native aspect ratio, or use `object-fit: contain` with a background fill. Forcing images into a foreign aspect ratio with `object-fit: cover` cuts off content and looks unprofessional — if a uniform grid is wanted, pad with the surface color instead of cropping.
