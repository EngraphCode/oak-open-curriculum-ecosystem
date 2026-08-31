---
id: upstream-curriculum-data-exposure
node_type: delivery
name: "Upstream curriculum data exposure requests"
overview: >-
  File evidence-grounded requests for Oak to publish curriculum
  structure it already holds: thread unit order, unit connections, and
  cross-subject links.
status: sketch
ratified_by: null
ratified_date: null
ratified_where: null
serves: honest-curriculum-structure
impact_areas:
  - served-surface
tickets: []
depends_on: []
owner_gates: []
last_updated: 2026-08-31
---

# Upstream curriculum data exposure requests

## Goal

Oak's maintainers have well-evidenced, actionable requests to publish
three pieces of curriculum structure their database already holds but
does not reach the surfaces this estate consumes, and this estate has
a recorded outcome either way. Established first-hand (2026-08-31,
oaknational/oak-openapi and oaknational/database-tools checkouts):
`thread_units.order` — served today by the per-thread API endpoint
(`GET /threads/{threadSlug}/units` returns units in thread order with
`unitOrder`) but absent from the bulk sequence export, whose
`threads[].order` carries the thread display index
(`programme_threads.order`) instead — this request seeks bulk-export
parity with the existing endpoint, never new data; the unit
connections — `connection_prior_unit_id`, `connection_future_unit_id`
and their descriptions, materialized for the API in
`mv_openapi_unit_curriculum_content` yet queried by no API code path
and absent from every served surface; and `cross_subject_links`. These are the genuine
prerequisite-direction and thread-order data whose absence forces the
served surface to stay modest; exposure upstream is the honest route to
richer structure — never local inference.

## User groups and value

Directly, Oak's API maintainers receive precise, evidence-cited
requests instead of vague asks. The end value routes through the
strategic node: if exposed, the data enables true thread-order and
unit-connection views for teachers and assistants; if declined, the
service's documented claim boundaries stand as the honest maximum.

## Mechanism

One issue per dataset on `oaknational/oak-openapi`, each citing the
first-hand evidence paths (the sequence view SQL that drops
`thread_units.order`; the materialized view definition and the absence
of any consuming query; the bulk schema's closed shape), written as
exposure requests against data Oak already materializes — never as
schema loosening. The consumption contingency stays prose in this plan
until data exists (no speculative code shapes). A gate records a
current wait, so none is held before the wait exists: at the moment
the issues are filed, this plan gains a dated `external-input` owner
gate whose absolute expiry is set three weeks from the filing date,
after which the outcome (renew, consume, or record-and-close) is
decided on what actually happened.

## Acceptance criteria (each with a proof — required)

1. Three issues filed on `oaknational/oak-openapi`, each citing
   file-level evidence from the oak-openapi and database-tools
   repositories and naming the bulk/API surface change requested.
   Proof: `owner-held` — issue URLs recorded in this plan's dated
   completion note; the owner can verify on GitHub.
2. Each issue states the consuming intent honestly (which true views it
   would enable) without committing Oak to anything. Proof:
   `repo-safe` — issue drafts reviewed in-repo before posting.
3. The outcome at gate expiry is recorded (accepted / declined / no
   response) with the follow-on disposition. Proof: `owner-held` — the
   issue states live on GitHub, so the owner verifies them there; the
   dated note in this plan records the verified outcome at archival.

## Todos

Draft the three issues in-repo for review; file them; record URLs and
add the dated external-input gate (expiry three weeks from filing);
hold the gate.

## Out of scope

- Any code consuming the requested data before it is published
  (verify-data-supports-shape-before-building).
- Any request that loosens the published schema's strictness — the
  requests add exposure, never optionality.
- Bug reports about the fabricated-edge defect itself — that is this
  estate's own defect, cured by `prerequisite-claim-removal`, not an
  upstream issue.
