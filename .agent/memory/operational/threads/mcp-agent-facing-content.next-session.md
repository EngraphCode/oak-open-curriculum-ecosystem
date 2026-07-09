---
fitness_line_target: 200
fitness_line_limit: 400
fitness_char_limit: 24000
fitness_line_length: 100
fitness_content_role: reference
overflow_disposition: 'leave-if-live; else conserve-insight-and-delete — never archive/split/rotate/shard'
merge_class: index-narrative-tables
---

# mcp-agent-facing-content Next Session

## Thread Identity

Thread: `mcp-agent-facing-content`
Goal: make ALL repo-controlled content that reaches an MCP consumer (the effective prompt agents
receive from the Oak Curriculum MCP server) **discoverable, auditable, and routed to the right
expert reviewer** — then (future, owner-gated) design SSOT content workspace(s) that own it. Curriculum
DATA bytes from the Oak API / bulk export are EXEMPT; repo-authored framing/templates/guidance are in
scope. Distinct from `data-sources-governance` (which registers the DATA sources + ADR-157 licensing);
this thread is about the *authored framing/instructions/descriptions* Oak controls.

## Participating Agent Identities

| platform | model | session_id_prefix | agent_name | role | first_session | last_session |
| --- | --- | --- | --- | --- | --- | --- |
| claude | claude-fable-5 (switched from claude-opus-4-8[1m] mid-session 2026-07-09; continuous seat per PDR-027) | 2bd86d | Beacon hunts Brilliance | analyst + implementer | 2026-07-09 | 2026-07-09 |

## Landing Target For Next Session

The visibility deliverable LANDED (PR #337). Next session is **owner-directed**: either (a) shepherd
PR #337 to merge, or (b) — only on owner go — the content-workspace design, or (c) the eval-methodology
research. Nothing here auto-starts.

## Current State — LANDED (2026-07-09)

**PR #337 OPEN** (branch `docs/mcp-agent-facing-content-registry`, commits `6078d73d3` → `dc453c455`
→ `59fb8e780`, fully synced). A **visibility-only** deliverable — no product code changed, no
validator, no evals built. Under `.agent/reports/mcp-agent-facing-content-audit/`:

- `registry.json` — machine-readable **SSOT snapshot** of the corpus: **716 items across 143 files**,
  each tagged `impact_tier` (658 high-impact / 58 simple-config), `review_domain`, `source_locus`,
  `extraction_kind`, risk `flags`, provenance, snippet. This is the durable source; the views regenerate
  from it. (The raw two-pass audit outputs were ephemeral scratchpad files — GONE; registry.json is the snapshot.)
- `registry.md` — human index grouped by review domain, with reviewer pointers.
- `report.md` — the analysis, scope boundary, i18n reframe, findings, gaps, and the owner-decided direction (§7).
- `rendered-wholes.md` — surfaces **assembled as an agent receives them** (server instructions, all 42 tools,
  the 7 prompts, resources), rendered from the BUILT SDK (`generators/render-wholes.mjs` re-runs it).
- `content-registry.html` — self-contained WCAG 2.2 AA filterable browser. Published as a claude.ai artifact
  (private): <https://claude.ai/code/artifact/3485e961-d11c-41ef-963b-3cb2e7664459> (owner shares when ready).
- `generators/` — the deterministic scripts (registry.json is built by `build-registry.mjs` from the now-gone
  audit outputs; md/html/wholes regenerate from registry.json / the SDK).

**Owner decisions (report §7, authoritative):** (1) review WILL happen; (2) variety of reviews by
intent+audience, not one; (3) controlled content moves into SEPARATE content workspace(s) to lower
cognitive load; (4) stratify by `impact_tier`, REQUIRE review + eval protocols for high-impact, simple
config (branding/UI) exempt from protocols; (5) upstream in-house content is HIGHLIGHTED not wrapped
(monorepo consolidation eventually, not now); (6) the workspace(s) are **SSOT not copies** (consumers read
from them — which is why they cannot hold upstream content); (7) design **l10n-ready** (no translation now,
no rebuild later). **Eval protocols must follow strict researched best practice from authoritative sources.**
Lifecycle order that reconciles evals with the "no validator yet" ruling: review-protocol (ratify shape)
→ eval-protocol (measure behaviour) → drift-guard last.

