---
lineage:
  serves_thread: curriculum-mcp-path-to-ga
  serves_stream: product-development-governance
  derives_from:
    - Owner release directive 2026-07-21 (~12:0xZ, six points, this seat)
    - Owner refinement 2026-07-21 (~12:2xZ; graph-ready minimum ratified as direction)
    - plan-node-schema.v0.md (owner-signed V0 + V0.1; the ADR-200 bridge form)
    - PDR-132 (round budgets bind at authoring time)
---

# Release-planning corpus reset — the graph-ready minimum

Owner-commissioned 2026-07-21. The owner's six-point release directive
pauses the intent-graph build and the plan-corpus refounding, backlogs
the existing planning estate losslessly, and founds a minimal corpus
scoped to the next milestone (~3 weeks: PostHog, production Clerk,
MCP-as-plugin packaging, MCP skill-surface quarantine), with Practice
improvement lanes admitted alongside. The owner's standing intent is
explicit: the corpus transformation and the intent graph both still
happen later; nothing here may interrupt the release critical path, and
nothing here may strand the later work.

## End goal

Release planning happens in a minimal corpus whose every plan is
authored to the owner-signed V0 plan-node schema (the ADR-200 bridge
form), validated in CI, attributed to a Linear ticket, and bounded by
the strategy-layer privacy rule — while the prior estate rests intact
at a backup path, ready for the resumed transformation to migrate INTO
the same schema later.

## The corpus admission rule

A plan (or plan-governing spec) lives in the new corpus if and only if
it serves the release milestone or a live Practice-improvement lane.
Everything else rests in the backup. The rule is applied uniformly at
founding time and at every later admission; it is what keeps the
corpus minimal without a standing pruning ceremony.

## Design verdict — which "version" of the plan enhancements

The V0 plan-node schema is adopted as-is (frontmatter contract §2,
orthogonal state axes §3, typed edges §4, folder collapse §3.6): it is
already owner-signed, already reconciles PDR-018/ADR-117/templates, and
is by construction the intent graph's node contract — so the new corpus
is the graph's beachhead, not its casualty. The heavyweight legs stay
exactly as V0.1 scopes them: proof-typed todos remain OPTIONAL (the
REQUIRED clause binds only refounding-produced plans, and this corpus
is not refounding-produced); no survey, no conformance scoring of the
backlogged estate, no altitude projections, no plan-state audit
machinery, no DORA traversals. New corpus, new form; old estate,
untouched at rest.

## Non-goals

- No transformation, scoring, or editing of the backlogged estate.
- No intent-graph build beyond the V0 Zod transcription the validator
  needs (which was Stage-1's own named first step — paid for here
  because the release corpus consumes it now).
- No pre-authoring of delivery-lane plans: each lane's implementer
  authors its plan at routing time, under the template (future work
  items are pointers, not specs).
- No edits to the owner-held Notion strategy page, ever; no content
  from it in any tracked surface, ever.

## Slices (each a single-story PR under the PDR-132 ≤2-round budget)

### S1 — schema, template, validator, privacy fence (delivery class)

1. Transcribe the V0 §2 frontmatter contract to a Zod schema in
   `agent-tools/src/validators/plan-schema/` (closed enums; additive
   fields per V0.1 optional).
2. One-page delivery-plan template + runbook variant in
   `.agent/plans/templates/` (Goal; falsifiable Acceptance with
   evidence class `repo-safe | owner-held`; Slices each carrying a
   PDR-132 round-budget class; Decision gates with dates; explicit
   Out-of-scope).
3. Validator leg: every `*.plan.md` under the NEW corpus root parses
   against the schema (node_type dispatch exempts `spec` files such as
   the V0 schema itself), enums closed, `serves_strategic_choice`
   resolving against the published strategic-choice registry
   (`docs/strategy/README.md`) — the V0-conformant edge; plan→plan
   linkage to the milestone plan rides `depends_on`/`related`, never an
   invented plan→plan `serves` edge (V0 §8 defers `parent_plan`). The
   leg is CI-gated because `repo-validators:check` runs in CI
   static-checks today; the check↔CI parity validator (PR #460, in
   review) additionally guards the aggregate wiring once landed. The
   backlogged estate is outside the validator's scan root by
   construction — the admission rule drawn as a directory boundary.
4. Privacy fence, enforced not promised: a secret-scan/hook rule
   blocking the Notion domain from tracked content, with the strategy
   page ID matched via a stored hash so the fence's own config never
   carries the ID it fences (mechanical layer); the rule file naming the
   construction layer (strategy-derived material enters ONLY via
   owner-added documents) and the human layer (CODEOWNERS review on
   every planning surface). Content-similarity greps are explicitly
   NOT the mechanism (content invariants cure by construction plus
   human review).

