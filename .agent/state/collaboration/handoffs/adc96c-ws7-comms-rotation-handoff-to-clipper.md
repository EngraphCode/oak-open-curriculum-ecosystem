# Mid-cycle handoff — Whippoorwill holds Catacomb (adc96c) → Clipper wakes Atoll

**PDR-063 / ADR-182 handoff record.** Owner-directed (2026-06-13): once WS7 Phase 1 commits, hand the
comms-corpus-rotation lane to Clipper wakes Atoll (named eventual successor). Self-contained — read this
end-to-end before any edit.

**Claim relinquished**: `8f2b9b8b-f7f0-4cc8-a6c0-8614606f03d5` (thread `agent-collaboration-research`,
role peer; area: agent-tools/src/collaboration-state + practice-substrate, agent-tools/tests, .agent/state,
.agent/collaboration/experiments, the substrate-contracts manifest — EXCLUDING agent-tools/src/claude/**).

**Branch**: `feat/comms-research`. **HEAD**: `6d1e45f35` (WS7 Phase 1), LOCAL-only — ahead 1 of
`origin/feat/comms-research` (`70080844d`). Push/merge of #208 PARKED ON OWNER GO (Rosemary lifts
Undergrowth stewards #208).

## 1. Current edit state

- **Committed (`6d1e45f35`)**: WS7 Phase 1 — 5 collaboration schemas + the fixtures/ tree relocated out of
  `.agent/state/collaboration/` into `agent-tools/` (src/collaboration-state/schemas/, tests/collaboration-state/fixtures/);
  the schema validator decoupled (resolves its schema dir module-relative-to-agent-tools-root, works from
  both tsx and dist); all readers repointed (live-types 5 constants, the 2 compile-time fixture imports,
  temp-collaboration-state copy-source); the `(b)` ArcAngel-wing fix (statusline-identity.ts `listExperiments`
  → `.agent/collaboration/rapid-comms`). Green: agent-tools 1084 tests, type-check, validate-collaboration-state
  (5248), practice:substrate:check exit 0, pre-commit ✅. **dist was rebuilt** — required, the runtime CLI runs
  from dist/ (see lesson 2).
- **Uncommitted (do NOT sweep into a commit)**: registry residue (active-claims.json, closed-claims.archive.json),
  the regenerated shared-comms-log.md (derived; owner-gitignored), the owner's `.agent/state/collaboration/.gitignore`
  edits, and the ArcAngel channel files. All pure-diff-excluded per the thread convention.
- **Authored, not committed**: the plan `.agent/plans/agent-tooling/current/team-state-register-and-session-shape-icons.plan.md`
  (your WS8 successor — see §what-you-take). The WS7 execution contract is `~/.claude/plans/ah-very-good-in-quizzical-whisper.md`.

## 2. In-flight reasoning

- The schema-validator **decouple = repo-root-relative**, NOT module-relative-to-dist: tsc ships no JSON to
  dist/, so resolving `import.meta.url`→`dist/.../schemas` is a dead path; walk up to the agent-tools package
  root → `src/collaboration-state/schemas` works from tsx AND the built CLI.
- **Rotation is archive-NOT-delete** (owner, Fable unavailable): WS7 moves events past the window to an
  untracked on-disk `comms-archive/` (owner created it + gitignored it), never deletes. PDR-094 + ADR-199 are
  the ratified contract.
- The **team-state register** (the new plan) is the structural cure for the substrate-pointer pattern: a
  derived relational model of the team (agents + their pairwise/n3/n>3 ArcAngel channels + conventional group
  comms + sidebars + threads incl non-thread work), bounded-source-derived per tick, projected into the
  statusline's 4-position left-packed icons (pos1 solo/pair/group never-empty, pos2 handshake=conventional,
  pos3 feather=ArcAngel, pos4 director/directed-member; empty positions left-pack).

## 3. Decisions made (owner-ratified or owner-delegated)

- **Phase-3 untrack boundary — owner-DELEGATED to my judgment.** Proposed + decided: KEEP tracked = README
  - conversations/ + escalations/ (+ lean sidebars/); UNTRACK (preserve-on-disk, conserve-first) = comms/ +
  comms-seen/ + claims + shared-comms-log + comms-archive/ + comms-draft/ + handoffs/ + the misfiled
  output-schema-plan-audit.workflow.js; RELOCATE OUT = schemas/fixtures (done) + experiments/. ADR-199 step (c)
  amends from "untrack all of .agent/state" to this targeted boundary. **Nothing git-rm-cached until its
  substance is conserved or preserved-on-disk.**
- **Icon spec** (§the plan) is owner-FIXED. **Statusline = this-branch authoritative** (owner). **#208 single
  PR for the whole branch** (owner). **Push/merge parked on owner go.**
- **#7 (ArcAngel protocol cure)**: home-fix (arc-rapid-communication.md experiments/→rapid-comms) + single
  ArcAngel-home constant + monitor-pairing invariant + mutating-checks exclusion (markdownlint already covers
  rapid-comms/2026-*.md; prettier covers all of .agent/ — runtime exclusion IS in place; what remains is the
  doc requirement). You (Clipper) appear to own "comms-doc cures" — likely #7 is yours; confirm on the channel.

## 4. Decisions deferred / open

- **#208 push + merge**: owner go only (Rosemary stewards). When Phase-1 pushes, run-quality-gates RE-RUNS on
  it (it ran on 70080844d only; verified green locally). Bugbot ccc37502 + de9f2522 resolutions post on push.
- **#7 ownership split** with you (Clipper) — confirm.
- **Register-vs-single-consumer proportionality** — assumptions-expert at the new plan's WS5.
- **experiments/ relocation** (→ .agent/collaboration/experiments/) — deferred from Phase 1 (non-gating;
  listExperiments now reads rapid-comms, so it doesn't depend on experiments/); do it in Phase 3.

## What you take

(a) The comms-corpus-rotation lane (thread agent-collaboration-research) + my relinquished claim.
(b) WS7 **Phase 2** (provenance check over the 6 verified uncovered cited-event digest targets — 02fa64cf,
    1e2c83eb, 5fbf6f92, 92183937, 952e329b, c7d65a58 — + class-tiered archive-move into comms-archive/) and
    **Phase 3** (untrack per the delegated boundary above). Contract: `~/.claude/plans/ah-very-good-in-quizzical-whisper.md`.
(c) The new plan `team-state-register-and-session-shape-icons.plan.md` (your WS8 successor — supersedes the
    narrow resolver; the (b) wing-fix is the foothold).
(d) #7 coordination (likely yours via comms-doc cures).

## Monitors / channels

- The reconcile channel `.agent/collaboration/rapid-comms/2026-06-13-reconcile-ws7-ws8-cassiopeia-holds-stillness-and-whippoorwill-holds-catacomb.md`
  is the 4-way coordination home; Rosemary⇄Clipper have a pair channel too.
- My monitors (comms `be52221q6` + ARC tail `bhpqsu69n`) die with my session — start your own per the
  pairing rule (ArcAngel monitor ALWAYS paired with a canonical comms monitor).

## Two hard-won lessons (carry them)

1. **A relocation must complete its reader-repoint AND rebuild in one window** — git-mv-then-pause ENOENT-broke
   team comms mid-flight.
2. **Verify peer/own status via the actual runtime path (dist CLI), not a source-run proxy** — my premature
   "comms restored" was tsx-only; the dist binary was stale until rebuilt.
