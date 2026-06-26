---
name: "Explain Effort-Orientation as an MCP Surface (WS-B)"
status: IN PROGRESS — D1+D2 landed behaviour-only on branch worktree-ws-b-explain (commit 03c279ca2); test doctrine corrected (see §2026-06-26 correction, READ FIRST); D0 audience-model + D3-D5 remain. Authoritative continuation = orientation-skills-family thread record.
lineage:
  serves_thread: orientation-skills-family
  serves_stream: teaching-surface family across the PDR-112 portability seam
  strategic_choice: >
    put Oak's effort/ecosystem orientation where connected AI assistants already
    are — project the explain lens's BEHAVIOUR onto the Oak MCP server, scoped to
    the Oak EFFORT (how Oak builds and delivers its curriculum), kept absolutely
    separate from the curriculum-content surfaces the same connector already serves
  derives_from: >
    worktree-pilot-coordination.plan.md (WS-B delegation brief); owner decision C
    (tool + resource + prompt, 2026-06-24); OWNER SEPARATION PRINCIPLE (2026-06-24,
    relayed by Director event 11e5986d + PROCEED ruling): curriculum content and
    effort content stay ABSOLUTELY SEPARATE; explain is the EFFORT/ecosystem surface,
    never routes to or returns curriculum data; mcp-expert spec verdict (MCP
    2025-11-25, SDK 1.29.0 shapes — content-domain-invariant, re-confirm pending);
    architecture-expert-betty content-home verdict (app-local, ADR-031, ADR-041)
