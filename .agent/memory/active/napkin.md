---
fitness_line_target: 220
fitness_line_limit: 300
fitness_char_limit: 18000
fitness_line_length: 100
drain_strategy: "Extract settled entries to permanent docs, PDRs, rules, or archived napkins"
merge_class: append-only-narrative
fitness_content_role: drainable-buffer
---

# Napkin

Current-session observations. Append below. Rotate when over ~400 lines (`consolidate-docs`
step 6): extract every behaviour-changing entry, merge into `distilled.md` or graduate to a
permanent home, verify the home, then archive and start fresh.

## Napkin rotated (2026-06-29 deep consolidation, Falcon wakes Stratus)

Second rotation of the day. Quoll's earlier rotation (`napkin-2026-06-29-quoll-consolidation.md`)
re-bloated immediately with the rotating-cast's closeout appends (Hearth, Sirius, Kayak, Seraph,
Kraken, and Quoll's own closeout) — a worked instance of *napkin re-bloats from rotating-cast
closeouts*. Those appends are now processed and preserved verbatim in
`archive/napkin-2026-06-29-falcon-consolidation.md` (byte-identical).

This deep pass (Director-rotation closeout, owner-directed) graduated the deferred team-tooling
captures to permanent homes — the commits + the homes are the record:

- the `consolidate-at-third-consumer` → `consolidate-at-second-consumer` rename + slug sweep
  (the Quoll/Seraph doc-defect, **FIXED** — but the sweep was too broad: it rewrote append-only
  rapid-comms turns + a quoted corroboration record, reverted on #290 bot review); **gate-evasion /
  escape-hatch screen** →
  `patterns/fluency-is-a-failure-vector.md`; **Director craft** (Kraken's standby-burn /
  auto-update-branch-babysitter / measure-at-handoff-gate + Trawler Part-A) → `director-handoff.md`
  §Standing lessons, with the CURRENT HANDOFF STATE refreshed to a compact post-arc block;
  **timestamp-zone discipline** → `verify-dont-trust.md`; **discriminating-fixture** →
  `docs/engineering/testing-patterns.md`; repo-continuity arc-closed + Director=Falcon; the AEE
  identity row, statusline index-drift, and `data-sources-governance` index folds.

**Carry-forward (homes mapped, await an authoring pass):** the five lighter amends + Sirius's ws0
findings are staged in [`distilled.md`](distilled.md). The **PDR-117 expansion** + the **synthesis
phase** (model verdict / do-first matrix / rightsizing M1→M2 activation) are owner-routed to a
fresh-context session. **Curator-pass debt:** clear the 11 dead `commit_queue` entries + archive
the 3 stale non-team claims (Starling/Ketch/Finch); the ~2186-event comms dir awaits the
retention-gated archive-move pass.

New session observations append below.

- **MISDIAGNOSED a transient gh-auth blip as 5,000-budget exhaustion (verify-dont-trust failure;
  owner caught it).** A `gh` GraphQL call 403'd ("rate limit exceeded for IP …") then 401'd ("Requires
  authentication"); I confabulated "I exhausted the shared 5,000/hr budget by polling" — primed by the
  harness reminder's "5,000 shared" framing. The EVIDENCE in my hand refuted it: `rate_limit` showed the
  **unauthenticated signature** (`core.limit 60`, `graphql.limit 0`), and minutes later (still the same
  hour) `core 4935/5000`, `graphql 4721/5000` — I'd used ~279 graphql, ~6% of budget. The real cause was
  a **transient unauthenticated/token blip** (gh momentarily sent the request without its keyring token;
  GraphQL is unusable unauthenticated → 403/401), self-recovered. Lessons: (a) read the `rate_limit`
  SIGNATURE — `limit 60` / `graphql 0` means *unauthenticated*, NOT *budget exhausted at 5,000*; on a
  401/unauthenticated signature, check `gh auth status` and retry, do not assume volume; (b) the owner's
  "no way you hit 5,000" is the exact evidence-discipline cure — isolate the layer (auth vs volume) from
  the data in hand, don't inherit a primed framing. Tight `gh` Monitor polling is still poor hygiene, but
  it did **not** cause this.
- **NEW AGENT-TOOLING CONCEPT (owner, 2026-06-29) — a fleet-wide SHARED-RESOURCE BROKER. Do not lose
  this.** (A forward capability for *genuine* fleet shared-limit pressure — the LLM API, Sonar, a real
  many-agent `gh` load — NOT the cure for the transient-auth blip above; the two are independent.) It is
  a tool that **collates requests from multiple agents** and draws them from **shared resource pools with
  shared limits** — one fleet budget, not per-agent ceilings. Crucially: **the shared budget/pool STATE lives in the PRIMARY CHECKOUT** (the
  same coordination-home locus as `active-claims.json`, resolved via `git worktree list` per
  `resolveCoordinationHome` / the F-41/F-85 lineage), so every agent and every worktree reads and writes
  ONE shared ledger rather than each polling blind. Mechanics: request collation/queueing + batching (one
  GraphQL round-trip for checks+threads+state), jitter so fleet calls don't align, exponential backoff
  honouring `Retry-After` / `X-RateLimit-Reset`, and **budget reservation** read from the shared ledger
  (back off as the shared remaining falls, reserve headroom). It generalises **beyond `gh`** to any
  shared rate-limited resource (the LLM API, Sonar, Vercel, …) — a general fleet resource-pool primitive,
  with `gh` as the first consumer. The Monitor / `pr-watch` poll recipes consume the broker, never raw
  `gh`. Home: **F-110** (expanded); a candidate for its own plan/PDR when prioritised (it is a new
  multi-agent capability, not just a friction fix). Self-similar with this very session: the team builds
  shared-state coordination primitives while being throttled by the lack of one in real time (FRAME-1).

## Session: Vanilla stirs Spore (807471) — upstream-api-alignment successor + closeout (2026-07-01)

- **P1 — SYSTEMIC: the MCP invoker drops HTTP response headers, so `Link: rel="next"` pagination
  guidance is unusable for EVERY paginated tool.** Observation: the generated tool descriptions
  (upstream-authored) tell agents that a `Link: rel="next"` header signals more pages, but the MCP
  path reduces the HTTP response to `{ httpStatus, payload }` and `callTool` returns only
  `{ status, data }` — headers are dropped. So an MCP client can never see the header and will stop
  after page 1 or hunt for pagination metadata that is never returned. This affects ALL paginated
  tools (get-*-questions, get-*-assets, get-key-stages-subject-lessons, …), NOT just the programme
  tools where Codex flagged it on #291. It is pre-existing, not a regression from the programmes
  work. **Cure (systemic, deferred):** expose the next-page signal IN the tool result (a
  `nextPageToken`/`nextOffset` field the invoker lifts from the `Link` header or offset math), OR
  strip the Link-header sentence at the generator for every paginated tool so agents are not sent to
  an inaccessible header. **Home:** flagged P1 here + open-questions (ADR-shaped: the MCP tool-result
  pagination contract). Do NOT re-solve per-tool. Owner-directed P1 flag, 2026-07-01.
- **RECURRENCE (PDR-098 evidence, not a fresh lesson): I declared "done/ready" on a fluent surface
  signal without grounding the actual gate — three times in one session.** (a) Called #291 "comms
  triaged, ready for merge" TWICE while 7 bot conversations sat UNRESOLVED — I resolved one thread
  early and did not re-fetch after two later pushes (bots re-review each push). (b) Suppressed a
  merge-ready PushNotification inferring "you're clearly watching" from monitor ticks + my own
  hold-messages — the owner was away. (c) Treated a green-checks state as merge-ready before checking
  the conversation-resolution gate. The unifying pathogen: a smooth "it's ready" arrived and I acted
  before grounding the *actual gating state* (all conversations resolved? presence real? which gate
  is binding?). This is the existing "Fluency Is a Warning" (metacognition directive) +
  "complete-claimed-on-green-not-observed" (`feedback_pr_readiness_requires_comment_triage`) doctrine
  RECURRING despite its home → route as recurrence evidence to the doctrine-traction / action-time
  structural-interrupt lane (the home is passive guidance that loses at the action moment). Cures
  captured this session: `feedback_notify_at_action_moment_not_inferred_presence` (new) +
  `feedback_pr_readiness_requires_comment_triage` (reinforced: unresolved conversation is a HARD
  merge gate; re-fetch after EVERY push). GitHub-state fact for future PR work: "resolved" = the
  conversation-resolution state (the Resolve button), never a reply.
- **Verified-fact for the next agent (grounded execution knowledge):** `SubjectProgrammesResponseSchema
  = z.array(z.string())` — get-subjects-programmes returns a FLAT array of full-form programme slug
  strings (`english-secondary-year-7`, `english-secondary-year-10-edexcel`), NOT objects with factors;
  per-programme factors come from `get-programmes`. The upstream description's `y7` slug example and
  "grouped by key stage" phrasing are LOOSE (the endpoint's own schema `example` uses full-form),
  clarified via the `TOOL_DESCRIPTION_ADDITIONS` map, not by editing generated output. Root
  `sdk-codegen` is a turbo wrapper, so a bare `--online` is eaten by turbo — the online refresh is
  `SDK_CODEGEN_MODE=online pnpm sdk-codegen`.
