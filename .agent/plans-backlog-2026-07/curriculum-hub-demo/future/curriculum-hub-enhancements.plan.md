---
title: Curriculum Hub demo — post-completeness enhancements (E1 nav-WWW, E2 curriculum-results-secondary, E3 curriculum-search showcase page)
status: STRATEGIC (future/) — RESEQUENCED PRE-MERGE (owner re-decision 2026-07-01 ~21:30Z, superseding the same-day deferral). E1+E2+E3 now execute PRE-merge as part of the active plan's drive to main; the active plan §"E-series enhancements" owns sequencing and lane assignment. This brief remains the strategic detail source (problem/intent/means per item); it archives when E1–E3 land.
lane: future
lineage:
  serves_thread: curriculum-hub-demo
  serves_stream: null
  strategic_choice: null
  derives_from: .agent/plans/curriculum-hub-demo/active/port-prototype-to-live-demo.md
owners:
  - Sycamore spins Loam (551fb6) — Director #5 (curriculum-hub-demo): captured + authored this deferred brief; execution routed to the live cast on promotion.
branch: feat/curriculum-hub-demo  # NOT pushed (owner: local)
---

# Curriculum Hub demo — post-completeness enhancements

Three owner-directed enhancements (2026-07-01), captured as a deferred strategic brief so
they are conserved without interleaving into the in-flight core reproduction. **They are
STRICTLY enhancements**: the owner directed they be addressed **after feature + visual
completeness** — i.e. after the guiding plan
[`port-prototype-to-live-demo.md`](../active/port-prototype-to-live-demo.md) §"Definition
of Done" (A–I) is complete and the one coordinated milestone commit has landed. This brief
does not change that DoD; it is the next phase after it.

## Problem and intent

The core demo reproduces the Oak Curriculum Hub from the canonical export (all pages +
components, two-search, 6 cards, WCAG 2.2 AA). Three gaps remain that the canonical export
does **not** cover but the owner wants for the demo's purpose (a live-data showcase):

- **E1 — no route back to the Oak web presence.** *Gap:* the hub has no link to the main
  Oak website. *Who it harms:* a visitor exploring the demo hub cannot navigate to
  `www.thenational.academy`. *Success:* a "WWW" nav item links out.
- **E2 — flat search information hierarchy.** *Gap:* in the hub's combined search, the
  demo's primary specialist-training content (training courses + quality standards) and the
  live Oak-curriculum results have no primary/secondary ordering. *Who it harms:* a searcher
  sees the demo's own hub content and the live-curriculum content with equal weight, blurring
  what the hub is primarily *for*. *Success:* live-curriculum results render **below** (are
  secondary to) the training/standards results.
- **E3 — the live search-SDK / semantic-search USP is under-showcased.** *Gap:* the live
  Elasticsearch semantic search over the published national curriculum — the demo's
  standout capability and the reason the 6th "Oak curriculum" card diverges from the
  canonical's 5 — exists only inline in the hub search. *Who it harms:* the capability the
  demo most wants to demonstrate has no dedicated, feature-rich surface. *Mechanism
  (hypothesis):* a dedicated page that foregrounds semantic retrieval (highlights,
  result-type grouping, example queries) demonstrates the SDK far better than an inline box.
  *Success:* a new `/curriculum` page showcases the search SDK + semantic search service, and
  the 6th card links to it.

## End goal, mechanism, means

**End goal.** Enhance the *completed* Curriculum Hub demo with three owner-directed additions
that (a) connect it to the Oak web presence, (b) sharpen the search information hierarchy, and
(c) give the live search-SDK / semantic-search USP a proper showcase — without compromising or
re-opening the core reproduction.

**Mechanism.** E1 and E2 are small additive / ordering changes to already-built, already-
reviewed surfaces (`SiteNav`, `HubResults`), so they carry near-zero regression risk. E3
reuses the **already-built and verified** live-search seam (`useCurriculumSearch` / the Oak
search SDK) on a new page, so fidelity and correctness ride on existing infrastructure rather
than new data-plane risk — the new work is a page UI + a focused showcase presentation, not a
new search engine.

