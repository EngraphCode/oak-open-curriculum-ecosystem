---
name: "MCP stack architectural review + orientation as a first-class constructed tool"
status: >-
  DECISION-INCOMPLETE — queued in current/, NOT started. WS0 (the architectural review of
  the MCP stack) is read-only investigation and is GATED by owner go-ahead to begin the deep
  exploration (owner directed 2026-06-28: author the plan, do NOT start the deep exploration
  yet). Implementation workstreams (WS1+) are provisional and GATED on the owner design
  decision taken after WS0. No code lands until WS0's findings + the design decision exist.
collection: sdk-and-mcp-enhancements
lane: current
lineage:
  serves_thread: orientation-skills-family
  serves_stream: teaching-surface family across the PDR-112 portability seam (the orientation driver) + the SDK→MCP generation stack (the architectural subject)
  strategic_choice: >
    Orientation served via the MCP app must be discoverable to a connected agent as reliably
    as the curriculum tools are — otherwise shipping orientation via MCP delivers nothing.
    The fix is not a bolt-on pointer; it is to bring orientation inside the one unified tool
    taxonomy under the owner's two-type model (API-passthrough vs constructed), with the
    curriculum/orientation separation held at the CONTENT level only, never at the registry or
    discoverability level.
  derives_from: >
    Owner direction 2026-06-28 (this session, Clover mends Hedgerow): (1) the MCP server should
    have exactly TWO kinds of tool — API-passthrough (OpenAPI-generated) and constructed
    (authored); orientation must be a first-class constructed tool, not a third kind bolted on
    outside the registry. (2) Design stance: an existing coupling is a property of today's code,
    which is malleable — ask "what would need to change to make it configurable", never "does the
    current code permit it" (principles.md §Architectural Excellence, §Strict and Complete, the
    cowpath anti-pattern). (3) Sequence: light scan → re-examine the questions → deep scan; the
    deep scan is an architectural review of the MCP stack and is WS0 here, not yet run.
todos:
  - id: ws0-architectural-review
    content: >
      Architectural review of the MCP stack (the deep exploration — READ-ONLY, gated on owner
      go-ahead to begin). Ground first-hand across the full lifecycle (OpenAPI download → type-gen
      → sdk-codegen → tool build → runtime) and resolve RQ1–RQ4 (see body). Produce a findings
      report under .agent/reports/ with adversarial verification; every finding critically
      assessed before use. NAMES design options + owner-decisions; makes no architecture decision.
    status: pending
  - id: gate-owner-design-decision
    content: >
      Owner design decision after WS0: (a) SSOT-derivation of the tool-listing surfaces vs adding
      orientation to each authored surface; (b) where the orientation constructed tool lives
      (SDK constructed-tool home vs a registry extension seam the app populates); (c) how response
      decoration (the curriculum hint) becomes a per-tool property. Owner-gated; implementation
      does not start until this is recorded.
    status: pending
    depends_on: [ws0-architectural-review]
  - id: ws1-provisional-implementation
    content: >
      PROVISIONAL (shape finalises at the gate). Implement the decided architecture in TDD cycles:
      make response decoration per-tool/configurable; unify or SSOT-derive the tool-listing
      surfaces; register orientation as a first-class constructed tool through the one registry +
      catalogue + server-instructions path; content firewall preserved per-tool.
    status: pending
    depends_on: [gate-owner-design-decision]
  - id: ws2-validate-live-behaviour
    content: >
      Validate by LIVE agent behaviour (run it, observe — never a content/string pin): a connected
      assistant given an orientation request discovers and invokes the orientation tool as reliably
      as it discovers curriculum tools; a curriculum request still routes to curriculum tools
      (content firewall intact). Update the onboarding-simulations register.
    status: pending
    depends_on: [ws1-provisional-implementation]
---

# MCP stack architectural review + orientation as a first-class constructed tool

> **Decision-incomplete, grounding-first.** This plan does not yet prescribe an implementation.
> Its first workstream is an architectural review of the MCP stack that resolves the open
> questions below; the owner then takes a design decision; only then does implementation begin.
> Per owner direction (2026-06-28) the deep exploration (WS0) is **not yet started**.
>
> **Precursor (interim relief):** a one-sentence discovery-surface pointer ships ahead of this review
> via [`under-the-hood-mcp-discovery-pointer.plan.md`](under-the-hood-mcp-discovery-pointer.plan.md) —
> an owner-sanctioned sticking-plaster that names `oak-under-the-hood` in the server instructions for
> non-curriculum / mechanism / repo questions. It delivers immediate discoverability and confirms the
> gap live; **this review replaces that sentence** with the proper unified surfacing — it does not
> build on it.

