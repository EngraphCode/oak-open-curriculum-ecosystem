---
id: codex-app-server-idle-wake
node_type: delivery
name: "Codex native idle wake — one seat, host driven"
overview: "Wake a Codex team seat from canonical comms through an atomic native Codex extension while it is idle, without another model seat or a perpetual model-side polling loop."
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
    clears_when: "Jim Cresswell records whether every same-UID event writer and controller is inside the accepted trust boundary or requires the event broker to run under a separate OS principal and sandbox"
    expires: 2026-08-03
  - awaiting: owner-decision
    clears_when: "Jim Cresswell records whether Oak may carry a pinned native Codex extension while an atomic and capability-scoped upstream API is unavailable"
    expires: 2026-08-03
last_updated: 2026-07-31
---

# Codex native idle wake — one seat, host driven

## Goal

A sole Codex team seat can become active when a relevant canonical comms event
arrives, absorb it, and respond without a user prompt, a manual foreground
poll, another Codex seat, or an indefinitely running model turn.

## Mechanism

Create the user-visible Codex seat under one local app-server from session
start and load a pinned native extension into that exact Codex process. Extend
the seat's root-identity canonical watcher with a private local control path to
the extension. A verified binding joins the exact Unix socket/server instance,
loaded `CodexThread`, coordination home, repository, checkout, and root
identity; discovery by recent thread ID or attachment through a second
app-server is forbidden.

The extension, not public `turn/start`, owns automatic wake. It resolves the
bound thread and uses Codex's native `try_start_turn_if_idle` reservation as the
atomicity seam. In 0.146.0 that seam rejects active, Plan, and internal pending
trigger work, but does not atomically prioritise a simultaneous external
TUI/app-server submission. The extension must add a user-priority submission
generation/barrier inside the same reservation transaction: if a user request
is queued concurrently, the wake aborts and remains pending before either its
input or settings can enter the user turn. A status read followed by
unconditional `turn/start` is forbidden; it has no expected-status precondition
and becomes same-turn steering when a regular turn wins the race. The existing
native method alone is therefore a basis, not sufficient proof.

The canonical collaboration-state watch engine preserves heartbeat,
validation, relevance, and gap-drain duties. It delivers each eligible event
to an injected durable sink and advances the root seen cursor only after that
sink accepts the exact event ID; Codex-specific dispatch reads only the durable
outbox. The first slice admits only directed-to-exact-root, non-heartbeat,
non-self traffic. Event authorship and route remain untrusted claims. Codex
0.146.0 transports both `turn/start.input` and additional context labelled
`untrusted` as user-role model input; delimiters preserve provenance but are not
an instruction-role or authority boundary. The native wake therefore receives
only a fixed controller-authored notification containing broker-minted
correlation, event ID, and digest—never the peer-authored body.

Content absorption uses two event-bound broker capabilities. `read_event`
revalidates the exact durable event and returns its body as untrusted,
ephemeral tool output; the body and model-authored wake content are excluded
from rollout persistence, thread history, compaction summaries, and every later
ordinary-turn context. Only broker-authored correlation and closed outcome
metadata may persist. Before returning content, the broker applies repository
data classification and redaction and proves that this content is authorised
for the configured model provider and retention policy. Model inference is an
explicit governed egress, not hidden beneath a claim of “no network.”

`acknowledge_event` accepts only the broker's opaque read receipt and a closed
status enum. Before dispatch, the controller persists a deterministic
acknowledgement event ID derived from the source event and root binding. The
broker creates one bounded canonical broadcast reply carrying only
`in_response_to`; event-declared author and route remain provenance claims and
cannot select a target. On an existing event ID, exact source ID, digest,
binding, and reply-body equality is required or the item is quarantined. The
model cannot select the destination, event ID, envelope, or free-form reply
body. If the pinned native extension cannot provide ephemeral tool-result
isolation, exact-event egress, and this crash-safe idempotency without generic
tools, the plan may prove `NOTIFY` only and must not claim `ABSORB` or
end-to-end completion.

