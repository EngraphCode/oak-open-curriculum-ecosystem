---
handoff_kind: design-pull-forward + rotation
claim_id: 15a76136-ce64-4718-9c18-8f2d58ff0ac8
thread: eef
author:
  agent_name: Iridescent Glowing Sun
  platform: claude
  model: Opus 4.8
  session_id_prefix: 53b04f
  id: 86853f44-f760-5c51-ac2d-a9b886136af2
created: 2026-06-10
lane: G4 keywords — Gate-1 verdict (delivered+accepted) → owner-reshaped design pull-forward
status: design authored; BUILD GATED on G2; ready for successor
reads_before_edit: this record end-to-end; then graph-tools-value-redesign.plan.md §g4 + Emission ownership
---

# Handoff — G4 keywords reshape (Gate-1 + design pull-forward)

> Successor: read this end-to-end before any source edit. The **build is gated on G2**
> (the `keyword` node + `lesson→keyword` edge depend on G2's `lesson` node per the plan's
> Emission ownership table). Nothing executes until G1b → G2 land. This record carries the
> owner-ratified Gate-1 verdict and a **ready-to-fold plan section** for the canonical
> `graph-tools-value-redesign.plan.md` g4 todo (the Director folds + commits it; I authored
> no shared-plan edit, to stay collision-free as a rotating implementer).

## 1. Current edit state

