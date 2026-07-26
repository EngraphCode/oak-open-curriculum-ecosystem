---
title: "PostHog MCP pre-execution probe results"
type: research
status: complete
last_updated: 2026-07-26
posthog_project_id: 221775
package_pins:
  "@posthog/mcp": "0.10.0"
  "posthog-node": "5.46.1"
  "@modelcontextprotocol/sdk": "1.29.0"
---

# PostHog MCP pre-execution probe results

## Purpose

This record settles the four implementation-blocking questions raised before
MCP-63 execution resumed:

1. what the exact `@posthog/mcp` pin observes and sends;
2. how `posthog-node` delivery behaves inside a Vercel Function;
3. whether the package supplies a trustworthy MCP session across fresh
   server and transport instances; and
4. whether PostHog can delete profileless events through the approved
   destination-scoped pseudonym.

The conclusions apply to these exact resolved versions:

| Package | Probe version |
| --- | --- |
| `@posthog/mcp` | `0.10.0` |
| `posthog-node` | `5.46.1` |
| `@modelcontextprotocol/sdk` | `1.29.0` |

An upgrade reopens every package-dependent conclusion in this report.

## Evidence boundary

The probes combined four evidence classes:

- direct inspection of the published package source at the exact resolved
  versions;
- disposable runtime harnesses using fake MCP handlers and a loopback capture
  endpoint;
- read-only queries against PostHog project `221775`; and
- current official MCP, PostHog, and Vercel documentation.

No production request, tool argument, response, prompt, resource content,
direct identifier, API key, or project token was recorded. No event was
created or deleted in the live PostHog project.

The disposable runtime commands had this generic form:

```bash
pnpm why @posthog/mcp
pnpm why posthog-node
pnpm why @modelcontextprotocol/sdk
node <temporary-package-contract-probe>.mjs
node <temporary-session-transport-probe>.mjs
node <temporary-delivery-probe>.mjs
```

The harnesses are evidence-generation tools, not durable implementation code.
The implementation must express their conclusions as repository-owned contract
tests at the final outbound boundary.

## Settled result

| Probe | Settled result | Architectural consequence |
| --- | --- | --- |
| MCP operation and payload coverage | Automatic instrumentation covers `initialize`, `tools/list`, and `tools/call`; it does not install resource or prompt handlers | Adopt the wrapper only for the operations it actually observes; record resources and prompts at Oak-owned deterministic seams |
| Serverless delivery | Queued capture is reliable only when its work is attached to the Vercel invocation lifetime | Use one composition-root client configured with Vercel `waitUntil`; do not shut it down per request or use fire-and-forget delivery |
| Session continuity | The package token is unsigned and forgeable; SSE does not return it, while JSON continuity depends on client replay | Emit no `$session_id` in the current release; derive only clearly labelled activity windows downstream |
| Pseudonym-scoped deletion | The bulk-deletion API resolves persons, not unbound profileless event rows | Create one minimal person record under the PostHog-scoped pseudonym, with no Oak-supplied person properties, and prove deletion in the October live drill |

## Probe 1: exact `@posthog/mcp@0.10.0` behaviour

### Automatic operation coverage

Both the high-level `McpServer` path and low-level `Server` path install
instrumentation for only:

- `initialize`;
- `tools/list`; and
- `tools/call`.

The package declares event names for `resources/list`, `resources/read`,
`prompts/list`, and `prompts/get`, but the high- and low-level
`instrument()` paths do not register or wrap those request handlers.

This is a material difference from the current PostHog overview, which says
that the wrapper emits events for resource reads and prompt fetches. The
published `0.10.0` source and executable probe establish the dated baseline
finding. Oak must verify the installed package and record resource activity,
and any future prompt activity, at its own deterministic request or execution
seams whenever the wrapper does not provide proven coverage.

The package remains useful for its proven automatic surface. It is a bounded
MCP observation adapter, not the authority for Oak's event vocabulary or
coverage.

### Final-wire payload policy

Before Oak policy, the package can construct events containing:

- tool parameters and responses;
- tool descriptions;
- inferred or explicit intent;
- error messages and exception siblings;
- package-generated identity and session values;
- conversation values; and
- arbitrary package and caller-supplied properties.

PostHog's sanitisation and truncation reduce unsafe values but do not implement
Oak's no-content contract. Oak therefore uses `beforeSend` as a final
reconstruction barrier:

1. reject unknown event names;
2. apply the shared redactor;
3. construct a fresh object from the event-specific allowlist;
4. replace the vendor identity with the approved PostHog-scoped pseudonym;
5. remove `$session_id` under the current session decision;
6. omit arguments, responses, descriptions, intent, free text, exception
   payloads, headers, IP/GeoIP, groups, and person properties; and
7. drop the event when any required bounded field is invalid.

The package invokes `beforeSend` after its own sanitisation, truncation, and
event fan-out, immediately before each call to `posthog.capture()`. The hook
also sees an automatically generated `$exception` sibling. Returning a
nullish value or throwing drops that individual outbound event.

Repository tests must inspect the actual object handed to
`posthog.capture()`. Testing an earlier intermediate object does not establish
the final wire contract.

Although the package type permits an asynchronous `beforeSend`, its
request-handler publication path does not await the returned capture promise.
Oak's hook is therefore a synchronous, pure transformation with no I/O,
lookups, timers, or promise return. Identity derivation and every other
required input must be complete before the hook runs. This ensures the
allowlisted event reaches `posthog-node`'s queue during the invocation rather
than leaving sanitisation work detached from the request lifetime.

Exception autocapture, conversation IDs, schema-changing context injection,
and missing-capability tool injection remain disabled.

### Mutations and the one-client decision

`instrument()` mutates the MCP server:

- request handlers are wrapped;
- `setRequestHandler` is replaced so later registrations are also wrapped;
- high-level tool callbacks and update callbacks are wrapped; and
- the high-level registered-tool map is proxied.

It also mutates two library-metadata methods on the supplied PostHog client:

- `getLibraryId()` changes from `posthog-node` to `posthog-node-mcp`;
- `getLibraryVersion()` changes from `5.46.1` to `0.10.0`.

The exact-instance probe found no replacement of `capture()` and no other
change to the client's own-key set. Supplying the package logger also changes
the package's module-level logger; logger configuration is therefore performed
once at composition.

The current event estate is entirely MCP product analytics. Oak-owned resource
and prompt events are still MCP events, so `posthog-node-mcp@0.10.0` is
accurate provenance for every current capture. The settled topology is one
PostHog client per live function isolate, created at the composition root and
shared by the package adapter and Oak-owned MCP projections.

A separate client becomes warranted only when a genuinely non-MCP product
event enters the estate and needs ordinary `posthog-node` provenance or a
materially different delivery policy. That condition is not present in MCP-63.

## Probe 2: `posthog-node@5.46.1` delivery on Vercel

### Measured behaviour

The loopback transport probe produced these results:

| Scenario | Measured result |
| --- | --- |
| `capture()` with no flush or lifetime registration | The event was queued; no request reached the capture endpoint before the invocation work ended |
| `capture()` followed by `flush()` | One capture request was sent and the queued event was present |
| `captureImmediate()` | The returned promise waited for the transport to settle |
| failed `captureImmediate()` | The promise did not reject; the client emitted one `error` event |
| failed queued `flush()` | `flush()` rejected |
| queued `capture()` with the client `waitUntil` option | The client registered one invocation-lifetime promise and sent the event |

This confirms three different semantics:

- `capture()` means enqueue;
- `flush()` means wait for queued delivery and exposes failure by rejection;
- `captureImmediate()` waits for transport completion but reports a transport
  failure through the client's error channel rather than promise rejection.

Oak does not use `captureImmediate()` for this integration. Mixing immediate
and queued modes creates two delivery semantics without supplying a product
benefit.

### Delivery decision

The PostHog client is created once at the Vercel Function composition root
with the `waitUntil` callback from `@vercel/functions`. Version `5.46.1`
registers a debounced flush promise with that callback whenever an event is
queued. Vercel then keeps the invocation alive for that promise after the MCP
response is returned, within the Function's execution limit.

This shape preserves the user-facing response path:

- analytics capture does not delay or change the MCP result;
- one queue and one delivery mode serve automatic and Oak-owned MCP events;
- warm-isolate reuse remains available without being required for correctness;
- no process memory is used for actor or session semantics; and
- `shutdown()` is reserved for real process teardown, not called per request.

Unregistered fire-and-forget promises are not a delivery mechanism on Vercel:
the runtime can freeze the function after sending the response.

The PostHog client's `error` channel and explicit flush failures feed a
content-free delivery-health signal into Sentry. They never attach tool
arguments, responses, direct identifiers, or PostHog credentials, and they
never fail the MCP request.

`waitUntil` gives bounded best-effort completion inside the Vercel invocation
lifetime. It is not a durable outbox or proof of ingestion. An outbox belongs
only to a future requirement for reconciliation or delivery stronger than the
current product-analytics contract.