A small deterministic state machine records `captured`, `pending`,
`dispatching`, `notified`, `absorbed`, `acknowledged`, `indeterminate`, and
terminal failure. The first vertical slice uses native atomic start-if-idle for
a fixed notification-only turn and queues every rejected or non-idle event. A
simultaneous TUI start must win without receiving wake input or wake settings.
Brokered read and acknowledgement follow only after their capability boundary
is proven. Later steering of an ordinary active turn is enabled only after
two-client races and app-server requests for approval, user input, elicitation,
time, and attestation have a proven user-facing route. The canonical event ID
is correlation, not server-side idempotency.

The automatic turn uses a mechanically enforced, non-sticky capability profile
with no shell, file mutation, model-selectable network tool, generic
MCP/dynamic tools, model-accessible external-write capability,
permission/policy changes, or persistent approvals. The only later exception
is the two exact-event broker capabilities above; the acknowledgement write is
rendered and routed by the broker, not by the model. Codex 0.146.0's existing
`try_start_turn_if_idle` uses the thread's default turn context, so the native
extension must also prove an atomic, turn-local capability/output profile that
cannot weaken or persist into the next user turn. Without that confinement the
viability gate fails. App-server requests use the version-generated closed
union: one connection-affine handler owns each supported variant, while
unknown or newly added variants interrupt the wake turn and mark the extension
incompatible.

On recovery, the host controller reconciles native wake correlation against
authoritative thread history before retrying and reconciles canonical reply
creation by deterministic acknowledgement event ID and exact read-back. Durable
capture is idempotent by source event ID; a repeated ID with a changed digest is
quarantined. An unresolved indeterminate wake or reply is quarantined rather
than blindly replayed. The guarantee is that no acknowledged event is lost and
no event is knowingly injected twice, not abstract exactly-once delivery across
independent stores.

Durable state contains the canonical event reference, digest, routing
metadata, correlation, dispatch state, and binding—not a second comms body.
Dispatch revalidates the digest against canonical storage. Closed-metadata
logs, bounded queues and per-source/global budgets, circuit breaking, and a
retirement tombstone constrain disclosure, spend, flooding, and resurrection.

The extension and host controller observe protocol status and completion
events, own one-seat lifecycle, an exclusive controller lease, and pinned
source/protocol/version checks. They continuously drain the transport,
reconcile after disconnect, and fail visibly when binding, atomic wake,
capability confinement, request routing, or state cannot satisfy the contract.
The existing child relay and active-turn polling procedures remain mutually
exclusive retrieval modes for unsupported harnesses; neither is an idle-wake
claim.

## Acceptance criteria (each with a proof — required)

- **A canonical event wakes an idle seat end to end.** One external directed
  event atomically starts one new turn without a user prompt or manual
  foreground poll. After the model reads that exact event through the bound
  broker, it presents the opaque receipt to `acknowledge_event`; the broker
  emits one fixed-schema, content-bearing broadcast acknowledgement with a
  deterministic event ID and `in_response_to` link to the source event.
  Proof: `repo-safe` — native-extension, state-machine, broker, and egress
  integration tests; `owner-held` — a live Plover canary recorded in canonical
  comms demonstrates `DELIVERY`, `NOTIFY`, and `ABSORB` independently.
- **The wake reaches the one intended user-visible session.** The TUI,
  app-server, native extension, and host controller share one verified Codex
  process/thread binding from session creation. A second server, guessed recent
  thread, stale binding, foreign controller, or retired thread is rejected.
  Proof: `repo-safe` — binding and mismatch tests; `owner-held` — a live canary
  shows the native automatic turn and response in the intended TUI.
