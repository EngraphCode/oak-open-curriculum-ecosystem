---
fitness_line_target: 350
fitness_line_limit: 500
fitness_char_limit: 35000
fitness_line_length: 100
fitness_content_role: reference
overflow_disposition: 'leave-if-live; else conserve-insight-and-delete — never archive/split/rotate/shard (see continuity-practice.md §Disposition of Continuity Surfaces)'
merge_class: index-narrative-tables
---

# Next-Session Record — `mcp-product-analytics`

## Landing target — refreshed 26 July 2026

Implement the submission-blocking PostHog product-analytics capability defined
by
[`mcp-63-posthog-product-analytics.plan.md`](../../../plans/delivery/mcp-63-posthog-product-analytics.plan.md).
The implementation must provide:

1. a provider-neutral product-analytics port and working PostHog sink for the
   repository telemetry package; and
2. `@posthog/mcp` integration in the serverless MCP application.

PostHog is selected and required. The implementation blocks the initial
submission. The privacy, access, retention, deletion, and accountable
enablement evidence in
[`mcp-173-posthog-privacy-governance.plan.md`](../../../plans/delivery/mcp-173-posthog-privacy-governance.plan.md)
gates the October public beta.

## Current state

- Draft [PR #568](https://github.com/oaknational/oak-open-curriculum-ecosystem/pull/568)
  carries the ratified plans, ADR, and dated probe evidence on branch
  `jimcresswell/mcp-63-posthog-deterministic-analytics`.
- PR #568 remains a planning-baseline change. Runtime implementation starts
  from a fresh branch based on the resulting `main` after this PR lands.
- No implementation has begun on that clean branch.
- The superseded implementation spike was fully absorbed into the plan, ADR,
  and probe report. Its worktree and both obsolete local branches were deleted.
  Closed PR #477 is not an implementation source.
- Linear [MCP-63](https://linear.app/oaknational/issue/MCP-63) owns implementation
  state and evidence. Linear
  [MCP-173](https://linear.app/oaknational/issue/MCP-173) owns the October
  public-beta governance sequence and evidence links.
- The AI Managed Notion consultation owns substantive consultation, research,
  feedback, wording, and rationale. Its workspace URL remains outside tracked
  repository content.

## Authority order

1. The owner's current direction and milestone language.
2. The two ratified repository plan nodes.
3. [ADR-218](../../../../docs/architecture/architectural-decisions/218-posthog-mcp-analytics-identity-session-and-privacy.md).
4. The
   [26 July probe report](../../../research/telemetry-and-understanding/2026-07-26-posthog-mcp-pre-execution-probes.md)
   for dated vendor behaviour evidence.
5. Linear for delivery state and Notion for consultation state.

Older explorations and PR #477 are lineage only. They never override the
ratified plan or ADR.

## Settled boundary

- Product analytics answers deterministic user-interaction questions. Sentry
  continues to own engineering errors, traces, and diagnostic payloads.
- One MCP-dedicated PostHog client serves the current all-MCP event estate.
- The allowed facts are operation name, timestamps and duration, bounded
  outcome, approved client/protocol/environment/release categories, UUIDv7
  event/call identifiers, and the PostHog-scoped actor pseudonym.
- Arguments, responses, prompts, resource contents, search text, free text,
  direct identifiers, headers, tokens, IP/GeoIP enrichment, browser
  autocapture, session replay, and person-level cross-provider joins are
  prohibited.
- The stable actor pseudonym is derived inside the verified Clerk boundary and
  scoped by destination, environment, and key version. It remains
  pseudonymous personal data for Oak.
- One minimal PostHog Person, containing only that pseudonym and no person
  properties or groups, supports the documented deletion path.
- UUIDv7 identifies a call/event. It is not a universal person identifier.
- `$session_id` is removed until the installed integration proves a
  server-issued, actor-bound, replay-resistant round trip in shipped clients.
- The agent-echo conversation identifier is disabled. Downstream activity
  windows may be derived only when explicitly labelled inferred.
- Versions and vendor call shapes are flexible. Compatible non-exact manifest
  ranges and the lockfile record the current tested resolution. Every upgrade
  reruns the complete behavioural contract; a version change alone does not
  reopen the architecture.
- The MCP-63 implementation path does not enable public-beta capture or perform
  the live retention/deletion drill. MCP-173 owns those October proofs.

## Next safe step

After PR #568 lands, create a fresh implementation branch from the updated
`main`, then begin the first TDD slice:

1. write the provider-neutral product-event contract and forcing tests;
2. implement the closed contract directly without introducing a generic event
   name or arbitrary-property shape;
3. add compatible current PostHog dependencies and prove one interoperable
   runtime copy; and
4. keep existing Sentry behaviour unchanged.

Continue through the plan's ordered TDD slices. Each slice lands tests and
product code atomically. The full event/property allowlist, identity
projection, minimal-Person behaviour, final-wire policy, serverless lifecycle,
resource/prompt seams, Sentry coexistence, and built-app proof are acceptance
requirements, not later hardening.

## Closeout loss and metaloss scan

- The implementation contract, privacy boundary, version posture, milestone,
  branch authority, and external-surface state all have durable homes above.
- The obsolete spike contained no unique durable evidence; an independent
  byte-level and contract audit returned DELETE-SAFE before deletion.
- The repeated risk was authority drift: once-true mechanics, version
  snapshots, and milestone labels survived in continuity and tracking surfaces
  after the owner had corrected the frame. The cure is a single authority
  order plus deletion of spent sources, not preservation with warning labels.
- The external bound remains explicit: package probes describe the tested
  resolution on 26 July 2026, while future compatible versions must prove the
  same behaviour.
- Discarded association: two plan nodes do not imply two PostHog clients. The
  nodes separate delivery from governance; the runtime architecture still uses
  one client for the current event estate.
- Fixed point: a second pass found no unhomed decision, promise, branch,
  worktree, review marker, or implementation source in this thread boundary.

## Participating identities

| agent_name | platform | model | session_id_prefix | role | first_session | last_session |
| --- | --- | --- | --- | --- | --- | --- |
| Glassy Flowing Stern | cursor | composer-2.5 | de55d6 | original design author | 2026-05-26 | 2026-05-26 |
| Stellar Glowing Satellite | claude | claude-opus-4-7 | 9a2967 | programme and amendments | 2026-05-26 | 2026-05-26 |
| Urchin hunts Surf | claude-code | claude-fable-5 | b51773 | superseded spike author | 2026-07-22 | 2026-07-22 |
| Crucible wakes Ashes | codex | GPT-5 | 019f9a | ratified plan, probes, and closeout | 2026-07-26 | 2026-07-26 |
| Kite seeks Crosswind | codex | GPT-5 | 019f9e | MCP-63 implementation | 2026-07-26 | 2026-07-26 |
