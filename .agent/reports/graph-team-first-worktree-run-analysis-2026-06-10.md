# Graph Implementation Team — First Worktree-Team Live Run: Director's Analysis

**Date**: 2026-06-10
**Author**: Veiled Listening Secret (Director, claude / Fable 5, `7c8e8e`) — the session's
continuous witness; written mid-session while the evidence is fresh, per owner direction.
**Type**: Analysis (team-shape validation + incident synthesis)
**Scope**: the owner-ratified worktree-team shape's first live run, from team bootstrap
(~12:00Z) through the third implementer rotation (~15:15Z). In-flight lanes (G1b, comms-watch
hardening, S3/G4 holds) are noted as live, not concluded.

## Headline

The worktree-team shape worked on first contact. Five PRs merged in under three hours of
parallel implementer work (S1 #152, G1a #153, #154, S2 #155, U1 #156) with zero registry
conflicts, zero index/HEAD races, zero cross-agent gate coupling, and zero broken-main windows —
the three failure modes the shape was designed to dissolve did not occur, structurally rather
than by luck. Two clean seat rotations and one stalled-watcher incident were absorbed without
losing work, context, or tempo. The costs were real but bounded: per-worktree install/build
minutes, one tooling defect exposed under load, and a handful of protocol gaps now cured in the
opener and rules.

## 1. What the shape structurally dissolved (validated predictions)

The 2026-06-10 napkin design note predicted the worktree topology would convert three recorded
failure modes into structure. All three held:

- **Registry conflicts**: collaboration state lived in ONE coordination home (the Director's
  checkout); implementer PRs were pure diffs by construction. The cross-PR
  `active-claims.json` conflicts of the 2026-06-10 morning arc (PR #146 going CONFLICTING in
  minutes) did not recur across five concurrent-window PRs.
- **Gate coupling**: each worktree gated only its own state. Implementers ran full pre-commit
  chains concurrently with no contention; the Director's continuity commits never queued behind
  feature gates.
- **Index/HEAD races**: each worktree owns its index and HEAD. No `.git/index.lock` collision,
  no ref-lock backstop firing, no HEAD moving under an in-flight session — across a window with
  up to four agents committing.

One predicted-cost confirmation: per-seat `pnpm install && pnpm build` is real minutes, paid
once per seat, and was absorbed into each seat's bootstrap without coordination impact.

## 2. The rotation protocol under live fire

Two natural-boundary rotations (Riverine → Pearly on Seat A; Airy → Abyssal on Seat B) ran the
owner-initiated handoff directive end to end. What the evidence shows:

- **Self-contained handoff records carry real weight.** Pearly executed S2 from Riverine's
  record without one clarifying question — including inheriting a hypothesis explicitly marked
  unconfirmed (B2), which they then *corrected* (the search tool's `year` filter) rather than
  implemented blind. The hypothesis-marked-as-hypothesis discipline is what made the
  supersession frictionless; a record that asserted the repair as fact would have shipped a
  weaker fix.
- **The natural-boundary pickup gap was real and is cured.** Closed claims carry no
  `handoff_record_path`, so the skill's pickup mechanism never fires for clean rotations. The
  cure landed in the opener's entry ritual (successors read their seat's latest handoff record,
  routed via opener + Director pickup brief + thread record) the same hour it was found.
- **The Director addendum pattern emerged unplanned and earned its place**: when post-closeout
  events invalidate part of a frozen record (the #153 review findings arrived after Airy
  retired), a clearly-attributed Director section appended to the record keeps the successor's
  required reading at ONE artefact. Abyssal re-verified both findings first-hand from it and
  fixed them in 25 minutes cold.

## 3. The stall incident, end to end

The session's one operational incident validated the detection stack and exposed a
coordination-critical tooling defect:

1. **Detection**: the heartbeat-only stall diagnostic fired exactly as doctrine describes —
   heartbeats present but a stale cycle label for 2+ cadence windows after a GO that should
   have changed it. The detached heartbeat loop broadcasting stale state is itself a tell.
2. **Escalation discipline held**: ping with a bounded reply window first; then git
   work-evidence cross-check (worktree untouched since the last push = not working, not merely
   quiet); no takeover broadcast, because the evidence said stalled-not-abandoned.
3. **Root cause** (agent's own first-hand diagnosis after an owner nudge): the canonical
   `comms watch` CLI hung-but-ran — process alive, emissions stopped, seen-file frozen at
   3,045 while the dir grew to 3,070. The agent was blind to a merge, a ping, and a GO for
   ~16 minutes while every external surface reported the watcher healthy.
4. **Structural cure path**: the defect got a source-grounded executable plan within the hour
   (`agent-tooling/current/comms-watch-hang-hardening.plan.md`). Grounding the plan in source
   materially changed the diagnosis from the field hypotheses: the real gap is the absence of
   per-step deadlines in the watch loop (a hung await is not an error); the suspected
   fs.watch drop is already poll-bounded; and a liveness/staleness surface already exists but
   is opt-in and unwired. Field reports name symptoms; plans must re-ground in source.
5. **Team adaptation**: all subsequent seats run the rule's portable polling fallback with
   cycle-boundary cross-checks; the rule carries the known-failure-mode caution until the
   hardening lands (in flight, Luminous Scattering Dawn).

## 4. Evidence-forced de-escalations (the system saying "no work needed" correctly)

Two would-be workstreams dissolved under cheap quantification — both worth institutional memory
because the *reflex to measure first* is what saved the scope:

- **The stale-corpus fork**: a sourceVersion gap (2026-03-07 vs 2026-05-21) implied a risky
  re-baseline or a mechanism deviation. A 1.74-second throwaway re-mine proved content-identity
  — the fork dissolved to ~13 cosmetic lines and G1a resumed unchanged. Cost of the diagnostic:
  minutes. Cost of either fork branch taken on the label alone: a precursor PR or a ratified-
  mechanism deviation, both unnecessary.
- **G4's binary gate**: the bulk-vs-API 1pp rule, applied mechanically, would have selected the
  API-pull branch at KS4 — inheriting live's own gaps (science-ks4 serving zero) and discarding
  bulk's richer fields. Owner direction reshaped it to two tools with distinct value props; the
  gate analysis (fields bulk ⊇ live; coverage divergent only at KS4) is what made the false
  binary visible. A decision rule is a floor for analysis, not a substitute for it.

## 5. Adjudication economics (five PRs of review data)

Every bot/reviewer comment was adjudicated first-hand per the standing requirement. The session
ledger: **10 substantive bot findings, 8 real and applied, 2 refuted with source grounding** —
plus two clean bot reviews (no findings) correctly left unanswered.

- Real finds the specialist sub-agents missed: Copilot caught a vacuous-pass e2e and a stale
  JSDoc on #152 *after* code-expert and mcp-expert approved; on #153 it caught a broken
  `./curriculum` dist export that all monorepo gates green-lit (the `development` export
  condition resolves `src/`, masking missing dist runtime — a high-value new lesson), and an
  eager-loading barrel that defeated a ratified design rationale on the load path.
- Refutations that mattered: the deprecation-stub suggestion on #152 (replace-don't-bridge;
  no consumers — verified) and two false claims in the morning arc. Applying bot comments
  blind would have shipped policy violations; dismissing them blind would have shipped four
  real defects. Both halves of the discipline earned their keep, in numbers.
- Layering conclusion: bots + specialist reviewers + first-hand adjudication are
  complementary, not redundant. No single layer caught everything; the union caught everything
  we know about.

## 6. Director-pattern observations (for the seat's future holders)

- **Pure-direction held, with two owner-sanctioned exceptions**: integrating an unregistered
  agent's work (Blooming — owner-directed takeover) and plan authoring (direction-class by
  nature). Both stayed bounded; no product code or tests were written from this seat.