## End goal

An agent connected to the Oak MCP app, given an **orientation-shaped** request ("what is this",
"how is it built", "tell me about the Oak project/effort", "how do I contribute"), discovers and
invokes the orientation surface (`oak-under-the-hood`) **as reliably as it discovers the curriculum
tools** for a curriculum request — by construction, not by a client honouring an advisory hint. The
curriculum/orientation **content** separation is preserved throughout; only the registry and
discoverability separation (which never needed to exist) is dissolved.

## Problem frame (gap · harm · mechanism · constraints · success)

- **Gap.** The in-repo orientation skill (`/oak-under-the-hood`) works; the **MCP-surfaced**
  orientation is practically invisible. The `oak-under-the-hood` tool is present and functional in
  prod (verified first-hand 2026-06-28: it returns the pointer shape), but a connected agent
  grounding via the server's prescribed entry point never learns it exists.
- **Harm.** Any user who asks "what is this / how is it built" through the MCP app gets no
  orientation — defeating the point of shipping orientation via MCP at all.
- **Mechanism (causal hypothesis, to be confirmed by WS0).** Orientation was built as a **third
  kind of tool** — app-local, registered *outside* the unified universal-tools loop, absent from
  the `toolCategories` catalogue and the generated server `instructions`. The deliberate
  curriculum/orientation separation was implemented not only as **content non-coupling** (correct —
  the ADR-041 firewall) but also as **registry and discoverability exclusion** (the defect). The
  agent is told to call `get-curriculum-model` for "complete orientation," does so, and receives a
  tool catalogue that silently omits that repo/effort orientation exists.
- **Constraints.**
  - The owner's **two-type model**: the MCP server has exactly two kinds of tool — **API-passthrough**
    (generated from the OpenAPI spec at sdk-codegen) and **constructed** (authored, e.g. `search`,
    `fetch`, `explore-topic`, `browse-curriculum`, `get-curriculum-model`). No third kind.
  - **Content separation is held at the content level only** (ADR-041 firewall: no curriculum
    coupling in the orientation payload), never at the registry or discoverability level.
  - **The Cardinal Rule** (principles.md): all type/data heavy-lifting happens at sdk-codegen;
    passthrough tools flow from the OpenAPI schema. Any fix must respect this.
  - **SDK→app dependency direction** (ADR-041): the SDK must not depend on the app.
- **Success.** Orientation is a first-class constructed tool, discoverable by construction; the
  tool-listing surfaces no longer drift (one SSOT, or an explicitly-decided equivalent); the
  two-type model holds with no third category; the content firewall is preserved as a per-tool
  property. Proven by **live agent behaviour**, not by asserting a description contains a word.

## Governing principle — the two-type model (owner, 2026-06-28)

Exactly two kinds of MCP tool: **API-passthrough** (OpenAPI-generated) and **constructed**
(authored). `oak-under-the-hood` is currently a third kind and that is the root of its invisibility.
Making it first-class means routing it through the **same** registry → catalogue → server-instructions
path as every other constructed tool. Separation of concerns is a **content** property (the
firewall), not a **registry** or **discoverability** property — conflating the three is the defect.

## Design stance — existing shapes are malleable (the load-bearing correction)

