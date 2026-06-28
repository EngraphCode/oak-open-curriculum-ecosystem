---
plan_id: docs-reviewer-split-execution
title: "Execute the docs-reviewer split — enforce subagent frontmatter (schema cure), then the two-reviewer build"
type: governance-delivery
status: current
lifecycle: current
lineage:
  serves_thread: agentic-engineering-enhancements
  serves_stream: agentic-framework
  strategic_choice: FRAME
  derives_from:
    - ../future/docs-reviewer-split.plan.md
    - ../../../sub-agents/templates/subagent-architect.md
    - ../../../sub-agents/templates/assumptions-expert.md
    - ../../../../docs/architecture/architectural-decisions/127-documentation-as-foundational-infrastructure.md
todos:
  - id: p1a-frontmatter-schema-validator
    content: "Phase 1 / WS1.1 — build a per-platform subagent frontmatter schema + validator (Zod, TDD) that closes the Claude-wrapper validation gap and enforces the allowed field-set + value enums (color, model, permissionMode); model is OPTIONAL (inherit policy). The schema is the SSOT."
    status: pending
  - id: p1b-apply-schema-and-model-policy
    content: "Phase 1 / WS1.2 — apply the schema across the roster: fix the invalid color:amber; remove pinned `model` from Claude + Cursor wrappers so the invoking agent controls the model (inherit); validator green across all wrappers."
    status: pending
    depends_on: [p1a-frontmatter-schema-validator]
  - id: p1c-architect-prose-currency
    content: "Phase 1 / WS1.3 — currency-refresh subagent-architect prose: point platform guidance at the schema SSOT (DRY); teach the current Claude field-set (incl. the 9 omitted fields); correct the Cursor section (no `tools` field, model optional/inherit not `auto`, all-optional, is_background, dirs); recommend omit/inherit for model."
    status: pending
    depends_on: [p1a-frontmatter-schema-validator]
  - id: p1d-assumptions-and-internal-refs
    content: "Phase 1 / WS1.4 — assumptions-expert currency (probe found it fully current — record, light touch); fix subagent-architect's bare `architecture-expert` in active prose (its own checklist forbids it)."
    status: pending
    depends_on: []
  - id: p1e-reconcile-validate-ledger
    content: "Phase 1 / WS1.5 — annotate each platform schema with its official-doc source URL + last-verified date and document the reconcile process (re-run the currency workflow on drift signals); subagents:check + portability:check + new schema unit tests green; disposition ledger complete."
    status: pending
    depends_on: [p1a-frontmatter-schema-validator, p1b-apply-schema-and-model-policy, p1c-architect-prose-currency, p1d-assumptions-and-internal-refs]
  - id: gate-owner-confirm-build
    content: "GATE — present Phase 1 outcome (schema cure + currency + ledger); obtain owner confirmation to build the split before any Phase 2 work."
    status: pending
    depends_on: [p1e-reconcile-validate-ledger]
  - id: p2-ws1-infrastructure-expert
    content: "Phase 2 / WS2.1 — overhaul docs-adr-expert into the documentation-infrastructure expert (+ ADR-127 §5 design lens); finalise naming (extend-in-place default)."
    status: pending
    depends_on: [gate-owner-confirm-build]
  - id: p2-ws2-prose-expert
    content: "Phase 2 / WS2.2 — author the prose-expert (universal Strunk & White craft + scoped Oak editorial voice per editorial-tone.md)."
    status: pending
    depends_on: [gate-owner-confirm-build]
  - id: p2-ws3-wire-matrix-and-adapters
    content: "Phase 2 / WS2.3 — wire both reviewers into invoke-code-experts matrix + timing tiers; regenerate platform adapters; subagents:check + portability:check green; worked-review acceptance."
    status: pending
    depends_on: [p2-ws1-infrastructure-expert, p2-ws2-prose-expert]
last_updated: 2026-06-28
---

# Execute the docs-reviewer split — enforce subagent frontmatter (schema cure), then the two-reviewer build

> **Executable promotion of the strategic brief
> [`../future/docs-reviewer-split.plan.md`](../future/docs-reviewer-split.plan.md)** (owner-ratified
> 2026-06-28). The brief owns the *problem, intent, two-reviewer design, and domain boundaries* — this
> plan does **not** restate them (ADR-117 document hierarchy; documentation is infrastructure, ADR-127).
> It owns only the *execution*: phases, cycles, acceptance, and gates.

## How Phase 1 grew (owner decisions, 2026-06-28)

The currency check that gates this work found **real, verified drift** in `subagent-architect`
(Claude + Cursor wrapper guidance) and a live defect (`color: amber`, an invalid value). It also found
the **structural cause**: *no validator checks subagent frontmatter values or the allowed field-set on
any platform, and Claude wrappers are unvalidated entirely* — so the defect could never have been
caught. Two owner decisions followed:

