# MCP-128 pre-ratification: gap-check, three-phase copy, design candidates

Deliverables for the MCP-128 landing-page ratification card (plan on PR
#491, `status: sketch` — this report informs the stamp, it does not
pre-empt it). Routed by the Director on the owner's word, 2026-07-23;
authored by agent Heron lifts Summit (d3c364). Nothing here lands to the
production page.

## 1. Gap-check: does the class library cover a marketing page?

Ground truth read first-hand:
`packages/design/oak-design-system/components.css` (1280 lines) and
`colors_and_type.css` (812 lines), plus `.design-sync/conventions.md`.

| Primitive | Verdict | Evidence |
| --- | --- | --- |
| Hero | **Covered** | The region contract ships a `hero` region slot with page-type maps (`[data-page='home']`: hero/featured/content/context/cta — components.css §Composition); `oak-band` is documented in-file as "mint band (thenational.academy hero grammar)" (components.css:38); display type via `oak-heading-light-1`/`oak-heading-1` |
| Prose rhythm | **Covered** | `oak-prose` (measure cap, components.css:113), `oak-scope` typographic defaults, `oak-flow`, the body scale |
| CTA cluster | **Covered** | `oak-cluster` (+ `--s`/`--l`) with `oak-btn`/`--secondary`/`--inverted`; a named `cta` region in every shipped page map |
| Coming-soon pattern | **Covered by composition** | `oak-card--lemon` + `oak-tag--mint` (the conventions seed demonstrates exactly this) or `oak-banner--info`; no dedicated primitive needed — a phase notice is a composition, not a component |
| Footer | **Near-gap, acceptable** | The canvas ships a `footer` region slot (components.css:1214) but no footer *content* classes (nav/legal/logo grammar). For one page this composes acceptably from `oak-band` + `oak-cluster` + `oak-link` + `oak-body-4`. If the estate grows more public pages, a footer pattern is the first minimal system addition to propose via the design-sync runbook — not needed for MCP-128 |

**Verdict: zero blocking gaps; no design-system additions required for
this page.** The current production landing page uses ad-hoc classes
(`wrap`/`hero`/`card` in
`apps/oak-curriculum-mcp-streamable-http/src/landing-page/`) — exactly
the family-membership gap the plan's AC1 closes.

## 2. Three-phase copy drafts (for the owner's glance at the sitting)

Voice per `editorial-tone.md` (teacher-facing register: you-led,
contractions, British English, CTA verbs). Sensitivity by construction:
"limited internal testing" and "coming soon" are the entire temporal
vocabulary — no cohort detail, no timing rationale, no dates.

### Shared (all phases)

- **H1 options** (owner's pick): (a) "Oak, in your AI assistant";
  (b) "Teach with Oak, right where you plan".
- **Hero body**: "Bring Oak's free, fully sequenced curriculum into the
  assistant you already use — thousands of lessons, units and
  resources, searchable as you plan."
- **What-is-MCP sentence** (canonical explainer link): "It works
  through MCP, an open standard that lets your assistant connect to
  trusted sources — [see how MCP works](https://modelcontextprotocol.io)."
- **Signposting (complements-not-competes, two-way)**: "Every lesson is
  free to browse and download at
  [thenational.academy](https://www.thenational.academy)." · "Want to
  create and adapt lessons with AI? Try
  [Aila, our lesson assistant](https://labs.thenational.academy)."

### Phase 1 — limited internal testing (serves today)

> **Limited internal testing** — We're testing the Oak app with a small
> group before wider release. If you're taking part, connect your
> assistant below.

(Connection instructions remain visible in this phase only.)

### Phase 2 — coming soon (serves once public under the main domain)

> **Coming soon** — The Oak app is coming soon to AI assistants. You
> don't need to wait to use Oak: every lesson is free on our website
> today.

### Phase 3 — live (the release front door)

> **Connect Oak to your assistant** (primary button) — Free for every
> teacher. Sign-in is currently by invitation.

("By invitation" is the D7-consistent public phrasing; no cohort or
schedule detail.)

## 3. Design candidates (composed from the class library only)

Both candidates are static previews in
`.agent/reports/mcp-128-landing-candidates/` and pushed to the
Claude Design project "Oak Open Curriculum Design System — repo-synced"
under `explorations/mcp-128-landing/` so they render with the real
bundle in the Design System pane. Every class used exists in the
shipped CSS (verified against the full class inventory); no ad-hoc
styles beyond two `align-items` utilities noted for the build phase.

- **Candidate A — band hero** (`candidate-a-band-hero.html`): the
  minimal shape — canvas shell, mint-band hero (the main site's hero
  grammar), a single content column with the phase notice, signposting
  context, band footer. Closest in spirit to today's page; smallest
  build. Shows all three phase blocks stacked for review.
- **Candidate B — home-map shell** (`candidate-b-home-shell.html`): the
  full `[data-page='home']` region map — tag-in-hero phase marker, a
  three-card "what you can do" featured row (search-as-you-plan /
  progression / trust-the-source), phase notice, signposting, and a
  band CTA region. Reads most like a main-site production page; more
  copy to review and maintain.

**Recommendation** (for the card, not pre-empting it): Candidate B for
the public phases — it carries main-domain production values the way
the plan intends — with A as the acceptable minimal fallback if the
sitting prefers less surface. Either way the phase model, copy set, and
class-only styling are identical; the choice is composition scope.

## Open items for the ratification card

1. H1 choice (two options above).
2. Candidate A vs B (recommendation: B).
3. The footer near-gap disposition (compose-for-now recorded here; a
   system footer pattern only if more public pages come).
4. Reviewer passes staged for build phase: design-system-expert +
   accessibility-expert on the chosen candidate (contrast across all
   four themes; keyboard/skip-link), prose-expert on the final copy —
   per the plan's AC2/AC4.
