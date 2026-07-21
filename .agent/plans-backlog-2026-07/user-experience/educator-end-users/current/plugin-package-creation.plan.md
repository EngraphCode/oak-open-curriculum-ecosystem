---
name: "Plugin package creation — assemble and ship Oak's cross-vendor plugin (skills + MCP) to the Claude and Codex marketplaces"
collection: user-experience
audience: educator-end-users
lane: current
status: current
type: executable
last_updated: 2026-06-08
---

# Plugin package creation — Claude + Codex

> **Executable, queued (`current/`).** This plan **creates the plugin package
> itself** — the executable half of the owner-decided cross-vendor bundle. It is
> the promotion of the strategic brief
> [`../future/plugin-bundle-distribution.plan.md`](../future/plugin-bundle-distribution.plan.md)
> (benefits and rationale live there; this plan does the engineering). It
> **consumes** Direction A (the MCP skill-surfacing generator,
> [`oak-skills-ingest-and-resurfacing.plan.md`](oak-skills-ingest-and-resurfacing.plan.md))
> and Direction B (the public skills source in `oaknational/oak-skills`); it does
> **not** rebuild either. **Execution gate:** Workstream 0 re-verifies the
> fast-moving vendor manifest shapes and records the emitter design; no manifest
> code workstream starts until w0 lands. **Cross-reference contract:** the
> strategic brief remains the benefits-and-rationale source; this plan owns the
> engineering scope, gates, risks, validation, and completion proof.

## Problem and intent

Oak holds both halves of a plugin bundle — the **skills** (`oak-skills`) and a
**deployed, reachable MCP server** (the Oak Curriculum MCP, live with the EEF
surface) — but ships them through separate channels, so a teacher never installs
the whole capability in one step. The owner has decided the packaging: a
**cross-vendor plugin bundle** of `{skills + MCP}`, shipping to **both** the
Claude and Codex marketplaces, owned in this repo. What is missing is the
**creation mechanism**: the build that emits each vendor's plugin manifest from a
single source, references the deployed MCP and the agreed skills source, and
clears each marketplace's directory-submission policy.

**Intent:** build the package-and-ship path so one Oak plugin installs from the
Claude marketplace **and** the Codex marketplace, delivering the agreed skills
plus the live MCP surfaces together — with attribution, teacher-agency, and the
WCAG 2.2 AA floor intact.

## End goal, mechanism, and means

- **End goal.** A teacher installs one Oak plugin from the Claude **or** Codex
  marketplace and immediately has the agreed curriculum-assistance skills **and**
  the live Oak Curriculum MCP tools/resources/prompts — no separate skill files,
  MCP config, and connector setup to assemble by hand.
- **Mechanism.** A plugin is `{skills + MCP server}` behind a per-vendor manifest.
  Emit **both** vendor manifests from **one source** as additional generator
  surfaces (siblings to Direction A's MCP emitter, per `generator-first-mindset`
  and ADR-125 portability), so the Claude and Codex packagings cannot drift from
  each other or from the capability source. The bundle references the **already
  deployed** Oak Curriculum MCP and the **agreed skills source** (topology decided
  by Direction A's t0 / Direction B's WS1).
- **Means.** A design gate (w0) re-verifies current vendor manifest shapes and
  records the emitter design and submission paths; then the Claude manifest
  emitter (w1), the Codex manifest emitter (w2), directory-policy compliance (w3),
  and an end-to-end install proof (w4).

## Verified facts grounded first-hand (2026-06-08; re-verify platform facts at use)

- **The Oak Curriculum MCP is deployed and reachable**, exposing the EEF surface
  (`get-eef-evidence` is a live tool on the production `oak-prod` server; API
  version 0.7.0). A referencing bundle can function against it **today** — so the
  "MCP deployed/reachable" dependency is **already satisfied**, not a blocker.
