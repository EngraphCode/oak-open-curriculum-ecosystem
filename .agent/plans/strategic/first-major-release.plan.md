---
id: first-major-release
node_type: strategic
name: "First major release — Oak distribution-ready in AI assistants"
overview: "Make Oak's curricula discoverable and accessible to teachers inside the AI assistants they already use, released to early users through official one-click routes."
status: ratified
ratified_by: "Jim Cresswell"
ratified_date: 2026-07-23
ratified_where: "Planning-sitting part-2 ratification cards, 2026-07-23; decisions register D24 (serves edge) + D22 lift note"
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
last_updated: 2026-07-24
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

## Dated notes (decisions-register projections)

The full decisions register lives with the release project's working
docs in Linear; these dated notes project register-relevant events
onto this node — one line each, pointers never duplicates.

- 2026-07-23 — D11: the lesson-planning guidance placeholder deleted
  outright (owner comment on #486); the creation-oriented dormant set
  is three documents, not four; other prompt-era concepts preserved as
  pointer ticket MCP-124.
- 2026-07-23 — D18 (amended, owner word ~16:45): the canonical-address
  target widens to two options on the table — `www.thenational.academy/mcp`
  (main-domain front door; integrating into the main website adds
  substantial work) and `mcp.thenational.academy` (dedicated subdomain;
  DNS and zone-owner engagement only). Decision deferred to the
  zone-owner engagement; mint-not-move either way (the current host
  keeps serving); the content-negotiation triple proven live in
  production since v1.82.0 is domain-agnostic and serves either. The
  authoritative record is the MCP-122 ticket comment (2026-07-23).
- 2026-07-23 — Release-flow silent stall (new entry): a ruleset split
  dropped the semantic-release bot's bypass, GH013 blocked the
  version-bump push, and production sat on v1.81.3 silently while main
  advanced; the owner restored the bypass at 12:59. Standing cures
  landed: the release-process runbook (the first D23 runbook node) and
  the loud Slack failure alert (#497; alert channel corrected in #500).
- 2026-07-23 — D22: the frozen PostHog spike's preservation vehicle
  changed — PR #477 closed; the spike is preserved as annotated tag
  `mcp-63-posthog-spike-frozen` (dd8df27f8); MCP-63 carries the pointer.
- 2026-07-23 — MCP-67 and MCP-121 ratified at owner cards; the
  ratification stamps live in those plans themselves.
- 2026-07-23 — M1 COMPLETE: MCP-101 done (five PRs, every acceptance
  criterion proven) and the v1 live set finalised by the EEF flip
  (`get-eef-evidence` + `eef://interpretation` dormant, landed
  aa9f432bc).
- 2026-07-23 — MCP-128 ratified at owner card (Candidate B home-map
  shell; H1 "Oak, in your AI assistant"); the plan is canonical at
  e4e66dfcb.
- 2026-07-23 — The guidance-format owner gate discharged (six rulings
  adopted at owner cards); the authoritative record is the MCP-102
  ticket comment of 2026-07-23.
- 2026-07-24 — M1-note correction (MCP-141 scan; drift surfaced, never
  silently corrected): the 2026-07-23 "M1 COMPLETE" note above
  overstated — it correctly records MCP-101 done and the EEF flip, but
  M1's named state ("the served surface is final") does not hold while
  MCP-121 (guidance serving architecture, mapped to M1) is in flight
  and changes the served surface. The board (M1 in progress) is the
  truth; the note stands as written for what it dates, corrected here.
