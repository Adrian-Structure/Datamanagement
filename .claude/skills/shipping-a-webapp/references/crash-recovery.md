# Crash and reboot recovery — surviving a mid-build shutdown

Machines crash and users reboot mid-project. A shipping workflow must be built so that a
total shutdown costs minutes, not work. Distilled from a real mid-deploy reboot.

## What survives a reboot, what does not

| Survives | Dies |
|---|---|
| Project source in durable storage (home dir, iCloud/Drive, NAS) | Everything under `/tmp` / `/private/tmp` (temp clones, staged packages) |
| Pushed commits on the remote | Uncommitted/unpushed work in temp clones |
| Files on the Desktop | Running dev servers, background agents, monitors |
| The written journal/ledger of what was done | Anything that existed only in the chat context |

## Rules while building (so a crash stays cheap)

1. **Source of truth lives durable.** The app project, its build output and any data live in
   the user's durable folders — never only in a temp dir.
2. **Temp clones are disposable by design.** Fine for staging a push, but treat them as
   rebuildable in one command; never keep the only copy of anything there.
3. **Journal state continuously** (what is built, what is pending, which handoff is open).
   After a crash, the journal — not memory — says where to resume.
4. **Prefer small, resumable steps** over one giant operation; commit early so work reaches
   the remote instead of waiting in a fragile working tree.

## The resume recipe (run after every restart)

1. **Measure, do not remember:** `ls` the temp workdirs (gone?), `dig`/`curl` the domain
   (did DNS/deploys land before the crash?), `git ls-remote` the repo (what actually got
   pushed?), check the durable project folder (intact?).
2. Report the user a one-screen table: what survived, what was lost, what it costs to
   restore (usually: re-clone + re-copy build = minutes).
3. Rebuild the disposable parts from durable sources; do not rebuild what the measurement
   proves is already live.
4. Re-arm any watchers (progress monitors die with the machine) and restate the open
   handoffs — after a reboot the user must immediately see: "nothing is running, here is
   exactly where we stand, here is your next single action."

## User-facing rule

After a crash, the FIRST message answers: which tasks are running right now? (Usually:
none — they died with the machine.) Then the survival table, then the restored plan.
Never make the user reconstruct the state from memory.

## Preventing the crash in the first place (browser-agent load hygiene)

Long browser-agent runs (dozens of steps, a screenshot per step) put real load on the
machine. A renderer freeze ("Page.captureScreenshot timed out - renderer may be frozen")
is the early warning. Observed in the field: such a freeze coincided with a full system
crash when other load (updates, backup jobs, many apps) hit at the same moment.

- Before a long panel-automation run: close heavy apps, do not run builds/uploads in
  parallel, one browser window is enough.
- If a single step freezes: retry ONCE — in the observed case the retry succeeded
  immediately and the run completed. Do not abort the whole run for one frozen screenshot.
- After a real system crash, find the actual cause instead of guessing: macOS Console app
  -> Crash/Diagnostic Reports (kernel panic, memory pressure). The browser agent cannot
  see system logs — its view is limited to the tab.
