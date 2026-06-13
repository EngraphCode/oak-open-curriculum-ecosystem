---
name: "PR Merge-Readiness Discipline (oak-pr)"
overview: "Make premature PR merge mechanically impossible. A pull request is merge-ready only when it is mergeable, every required check is terminal-green, AND every review comment is resolved with a code correction or refuted with a reply — never green-checks alone. Cure is layered strongest-first: GitHub branch protection (require conversation resolution), a mechanical merge-readiness CLI checker, and an oak-pr skill plus an always-loaded rule that wrap and fire the gate. Grounded in a real 2026-06-13 failure: PR #203 merged with four unread Copilot comments (three valid machine-local-path findings, one valid clock-skew bug)."
status: "QUEUED — owner-directed 2026-06-13 (design ratified in-session; owner chose 'capture as a plan only'; owner enables branch-protection layer directly)"
todos:
  - id: ws0-branch-protection
    content: "WS0 (owner-owned, not an agent task): enable GitHub branch protection on main — 'Require conversation resolution before merging' + the required status checks (run-quality-gates, SonarCloud, CodeQL, Vercel). This is the strongest layer: GitHub blocks the merge button server-side, so no agent path can merge with unresolved review threads regardless of agent-side discipline. Recorded here so the agent-side layers are explicitly belt-and-braces, not the primary guard."
    status: pending
  - id: ws1-merge-readiness-checker
    content: "WS1: a mechanical merge-readiness checker in agent-tools — `pnpm agent-tools:pr-merge-readiness <pr>` (exact CLI name TBD at build). Given a PR number it reports and exits non-zero unless ALL hold: (a) mergeable !== CONFLICTING; (b) every required check is terminal and green (no pending/failed); (c) every review thread is resolved (GraphQL `reviewThreads.isResolved`) OR carries a reply from the merging agent. REST `/pulls/{n}/comments` does NOT carry thread resolved-state — use the GraphQL `reviewThreads` connection. TDD; pure core (verdict function over fetched thread/check state) + thin gh/GraphQL I/O adapter; no global state. Output names each blocking thread/check so the agent knows exactly what to resolve."
    status: pending
    depends_on: []
  - id: ws2-oak-pr-skill
    content: "WS2: an `oak-pr` canonical skill (.agent/skills/oak-pr/SKILL-CANONICAL.md + generated platform adapters) capturing the full PR lifecycle as a gated workflow: push (pre-push gate proves green) -> open flat PR -> monitor checks to terminal -> MERGE-READINESS GATE (run the WS1 checker; resolve/refute every comment; verify mergeability + divergence/conflict handling) -> merge -> post-merge follow-through (live proof, plan archival, continuity update). Bakes in the two 2026-06-13 worked failures: (1) merged with unread advisory comments; (2) explicit-pathspec commit omitted a renamed path, half-committing a move. Landing is two-gate and owner-keyed: canonical + adapters, then the Skill(oak-pr)/Skill(oak-pr:*) settings permission pair."
    status: pending
    depends_on: [ws1-merge-readiness-checker]
  - id: ws3-rule
    content: "WS3: a thin always-loaded rule (e.g. `.agent/rules/resolve-pr-comments-before-merge.md`) stating the invariant — no merge until mergeable + checks green + every review comment resolved-or-refuted — pointing at the oak-pr skill and the WS1 checker. Three on-disk forms (.agent/rules canonical, .claude/rules + .cursor/rules + .agents forwarders) + RULES_INDEX.md entry, per the rule-authoring contract. Apply new-rule-vs-pdr-clause first to confirm rule (operational invariant, single trigger=PR merge) over PDR clause; start at the rule's enforcement-appropriate severity."
    status: pending
    depends_on: [ws2-oak-pr-skill]
  - id: ws4-validator-gap
    content: "WS4 (separable follow-on): close the validate-portability scope gap that let machine-local `/Users/...` paths in `agent-tools/tests/` reach a merged PR (#203) without tripping the gate. Confirm the validator's file scope, extend it to cover test fixtures (and any other unscanned version-controlled trees), TDD a negative-control fixture. This is the structural cure for the specific class that escaped on #203."
    status: pending
    depends_on: []
isProject: false
---

# PR Merge-Readiness Discipline (oak-pr)

**Created**: 2026-06-13 (owner direction after PR #203 merged with four unaddressed
Copilot review comments). Owner ruling in-session: *"That is not acceptable, it cannot
happen again, we need to create an explicit set of PR rules and guidance, perhaps a PR
skill."* Owner chose **capture as a plan only**; the owner enables the branch-protection
layer directly.

## End goal

A pull request cannot be merged — by any agent, in any session — until it is **mergeable,
every required check is terminal-green, AND every review comment is resolved with a code
correction or refuted with a reply.** Green CI checks alone never constitute merge-readiness,
because advisory reviewers (Copilot, and human reviewers leaving non-blocking comments) sit
on a surface that does not gate the merge button.

## Scope — the four PR activities

Agents now routinely **create**, **review**, **respond to comments on**, and **merge** pull
requests, so the `oak-pr` skill (WS2) covers all four, each backed by mechanism/rule/skill/tool
(this plan supersedes and conserves the intent of the earlier
`pull-request-best-practice-and-rules` need-statement):

