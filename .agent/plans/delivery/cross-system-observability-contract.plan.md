---
id: cross-system-observability-contract
node_type: delivery
name: 'Cross-system observability: the correlation contract and the two-zone privacy model'
overview: 'Make investigation across the edge, deploy, error, and analytics systems a matter of following recorded keys — with privacy held by construction through a zone rule the capture layer enforces.'
status: sketch
serves: first-major-release
impact_areas:
  - analytics-and-observability
tickets:
  - MCP-504
depends_on: []
owner_gates: []
last_updated: 2026-08-05
---

# Cross-system observability contract

## Goal

An investigator — human or agent — moves between the four observability
systems by following recorded keys instead of doing archaeology: an
edge anomaly resolves to its error event, an error resolves to its
deployment, a release's health reads as one join. And privacy is held
by construction: the boundary between identity-bearing operational data
and pseudonymous product analytics is a stated contract with a test,
not a habit.

## Problem

Four systems observe the served product — the edge (requests, bots,
WAF, cache), the deploy platform (builds, deployments, function logs),
error tracking (exceptions, traces, uptime), and product analytics
(pseudonymous usage). Today their joins are accidental: some keys exist
but are not carried across boundaries, some systems are unreachable to
agent tooling, and the one identifier map lives in scattered reports. A
recent production investigation needed three systems and succeeded only
through archaeology.

The privacy posture has the mirror problem: product analytics is
deliberately pseudonymous (keyring-derived person ids, anonymised IPs),
but nothing *states* which keys may never cross into it. The protection
holds by vigilance; a well-meaning debugging convenience — one shared
request id — would silently create a join between pseudonyms and real
identities.

## Mechanism

### 1. The correlation contract (the centrepiece)

One short reference document defining the keys, their zones, and the
crossing rule:

| Key | Origin | Zone | May appear in |
| --- | --- | --- | --- |
| Edge request id (`cf-ray`) | edge | A | edge analytics, deploy logs, error-event tags |
| Application `correlation_id` | app | A | deploy logs, error-event tags |
| Trace id (OTel) | app | A | error tracking, deploy logs |
| Authenticated user id | auth layer | A | error tracking only |
| Release + commit SHA + environment | deploy | A + B | every system — the universal aggregate join |
| Client software identity (`clientInfo` name/version, client family) | MCP handshake | A + B | error tracking, product analytics |
| Pseudonymous person id | keyring | B | product analytics only |

**Zone rule**: Zone B (product analytics) never carries a Zone-A
per-request or per-person key — no request ids, no trace ids, no raw
user agents, no precise geolocation, no authenticated ids. Zone A ↔
Zone B joins happen on the A+B dimension rows only.

**The membrane**: mapping between authenticated identity and pseudonym
happens only through the keyring ceremony, as a deliberate, recorded
act under the privacy governance lane. The contract names this as the
single crossing; no system may hold both key kinds at rest.

### 2. Structural enforcement

A unit test on the product-analytics capture layer asserts, red-first,
that emitted event properties never include the forbidden key names or
value shapes (request-id patterns, trace-id patterns, raw user-agent
strings). The zone rule then fails a build instead of relying on
review vigilance.

### 3. The edge join

The application reads the edge request id from the inbound request and
attaches it as an error-event tag alongside the existing
`correlation_id`. One header read, one tag: edge anomalies become
traceable to exact error events and back.

### 4. The map

A single operations page — "observability surfaces" — listing each
system, what it holds, which zone it is in, its access route for
humans and for agent tooling, and where its identifiers are recorded.
Organisation-specific identifiers live on that page and the linked
ticket, not in this public plan.

### 5. Access for agent tooling

A read-only analytics credential scoped to the organisation's edge
account, so agent tooling can read edge request data at all (the
current credential sees only a personal account — the gap that blocked
the recent investigation). Owner-held provisioning act; recorded on the
map page.

### 6. Product-analytics instrumentation trio

- Capture client software identity (`clientInfo` name/version) on the
  initialize event — software identity, not personal data; the event's
  own description already promises it.
- Emit a transport-rejection analytics event under a constant
  service-level identity (rejections occur pre-session and pre-auth, so
  they are anonymous by construction); protocol-mismatch incidents
  become visible where usage lives.
- Re-type the protocol-version property to String in the analytics
  console (it is auto-typed as a date today), so version queries behave.

### Build-vs-buy

The vendors ship first-party cross-links: an error-tracker ↔ deploy
integration (in use, keep), edge log-push pipelines (not adopted — no
consumer yet; adopt when a query need names itself), and an
error-tracker ↔ product-analytics person-linking integration, which is
**deliberately rejected**: it would place person links in the
identity-bearing zone and bypass the membrane. The rejection is part of
the contract, recorded so the next reviewer meets a position rather
than a gap.

## Acceptance criteria

1. **The correlation contract exists and carries the key table, zone
   rule, and membrane.** Proof: repo-safe — the document in the PR
   diff; docs lint green.
2. **The capture-layer enforcement test exists and is red-first
   provable.** Proof: repo-safe — the test fails when a forbidden key
   is injected into a capture call, passes on the real capture surface.
3. **An error event carries the edge request id tag.** Proof:
   owner-held — one production error or test event observed with the
   tag, recorded on MCP-504.
4. **The observability-surfaces map page exists and names all four
   systems with zones, identifiers, and access routes.** Proof:
   repo-safe — page in diff; owner-held — the access routes verified
   usable once, recorded on MCP-504.
5. **Agent tooling can read edge analytics for the product zone.**
   Proof: owner-held — a scoped read succeeds; recorded on MCP-504.
6. **The instrumentation trio is live**: client identity present on new
   initialize events; a forced rejection produces the transport event;
   the version property queries as a string. Proof: owner-held —
   analytics console evidence recorded on MCP-504.

## Out of scope

- Any Zone-A per-request or per-person key entering product analytics —
  the contract's whole point.
- Any new identity linkage anywhere without a recorded
  privacy-governance decision (the membrane is the only door).
- Edge log-push, warehouse pipelines, and dashboards — deferred until a
  named consumer exists; the keys this plan lands are their
  prerequisite, not their substitute.
- Changing retention or IP-handling settings in any system.

## Todos

- [ ] T1: author the correlation contract + the capture-layer
      enforcement test (one PR — the contract and its teeth land
      together).
- [ ] T2: edge-request-id forwarding + error-event tag (one small app
      PR).
- [ ] T3: the observability-surfaces map page (one docs PR; identifiers
      from MCP-504).
- [ ] T4: instrumentation trio (rides the analytics SDK surface; one
      PR).
- [ ] T5 (owner-held): provision the scoped edge-analytics credential;
      re-type the version property; record both on MCP-504.

## Relationship to siblings

Composes with, and does not duplicate: the deployment-reliability
corpus (PR #746 — boot observability and production liveness are
error-tracker-side arms), the guard operating-knowledge node (PR #769),
and the privacy-governance lane (MCP-173), which owns the membrane's
ceremony and any future linkage decision.
