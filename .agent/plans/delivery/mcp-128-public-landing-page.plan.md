---
id: mcp-128-public-landing-page
node_type: delivery
name: "Public landing page at production values: Oak-family design, phased messaging"
overview: "Raise the app's landing page to main-domain production values — composed from the in-repo design system, Oak editorial voice, and a phase-modelled message (limited internal testing → coming soon → live) flipped by one reviewed edit."
status: ratified
ratified_by: Jim Cresswell
ratified_date: 2026-07-23
ratified_where: "owner card 2026-07-23, answered via the Director's card relay (Forge 398e24)"
serves: first-major-release
impact_areas:
  - served-surface
  - packaging-and-distribution
tickets:
  - MCP-128
depends_on: []
owner_gates: []
last_updated: 2026-07-23
---

# Public landing page at production values

## Goal

A visitor who reaches the app's page — by pasted protocol URL, shared
link, or curiosity once it serves under Oak's main domain — understands
in seconds what this is, that it is currently in limited internal
testing, that the app is coming soon, and where to go meanwhile; and
the page looks and reads unmistakably Oak. The page is the app's first
public statement of existence on Oak's front door, so it carries
main-website production values: the same design family, the same
editorial voice, the same accessibility bar.

## Mechanism

**One page, three phases, one reviewed switch.** The page does three
jobs across the release arc — orienting internal testers today,
declaring "coming soon" to the public once it serves under the main
domain, and acting as the live front door at release. Rather than three
pages or ad-hoc edits, the message block is phase-modelled, and the
phase lives at a single declarative point alongside the served-surface
definition: flipping phase is one reviewed edit and a rebuild, the same
posture as everything else the app serves. Copy for all three phases is
authored and reviewed together, so each later flip changes no unreviewed
words.

**Design by family membership, not imitation.** The page composes
exclusively from the in-repo design system (ADR-213 — the estate's
design source of truth, built to make anything feel unmistakably Oak):
tokens and the class library, local Lexend, no ad-hoc styles. Matching
the main website means belonging to the same family, which the system
exists to guarantee.

**The design session settled the gaps (pre-ratification, 2026-07-23).**
The gap-check against the shipped system CSS found zero blocking gaps —
hero, prose rhythm, CTA cluster, and the coming-soon pattern are all
covered by existing classes. The footer is a near-gap ratified as
compose-for-now: it composes acceptably from `oak-band`, `oak-cluster`,
`oak-link`, and `oak-body-4`, and a system footer pattern is proposed
via the design-sync runbook only if the estate grows more public pages.
Evidence and candidate rationale:
`.agent/reports/mcp-128-landing-pre-ratification-2026-07-23.md`, with
both candidate compositions rendered on the repo-synced design surface
(the canonical studio project — preference option 1; the design-sync
runbook governs: repo → session → reviewed PR, never a wholesale
replace).

**Ratified composition: Candidate B, the home-map shell.** The page
uses the full `[data-page='home']` region map — band hero, three-card
featured row, phase-notice content block, signposting context, and a
band CTA region — carrying main-domain production values the way this
plan intends. Design iteration inside the build phase is expected; it
stays within the ratified composition and the class library.

**Content set** (owner-named, 2026-07-23): the limited-internal-testing
notice; the app-coming-soon statement; one Oak-voiced sentence linking
to the canonical what-is-MCP explainer; two-way signposting to the main
website and the curated creation experience per the
complements-not-competes posture. The ratified H1 is "Oak, in your AI
assistant". Editorial voice per
`editorial-tone.md` (human, largely non-technical audience). Sensitivity
by construction: the public page carries no cohort detail, no timing
rationale, no stage-ladder dates — "limited internal testing" and
"coming soon" are the entire temporal vocabulary.

## Acceptance criteria (each with a proof)

1. **Family membership is mechanical.** The page styles resolve
   exclusively through design-system tokens and classes — no ad-hoc
   colours, fonts, or spacing. Proof (`repo-safe`): the design-system
   consistency validators pass over the page's styles; review asserts
   no out-of-system values; the fidelity-review disposition register
   records the design-output comparison.
2. **Accessibility at the system's bar.** WCAG 2.2 AA held: contrast
   audit green across themes, keyboard and structure reviewed. Proof
   (`repo-safe`): contrast integration tests; accessibility-expert
   review recorded on the PR.
3. **Three-phase copy, one switch.** All three phases' copy authored
   and reviewed together; the phase constant sits at one declarative
   point; flipping it is a one-line reviewed change proven by test
   (each phase renders its own message block, no unreviewed words in
   any phase). Proof (`repo-safe`).
4. **Voice and sensitivity signed off.** Editorial-tone conformance and
   the sensitivity boundary (no cohort/timing detail) reviewed; the
   owner's glance on the final copy of ALL phases recorded before the
   www phase can ever be flipped. Proof (`repo-safe` for the review
   trail; `owner-held` for the copy glance).
5. **The design session left no residue.** Session output landed via
   the design-sync runbook as a reviewed PR; if a session-scoped
   working copy was used, its deletion is recorded in the PR trail.
   Proof (`repo-safe`; `owner-held` glance on the design output).

## Todos

- Sliced at pickup by the implementer, each slice a single-story PR
  within its round budget (PDR-132).

## Out of scope

- The www edge flip itself: the canonical-address lane's layer (b) —
  this page GATES that flip (the coming-soon phase must be live-ready
  first) but does not perform it.
- The release-phase install CTA content beyond its reviewed copy: the
  flip to "live" happens at release, as its own reviewed edit.
- Any change to the main website or its repositories.
- Design-system extensions beyond what the page needs: gaps found in
  the session land as system components via the runbook, scoped
  minimally.