1. **Build the schema as the cure** (not just fix the prose) — make the allowed field-set + values an
   *enforced* per-platform SSOT, so `amber`-class defects and unknown-field typos fail the build. This
   is SSOT/DRY/stable-interface applied to agent definitions — the reflexive case of ADR-127.
2. **Stop pinning `model`; let the invoking agent control it.** The official model-resolution order is
   env-var → per-invocation parameter → frontmatter → main-conversation model; **omitting `model`
   (or `inherit`) makes the default the invoker's model while a per-invocation override still wins.**
   Codex adapters already inherit; Claude + Cursor wrappers pin it (one even pins the stale id
   `claude-opus-4-7`). The schema encodes `model` as optional; the wrappers drop it.

## End goal, mechanism, means

- **End goal.** The roster gains two well-scoped doc reviewers — but first the meta-agents that author
  and gate that build are **current**, and the agent-definition substrate **enforces its own validity**
  (no silent invalid frontmatter; the invoker controls the model).
- **Mechanism.** A per-platform frontmatter schema enforced by `validate-subagents` is the SSOT the
  architect prose points to (so prose stops drifting). `subagent-architect` authors the split;
  `assumptions-expert` gates it — both verified current so no drift propagates into the new reviewers.
- **Means.** Phase 1 — build the schema/validator cure, apply it (fix `amber`, drop pinned `model`),
  currency-refresh the prose against the schema, confirm `assumptions-expert` currency. Phase 2 (gated)
  — build the split with the now-current tools.

## Landing unit (plan-body first-principles check)

This plan has **two** landing-unit shapes; the
[`plan-body-first-principles-check`](../../../rules/plan-body-first-principles-check.md) shape clause
fires to distinguish them:

- **WS1.1 is product code** (TypeScript in `agent-tools`): the schema + validator land as **TDD
  cycles** (Red → Green → Refactor, test+code in one commit) per `testing-strategy.md` and the TDD
  rules (`test-immediate-fails`, `no-conditional-tests`, `no-skipped-tests`, `no-global-state-in-tests`).
- **WS1.2–WS1.4 are declarative agent-definition / doc edits** (`.md` templates, `.claude`/`.cursor`
  wrappers): the landing unit is a **validated revision unit** — an edit plus the validator pass that
  proves it. Proof level `non-code`; proof is the green validators (now including the new schema
  validator) plus a disposition ledger citing first-hand evidence.

The **vendor-literal clause** fires on WS1.1 and WS1.3: platform field-sets and value enums are
vendor-literal and were verified first-hand against current official docs (Claude
`code.claude.com/docs/en/sub-agents`, Cursor `cursor.com/docs/subagents`, Codex
`developers.openai.com/codex/subagents`); each platform schema cites its source.

## Phase 1 — Enforce subagent frontmatter + currency-refresh (`blocking` on Phase 2 as an owner-directed quality gate; independently valuable)

### WS1.1 — Per-platform frontmatter schema + validator (the cure; TDD)

- Build, in `agent-tools/src/validators/subagents/`, a Zod-based per-platform frontmatter schema
  (`agent-tools` already depends on Zod v4 and has a schema convention). Mirror the existing pure-helper
  → `string[]`-issues pattern (the Codex field-checks are the model). Encode, per platform from the
  verified official specs:
  - **Claude** (`.claude/agents/*.md`): the 16-field set; required = `name`, `description`; value
    enums — `model` ∈ {sonnet, opus, haiku, fable, full-id, inherit}, `permissionMode` ∈ {default,
    acceptEdits, auto, dontAsk, bypassPermissions, plan}, `color` ∈ {red, blue, green, yellow, purple,
    orange, pink, cyan}; **reject unknown fields** (closed schema → catches typos).
  - **Cursor** (`.cursor/agents/*.md`): fields `name`, `description`, `model` (inherit | specific-id;
    **not** `auto`), `readonly`, `is_background` — all optional per the spec (repo may require
    `name`/`description` as local stricture); **no `tools`/`color` field**.
  - **Codex** (`.codex/agents/*.toml`): integrate with / align the existing field checks; do not
    duplicate them.
  - **`model` is OPTIONAL on every platform** (inherit policy); if present, must be a valid value.
- **Close the gap**: `validate-subagents` currently never reads `.claude/agents/*.md` — add the Claude
  wrapper loop and apply the schema to Claude + Cursor wrappers.
- **Fix the existing drift in the validator itself**: `REQUIRED_FRONTMATTER_FIELDS` lists `model` as
  required for Cursor; flip `model` to optional (inherit policy).
- TDD: unit-test the schema helper with valid input, `color: amber` (must fail), an unknown field (must
  fail), a bad `model` value (must fail), and omitted `model` (must pass — inherit).