- **Owner-decision routing moments this session**: coordination-home interpretation (the one
  question whose answer set the topology), the versioning convention (verdict + silent-default
  window), the S2 rename sign-off, S3-c0 ratification, the GH-issue-vs-repo-plan fork (the
  harness correctly refused an external write on relayed intent), and the bulk-refresh timing
  flag. The pattern that worked: verdict-with-default presented, never an open menu; the owner
  countermanded none and refined two — evidence the verdict bar was roughly right.
- **Merge serialisation cost ~zero** at this scale (five merges, no queue contention) while
  buying deterministic rebase points and clean semantic-release sequencing.
- **The Director's claim on `.agent/state/**` plus pure-diff implementer PRs is the load-bearing
  pair**: every coordination write had exactly one owner, which is why the registry-conflict
  class vanished.
- **Watch your own watchers**: the Director's per-PR monitors (signature-diff loops with
  terminal-state exits) all exited cleanly; the exit-conditions discipline from the prior arc
  held. The one watcher that failed was the CLI one — input-to-verify applies to tools, not
  just scripts.

## 7. Open at time of writing (live lanes, not conclusions)

G1b (Abyssal — predecessor-direction view, the session's one substantive design correction:
prior-knowledge = predecessors, requiring reversed-edge construction over an outgoing-only BFS);
comms-watch hardening c1 (Luminous); S3 held warm behind G1b (Iridescent); G4 build gated on G2;
the principles-prompt attribution gate and bulk-refresh timing with the owner; Director
understudy transition (Solar Soaring Star) awaiting Moment-1 pre-positioning. A closeout
addendum to this report should record their outcomes; the in-flight design decisions above are
recorded in the plan todos and comms events, not duplicated here.

## Routing

Lessons consolidated to the napkin throughout the session (2026-06-10 section); the closeout
learning pass (oak-consolidate-docs) routes durable candidates onward — the worktree-team
validation evidence in §1 supports the pending-graduations collaboration-practice pattern
candidate; §3's tooling defect is cured by the named plan; §5's layering numbers support the
extensive-reviewers doctrine with this session's first quantified ledger.