- **No product source edited.** This lane was read-only analysis → an owner-reshaped design.
- **Analysis claim** `fb9eb588` CLOSED (verdict delivered + accepted/recorded by Director Veiled).
- **Design claim** `15a76136` OPEN (this record's claim). Disposition at retirement: see §6.
- All measurements were taken first-hand against the live `/keywords` API (curl, `Authorization: Bearer $OAK_API_KEY`, base `https://open-api.thenational.academy/api/v0`) and the 2026-05-21 bulk snapshot (`apps/oak-search-cli/bulk-downloads`, jq).

## 2. Gate-1 verdict (owner-ratified) — what is settled

**Owner direction (2026-06-10, supreme):** do NOT make this a one-tool bulk-vs-API-pull choice.
**Two tools, two value props:**

1. **Preserve the live-API tool** (the existing generated `get-keywords`), **namespaced** to signal it is the API/live full-set tool (owner's illustrative name: `keywords_api`). People still want the complete, fresh live set.
2. **Add a NEW bulk-derived keyword *graph* tool** — bounded, frequency-ranked, richly decorated with bulk data + graph connections.

**Field test (against bulk) — PASS, decisively.** Bulk `lessonKeyword` = `{ keyword, description }.strict()`, schema-annotated *"identical to API"* (`oak-sdk-codegen/.../bulk/bulk-schemas.ts:47`); `lessonKeywords` is a required array on every lesson; per-lesson association via `lesson.lessonSlug`. The existing extractor (`oak-sdk-codegen/src/bulk/extractors/keyword-extractor.ts`) already yields `{ term, definition, frequency, subjects[], firstYear, lessonSlugs[] }`. The live `/keywords` response is `{ keyword, description, keyStageSlug, subjectSlug, lessonSlugs }`, **sorted alphabetically, no frequency field** (U1's documented-"frequency order" gap confirmed first-hand). So bulk ⊇ live on fields, and bulk uniquely supplies **frequency ranking** — the value the live API *promises but does not deliver*.

**Coverage test — NOT uniform (the key finding).** Measured live vs bulk distinct keywords (normalised lc+trim) per anchor:

- PRIMARY exact (0 delta, 100% set overlap): art/ks1 198=198 (79/79 lessons); maths/ks2 405=405 (712); computing/ks2 258=258 (144).
- KS3 near-parity (live +0..+22): science 797/790, maths 328/306, english 1282=1282, french 240=240.
- **KS4 material divergence:** english live **2090** / bulk 1511 (+38%); history 740/565 (+31%); geography 509/475; **science live 0 / bulk 1123 (inverted — live serves NO science-ks4 keywords; appears mid-restructure live)**; maths/french ks4 ≈ exact.
- **Interpretation:** the 2026-05-21 bulk is materially behind LIVE at secondary/ks4 — a snapshot-vs-live freshness gap (DISTINCT from the already-dissolved corpus≡bulk fidelity fork; do not conflate).

**Owner accepted the tradeoff explicitly:** at KS4 `keywords_api` carries more base content (live/fresher); the bulk `keywords_graph` trades raw completeness for **rich metadata + connections** — snapshot semantics accepted for the graph tool.

## 3. Architecture finding that shapes the build (verified first-hand)

The repo splits MCP tools into **generated tools** (`ToolName`, OpenAPI-generated live-API pass-throughs; the MCP name derives from **path + method** via `oak-sdk-codegen/code-generation/typegen/mcp-tools/name-generator.ts` — `/keywords` + GET → `get-keywords`, with only two hardcoded special cases and **no override hook**) and **aggregated tools** (`AggregatedToolName`, hand-written, in `oak-curriculum-sdk/src/mcp/universal-tools/`; the graph tools live here). `AllToolName = ToolName | AggregatedToolName`.

Consequences for G4 (review-corrected 2026-06-10 — assumptions + mcp lenses both grounded this first-hand):

- The **new keyword_graph tool is an AGGREGATED tool** → name is freely chosen (no codegen constraint); it joins the graph-tool family beside misconception/prior-knowledge/thread tools.
- The **existing `get-keywords` is a GENERATED tool** → its name derives from path+method; the generated file is `DO NOT EDIT`. The asymmetry that decides the rename mechanism: a per-tool-name **DESCRIPTION**-injection hook ALREADY EXISTS (`getToolDescriptionEnhancement(toolName)` in `tool-description.ts`, the `GET_RATE_LIMIT_NOTE` / `ASSET_DOWNLOAD_NOTE` pattern), but a **NAME**-override hook does NOT. So **description-led disambiguation (keep `get-keywords`, enhance its description) is the low-cost, already-wired path**; an actual served-name rename is NEW codegen work (a path/operationId→display-name map threaded through `generateMcpToolName` + the definitions/registry/runtime emitters). See §5.2.

## 4. READY-TO-FOLD PLAN SECTION (Director: fold into graph-tools-value-redesign.plan.md g4 todo)

Replace the `g4-bounded-keywords-tool` todo's framing with the reshaped two-tool shape. The Gate-1 decision rule is now RESOLVED by owner direction (bulk branch for the new tool; the API tool is preserved separately) — the gate no longer "picks one source."

**G4 (reshaped 2026-06-10, owner-directed) — two deliverables:**

**G4a — preserve + namespace + DESCRIPTION-FIX the live-API keyword tool.** Keep the generated `get-keywords` (live `/keywords` pass-through; full set; fresh; the authority at KS4). Two pieces of G4a work:

1. **Correct the false ordering claim (MCP-correctness — REQUIRED, surfaced by review).** `get-keywords`' current OpenAPI-sourced description claims *"returned in order of frequency, with the most common keywords appearing first"* — which U1 proved FALSE (the live API sorts alphabetically, no frequency field). If left as-is, BOTH tools would claim frequency ordering and the two-tool disambiguation contract collapses (the description is the model's only tool-selection signal). Correct/remove the false claim via the existing `getToolDescriptionEnhancement` hook (or, cleaner long-term, the U1 upstream OpenAPI fix). Add a G4a acceptance check: the served `get-keywords` description does not promise an ordering the API does not deliver.
2. **Namespace/disambiguate.** Add the disambiguation note to `get-keywords`' description via the same `getToolDescriptionEnhancement` hook (low-cost, ALREADY WIRED). An actual served-name rename to signal API/live (owner's illustrative `keywords_api`) is OPTIONAL and is NEW codegen work — see §5.2; lead with the description path, escalate to a rename only on owner insistence. Naming/mechanism: owner sign-off at PR (S2 fixed vocabulary; note the repo convention is kebab-case — `get-keywords` + `get-keyword-graph`, not underscores). Independent of G2 (the description work can land early).

**G4b — new bulk-derived keyword GRAPH tool (aggregated; gated on G2).** A `keyword` node kind + `lesson→keyword` edge emitted into the one-graph `graph-corpus` dataset at vocab-gen (Emission ownership: G4 emits these; depends on G2's `lesson` node). Reuse/adapt the extractor at **`oak-sdk-codegen/vocab-gen/extractors/keyword-extractor.ts`** — the LIVE vocab-gen pipeline path (called from `vocab-gen/vocab-gen-core.ts`). It already computes `{ term, definition, frequency, subjects[], firstYear, lessonSlugs[] }`. **Do NOT build against `src/bulk/extractors/keyword-extractor.ts`** — it is a byte-identical DUPLICATE (corrections-ledger #16: "a verified smell the G-units must resolve, not entrench"); resolving that duplication (consolidate to one canonical import) is a named step of G4b-c1, not deferred. View placement: `src/curriculum/` (the curriculum graph dir G1b created) — already tsup-globbed + exported (`./curriculum`) by G1b `a79b2271`, so NO new build-config change is needed provided G1b is merged (the G2 gate guarantees it).

- **Node identity:** kind-qualified `id = keyword:<normalised-term>` (lc+trim, the extractor's normalisation), materialised `id` field per the identity model. Keep a display term (first-occurrence original casing) as a property; lessonSlug stays the lesson content key.
- **Decoration via EDGES, not fat nodes (the "rich connections" value):** the keyword node stays lean (term, description, frequency, firstYear, subjects); richness comes from traversing `keyword → lesson → {unit, thread, misconception, prerequisite-units, keyLearningPoints, pupilLessonOutcome}` on the one-graph substrate. This is why G4b composes with G1/G2/G3 and why it is a graph, not a list. **Frequency ranking** (lessonSlugs.size) is a first-class node property — delivering the value the live API only promises.
- **View:** per-view `createGraphView` over the corpus (the landed EEF pattern), selecting `keyword` nodes + `lesson→keyword` edges, with bounded traversal for decoration depth.
- **Tool surface:** anchor `subject`+`keyStage` (primary), narrowable by `unit`/`lesson`; frequency-ranked; bounded (top-N / limit for token economy); well-formed empty result; `structuredContent` + serialized TextContent (no MCP outputSchema — owned by the output-schemas plan). Carries snapshot semantics in its description (owner-accepted).
- **Disambiguation contract (both tools):** descriptions state when to prefer each — `keywords_api` = live full set, authoritative/fresh, coarse anchors; `keyword_graph` = bounded, frequency-ranked, richly-connected subset for token economy + relationship navigation. Verify e2e via `tools/list`.

**Cycles (TDD; G4b gated on G2):**

- G4b-c1: generator/emission test describes the `keyword` node shape (materialised id, term/description/frequency) + `lesson→keyword` edges + integrity (corpus constructs in `createGraphView`, no dangling endpoints) + a **normalisation stability contract test** for `normaliseKeyword` (currently `lc+trim` — deliberately simple, matches the 2026-05-21 snapshot's authoring; the test bounds the contract, analogous to G2's misconception mint-rule stability test; do NOT over-build a unicode layer the corpus may not warrant) → vocab-gen keyword emission into graph-corpus + **resolve the `src/bulk/` extractor duplicate** in the same cycle.
- G4b-c2: view test describes anchored bounded frequency-ranked retrieval + decoration via lesson edges + well-formed empty → keyword view in graph-corpus-sdk.
- G4b-c3: tool test describes the aggregated tool's anchored `structuredContent` envelope (frequency-ranked keywords + lesson associations + decoration) + the two-tool description disambiguation (e2e `tools/list`) → tool add; signal eef-revalidation if the EEF path consumes it. **Build the envelope with the shared `formatToolResponse` helper** (`oak-curriculum-sdk/.../universal-tools/universal-tool-shared.ts`) — the canonical 2-item content array (summary + serialized JSON TextContent) + `structuredContent`, no outputSchema; keeps the aggregated family consistent. **Aggregated-tool registration is a 4-surface atomic change** (compile-time guards make omission a type error, but name them upfront): (1) the new `aggregated-keyword-graph.ts` module, (2) the `AggregatedToolName` union in `universal-tools/types.ts` (explicit, not derived), (3) the `AGGREGATED_TOOL_DEFS` map in `definitions.ts` (`satisfies Record<AggregatedToolName,…>`), (4) the `AGGREGATED_HANDLERS` record in `executor.ts` (`Readonly<Record<AggregatedToolName,…>>`). No `listChanged` plumbing needed — the stateless per-request transport (ADR-112) re-discovers `tools/list` per connection (plan §Protocol notes).
- G4a (independent): cycle for the rename/namespace (mechanism per §5) + description disambiguation; owner sign-off on the name at PR.

**Acceptance:** bounded frequency-ranked retrieval from bulk; keyword→lesson→{unit/thread/misconception} navigable; `keywords_api` preserved + namespaced + disambiguated; both descriptions state when to prefer each; e2e `tools/list` shows both; full gate chain green. Readiness reviewers (assumptions + architecture + mcp + type) run before G4b is marked execution-ready (gated, so deferred to execution per the design-gate discipline).

## 5. Decisions deferred / open questions (for owner/Director + successor)

1. **Tool names (owner sign-off at PR, S2 vocabulary):** `keywords_api` is illustrative; the new aggregated tool needs a distinct name (candidates: `get-keyword-graph` / `explore-keywords` / `get-keywords-graph`). Owner decides.
2. **Rename mechanism for the GENERATED tool (RESOLVED by review — was open):** verified first-hand (assumptions + mcp lenses) — `name-generator.ts` derives the name from path+method with NO override hook, and the generated file is `DO NOT EDIT`; but a per-tool-name DESCRIPTION-injection hook (`getToolDescriptionEnhancement`) DOES exist. **Recommendation (changed from the original): lead with description-led disambiguation** (keep `get-keywords`, enhance its description via the existing hook — low-cost, already-wired, and it carries the required false-frequency-claim correction, see G4a). An actual served-name rename to `keywords_api` is OPTIONAL and is NEW codegen work (a path/operationId→display-name map threaded through `generateMcpToolName` + the definitions/registry/runtime emitters) — pursue ONLY on explicit owner insistence; the new aggregated tool's own freely-chosen name already supplies the namespacing the disambiguation needs.
3. **Decoration depth / scope** ("as richly as we like" — design agency, settle at G4b execution): which edges/fields to surface by default vs on-demand (keyLearningPoints, misconceptions, thread placement). Keep node lean; decorate via traversal.
4. **Bulk freshness (cross-cutting, Director/owner call):** the same 2026-05-21 snapshot underlies ALL G-units. Owner ACCEPTED snapshot semantics for keywords_graph; the broader question (refresh bulk before the graph estate builds, given english-ks4 +38% / science-ks4 inverted live) is still Veiled's to weigh for prior-knowledge/misconception/thread.

## 6. Next steps + claim disposition

- **Successor: Umbral Prowling Lantern (owner-named 2026-06-10).** When G1b → G2 land, pick up G4b (build per §4 cycles); G4a (description-fix + disambiguation) can proceed independently now via `getToolDescriptionEnhancement` (§5.2 mechanism resolved). Re-verify the pinned data facts at execution start (bulk manifest date; the divergence numbers above; the emission table). Read this record + §8 review findings end-to-end before any source edit.
- **Director (Veiled):** fold §4 (review-folded) into the canonical plan's g4 todo + commit as continuity; decide §5.4 (bulk refresh for the other G-units).
- **Claim `15a76136`:** CLOSED at natural boundary (design authored + adversarially reviewed = complete; the G4 build is gated on G2, so there is no in-progress source to hold). Per the opener's successor-handoff mechanism, **Umbral reaches this record via the closeout broadcast naming it + Veiled's routing + the thread record** — natural-boundary closeouts leave no claim carrying `handoff_record_path`. When Umbral picks up G4 (G4a now via the description hook; G4b after G2), open a FRESH G4 claim.

## 7. Pointers

- Gate-1 verdict comms event → Veiled: `d258db78` (accepted: Veiled's directed event ~15:30Z).
- Owner reroute notify → Veiled: `a92bf80f`.
- Live-API characterisation: `curl "$BASE/keywords?subject=<s>&keyStage=<ks>"`; bulk: `jq '.lessons[]|select(.keyStageSlug=="<ks>")|.lessonKeywords[].keyword'` over `<subject>-<phase>.json`.
- Plan: `.agent/plans/connecting-oak-resources/knowledge-graph-integration/current/graph-tools-value-redesign.plan.md` (g4 todo + Emission ownership table + §Keywords).
- U1 request doc (live `/keywords` source-grounding): `.agent/plans/upstream-feature-requests/oak-open-api/keywords-finer-grained-control.md` (on the merged U1 branch).

## 8. Adversarial review — verdicts + folded findings (2026-06-10, workflow wf_960b361b-e45)

Panel: architecture-expert-betty / assumptions-expert / mcp-expert, each grounded first-hand against the repo. Verdicts: **architecture = concerns** (no blocker), **assumptions = sound**, **mcp = sound**. All genuine findings folded inline above (each independently re-verified before folding — `validate-specialist-findings-before-acting`):

- **[major, mcp+assumptions] §3/§5.2 mechanism corrected:** generated name = path+method (NOT operationId); description-injection hook EXISTS, name-override hook does NOT → lead with description-led disambiguation. *(Folded §3, §5.2.)*
- **[major, mcp] G4a must fix the false frequency-order claim** in `get-keywords`' description, or both tools claim frequency and disambiguation collapses. *(Folded §4 G4a as a REQUIRED acceptance check.)*
- **[major, architecture] tsup-glob/exports precondition:** real about current `main`, but ALREADY satisfied by G1b (`a79b2271` adds `src/curriculum/**` glob + `./curriculum` export). G4b view lives in `src/curriculum/` → no new build-config change needed. *(Folded §4 G4b; verified first-hand — not an in-flight gap to escalate.)*
- **[minor, architecture+assumptions] extractor citation corrected** to the live `vocab-gen/extractors/` path + duplicate-resolution as a named G4b-c1 step. *(Folded §4 G4b, G4b-c1.)*
- **[minor, architecture] aggregated-tool 4-surface registration** named for G4b-c3; **[minor, mcp] reuse `formatToolResponse`**; **[minor, mcp] `listChanged` not needed** (stateless transport). *(Folded G4b-c3.)*
- **[minor, architecture] keyword normalisation stability contract test** added to G4b-c1; **[minor, mcp] kebab-case naming convention** noted (underscores are placeholders). *(Folded G4b-c1, §4 G4a, §5.1.)*
- **[minor, assumptions] live-side divergence numbers** (science-ks4=0 etc.) rest on a single read I cannot re-run in a read-only review → already covered by §6 "re-verify at execution start"; design is robust if the number has moved (frequency + connections remain bulk-unique). *(No change.)*

Bulk-side anchors were independently reproduced by the assumptions lens to the digit (science-ks4=1123, english-ks4=1511, art-ks1=198) and the snapshot manifest date confirmed (2026-05-21T13:45:16.086Z).
