---
name: "Explain Orientation as an MCP Surface (WS-B)"
status: READY FOR EXECUTION
lineage:
  serves_thread: orientation-skills-family
  serves_stream: teaching-surface family across the PDR-112 portability seam
  strategic_choice: >
    put Oak's orientation lens where connected AI assistants already are —
    extend the explain lens to a new audience (general MCP-connected assistants)
    via the Oak Curriculum MCP server
  derives_from: >
    worktree-pilot-coordination.plan.md (WS-B delegation brief); owner decision C
    (tool + resource + prompt, 2026-06-24); mcp-expert spec verdict (MCP 2025-11-25);
    architecture-expert-betty content-home verdict (app-local, ADR-031 hybrid);
    projection-fidelity verdict (behaviour-shell + live-route, lens is non-baking)
todos:
  - id: ws-b-d1-generated-body
    content: >
      App-local generation step extracts the explain lens BEHAVIOUR SHELL
      (discernment contract, delivery modes, honesty invariants) from the explain
      SKILL-CANONICAL into a committed src/generated/explain-content.ts constant,
      routing re-targeted to existing MCP surfaces; no baked repo-doc prose
      (ADR-031 pattern; mirrors embed-widget-html.ts)
    status: pending
  - id: ws-b-d2-resource
    content: >
      Register docs://oak/explain.md resource (nested annotations
      priority/audience/lastModified) whose read returns the generated body; file
      scope register-resources.ts
    status: pending
    depends_on: [ws-b-d1-generated-body]
  - id: ws-b-d3-tool
    content: >
      Register a model-controlled explain/orient tool via a NEW app-local
      server.registerTool seam (outside the generated-tools loop); result is the
      dual-shape (content + structuredContent, NO outputSchema) per ADR-058; file
      scope handlers.ts
    status: pending
    depends_on: [ws-b-d1-generated-body]
  - id: ws-b-d4-prompt
    content: >
      Register a user-invoked explain prompt (joins local PROMPT_REGISTRATIONS +
      derived type; argsSchema omitted) surfacing the orientation process; file
      scope register-prompts.ts
    status: pending
    depends_on: [ws-b-d1-generated-body]
  - id: ws-b-d5-value-proxy
    content: >
      Demonstrate value: a connected-assistant (or MCPJam close proxy) given an
      orientation trigger calls the explain tool AND a subsequent call targets an
      MCP surface named in the routing
    status: pending
    depends_on: [ws-b-d2-resource, ws-b-d3-tool, ws-b-d4-prompt]
---

# Explain Orientation as an MCP Surface (WS-B)

> Worktree-pilot lane WS-B. Owned by the WS-B Implementer (Swordfish tracks
> Driftwood, 4fe4cf), worktree `oak-pilot-ws-b-explain`, branch
> `pilot/ws-b-explain-resource` (rebased onto `coordination/worktree-pilot`
> @ `6d80d119e`, the proven-stable threads base). This plan IS the WS-B cycle-0
> deliverable. Reviewer verdicts folded (see §Readiness Reviewers).

## Problem and Intent

**Gap.** A general AI assistant connected to the Oak Curriculum MCP server, asked
to "tell me about this" / "get me started" / "give me a tour", has no orientation
surface to follow — it improvises. The repository has a high-quality orientation
lens (`.agent/skills/explain/SKILL-CANONICAL.md`), but it lives in the repo, is
invisible to a connected assistant, and — by its own contract — reads content live
at answer time.

**Who it harms.** Educators and developers using a third-party assistant (ChatGPT,
Claude, Gemini) connected to the Oak MCP server get an unguided, lower-quality
first experience.

**Mechanism (causal hypothesis).** Expose the explain lens's *behaviour* — its
discernment-and-delivery shell — through MCP primitives the connected assistant
can use, with routing re-targeted to MCP-reachable surfaces, so the assistant runs
the orientation process instead of improvising.

**Constraints.**

- Spec reality (mcp-expert, MCP 2025-11-25): a *resource* cannot auto-fire on a
  trigger; only a model-controlled *tool* fires autonomously, and even a tool
  cannot be *forced* — description quality is the lever. "Followable" is
  achievable; "guaranteed auto-follow" is not (owner-accepted via decision C).
- **The lens is constitutively non-baking** (projection-fidelity verdict). Its
  Router Principle: it "carries the discernment, the delivery shapes, and the
  manners — nothing else. Every command, fact, and architectural claim is read
  from the live documents at answer time … the doc wins"; its Honesty Invariants
  forbid presenting remembered/frozen content as current (the progress report is
  resolved live). So a faithful projection bakes *behaviour*, never repo-doc prose.
