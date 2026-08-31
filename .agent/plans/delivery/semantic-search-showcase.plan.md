---
id: semantic-search-showcase
node_type: delivery
name: Semantic-search showcase
overview: >-
  Build the Innovation Kit's first proposition: a discovery-to-resource semantic-search
  showcase that reveals the search capability honestly and produces the Kit's first
  gap-and-seam register.
status: sketch
ratified_by: null
ratified_date: null
ratified_where: null
serves: innovation-kit
impact_areas:
  - innovation-kit
tickets: []
depends_on:
  - plan: innovation-kit-capability-architecture-definition
    kind: beneficial
owner_gates:
  - awaiting: owner-decision
    clears_when: >-
      The owner reviews this plan shape and the Stage-0 composition declaration (proposition,
      claim boundary, activated and omitted capabilities, decision-budget seed) and says build.
    expires: 2026-09-21
last_updated: 2026-08-31
---

# Semantic-search showcase

## Authority anchors

The owner selected this direction on 2026-08-31 (session `Dahlia tracks Blossom`), verbatim:
"Semantic search, making use of what we have where appropriate and changing what we should
change. The goal is not to prove we need the Innovation Kit, that is the settled, the goal is
to build the best and most useful Innovation Kit." Same session, two shaping rulings: search
results primarily have discovery value, so the demo links out to equivalent teacher-journey or
curriculum pages on `www.thenational.academy` rather than growing into a curriculum app; and
planning must determine what resources are needed, what the Kit provides, where the gaps are,
and what seams those gaps reveal. The Kit's necessity is settled — the
[definition corpus](../../research/innovation-kit/definition/README.md)'s instruments
(composition declaration, decision budget, placement rule) apply here as build discipline, not
as a verdict gate on the Kit itself. The owner gate's expiry derives from the governing
strategic node's `gate_expiry_default` (P21D from authoring).

## Goal

Two outcomes, both first-class. (1) Oak's deepest capability becomes honestly legible: a
teacher-recognisable discovery loop — intent, meaningful results with provenance and relevance
legibility, hand-off to the real resource on `www.thenational.academy` — that reveals the
depth, behaviour and limits of search by meaning, including its zero-hit, degraded and
limit states. (2) The Kit grows through a real consumer: the build produces the estate's first
decision-budget record and a gap-and-seam register naming what the proposition needed, what
the Kit provided, what was missing, and which seams the gaps reveal.

## Mechanism

The showcase is an independently scoped peer demo at the `demos/` tier, built through the
Kit's declared path: a Stage-0 composition declaration (proposition, audience, claim boundary,
activation facts, capability states) precedes the build; every creator decision lands in the
decision budget, distinguishing proposition-shaped from machinery-shaped decisions; recurring
machinery-shaped burden is the seam-correction signal and routes to the Kit-placement inquiry
rather than being absorbed locally. The demo consumes public capability surfaces only —
`@oaknational/oak-search-sdk/read`, `@oaknational/curriculum-sdk`, the generated Oak URL
helpers, and the Oak Design System — so any private import it turns out to need is itself a
gap finding. Estate defaults (demos tier, Next.js, the hub's live-stack wiring precedents)
enter the decision budget as reopenable defaults-from-precedent, not baked assumptions.
Link-out is the structural guard against curriculum-app drift: the resource destination is
always the equivalent `www.thenational.academy` page.

## First-pass determination: resources, Kit provision, gaps, seams

The owner's ruling places this determination at planning time. This table is the first pass —
dated 2026-08-31, grounded in the
[current-estate evidence](../../research/innovation-kit/evidence/current-estate-2026-08-30.md)
and first-hand reads of the generated URL helpers, search SDK surfaces and demo tier — and it
shapes the slices below. The build-time register (criterion 6) verifies and extends it; it
does not replace it.

| Resource the proposition needs | Kit/estate provides today | Gap | Seam the gap reveals |
| --- | --- | --- | --- |
| Hybrid retrieval: lessons, units, threads, sequences, suggest, facets | `oak-search-sdk/read` — demonstrated, typed capability surface (ADR-134) | None for retrieval itself | Capability-surface pattern is the reusable seam; the showcase tests it cold |
| Result → resource URL on `www.thenational.academy` | Generated `url-helpers` cover all five content types | Units need `sequenceSlug`, subjects a key stage; whether search results carry that context is unverified | If underivable from results, a declared augmentation at the search-result boundary — never link fabrication |
| Web host composition: routing, env, error envelope, live-stack wiring | Curriculum Hub precedent — app-specific (evidence row: no reusable host profile exists) | The wiring would be rebuilt app-locally a second time | Second consumer met: extract the recurring demo-host composition as Kit-owned capability (consolidate-at-second-consumer) |
| Design language | Oak Design System — demonstrated; both consumption paths proven (Tailwind-mapped, plain-CSS) | None blocking | Path choice is a decision-budget entry, not a fork |
| Composition declaration and profile | Proposed only (definition corpus) | No concrete record instrument exists | First instantiation of the record interfaces — the Kit's first real declaration artefact |
| Decision-budget record | Proposed only | No instrument | Lightweight Kit-owned record format, seeded here |
| Evidence-ledger entry | Proposed only (strategy names the minimum fields) | Ledger absent | First entry authored by this demo, to the strategy's minimum record shape |
| Observability for a public read-only demo | Reusable observability/logger packages; zero-hit recording in the search SDK | Whole-Kit health contracts absent — not activated by this profile | Register only if build observes recurring burden |
| Typed environment and bindings | `@oaknational/env` + `env-resolution` | Provider composition and capability discovery absent (evidence row) | Candidate seam; confirm through the decision budget rather than pre-build |
| Deployment of a public demo | App-specific Vercel path (MCP app) exists | No demo-tier host/release profile | Candidate seam, observed at the deploy slice |
| Identity, persistence, jobs, payments | — | Not gaps: this profile activates none of them | Declared omissions — the profile's honest smaller shape |

**Keep** (use what we have): search SDK read surface, generated URL helpers, design system,
demos-tier standards, existing a11y and fidelity machinery. **Change** (what we should
change): the app-local host/env/search wiring becomes Kit-owned at this second consumer; the
definition's record interfaces move from prose to first concrete instruments (declaration,
decision budget, ledger entry); the unit/subject URL-context handling changes only if the
audit proves current results insufficient. The proposition licenses no other change: no
relevance retuning, no new search features, no admin surfaces.