todos:
  - id: ws-b-d0-audience-model
    content: >
      NEW (owner-directed 2026-06-26), foundational. Audit ALL audiences and audience-like
      decision points across the explain SKILL-CANONICAL (the SSOT) AND this MCP projection;
      reconcile them consistently; add data analyst / data scientist (served the EFFORT/data
      orientation, firewalled from curriculum data). Re-curate the behaviour-shell to the current
      canonical (changed via #238). D1's body regenerates from the re-curated shell.
    status: pending
  - id: ws-b-d1-generated-body
    content: >
      App-local generation step builds a committed src/generated/explain-content.ts
      with TWO parts: (1) the explain BEHAVIOUR SHELL (discernment contract, three
      delivery modes + escalation ladder, progressive-disclosure grain, honesty
      invariants, access-aware fork) extracted from the explain SKILL-CANONICAL; (2)
      the EFFORT-OVERVIEW content baked from STABLE README.md + VISION.md, EXCLUDING
      the live progress report, carrying a lastModified freshness signal. NO
      curriculum-surface routing and NO curriculum data anywhere (separation
      principle). ADR-031 pattern; mirrors embed-widget-html.ts.
    status: completed
  - id: ws-b-d2-resource
    content: >
      Register an effort-overview resource (docs://oak/explain.md) with LOW-salience
      nested annotations (priority low, audience ['assistant']) whose read returns
      the generated effort-orientation body; file scope register-resources.ts
    status: completed
    depends_on: [ws-b-d1-generated-body]
  - id: ws-b-d3-tool
    content: >
      Register a model-controlled explain/orient tool via a NEW app-local
      server.registerTool seam (outside the generated-tools loop); description fires
      ONLY on effort/ecosystem-orientation triggers, NEVER on curriculum queries;
      result is the dual-shape (content + structuredContent, NO outputSchema) per
      ADR-058; file scope handlers.ts
    status: pending
    depends_on: [ws-b-d1-generated-body]
  - id: ws-b-d4-prompt
    content: >
      Register a user-invoked, opt-in explain prompt (joins local
      PROMPT_REGISTRATIONS + derived type; argsSchema omitted) surfacing the
      effort-orientation process; file scope register-prompts.ts
    status: pending
    depends_on: [ws-b-d1-generated-body]
  - id: ws-b-d5-value-proxy
    content: >
      Demonstrate value AND separation: a connected-assistant (or MCPJam proxy)
      given an EFFORT-orientation trigger calls the explain tool and receives the
      effort orientation; AND a CURRICULUM query does NOT engage explain (the
      separation is observable)
    status: pending
    depends_on: [ws-b-d2-resource, ws-b-d3-tool, ws-b-d4-prompt]
---

# Explain Effort-Orientation as an MCP Surface (WS-B)

> Worktree-pilot lane WS-B. Owned by the WS-B Implementer (Sturgeon rides
> Driftwood, c5406c), worktree `oak-pilot-ws-b-explain`, branch
> `pilot/ws-b-explain-resource` (rebased onto `coordination/worktree-pilot`
> @ `6d80d119e`, the proven-stable threads base). This plan is the WS-B cycle-0
> deliverable. **Corrected to the effort-domain shape per the owner separation
> principle (2026-06-24); the prior reviewer verdicts were folded against the
> superseded curriculum-routing shape and are being re-run (see §Readiness
> Reviewers).**

## 2026-06-26 — Current state & test-doctrine correction (READ FIRST, Skipper tracks Kelp)

**Status:** D1 + D2 are BUILT and landed **behaviour-only** on branch `worktree-ws-b-explain`
(commit `03c279ca2`, off current `main`). D0 (audience model) + D3–D5 remain. The authoritative
continuation handoff is the `orientation-skills-family` thread record (§WS-B MCP surface).

**Test doctrine corrected (owner-directed, absolute) — this supersedes the drift-guard /
firewall-assertion / content-test approach still described in §"Faithful Projection",
§"Workstreams" D1, §"Proof Contract", and §"Risk Assessment" below.** Tests prove BEHAVIOUR, never
configuration or content. The two fingerprint drift-guards (canonical + effort-source) and the
content-grep unit tests were DELETED as config-pins / brittle content assertions (hashing a source
to detect change is the antithesis of prove-behaviour). What IS tested: MCP-observable registration
and serving, the DI'd assembler's composition (trivial fakes), and the regenerate→git-diff codegen
freshness check. **The curriculum and volatility firewalls are NOT tests — they are a PR-REVIEW
checklist item** (a content-quality property of the curated prose, held by construction and review).
The stale body sections named above still describe the removed approach; **reconcile them in-place
as part of D0** (they are flagged, not yet rewritten, to bound this session).

**D0 — Audience model (NEW, foundational, owner-directed 2026-06-26):** identify ALL audiences and
audience-like decision points across the explain SKILL-CANONICAL (the SSOT) AND this MCP projection;
reconcile them consistently; **add data analyst / data scientist** (served the EFFORT/data
orientation — Oak's data architecture, graph stack, SDK, how to engage — firewalled from curriculum
data). Re-curate the behaviour-shell to the CURRENT canonical (changed via #238 since this branch
was built — the deleted drift-guard's only real concern, now met by doing the re-curation). Open
design questions: is "educator" distinct from the deferred "education expert"? where do
product / compliance experts sit? D1's generated body regenerates from the re-curated shell.

**Merge note:** this branch's `.agent/` files (this plan, the thread record, repo-continuity, the
napkin) need a SEMANTIC merge (`/oak-semantic-merge`) at branch→main reconciliation, never a git
line-merge — git understands lines, not concepts.

## Problem and Intent

**Gap.** A general AI assistant connected to the Oak Curriculum MCP server, asked
about the Oak **effort** — "tell me about this repository / the Oak project", "how
does Oak build and deliver its curriculum", "what is this ecosystem", "how do I
engage or contribute" — has no orientation surface to follow, so it improvises.
The repository has a high-quality orientation lens
(`.agent/skills/explain/SKILL-CANONICAL.md`), but it lives in the repo and is
invisible to a connected assistant.

**The separation that defines this lane.** The connector already serves the Oak
**curriculum** through curriculum tools (`get-curriculum-model`, the EEF evidence
resource, search/browse, the graph tools). Curriculum is well-surfaced. What has
**no** surface is orientation to the **effort/ecosystem** — how Oak builds and
delivers that curriculum (the project's purpose, its three value-streams, the
MCP/SDK/agent-first-Practice machinery, how to engage). Per the owner separation
principle (2026-06-24), curriculum content and effort content stay **absolutely
separate**: ~99.9% of teachers do not care about the repo or the Practice, so the
effort surface is a **separate concern with a separate (minority) audience**, and
it must **never route to, or return, curriculum data**.

**Who it harms.** Developers, integrators, and AI-builders (a minority audience)
who connect an assistant and want to understand the Oak *effort* get an unguided,
improvised first experience. Teachers are unaffected — the surface is low-salience
for them by design.

**Mechanism (causal hypothesis).** Project the explain lens's *behaviour* — its
discernment-and-delivery shell — onto MCP primitives a connected assistant can use,
fired only on effort-orientation triggers, carrying a self-contained effort-overview
baked from Oak's **stable** effort prose, so the assistant runs Oak's orientation
process for the effort instead of improvising — and is silent on curriculum queries,
which the curriculum tools serve.

**Constraints.**

- **Separation principle (owner, hard):** the explain surface is effort/ecosystem
  domain only. Its tool description fires only on effort-orientation triggers, never
  on curriculum queries; it never routes to curriculum surfaces (`get-curriculum-model`,
  `getting-started`, EEF) and never returns curriculum data.
- **Spec reality (mcp-expert, MCP 2025-11-25):** a *resource* cannot auto-fire on a
  trigger; only a model-controlled *tool* fires autonomously, and even a tool cannot
  be *forced* — description quality is the lever. "Followable" is achievable;
  "guaranteed auto-follow" is not (owner-accepted via decision C).
- **Behaviour shell is portable, content is baked-from-stable.** The lens behaviour
  (discernment, delivery modes, honesty invariants, access-aware fork) is portable
  and extracted from the canonical. The effort-overview *content* is baked from the
  **stable** published prose (`README.md`, `VISION.md`), **excluding the live
  progress report** — the one volatile, honesty-hazardous source the lens resolves
  live (`oak-ecosystem-progress-*`, newest, resolved at answer time). A `lastModified`
  freshness signal is carried so a baked snapshot is never presented as live-current.
- **Honesty invariant carried (from the lens):** "this repo is one of Oak's AI
  efforts, not the whole of how Oak does AI" — the baked effort-overview leads with
  the repo's actual distinctive role and never inflates it; "exists vs planned" is
  preserved by excluding the live progress report rather than baking a frozen one.
- **SSOT:** `.agent/skills/explain/SKILL-CANONICAL.md` is the single source for the
  behaviour shell; `README.md` / `VISION.md` are the single sources for the effort
  content. A generated projection of behaviour + stable content is not duplication
  (PDR-112 / ADR-202).
- A remote assistant has no repo filesystem: the served body must be self-contained
  and must not reference repo filepaths or `file://`.
- **Content-home (betty):** app-local only — the published curriculum-domain SDK must
  not carry effort/server-orientation content, and its build must not read repo-root
  `.agent/` (ADR-041, publishable self-containedness).

**Success looks like.** Decision C delivered in the effort domain: an `explain`
tool (primary, model-fires on effort triggers only), a low-salience
`docs://oak/explain.md` effort-overview resource, and a user-invoked opt-in prompt —
all sharing one generated effort-orientation body (behaviour shell + stable
effort-overview) — with e2e proof over the real MCP path and a value-proxy showing a
connected assistant runs the effort-orientation **and** that a curriculum query does
not engage it.

## Faithful Projection — what "explain" bakes, and the curriculum firewall

**Resolving principle (why baking does not violate the lens's non-baking contract).**
The lens's Router Principle binds the *in-repo* lens, which has live filesystem access
and therefore *must* read content live at answer time. The *remote MCP surface has no
filesystem* — it cannot read live — so for it, baking the stable, hazard-free prose
with a `lastModified` freshness signal is the faithful realisation of the same intent,
not a departure from it. Only the live-resolved, exists-vs-planned content (the
progress report) and any other point-in-time status claim are withheld. This is the
single principle that keeps the firewall from being eroded later by a "but the lens
reads live" objection.

The dividing line is **bake the behaviour and the stable effort content; exclude the
volatile (any point-in-time status claim) and the curriculum**:

- **Baked into `src/generated/explain-content.ts` — behaviour shell (stable):** the
  front-door discernment contract (greet, at most three questions, never a menu), the
  three delivery modes and the escalation ladder, the progressive-disclosure grain,
  the honesty invariants, and the access-aware fork. This is the lens's portable
  behaviour, genuinely self-contained — extracted from the canonical, not repo-doc
  content.
- **Baked into the generated body — effort-overview content (stable):** the effort's
  purpose and distinctive role and *why it matters* (from `README.md` "What This Repo
  Provides" / the audience-routing banner and `VISION.md`); the three value-streams;
  the high-level shape of the machinery (MCP server, SDKs, the agent-first Practice)
  at executive altitude; the Architectural invariants **named with a pointer to the
  README single source, never restated**; how to engage/contribute at a pointer level.
  Carries a `lastModified` ISO-8601 datetime.
- **Explicitly NOT baked — the curriculum firewall and the volatility firewall:**
  - **No curriculum content or data, and no routing to curriculum surfaces.** The
    body never describes curriculum structure, never embeds curriculum-guide prose,
    and never names `get-curriculum-model` / EEF / `getting-started` as routes. If a
    user wants curriculum, that is a different concern served by the curriculum tools;
    explain stays silent on it.
  - **No volatile status claims — the volatility firewall, broader than the progress
    report.** Baking the live progress report (`oak-ecosystem-progress-*`) would present
    remembered content as current — the honesty hazard the lens forbids. But the hazard
    is not confined to that report: README itself carries point-in-time status prose —
    "Current status: Invite-Only Alpha" + the `curriculum-mcp-alpha.oaknational.dev` URL
    (line 27), "37 curriculum tools (24 generated … 13 aggregated)" (line 187), "as of
    &lt;month&gt;" datelines. Every such claim is excluded or genericised regardless of
    which stable file it lives in; no build-time `lastModified` makes a frozen status
    claim faithful.
  - **No restated Headline Invariants** (the lens says never restate them; point to
    the README block).

The breadth of the MCP-served explain is therefore the **stable effort story**, baked
because there is no live effort MCP surface to route to — bounded on one side by the
curriculum firewall and on the other by the volatility (progress-report) firewall.

### Whole-ecosystem orientation — A/B dissolved

The earlier open question (whether a *separate* ecosystem-overview resource was needed
for the owner's "tell me about the repo" example) is **resolved by decision C**:
curriculum-routing is forbidden and the effort content has no other surface, so
**WS-B's own resource IS the effort-orientation surface**. There is no separate
ecosystem-overview deliverable. Overview depth is owner-delegated to the implementer
within the constraints above; if the baked overview proves large enough to warrant its
own deliverable, surface to the Director rather than inflating WS-B (owner ruling).

## End Goal, Mechanism, and Means

- **End goal.** A connected general AI assistant, given an effort-orientation trigger,
  reliably runs Oak's explain orientation process for the *effort/ecosystem* —
  improving the first experience for the minority audience that wants it — while
  curriculum queries are left to the curriculum tools.
- **Mechanism.** The model-controlled tool is the only primitive that fires on a
  natural-language trigger (ADR-058/ADR-123 dual-exposure, identical shape to
  `get-curriculum-model`), scoped by description to effort triggers only; the resource
  serves the same effort body to resource-injecting clients at low salience; the prompt
  is the explicit opt-in entry point. One generated effort-orientation body keeps all
  three coherent with their SSOTs.
- **Means.** D1 generation step → D2 resource → D3 tool → D4 prompt → D5 value-proxy
  (sequenced by consumption, PDR-093). **D2/D3/D4 are parallel-safe by
  file-disjointness** — D2 edits `register-resources.ts`, D3 edits `handlers.ts`, D4
  edits `register-prompts.ts` — so completing one changes neither what the others do
  nor how they are verified; all three consume D1's single constant.

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
- **Not curriculum.** No curriculum content, no curriculum data, no routing to
  curriculum surfaces — the separation principle is the spine of this lane.
- Not baking the live progress report (`oak-ecosystem-progress-*`) — volatility/honesty
  firewall.
- Not restating the Headline Invariants (point to the README single source).
- Not WS-A's vitest config; not WS-C's CI work. Not guaranteed auto-follow
  (client-dependent; accepted).
- Not altering existing resources / tools (getting-started, curriculum-model, EEF).
- Not a new workspace (single capability; below the third-consumer threshold).

## Prerequisites

- **Blocking for authoring/build:** none. `pnpm install` in the worktree is done; the
  branch is rebased onto the threads base `6d80d119e`.
- **D1 first-hand confirmation (verify-data-supports-shape):** before building the
  transformer, confirm first-hand which `README.md` / `VISION.md` sections are the
  stable effort prose, and identify the live progress report family in
  `.agent/reports/` to exclude. The plan names them; D1.1 asserts the split.
- **Beneficial (folded after re-run):** assumptions-expert (effort-domain projection
  fidelity — materially affected, re-run required) and mcp-expert (SDK shapes —
  content-domain-invariant, re-confirm) — see §Readiness Reviewers.

## Workstreams (TDD cycles — one commit per cycle)

### D1 — Generated effort-orientation body (foundation; blocking)

Build an app-local generation step (mirroring `scripts/embed-widget-html.ts`:
app-local `scripts/`, anchored by `resolve(scriptDir, '..')`, committed
`src/generated/` output) that reads `.agent/skills/explain/SKILL-CANONICAL.md` (for
the behaviour shell) and `README.md` + `VISION.md` (for the stable effort-overview) at
build time, and writes a committed `src/generated/explain-content.ts` exporting the
**effort-orientation body** as a string constant plus a `lastModified` ISO-8601
datetime **derived from the newest source-file commit date** across the canonical,
`README.md`, and `VISION.md` (passed in; no global/build clock — a wall-clock or
build-time value would refresh on every regeneration even when sources did not change,
re-introducing the staleness it exists to prevent).

- **Cycle D1.1 (unit).** Test the transformation function. Given the canonical and the
  stable effort prose, the output:
  - **(a)** contains **none** of the filesystem / repo-path / `file://` / "read the
    file" lines;
  - **(b)** **retains** the discernment contract, the three delivery modes, the
    escalation ladder, the honesty invariants, and the access-aware fork (behaviour
    shell);
  - **(c)** **carries the stable effort-overview** (purpose / distinctive role /
    why-it-matters / the three streams / machinery at executive altitude) **and
    excludes** any restated Headline Invariants;
  - **(d)** **the curriculum DOMAIN firewall** (a domain negative, not merely a
    tool-name negative): the body describes the *effort* (how Oak builds and delivers,
    the machinery at executive altitude, how to engage) and does **not** *describe*
    curriculum structure or content — no subjects / units / lessons / key stages /
    sequencing, no description of the three data sources *as curriculum*, and no
    restating of the six README Architectural invariants *as curriculum-data claims*.
    Naming curriculum as the thing the effort **serves** is permitted (effort-domain);
    *describing* curriculum is forbidden. Absence of the curriculum-tool names
    (`get-curriculum-model`, EEF, `getting-started`) and of curriculum-guide prose is
    asserted as **one concrete instance** of this domain negative, not its whole;
  - **(e)** **the volatility firewall** (broader than the progress report): the body
    **excludes or genericises every point-in-time status / lifecycle claim wherever it
    appears, including in README** — the current alpha phase, "as of &lt;month&gt;"
    datelines, live tool counts, and deployment URLs (worked counter-examples:
    `README.md` line 27 "Current status: Invite-Only Alpha" + the
    `curriculum-mcp-alpha.oaknational.dev` URL; line 187 "37 curriculum tools (24
    generated … 13 aggregated)"). The live progress report (`oak-ecosystem-progress-*`)
    is the largest instance of this hazard, not its boundary;
  - **(f)** carries a `lastModified` derived from the **newest source-file commit date**
    across `SKILL-CANONICAL.md` + `README.md` + `VISION.md` (NOT the build / generation
    / wall-clock time — a build-time value refreshes on every regeneration even when the
    sources did not change, re-introducing the staleness it exists to prevent).

  Product code: the transformer. *Test-first; product code greens it.*
- **Cycle D1.2 (unit + generation).** Test the generation script writes
  `src/generated/explain-content.ts` exporting a non-empty `EXPLAIN_ORIENTATION_BODY`
  and is deterministic. Wire a `generate:explain-content` package script and a
  codegen-drift check (regenerate → `git diff --exit-code` on the generated file). The
  drift check is sufficient because **only stable sources are baked** (behaviour shell
  and stable README/VISION prose); the volatile progress report is excluded precisely
  so a drift check is a faithful staleness guard.

**Acceptance (D1):** transformer unit tests green per (a)–(e); generated file
committed; drift check passes. **Proof:** `unit` + the drift-check command.

### D2 — `docs://oak/explain.md` effort-overview resource (consumes D1)

Mirror `registerDocumentationResources` exactly — destructure `{ name, uri,
...metadata }` and pass `metadata` as the `config` arg; type the registrar as the
narrow `Pick<McpServer, 'registerResource'>` (per `register-resource-helpers.ts`).
Annotations are **nested** and **low-salience** (effort surface for a minority
audience): `annotations: { priority: <low, e.g. 0.2>, audience: ['assistant'],
lastModified }` where `lastModified` is the ISO-8601 **datetime** (per the installed
SDK's `z.ZodISODateTime` — a full datetime, not a bare date) from D1's source-commit
derivation;
`mimeType: 'text/markdown'`; custom `docs://oak/explain.md` URI. Read returns
`{ contents: [{ uri, mimeType, text: EXPLAIN_ORIENTATION_BODY }] }`.

- **Cycle D2.1 (integration).** Resource registered via `registerResource` with the
  nested low-salience annotations; read returns the effort body.
- **Cycle D2.2 (e2e).** Extend `documentation-resources.e2e.test.ts`: `resources/list`
  surfaces `docs://oak/explain.md` with low priority and `audience: ['assistant']`;
  `resources/read` returns the effort-orientation process (assert a stable
  discernment-contract phrase present; assert no `file://`; assert no curriculum-tool
  name appears — the firewall).

**Acceptance (D2):** resource in `resources/list` with correct nested low-salience
metadata; `resources/read` returns the effort body, curriculum-clean. **Proof:**
`integration` + `e2e`.

### D3 — `explain` / `orient` tool (consumes D1; the firing primitive)

**D3 is structurally heavier than D2/D4: it introduces the first app-local tool seam.**
The existing `registerTools` in `handlers.ts` iterates only
`listUniversalTools(generatedToolRegistry)` (SDK-generated tools); an app-local explain
tool is not in that registry, so D3 adds a **separate, additive
`server.registerTool(...)` call** for explain — it does not flow through the
universal-tools loop and must not be force-fitted into `generatedToolRegistry`.

The `tools/list` **description is the separation lever**: trigger-optimised for
effort-orientation and explicitly scoped away from curriculum, e.g. "Use when a user
asks to understand the Oak **project/effort/ecosystem** — this repository, how Oak
builds and delivers its curriculum, the project's purpose and machinery, or how to
engage/contribute. **Not** for curriculum content questions (subjects, units, lessons,
key stages) — those are served by the curriculum tools." (Express the curriculum
exclusion in **user-domain terms** — "subjects, units, lessons, key stages" — not
internal tool identifiers, per mcp-expert: it is the durable lever and keeps the
firewall's body-side rule intact.) The tool takes no arguments, so **`inputSchema` is
omitted** — the handler is therefore the **zero-arg `extra`-only `ToolCallback` form**
(no typed `args` first param). Pick a tool `name` that does **not collide** with any
existing universal tool name (the SDK throws on duplicate registration). The tool
**result** is the ADR-058 dual shape —
`content: [summary, jsonBody]` plus `structuredContent` — built by reusing the
canonical `formatToolResponse()` (`universal-tool-shared.ts`), and **declares NO
`outputSchema`** (the SDK runs strict `structuredContent` validation only when an
`outputSchema` is registered; a free-form body with an `outputSchema` would fail at
`tools/call`; every existing agent-support tool omits it — mirror that).

- **Cycle D3.1 (integration).** `server.registerTool` called for the explain tool with
  the effort-scoped, curriculum-excluding description; the handler returns the
  dual-shape result containing the effort body; assert the explain tool **coexists**
  with the generated-registry tools in `tools/list` without disturbing them.
- **Cycle D3.2 (e2e).** `tools/list` surfaces the tool with the effort-scoped
  description; `tools/call` returns the dual-shape effort-orientation process.

**Acceptance (D3):** tool in `tools/list` with an effort-scoped, curriculum-excluding
description, coexisting with generated tools; `tools/call` returns the dual-shape
effort process; no `outputSchema` declared. **Proof:** `integration` + `e2e`.

### D4 — Explain prompt entry point (consumes D1; opt-in)

Register a user-invoked, opt-in prompt (`explain` / `orient`) that joins the app's
local `PROMPT_REGISTRATIONS` array and its derived `RegisteredPromptName` type (per
`register-prompts.ts`); `argsSchema` is **omitted** (no args; no `prompt-schemas.ts`
entry needed) — the handler is therefore the **zero-arg `extra`-only `PromptCallback`
form** (no typed `args` first param, mcp-expert). `prompts/get` returns `{ messages: [{ role: 'user', content: { type:
'text', text: EXPLAIN_ORIENTATION_BODY } }] }` — note `content` is a **single object**,
not an array.

- **Cycle D4.1 (integration).** Prompt registered (`registerPrompt`); `prompts/get`
  returns the single-object-content message carrying the effort-orientation process.
- **Cycle D4.2 (e2e).** `prompts/list` surfaces it; `prompts/get` returns the entry.

**Acceptance (D4):** prompt in `prompts/list`; `prompts/get` returns the
effort-orientation entry in the correct message shape. **Proof:** `integration` + `e2e`.

### D5 — Value proxy (consumes D2–D4)

Demonstrate the brief's value **and the separation**. Drive the server via MCPJam (the
repo's MCP test harness) with an effort-orientation request, or a live
connected-assistant trial if available. The observable must be sharp on both halves:

1. **Value:** the transcript shows an effort-orientation trigger ("tell me about this
   project / how Oak delivers its curriculum") **fires the explain tool** and returns
   the effort orientation.
2. **Separation:** a **curriculum** query ("find me KS3 photosynthesis lessons" /
   "what's in the curriculum model") does **not** engage explain — it routes to the
   curriculum tools, and explain's body contains no curriculum data.

Both prongs are **existence-demonstrations, not guarantees** — symmetric honesty. The
spec gives no static mechanism to force tool selection (mcp-expert), so the same
non-forceability that makes the positive prong "followable, not guaranteed" also makes
the negative prong (explain not engaging on a curriculum query) an observed instance,
not a proof of the negative. D5 demonstrates correct behaviour on concrete cases; the
description quality is the only lever, and the body-side curriculum firewall (D1.1(d))
is the structural backstop that holds even if a client mis-fires the tool.

**Acceptance (D5):** documented value-proxy showing (1) effort trigger → explain tool →
effort orientation, and (2) curriculum query → not explain. **Proof:** `value-proxy`
(MCPJam transcript or live-assistant note), recorded in evidence.

## Quality Gates

Per [`components/quality-gates.md`](../../templates/components/quality-gates.md): each
cycle runs its named unit/integration/e2e test plus the relevant local gates
(`pnpm --filter @oaknational/oak-curriculum-mcp-streamable-http type-check | lint |
test`); phase and final validation use the canonical aggregate (`pnpm check`). Turbo
flag discipline (per Juno's WS-A note): turbo's own flags go on `pnpm exec turbo run
test --continue …` (no `--`); `pnpm test -- <args>` forwards to vitest. Host-health is
snapshotted before timing-sensitive runs (contention observed in-pilot: load 33–81/14,
swap 6.9–10G); durations are reported with load/swap and not trusted under contention.

## Proof Contract

| Acceptance id | Proof level | Command / observation |
|---|---|---|
| ws-b-d1 | unit | transformer unit test (assertions a–e: no fs-coupling; behaviour-shell retained; stable effort-overview in, progress-report out; curriculum firewall; lastModified); `pnpm generate:explain-content` then `git diff --exit-code` on the generated file |
| ws-b-d2 | integration + e2e | resource integration test (low-salience nested metadata); `documentation-resources.e2e` extension asserting curriculum-clean body |
| ws-b-d3 | integration + e2e | tool registration + coexistence integration test; `tools/list` (effort-scoped description) + `tools/call` e2e |
| ws-b-d4 | integration + e2e | prompt registration integration test; `prompts/list` + `prompts/get` e2e |
| ws-b-d5 | value-proxy | MCPJam transcript or connected-assistant note: effort trigger → explain tool → effort orientation; curriculum query → not explain |

No `complete` / `READY`-met verdict for WS-B until every id is proven. TDD evidence is
test-first per cycle; retrospective coverage is not counted as TDD evidence.

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Body leaks into the curriculum domain (curriculum data, curriculum-guide prose, or a curriculum-surface route) — separation breach | Med | High | D1.1 assertion (d) is the curriculum firewall; D2.2/D3.2 e2e assert no curriculum-tool name in the body; D5 proves a curriculum query does not engage explain |
| Transformer over-strips (loses discernment) or under-strips (leaves fs-coupling) | Med | High | D1.1 asserts (a)–(b): no fs-coupling; discernment + modes + escalation + honesty + access-aware fork retained |
| Volatility leak — a point-in-time status claim baked (the live progress report, OR README's "Invite-Only Alpha" / live tool counts / deployment URL / "as of <month>" datelines), presenting frozen content as current | Med | High | D1.1 assertion (e) excludes/genericises every point-in-time status claim wherever it lives, not only the progress report; `lastModified` derived from source-commit date (D1.1(f)), never build-time |
| D3 mis-declares an `outputSchema` and fails `tools/call` validation | Med | High | Plan + D3.1 pin "no outputSchema; structuredContent only", mirroring agent-support tools; reuse `formatToolResponse()` |
| Resource surfaces too prominently to teacher-facing clients | Low | Med | Low `priority` annotation + `audience: ['assistant']`; D2.2 asserts the low-salience metadata |
| Canonical/README/VISION drift, generated body goes stale | Low | Med | Codegen-drift check (regenerate → `git diff --exit-code`) in D1.2; stable-only sources keep the check faithful |
| Client does not fire the tool (not forceable) | High | Low (accepted) | Owner-accepted via C; lever is description quality; D5 proves "followable", not "guaranteed" |

## Foundation Alignment

- **`principles.md`** — Second Question: reuse existing MCP primitives, no new
  mechanism; strict validation only at the MCP boundary; the separation principle is a
  domain-boundary discipline (right problem at the right layer).
- **`testing-strategy.md`** — TDD cycle-pairs; tests describe MCP-observable behaviour
  (`resources/list`, `tools/call`, `prompts/get`), never file presence; no global state
  / no `process.env` in tests.
- **`schema-first-execution.md`** — generation-time extraction (ADR-031) is the
  sanctioned build-time-content pattern; the effort body is static content built at
  compile time, not API data, so the Cardinal Rule's schema-flow does not apply
  (documentation content, like `getting-started`).
- **PDR-112 / ADR-202** — generated *behaviour + stable-content* projection,
  single-sourced from the canonical and README/VISION, not duplicated.
- **ADR-058 / ADR-123** — dual-exposure and the tool-reliability ranking (tool output >
  structuredContent > description > server instructions).
- **Owner separation principle (2026-06-24)** — curriculum and effort content stay
  absolutely separate; this lane builds the effort surface only.

## Plan-Body First-Principles Check

Per [`plan-body-first-principles-check.md`](../../../rules/plan-body-first-principles-check.md):

- **Shape clause** fires at D1 before building the transformer — confirm the body is
  behaviour-shell + stable effort-overview, with the curriculum firewall and the
  progress-report exclusion both held, before generating.
- **Vendor-literal clause** fires at D2–D4 before writing registration — re-confirm the
  SDK shapes against the installed `@modelcontextprotocol/sdk` types at the point of
  code (nested annotations, no-`outputSchema`, single-object prompt content, narrow
  registrar types), not from memory; the mcp-expert re-run (below) refreshes these.
- **Landing-path clause** fires before each commit — one cycle = one commit, with test
  and product code together, every commit ending green.

## Readiness Reviewers (RE-RUN COMPLETE — verdicts folded, no backfill)

The prior verdicts were folded against the superseded curriculum-routing shape; the
effort-domain correction was materially different, so both reviewers were re-run on the
corrected plan (2026-06-24, Sturgeon dispatch). Verdicts folded:

- **assumptions-expert (effort-domain projection fidelity)** — **READY-WITH-CHANGES**;
  3 Critical + 2 Important edits folded:
  - (Critical) volatility firewall widened beyond the progress report to **every**
    point-in-time status claim, incl. README's "Invite-Only Alpha" / live tool counts /
    deployment URL — folded into D1.1(e), the §Faithful-Projection volatility bullet,
    and the Risk row.
  - (Critical) curriculum firewall reframed from a **tool-name negative to a domain
    negative** (describe the effort, never *describe* curriculum; naming curriculum as
    what the effort serves is permitted) — folded into D1.1(d).
  - (Critical) `lastModified` pinned to the **newest source-file commit date**, never
    build/wall-clock — folded into D1 intro, D1.1(f), D2.
  - (Important) the **resolving principle** (Router Principle binds the in-repo lens
    with a filesystem; the remote surface has none, so baking stable hazard-free prose
    is the faithful realisation) stated once, load-bearing, in §Faithful Projection.
  - (Important) D5 separation prong framed as an **existence-demonstration, not a
    guarantee** (non-forceability is symmetric).
- **mcp-expert (SDK shapes, installed `@modelcontextprotocol/sdk@1.29.0`)** —
  **CORRECT**; all five shapes hold; 4 non-blocking precisions folded: zero-arg
  `extra`-only handlers for the tool and prompt (D3, D4); `lastModified` is a full
  ISO-8601 **datetime** not a bare date (D2); pick a **non-colliding** tool name (D3);
  express the curriculum exclusion in **user-domain terms** and validate the boundary
  **empirically** via D5 (D3, D5). `audience: ['assistant']`, low `priority` (0.2),
  custom `docs://` scheme, no `outputSchema`, single-object prompt content all
  confirmed spec-valid against the installed types.

Both verdicts folded; plan re-marked READY FOR EXECUTION. D1 may begin.

## Learning Loop

On WS-B completion / reintegration, run the consolidation workflow: fold the
worktree-pilot and Director-model evidence into `worktree-pilot-coordination.plan.md`'s
research-capture log and the `worktree-per-agent-transition` future plan; mine the
**generation-time-behaviour-projection-under-a-domain-firewall** pattern (bake the
behaviour shell + the stable in-domain content; firewall the out-of-domain and the
volatile) into the appropriate permanent home if it recurs.

## Deferred Pre-Ship Requirements (owner-directed 2026-06-24)

Owner direction (2026-06-24): the explain skill gains new expert audiences whose
needs MUST be worked into the skill before this group of work (the worktree pilot)
ships. **Record now; do NOT build now.** All effort/governance-domain — consistent
with the reshaped effort-domain surface and the separation principle.

New audiences and their needs:

1. **Education experts** — the intended impact of the effort and the sources being
   used.
2. **Product experts** — intended impacts, the non-engineering requirements, and the
   compliance features / checks / assurances being planned.
3. **Leadership, Compliance, Education, and Product experts (cross-functional)** —
   what sources are surfaced in the MCP and semantic-search apps, when each was
   adopted, the criteria for reviewing suitability, when each was last reviewed, and
   the criteria for removal.

Design notes (for the pre-ship build, not now):

- **Data-source provenance vs the curriculum firewall.** Audience 3 needs explain to
  NAME the data sources as provenance/governance (effort-domain). The D1.1 curriculum
  firewall currently bans curriculum-surface references outright; it needs the
  refinement already implied by the domain-negative: **naming a source as
  provenance/governance is allowed; describing curriculum content/structure is not.**
  This interacts with the D1 behaviour-shell shape decision (open with the Director).
- **`DATA-SOURCES.md` candidate (owner-floated).** No such file exists today; ADR-157
  (multi-source open-education integration) and ADR-152 (provenance) are related but
  there is no consolidated governance/lifecycle surface with the since / review-criteria
  / last-reviewed / removal-criteria shape audience 3 wants. A repo-root `DATA-SOURCES.md`
  (or `docs/governance/`) is the leading home; explain would POINT to it rather than
  bake volatile review dates (volatility firewall). Placement is cross-cutting — owner
  and Director call.
- **Where it lands.** The audience-angles and content belong in the explain
  `SKILL-CANONICAL` (shared Practice artefact — a coordination-branch edit, not this
  feature branch) and in this WS-B MCP projection. The shared-skill edit, the
  `DATA-SOURCES.md` decision, and the group ship-gate are routed to the Director.

**Ship-gate:** WS-B (and the group) does not ship until these audiences are served by
the explain skill, or the owner explicitly descopes them.

## Lifecycle Triggers

Per [`components/lifecycle-triggers.md`](../../templates/components/lifecycle-triggers.md):
session entry done (start-right-team); claim registered (`a4c9785c`, app-local
effort-domain); this plan is the work-shape artefact; handoff/closeout per the
worktree-pilot Closeout Contract; consolidation at completion (above).

## Reintegration

`pilot/ws-b-explain-resource` is rebased onto `coordination/worktree-pilot`
@ `6d80d119e` (threads base). After WS-B cycles land, merge
`pilot/ws-b-explain-resource` → `coordination/worktree-pilot`; Director reviews the
WS-B verdict; owner reviews the coordination branch → `main` via code-owner review
(never `--admin`).
