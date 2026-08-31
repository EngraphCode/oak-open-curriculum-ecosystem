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
owner_gates:
  - awaiting: external-input
    clears_when: >-
      oaknational/oak-openapi maintainers respond to the filed exposure
      requests (accept, decline, or counter-propose)
    expires: 2026-09-21
last_updated: 2026-08-31
---

# Upstream curriculum data exposure requests

## Goal

Oak's maintainers have well-evidenced, actionable requests to publish
three pieces of curriculum structure their database already holds but
the open API does not serve, and this estate has a recorded outcome
either way. Established first-hand (2026-08-31, oaknational/oak-openapi
and oaknational/database-tools checkouts): `thread_units.order` — a
unit-within-thread order column the published sequence view drops (it
serves `programme_threads.order`, the thread display index, instead);
the unit connections — `connection_prior_unit_id`,
`connection_future_unit_id` and their descriptions, materialized for
the API in `mv_openapi_unit_curriculum_content` yet queried by no API
code path; and `cross_subject_links`. These are the genuine
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
until data exists (no speculative code shapes): the owner gate above
holds the follow-up honestly, with an absolute expiry, after which the
outcome (renew, consume, or record-and-close) is decided on what
actually happened.

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
   response) with the follow-on disposition. Proof: `repo-safe` — the
   dated note in this plan at archival.

## Todos

Draft the three issues in-repo for review; file them; record URLs;
hold the gate.

## Out of scope

- Any code consuming the requested data before it is published
  (verify-data-supports-shape-before-building).
- Any request that loosens the published schema's strictness — the
  requests add exposure, never optionality.
- Bug reports about the fabricated-edge defect itself — that is this
  estate's own defect, cured by `prerequisite-claim-removal`, not an
  upstream issue.
