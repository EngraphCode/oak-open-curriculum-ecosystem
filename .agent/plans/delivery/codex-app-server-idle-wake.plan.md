---
id: codex-app-server-idle-wake
node_type: delivery
name: "Codex app-server idle wake — one seat, host driven"
overview: "Wake a Codex team seat from canonical comms while it is idle, without relying on another model seat or a perpetual model-side polling loop."
status: sketch
ratified_by: null
ratified_date: null
ratified_where: null
serves: first-major-release
impact_areas:
  - practice-and-estate
tickets: []
depends_on: []
owner_gates:
  - awaiting: owner-decision
    clears_when: "Jim Cresswell records whether same-UID local processes are inside the accepted trust boundary or requires a capability-broker boundary"
    expires: 2026-08-03
last_updated: 2026-07-31
---

# Codex app-server idle wake — one seat, host driven

## Goal

A sole Codex team seat can become active when a relevant canonical comms event
arrives, absorb it, and respond without a user prompt, a manual foreground
poll, another Codex seat, or an indefinitely running model turn.

## Mechanism

Create the Codex seat and its bridge as co-clients of one local app-server from
session start, then extend the seat's root-identity canonical watcher with the
bridge. A verified binding joins the exact Unix socket/server instance, loaded
user-visible thread, coordination home, repository, checkout, and root
identity; discovery by recent thread ID or attachment through a second
app-server is forbidden.

The canonical collaboration-state watch engine preserves heartbeat,
validation, relevance, and gap-drain duties. It delivers each eligible event
to an injected durable sink and advances the root seen cursor only after that
sink accepts the exact event ID; Codex-specific dispatch reads only the durable
outbox. The first slice admits only directed-to-exact-root, non-heartbeat,
non-self traffic. Event authorship and route remain untrusted claims. A typed
coordination envelope keeps those fields and the separately delimited body out
of system/developer instructions and never promotes peer text to owner or user
authority.

A small deterministic state machine records `captured`, `pending`,
`dispatching`, `accepted`, `absorbed`, `indeterminate`, and terminal failure.
The first vertical slice starts a constrained acknowledgement turn only from
authoritative idle state and queues all non-idle traffic. Later steering of an
ordinary active turn is enabled only after two-client races and app-server
requests for approval, user input, elicitation, time, and attestation have a
proven user-facing route. The canonical event ID becomes correlation echoed in
the model-visible message; it is not treated as server-side idempotency.

The acknowledgement turn uses a mechanically enforced, non-sticky capability
profile with no shell, file mutation, network, MCP/dynamic tools, external
writes, permission/policy changes, or persistent approvals. If the pinned
Codex version cannot confine one wake turn without weakening or persistently
changing the user's thread, the viability gate fails. App-server requests use
the version-generated closed union: one connection-affine handler owns each
supported variant, while unknown or newly added variants interrupt the wake
turn and mark the bridge incompatible.

On recovery, the bridge reconciles that correlation against authoritative
thread history before retrying and quarantines an unresolved indeterminate
send rather than blindly replaying it. The guarantee is that no acknowledged
event is lost and no event is knowingly injected twice, not abstract
exactly-once delivery across independent stores.

Durable state contains the canonical event reference, digest, routing
metadata, correlation, dispatch state, and binding—not a second comms body.
Dispatch revalidates the digest against canonical storage. Closed-metadata
logs, bounded queues and per-source/global budgets, circuit breaking, and a
retirement tombstone constrain disclosure, spend, flooding, and resurrection.

The bridge observes protocol status and completion events, owns one-seat
lifecycle, an exclusive controller lease, and a pinned protocol/version check.
It continuously drains the transport, reconciles after disconnect, and fails
visibly when binding, protocol, request routing, or state cannot satisfy the
contract. The existing child relay and active-turn polling procedures remain
mutually exclusive retrieval modes for unsupported harnesses; neither is an
idle-wake claim.

## Acceptance criteria (each with a proof — required)

- **A canonical event wakes an idle seat end to end.** After the target thread
  is observably idle, one external directed event starts one new turn without
  a user prompt or manual foreground poll, and the turn produces a
  content-bearing threaded response tied to that event.
  Proof: `repo-safe` — protocol/state-machine integration test with a scripted
  app-server; `owner-held` — a live Plover canary recorded in canonical comms
  demonstrates `DELIVERY`, `NOTIFY`, and `ABSORB` independently.
- **The wake reaches the one intended user-visible session.** The TUI and
  bridge share one verified app-server instance from session creation, the
  target thread is loaded and bound to the exact root/repository/checkout, and
  a second server, guessed recent thread, stale binding, or retired thread is
  rejected.
  Proof: `repo-safe` — binding and mismatch tests; `owner-held` — a co-client
  live canary shows the injected event and response in the intended TUI.
- **Active and non-steerable states preserve every eligible event.** An
  active ordinary turn receives steerable input, while review, compaction, and
  other non-steerable states retain the event and start one turn after idle;
  status races and repeated delivery neither lose an acknowledged event nor
  inject one event into the model twice.
  Proof: `repo-safe` — exhaustive transition, race, ordering, and idempotency
  tests over idle, active-steerable, active-non-steerable, reconnecting, and
  incompatible states.
- **A bridge restart resumes the same seat without a blind gap.** The bridge
  persists pending work before advancing the canonical cursor, resumes the
  exact live thread, rejects a stale or retired thread, drains unseen comms
  before waiting, and reconciles app-server acknowledgement after a crash or
  upgrade.
  Proof: `repo-safe` — process-boundary integration tests with crash points
  before and after app-server acknowledgement and before and after comms
  acknowledgement.
