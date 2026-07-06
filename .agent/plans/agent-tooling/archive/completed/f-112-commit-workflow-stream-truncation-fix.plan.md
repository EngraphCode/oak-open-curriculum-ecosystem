---
name: "F-112 — Fix the commit-workflow spawned-child stream truncation"
status: current
overview: >
  The commit-queue commit workflow's spawned git commit dies at the
  depcruise→turbo handover of the pre-commit hook chain, so the repo's proper
  commit path fails from Claude Code sessions. Owner directive 2026-07-03 (no
  fallbacks, ever — do it properly or error) makes this defect a blocker for
  every queue-workflow commit, including the memory-drain plan's loop commits
  and an already-staged reconciliation bundle. This plan pins the failure
  mechanism with a test, fixes the child-process stream handling, and proves
  the fix by landing the staged bundle through the repaired workflow.
lineage:
  serves_thread: agent-tooling
  serves_stream: agent operating substrate / commit-and-coordination tooling
  strategic_choice: >
    quality gates and the commit ceremony are blocking and must work properly;
    no fallbacks or equivalent-effect routes (principles.md, Strict and
    Complete; owner directive 2026-07-03)
  derives_from: >
    frictions-register F-112; commit SKILL-CANONICAL "Stream truncation"
    section (fallback guidance withdrawn 2026-07-03)
todos:
  - id: cycle-1-pin-mechanism
    content: Instrumented real commit-queue commit run (scratch registry) pins the kill mechanism; invariant test on runInheritedProcess (stderr-stressing children + signal-fidelity Red)
    status: completed
  - id: cycle-2-fix-stream-handling
    content: Rework child stdio per the pinned mechanism (file-capture-and-replay) with faithful exit/signal reporting; unit tests green
    status: completed
  - id: cycle-3-e2e-proof
    content: Land the staged no-fallback reconciliation bundle via the fixed workflow; update F-112 status with the SHA in a follow-up commit
    status: completed
---

# F-112 — Fix the Commit-Workflow Spawned-Child Stream Truncation

## Problem

`pnpm agent-tools:commit-queue -- commit` fails from Claude Code sessions: the
internally-spawned `git commit` exits 1 with the hook chain's output truncated
exactly at the `depcruise → turbo` handover; no commit lands. Gates are green
(`bash .husky/pre-commit` exits 0 standalone each time). Reproduced 2026-06-17
and twice on 2026-07-03 — the second 2026-07-03 run had the parent command's
stdout/stderr redirected to a file, so plain fd-inheritance is NOT the whole
mechanism. Harm: the repo's proper commit path is broken for Claude Code
agents, and per the owner's no-fallback directive its failure blocks all
queue-workflow commits (memory-drain loops; a reconciliation bundle sits
staged awaiting this fix). Success: the workflow lands commits reliably with
hook output conserved and the child's exit status reported faithfully.

## Code anchors (read 2026-07-03)

- `agent-tools/src/commit-queue/process.ts` — `runInheritedProcess`: spawns
  with `stdio: ['ignore', 'inherit', 'pipe']`; maps any signal-kill to
  `exitCode: 128`, losing which signal; stderr is piped and re-written to the
  parent.
- `agent-tools/src/commit-queue/commit-workflow-runtime.ts` — binds `git
  commit -F <msg> -- <pathspec>` and the advisory orchestrator through
  `runInheritedProcess`; its doc comment promises advisory stdout streams
  through via `stdio: 'inherit'` (update it with the fix; the visibility
  intent must be preserved by tee/replay, not dropped).
- `agent-tools/src/commit-queue/commit-workflow.ts` — pure DI orchestrator,
  already unit-tested without real sub-processes; the untested edge is the
  runtime's real-IO binding. The fix lands at that edge.

## Cycles (TDD pairs; one commit each)

### Cycle 1 — pin the mechanism (Red)

Amended at execution open (2026-07-03, assumptions-expert readiness pass,
READY-WITH-AMENDMENTS): the instrumented real run is the PRIMARY diagnostic,
not the fallback branch — child stdout is `'inherit'`, so a stdout-volume
synthetic child exercises none of `runInheritedProcess`'s own stream code,
and the 2026-07-03 file-redirect repro already rules stdout plumbing out.
The one parent-side pipe live in every failing run is stderr.