## Probe 3: session continuity across fresh request instances

### What the package does

The package tries to preserve analytics sessions on stateless servers by
encoding this data into `MCP-Session-Id`:

- a package `ses_*` value;
- client name;
- client version; and
- protocol version.

The token is base64url-encoded JSON. It has no signature or message
authentication code. Decoding validates shape and field lengths, but not
authenticity, server issuance, actor binding, expiry, or replay context.

The executable probe replaced the minted values with a client-authored token.
A fresh server accepted the forged `ses_*` value and forged client metadata in
both response modes. The value is therefore an untrusted grouping hint, not a
deterministic Oak session identifier.

### SSE and JSON response behaviour

With the SDK resolution used for this dated probe:

- SSE response headers are built before the instrumented `initialize` handler
  runs, so the package-minted `MCP-Session-Id` does not reach the client;
- every fresh request then receives a new package analytics session;
- JSON response mode builds headers after the handler and returns the token;
  and
- continuity across a fresh server and transport exists only when the client
  replays that header on every later request.

The SSE failure is a header-timing property of this integration, not evidence
of a Vercel-resident session. Switching to JSON would solve header timing but
would not solve the token's missing authenticity and binding.

The MCP specification treats sessions as optional, client-carried context. It
requires a client to replay a server-returned identifier and says identifiers
should be globally unique and cryptographically secure. It does not require
Oak to claim a session when those conditions are not met.

### Current decision

The current release emits no `$session_id`:

- the Oak final-wire policy removes the package value;
- no request-scoped generated value is relabelled as a session;
- the Clerk authentication session remains an authentication concept;
- PostHog conversation IDs remain disabled; and
- no host-conversation identifier is collected.

Raw calls remain attributable to the approved PostHog-scoped actor pseudonym
and carry their own UUIDv7 event or call identifier. Downstream analysis can
group ordered calls into a versioned, explicitly labelled activity window.
It must not rename that inference as an MCP session or host conversation.

A future real-session design must use an Oak-issued token that is
cryptographically authenticated, actor-bound where appropriate,
expiry-aware, validated before use, and replay-tested with supported clients.
That is a separate transport and security change, not part of the current
PostHog package adoption.

## Probe 4: deletion by destination-scoped pseudonym

### Why profileless events are insufficient

PostHog distinguishes an event `distinct_id` from a person profile. Official
documentation states that events can be stored without any person profile.
The Node SDK creates that profileless shape when
`$process_person_profile: false` is present.

The current bulk-deletion API is person-centred:

- `distinct_ids` means distinct IDs whose associated persons are matched;
- `delete_events: true` queues deletion of events associated with those
  matched persons;
- the response reports `persons_found` and `persons_deleted`; and
- deletion status is addressed by `person_uuid`.

The API schema supplies no event-only deletion operation by a profileless
`distinct_id`. A profileless event can therefore exist while
`persons_found` is zero. The earlier design of disabling person processing on
every event does not provide a proven request-for-deletion route.

### Minimal-person decision

Oak permits one minimal PostHog person record for each approved
destination-scoped actor pseudonym. This is an addressability record for
repeat-use analysis and erasure, not a user profile.

The outbound boundary:

- uses only the PostHog- and environment-scoped pseudonym as `distinct_id`;
- allows person processing on those approved actor events;
- supplies no name, email, raw Clerk ID, authentication-session ID, or other
  direct identifier;
- supplies no Oak person properties through `$set`, `$set_once`, or `$unset`;
- emits no alias, identity-merge, or group relationship;
- drops the package's standalone `$identify` event; and
- retains the same content-free event-property allowlist.

The pseudonym remains personal data. A minimal provider record does not make it
anonymous or remove Oak's access, retention, and erasure responsibilities.

At request time, Oak derives every retained key-version projection before the
source authentication principal is removed. The provider route submits those
values through `persons/bulk_delete` with `delete_events: true`, records no raw
principal in the evidence, polls `persons/deletion_status`, and separately
propagates deletion to every authorised export or derived copy.

The API deletes only events captured before the deletion request. The
runbook must prevent a controlled drill actor from emitting further events
between request and verification.

### Live-project evidence ceiling

Read-only inspection of project `221775` found no captured MCP events. A
targeted query over the preceding 30 days returned no `$mcp_*` rows, and the
project surface reported:

| Field | Observed value |
| --- | --- |
| `ingested_event` | `false` |
| `event_retention_months` | `84` |
| `events_retention_enforced` | `false` |

The combined operational meaning of these fields is not publicly documented.
They do not prove that Oak's maximum 12-month retention commitment is
configured or enforced. In particular, an observed value of `84` is not the
required 12-month setting, and the `false` enforcement flag prevents any
claim of live expiry proof.

Because no controlled actor, person, or event exists, this probe could not
exercise deletion without first writing live project data. No such write was
performed.

The completed live drill remains an October public-beta gate, not a blocker
to the next submission. It must:

1. capture an allowlisted controlled event under a test pseudonym;
2. confirm a minimal person is addressable by that pseudonym;
3. invoke bulk deletion with event deletion enabled;
4. poll asynchronous completion;
5. verify that both the person and pre-request events are absent;
6. verify deletion from every authorised copy; and
7. retain content-free evidence on MCP-173.

The 12-month provider configuration and enforcement proof remain part of the
same October gate.

## Evidence and implementation constraints established by the probes

The exact versions in this record are a reproducible evidence baseline,
not an allowed-version set. MCP-63 implementation has these
non-negotiable behavioural constraints:

1. use current mutually compatible `@posthog/mcp`, `posthog-node`, and
   MCP SDK releases under non-exact manifest ranges, with the complete
   probe and contract suite rerun whenever those ranges advance;
2. automatic wrapper coverage limited to initialisation and tool listing/call;
3. Oak-owned resource and prompt observation at deterministic server seams;
4. one closed, synchronous final-wire reconstruction policy for every event;
5. no arguments, responses, prompts, resource contents, free text, headers,
   direct identifiers, exception payloads, or unapproved properties;
6. one PostHog client for the current all-MCP event estate, configured once
   with Vercel `waitUntil`;
7. queued capture only, with delivery failures isolated from MCP results;
8. no current `$session_id` or conversation identifier;
9. stable PostHog-scoped actor pseudonym plus UUIDv7 event/call identifiers;
10. a minimal pseudonymous person record with no Oak-supplied properties; and
11. a live retention and deletion drill before October public-beta enablement.

## Official evidence

- [MCP Streamable HTTP transport and session management](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports#session-management)
- [PostHog MCP Analytics overview](https://posthog.com/docs/mcp-analytics)
- [PostHog MCP privacy and redaction](https://posthog.com/docs/mcp-analytics/privacy)
- [PostHog MCP user identification](https://posthog.com/docs/mcp-analytics/identifying-users)
- [`@posthog/mcp@0.10.0` source snapshot](https://github.com/PostHog/posthog-js/tree/a027bf5c0d48a39388f9db3da7565e2d283e0b65/packages/mcp)
- [`@posthog/mcp` high-level instrumentation source](https://github.com/PostHog/posthog-js/blob/a027bf5c0d48a39388f9db3da7565e2d283e0b65/packages/mcp/src/extensions/instrument-highlevel.ts)
- [`@posthog/mcp` low-level instrumentation source](https://github.com/PostHog/posthog-js/blob/a027bf5c0d48a39388f9db3da7565e2d283e0b65/packages/mcp/src/extensions/instrument-lowlevel.ts)
- [`@posthog/mcp` final capture pipeline source](https://github.com/PostHog/posthog-js/blob/a027bf5c0d48a39388f9db3da7565e2d283e0b65/packages/mcp/src/extensions/sink.ts)
- [`@posthog/mcp` session-token source](https://github.com/PostHog/posthog-js/blob/a027bf5c0d48a39388f9db3da7565e2d283e0b65/packages/mcp/src/extensions/session-token.ts)
- [`posthog-node@5.46.1` source snapshot](https://github.com/PostHog/posthog-js/tree/7c00f92525bd6fb1231ab762ff46230f279fd740/packages/node)
- [PostHog Node SDK documentation](https://posthog.com/docs/libraries/node)
- [PostHog people and deletion documentation](https://posthog.com/docs/data/persons)
- [PostHog EU OpenAPI schema](https://eu.posthog.com/api/schema/)
- [PostHog EU Swagger UI](https://eu.posthog.com/api/schema/swagger-ui/)
- [Vercel `waitUntil` API](https://vercel.com/docs/functions/functions-api-reference/vercel-functions-package)
- [Vercel guidance on unfinished asynchronous Function work](https://vercel.com/kb/guide/troubleshooting-inconsistent-logs-in-vercel-functions)
- [Express on Vercel](https://vercel.com/docs/frameworks/backend/express)