### WS1.2 — Apply the schema + model policy across the roster

- Fix `color: amber` in `.claude/agents/assumptions-expert.md` (→ an official colour, e.g. `orange`).
- Remove pinned `model` from Claude + Cursor wrappers so the invoking agent controls the model
  (inherit). Default handling for agents with a capability preference (e.g. `security-expert`): omit
  `model`, move any recommended model into the agent's *description* so the invoker chooses — no hard
  frontmatter floor (owner-directed: invoker overrides). Codex adapters already inherit.
- The new validator (WS1.1) is the gate: it must pass green across every wrapper after these edits.

### WS1.3 — Currency-refresh `subagent-architect` prose (point at the schema SSOT)

- Repoint the platform guidance at the schema (DRY — values live once, in the enforced schema, not in
  drift-prone prose). Teach the current Claude field-set including the nine omitted fields (`skills`,
  `mcpServers`, `hooks`, `memory`, `maxTurns`, `effort`, `isolation`, `background`, `initialPrompt`).
  Correct the Cursor section (no `tools` field; `model` optional/`inherit`, not `auto`; all-optional;
  `is_background`; cross-tool dirs). Add the `model`-inherit recommendation.

### WS1.4 — `assumptions-expert` currency + internal-reference fix

- `assumptions-expert`: the live currency probe (the plan-review agent reading its own must-reads) found
  **no stale/broken references** — ADR-146 inverted hierarchy + seven-area + build-vs-buy all current.
  Record that probe as a ledger input; only tighten the cosmetic ADR-129 label ("triplet pattern" →
  "Domain Specialist Capability Pattern") if touched.
- Fix `subagent-architect`'s bare `architecture-expert` in active prose (line ~169) — its own Template
  Consistency Checklist forbids persona-less names; point at the template or use a persona-suffixed
  example.

### WS1.5 — Reconcile annotation, validate, disposition ledger

- **Reconcile companion (light):** each platform schema carries its official-doc source URL + a
  last-verified date constant; the documented reconcile is *re-run the currency-check workflow on a
  platform-release signal or periodically*. No brittle fetch-in-CI.
- `pnpm subagents:check` + `pnpm portability:check` + the new schema unit tests green.
- Disposition ledger: every checked claim → `updated` / `already-current` / `superseded` /
  `out-of-scope`, with first-hand evidence (official-doc URL or resolved path).

### Phase 1 acceptance

- [ ] The new validator **fails** on `color: amber`, an unknown frontmatter field, and an invalid
  `model`, on Claude and Cursor wrappers; **passes** on omitted `model` (inherit).
- [ ] No Claude/Cursor wrapper pins `model`; `amber` is gone; `subagents:check` + `portability:check` +
  schema unit tests all green.
- [ ] `subagent-architect` prose matches the verified current specs and points at the schema SSOT;
  `assumptions-expert` confirmed current.
- [ ] Disposition ledger complete; no manufactured edits (each change traces to a verified finding).

## GATE — owner confirmation before building the split

Phase 1 → Phase 2 is an **owner-directed quality gate** (avoid propagating drift into the new
reviewers; owner: *"confirm before building"*), **not an intrinsic technical dependency** — the brief
itself classifies `subagent-architect` as *beneficial-not-blocking* for authoring, with a hand-author +
validators fallback. The gate stays (owner direction); it is discharged trivially now that Phase 1's
currency work is concrete. Phase 2 begins only after Phase 1 is green **and** the owner confirms.

## Phase 2 — Build the two reviewers (`blocking` on Phase 1 + the gate)

Design owned by the brief; execution decomposition here. Author with the now-current
`subagent-architect`; readiness-review with the now-current `assumptions-expert`.

**Why two reviewers, not one with two checklists** (build-vs-buy, discharged in-plan per the
plan-review finding): this is not "split an overloaded reviewer" — the prose/voice concern has **no
carrier** in the 19-template roster today. Folding it into the (already design-lens-extended)
infrastructure reviewer yields a *three*-knowledge-base reviewer (structure doctrine + ADR-127 §5 +
Strunk & White + the 174-line `editorial-tone.md` voice) with conditional voice-triggering — less
focused, not simpler. `principles.md` "decompose at the tension" supports the fault line: craft/voice is
orthogonal to structure/accuracy.

- **WS2.1 — Documentation-infrastructure expert.** Overhaul `docs-adr-expert`: keep its remit, add the
  ADR-127 §5 design lens. Naming: **extend-in-place** default (avoid rename churn) unless the owner
  prefers `docs-infrastructure-expert`.
- **WS2.2 — Prose-expert (new).** Universal Strunk & White craft for all prose; scoped Oak voice
  (`editorial-tone.md`) only where that directive applies. Defer plain-language WCAG *conformance* to
  `accessibility-expert`; author the craft-vs-conformance boundary **symmetrically in both** definitions.