- **Creation**: flat PR onto the base branch; conflict/divergence resolved before opening or
  via semantic merge; commit hygiene (explicit pathspec, no half-committed renames — the
  #204 worked failure); a body that states the change, verification, and any deferred items.
- **Review** (the agent reviewing others' PRs): leave findings as review comments; ground
  each against the artefact first-hand before asserting; distinguish blocking from advisory.
- **Responding to comments** (as author): the resolve-or-refute invariant — every comment is
  addressed with a code correction or refuted with a reply; never left unread.
- **Merging**: only through the merge-readiness gate below.

## The failure this exists to prevent (worked instance, 2026-06-13)

PR #203 (statusline session-shape indicators) was merged on the readiness model
*"mergeable + CI checks green."* That model is incomplete: Copilot had left four review
comments that do not block the merge button —

- three valid: machine-local `/Users/...` absolute paths in a test fixture
  (`no-machine-local-paths`);
- one valid: `resolveArcActive` treated a future mtime as live (negative age still satisfied
  `<= window`), a clock-skew bug.

All four were genuine and were fixed post-merge in PR #204 — but they should have blocked the
merge. A compounding hygiene failure in the same arc: an archival commit's explicit pathspec
omitted the renamed plan's old path, half-committing a `git mv` so the file was tracked in
two locations until a follow-up commit completed it. Both are PR-discipline gaps a
merge-readiness gate catches.

The discipline's value was then demonstrated live: the **comment-sweep-before-merge** step,
applied to PR #204 itself, caught a further valid Copilot comment (the `/repo` placeholder was
still a non-resolving absolute path, which the `no-machine-local-paths` owner ruling forbids)
*before* #204 merged.

## Mechanism — layered cure, strongest first

The metacognition directive's "structural, not doc-patch" principle governs: a written
"remember to check comments" loses to artefact gravity under merge momentum. The cure makes
premature merge mechanically harder at each layer.

1. **GitHub branch protection (WS0, owner-owned).** "Require conversation resolution before
   merging" + required status checks. GitHub enforces server-side; the merge button is
   disabled while any thread is unresolved or any required check is non-green. No agent path
   bypasses it. This is the primary guard; the agent-side layers below are belt-and-braces
   for fast pre-merge feedback and for platforms/paths where the button is scriptable.
2. **Mechanical merge-readiness checker (WS1).** An `agent-tools` CLI the agent runs before
   `gh pr merge`: it computes the same verdict locally (mergeable + checks + unresolved
   threads via GraphQL) and exits non-zero with the blocking items named. Recur-proofs the
   agent path and gives feedback without waiting on the GitHub button.
3. **oak-pr skill + always-loaded rule (WS2/WS3).** The skill is the full lifecycle workflow
   that *calls* the checker at the gate; the rule is the discoverable, always-loaded invariant
   that fires at the merge moment and points at both.

## Means

WS0 is the owner's switch. WS1 (checker) is the load-bearing structural cure and unblocks WS2
(skill wraps it) which unblocks WS3 (rule points at both). WS4 (portability-validator scope
gap) is separable and can land independently — it cures the specific class that escaped on
PR&nbsp;#203.

## Prerequisites

- **Blocking**: none external. WS1 needs only `gh` + the GitHub GraphQL API (both available).
- **Beneficial**: WS0 enabled first makes the agent-side layers a redundant check rather than
  the sole guard.

## Acceptance criteria and proof contract

| Id | Acceptance | Proof |
| --- | --- | --- |
| ws0 | main branch protection requires conversation resolution + the named status checks; a PR with an unresolved thread shows a disabled merge button | owner-side settings + a screenshot/observation on a test PR |
| ws1 | `pr-merge-readiness <pr>` exits non-zero for a PR with an unresolved thread or non-green check, zero when all clear; names each blocker | unit (verdict over fixtures) + a live run against a real PR in each state |
| ws2 | the oak-pr skill drives a PR end-to-end with the gate enforced; `subagents:check` + `portability:check` green; settings permission pair present | skill adapters generated + gates green + a worked PR run |
| ws3 | the rule exists in all on-disk forms + RULES_INDEX; new-rule-vs-pdr-clause applied | `portability:check` + rule-form parity |
| ws4 | the portability validator flags a machine-local path planted in a test fixture | TDD negative-control (RED then GREEN) |

## Non-goals

- No attempt to auto-resolve or auto-reply to review comments — resolution is a judgement
  (fix vs refute) the agent must make; the gate only *checks* that each is resolved.
- No replacement of human/automated review with the checker — it gates the merge step, it
  does not review the code.
- No change to the existing pre-push / pre-commit gate chain — those stay; this adds the
  review-comment-resolution dimension the existing gates do not cover.

## Risks

- **GraphQL thread-resolution semantics**: a reply does not mark a thread "resolved" (the
  Resolve button does). WS1 must treat *resolved OR replied* as addressed, matching the owner
  rule ("addressed with a correction OR refuted with a comment"), or it will false-block on
  replied-but-unresolved threads.
- **Bot comment noise**: Vercel/release-bot issue comments are not review threads and must not
  block; WS1 scopes to review threads (`reviewThreads`), not issue comments.
- **Checker forgettable**: the agent can still skip running WS1. This is why WS0 (server-side)
  is the primary guard and WS3 (always-loaded rule) fires the reminder; WS1 is the fast local
  check, not the sole guard.

## Foundation alignment

`metacognition.md` "structural, not doc-patch" (the checker + branch protection over prose);
`principles.md` simplicity-first (pure verdict core + thin I/O adapter); `testing-strategy.md`
(fixture-driven verdict tests, no global state); `new-rule-vs-pdr-clause` (WS3 form decision);
the rule-authoring three-form contract (WS3 adapters). Lifecycle per
`templates/components/lifecycle-triggers.md`.
