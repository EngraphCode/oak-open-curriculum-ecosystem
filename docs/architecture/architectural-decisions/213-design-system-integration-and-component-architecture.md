# ADR-213: Design-System Integration and Component-System Architecture

- **Status:** Proposed (owner ratification pending; drafted 2026-07-19, reframed same day on
  owner direction — integration, not vendoring; AIP-137)
- **Supersedes in part:** [ADR-148](148-design-token-architecture.md) §Source Format (the
  source-of-truth direction only; the three-tier model, contrast gate, and delivery format
  stand)
- **Relates to:** [ADR-041](041-workspace-structure-option-a.md) (amended 2026-07-19 with the
  intra-design dependency direction), [ADR-147](147-browser-accessibility-as-blocking-quality-gate.md),
  [ADR-149](149-frontend-specialist-expert-gateway-cluster.md),
  [BRANDING.md](../../../BRANDING.md), and the composition doctrine in
  [docs/governance/one-html-many-css-compositions.md](../../governance/one-html-many-css-compositions.md)

## Context

A complete, white-label-ready Oak design system exists in the Claude Design project "Oak Open
Curriculum Design System" (v1.7.0). It is CSS-first: three strict token tiers (tier-1 `--oak-*`
primitives; tier-2 semantic roles composed with CSS `light-dark()` plus dialect aliases; tier-3
component tokens consumed identically by a `.oak-*` class library and four compiled React
components), five theme values (light / dark / system / high-contrast / colour-safe) plus an
independent `data-motion` axis, a machine-readable contrast manifest, multi-medium outputs
(print, deck, worksheet, DOCX/PPTX), white-label proofs, and a DTCG JSON export **generated
from the CSS**.

The repository side today: `packages/design/oak-design-tokens` holds hand-authored DTCG trees
(light/dark only) built by `packages/design/design-tokens-core` into `index.css` (consumed by
MCP App views) and a terminal theme (consumed by Ink tools via `oak-design-ink`);
`demos/oak-curriculum-hub` hand-mirrors ~30 Oak values as raw hex literals in a Tailwind v4
`@theme` block. ADR-148 made DTCG JSON the source format for all design tokens.

The owner's framing (2026-07-19, verbatim intent): the design system is not being vendored, it
is being **integrated**. Claude Design is a first-class part of this team; the design system is
a first-class part of this repo; it is the design source of truth; it is not accessed like a
record. This ADR settles how the integrated design system, the existing token pipeline, and app
UI composition fit together — the component-system architecture.

## Decision

### 1. The design-system workspace and the integration contract

Create `packages/design/oak-design-system`: the design system's home in this repository —
token CSS, class library, print layer, brand override contract, theme switcher, DTCG export,
contrast manifest, consumption docs, preview specimens, and white-label proofs, as a
first-class workspace.

**Integration contract (one system, two first-class surfaces).**

- The workspace **is** the design system, and the design system is the estate's design source
  of truth. Git history is its history; repo review gates are its review gates; its semver
  `CHANGELOG.md` (the consumer contract) is maintained in-repo.
- **Claude Design is a first-class team seat**, not an external upstream. The Claude Design
  project is the design studio: design sessions run there with affordances the repo lacks
  (live specimen rendering, the design compiler, in-page probes, the live contrast audit).
  The studio copy is a working surface of the one system — never a fork, never a record.
- **Sync is incremental and bidirectional** (the design-sync discipline): studio → repo
  changes land as reviewed PRs into the workspace; repo → studio sync brings the studio
  current before design sessions. Never a wholesale replace. Git review is the merge
  authority when the two surfaces disagree. Sync runs are deliberate session actions; no
  autonomous background sync.
- **Repo-side edits are legitimate first-class work** under the same gates as any workspace.
  Wherever the system is edited, the internal canonicality rule holds: the CSS is the token
  source and the `dtcg/` export is regenerated from it (CI checks the consistency).
- Integration is real work, not a copy: the workspace scaffold, the licensing manifest, the
  sync discipline and its runbook, and the consumer convergence below are all deliverables of
  the implementing plan.
- **The production/source boundary is structural (owner ruling 2026-07-19)**: non-production
  Claude Design source material (specimens, proofs, reference build, templates, reference
  components, integration examples, proof pages) lives under `studio-source/`; quality-gate
  scope exemptions bind that path alone and only because it is not production code. Product
  code — everything on or reachable from the export surface, including generated product
  code — gets no gate exceptions of any kind; its findings resolve per-site. A studio-source
  file that becomes consumed by product code moves out and under the full gate in the same
  change.