- **Packaging is owner-decided**: a cross-vendor plugin bundle to Claude **and**
  Codex, owned in this repo (synthesis plan §"Owner decisions", decision #2).
- **Both vendors converge on the same shape** (seed review Part 2, verified
  2026-06-08): a plugin is an installable bundle of `{skills + MCP}` distributed
  via a **marketplace**, with **MCP as the common runtime** and `SKILL.md` as the
  portable skill format. The OpenAI equivalent is the **Codex plugin** (not
  ChatGPT apps). The Codex Plugin Marketplace launched 2026-03-26.
- The skills-adapter generator (`agent-tools/src/skills-adapter-generate/`)
  already emits target surfaces from a capability source via a per-`sourceType`
  path; Direction A adds an MCP emitter to it. Vendor plugin-manifest emitters are
  the same pattern — new emitter surfaces, not a new build system.

These are current-state facts. **Exact vendor manifest field shapes are NOT
carried here** — they move fast and are re-verified first-hand at w0 against the
current Claude and Codex plugin specifications (vendor-literal discipline).

## Open design decisions — resolved by Workstream 0 (the design gate)

w0 must record a verdict + rationale for each before any manifest code workstream
starts:

1. **Claude manifest shape** — the current `.claude-plugin/plugin.json` +
   `marketplace.json` field set and how the bundle declares its skills and its MCP
   server reference. Re-verified against current Claude plugin docs.
2. **Codex manifest shape** — the current Codex plugin layout (`.mcp.json`,
   `skills/`, connectors/`.app.json`, hooks) and how it declares the same skills
   and MCP server. Re-verified against current Codex plugin docs.
3. **Single-source emitter placement** — whether the two manifest emitters are new
   `sourceType`/surface emitters inside `skills-adapter-generate` (preferred, per
   generator-first) or a dedicated packaging step that consumes the generator's
   output; the determinism/pinning contract either way.
4. **Skills-source binding** — which source the manifests reference (the canonical
   `oak-skills`, Direction B's curated public mirror, or a manifest layer). This is
   the synthesis plan's open decision #4 (source-of-truth topology), **shared with
   Direction A's t0 and Direction B's WS1** — resolve coherently, do not re-decide
   independently.
5. **End-user authentication** — how each vendor manifest references the deployed
   MCP and authenticates the end user (the Clerk-fronted auth path), and what the
   marketplace listing must declare about it.

## Todos

```yaml
todos:
  - id: w0-design-gate
    content: >-
      Re-verify the current Claude and Codex plugin manifest shapes first-hand
      against vendor docs, and record a verdict + rationale for each of the five
      open design decisions (Claude shape; Codex shape; single-source emitter
      placement; skills-source binding [shared with Direction A t0 / Direction B
      WS1]; end-user authentication). Output is a decision record (non-code). This
      is the design gate: no manifest code workstream starts until w0 lands.
      Acceptance: all five decisions have a recorded verdict and rationale; the
      skills-source binding is consistent with Direction A's t0 verdict; the chosen
      manifest shapes cite the vendor docs they were verified against, with date.
      Validation (non-code): the decision record exists, each decision resolves to
      a verdict, and assumptions-expert + mcp-expert have reviewed the w0 scope.
    status: pending
  - id: w1-claude-manifest-emitter
    content: >-
      Emit a valid Claude plugin manifest (.claude-plugin/plugin.json +
      marketplace.json per w0) from the single source, declaring the agreed skills
      and referencing the deployed Oak Curriculum MCP. TDD: a failing test asserts
      the emitted manifest validates against the Claude plugin schema and resolves
      the skills + MCP reference; product code greens it. Acceptance: a schema-valid
      Claude plugin manifest is emitted deterministically from the source; the MCP
      reference resolves to the live server. Proof: unit + integration.
    status: pending
    depends_on: [w0-design-gate]
  - id: w2-codex-manifest-emitter
    content: >-
      Emit a valid Codex plugin manifest (.mcp.json + skills/ + connectors per w0)
      from the SAME single source, declaring the same skills and MCP server. TDD: a
      failing test asserts the emitted Codex manifest validates and references the
      same capability source as w1 (no divergence between the two vendor
      packagings); product code greens it. Acceptance: a schema-valid Codex plugin
      manifest is emitted from the same source; Claude and Codex packagings share
      one skills + MCP source. Proof: unit + integration.
    status: pending
    depends_on: [w0-design-gate]
  - id: w3-directory-policy-compliance
    content: >-
      Clear each marketplace's directory-submission policy for the listed package:
      the Anthropic Software Directory Policy and the OpenAI/Codex submission
      guidelines. The directory-policy standards (tool annotations, response
      minimisation, privacy-policy link, graph token efficiency) are owned by
      app-submission-standards.plan.md and consumed here, not duplicated; w3
      applies them per vendor via the Codex-plugin route. Acceptance: a compliance checklist per vendor is
      green; the privacy-policy link and required annotations are present; no PII is
      emitted in produced artefacts. Proof: non-code (checklist) + integration where
      a check is automatable.
    status: pending
    depends_on: [w0-design-gate]
  - id: w4-install-proof
    content: >-
      Prove the package installs and delivers the whole capability: from each
      marketplace (or a vendor-supported local/dev install where marketplace
      submission is still in review), installing the Oak plugin gives a client both
      the agreed skills and the live MCP surfaces in one step, with attribution
      present and produced artefacts meeting the WCAG 2.2 AA floor. Acceptance: a
      recorded install run per vendor shows skills + MCP reachable together from the
      single install; attribution and the accessibility floor are verified in the
      output. Proof: e2e / value-proxy (a recorded install + exercise run).
    status: pending
    depends_on: [w1-claude-manifest-emitter, w2-codex-manifest-emitter, w3-directory-policy-compliance]
```

## Sequencing and gating

w0 is the design gate and can start now (re-verify vendor specs; design the
emitter). w1 and w2 are independent of each other (separate vendor manifests, same
source) and both queue behind w0 plus the skills-source binding (w0 decision #4,
shared with Direction A t0). w3 queues behind w0 and runs in parallel with w1/w2.
w4 needs w1 + w2 + w3. The **MCP-deployed** and **EEF-live** inputs are already
satisfied, so they gate nothing here.

## Prerequisite classification

- **`blocking-for-real-source-binding`** — the **skills-source topology** decision
  (w0 #4), shared with Direction A's t0 and Direction B's WS1. *Without it:* w0
  and w3 still proceed; w1/w2 emit against a **local skills fixture** to prove the
  emitter, and re-point to the agreed source once decided (mirrors Direction A's
  local-fixture-first mitigation).
- **`already-satisfied`** — the Oak Curriculum MCP is deployed and reachable with
  the EEF surface (verified live 2026-06-08).
- **`beneficial`** — Direction A's generator surface (so manifests emit from one
  source, not hand-maintained) and Direction B's skills source being publicly
  installable (so the bundle references a published source rather than a private
  one). *Without them:* the emitter can target a local skills source and a private
  MCP reference for the install proof, deferring public submission.

## Quality gates

Per-cycle: the validation line in each todo plus the relevant local gates. Phase
and final validation use the canonical aggregate gate
([`../../../templates/components/quality-gates.md`](../../../templates/components/quality-gates.md));
`pnpm test`, `pnpm type-check`, `pnpm lint`, and (for any emitted artefacts under a
drift gate) `pnpm skills:check` plus `pnpm markdownlint:root` are the load-bearing
gates. Manifest validation against each vendor schema is a per-cycle gate.

## Acceptance / proof contract

Proof levels by todo: **w0** non-code (decision record); **w1** unit + integration;
**w2** unit + integration; **w3** non-code + integration; **w4** e2e / value-proxy.
The plan is complete when one Oak plugin is emitted for **both** vendors from one
source, each manifest validates and references the deployed MCP + agreed skills,
the directory-policy checklist is green per vendor, and a recorded install run
shows skills + MCP reachable together with attribution and the WCAG 2.2 AA floor
intact. A landed emitter is not completion until the w4 install proof is recorded.

## Non-goals

- **Do not build Direction A's MCP emitter or Direction B's skills-CLI** — consume
  them. This plan emits **vendor plugin manifests**, not MCP surfaces or a skills
  source.
- **Do not re-decide** packaging (cross-vendor bundle), vendor scope (Claude +
  Codex), or owning home (this repo) — those are owner-decided.
- **Do not resolve the skills-source topology** independently — depend on Direction
  A t0 / Direction B WS1 (w0 #4).
- **Do not hardcode vendor manifest field shapes from memory** — w0 re-verifies
  them first-hand at author-of-record time.
- **Do not duplicate** the bundle brief's benefits framing, the synthesis plan's
  corpus framing, the ADR-189 taxonomy, or the discovery parent's layer map.

## Risks and unknowns

| Risk / unknown | Impact | Mitigation |
|---|---|---|
| Building manifests before w0 re-verifies vendor shapes | Wrong/stale manifest schema; wasted work | w0 design gate blocks all manifest code; shapes cite the vendor doc + date verified |
| Claude and Codex packagings drift apart | Two divergent products from one capability | w1/w2 emit from one source; a w2 test asserts both reference the same capability source |
| Skills-source topology undecided | w1/w2 cannot bind the real source | Emit against a local skills fixture first; re-point on the shared decision (Direction A t0 / Direction B WS1) |
| Directory-policy non-compliance blocks listing | Package cannot be published | w3 clears each vendor's policy before submission; absorbs the existing compliance architecture |
| Vendor marketplace submission still in review | Public install not yet possible | w4 accepts a vendor-supported local/dev install as the proof, deferring public submission |
| PII or accessibility regressions in produced artefacts | Org-policy breach | w3 forbids PII in artefacts; w4 verifies the WCAG 2.2 AA floor in output |

## Foundation alignment

`principles.md` (replace-don't-bridge, no special cases, YAGNI),
`schema-first-execution.md` and `generator-first-mindset` (manifests are emitted
from one source, not hand-maintained), `testing-strategy.md` (TDD cycle-pairs as
the unit of landing), ADR-189 (audience-led taxonomy), ADR-125 (artefact
portability — the multi-surface emit model), PDR-051 (vendor-agnostic skills
standardisation), and the metacognition directive (structural cure: generated
manifests over hand-authored copies).

## Plan-body first-principles check

Fires per [`../../../../rules/plan-body-first-principles-check.md`](../../../../rules/plan-body-first-principles-check.md):
**shape** — `current/` executable is correct: the owner has decided the packaging
and asked for the creation plan; the genuine vendor unknowns are contained in a
non-code w0 gate rather than fabricated into code cycles. **landing-path** — w0
lands a decision record; each manifest cycle is a TDD pair ending green; w4 lands
the install proof. **vendor-literal** — the convergence facts were grounded
2026-06-08, but the **exact manifest field shapes are deferred to w0** and must be
re-verified first-hand against current Claude/Codex docs before any manifest code.

## Readiness reviewers

Dispatch `assumptions-expert` on the w0 scope (the design gate) before any code
workstream — especially to confirm the skills-source dependency is honestly shared
with Direction A rather than re-decided here. Dispatch `mcp-expert` once the w0
manifest shapes are drafted (the MCP-server reference inside each plugin manifest),
and `clerk-expert` on w0 decision #5 (end-user authentication via the Clerk-fronted
auth path). Dispatch `security-expert` on w3 (directory-policy compliance touches
auth, privacy, and external submission).

## Learning loop and lifecycle triggers

On completion: run `oak-consolidate-docs`; route any durable doctrine (the
single-source multi-vendor-manifest emit pattern) to its permanent home; update the
synthesis plan's corpus map and the indexes. Lifecycle triggers per
[`../../../templates/components/lifecycle-triggers.md`](../../../templates/components/lifecycle-triggers.md).

## Cross-references (authoritative homes — do not duplicate)

- Strategic rationale / benefits (promoted from): [`../future/plugin-bundle-distribution.plan.md`](../future/plugin-bundle-distribution.plan.md)
- Corpus map + synthesis: [`external-facing-capability-distribution.plan.md`](external-facing-capability-distribution.plan.md)
- Direction A — MCP skill-surfacing (consumed): [`oak-skills-ingest-and-resurfacing.plan.md`](oak-skills-ingest-and-resurfacing.plan.md)
- Seed review (vendor plugin facts, Part 2): [`../external-facing-skills-and-mcp-surfaces-review.report.md`](../external-facing-skills-and-mcp-surfaces-review.report.md)
- Direction B — public skills source (other repo): `oaknational/oak-skills` → `.agent/plans/public-distribution.plan.md`
- App submission standards (the directory-policy / compliance home): [`app-submission-standards.plan.md`](app-submission-standards.plan.md)