## Acceptance criteria (each with a proof — required)

1. **Linkability holds for every result type.** Every search-result type (lesson, unit,
   subject, sequence, thread) resolves to an Oak URL via the generated helpers or surfaces a
   declared, truthful absence; the two contextual dependencies (unit → `sequenceSlug`,
   subject → key stage) are proven satisfied or handled. Proof: **repo-safe** — a linkability
   audit instrument over a real index sample, plus tests on the truthful-absence path; a live
   URL-resolution evidence run recorded with the audit.
2. **The discovery loop is complete and truthful.** Intent → results with source, relevance
   and provenance legibility → hand-off link; zero-hit, error and degraded states are
   first-class truthful content, not hidden failure. Proof: **repo-safe** — e2e and unit
   coverage of the loop including the difficult states.
3. **The composition declaration exists and matches the built thing.** Activated, reduced,
   omitted and unavailable capability states, claim boundary and profile are declared before
   build and reverified at completion. Proof: **repo-safe** for the declaration and its
   conformance; **owner-held** for accepting the declared claim boundary.
4. **Accessibility is intrinsic.** WCAG 2.2 AA in the composed host; every core task
   keyboard- and screen-reader-complete. Proof: **repo-safe** — the demos-tier a11y gates
   plus recorded manual verification.
5. **The decision budget is recorded.** Every creator decision captured and classified
   proposition-shaped or machinery-shaped. Proof: **repo-safe** for the record;
   **owner-held** for the review that reads it as the Kit's seam evidence.
6. **The gap-and-seam register verifies and extends the first-pass determination.** Each
   planning-time row confirmed, corrected or retired by build evidence; new gaps appended;
   each gap carrying a disposition routed to its legitimate owner (Kit-placement inquiry,
   owning stream, or demo-local). Proof: **repo-safe** for the register; **owner-held** for
   placement rulings.
7. **Public-surface-only consumption held.** No deep imports into SDK internals or admin
   surfaces from the demo. Proof: **repo-safe** — dependency-cruiser/import rules.

## Todos

Slices at pickup, each a single-story PR within the default round budget (PDR-132):

1. **Stage 0** — proposition record, composition declaration, decision-budget seed, and the
   evidence-ledger entry stub. Docs only; carries the owner gate.
2. **Linkability audit** — the instrument, the real-sample evidence run, and the
   truthful-absence contract.
3. **Smallest vertical slice** — query → results → link-out at the demos tier, consuming the
   public read surface, design-system styled, accessible from the first render. The
   host-composition extraction decision (the second-consumer seam above) is taken at this
   slice through the decision budget, owner-visible, not silently either way.
4. **Depth and limits surfaces** — relevance and provenance legibility, suggestions and
   facets where they serve discovery, zero-hit/degraded/limit truthfulness.
5. **Evidence close** — decision-budget and gap-and-seam consolidation, dispositions routed,
   composition declaration reverified, owner review.

## Out of scope

- Curriculum-app behaviour — lesson content rendering, downloads, journeys, planning tools;
  `www.thenational.academy` owns the resource experience (owner ruling, 2026-08-31).
- Admin, ingest or index-lifecycle surfaces in the demo; the CLI owns operations.
- The dedicated design-system, graph, chat and Curriculum Studio showcases; embedded reuse
  here is integration evidence only.
- Teacher-value, product or adoption claims; this demo makes possibility and comprehension
  claims only.
- Building Kit capabilities beyond what this proposition activates — gaps are registered and
  routed, never absorbed (the definition's placement rule).
- Search-relevance retuning or provider changes; findings about search quality route to the
  search-owning stream.