- SSOT: `.agent/skills/explain/SKILL-CANONICAL.md` is the single source; not
  hand-duplicated (PDR-112 / ADR-202). A generated *behaviour* projection is not
  duplication.
- A remote assistant has no repo filesystem: the served body must be
  self-contained and route to MCP-exposed surfaces, never to repo filepaths.
- Content-home (betty): app-local only — the published curriculum-domain SDK must
  not carry repo/server-orientation content, and its build must not read repo-root
  `.agent/` (ADR-041, publishable self-containedness).

**Success looks like.** Decision C delivered: an `explain` tool (primary,
model-fires), a `docs://oak/explain.md` resource, and a user-invoked prompt — all
sharing one generation-extracted behaviour body — with e2e proof over the real MCP
path and a value-proxy showing a connected assistant runs the orientation routing.

## Faithful Projection — what "explain" bakes vs routes

The projection-fidelity verdict resolved the scope question on the lens's own
terms. The dividing line is **bake the behaviour, route the content**:

- **Baked into `src/generated/explain-content.ts` (stable behaviour):** the
  front-door discernment contract (greet, ≤3 questions, never-a-menu), the three
  delivery modes and the escalation ladder, the progressive-disclosure grain, the
  honesty invariants, and the access-aware fork. None of this is repo-doc content;
  all of it is the lens's portable behaviour, genuinely self-contained.
- **Routed to existing MCP surfaces at answer time (content):** the curriculum
  domain model and tool guidance → `get-curriculum-model` / `curriculum://model`;
  the "start here" experience → the existing `getting-started` documentation
  resource; evidence grounding → the EEF interpretation resource. These are the
  MCP analogues of the lens's live-doc reads.
- **Explicitly NOT baked:** the Headline Invariants (the lens says never restate
  them), and any README / VISION / progress-report prose (baking it would present
  remembered content as current — the exact honesty hazard the lens forbids, and
  no build-time freshness signal makes a frozen snapshot faithful).

The breadth of the MCP-served explain is therefore gated by **what MCP surfaces
exist**, not by a build-time prose decision.

### Owner-decision pending — whole-ecosystem orientation gap

The owner's headline example ("tell me about the ecosystem repo") wants
whole-ecosystem orientation. That content (README's three value-streams, VISION,
the Headline Invariants, the live progress report) has **no MCP surface today**, so
it cannot be routed, and the lens forbids baking it. Serving it faithfully needs a
**separate** ecosystem-overview MCP resource (e.g. `docs://oak/overview.md`)
generated from the *stable* published prose (README / VISION), explicitly excluding
the live-resolved progress report. Whether that resource joins this lane now (B) or
is raised as a separate owner-decided deliverable (A, recommended) is **with the
owner** (routed by the Director, 2026-06-24). It decides whether an additional
deliverable joins the lane; it does **not** change D1–D5 below.

## End Goal, Mechanism, and Means

- **End goal.** A connected general AI assistant, given an orientation trigger,
  reliably runs Oak's explain orientation process — improving the first experience
  of the Oak MCP server.
- **Mechanism.** The model-controlled tool is the only primitive that fires on a
  natural-language trigger (ADR-058/ADR-123 dual-exposure, identical shape to
  `get-curriculum-model`); the resource serves the same body to resource-injecting
  clients; the prompt is the explicit opt-in entry point. One generated behaviour
  body keeps all three coherent with the SSOT.
- **Means.** D1 generation step → D2 resource → D3 tool → D4 prompt → D5
  value-proxy (sequenced by consumption, PDR-093). **D2/D3/D4 are parallel-safe by
  file-disjointness** — D2 edits `register-resources.ts`, D3 edits `handlers.ts`,
  D4 edits `register-prompts.ts` — so completing one changes neither what the
  others do nor how they are verified; all three consume D1's single constant.

## Owned Surface and Non-Goals

**Owned surface** (all app-local, `apps/oak-curriculum-mcp-streamable-http`):

- `scripts/generate-explain-content.ts` (new generation step)
- `src/generated/explain-content.ts` (new committed generated constant)
- the explain tool / resource / prompt modules (new, app-local) + their tests
- `src/register-resources.ts`, `src/register-prompts.ts`, the `handlers.ts`
  tool-registration area (additive registration)
- `e2e-tests/` additions for resource / tool / prompt

**Non-goals.**