### S2 — lossless backlog move + corpus skeleton (practice class)

1. `git mv .agent/plans` → `.agent/plans-backlog-2026-07/` (MOVE, not
   copy — one live corpus only; the path name is proposed here and
   owner-reviewed at this PR). Commit 1 of the PR is the PURE move —
   nothing else rides it — so losslessness is provable (acceptance
   below); the backup README (resumption intent, the owner's "we lose
   nothing" word, the V0 migration path, and the old→new path mapping
   for the paused refounding's artefacts) lands in commit 2.
2. Founding members admitted under the corpus admission rule move
   INTO the new root in the same commit: this plan; the V0 schema
   spec and the templates directory (the corpus's own foundations);
   and `agent-tooling/current/pr-state-instrumentation.plan.md`
   (Moth's live D1 Practice lane — path move coordinated with Moth
   on comms before the PR opens).
3. New root skeleton: `.agent/plans/` reborn minimal — the milestone
   plan slot, `delivery/`, `practice/`, per V0 §3.6 folder collapse.
4. Registry hygiene in the same act: stale claims pointing into the
   backlogged estate closed with archive reasons; comms/handoff
   pointers that name moved paths get a pointer note in the backup
   README (never rewritten history).
5. Repo references sweep: markdown links are caught by the existing
   markdown-links validator; non-markdown references (the paused
   refounding's `freeze-rule.json` globs, `denominator.v1.json`, and
   ledger path strings under `.agent/plans-refounding/`) are NOT
   machine-caught — they get a manual sweep plus the explicit path
   mapping in the backup README, and the refounding resumes against
   the re-pathed baseline when it resumes. Landing gate is the full
   `pnpm check`.
6. Landing order is DECLARED: S2 lands before S1 activates — the S1
   validator's scan root must already be the minimal corpus, or its
   first CI run reds main against the legacy estate. S1 may develop in
   parallel but its PR bases on (or lands after) S2's merge.
7. This plan's own frontmatter migrates to V0 form in the same S2
   commit that admits it — the corpus's first plan must pass the
   corpus's own validator.

### S3 — milestone plan authored from owner documents (delivery class)

Milestone-plan authoring gates on: the owner's packaging/PostHog
documents landing in-repo (owner word: within hours), decision gate 1,
S1.2 (the template) and S2 (the root). Each delivery lane then routes
INDEPENDENTLY when ITS OWN gates clear (ship-independent,
coordinate-dependent — the Clerk runbook lane needs no skill list and
no PostHog posture, and in a 3-week window the serial bundle is the
largest schedule risk this plan controls). Lanes and their gates:
PostHog integration (gates: documents + decision gate 3);
production-Clerk promotion runbook (gates: documents only); MCP plugin
packaging (gates: documents; acceptance instrument: the AIP-167
packed-form smoke truth-set per platform); MCP skill-surface
quarantine (gates: decision gate 2; structural off — removed from the
exposed registry, retained files labelled not-ready; primitive skills
deleted outright).

## Decision gates (owner)

1. Milestone definition and exact date ("roughly three weeks" →
   a date), from the incoming documents.
2. Skill delete-vs-quarantine ratification list.
3. PostHog consent/privacy posture (strategy-layer question).
4. Backup path name (`.agent/plans-backlog-2026-07/` proposed;
   owner-reviewed at the S2 PR rather than pre-ratified).
5. One-sentence confirmation that V0.1's proof-typed-todos REQUIRED
   clause binds only refounding-produced plans, so proofs stay
   optional in this corpus (the plan reads the gate's letter; the
   owner confirms its spirit).

## Acceptance (falsifiable)

- Validator green in CI over the new corpus; a deliberately
  non-conforming fixture plan fails it (proved in S1's tests).
- A fixture commit carrying the Notion domain is refused by the fence
  (proved live once, recorded in the PR).
- Backup move provably lossless: commit 1 is the pure move;
  `git diff --name-status -M100%` over commit 1 shows ONLY `R100`
  rows, and the row count equals the pre-move
  `git ls-files .agent/plans | wc -l`.
- Moth's D1 lane unbroken: plan path resolves post-move, claim intent
  updated, Moth acks on comms.
- The milestone plan exists at the corpus root; every delivery lane
  resolves `serves_strategic_choice` against the published registry
  and names the milestone plan via `depends_on`.

## Sequencing

Starts only at board-zero (owner word: PRs to zero first). S2 lands
first; S1 develops in parallel but lands on top of S2 (declared order,
S2 §6). S3's milestone plan gates on S1.2 + S2 + documents + gate 1;
each delivery lane routes independently as its own gates clear. The
owner's document drop can happen any time — ingestion lands into the
S2 skeleton.