- **The control plane is local, bounded, and single-owner.** One bridge owns a
  seat at a time; it uses a private runtime directory and a non-symlink,
  current-user-owned local Unix socket, validates every path component and the
  pinned server instance/protocol/version, and takes an atomic exclusive lease.
  Client identity strings are not authentication; the accepted same-UID trust
  boundary is explicitly owner-held. State is restrictive and untracked,
  routine logs are metadata-only, queues are bounded, and retry backs off.
  It stops on supervisor loss, thread closure, socket replacement, identity
  mismatch, or explicit retirement and cannot resurrect a retired seat.
  Incompatible protocol or malformed state fails visibly without claiming
  liveness.
  Proof: `repo-safe` — lock, filesystem-permission, lifecycle, compatibility,
  overload, malformed-payload, queue-bound, reconnect, and supervisor-death
  tests.
- **Interactive app-server requests retain a safe user-facing route.** A
  bridge-created turn cannot silently approve, auto-answer, or strand command
  approval, file approval, user-input, MCP-elicitation, time, or attestation
  requests. The version-generated request union gives every variant exactly
  one connection-affine handler; an unknown variant, stale response, or
  unsupported route fails closed. Automated wake cannot grant session or
  policy amendments, and token refresh or attestation cannot traverse a
  generic approval broker.
  Proof: `repo-safe` — generated-union exhaustiveness, connection/turn/request
  binding, replay, timeout, disconnect, stale-resolution, and no-auto-approval
  tests; `owner-held` — a reversible live approval canary is answered in the
  intended user-facing client.
- **Untrusted event text cannot exercise the seat's capabilities.** The wake
  turn has a mechanically enforced, non-sticky no-side-effect capability
  profile, and typed framing keeps event fields and body out of instruction
  roles. Existing thread permissions cannot widen the wake turn, and wake
  confinement cannot weaken or persist into the next user-authored turn.
  Proof: `repo-safe` — adversarial prompt, sticky-permission, tool-denial, and
  next-turn-restoration tests; `owner-held` — the live canary confirms no tool
  request or external side effect.
- **Evidence remains class-honest.** Watcher delivery, creation of a reasoning
  turn, and content absorption are reported separately; process health,
  cursor movement, or socket acknowledgement cannot be presented as higher
  liveness evidence.
  Proof: `repo-safe` — evidence-projection tests; `owner-held` — the live
  canary record names the event, wake path, turn, and threaded response.
- **A new Codex seat discovers the supported path automatically.** The
  canonical team-alert rule and its bounded generated `AGENTS.md` projection
  select the bridge when supported and name the active-turn polling fallback
  when it is not.
  Proof: `repo-safe` — projection freshness, low-power discoverability, and
  built-CLI smoke tests.
- **Automated wake respects routing and authority boundaries.** Self-authored,
  heartbeat, merely observed, malformed, oversized, and otherwise ineligible
  traffic cannot create a turn; eligible messages retain their author, route,
  event ID, and untrusted-message framing.
  Proof: `repo-safe` — routing-policy, provenance, injection, self-suppression,
  and bounded-payload tests.
- **State, spend, and retirement remain bounded.** Durable state minimises
  duplicated content, verifies event digests, uses restrictive permissions,
  and keeps secrets, user answers, auth refresh material, and attestation out
  of logs and telemetry. Per-event, per-source, and global budgets plus a
  circuit breaker quarantine overload. A durable tombstone makes retirement
  irreversible across reconnect and supervisor restart.
  Proof: `repo-safe` — fake-secret/PII, mutation, disk-failure, flood,
  overload, retention, tombstone, and stale-process tests.

## Todos

- **A — bounded viability gate (round budget: at most two review rounds).**
  Against the pinned installed Codex version, create the TUI and bridge through
  one app-server; prove the exact binding, idle start, authoritative history
  correlation, restart reconciliation, stale/retired rejection, exclusive
  lease, and crash boundary. Also prove non-sticky no-side-effect wake
  confinement, exhaustive connection-affine request routing, the ratified
  local-process trust boundary, privacy/retention, and irreversible retirement.
  Failure of any condition stops the build and records the unsupported
  capability instead of adding a second control path.
- **B — idle-wake vertical slice (round budget: at most two review rounds).**
  Add generated protocol bindings, directed-event policy, pure transition
  logic, typed untrusted framing, metadata-only durable capture/outbox, one
  serial dispatcher, same-server/thread binding, exclusive lease, quotas,
  bounded transport recovery, retirement tombstone, and a capability-confined
  acknowledgement-only idle start. All non-idle events remain queued.
- **C — interactive and active-turn hardening (round budget: at most two review
  rounds).** Prove the user-facing route for every supported app-server request
  class and the two-client mutation boundary, then add ordinary-turn steering;
  review, compaction, and ambiguous states continue to queue until idle.
- **D — live canary and discoverability (round budget: at most two review
  rounds).** Run external Plover canaries covering idle wake, interactive
  request routing with reversible non-persistent decisions, active ordinary
  steering, fake-secret containment, retirement, and restart recovery; update
  the canonical operating rule and generated bootstrap, and retain an explicit
  degraded path for unsupported harnesses.

## Out of scope

- The MCP-456 capability ledger, schema, and cross-harness probe packs; this
  plan consumes capability evidence but does not own observability.
- A generic background-agent framework or multi-seat abstraction; the first
  consumer is one Codex seat and generalisation waits for a second consumer.
- Perpetual goals, token-consuming keepalive turns, or model-authored polling;
  the host owns wake scheduling.
- Experimental sleep and automatic-continuation tools; reconsider them only if
  the direct app-server viability gate fails.
- Remote TCP or WebSocket control, shared sockets, and cross-machine routing;
  the first control plane is local Unix-socket only.
- Proving model answer quality; `ABSORB` proves engagement with the routed
  event, not correctness of the resulting work.
