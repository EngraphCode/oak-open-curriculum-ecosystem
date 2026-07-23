---
id: first-major-release
node_type: strategic
name: "First major release — Oak distribution-ready in AI assistants"
overview: "Make Oak's curricula discoverable and accessible to teachers inside the AI assistants they already use, released to early users through official one-click routes."
status: sketch
ratified_by: null
ratified_date: null
ratified_where: null
serves: APP-1
impact_areas:
  - served-surface
  - guidance-content
  - auth-and-access
  - analytics-and-observability
  - conformance-and-standards
  - packaging-and-distribution
  - content-workspace
gate_expiry_default: P3D
depends_on: []
owner_gates: []
tickets: []
last_updated: 2026-07-23
---

# First major release — Oak distribution-ready in AI assistants

## Outcome

The Oak app is distribution-ready and live to early users: production
sign-in, safe self-observation of its own use, and published store
listings a teacher reaches in one click through official routes.
Explicitly **not** general availability — GA's bar (real teachers
demonstrably better supported, measured with Oak's research capability)
stays ahead of this release. Dates live on the Linear milestones, never
here.

## The bet

Teachers are already using AI assistants to help them teach. Putting
Oak into that context — the app's high-quality, fully sequenced and
fully resourced curricula, discoverable and accessible where the work
already happens — will improve outcome quality and reduce work.
Shipping enables the meeting; vendor collaboration benefits shipping.

The app presents; it never creates. There is no AI in the app in this
release — a statement of current scope, not a permanent invariant:
generative capability is expected in later releases, and crossing that
line is a deliberate, ratified decision, never a drift (the allowlist
keeps creation-oriented content dormant so enabling it is always an
explicit act).

The app complements Oak's other surfaces: it signposts the main
website for canonical resource access and the curated creation
experience for generative use cases, and they signpost the app where
teacher work is already happening.

## Success looks like

A live listing reached in one click from a shared link; early users
signing in through the invite gate; usage visible under the ratified
privacy posture (no teacher-level identity, no captured content);
the expert-authored guidance served to assistants and signed off; and
two-way signposting with Oak's web surfaces working.

## Delivery

Delivery plans serving this node declare `serves: first-major-release`
— enumerate them by search, never by a hand-kept list. Milestones are
named observable states of the product, held in Linear with tickets
mapped; this node and those milestones are kept aligned by a roughly
daily lead-AI check, drift surfaced rather than silently corrected.

## Tempo

`gate_expiry_default: P3D` — during this release, no owner-gate waits
silently longer than three days.
