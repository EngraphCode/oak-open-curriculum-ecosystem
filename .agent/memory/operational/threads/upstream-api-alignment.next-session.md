# Thread: upstream-api-alignment

**Purpose**: Bring the Oak Open Curriculum ecosystem into alignment with the evolving
upstream Oak API + bulk export, and establish a repeatable, observable alignment process.
Trigger instance (2026-06-30/07-01): upstream added a `programmes` resource family (5 GET
endpoints + 5 schemas).

## Participating agent identities (PDR-027)

| agent_name | platform | model | session_id_prefix | role | first_session | last_session |
| --- | --- | --- | --- | --- | --- | --- |
| Vanilla stirs Spore | claude | claude-opus-4-8[1m] | 807471 | implementer | 2026-07-01 | 2026-07-01 |

**Predecessor (identity fields not fully recorded):** *Bonfire turns Basalt* authored the
plan + process notes and landed WS0 (programmes regen) and WS1 (cached-schema-default,
`79364bbd1`), then handed the successor tasks to Vanilla stirs Spore via the plan's handoff
section (2026-07-01).

## Lane state

- **Owning plan**: [`active/upstream-api-alignment.plan.md`](../../../plans/sdk-and-mcp-enhancements/active/upstream-api-alignment.plan.md);
  living notes [`reports/upstream-api-alignment-notes-2026-06-30.md`](../../../reports/upstream-api-alignment-notes-2026-06-30.md).
- **Current objective**: adapt the repo to the changed upstream API spec (programmes family)
  and graduate the repeatable process. **Landed on PR #291; awaiting owner code-owner merge.**
- **Current state**: #291 (branch `feat/upstream-api-alignment`) is `merge=CLEAN` — all checks
  green, all review conversations resolved. Six session commits:
  - WS0 programmes regen + WS1 cached-schema-default (`79364bbd1`, predecessor).
  - WS2 semantic schema-drift check (`df2dbeabd`) — pure `evaluateSchemaDrift`, canonical
    compare, fetch abort-timeout, warn-only CI + pre-push. Live-verified "up to date".
  - WS4 programmes discoverability (`4f4a7ea3a`) + injected `TOOL_DESCRIPTION_ADDITIONS` map
    with the full-form-slug clarification note (`874af6fd8`).
  - Review triage — 6 bot findings fixed (`757720329`) + codegen refresh-hint env-var form
    (`0dc71a9f7`).
  - WS6 runbook graduation (`5dec179ce`) → permanent
    [`docs/engineering/upstream-api-alignment-runbook.md`](../../../../docs/engineering/upstream-api-alignment-runbook.md),
    registered in the Runbook Index; report de-duped to the worked instance.
  - **WS3 (bulk types schema-derivation) MOVED OUT** to its own future plan. **WS5 (committed
    live smoke lane) DEFERRED** (owner-confirmed 2026-07-01).
- **Blockers / low-confidence areas**: none blocking; the merge is the owner code-owner gate
  (per `project_main_merge_gate_codeowner`).
- **Next safe step** (after #291 merges):
  1. **Author the `bulk-types-schema-derivation` future plan — it does NOT yet exist.** The
     runbook and the active plan both reference it as future; the bulk types are still
     template-authored (a schema-first violation) and the bulk `schema.json` is not committed.
  2. **MCP pagination-header gap (P1)** — the MCP invoker drops response headers, so the
     `Link: rel="next"` guidance is unusable for ALL paginated tools. Systemic; open-question
     Q (ADR-shaped: the MCP tool-result pagination contract). Do not re-solve per-tool.
  3. Comms-routing CLI fix — the F-41-tail plan
     (`agent-tooling/current/coordination-home-cli-path-defaulting.plan.md`) awaits pickup on
     the **primary checkout**.
- **Promotion watchlist**: the MCP pagination-header contract (ADR candidate); the
  fluency-premature-done-claim recurrence (doctrine-traction / action-time-structural-interrupt).