This plan reasons from the **target architecture**, not from what today's code permits. Where an
existing coupling appears to block the target (e.g. the curriculum hint injected pipeline-wide in
`universal-tool-shared.ts`), the question is **"what would need to change to make that a per-tool
property?"** — not "can a tool join without inheriting it?". An existing coupling is a property of
current code, which is malleable; if the right architecture is a pipeline that hosts both curriculum
and non-curriculum constructed tools, the pipeline is changed to make decoration per-tool. The
existing shape is never the ceiling. Anchors: principles.md §Architectural Excellence Over
Expediency, §Strict and Complete (no compatibility bridges; replace, don't bridge), Decision Lens 4
("would it be simpler if the system changed?"), and the cowpath anti-pattern (building inside the
current shape instead of designing from the substrate).

## Grounding facts (first-hand, light scan 2026-06-28 — WS0 re-verifies)

These were established first-hand this session and frame WS0; WS0 must re-verify them, not inherit:

- The two types **already coexist** in one registry: `registerTools` (handlers.ts) iterates
  `listUniversalTools(generatedToolRegistry)`, unifying generated passthrough tools
  (`@oaknational/sdk-codegen/mcp-tools`, born at codegen) and authored constructed tools
  (`AGGREGATED_TOOL_DEFS`, the `mcp/aggregated-*` modules). One registry, one registration loop.
- `oak-under-the-hood` is registered immediately **after** that loop via a separate
  `registerOakUnderTheHoodTool(server)` call, with the in-code comment: "registered outside the
  universal-tools loop (it is not in the SDK generated registry)." The third-kind-ness is explicit.
- There are **three separately hand-authored tool-listing surfaces** that drift: (1) the registry;
  (2) `toolGuidanceData.toolCategories` in `tool-guidance-data.ts` (a static literal — the
  `get-curriculum-model` catalogue); (3) `AGENT_SUPPORT_TOOL_METADATA` in
  `agent-support-tool-metadata.ts` → `generateServerInstructions()` (the MCP initialize
  `instructions`). The catalogue's `agentSupport` category and the metadata both list **only**
  `get-curriculum-model`; orientation is in none of them. Confirmed against live `get-curriculum-model`.
- "Constructed tool" currently **means** "curriculum aggregation authored in the SDK" (`aggregated-*`).
  Orientation is a constructed tool whose concern is the **effort, not the curriculum** — the
  architectural knot.
- Curriculum response decoration (`OAK_CONTEXT_HINT` / `formatToolResponse`) is applied in
  `universal-tool-shared.ts` and the per-aggregated-tool formatting — so whether decoration is
  unconditional for the pipeline or per-tool is the make-or-change question (see Design stance).

## Open architectural questions (what WS0 resolves)

- **RQ1 — SSOT vs three drifting surfaces.** Should orientation be added to all three hand-authored
  surfaces, or should the catalogue + server-instructions be **derived from the registry** so any
  registered tool is catalogued and announced by construction? (This fixes a defect larger than
  orientation — the three surfaces drift today.)
- **RQ2 — where a non-curriculum constructed tool belongs.** SDK gains a non-curriculum constructed
  tool (identity tension with a curriculum SDK), or a **registry extension seam** lets the app
  contribute a constructed tool into the unified pipeline (respecting ADR-041/060)? What did
  ADR-060's metadata pattern intend? **This question is owned upstream by the
  [Generic-Foundation Decomposition programme](../../architecture-and-infrastructure/generic-foundation-decomposition.programme.md)
  (the Oak-specific↔general / framework↔consumer split); align with it rather than re-deciding it
  here.** The `openapi-pipeline-framework` "Oak logic stays outside the core" model is the template.
- **RQ3 — decoration as a per-tool property.** What needs to change so the curriculum hint is a
  per-tool/per-type property rather than pipeline-wide, so a content-firewalled constructed tool can
  join the pipeline by construction? (Framed per the Design stance — not "is it allowed".)
- **RQ4 — correct lifecycle home** of each change (sdk-codegen vs authored-config vs runtime
  registration), given RQ1–RQ3 and the Cardinal Rule.
- **RQ5 — Badger field-observation adjudication** (now secondary): adjudicate the 8 assumptions +
  4 root-causes recorded in the archived `oak-under-the-hood.plan.md` §Field observation against the
  structural answer; deployed-prod-vs-main consistency.

## Means (workstreams)

### WS0 — Architectural review of the MCP stack (READ-ONLY; gated on owner go-ahead to begin)

The deep exploration. A read-only, multi-lane, adversarially-verified architectural review that
grounds the full SDK→MCP generation lifecycle and resolves RQ1–RQ5. Lanes (indicative): generation
lifecycle pipeline; tool taxonomy as-built; tool-listing-surface provenance (generated vs authored)
and SSOT/derivation feasibility; SDK/app boundary + ADR review; curriculum-coupling site and its
configurability; connective-tissue discoverability map; MCP-spec discoverability reliability; Badger
adjudication. A drafted ultracode workflow for this exists at
`<session>/workflows/scripts/mcp-tool-taxonomy-and-orientation-architecture-*.js` (authored + stopped
this session, not run) — reusable as WS0's method. **Output:** a findings report under
`.agent/reports/` that resolves RQ1–RQ5 with first-hand evidence and adversarial verification, and
**names design options + the owner-decisions they pose**. WS0 makes **no** architecture decision and
changes **no** code.

**Acceptance (WS0):** report authored under `.agent/reports/`; RQ1–RQ5 each answered with first-hand
evidence (file:line / live tool output / spec citation) and at least one adversarial-verification
pass per load-bearing claim; design options enumerated; owner-decisions named; no code changed.
Proof level: `non-code` (a review artefact) + `value-proxy` (the live-behaviour reproduction of the
invisibility, captured as the baseline the fix must beat).

### GATE — Owner design decision (owner-gated)

The owner decides, from WS0's options: (a) the SSOT/derivation approach for the tool-listing
surfaces; (b) where the orientation constructed tool lives; (c) how decoration becomes per-tool.
Recorded (ADR amendment or new ADR, per WS0's recommendation). **No implementation begins until this
decision is recorded.**

### WS1 — Implementation (PROVISIONAL — shape finalises at the GATE; TDD cycles)

Implement the decided architecture in test-first TDD cycles (the cycle is the unit of landing; tests
and product code land together). Indicative, pending the decision: make response decoration a
per-tool property; unify or SSOT-derive the three tool-listing surfaces; register orientation as a
first-class constructed tool through the one registry + catalogue + server-instructions path; keep
the content firewall as a per-tool property (no curriculum hint on orientation). No
bolt-on/bridge/third-category shape is acceptable (replace, don't bridge).

**Acceptance (WS1):** orientation appears in the unified registry, the catalogue, and the server
instructions by the decided mechanism; the content firewall is preserved (orientation result carries
no curriculum hint); `pnpm check` green; no third-category registration path remains.

### WS2 — Validate by live agent behaviour

Run a connected assistant (real client or MCPJam) against the built server: an orientation request
discovers and invokes `oak-under-the-hood`; a curriculum request still routes to the curriculum
tools. Observe behaviour — never assert a description string. Update
[`../../developer-experience/active/onboarding-simulations-public-alpha-readiness.md`](../../developer-experience/active/onboarding-simulations-public-alpha-readiness.md)
with a dated entry.

**Acceptance (WS2):** live reproduction shows orientation discovered as reliably as curriculum tools
(beating the WS0 baseline); firewall intact; register updated. Proof level: `value-proxy` + `e2e`.

## Acceptance criteria (outcome-level)

1. Orientation is discoverable via the MCP app **by construction** — verified by live agent behaviour,
   not by an advisory hint and not by a content-string assertion.
2. The two-type model holds: orientation is a first-class constructed tool; **no third registration
   category** remains.
3. The tool-listing surfaces no longer drift (one SSOT, or an explicitly-owner-decided equivalent).
4. The curriculum/orientation **content** firewall is preserved as a per-tool property (ADR-041).
5. The Cardinal Rule and the SDK→app dependency direction are intact.

## Prerequisites

- **Blocking:** owner go-ahead to begin WS0 (the deep exploration) — the owner has explicitly
  deferred it (2026-06-28). The owner design decision (GATE) blocks WS1+.
- **Beneficial:** the stopped WS0 workflow script (method reuse). Minimum shippable shape without it:
  WS0 runs its lanes directly without the pre-authored workflow.

## Non-goals (YAGNI)

- Not changing the **in-repo** `/oak-under-the-hood` skill — it works; only the MCP-surfaced
  discoverability is in scope.
- Not re-mixing curriculum and orientation **content** — the firewall stays.
- Not a bolt-on bridge (appending a pointer to instructions, a one-off cross-reference) that
  preserves the third-category shape — explicitly rejected by replace-don't-bridge.
- Not starting any implementation before the owner design decision.
- Not re-litigating the orientation reframe already shipped via PR #243 (W1–W3).

## Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| The review reasons from the current shape (cowpath) and proposes a bolt-on | Design stance is explicit; WS0 lanes ask "what must change", adversarial verify rejects bridges/third-category options |
| A "discoverability" fix smuggles content coupling back in | WS0 + WS1 hold the content firewall as a per-tool property; a verify lens checks the navigation-not-content distinction is real |
| SSOT-derivation refactor scope balloons beyond orientation | The GATE lets the owner scope it; orientation can be delivered against whichever SSOT decision is taken |
| SDK gains a curriculum-foreign concern | RQ2 weighs the SDK-home vs registry-extension-seam options against ADR-041/060 before any code |
| Server `instructions` is advisory/client-optional | WS0 MCP-spec lane establishes which surfaces are reliable; success is "discoverable by construction", validated by live behaviour |
| Findings accepted on trust | Owner mandate: every finding critically assessed first-hand before use; adversarial verification in WS0 |

## Foundation alignment

- **principles.md** — two-type model and the malleable-shape stance map to §Architectural Excellence,
  §Strict and Complete, Decision Lens 4, the Cardinal Rule, and Layer Role Topology (apps thin, SDK
  owns mechanism).
- **testing-strategy.md** — WS1 is TDD cycles; WS2 proves behaviour by live observation, not content
  pins (no description-string assertions).
- **schema-first-execution.md** — passthrough tools flow from the OpenAPI schema at sdk-codegen; WS0
  RQ4 places each change at the correct lifecycle phase.
- ADR-041 (SDK/app firewall + boundary), ADR-058 (dual result shape), ADR-060 (agent-support
  metadata → instructions pattern), ADR-202/ADR-205 (orientation lens + public-resource
  classification).
- [ADR-209](../../../../docs/architecture/architectural-decisions/209-planning-vocabulary.md) /
  [PDR-121](../../../practice-core/decision-records/PDR-121-planning-vocabulary.md) (planning
  vocabulary) — this plan's use of "programme" follows the canonical glossary; the plan is a
  downstream consumer of the Generic-Foundation Decomposition programme, not a member.

## Plan-body first-principles check

Fires at **WS0 start**: re-read first-hand the registry/registration path (handlers.ts,
universal-tools/), the three tool-listing surfaces (tool-guidance-data.ts,
agent-support-tool-metadata.ts, prerequisite-guidance.ts), the coupling site
(universal-tool-shared.ts), and the orientation tool (oak-under-the-hood-tool.ts) — confirm the
grounding facts still hold before resolving RQ1–RQ5. The landing path (WS1) is the registry +
catalogue + server-instructions surfaces plus the orientation tool's registration; confirm those are
the live surfaces at GATE time. Vendor-literal MCP call shapes (registerTool, dual result, resource
annotations) are verified against the installed SDK version at author time in WS1.

## Readiness reviewers

This plan is **DECISION-INCOMPLETE**, so it is not yet marked READY FOR EXECUTION. Before WS1 is
marked ready (post-GATE): `assumptions-expert` (plan-readiness/proportionality), `mcp-expert`
(protocol surfaces), `architecture-expert-*` (the SDK/app boundary + the SSOT refactor),
`docs-adr-expert` (the ADR amendment), each **critically assessed** — reviewer convergence is not
evidence of correctness.

## Learning loop

WS0 closes with a findings report and a consolidation pass; the GATE records the decision in an ADR;
WS1/WS2 completion runs `/oak-consolidate-docs` and updates the thread record + repo-continuity.

## Lifecycle triggers

Reference [`../../templates/components/lifecycle-triggers.md`](../../templates/components/lifecycle-triggers.md).
This plan touches MCP/SDK architecture and an ADR — significant change → WS0 review artefact, GATE
ADR, post-WS1 specialist review, and WS2 onboarding-register update are the required touch points.

## Cross-references

- **Upstream programme (this plan's RQ2 aligns to it, does not re-decide it):**
  [`generic-foundation-decomposition.programme.md`](../../architecture-and-infrastructure/generic-foundation-decomposition.programme.md)
  — cross-cutting view of the codegen↔runtime and Oak-specific↔general separation work; ADR-108 is
  its anchor.
- **Predecessor (DONE, archiving):**
  [`../active/oak-under-the-hood.plan.md`](../active/oak-under-the-hood.plan.md) — W1–W3 merged via
  PR #243; carries the Badger §Field-observation that RQ5 adjudicates.
- **Related prior work (completed, archived):** `mcp-self-description-fidelity.plan.md` (MCP
  self-description accuracy — `archive/completed/`).
- **Adjacent active plans (cross-reference, do not duplicate):**
  [`../active/upstream-api-reference-metadata.plan.md`](../active/upstream-api-reference-metadata.plan.md)
  (tool-descriptor metadata for API-direct discovery),
  [`../active/schema-resilience-and-response-architecture.plan.md`](../active/schema-resilience-and-response-architecture.plan.md)
  (codegen/response architecture),
  [`../active/workspace_topology_exploration.plan.md`](../active/workspace_topology_exploration.plan.md)
  (layered-architecture analysis — architectural-review-adjacent).