**Licensing boundary.** Oak marks (name, logo, brand imagery) are outside the MIT licence
(BRANDING.md). The initial integration is accompanied by a per-file-class licensing manifest —
every file class listed with provenance, licence, and disposition (track / hold out / owner
call) — which the owner reviews as the licensing decision. Held-out assets are **explicitly
gitignored** with a documented re-obtain path (never loose-untracked), and the tracked subset
must be referentially self-consistent **on the repo-consumable public surface** (CSS entry
points, tokens, docs): no such file may reference a held-out file. Studio-runtime wiring
inside specimens/templates referencing studio-generated artefacts is the documented
exception (workspace README + manifest).

### 2. Source of truth: the design system's CSS (supersedes ADR-148 §Source Format in part)

The design system's CSS is the token source of truth; DTCG JSON trees are a **generated
interchange projection** of it. This inverts ADR-148's source-format direction while preserving
everything that clause protected: DTCG JSON still feeds the repo pipeline, CSS custom
properties remain the delivery format, the three-tier model and the build-time contrast gate
remain mandatory. ADR-148's invariant — secondary outputs are projections of the token source,
never a parallel token system — now reads with the design system as that source.

Convergence of the existing pipeline is staged in exactly two shapes (per replace-dont-bridge):

- **Stage A (inert):** the design-system workspace lands with zero consumers. Not a bridge —
  nothing consumes two sources differently.
- **Stage B (atomic switch):** one change deletes `oak-design-tokens`' hand-authored DTCG
  trees, re-points its generation at the design system's export, regenerates `index.css` and
  the terminal theme, and proves both live consumers (MCP App views; the Ink terminal
  surface's 11-path terminal-theme contract) against the regenerated outputs. Old sources are
  deleted in the same change.

Boundary conditions Stage B must satisfy (recorded here so the implementing plan cannot lose
them): export trees root at `color.` / `semantic.` / `component.` (no `oak.` root group — the
flattener prefixes `--oak-` itself, and tier detection keys off the root segment); dialect
aliases resolve to palette references at export (semantic→semantic references fail tier
validation); `color-mix()`/`calc()` expression values are pre-computed to literals at export or
rejected at the import boundary with a structured `Err` (they crash the contrast resolver);
the contrast manifest JSON is schema-validated at the import boundary, not cast; all four
semantic theme trees must define the same key set (a completeness check that does not exist
yet); component-tier triads are authored or their absence recorded. The end state has one CSS
namespace and one web CSS delivery surface: the design system owns web CSS delivery, and
`oak-design-tokens` shrinks to the terminal-theme projection. The hub demo's raw-hex `@theme`
mirror is a named convergence lane (see §4); until it and Stage B complete, "single token
source" is the target state, not the present state.

Theme-switching end state: the repo's dual-selector output (`prefers-color-scheme` media query
plus `[data-theme]` attribute) generated from the split theme trees — proven in the sandboxed
MCP-view context. Design-system CSS reaching an MCP view needs a `[data-theme='dark'] {
color-scheme: dark }` bridge rule because `light-dark()` resolves against `color-scheme`, not
`[data-theme]`.

### 3. The component system

The consumption model, in decision-table form. "The pairing guides" are the design system's
`docs/pairing-*.md`; every headless-library adoption is gated per-widget by the system's
wrapped-widget accessibility checklist — library adoption never discharges the audit.

**Evidentiary basis (2026-07-19):** this table originally recorded the design studio's
transmitted decisions; it now carries its own grounds from the adversarial exploration
([the exploration report](../../../.agent/reports/design-system-component-architecture-concept-exploration-2026-07-19.md)
— five refuted-or-refined counter-proposals, live vendor verification, three lenses per
proposal). Refinements from that exploration are folded in below.

| UI need                              | Path                                                                                                                                                                                                   |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Static / content UI                  | Semantic HTML + `.oak-*` class library + semantic tokens (binds in the hub only after its convergence lane lands; interim hub rule: `@theme` tokens only, no new raw values)                           |
| New hard widget (React app)          | Base UI headless primitives, styled by the same classes/tokens — adopted **at first materialised need** (a ticket, never an anticipation), pinned exact with `package.json` as the pin source of truth |
| Known/memorable date entry           | Multi-field text inputs (GDS pattern, `inputmode="numeric"`) styled by `.oak-*` — the default date route                                                                                               |
| Calendar / range / locale picker     | React Aria date widgets (the scoped admission; never duplicating a widget class Base UI covers). Native `<input type="date">` is not load-bearing (un-themeable, un-auditable chrome — owner fork)     |
| Non-React or multi-framework surface | Ark UI / Zag.js behind a **creation gate** (no package or recipe ahead of a first consumer); the no-framework binding is `@zag-js/vanilla`, light-DOM only (cross-root ARIA is a closed constraint)    |
| Radix                                | Existing code only; no new adoption                                                                                                                                                                    |
| Console / TUI                        | Ink stack with a role→ANSI tone vocabulary; web headless libraries never. The design-package build resolves every terminal-theme token path, so a token reorganisation fails at build, not at import   |

