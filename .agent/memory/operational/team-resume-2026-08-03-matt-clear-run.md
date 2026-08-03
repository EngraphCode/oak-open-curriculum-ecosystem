# Team resume — the Matt clear-run quiesce (2026-08-03)

The pushed rehydration surface for the exact agents quiesced at the
owner's word on 2026-08-03 (~09:45Z): "I need all seats other than Birch
to get their work into a fully safe and resumable state, where safe
includes being in an open PR on the remote, and I want all of our PRs
either merged or set to draft. Birch's work will be merged. This is so
Matt has a clear run for his work without churn from ours."

**Reopening gate (owner-agreed)**: the owner declares the
first-submission window closed. At that word: flip #714, #729, and #731
from draft back to ready, remove the temporary Matt block from
`start-right.md` §6a (its text carries the same trigger), and rehydrate
seats from this document.

## How to rehydrate a seat

1. **Same session, resumed** (first choice — this is what makes it the
   EXACT agent): resume the platform session by its id prefix below
   (Claude Code: `claude --resume`, pick the session; Codex: its resume
   flow). The seat wakes with its context and recomputes state
   first-hand per its own resume map. The owner-supplied verbatim
   commands (2026-08-03):

   ```bash
   claude --worktree pds-w0-census-validator --resume "Corsair hunts Surf (4d3282) - Design"

   claude --worktree skylark-clear-lock-cure --resume "Skylark hunts Nimbus (e856d5) - Agentic Mechanisms"

   claude --resume "Vanilla stirs Bough (604af6) - Foundations Review"
   ```

   The Director seat resumes the same way: `claude --resume` in the
   primary checkout, selecting the session titled "Magnetar binds
   Oblivion". Birch needs no resume command (their session stays live
   through the window); the Lichen seat is closed — its corpus draft PR
   is the pickup surface, no session resume involved.
2. **Fresh session, same identity** (fallback): start a seat on the same
   platform/model, follow `start-right-team`, and read the seat's thread
   record named below END TO END before any act. Claims were closed with
   resume-pointer summaries — open a FRESH claim; do not hand-edit old
   rows.
3. Either way: the seat's first question is "what changed since my
   records froze?" — answered by recomputation, never from memory.

## The seats

### Magnetar binds Oblivion (74d914) — Director + commit-warden

- Claude Code / claude-fable-5. Claims a2286c53 (Director) + 4e5f1032
  (warden) RETAINED through the pause.
- Resume map: `director-handoff.md` seated block (the freeze entries;
  the clear-run freeze is the latest). Wake ceremony: monitors →
  warden recompute → board first-hand → gap sweep.
- Board at quiesce: #714 (coordination fold, draft), #729 (draft),
  #731 (draft), #732 (Matt start-right note — merges at full
  condition), and the Lichen corpus draft PR (below). The fold
  ceremony runs after #731 completes post-window.

### Birch holds Seedling (e48fe2) — upstream update lane (LIVE through the window)

- Claude Code / claude-fable-5. The ONLY lane that continues: tickets
  MCP-462 (spec alignment), MCP-463 (bulk truing + freshness), MCP-464
  (upstream keywords feedback, Aakesh). Matt tagged on lane tickets and
  PRs. Owner word: this lane's work WILL BE MERGED — each PR at full
  condition as it settles.
- Channel: `.agent/collaboration/rapid-comms/`
  `2026-08-03-upstream-update-lane-magnetar-binds-oblivion-birch-holds-seedling.md`
  (activation pack + all owner rulings). Worktree:
  `.claude/worktrees/upstream-spec-probe`.

### Corsair hunts Surf (4d3282) — design lane

- Claude (claude.ai) / claude-fable-5. Wrap-closed 10:02Z; claims closed
  with resume pointers.
- Safe state: records landed at `b1b5431a7`; the #729 cure round is
  pushed into draft PR #729 (all gates green), dispositioned on the PR.
- Thread record:
  `.agent/memory/operational/threads/design-system-integration.next-session.md`.
- Resume order: #729 census-regeneration note → ready → merge at full
  condition; PDS naming execution at owner word; the scoped
  near-horizon re-review; then the owner's implementation word.

### Skylark hunts Nimbus (e856d5) — skills lane

- Claude Code / claude-fable-5. Wrap-closed 10:04Z; claims closed with
  resume pointers.
- Safe state: records landed at `e15d52953`; #731 is draft with
  CHANGES REQUIRED (three blockers + portability-validator gap; full
  report is a bot comment on the PR; round 1 of the PDR-132 budget
  used).
- Thread record:
  `.agent/memory/operational/threads/skills-estate-organisation.next-session.md`.
- Resume order: fresh claim → cure the #731 blockers red-first
  (file-by-file map in the thread record) → re-review → merge at full
  condition → resolve the last #714 thread (the fold then returns to
  the Director) → R4, the 37-skill description backfill, the
  evals-pilot scoping at owner word.

### Vanilla stirs Bough (604af6) — ARC-colour statusline lane

- Claude Code / claude-fable-5. Wrap-closed 09:48Z; claim closed.
- Safe state: ws-b0 COMPLETE AND MERGED (PR #730, `3fb6875e6`); lane
  worktree `arc-colour-statusline-604af6` persists clean at
  origin/main.
- Plan (owner-ratified):
  `.agent/plans/delivery/arc-colour-statusline.plan.md`.
- Resume order: ws-a-cycle-2 (usage gauges to the MODEL row) at
  owner/Director word after the window; then the B chain at port-speed
  wall-clock, deliberate quality (owner reframe). The castr-pin
  reachability check binds at the first B-story open.

### Lichen guards Phloem (019fc3) — TypeScript-estate review corpus

- Codex / GPT-5. Seat closed earlier at owner word; the corpus is the
  frozen artefact, not a live lane.
- Safe state: the 125-path staged corpus commits to
  `jimcresswell/typescript-estate-consolidation-review` under the
  owner-authorized gate bypass (2026-08-03 card) and lives in a DRAFT
  PR labelled WIP-red. Gates red on the WIP state by design.
- Thread record:
  `.agent/memory/operational/threads/typescript-estate-consolidation-review.next-session.md`.
- Resume route: the green-up (3 lint errors + type/build/test) is the
  foundations review lane's first act — any capable seat, not
  necessarily a Codex one; the corpus PR is the pickup surface.

## Standing context that survives the pause

- Matt-priority ruling binds fleet-wide: only the update lane mints
  Linear tickets before the embargo lift; Matt tagged on its tickets
  and PRs.
- Owner questions from every seat go via cards (the
  points-in-conversation window closed 2026-08-03 ~09:35Z).
- Doctrine queue (Director-held, napkin + freeze entries): the
  population-claims family (now with Vanilla's two enrichments), the
  sentinel-taxonomy discriminator from Birch's lane (owner-ratified
  reshape; testing-strategy §Prove-behaviour carve-out via
  new-rule-vs-pdr-clause), coordinator dark-window detection,
  whose-lint-gates-whose-push (n=3 — structural cure on the queue),
  horizon-seam authoring check, `--in-response-to` existence check.
- Watches: Linear embargo lifts 2026-08-10 08:00 London (design ticket,
  pnpm-CLI story, MCP true-ups, ARC-colour frontmatter stamp); skills
  gate expiry 2026-08-23; codex-dialogues window to 2026-08-16; ADR-186
  window-closure signal; four PR-725 follow-ups needing carriers.