**Means (strategic moves — refined into executable TDD cycles at promotion).**

- **E1 (styling lane).** Add a "WWW" item to `SiteNav` after "Wiki", linking out to
  `https://www.thenational.academy` (`target="_blank"`, `rel="noopener noreferrer"`, an
  accessible name such as "Oak website (opens in a new tab)").
- **E2 (styling lane).** In `HubResults`, order the groups so local specialist-training
  results (`TrainingGroup` + `StandardsGroup`) render first and the live `CurriculumGroup`
  renders last / secondary. `searchHub` shape is unchanged; this is a layout ordering call.
- **E3 (data + styling lanes).** New `/curriculum` page — a semantic-search showcase:
  - *Data seam:* live ES semantic search over the published curriculum (lessons / units /
    threads) via the committed `useCurriculumSearch` / search-SDK seam; expose results +
    highlights/snippets + result-type grouping so the page can demonstrate the SDK's
    semantic-retrieval features. Surface which SDK/semantic features are worth showing
    (relevance ordering, highlights, the three result types; suggested/example queries).
  - *UI:* a dedicated page with a prominent search, rich result cards per type, example
    queries, and semantic-search framing; visual-matched to the Oak design system (there is
    **no** canonical export target for this new surface — design to the tokens + first-hand
    §D review of the rendered page).
  - *Re-target:* the 6th "Oak curriculum" card `href` moves from `#hub-search` → `/curriculum`.
    Once it is a real page link, its in-page-anchor behaviour (and the SC 2.4.3 anchor-focus
    fix on the hero input) is moot **for that card** (keep the hero `id="hub-search"` — the
    hero search still uses it).

## Domain boundaries and non-goals

- **Non-goal:** re-architecting or re-opening the core reproduction. The block renderer, the
  content-tree contract, the shared course-shell, and the committed search seams are stable and
  unchanged.
- **Non-goal:** E3 is a *focused* showcase (a sensible v1), **not** an exhaustive dump of every
  search-SDK feature. First Question — could it be simpler without compromising quality?
- **Non-goal:** no `git push` — the branch stays local (standing owner direction).
- **Boundary:** E2 keeps a (secondary) live-curriculum search *in the hub* AND E3 adds a
  dedicated `/curriculum` deep-search page. These are coherent, not redundant: the hub is the
  unified entry (local-first, curriculum secondary); `/curriculum` is the dedicated deep
  semantic-search showcase.

## Dependencies and sequencing

- **Promotion trigger (BLOCKING):** core DoD §A–I of `port-prototype-to-live-demo.md` complete
  **and** the milestone commit landed. This is the owner-directed "after feature/visual
  completeness" gate — hard, not advisory.
- **E1, E2 — independent + trivial**, parallel-safe with each other; each touches a separate
  concern (nav vs results-ordering).
- **E3 data seam — beneficial prerequisite already satisfied:** the live-search seam
  (`useCurriculumSearch` / search SDK) already exists and is verified. Minimum shippable shape
  without new data work: reuse the existing seam as-is; enrich (highlights / result-type
  grouping) only where the showcase needs it.
- **E3 UI depends on the E3 data seam** (consumption dependency): the page renders whatever the
  seam exposes; sequence the seam's showcase shape first, then the page.

## Strategic acceptance criteria and success signals

- **E1:** the "WWW" nav item is present after "Wiki", opens `www.thenational.academy` in a new
  tab with a correct accessible name; keyboard + SR operable.
- **E2:** for a hub query returning both kinds, the live-curriculum results render below the
  training/standards results, verified in-browser.
- **E3:** `/curriculum` is live; semantic search over the published curriculum returns
  lessons/units/threads with highlights; the page demonstrates identifiable SDK/semantic
  features (relevance, highlights, result types, example queries); the 6th card links to it;
  visual-matched to the Oak design system; WCAG 2.2 AA verified; `CI=true pnpm check` green;
  read-only reviewer passes (react / design-system / accessibility / type); owner visual
  sign-off.
