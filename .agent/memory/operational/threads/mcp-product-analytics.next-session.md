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

- [PR #568](https://github.com/oaknational/oak-open-curriculum-ecosystem/pull/568)
  merged the ratified plans, ADR, and dated probe evidence at `ccd1c410f` on
  26 July 2026.
- Runtime implementation is in flight on
  `jimcresswell/mcp-63-posthog-product-analytics-implementation`, in the
  repo-relative worktree `.claude/worktrees/mcp-63-posthog-delivery`.
- The branch is dirty, unstaged, uncommitted, unpushed, has no PR, and was one
  commit behind `origin/main` at the 13:04Z succession freeze. The generated
  `pnpm-lock.yaml` diff came from pnpm tooling; it must never be edited or
  hand-merged.
- The provider-neutral observability port, shared sink-selection extension,
  new `@oaknational/posthog-node` adapter, boundary registration, and their
  tests exist in that worktree. Focused verification at the freeze was green:
  PostHog 130/130 tests, observability 67/67, env 51/51, and boundary 217/217,
  with package type-check/lint/build green apart from named pre-existing
  no-throw warnings.
- The final-wire test is mechanically green but structurally blocked. It
  manually recreates production composition and bypasses the production sink
  for resource rows, so it does not prove the shipped runtime path. Its next
  review must drive real production runtime/sink composition with only the
  transport boundary injected.
- No app-composition source file has been edited. Two claims reserve the
  bootstrap config and app manifest/docs boundaries, but reservation is not
  implementation.
- The owner initiated gradual in-flight succession from `Kite seeks Crosswind`
  to `Cutter hunts Lagoon`. Seven claims carry handoff pointers; the primary
  record is `.agent/state/collaboration/handoffs/`
  `f5b77b73-4fd2-4e35-a89a-90dbc1e97a81.md`.
  Kite retains monitoring and custody until Cutter validates the discontinuity,
  acknowledges the record, and adopts the claims in place.
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

The successor first reads the primary handoff and six annexes, recounts the
worktree, branch, claims, peer overlap, and messages, then acknowledges and
adopts all seven claims in place. No implementation edit precedes that custody
step.

The first technical move is to repair the final-wire proof so it exercises the
production runtime, sink, and instrumenter composition with only fetch or the
transport boundary injected, then obtain a fresh test-expert pass. After that:

1. rerun the adapter's 130-test suite and package gates;
2. implement bootstrap-only PostHog configuration and a sanitised
   handler-facing runtime config without creating a second selection axis;
3. expand claims before touching broader app bootstrap, lifecycle, resource,
   or served-surface files, and coordinate any overlap with MCP-187;
4. regenerate `pnpm-lock.yaml` through pnpm tooling only;
5. complete app wiring, shared close ownership, Sentry coexistence, protocol
   equivalence, built-app proof, and the full repository gates; and
6. commit explicit paths, push and verify the remote tip, then open and shepherd
   the implementation PR.

Every remaining slice still lands tests and product code atomically. The full
event/property allowlist, identity projection, minimal-Person behaviour,
final-wire policy, serverless lifecycle, resource/prompt seams, Sentry
coexistence, and built-app proof are acceptance requirements, not later
hardening.

## Handoff loss and metaloss scan

- The implementation contract, privacy boundary, version posture, milestone,
  branch authority, dirty edit state, claim bundle, and external-surface state
  now have durable homes above and in the claim-linked handoff record.
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
- The new false-green risk is narrower referent drift: focused gates prove the
  adapter and core slices, while the structurally blocked final-wire test and
  unrun full check keep the implementation verdict explicitly partial.
- Gradual succession is not complete merely because a record and directed event
  exist. Custody changes only when Cutter validates and adopts the seven claims;
  until then Kite's watcher and heartbeat remain load-bearing.
- Fixed point: after homing the stale "no implementation" statement, the dirty
  worktree, final-wire blocker, generated-lock rule, no-app-edit boundary, and
  adoption promise, a third pass would only re-find those named classes.

## Participating identities

| agent_name | platform | model | session_id_prefix | role | first_session | last_session |
| --- | --- | --- | --- | --- | --- | --- |
| Glassy Flowing Stern | cursor | composer-2.5 | de55d6 | original design author | 2026-05-26 | 2026-05-26 |
| Stellar Glowing Satellite | claude | claude-opus-4-7 | 9a2967 | programme and amendments | 2026-05-26 | 2026-05-26 |
| Urchin hunts Surf | claude-code | claude-fable-5 | b51773 | superseded spike author | 2026-07-22 | 2026-07-22 |
| Crucible wakes Ashes | codex | GPT-5 | 019f9a | ratified plan, probes, and closeout | 2026-07-26 | 2026-07-26 |
| Kite seeks Crosswind | codex | GPT-5 | 019f9e | implementation and outgoing custody | 2026-07-26 | 2026-07-26 |
| Cutter hunts Lagoon | codex | GPT-5 | 019f9e | named successor; adoption pending | 2026-07-26 | 2026-07-26 |