- Not editing `.agent/skills/explain/SKILL-CANONICAL.md` (SSOT is read-only here).
- Not the SDK (`packages/sdks/oak-curriculum-sdk`) — betty ruled SDK placement a
  cohesion / publishability / ADR-041 violation.
- Not baking repo-doc prose (README / VISION / invariants / progress) — lens-forbidden.
- Not WS-A's vitest config. Not guaranteed auto-follow (client-dependent; accepted).
- Not altering existing resources / tools (getting-started, curriculum-model, EEF).
- Not the ecosystem-overview resource (owner-pending, above) — out of this lane unless the owner picks B.
- Not a new workspace (single capability; below the third-consumer threshold).

## Prerequisites

- **Blocking for authoring/build:** none. `pnpm install` in the worktree is done;
  the branch is rebased onto the threads base.
- **Beneficial (folded):** mcp-expert pass on the exact SDK registration shapes —
  **completed** (see §Readiness Reviewers); findings folded into D2–D4 below.

## Workstreams (TDD cycles — one commit per cycle)

### D1 — Generated behaviour body (foundation; blocking)

Build an app-local generation step (mirroring `scripts/embed-widget-html.ts`:
app-local `scripts/`, anchored by `resolve(scriptDir, '..')`, committed
`src/generated/` output) that reads `.agent/skills/explain/SKILL-CANONICAL.md` at
build time and writes a committed `src/generated/explain-content.ts` exporting the
**behaviour body** as a string constant plus a `lastModified` ISO-8601 datetime
passed in (no global clock in tests).

