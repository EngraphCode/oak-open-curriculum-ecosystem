---
boundary: B4-Engineering-Operations
doc_role: runbook
authority: operations-navigation
status: active
last_reviewed: 2026-07-01
---

# Upstream API Alignment Runbook

**When to run this:** the upstream Oak Open Curriculum API (OpenAPI spec) or the
bulk export has changed and the ecosystem needs to be brought back into alignment.
This is the repeatable _how_; the specific change is the instance.

A recognised runbook content kind per
[PDR-120](../../.agent/practice-core/decision-records/PDR-120-runbooks-are-a-content-kind-not-a-surface.md).
Rare trigger, so it is a reference runbook — read on demand, not loaded every session.

## The unifying principle (the substrate, not the instance)

Every schema-bearing surface in this repo has **two obligations**:

1. **Derive, never author.** All types, Zod schemas, and type predicates flow from
   that surface's schema/data at codegen time — the Cardinal Rule
   ([schema-first-execution.md](../../.agent/directives/schema-first-execution.md),
   ADR-029/030/031). When output is wrong, fix the **generator**, never the generated
   file.
2. **Make drift observable and gated.** The committed cache of each schema is the
   source of truth for hermetic builds; a warn-only validator surfaces when the
   committed cache falls behind upstream. Drift is surfaced, not discovered by accident.

The two schema-bearing surfaces:

| Surface                   | Upstream                                           | Committed cache (source of truth)                                                    | Type generation                                                |
| ------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------- |
| OpenAPI / SDK / MCP tools | `open-api.thenational.academy/api/v0/swagger.json` | `packages/sdks/oak-sdk-codegen/schema-cache/api-schema-original.json` (committed)    | `pnpm sdk-codegen` — schema-derived                            |
| Bulk export               | `open-api.thenational.academy/api/bulk`            | none yet — bulk `schema.json` / `manifest.json` are not committed (still gitignored) | bulk typegen — **template-authored today, not schema-derived** |

This runbook covers the **OpenAPI/SDK/MCP surface** in full — the proven flow below.

The bulk surface does **not** yet meet the two obligations: its types are currently
template-authored rather than derived from a schema, and its `schema.json` is not committed,
so bulk drift is not yet observable via git. Bringing the bulk surface into alignment
(commit the schema fingerprint; derive the bulk types from it) is deferred to a separate
future plan that is not yet authored — do not follow this runbook's steps for the bulk
surface until that alignment lands.

## Procedure

### 1. Isolate the work in a built worktree

Create a linked worktree off `main`, then **install and build before any gate or work**:

```bash
git worktree add ../oak-<change-name> -b feat/<change-name> main
cd ../oak-<change-name>
pnpm install && pnpm build
```

Build first, always: the ESLint flat config and the statusline resolve from `dist/`, so
an unbuilt worktree silently fails `lint` and shows no statusline
([worktree-hygiene.md](../../.agent/rules/worktree-hygiene.md)).

### 2. Refresh the cached schema, then diff the delta before regenerating

Codegen reads the committed cache by default (hermetic). Refresh from upstream with the
**env-var opt-in** — a bare `--online` is consumed by the turbo wrapper and never reaches
codegen:

```bash
SDK_CODEGEN_MODE=online pnpm sdk-codegen
```

Then classify the delta before trusting green types. This reusable recipe works for any two
schema versions (`PREV` = the prior committed cache, `NEW` = the refreshed one):

```bash
# paths added / removed
comm -13 <(jq -r '.paths|keys[]' PREV|sort) <(jq -r '.paths|keys[]' NEW|sort)   # added
comm -23 <(jq -r '.paths|keys[]' PREV|sort) <(jq -r '.paths|keys[]' NEW|sort)   # removed
# schemas added / removed
comm -13 <(jq -r '.components.schemas|keys[]' PREV|sort) <(jq -r '.components.schemas|keys[]' NEW|sort)
# structural-vs-prose: fingerprint each existing operation (operationId + param names +
# response $refs) and diff that. Identical fingerprint => the change is description-only.
```

