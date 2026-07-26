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

The live succession, monitoring correction, focused-PR decision, evidence
ceilings, and current slice inventory are absorbed in the
[26 July permanent dated record](../../../reports/mcp-63-succession-notification-and-focused-delivery-2026-07-26.md).
The live thread remains temporary operational state; the report is not a
handoff or closeout.

## Current state

- [PR #568](https://github.com/oaknational/oak-open-curriculum-ecosystem/pull/568)
  merged the ratified plans, ADR, and dated probe evidence at `ccd1c410f` on
  26 July 2026.
- Runtime implementation is in flight on
  `jimcresswell/mcp-63-posthog-product-analytics-implementation`, in the
  repo-relative worktree `.claude/worktrees/mcp-63-posthog-delivery`.
- Focused slice 1 is local commit `ae25b10c9`
  (`feat(observability): add product analytics port`). It contains only the
  provider-neutral port, shared selection/locality axis, env coverage, and the
  observability-to-result dependency. The branch is one commit ahead and nine
  behind the locally recorded `origin/main`; it is unpushed and has no PR.
  Fresh evidence was observability 59/59, env 51/51, both packages'
  type-check/build, lint exit zero with known unrelated warnings, targeted
  formatting, architecture review, test review, and commit hooks. No captured
  historical RED exists, so Red-to-Green is not claimed.
- The uncommitted slice is now confined to the new
  `@oaknational/posthog-node` adapter, three oak-eslint boundary files,
  workspace registration, and pnpm-generated lock entries. The index is empty.
  The lockfile must never be edited or hand-merged.
- The final-wire blocker is cured. The test drives the shared private
  production composition with only a non-barrel fetch seam, exercises the real
  client, sink, instrumenter, policies, batching, compression, retry, and
  shutdown paths, and keeps the public barrel factory one-argument. Fresh
  code-expert and test-expert reviews passed; the adapter's 130/130 tests,
  type-check, lint, build, and targeted formatting check are green. This work
  belongs to the still-uncommitted adapter slice.
- The owner requires three small, ordered PRs: port/axis, then adapter, then app
  composition. Each dependent slice settles before the next opens. A combined
  44-path commit was cancelled before creation.
- No app-composition source file has been edited. Two claims reserve the
  bootstrap config and app manifest/docs boundaries, but reservation is not
  implementation. Read-only exploration found that handler-facing
  `RuntimeConfig` currently exposes the parsed env and that the legacy
  sentry-node config cannot express simultaneous Sentry plus fixture-tee
  behaviour on the shared axis; production wiring needs an expanded claim and
  explicit architecture disposition.
- The owner completed the in-flight succession from `Kite seeks Crosswind` to
  `Cutter hunts Lagoon`. Cutter validated the discontinuity, acknowledged the
  primary handoff record at `.agent/state/collaboration/handoffs/`
  `f5b77b73-4fd2-4e35-a89a-90dbc1e97a81.md`, and adopted all seven claims in
  place with their handoff pointers retained. Kite independently verified the
  transfer and retired; Cutter now holds implementation custody.
- The canonical comms watcher is transport/cursor evidence, not proof that the
  reasoning loop was notified. The user caught that detached watcher output
  was not waking this Codex seat. A separate full-stream ten-minute foreground
  poll is therefore the cognition path and remains armed until the user stops
  it; the claim heartbeat remains outbound liveness only.
- The superseded implementation spike was fully absorbed into the plan, ADR,
  and probe report. Closed PR #477 remains lineage, not an implementation
  source.
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

Settle focused PR1 before opening any adapter PR:

1. reconcile the nine-main-commit drift without widening PR1's story;
2. push local commit `ae25b10c9`, verify the remote tip, open the focused PR,
   and shepherd it to settled;
3. keep PR2 local until
   `mcp-server-instrumenter.integration.test.ts` receives its whole-file
   test-expert cure, the dead `isNonEmptyString` helper is removed, fresh
   security/MCP/config reviews pass, and package/boundary gates are rerun;
4. regenerate `pnpm-lock.yaml` through pnpm tooling only and settle PR2; then
5. expand the app claims and resolve config secrecy plus one-axis
   Sentry/fixture coexistence before beginning PR3 production wiring.

Every remaining slice still lands tests and product code atomically. The full
event/property allowlist, identity projection, minimal-Person behaviour,
final-wire policy, serverless lifecycle, resource/prompt seams, Sentry
coexistence, and built-app proof are acceptance requirements, not later
hardening.

## Handoff loss and metaloss scan

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
- The current false-green risks are notification drift and delivery-state
  collapse: watcher process/cursor does not prove cognition, a local commit
  does not prove publication or review, and accepted adapter evidence does not
  prove a settled adapter PR.
- Custody transfer is complete, but monitoring is intentionally redundant. The
  canonical watcher, foreground cognition poll, and outbound claim heartbeat
  prove different liveness classes and must not substitute for one another.
- Tracking is orthogonal to importance, authority, permanence, and safety.
  Untracked live collaboration state is critical truth-of-now; this tracked
  thread and the plans are temporary; permanent documentation is the only
  long-term knowledge destination.

## Participating identities

| agent_name | platform | model | session_id_prefix | role | first_session | last_session |
| --- | --- | --- | --- | --- | --- | --- |
| Glassy Flowing Stern | cursor | composer-2.5 | de55d6 | original design author | 2026-05-26 | 2026-05-26 |
| Stellar Glowing Satellite | claude | claude-opus-4-7 | 9a2967 | programme and amendments | 2026-05-26 | 2026-05-26 |
| Urchin hunts Surf | claude-code | claude-fable-5 | b51773 | superseded spike author | 2026-07-22 | 2026-07-22 |
| Crucible wakes Ashes | codex | GPT-5 | 019f9a | ratified plan, probes, and closeout | 2026-07-26 | 2026-07-26 |
| Kite seeks Crosswind | codex | GPT-5 | 019f9e | implementation and outgoing custody | 2026-07-26 | 2026-07-26 |
| Cutter hunts Lagoon | codex | GPT-5 | 019f9e | active implementation custody | 2026-07-26 | 2026-07-26 |