- **Overall success signal:** the three enhancements land without regressing any core DoD §A–I
  acceptance (the core gates stay green).

## Risks and unknowns

- **E3 scope-creep** (the main risk). *Mitigation:* a focused v1 (semantic search + highlights
  - result types + example queries), explicitly refinable on owner review; resist gold-plating.
- **Which semantic-search features to showcase** — resolve at promotion by reading the live
  search-SDK surface first-hand (what the retrieval service actually exposes) rather than
  assuming; ground the showcase in real SDK capability (schema-first / verify-don't-trust).
- **E2 ↔ E3 coherence** — addressed under Boundaries; confirm at promotion that the hub's
  secondary curriculum search and the dedicated page do not read as duplication to a user.
- **No canonical target for `/curriculum`** — fidelity is to the Oak design system, verified by
  first-hand §D review of the rendered page (matched-width claude-in-chrome / Playwright), not
  against an export screenshot.

## Promotion trigger into current/

Promote to an executable `current/` plan when: the core DoD §A–I is complete AND the milestone
commit has landed AND the owner confirms the demo is feature/visual-complete. At promotion:
mine these strategic moves into executable TDD cycles (E1, E2, E3-data-seam, E3-UI + card
re-target) with cycle-level acceptance + deterministic validation, and read the live search-SDK
surface first-hand to finalise the E3 showcase feature set. Execution decisions are finalised
only at that promotion.

## Foundation alignment

`principles.md` (simplicity-first; First Question on E3 scope; long-term architectural
excellence — reuse the verified search seam rather than a new engine), `testing-strategy.md`
(TDD on the real logic: the E3 search-showcase presentation logic + E2 ordering get tests; the
`demos/` exemption is knip/format/markdownlint scope only), `schema-first-execution.md` (the
E3 data flows from the SDK/search seam — no shadow schema; ground the showcase in the SDK's real
retrieval shape).

## Architecture & quality enhancements (deferred — 2026-07-01 owner batch)

A second owner batch (2026-07-01), also strictly post-completeness. **Exception, NOT deferred:** the
pre-push **directory organisation** tidy — a pre-push must-do captured in the guiding plan
[`../active/port-prototype-to-live-demo.md`](../active/port-prototype-to-live-demo.md) (the neatness
pass + gitignored-resource resolution + superseded-artifact removal run right before the milestone
commit). The following three are the deferred remainder:

- **A1 — tooling → repo standards.** Bring the demo up to repo-default tooling: remove the `demos/`
  exemptions (`.prettierignore`, `markdownlint`, `knip` ignoreWorkspaces) and the demo's own ESLint
  config where it diverges from the repo default, then fix every resulting issue. The current
  exemptions were an owner-approved prototype-zone scope call; maturing to full repo-strict is the
  enhancement. Acceptance: `demos/` participates in the repo-wide gates with zero exemptions and zero
  issues — strict, everywhere, all the time.
- **A2 — reusable-workspace extraction + seams.** Decide which parts of the app are reusable vs
  demo-specific (candidates: the exhaustive typed `BlockRenderer` + block union, the search seams, the
  canonical-export render tool + generators) and extract the reusable ones to proper package homes with
  clean seams. NOTE: monorepo workspace topology is an **owner-gated decision** (repo-continuity §Open
  Owner-Decision Items), so this is doubly owner-territory — its promotion is additionally gated on that
  topology decision.
- **A3 — Claude Design ingest pipeline.** Formalise a pipeline to pull Claude Design updates and
  intelligently integrate them (pull fresh export → diff vs committed → re-run generators + render tool
  → reconcile). NOT greenfield: the seed is
  [`demo-maintenance-and-structure.md`](./demo-maintenance-and-structure.md) and the re-runnable
  generators (`generate-course`, `generate-quality-standards`) + the `--width` render helper are its
  arms. The enhancement completes/formalises it and decides whether `demo-evidence` + the render tool
  generalise to other Claude Design ingests.

Promotion trigger for A1–A3: same as E1–E3 (core DoD §A–I complete + milestone commit landed); A2 is
additionally gated on the owner's monorepo-topology decision.