**Source-locus provenance (where reviewers go; distinct from the exemption boundary — upstream ≠ exempt):**
`this-repo` (589); `upstream-in-house-api` (116 tool/param base prose from the **Oak Open Curriculum API (OCA)**
OpenAPI spec in `oaknational/oak-api`, local snapshot `packages/sdks/oak-sdk-codegen/schema-cache/api-schema-original.json`;
the "bulk download" is the SAME OCA data/repo presented differently, NOT a separate source; owner-floated future
rename not adopted: "Open Resource Curriculum API" → Orca); `upstream-in-house-skills`
(2 prompts — `lesson-planning`←oak-lesson-builder, `curriculum-mapping`←oak-curriculum-mapper, in
`oaknational/oak-skills`); `external-third-party` (9 — verbatim EEF corpus items only, exempt;
the EEF file's Oak-authored framing is classified by item provenance and routes to pedagogy / this-repo,
PR #337 review fix). Locus = where the WORDS are edited, never data provenance: the `OAK_KG` attribution
wording (C009) and the generated tool-annotation blocks are authored in THIS repo (emit-index.ts), so both
are `this-repo`; the graph corpora's DATA derives from `oaknational/oak-curriculum-ontology`, documented in
report §4.1 prose. Cross-links: ADR-157 + the `data-sources-governance` thread own the DATA-source side.

**Highest-leverage content:** the orient-first directive ("call `get-curriculum-model` first"), restated 12+×
incl. per-response `OAK_CONTEXT_HINT` and codegen `DOMAIN_PREREQUISITE_GUIDANCE`. Source of truth for server
instructions + the per-response hint is `packages/sdks/oak-curriculum-sdk/src/mcp/agent-support-tool-metadata.ts`.

**Confirmed defects (verified first-hand; fixable independently of any larger decision — report §8.1):**
`classNotes` teacher free-text interpolated unsanitised into the `continue-progression` prompt (PII/injection,
C196/C204); `kalan`→`Kalam` font-URL typo (C163); "Use the **this** type" typo in 3 asset tools (C507/C555/C585);
stale "lessons" wording on question `limit` params (C624); `download-asset` `idempotentHint:true` but non-idempotent
(C166); graph tools named in `SERVER_INSTRUCTIONS` but absent from `toolCategories`.

## Lane State

- **Owning plan(s):** none yet — the direction lives in `report.md` §7/§11. A build plan would be authored when
  the content-workspace build is owner-scheduled.
- **Current objective:** visibility delivered; awaiting owner direction on next phase.
- **Blockers / low-confidence areas:** the content-workspace build is owner-gated ("further thought before we
  decide"). The `impact_tier` derivation is a conservative heuristic (any behaviour-shaping surface = high-impact;
  any flag forces high-impact) — a real review may re-tier some items.
- **Next safe step:** see below.
- **Promotion watchlist:** the content-workspace SSOT architecture is an ADR candidate; "content as a first-class
  governed surface" + "visibility before validation" are PDR/pattern candidates (see pending-graduations).

## Next Safe Step

1. **Shepherd PR #337 to merge** (owner may review first — it is the education-expert review substrate).
   Use `oak-pr-lifecycle`. Docs-only; pre-push gate was green (build/type-check/lint/test, 105 tasks).
2. **DO NOT start the eval-methodology research unprompted.** Owner ruling 2026-07-09: do BOTH a foundational
   authoritative-source pass AND build-session grounding — but **gated on explicit owner go**. When cleared,
   research agent/LLM eval best practice (judge bias, ground-truth construction, inter-rater reliability,
   statistical power, contamination, cross-model variance) from authoritative sources FIRST.
3. **Content-workspace build is owner-gated / "further thought".** When scheduled, the open design questions
   (report §11) become live and MUST be carded (per `surface-user-decisions-as-questions`): the partition axis
   (several workspaces by review regime vs one), the SSOT→consumer flow (generator inversion; some SSOT content
   is structured data that COMPOSES a string, e.g. `agent-support-tool-metadata.ts` → `SERVER_INSTRUCTIONS`),
   whether simple-config also relocates, and the review/eval protocol definitions. Design l10n-ready.
4. The confirmed defects (§8.1) can be fixed anytime as small independent PRs; the two typos + stale wording are
   partly upstream (`oak-api` OpenAPI) — fix at source, cross-repo.
