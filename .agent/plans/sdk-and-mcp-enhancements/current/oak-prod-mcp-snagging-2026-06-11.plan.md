---
name: "Oak Prod MCP Snagging — 2026-06-11 Live Exercise"
overview: "Track and resolve the findings from the 2026-06-11 live exercise of the oak-prod MCP (curriculum-mcp-alpha.oaknational.dev, app v1.26.1) over the Cursor MCP client. Covers the get-eef-evidence structuredContent-only client-visibility finding (owner decision), corpus keyword description leakage, a corpus prior-knowledge typo, descriptor schema-bound completeness, and prompt-invocation UX observations."
todos:
  - id: s0-client-population-probe
    content: "S0 (before deciding S1): probe how non-Cursor clients (Claude Code, Codex, Gemini CLI at minimum) surface the get-eef-evidence structuredContent-only success — one Shape-B call each per the write-up's replay recipe. The S1 decision should rest on the client population, not Cursor alone."
    status: pending
  - id: s1-eef-textcontent-mirror
    content: "S1 (owner decision, informed by S0): resolve the get-eef-evidence success-shape finding — either add a serialised TextContent mirror alongside structuredContent (matches the graph-tool formatToolResponse shape and the MCP spec SHOULD) or record the client limitation and hold the ratified structuredContent-only shape. Evidence: the cursor-visibility write-up (this branch) + this plan's finding 1."
    status: pending
  - id: s2-keyword-description-scoping
    content: "S2: investigate cross-subject keyword description leakage (e.g. keyword:convert serving a religion-flavoured description into maths KS2 results). Decide at the corpus-emission layer whether keyword identity should carry per-subject descriptions or surface all placements' descriptions; never patch at the tool layer."
    status: pending
  - id: s3-corpus-typo-routing
    content: "S3: route the 'Interpret adn present data' prior-knowledge typo (unit:understand-additive-relationships-and-apply-them-to-rearrange-equations) to its source. If the text originates upstream (bulk export), log it with the upstream issue reports under sector-engagement/ooc-issues; if repo-held, fix at the corpus source."
    status: pending
  - id: s4-keyword-limit-schema-bounds
    content: "S4: align the get-keyword-graph `limit` descriptor schema with its documented and enforced bounds — the JSON schema declares bare `type: number` while the doc text and runtime refusal enforce an integer in [1, 100]. Carry the bounds in the generated schema (schema-first: fix at the input-schema source, regenerate)."
    status: pending
  - id: s5-prompt-ux-observations
    content: "S5 (observation, decide disposition): argless user invocation of a prompt slash-command (e.g. /adapt-lesson) surfaces a raw zod -32602 JSON dump to the user. Spec-correct server-side; decide whether a friendlier server-side error message is worth it or whether this is a client-UX concern to leave."
    status: pending
isProject: false
---

# Oak Prod MCP Snagging — 2026-06-11 Live Exercise

**Last Updated**: 2026-06-11 (evening — write-up-first framing per owner)
**Status**: OPEN — S1 awaits an owner decision; S2–S5 queued. The owner's
direction (2026-06-11 evening) is **detailed write-up before fixes**, because
the next agent will not be a Cursor instance.
**Primary evidence (self-contained, on this branch)**:
[`oak-prod-mcp-cursor-visibility-writeup-2026-06-11.md`](../../../reports/oak-prod-mcp-cursor-visibility-writeup-2026-06-11.md)
— wire shapes, the Cursor agent-visibility matrix, prompt-layer split, replay
recipe, and open client-population questions.
**Companion evidence (cross-branch)**: the full live-exercise verification
record `oak-prod-live-mcp-exercise-2026-06-11.md` is on branch
`docs/graph-team-direction-2026-06-10` (commit `ae5372e2c`, pushed) — not on
this branch; the write-up above reproduces the Cursor-relevant evidence so
nothing here depends on that branch.
**Severity model**: the
[Milestone Release Runbook snagging protocol](../../../../docs/engineering/milestone-release-runbook.md#snagging-protocol)
(P0 release stop … P3 post-release backlog).

---

## Findings register

| # | Severity | Finding (short) | Disposition |
|---|----------|-----------------|-------------|
| 1 | P1 | `get-eef-evidence` success payloads invisible to the Cursor agent harness: the ratified `content: []` + structuredContent-only shape renders `(omitted)`; refusals and every dual-shape tool render fine. The EEF teacher-value path is dead for agents in content-block-only clients. Cursor surfaces ONLY `content` blocks to the model — proven by the decoration-key fingerprint (received JSON lacks `summary`/`oakContextHint`/`status`, so it is `content[1]`, never `structuredContent`). | **Write-up complete; S0 client probe, then owner decision (S1)** — the fix reverses an owner-ratified shape. Full evidence + replay recipe in the [cursor-visibility write-up](../../../reports/oak-prod-mcp-cursor-visibility-writeup-2026-06-11.md). |
| 2 | P2 | Cross-subject keyword description leakage: `keyword:convert` (subjects: history, maths) serves "to convert to a new religion or belief…" into maths KS2 keyword results. | **In-repo (S2)** — corpus emission / keyword identity model. |
| 3 | P3 | Corpus prior-knowledge typo: "Interpret adn present data…" on `unit:understand-additive-relationships-and-apply-them-to-rearrange-equations`. | **Route to source (S3)** — upstream bulk data vs repo-held to be determined. |
| 4 | P3 | `get-keyword-graph` `limit` descriptor schema carries no bounds (`type: number`) while doc text + runtime enforce integer [1, 100]. Runtime refusal is correct; the schema under-declares. | **In-repo (S4)** — fix at the input-schema source, regenerate. |
| 5 | P3 | Argless prompt slash-command invocation (`/adapt-lesson`) surfaces a raw zod `-32602` JSON dump to the user. | **Observation (S5)** — spec-correct; decide friendlier message vs leave as client-UX concern. |

## Non-snags recorded during the same pass (no action)

- **Prompt invocability in Cursor**: MCP prompts ARE exposed to the *user* as
  slash commands (verified live 2026-06-11: `/adapt-lesson` reached the server
  and returned a spec-correct validation error naming `topic` + `yearGroup`,
  matching the descriptor). What is unavailable is *agent-side* invocation —
  the Cursor agent harness exposes tools and resources, not prompts. The
  corrected account (including the `<cursor_commands>` loop-back of
  user-invoked prompt results into agent context) is §4 of the
  [cursor-visibility write-up](../../../reports/oak-prod-mcp-cursor-visibility-writeup-2026-06-11.md);
  the original exercise report on the docs branch still carries the
  uncorrected blanket wording — amend it when branches reconcile.
- **Auth membrane**: unauthenticated JSON-RPC to the prod endpoint correctly
  401s with a `WWW-Authenticate` PRM pointer (Clerk).
- **Graph-tool contract behaviour**: all positive and negative probes
  doctrine-correct; no soft stubs anywhere. See the exercise report.

## Cross-references

- Evidence: [`oak-prod-live-mcp-exercise-2026-06-11.md`](../../../reports/oak-prod-live-mcp-exercise-2026-06-11.md)
- Finding 1 interacts with
  [`output-schemas-for-mcp-tools.plan.md`](output-schemas-for-mcp-tools.plan.md)
  (the envelope/outputSchema arc owns the long-term success-shape contract;
  any S1 change should be coherent with `composeEnvelopeSchema`).
- Sibling precedent: [`oak-preview-mcp-snagging-2026-04-23.plan.md`](oak-preview-mcp-snagging-2026-04-23.plan.md).