- **Active and non-steerable states preserve every eligible event.** The first
  slice retains every event rejected by native start-if-idle and retries only
  after a later idle transition. A user-priority generation barrier shares the
  reservation transaction; if a TUI submission races, the wake aborts before
  either input or settings enter that user turn. Later active-turn steering is
  a separately proven transition; review, compaction, and other non-steerable
  states continue to queue. Status races and repeated delivery neither lose an
  acknowledged event nor inject one event into the model twice.
  Proof: `repo-safe` — exhaustive transition, both orderings of the
  simultaneous-TUI-start race, user-priority barrier, settings-isolation,
  ordering, and idempotency tests over idle, active, Plan, pending-trigger,
  review, compaction, reconnecting, and incompatible states.
- **A controller restart resumes the same seat without a blind gap.** The host
  persists pending work before advancing the canonical cursor, rebinds the
  exact native extension and live thread, rejects a stale or retired thread,
  drains unseen comms before waiting, and reconciles native wake and broker
  acknowledgement after a crash or upgrade.
  Proof: `repo-safe` — process-boundary integration tests with crash points
  before and after native wake acceptance and before and after canonical reply
  acknowledgement.
- **The control plane is local, bounded, and single-owner.** One native
  extension/controller pair owns a seat at a time; it uses a private runtime
  directory and a non-symlink, current-user-owned local Unix socket, validates
  every path component and the pinned process/thread/source/protocol versions,
  and takes an atomic exclusive lease. Client identity strings are not
  authentication; either every same-UID event writer/controller is explicitly
  trusted, or the event broker runs under a separate OS principal and sandbox.
  That boundary is owner-held. State is restrictive and untracked, routine logs
  are metadata-only, queues are bounded, and retry backs off.
  It stops on supervisor loss, thread closure, socket replacement, identity
  mismatch, or explicit retirement and cannot resurrect a retired seat.
  Incompatible protocol or malformed state fails visibly without claiming
  liveness.
  Proof: `repo-safe` — lock, filesystem-permission, lifecycle, compatibility,
  overload, malformed-payload, queue-bound, reconnect, and supervisor-death
  tests.
- **Interactive app-server requests retain a safe user-facing route.** An
  extension-created turn cannot silently approve, auto-answer, or strand
  command approval, file approval, user-input, MCP-elicitation, time, or
  attestation requests. The version-generated request union gives every
  variant exactly one connection-affine handler; an unknown variant, stale
  response, or unsupported route fails closed. Automated wake cannot grant
  session or policy amendments, and token refresh or attestation cannot
  traverse the event capability broker.
  Proof: `repo-safe` — generated-union exhaustiveness, connection/turn/request
  binding, replay, timeout, disconnect, stale-resolution, and no-auto-approval
  tests; `owner-held` — a reversible live approval canary is answered in the
  intended user-facing client.
- **Untrusted event text cannot exercise the seat's ambient capabilities.**
  Peer-authored body text never appears in `turn/start`, additional context, or
  another instruction-role item; the fixed wake notification contains only
  trusted correlation. The body reaches the model only as the result of the
  exact-event `read_event` capability. Raw broker output and model-authored wake
  content are ephemeral: neither may enter rollout persistence, thread history,
  compaction, or a later ordinary-turn context. Existing thread permissions
  cannot widen the automatic turn, which has no capability beyond bound read
  and fixed-schema acknowledgement, and its confinement cannot weaken or
  persist into the next user-authored turn. The one allowed external effect is
  the broker-rendered broadcast reply linked to the exact source event; no
  model-selected route or free-form egress exists. Model-provider inference is
  a separate allowed egress only for content whose classification, redaction,
  provider authorisation, and retention have passed.
  Proof: `repo-safe` — user-role exclusion, adversarial prompt,
  receipt-before-ack, non-persistence/compaction, later-turn exclusion,
  deterministic reply ID and collision read-back, output-schema,
  sticky-permission, ambient-tool-denial, provider-policy, redaction, and
  next-turn-restoration tests; `owner-held` — the live canary confirms no side
  effect beyond the constrained acknowledgement.
- **Evidence remains class-honest.** Watcher delivery, creation of a reasoning
  turn, and content absorption are reported separately; process health,
  cursor movement, or socket acknowledgement cannot be presented as higher
  liveness evidence.
  Proof: `repo-safe` — evidence-projection tests; `owner-held` — the live
  canary record names the event, wake path, turn, and threaded response.
