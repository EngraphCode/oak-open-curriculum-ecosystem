---
fitness_line_target: 180
fitness_line_limit: 240
fitness_char_limit: 14000
fitness_line_length: 100
drain_strategy: >-
  Surface owner-decision items during consolidate-docs; move answered or
  withdrawn entries to an archive when the register needs rotation.
merge_class: mostly-append-register
fitness_content_role: drainable-buffer
---

## Q-002 — which `.agent/rules/*` rules are actually impactful

- **Captured**: 2026-06-01 (Sunlit Gliding Twilight / `claude` / `2a4252`)
- **Question**: Of the ~70 rules injected into context via `CLAUDE.md`, which
  ones measurably change agent behaviour and earn their context cost, and which
  are inert? Prose rules have no "firing" event to count; hook-backed rules
  (e.g. write-time `no-moving-targets`, secrets-scan on Read, PreToolUse gates)
  do execute and could be instrumented.
- **Why it shapes future work**: directly informs the ~80k reliably-loaded
  context budget (`[[project_80k_reliably_loaded_context_budget]]`) — knowing
  which rules are inert is the evidence needed to move them on-demand or retire
  them, rather than carrying all ~70 always-on.
- **Why not answerable cheaply now**: prose rules are not measurable by design
  (continuously in effect, never discretely triggered); the only well-defined
  signal is hook-fire counts, which requires (a) instrumenting hook scripts to
  log invocations and (b) for behaviour-change attribution, auditing transcripts
  for evidence a rule altered a move. No built-in per-rule analytics exist.
- **Owning artefact / discussion home**: none yet; relates to context-budget
  governance. Does not block any current cycle.
- **Status**: owner-gated — needs owner direction to open a rule-impact
  instrumentation / transcript-audit lane, or an owner decision to retire the
  question. Future check: look for a current context-budget or rule-analytics
  plan before asking again; none is recorded here.

## Q-003 — input/output schema strategy for MCP tools (+ the EEF coupling)