- **WS2.3 — Wire + regenerate.** Add both to the `invoke-code-experts` matrix + timing tiers; regenerate
  adapters; `subagents:check` + `portability:check` green.

### Phase 2 acceptance

- [ ] Exactly two doc reviewers, non-overlapping stated responsibilities (each names what it does NOT
  own).
- [ ] Worked review of one outward-copy doc + one internal ADR: craft applied to both, Oak voice only to
  the outward one.
- [ ] The plain-language edge with `accessibility-expert` covered once (no duplicate, no gap).
- [ ] `subagents:check` + `portability:check` green; readiness review by the now-current
  `assumptions-expert` + a docs/onboarding reviewer.

## Prerequisites and classification

- **Phase 1 → Phase 2: `blocking` as an owner-directed quality gate** (not a technical hard-prerequisite
  — see the GATE section).
- **ADR-127 §5 + `principles.md` clause → `blocking`** for WS2.1's design lens. **Landed 2026-06-28**
  (`b6d611544`) — met.
- **`editorial-tone.md` → `blocking`** for WS2.2's voice layer. Exists (Accepted) — met.
- **Zod v4 (already an `agent-tools` dependency) → `blocking`** for WS1.1. Met.

## Non-goals

Inherits the brief's non-goals (no third doc reviewer; no split-by-document-type; no moving
WCAG/plain-language out of `accessibility-expert`; both reviewers observe-and-report). Execution
non-goals:

- **No manufactured drift** — no edit to a claim already verified current.
- **No `docs-adr-expert` rename in Phase 1** — Phase 2 work; Phase 1 only records the references the
  rename will sweep.
- **No brittle fetch-in-CI reconcile** — the schema is point-in-time-verified + annotated; reconcile is
  the re-runnable workflow, not a live external fetch in the gate.
- **No scope drift into the shallow estate re-scan / intent-graph substrate work** — those are the
  explicitly-*afterwards* steps.

## Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Currency claims asserted from stale training-cutoff memory | All external claims verified first-hand against current official docs with cited URLs; vendor-literal clause binding |
| The local schema is *itself* a currency surface (9 Claude fields appeared since the template was written) | Accepted trade-off: enforced + localized + auditable beats drift-prone prose; schema annotates source URL + last-verified date; reconcile = re-run the currency workflow |
| `model`-inherit removes per-agent capability floors (e.g. `security-expert` "uses opus") | Omit `model` (invoker controls per owner direction); move recommended model into the agent description so the invoker chooses; per-invocation override still available |
| Closed (unknown-field-rejecting) schema false-positives on a legitimate new field | Schema encodes the *full* verified field-set; reconcile workflow updates it on platform releases; failure is loud and localized, not silent |
| Shared-tree edits collide with peer Beluga (plan-corpus D1) | Disjoint surfaces (`agent-tools/`, `.agent/sub-agents/`, wrappers vs `.agent/plans` corpus); claim open; commit by explicit pathspec |

## Foundation alignment

- `principles.md` — First Question, proportionality, "documentation is infrastructure".
- ADR-127 §5 (the design lens WS2.1 enforces; the SSOT principle WS1.1 realises for agent definitions).
- ADR-117 / PDR-018 (plan architecture, document hierarchy).
- ADR-146 (assumptions-expert inverted doctrine — WS1.4).
- ADR-125 (agent-artefact portability — the `portability:check` surface).
- `testing-strategy.md` + TDD rules (`test-immediate-fails`, `no-conditional-tests`, `no-skipped-tests`,
  `no-global-state-in-tests`) — WS1.1 cycles.
- `strict-validation-at-boundary`, `use-result-pattern`, `generator-first-mindset` — WS1.1 idiom.

## Readiness reviewers

- `assumptions-expert` (review mode) ran on this plan — **CONCERNS IDENTIFIED**, all accepted and folded
  in (blocking relabel, split-rationale discharged in-plan, WS1.1 independent-value framing, currency
  probe recorded). Re-run pre-ExitPlanMode on the Phase 2 build.
- `code-expert` / `type-expert` / `test-expert` on the WS1.1 validator code (product code).
- A docs/onboarding reviewer on the Phase 2 reviewer definitions.

## Learning loop and lifecycle triggers

Reference [`lifecycle-triggers.md`](../../templates/components/lifecycle-triggers.md): session-entry
grounding done; collaboration claim **open** (`implementer`, sub-agents + validators surface). On Phase 1
and Phase 2 completion run `/oak-consolidate-docs` and mine durable learning (the schema-as-SSOT pattern;
the model-inherit policy) into permanent homes. Archive per ADR-117 when both phases land.

## Source brief

[`../future/docs-reviewer-split.plan.md`](../future/docs-reviewer-split.plan.md) — strategic owner.