- **A new Codex seat discovers the supported path automatically.** The
  canonical team-alert rule and its bounded generated `AGENTS.md` projection
  select the native wake path when supported and name the active-turn polling
  fallback when it is not.
  Proof: `repo-safe` — projection freshness, low-power discoverability, and
  built-CLI smoke tests.
- **Automated wake respects routing and authority boundaries.** Self-authored,
  heartbeat, merely observed, malformed, oversized, and otherwise ineligible
  traffic cannot create a turn. Eligible events retain author and route only as
  untrusted provenance alongside event ID and digest; neither claim selects
  acknowledgement egress. Only fixed correlation appears in the wake
  notification, and the acknowledgement is broadcast with `in_response_to`.
  Proof: `repo-safe` — routing-policy, provenance, non-targeting reply,
  user-role exclusion, injection, self-suppression, and bounded-payload tests.
- **State, spend, and retirement remain bounded.** Durable state minimises
  duplicated content, verifies event digests, uses restrictive permissions,
  and keeps secrets, user answers, auth refresh material, attestation, raw
  event bodies, and wake model output out of durable state, logs, telemetry,
  compaction, and later turns. Per-event, per-source, and global budgets plus a
  circuit breaker quarantine overload. A durable tombstone makes retirement
  irreversible across reconnect and supervisor restart.
  Proof: `repo-safe` — fake-secret/PII, data-classification, provider-retention,
  mutation, disk-failure, flood, overload, ephemeral-context, tombstone, and
  stale-process tests.

## Todos

- **A — bounded viability gate (round budget: at most two review rounds).**
  Against the pinned Codex source, load a native extension into the same process
  as the app-server and user-visible thread. Prove exact binding and native
  `try_start_turn_if_idle` reservation plus a same-transaction user-priority
  submission barrier, including both simultaneous TUI-start orderings that
  leave the wake queued with no input/settings leakage. Extend that seam with a
  non-sticky turn-local capability and closed-output profile; prove raw event
  text never enters user-role input or persistent/later-turn context,
  provider-authorised ephemeral broker read, deterministic crash-safe
  acknowledgement, restart reconciliation, stale/retired rejection, exclusive
  lease, crash boundary, connection-affine request routing, the ratified
  same-UID or separate-OS-principal trust boundary, privacy/retention, and
  irreversible retirement. Failure of any condition—or refusal of the
  pinned-extension owner gate—stops the build and records the unsupported
  capability instead of adding a second control path.
- **B — atomic notification vertical slice (round budget: at most two review
  rounds).** Add the native extension hook, directed-event policy, pure
  transition logic, metadata-only durable capture/outbox, exact process/thread
  binding, exclusive lease, quotas, bounded transport recovery, retirement
  tombstone, and a fixed correlation-only notification turn. All rejected and
  non-idle events remain queued. This slice may prove `NOTIFY`; it cannot claim
  `ABSORB` before Todo C.
- **C — brokered absorption and active-turn hardening (round budget: at most two
  review rounds).** Add exact-event `read_event` and `acknowledge_event`
  capabilities, ephemeral non-compacting read context, provider-policy checks,
  pre-persisted deterministic acknowledgement IDs, exact collision read-back,
  fixed-schema non-targeted canonical reply egress, and the full user-facing
  route for every supported app-server request class. Then separately prove
  expected-turn active steering; review, compaction, Plan, pending-trigger, and
  ambiguous states continue to queue.
- **D — live canary and discoverability (round budget: at most two review
  rounds).** Run external Plover canaries covering atomic idle notification,
  brokered absorption/acknowledgement, simultaneous TUI start, interactive
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
- An indefinite private Codex fork. Any pinned native extension needs an
  owner-approved upstream or retirement path before production rollout.
- Proving model answer quality; `ABSORB` proves engagement with the routed
  event, not correctness of the resulting work.