- **Captured**: 2026-06-02 (Flamebright Charring Ember / `claude` / Opus 4.8 / `30dd5d`)
- **Question**: how are MCP tool **input and output** schemas carried to the SDK
  registration path, and what is the canonical mechanism? (Owner: "additional
  information about input/output schemas is coming soon.")
- **Owning artefact**:
  [`sdk-and-mcp-enhancements/current/output-schemas-for-mcp-tools.plan.md`][q3-general]
  (general) and — the precise owner of the EEF-coupling sub-question —
  [`sdk-and-mcp-enhancements/current/graph-tool-output-schemas.plan.md`][q3-graph]
  ("Graph-tool output schemas via the EEF projection pattern", DESIGN), both
  authored/refreshed 2026-06-02 by the Abyssal Flowing Beacon workstream (audit:
  `.agent/reports/output-schema-mcp-plan-audit-2026-06-02.md`). Owner resolved the
  S0 universal-tools seam there: apply the required `outputSchema` per tool type,
  **graph first**, promoting to root `UniversalToolListEntry` last. This entry does
  **not** duplicate those plans; it records the EEF coupling so it is not lost.
- **EEF coupling (this session's finding to hand to the owning plan)**: the EEF
  MCP tool is a *graph universal tool* (same family as `get-misconception-graph`/
  `get-prior-knowledge-graph`, which return `structuredContent` but carry **no**
  `outputSchema` today). Carrying `outputSchema` through the universal-tools path
  is net-new and touches a specific surface set — `AggregatedToolName`,
  `AGGREGATED_TOOL_DEFS`/`AggregatedToolDefShape`, `UniversalToolListEntry`,
  `listUniversalTools`, and the `handlers.ts` config (all carry `inputSchema`
  only). A four-architecture-reviewer pass flagged a **three-step asymmetric-drop**
  failure mode (a silent `outputSchema` drop leaves graph tools unvalidated while
  existing no-outputSchema tools pass, uncaught by current tests). The EEF plan
  (D3/D6) defers these mechanics to this question's resolution.
- **Resolved doctrine**: schemas are a deterministic type-strict **projection**
  of the static data fed to a **single Zod call** (`satisfies`-tied), never
  hand-constructed — same pattern as EEF, emitted at codegen for the graph tools.
  Delivery order owner-ratified: the EEF tool's `outputSchema` lands first and
  alone (the mechanism's first instance), the 3 existing graph tools receive
  theirs with their substrate migration, remaining types follow, required/root
  promotion last. Of the five graph sub-questions, **Q2 and Q4 are resolved**
  (graph tools take no input — the projection is structural; thread-progressions
  excluded as sequence-shaped).
- **Status (2026-06-09)**: the trigger has fired. EEF D6+D7 are complete and
  shipped (v1.16.0), and
  [`output-schemas-for-mcp-tools.plan.md`][q3-general] is **🟢 DECISION-COMPLETE**
  (every tool's `outputSchema` = `composeEnvelopeSchema(payloadSchema)`, payload
  Zod derived at the one source per provenance). The remaining open slice
  (Q1/Q3/Q5 — `as const` scope, mechanism home, codegen emission shape for the
  graph tools) now resolves inside the promoted
  [`graph-tools-value-redesign.plan.md`][q3-migration] mechanism settle (under
  plan-review this session). Keep live until that plan reaches decision-complete;
  then this question is answered-in-plan and retires.

[q3-general]: ../../plans/sdk-and-mcp-enhancements/current/output-schemas-for-mcp-tools.plan.md
[q3-migration]: ../../plans/connecting-oak-resources/knowledge-graph-integration/current/graph-tools-value-redesign.plan.md

## Q-004 — does the capability taxonomy need a rights/licensing axis?

- **Captured**: 2026-06-03 (Blustery Lifting Gale / claude / Opus 4.8 / `9b33b0`).
- **Question**: ADR-189 ratifies two axes (audience, distribution locus) with
  packaging as mechanism. The first-party skills library's licensing split —
  MIT scaffolding, © Oak brand assets, curriculum content shared in a
  pedagogical spirit — maps onto neither axis. When Oak distributes
  capabilities externally, what may be copied, what must be attributed, and
  what stays Oak's are questions the current taxonomy cannot record. Is
  rights/licensing a third axis, a per-capability metadata field, or out of
  taxonomy scope (owned by LICENSE surfaces)?
- **Why not now**: one observation only; the repo's own discipline says one
  instance is an observation, not a category. Becomes decidable when a
  capability pack or skills-index publication forces a licensing declaration
  per artefact.
- **Owning artefact when it fires**: ADR-189 amendment +
  [`skills-classification-taxonomy.plan.md`][q4-taxonomy] inventory columns.
- **Status**: open — trigger is the first external capability publication or
  the oak-skills integration decision.

[q4-taxonomy]: ../../plans/discovery/future/skills-classification-taxonomy.plan.md

## Q-005 — can the repo professionalism assessment be cut into practical plans?

- **Captured**: 2026-06-03 (Airy Whirling Wing / codex / GPT-5 / `019e8e`).
- **Question**: The
  [`Oak Repository Professionalism and Engineering Quality Report — 2026-06-03`][q5-report]
  gives a blunt assessment and a friction-reduction roadmap. Can that roadmap
  become practical plan work, and if yes should it be one cross-cutting plan or
  separate plans under architecture/quality gates, developer experience,
  agentic-engineering, and agent-tooling?
- **Why it shapes future work**: the report names high-leverage improvements
  (repo-check failure classification, Playwright preflight, contributor fast
  path, generated authority map, collaboration CLI UX, active-surface reduction)
  but those recommendations should not become another passive doctrine layer.
  A planability pass decides whether the next move is executable work, routing
  into existing plans, or no new plan.
- **Why not answerable cheaply now**: requires cross-checking existing current
  and future plans across at least four collections to avoid duplicate plans or
  wrong ownership. The report was authored and indexed in this session; the
  owner explicitly asked that it receive assessment for practical planning.
- **Owning artefact / discussion home**: the
  [assessment thread record](threads/repo-professionalism-assessment.next-session.md).
- **Status**: open — trigger is the next owner-directed planning/triage
  session, or a dedicated follow-up asking whether to turn the assessment into
  plan work.

[q5-report]: ../../reports/oak-repo-professionalism-engineering-quality-report-2026-06-03.md

## Q-006 — should the in-process mock runtime-config mirror the production EEF default?

- **Captured**: 2026-06-08 (Briny Charting Lagoon / claude / Opus 4.8 / `4dae1b`).
- **Question**: EEF is now default-ON in production resolution (kill-switch posture). The e2e
  fixture (`e2e-tests/helpers/test-config.ts`) was flipped to `eefEnabled: true` to mirror that,
  but the in-process `createMockRuntimeConfig` (`src/test-helpers/auth-error-test-helpers.ts`)
  still defaults `eefEnabled: false`. Should the in-process mock default also mirror production
  (true), or stay false as an explicit minimal fixture?
- **Why it shapes future work**: a mock default that diverges from production can let a real
  default-on regression pass in-process tests; aligning it is more faithful but has a blast
  radius across integration tests that build the server via the mock without setting the flag.
- **Why not answerable cheaply now**: requires assessing every in-process test that uses the mock
  default and asserts tool/resource counts, to size the change safely.
- **Owning artefact / discussion home**: the [`eef` thread record](threads/eef.next-session.md);
  decide alongside D7 work.
- **Status**: open — trigger is the next EEF/test-harness session touching these fixtures.

## Q-007 — should the e2e list-parity test derive its expected tool set from the SDK enumeration?

- **Captured**: 2026-06-08 (Briny Charting Lagoon / claude / Opus 4.8 / `4dae1b`).
- **Question**: `server.e2e.test.ts`'s `list_tools parity` asserts against a hardcoded
  `aggregatedTools` array (I added `get-eef-evidence` to it). Should it instead derive the
  expected set from `listUniversalTools(...)` so it proves "no projection drift" config-agnostically
  and stops needing a manual edit per new tool?
- **Why it shapes future work**: the hardcoded list re-breaks on every tool add/rename and
  couples the parity test to the live flag configuration; deriving it would make the test prove
  the mechanism (app registers exactly what the SDK enumerates) rather than a frozen inventory.
- **Why not answerable cheaply now**: needs care around flag-gated tools (the app skips gated
  entries when off; the derivation must account for the e2e fixture's flag state) and a check that
  the derived assertion still catches real projection drift.
- **Owning artefact / discussion home**: the
  [`unified-mcp-server-test-harness.plan.md`](../../plans/sdk-and-mcp-enhancements/current/unified-mcp-server-test-harness.plan.md)
  (WS0 smoke/parity) or the `eef` thread record.
- **Status**: open — trigger is the next test-harness (WS0/WS3) session.