Standing rules:

- **Re-wrapping the class library in a framework component layer remains rejected** (it would
  fork the tier-3 contract). This question is settled here and is not re-litigated per widget.
- **No shared React component workspace yet.** Apps compose widgets per-app. The consolidation
  trigger is a second **app** consumer needing the same **composed widget** (not merely a
  second app existing); at that moment the widget, its tests, and its checklist record move
  together (consolidate-at-second-consumer), with honest **1+N audit accounting** (one
  behavioural audit amortises; each consuming surface retains its own visual pass — focus
  appearance, forced-colors, contrast in its real CSS context). **Grandfather patch**: a
  second app needing a widget _class_ that already exists hand-rolled in another app counts
  as a material touch on the grandfathered copy — the trigger fires on class convergence, so
  hand-rolled and library constructions of the same class never coexist indefinitely. To keep
  the move a file-move: composed hard widgets live in a dedicated `components/widgets/`
  directory, import no app-specific modules, and style only via `.oak-*`/token classes (the
  liftability guard covers **imports and styling** — an import-clean widget styling-coupled
  to an app's utility pipeline is not liftable). The raw second-consumer rule also fires
  **intra-app**: duplicated behaviour modules inside one app consolidate now.
- **The design system's four compiled React components stay off the workspace's export
  surface**: excluded from the package `exports`/`files`, React a devDependency only. Apps
  cannot import them; they remain part of the design system (reference implementations proving
  the tier-3 contract) and seed the future component workspace at the consolidation trigger
  (a pointer, not a spec). Their no-drift claim becomes **checked, not constructional**:
  fixtures-as-parity lands against them inside the design-system workspace, where reference
  markup and CSS update atomically.
- **Existing hand-rolled APG widgets are grandfathered** (the hub's tabs, accordion, quiz
  keyboard handling, sortable — hand-built, tested, axe-covered). The Base UI default binds
  new hard widgets; grandfathered widgets migrate only when next materially touched —
  "material touch" includes the intra-hub behaviour consolidation and the grandfather-patch
  class convergence above. Grandfathered code is **candidate evidence, not gate-passing
  evidence**: its current proof (jsdom axe, light-only, no screen-reader records) sits below
  the estate's own bar until it passes the same checklist as every other path.
- **The audit doctrine is symmetric.** The wrapped-widget checklist obligation binds every
  construction path — library wrap, hand-rolled APG module, and platform primitive alike;
  the browser is a vendor too. No path ships on asserted accessibility. **Sequencing
  precondition**: the ADR-147 gate extension (owner-ratified theme cardinality, per-theme
  axe runs, a forced-colors render check, CI promotion) lands **before** the first Base UI
  widget ships — a ship condition without an executor is discharged by assertion, which is
  the Radix failure mode in local colours.

App-shell prerequisites for Base UI (Next 16 / React 19): `isolation: isolate` on the app root
container (portal stacking) and `position: relative` on `body` (iOS 26+). Composed widgets are
leaf `'use client'` files; pages and layouts stay server components.

**Theme wiring (corrects the design system's own Next.js guide for this repo):** the theme
bootstrap is a raw inline `<script>` rendered in `<head>` from the root layout — **not**
`next/script` with `beforeInteractive`, whose execution does not block hydration and whose
external fetch can let first paint precede theme application. `suppressHydrationWarning` goes
on `<html>` only (it works one level deep); theming is CSS-variable-only, keyed off the root
attribute — no component branches JSX on the theme value during initial render. Per ADR-147,
theme wiring lands with a per-theme accessibility gate run. (Feed this correction back into the
system's `docs/consuming-nextjs.md` through the normal design-sync flow.)

**Tailwind consumption** is a mapping, not an adapter: a `@theme inline` block aliasing
utilities onto the design system's semantic role variables (plain `@theme` cannot reference
variables). The hub's raw-hex block is replaced by this mapping in its convergence lane; new
work uses semantic utilities or `.oak-*` classes, and the component-level arbitrary-value debt
(`text-[17px]` etc.) is reduced in the same direction without a bulk rewrite.

**Page composition** follows the region contract from the composition doctrine
(one-html-many-css-compositions.md): page shells are sibling regions with stable identities;
composition is theme CSS, never markup churn. The contract currently binds no shipped
surface; its first named binding is the hub shell at the hub's convergence lane (until then
it is recorded as future-surfaces doctrine — owner fork if that binding should differ).

### 4. Dependency direction (recorded in the ADR-041 amendment)

```text
design-tokens-core  →  oak-design-system  →  oak-design-tokens  →  oak-design-ink  →  consumers
 (framework,            (the design system,   (repo-owned            (terminal
  validation)            canonical source)     projections)           primitives)
```

Arrow reads "may be imported by". `design-tokens-core` imports nothing from the monorepo and is
consumed as a devDependency. `oak-design-system` has zero runtime monorepo dependencies and
never imports other design workspaces, apps, or sdks; its public surface is built CSS plus the
DTCG export artefact — no React. `oak-design-tokens` depends on the design system (token data
source, Stage B onward) plus `design-tokens-core`. `oak-design-ink` depends on
`oak-design-tokens` only. Apps and demos consume the design system's built CSS and the
ink/terminal surfaces. Boundary enforcement (depcruise/ESLint) is regenerated in the
implementing plan. Named convergence consumers: MCP App views, the terminal theme, and
`demos/oak-curriculum-hub` (its hex mirror is a parallel token system this decision exists to
kill).

## Owner gates (named, non-blocking for Stage A)

1. **Licensing — RULED (owner, 2026-07-19)**: Oak material in this repo is automatically
   correctly licensed given brand-asset separation and the licence file's BRANDING.md
   reference (both hold). The manifest's Oak-material owner-calls are resolved: track; the
   hub's tracked logos are ratified. Third-party social marks remain their own class.
2. **Theme proof surface — RULED (owner, 2026-07-19)**: maximal — all four colour trees plus
   forced-colors plus the motion axis; `system` is a mechanism, not a theme: prove it
   _chooses_ a theme, prove each theme's validity once (never validate one theme twice).
   High-contrast targets AAA per "maximal, all of it" (implementer's reading — confirm at
   the gate-extension review). The full verbatim ruling is recorded in the implementing
   plan's gate table.
3. **SR audit operator — RULED (owner, 2026-07-19)**: owner-run VoiceOver/Safari at each
   widget ship, NVDA/Firefox alternating per widget class, batched with pin-bump re-audits,
   operator named in every checklist record.

## Alternatives considered

- **Vendoring (record access, either direction)** — rejected by owner direction 2026-07-19.
  Both variants sever a first-class surface: external-upstream-with-frozen-repo-copy makes the
  repo a read-only projection ("local edits forbidden, deltas go upstream"); repo-canonical
  with the studio retired makes Claude Design an archive. The adopted frame is one system with
  two first-class surfaces and a bidirectional sync discipline.
- **Shared React component workspace now** — rejected: one app consumer exists; building the
  shared prop APIs ahead of a second data point is speculative structure
  (consolidate-at-second-consumer).
- **Adopt `@oaknational/oak-components` (production package)** — rejected for this ecosystem:
  React + styled-components + Cloudinary coupling; this design system exists precisely as the
  framework-agnostic mirror of that vocabulary, and MCP views and terminal tools are
  never-React consumers.
- **Port the design system into the DTCG-canonical pipeline (keep ADR-148's direction)** —
  rejected: it inverts the working system's own contract (its CSS carries the audited
  `light-dark()` composition, cascade guards, and a11y proofs that DTCG cannot express),
  forcing a lossy re-authoring with high churn and no consumer benefit.
- **Keep both token sources indefinitely ("bridge")** — rejected by replace-dont-bridge; the
  staged shape above is the compliant alternative.
- **Tailwind-only consumption** — subsumed: the `@theme inline` mapping is the consumption
  mechanism for utility classes, not an architecture.

## Consequences

- ADR-148 gains a status-line amendment ("Superseded in part by ADR-213") and
  `docs/governance/design-token-practice.md` is corrected in the same change to record the
  decided end state and its staging.
- ADR-041's matrix gains the intra-design dependency direction (dated amendment) and its
  design-row constraint wording is corrected (the terminal-theme TS contract was already a
  sanctioned exception to "consumed via built CSS, not TS imports").
- The implementing plan (design-system-integration, AIP-137) sequences: the initial
  integration with licensing manifest and sync discipline (Stage A), the contrast-gate
  extension (2→4 trees plus completeness check), the hub migration, and the Stage B atomic
  switch.
- Until Stage B and the hub convergence land, statements that the design system is "the single
  token source" are intent, not description.