1. **Instrument one real `commit-queue -- commit` run first** (scratch
   `--registry` path so failure-abandons stay out of the real registry;
   rebuild `dist` before every attempt — the CLI runs from gitignored `dist/`
   with no auto-build). Record the spawned child's real `code`/`signal` and
   the hook's last emitted line to a scratch log; re-derive the seam from that
   evidence. Do not fix on an unpinned mechanism
   (`plan-body-first-principles-check`; the backpressure hypothesis is a
   hypothesis, not a finding). If the mechanism sits above the seam
   (pnpm layer, husky env, turbo tty probing), stop and surface before
   touching non-goal surfaces.
2. Author the characterisation/invariant test for `runInheritedProcess` (real
   `spawn`, deterministic bounded synthetic children; no git, no global
   state, all inputs injected): (a) a high-volume **stderr** emitter — the
   live parent-side pipe; (b) a mixed stdout+stderr burst emitter; (c) a
   self-signalling child for signal fidelity. Run under both a tty-less piped
   parent and a file-redirected parent. **The invariant is "a high-volume
   child completes; its exit code and signal are reported faithfully; no
   truncation-induced failure."** The signal-fidelity assertion is the
   deterministic Red (AC1a): the pre-fix implementation collapses any
   signal-kill to a lossy `exitCode: 128` with no `signal` field.
3. Cycle 1's landing commit pairs the new test with the Cycle-2 fix in ONE
   commit — tests and product code land together; nothing lands broken, and
   a red test is never committed ahead of the code that greens it.

### Cycle 2 — fix the stream handling (Green + Refactor)

Rework `runInheritedProcess` stdio strategy **per the mechanism Cycle 1
pinned** — backpressure-safe capture-and-tee is the candidate shape, not a
foregone conclusion: pipe child stdout/stderr, consume unconditionally into
bounded buffers, tee to the parent's streams when writable, and tolerate
parent-side write errors (EPIPE) without propagating failure to the child.
Either way: report the child's real `code` and `signal` distinctly
(structured result, not a lossy 128). Preserve the advisory-visibility
intent (output still reaches the caller — streamed when possible, replayed
on completion otherwise) and update the runtime doc comment accordingly
(`documentation-hygiene`). Strict types, Result-pattern error surface, no
`any`, DI seams intact so the pure orchestrator tests stay untouched.

### Cycle 3 — end-to-end proof on real work

1. Rebuild (`pnpm agent-tools:build`) — and again before EVERY subsequent
   workflow attempt (the CLI runs from gitignored `dist/`; a stale-dist run
   re-runs the old bug and burns the intent via auto-abandon). Then land the
   **already-staged no-fallback reconciliation bundle** (frictions F-112
   entry, commit SKILL-CANONICAL amendment, napkin) via the fixed
   `pnpm agent-tools:commit-queue -- commit` — the fix's proof is the repo's
   own blocked work landing through the proper path with full hook output
   conserved. A FRESH enqueue is required: the recorded intent `8fa1b83a…`
   is abandoned, expired, and session-bound to `69af8c` (the guard's
   `sameAgent` includes `session_id_prefix`), so no later session can reuse
   it. Each landing in this cycle gets its own fresh intent near
   landing-time (~15-minute expiry).