- **Cycle D1.1 (unit).** Test the transformation function. Given the canonical, the
  output: (a) contains **none** of the filesystem / repo-path / `file://` / "read
  the file" lines; (b) **retains** the discernment contract, the three delivery
  modes, the escalation ladder, and the honesty invariants; (c) contains **no
  restated Headline Invariants and no baked README / VISION / progress prose**
  (the lens's never-restate / never-substitute contract); (d) routes only to
  MCP-named surfaces (`get-curriculum-model`, `getting-started`, EEF), not repo
  filepaths. Product code: the transformer. *Test-first; product code greens it.*
- **Cycle D1.2 (unit + generation).** Test the generation script writes
  `src/generated/explain-content.ts` exporting a non-empty
  `EXPLAIN_ORIENTATION_BODY` and is deterministic. Wire a
  `generate:explain-content` package script and a codegen-drift check (regenerate →
  `git diff --exit-code` on the generated file). The drift check is sufficient for
  the **behaviour shell** (stable, lives in the canonical); it is *not* relied on
  for ecosystem prose precisely because none is baked.

**Acceptance (D1):** transformer unit tests green per (a)–(d); generated file
committed; drift check passes. **Proof:** `unit` + the drift-check command.

### D2 — `docs://oak/explain.md` resource (consumes D1)

Mirror `registerDocumentationResources` exactly — destructure `{ name, uri,
...metadata }` and pass `metadata` as the `config` arg; type the registrar as the
narrow `Pick<McpServer, 'registerResource'>` (per `register-resource-helpers.ts`).
Annotations are **nested**: `annotations: { priority: 0.9, audience: ['assistant'],
lastModified }` where `lastModified` is an ISO-8601 datetime string;
`mimeType: 'text/markdown'`; custom `docs://oak/explain.md` URI. Read returns
`{ contents: [{ uri, mimeType, text: EXPLAIN_ORIENTATION_BODY }] }`.

- **Cycle D2.1 (integration).** Resource registered via `registerResource` with the
  nested annotations; read returns the body.
- **Cycle D2.2 (e2e).** Extend `documentation-resources.e2e.test.ts`:
  `resources/list` surfaces `docs://oak/explain.md`; `resources/read` returns the
  orientation process (assert a stable discernment-contract phrase present; assert
  no `file://`).

**Acceptance (D2):** resource in `resources/list` with correct nested metadata;
`resources/read` returns the body. **Proof:** `integration` + `e2e`.

### D3 — `explain` / `orient` tool (consumes D1; the firing primitive)

**D3 is structurally heavier than D2/D4: it introduces the first app-local tool
seam.** The existing `registerTools` in `handlers.ts` iterates only
`listUniversalTools(generatedToolRegistry)` (SDK-generated tools); an app-local
explain tool is not in that registry, so D3 adds a **separate, additive
`server.registerTool(...)` call** for explain — it does not flow through the
universal-tools loop and must not be force-fitted into `generatedToolRegistry`.

The `tools/list` **description** is short and trigger-optimised ("Use FIRST when a
user asks to understand, get oriented to, get started with, or tour the Oak
curriculum MCP server / Oak's offering…"). The tool takes no arguments, so
**`inputSchema` is omitted**. The tool **result** is the ADR-058 dual shape —
`content: [summary, jsonBody]` plus `structuredContent` — built by reusing the
canonical `formatToolResponse()` (`universal-tool-shared.ts`), and **declares NO
`outputSchema`** (the SDK runs strict `structuredContent` validation only when an
`outputSchema` is registered; a free-form body with an `outputSchema` would fail at
`tools/call`; every existing agent-support tool omits it — mirror that).

- **Cycle D3.1 (integration).** `server.registerTool` called for the explain tool
  with the trigger-optimised description; the handler returns the dual-shape result
  containing the body; assert the explain tool **coexists** with the
  generated-registry tools in `tools/list` without disturbing them.
- **Cycle D3.2 (e2e).** `tools/list` surfaces the tool; `tools/call` returns the
  dual-shape orientation process.

**Acceptance (D3):** tool in `tools/list` with a trigger-optimised description,
coexisting with generated tools; `tools/call` returns the dual-shape process; no
`outputSchema` declared. **Proof:** `integration` + `e2e`.

### D4 — Explain prompt entry point (consumes D1)

Register a user-invoked prompt (`explain` / `orient`) that joins the app's local
`PROMPT_REGISTRATIONS` array and its derived `RegisteredPromptName` type (per
`register-prompts.ts`); `argsSchema` is **omitted** (no args; no `prompt-schemas.ts`
entry needed). `prompts/get` returns `{ messages: [{ role: 'user', content: {
type: 'text', text: EXPLAIN_ORIENTATION_BODY } }] }` — note `content` is a **single
object**, not an array.

- **Cycle D4.1 (integration).** Prompt registered (`registerPrompt`); `prompts/get`
  returns the single-object-content message carrying the orientation process.
- **Cycle D4.2 (e2e).** `prompts/list` surfaces it; `prompts/get` returns the entry.

**Acceptance (D4):** prompt in `prompts/list`; `prompts/get` returns the
orientation entry in the correct message shape. **Proof:** `integration` + `e2e`.

### D5 — Value proxy (consumes D2–D4)

Demonstrate the brief's value. Drive the server via MCPJam (the repo's MCP test
harness) with an orientation-style request, or a live connected-assistant trial if
available. The observable must be sharp: the transcript shows the explain tool
**fired** AND **at least one subsequent call targets an MCP surface named in the
routing** (e.g. `get-curriculum-model` or the `getting-started` resource) — not a
fire-only transcript.

**Acceptance (D5):** documented value-proxy showing trigger → explain tool → a
subsequent call to a routed, existing MCP surface. **Proof:** `value-proxy`
(MCPJam transcript or live-assistant note), recorded in evidence.

## Quality Gates

Per [`components/quality-gates.md`](../../templates/components/quality-gates.md):
each cycle runs its named unit/integration/e2e test plus the relevant local gates
(`pnpm --filter @oaknational/oak-curriculum-mcp-streamable-http type-check | lint |
test`); phase and final validation use the canonical aggregate (`pnpm check`).
Turbo flag discipline (per Juno's WS-A note): turbo's own flags go on
`pnpm exec turbo run test --continue …` (no `--`); `pnpm test -- <args>` forwards
to vitest. Host-health is snapshotted before timing-sensitive runs (contention
observed: load 33/14, swap 6.9G/8G); durations are reported with load/swap and not
trusted under contention.

## Proof Contract

| Acceptance id | Proof level | Command / observation |
|---|---|---|
| ws-b-d1 | unit | transformer unit test (assertions a–d); `pnpm generate:explain-content` then `git diff --exit-code` on the generated file |
| ws-b-d2 | integration + e2e | resource integration test; `documentation-resources.e2e` extension |
| ws-b-d3 | integration + e2e | tool registration + coexistence integration test; `tools/list` + `tools/call` e2e |
| ws-b-d4 | integration + e2e | prompt registration integration test; `prompts/list` + `prompts/get` e2e |
| ws-b-d5 | value-proxy | MCPJam transcript or connected-assistant note: trigger → explain tool → subsequent call to a routed existing surface |

No `complete` / `READY`-met verdict for WS-B until every id is proven. TDD evidence
is test-first per cycle; retrospective coverage is not counted as TDD evidence.

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Transformer over-strips (loses discernment) or under-strips (leaves fs-coupling / baked prose) | Med | High | D1.1 asserts all of (a)–(d): no fs-coupling, no restated invariants, no baked ecosystem prose, discernment+modes+honesty retained |
| Routing re-target references an MCP surface that does not exist | Med | Med | Route only to surfaces confirmed in this server's `resources/list` / `tools/list`; assert in D5 |
| D3 mis-declares an `outputSchema` and fails `tools/call` validation | Med | High | Plan + D3.1 pin "no outputSchema; structuredContent only", mirroring agent-support tools; reuse `formatToolResponse()` |
| Canonical drifts, generated behaviour body goes stale | Low | Med | Codegen-drift check (regenerate → `git diff --exit-code`) in D1.2 |
| Client does not fire the tool (not forceable) | High | Low (accepted) | Owner-accepted via C; lever is description quality; D5 proves "followable", not "guaranteed" |

## Foundation Alignment

- **`principles.md`** — Second Question: reuse existing MCP primitives, no new
  mechanism; strict validation only at the MCP boundary.
- **`testing-strategy.md`** — TDD cycle-pairs; tests describe MCP-observable
  behaviour (`resources/list`, `tools/call`, `prompts/get`), never file presence;
  no global state / no `process.env` in tests.
- **`schema-first-execution.md`** — generation-time extraction (ADR-031) is the
  sanctioned build-time-content pattern; the behaviour body is static content built
  at compile time, not API data, so the Cardinal Rule's schema-flow does not apply
  (documentation content, like `getting-started`).
- **PDR-112 / ADR-202** — generated *behaviour* projection, single-sourced, not
  duplicated; the lens's own non-baking contract honoured.
- **ADR-058 / ADR-123** — dual-exposure and the tool-reliability ranking (tool
  output > structuredContent > description > server instructions).

## Plan-Body First-Principles Check

Per [`plan-body-first-principles-check.md`](../../../rules/plan-body-first-principles-check.md):

- **Shape clause** fires at D1 before building the transformer — confirm the body
  is behaviour-shell + MCP-routing (not baked prose) before generating.
- **Vendor-literal clause** fires at D2–D4 before writing registration — the SDK
  shapes are folded from the mcp-expert first-hand read of installed
  `@modelcontextprotocol/sdk@1.29.0` (nested annotations, no-`outputSchema`,
  single-object prompt content, narrow registrar types); re-confirm against the
  installed types at the point of code, not from memory.
- **Landing-path clause** fires before each commit — one cycle = one commit, with
  test and product code together, every commit ending green.

## Readiness Reviewers (folded — no backfill)

All invoked before this READY mark; verdicts folded into the plan above:

- **assumptions-expert** — READY-WITH-CHANGES; 4 structural edits folded (D3 new
  app-local `registerTool` seam; D2/D3/D4 independence basis = file-disjointness;
  D5 sharpened to a checkable observable; D4 `PROMPT_REGISTRATIONS` + derived type).
- **assumptions-expert (projection fidelity)** — MUST-STAY-BEHAVIOUR-SHELL; the
  lens is constitutively non-baking; bake behaviour, route content; whole-ecosystem
  breadth needs a separate owner-decided resource (folded into §Faithful Projection
  and §Owner-decision pending).
- **mcp-expert** — plan CORRECT on all five SDK shapes (installed 1.29.0); precision
  notes folded (no `outputSchema`, `formatToolResponse()` reuse, single-object
  prompt content, narrow `Pick<…>` registrar types, ISO `lastModified`).

## Learning Loop

On WS-B completion / reintegration, run the consolidation workflow: fold the
worktree-pilot and Director-model evidence into
`worktree-pilot-coordination.plan.md`'s research-capture log and the
`worktree-per-agent-transition` future plan; mine the
generation-time-behaviour-projection pattern (bake behaviour, route content) into
the appropriate permanent home if it recurs.

## Lifecycle Triggers

Per [`components/lifecycle-triggers.md`](../../templates/components/lifecycle-triggers.md):
session entry done (start-right-team); claim registered + widened (f9e6a413,
app-local); this plan is the work-shape artefact; handoff/closeout per the
worktree-pilot Closeout Contract; consolidation at completion (above).

## Reintegration

`pilot/ws-b-explain-resource` is rebased onto `coordination/worktree-pilot`
@ `6d80d119e` (threads base). After WS-B cycles land, merge
`pilot/ws-b-explain-resource` → `coordination/worktree-pilot`; Director reviews the
WS-B verdict; owner reviews the coordination branch → `main` via code-owner review
(never `--admin`).