The structural-vs-prose fingerprint is the load-bearing trick: it separates a breaking
change from documentation churn without reading every line. Classify the delta as
**additive** (new paths/schemas, nothing changed on existing operations) or **breaking**
(a changed parameter, response, or type on an existing operation). Additive is low-risk;
breaking needs consumer analysis.

### 3. Regenerate the SDK and MCP tools; confirm registration + type-check

```bash
pnpm sdk-codegen && pnpm build
```

The generated artefacts are not the source of truth — the schema and generator are.
Confirm the **registry moved** (new endpoints become registered `MCP_TOOLS` descriptors by
construction) and **`type-check` is green across all consumer workspaces**. Downstream type
breakage is where an additive-looking change can still bite.

> **STOP tripwire (type-change discipline).** If a generator change produces a type error in
> a _consumer_ (app/lib) that tempts a consumer-side type edit, that is the signal of a
> fundamental generator-design mistake — **halt and surface to the owner**. Do not chase the
> types through the system. Types flow outward from the schema; the only correct place to
> change them is the generator.

### 4. Verify representative tools execute against the live API

Type-check proves wiring, not function. After any regen, run one live `executeToolCall` per
**new or shape-changed** operation against prod (clear `OAK_API_URL` to force the default),
with the API key injected via `--env-file` (never read), and assert an `ok` result with
populated, schema-valid data. An Output-validation `err` means the live response diverged
from the regenerated schema — the canonical post-regen failure. Auth at the SDK layer is
just `Authorization: Bearer <OAK_API_KEY>`; the swagger endpoint itself is public.

The committed live smoke lane (when built — see the plan's WS5) makes this a continuous
signal instead of an ad-hoc script.

### 5. Assess discoverability (does `get-curriculum-model` teach the new concept?)

New tools are useless if agents cannot find them. Surface a new entity/route in
`get-curriculum-model` (hand-authored guidance in `oak-curriculum-sdk`): a tool category, a
workflow, and — where it is a genuine new entity — a domain-model entry. Frame new routes
**co-equal** with existing ones rather than demoting the old.

Fix a wrong or misleading **generated** tool description at the source, never in the output
file:

- If the upstream description text itself is loose, **add an agent-facing clarification note**
  via the per-tool additions map (`TOOL_DESCRIPTION_ADDITIONS` in
  `code-generation/typegen/mcp-tools/parts/tool-description.ts`) — schema-first permits
  _adding_ MCP metadata at codegen; the note augments, never contradicts, the upstream text.
- Correcting the upstream text itself is an `oak-openapi` (source) change.

### 6. Land it

Gates green, then commit by **explicit pathspec** (never `git add .`), open a draft PR to
`main`, drive it green, resolve **every** review conversation in GitHub's state (a reply is
not a resolve — an unresolved conversation blocks merge), then owner code-owner merge, then
remove the worktree.

## Schema-drift observability (the second obligation)

The committed cache is the build source; a warn-only check surfaces staleness:

- `agent-tools/src/ci/ci-schema-drift-check.ts` fetches the live spec (with an abort
  timeout so an offline network cannot hang it) and compares it to the committed cache
  **semantically** — a pure `evaluateSchemaDrift` canonicalises both sides (recursive
  key-sort, array order preserved), so the routine byte difference between the cache-write
  and raw-fetch pipelines does not cry wolf while genuine same-version content drift is
  still caught.
- It runs in CI and as a non-blocking pre-push advisory. It always exits 0 — a stale cache
  is surfaced, never a blocker on unrelated work. New checks start at warn.

## References

- [schema-first-execution.md](../../.agent/directives/schema-first-execution.md) — the Cardinal Rule.
- [worktree-hygiene.md](../../.agent/rules/worktree-hygiene.md) — build-before-work; one lane, one worktree.
- [build-system.md](./build-system.md) — SDK-codegen build order and caching.
- Runbook index: [docs/operations/README.md](../operations/README.md#runbook-index).