2. Update F-112's `Status` line with the closing SHA and this plan reference
   (per the register's routing note) — necessarily a FOLLOW-UP commit with
   its own intent: the closing SHA does not exist until the bundle (which
   contains the register) has landed. This plan file itself — created while
   commits were blocked — lands in that follow-up window.
3. Unblocks: `claude-memory-buffer-drain.plan.md` loop commits resume.
   (Execution note 2026-07-03: that plan carries no written F-112 blocked
   note — grep-verified — so AC4's clearing clause is dispositioned as
   no-op; the unblocking is real regardless.)

## Acceptance criteria (proof contract)

- **AC1a (`unit`)**: the signal-fidelity leg of the Cycle-1 invariant test is
  green post-fix and fails on the pre-fix implementation (which collapses
  signal-kills to a lossy `128` with no `signal` field). Command:
  `pnpm --filter @oaknational/agent-tools test -- <new test file>`.
- **AC1b (`unit`, conditional)**: the truncation-reproduction leg per what the
  Cycle-1 instrumented run pins — if the mechanism is reproducible at this
  seam, the test reproduces it pre-fix and is green post-fix; if the mechanism
  sits above the seam, the test stands as the seam's regression guard and the
  evidence log records the pinned mechanism.
- **AC2 (`e2e`)**: a real `commit-queue -- commit` from a Claude Code session
  lands the staged reconciliation bundle: workflow exits 0, prints the SHA,
  `git log -1` shows it, hook output conserved in the captured stream.
- **AC3 (`non-code`)**: no fallback or equivalent-effect path added anywhere;
  no gate weakened; advisory polarity unchanged (PDR-053/ADR-176).
- **AC4 (`non-code`)**: F-112 status updated with the closing SHA; the
  memory-drain plan's blocked note cleared.

## Quality gates

Per-cycle: `pnpm --filter @oaknational/agent-tools test`, `pnpm type-check`,
`pnpm lint`, then the full pre-commit chain via the landing commit itself.
Reviewers per `invoke-code-experts`: code-expert on the Cycle-2 diff
(type-expert if assertion pressure appears); plan-readiness pass
(assumptions-expert) at execution open, before Cycle 1 — this plan is queued
(`current/`), not yet marked ready-for-execution.

## Non-goals

- No changes to husky hooks, turbo config, or gate composition.
- No change to advisory polarity or the four-move ceremony's semantics.
- Not addressing Cursor's separate direct-`git commit` streaming artefact
  (different surface; its workaround section in the skill stands).
- No CLI surface changes beyond the runtime internals and faithful
  exit/signal reporting.

## Risks

- **Mechanism above the seam** (pnpm/turbo tty layers): Cycle 1's
  non-reproduction branch handles this — diagnosis deepens before any fix;
  the invariant test still lands as a guard regardless.
- **Fix changes advisory output timing** (replay vs stream): acceptable if
  output is conserved; the doc comment and skill text describe the behaviour.
- **This plan and the staged bundle are uncommitted until Cycle 3** by
  construction (F-112 blocks the proper path; no fallback). Constraint named,
  falsifiable: if an unrelated proper-path commit lands earlier, land them
  then.

## Execution evidence (2026-07-03, Mistral seeks Jetstream)

- **Mechanism pinned (Cycle 1)**: a Node socketpair (libuv child-stdio "pipe") on the spawned
  `git commit`'s stderr poisons the hook chain — trace markers + signal traps in a
  temporarily-instrumented hook showed the hook shell taking SIGPIPE at the depcruise→turbo
  handover, `set -e` exiting 1 silently (no ❌ branch, no `.turbo/last-gate.status`). Probe
  triangle: hook-through-seam-without-git GREEN; both-piped stdio RED (capture-and-tee
  refuted); full-inherit GREEN; pure-shell 300KB via the same socketpair GREEN (the poison
  needs the hook's own pnpm/node children sharing the descriptor). Five workflow runs
  bookkept in a scratch registry; the real registry stayed clean.
- **Fix (Cycle 2)**: `runInheritedProcess` now redirects child stdout/stderr to temp files,
  replays both to the parent on completion, and returns `{ exitCode, signal, stderr }` (128
  sentinel retained with the signal carried distinctly). Red/Green demonstrated against the
  pre-fix implementation: no-pipes guard 7→0; signal fidelity undefined→SIGTERM.
- **Bundle landed (Cycle 3.1)**: `c148666493a01c1dc0e55f5fd766a39c4537dcc2` via the workflow
  under the inherit-stdio probe build (exit 0, SHA printed, hook output conserved).
- **Fix landed through itself (Cycle 3.2)**: `b2ae9689861ca2a4e6d5d2ef619667da2ace16f9` — the
  final fix build ran the workflow that landed the fix commit: exit 0, SHA printed, full hook
  chain to "✅ Pre-commit checks completed", output conserved. Two preceding attempts failed on
  REAL gates (Prettier, then knip) with the full failure surface conserved — the fix's
  failure-reporting contract proven on live failures. Reviewer verdict: APPROVE-WITH-NITS
  (code-expert); all three nits adopted (settled-guard, honest EPIPE comment, injectable
  replay sinks + spawn-error test). AC1a/AC1b Red demonstrated against the pre-fix
  implementation (signal undefined→SIGTERM; pipe/socket guard 7→0). type-expert not
  warranted per the review.

## Foundation alignment

`principles.md` §Strict and Complete (no shims/hacks/workarounds — the plan
exists to fix, not route around); `testing-strategy.md` + `tdd-as-design`
(invariant test describes the system state; test and fix land together);
`use-result-pattern` and `no-type-shortcuts` for the runtime rework;
`no-unbounded-host-load` (the synthetic child is lifetime-bounded by
construction).
