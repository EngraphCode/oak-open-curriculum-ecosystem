---
id: design-system-completion
node_type: delivery
name: "Design-system completion — four demos, identity contract, React tier, the wow bar (v2)"
overview: "Complete the Oak Open Curriculum Design System as a layered identity-agnostic framework, proven by four demos at the owner's wow bar: verified page/feature census with per-page dispositions, the plain demo as the first rendered checkpoint, a schema'd identity/theme contract with an identity emitter and mechanical gates, the curated React tier on the ADR-213 §3 shape, the showcase rebuilt inside a design grammar, and cross-demo theme behaviour stated mechanically."
status: sketch
ratified_by: null
ratified_date: null
ratified_where: null
serves: design-system-as-configured-framework
impact_areas:
  - design-system
tickets: []
depends_on: []
# The blocking dependency on the backlog plan `design-system-integration`
# (ws-gate-extension → W2.10) is carried in §Relationships: the backlog
# corpus sits outside the anchored estate's id-space, so the validator
# (correctly) refuses it as a frontmatter edge.
owner_gates:
  - awaiting: external-input
    clears_when: >-
      Ticket mint at the Linear embargo's end (08:00 Europe/London
      2026-08-10). The SUBSTANCE is owner-ratified (2026-08-02 word,
      recorded in §Owner rulings); this gate holds only the tickets
      field. It does not gate ratification (v1 conflated the two —
      corpus E63/X4): the stamp completes when the fleet re-review
      closes clean and the owner's implementation word arrives, and the
      subtree is unanchored until the mint, so the estate validator is
      green throughout.
    expires: 2026-08-17
  - awaiting: owner-decision
    clears_when: >-
      W2.7 off-horizontal design session: which elements tilt, at what
      angles, for EACH identity — primed with the corrected evidence
      (corpus E7/E78: the landed Freedonia is currently the corpus's
      most orthogonal identity and EMC²/creature carries the existing
      rotations; the owner's word "Freedonia has more off-horizontal
      elements, Oak has none" is the TARGET, priced at the session).
      Scheduled by the executing seat when W2 opens; W2's other stories
      do not block on it. The token-shape scaffold with its
      accessibility constraints (E8/E40) lands before the session so it
      prices real, in-envelope options.
    expires: 2026-08-31
  - awaiting: owner-decision
    clears_when: >-
      W0.2 KNOWN-ISSUES item 14 ruling (subtree-theming dialect-alias
      breadth: re-declare every dialect alias per theme block, or
      narrow the subtree contract). Required before any surface renders
      a high-contrast or colour-safe SUBTREE (corpus E11/E31/E32);
      nothing else blocks on it.
    expires: 2026-08-21
last_updated: 2026-08-02
---

# Design-system completion — four demos, identity contract, React tier, the wow bar (v2)

**v1 → v2 (dated note, 2026-08-02).** v1 (this id, authored at the Director seat,
`6f3221e1e`) failed its tiered 31-agent review — 98 adjudicated findings, 23 blocking
(`.agent/reports/design/plan-review-2026-08-02/adjudication.md`). v1 was never ratified
(born-sketch), so this rewrite amends in place under the same id. Every finding carries a
recorded disposition in
`.agent/reports/design/plan-review-2026-08-02/dispositions.v2.md` (the re-review fleet
and the Director are that ledger's readers; a finding with no row is a review defect).
Authored by the executing seat (Corsair hunts Surf, 4d3282) per PDR-117.

## Direction (owner words, 2026-08-02, verbatim substance — carried from v1 unchanged)

1. Write a proper plan. 2. Stabilise what we have. 3. Enumerate and implement what we
are missing. 4. Demonstrate each and every feature in the design showcase app,
including all pages from the design system export, removing the current showcase page
(owner verdict: "visually I would reject it out of hand as incompetent"). 5. The
curriculum hub is NOT plain HTML/CSS (verified first-hand: Next.js 16 / React 19 /
Tailwind v4 since origin); owner ruling at the card: the hub STAYS as-is and the plain
path lives elsewhere. 6. The showcase app showcases React and Tailwind with our
system. 7. Oak-specific parts stay as thin as possible — ideally config passed to a
general framework. 8. The showcase retains the three identities at all times: Oak,
EMC², Freedonia DSE. 9. Freedonia has more off-horizontal elements; Oak has none.
10. #709 disposition is §PR-709 below. 11. A new design seat executes (Corsair hunts
Surf, 4d3282). Amendment (same day): "we need a third demo and fourth demo, one for
plain html and css, one for React and nextjs and styled components, all with working
theme detection and selection." The bar, strengthened: "I want to look at each and
every demo and think 'wow, that looks _amazing_'."

**Post-v1 owner rulings (2026-08-02, not in v1's text):** iteration is LOCAL — Claude
Design rounds only at owner-instigated moments, no two-way-sync investment; wow-first
decomposition — early rendered pages with machinery underneath, never workstreams of
plumbing before pixels; design authorship for the counter-identities is first-class
work. **Taste calibration (thread record ~20:50Z):** REJECTED — bare specimen grids,
native form-control switchboards, monochrome first paint. CALLED GOOD — the export's
own composed pages (the Identity Switchboard switching a real lesson-page specimen,
proper toggle-button controls). The export's visual language is the demonstrated
taste anchor.

## Goal · In · Out

**Goal**: the design system completed as a configured framework (the strategic
parent's kernel), proven by four demos at the wow bar with structural quality gates —
and the owner's first wow verdict arriving as early as the work allows, not after
three workstreams of plumbing.

**In scope**: the kit and token packages under `packages/design/`; `oak-design-react`;
the four demo apps under `demos/` (hub, showcase, plain, styled-components — two
exist, two are created here); the Demos Charter and its ADR-213 amendment; the
identity/theme contract, emitter, and gates; the token-reference page; the
export-tweaks intake; the #709 closure acts; the dated ADR amendments and backlog-plan
re-homing amendments this node's work obligates (§Relationships).

**Out of scope (recorded deferrals — take-or-defer at owner word, never silent)**:
Stage B token-source convergence and the dual-gate window's closure (owned by
`design-system-integration` `ws-stage-b-convergence`; this plan's demos consume ONLY
the kit's own CSS surface for the window's duration — corpus E1/E70); css-modules
consumption (dropped by the four-demo amendment); RTL/logical-properties
internationalisation; data-visualisation palettes; terminal (`oak-design-ink`), print,
and deck target upgrades beyond keeping existing behaviour green; the MCP-app
island-hydration/ADR-217 tail (routed to MCP-448 under ADR-217, never absorbed here —
E58/E77); Linear ticket true-ups before the 2026-08-10 embargo end; identity switching
in the plain and styled demos (recorded assumption, showcase-only unless the owner
extends — tracked in §Decision log, cheap to correct, X14).

## First-principles check (plan-body rule, clauses 4–6)

- No decided-state herein contradicts standing owner word: every §Decision log row
  carries owner provenance; the lost hub agreement is consciously superseded at his
  card answer and recorded in the charter's provenance (via the ADR-213 amendment,
  with E56's attribution correction). Where v1 asserted repository states first-hand
  reads falsify, v2 carries the verified state (hub theme runtime, export inventory,
  DTCG directions, theme lists, identity tilt attribution).
- Landing path: plan nodes land in the anchored subtree under the plans conformance
  validator; demo workspaces land under the `demos/` tier rules (strict TS, shared
  ESLint, TDD, WCAG 2.2 AA) with the W1.1/W5.1 plumbing stories carrying the
  workspace-registration contract (E73).
- Vendor literals verified at authoring: `oak-theme.js` five-name union and `choice()`
  (kit `src/oak-theme.ts:31`), `light-dark()` roles, Tailwind v4 `@theme inline`
  mapping, Next 16 / React 19 (hub `package.json`), the export's 81-page artefact
  set (first-hand enumeration 2026-08-02), `styled-components` v6 + the App Router
  style registry re-verified against current upstream docs at W5 story open
  (read-nextjs-docs-before-coding).
- Record-consumer clause: the census artefacts are read by the W4.5 matrix gate and
  the coverage reviews; the disposition ledger is read by the re-review fleet; the
  charter is read by demo READMEs and every demo story's DoD. No write-only records.

## Workstreams

Sequencing: W0 → W1 (first light) → W2 → W3 → W4 → W5 → W6. W1 needs only W0's
census/stabilise/instrument stories (the plain demo consumes the kit directly —
`oak-theme.js` is framework-neutral, so W1 does NOT wait on the React runtime; X12
resolved). Each story below names its describing surface and first RED (E47); every
story is sliced to single-story PRs on the PDR-132 two-round budget.

### W0 — Ground truth, stabilise, instruments, charter

- **W0.1 Page + feature census, generated and dispositioned.** Two committed,
  dated artefacts derived mechanically (E46/E60): (a) the **page census** — the
  export's 81 page artefacts enumerated by filesystem walk at a dated commit
  (verified 2026-08-02: 62 `preview/`, 3 top-level composed pages, 4 `components/`,
  3 `templates/`, 5 `whitelabel/`, `ui_kits/oak`, thumbnail, integrations, docs),
  each row dispositioned `express-composed` / `fold-into-composition` /
  `reference-tier` / `owner-accepted-exclusion` (E23/E60/D0/D1); (b) the **feature
  census** — token roots parsed from the canonical CSS, component classes from
  `components.css`, the five themes + motion axis, composition tokens,
  print/deck/worksheet targets, icons, fonts, `oak-theme.js` behaviours. Output
  includes the **gap census** (F3): kit-vs-standing-requirements and kit-vs-export
  deltas, each gap assigned an implementing story (kit gaps are W0/W2 work, never
  silently absorbed into demonstration). Describing surface: the census generator's
  unit tests; RED: generator asserts a census entry the walk cannot find.
  Acceptance (`repo-safe`: census generator test + committed artefacts;
  drift-guarded by W6.4's re-derivation): both artefacts committed with zero
  undispositioned rows.
- **W0.2 Stabilise.** (a) Verify every existing design gate green FIRST-HAND
  (`validate-authored-css`, `validate-kit-assets`, contrast + a11y suites; their
  current state is unverified — X6); red gates are fixed before anything else. (b)
  KNOWN-ISSUES triage: accessibility-class entries have exactly ONE disposition —
  fix (ADR-147 zero-tolerance, E31); others fix / accept-with-record / defer. The
  missing dark-link-on-lemon pairing joins `dtcg/contrast-pairings.json` (E31).
  Item 14 (subtree dialect-alias breadth) is the frontmatter owner gate — ruled
  before any HC/colour-safe subtree renders (E11/E32). (c) The
  **`prefers-contrast` route** (E28), red-then-green: a
  `@media (prefers-contrast: more)` CSS mapping onto the high-contrast block scoped
  so an explicit non-system choice wins, and the runtime consulting `auto()` when
  the stored choice is `system`; two new gate cells (stored-`system` +
  `emulateMedia contrast:more` → high-contrast applied; `javaScriptEnabled:false` +
  contrast more → applied). Acceptance (`repo-safe`: the named suites + the two new
  Playwright cells): all green with evidence linked in the PR.
- **W0.3 The Demos Charter as doctrine.** The assignment table (hub =
  Tailwind-mapped product demo, as-is; showcase = React + Tailwind full-feature
  demonstration; plain = plain HTML + CSS; styled = React/Next/styled-components)
  lands as a **dated ADR-213 amendment** — a normative decision belongs in the ADR
  corpus, not an index README (E55) — with `demos/README.md` §Charter reduced to a
  pointer plus a row-per-demo table. The charter carries: the provenance note with
  E56's corrected attribution (ADR-213 cited only for what it says; the superseded
  agreement and the 2026-08-02 re-assignment recorded in the amendment itself); the
  **per-demo pre-paint mechanism** (raw inline head script for the Next demos;
  parser-blocking `<script src>` in `<head>` for the plain demo — E37); the
  **enumerated demos-tier a11y DoD** (forced-colours cell with the matchMedia gate,
  320px reflow, 400% zoom, target-size at the kit's 44px floor, skip link, `lang`,
  text-spacing — E33); the **three-identities reading** — all three identities
  reachable at all times from the showcase's identity control; any surface needing
  SIMULTANEOUS multi-identity rendering fires the item-14 fix first (E32); the
  **composition rule** — a variant whose DOM order and visual order diverge is a
  defect to re-author, not a feature (E29); and the **hub wow reading** (F4/D3):
  "as-is" covers architecture and consumption path; the hub sits inside the wow
  checkpoint like every demo, and a failed checkpoint opens scoped visual-cure
  work (recorded assumption — the owner can overrule at the first hub checkpoint).
  The kit-side correction set lands with the showcase re-assignment (E57):
  `docs/consuming-nextjs.md` via design-sync, showcase README + `package.json`
  description, `demos/README.md` §Projects, the ADR-041 demos row. Charter cited
  from the two existing demo READMEs now; the two W1/W5 READMEs cite it at
  creation (tracked forward dependency, not a W0 gate — D4/X1/X23). Acceptance
  (`repo-safe`: `check:docs` + the estate validator; the amendment PR diff):
  amendment landed, README reduced, citations in place.
- **W0.4 Identity census.** What differentiates Oak / EMC² / Freedonia today —
  brand.css contents, non-`:root` rule inventory (verified: freedonia 5 of 6
  blocks non-root; creature 11 of 12 incl. component-state and HC blocks — E4),
  CDN asset dependencies (E12), tilt attribution (creature carries the rotations;
  freedonia is orthogonal today — E7). W2's input; explicit `depends_on` for W2
  entry (X7). Acceptance (`repo-safe`: committed census artefact).
- **W0.5 Export-tweaks intake.** The owner's tweak list channel is OPEN and
  unenumerated (his word: "it has tweaks that I need made"). Mechanics (D6/X11):
  tweaks arrive as fidelity-register-adjacent entries in the design-sync NOTES
  surface; the executing seat reads the intake at each workstream open; the
  owner's blocking/non-blocking word is recorded per entry at its arrival; a
  wow-checkpoint failure on a fidelity-clean page AUTO-PROMOTES the corresponding
  design change to blocking (F6). Iteration is LOCAL — no Claude Design
  round-trip except at owner instigation. Acceptance (`owner-held`: the owner
  confirms the intake surface at the first entry; recorded in the register).
- **W0.6 Hub browser proof surface.** The hub's real cross-demo delta (E27/E44,
  verified first-hand: pre-paint `oak-theme.js` inline + store-backed five-theme
  and motion selection EXIST; no `test:ui`/`test:a11y` exists): land Playwright +
  axe describing the EXISTING behaviour — routes and interactive chrome (SiteNav,
  MobileHubNav, HubSearch, ResultCards, lesson pages) across the theme cells,
  wired as `test:ui`/`test:a11y` so turbo and CI run them. RED comes from the
  missing assertions, never from missing product behaviour. Acceptance
  (`repo-safe`: the new suites green in CI at the ci.yml `test:a11y` leg).
- **W0.7 The design-review instrument** (F1/E35). The vision-review leg specified
  as an instrument: a rubric derived from the export's own design language (type
  scale usage, spatial rhythm, hierarchy, colour discipline, composition grammar);
  side-by-side against a reference corpus (the export's composed pages = must-pass;
  the rejected showcase page = must-fail — red-then-green calibration, run once at
  landing); an adversarial "would a professional designer reject this" framing; an
  explicit fail state that blocks a render from reaching the owner; and a paired
  **accessibility-expert review leg** at the same checkpoint (E35). Verdicts
  recorded beside the fidelity register per page (D8). Acceptance (`repo-safe`:
  the calibration record — export pages pass, rejected page fails — committed with
  the instrument).
- **W0.8 Literal instruments re-homed** (E71). The authored-CSS literal walker and
  its non-vacuity leg move above the demos tier (design tier or root
  repo-validators) with the demo roster derived from the workspace inventory, so
  W1/W5's new workspaces are covered by construction. Sequenced before W1.
  Acceptance (`repo-safe`: validator green over all demos; red-proven on a
  planted literal).

### W1 — First light: the plain demo at the wow bar

The cheapest full-page wow test in the plan, promoted to the FIRST rendered
checkpoint (F2): export-grade pages on the live kit with zero build-time styling
machinery, before any React-tier investment. Its pass also calibrates W0.7's
instrument against pages the owner already called good.

- **W1.1 `demos/oak-plain-pages` workspace** (name at seat's discretion). The
  new-workspace plumbing contract (E48/E73): pnpm-workspace registration, dated
  ADR-041 demos-row amendment, the demos-inventory leg in `validate-boundaries`
  (four demos is the ADR's "enforcement lands at need" trigger), depcruise
  `no-packages-to-demos`/`no-cross-demo` rules, knip/prettier/markdownlint
  entries, vitest base-config pattern, `*.unit.test.ts`/`*.integration.test.ts`
  naming, Playwright wired as `test:ui`/`test:a11y`, hermetic cross-origin
  interception reused from the showcase. Acceptance (`repo-safe`: `pnpm check`
  green from cold with the workspace in).
- **W1.2 The export's three composed pages, authored fresh against the live kit.**
  Fresh authoring — the `studio-source/` pages STAY under studio-source (the §1
  move-out mechanism is not triggered; the demo authors its own markup expressing
  the same compositions — E59/E74, mechanism declared). Static HTML + kit
  stylesheets + `oak-theme.js` for detection AND selection (kit-native — no React
  dependency; the one kit delta W1 needs is nothing: detection, selection, and
  persistence are already the kit runtime's contract). Pre-paint via
  parser-blocking head script per the charter. Zero raw literals (W0.8's
  instrument covers it). Acceptance (`repo-safe`: `test:ui` + `test:a11y` per the
  charter DoD incl. the mechanical no-flash cells; `owner-held`: wow checkpoint
  below).
- **W1.3 Wow checkpoint #1** (`owner-held`): rendered in the owner's Chrome
  (pixels, never artefact paths), verdict recorded per page in the fidelity
  register. The W0.7 instrument and a11y leg run BEFORE the render is shown.

### W2 — Identity and theme contract

The strategic kernel made mechanical. Direction settled per E4/E5/E67: identity
is an **authored configuration surface** — a JSON-Schema **identity manifest**
(assets, voice, polarity default, composition preferences, theme roster,
per-theme OS-signal bindings — E38) referencing a DTCG token file for the token
block alone, plus a declared, bounded **identity CSS layer** (permitted selector
shapes only); an **identity emitter** generates brand CSS + asset manifest +
theme roster from it. Oak's base kit keeps the ADR-213 §2 CSS→projection
direction; the identity manifest is recorded as a NEW authored configuration
surface by a dated §2 amendment (it is identity configuration feeding the
framework, never a second Oak token source — E67). Owning workspace:
`design-tokens-core` for schema + validators + emitter; the kit's public surface
is unchanged (E67).

- **W2.1 Identity manifest schema.** Rejection fixtures required (E50): missing
  high-contrast fails; colour-safe absent defaults on observably; an unmodelled
  axis fails. The schema requires light, dark, high-contrast; colour-safe
  defaults on; per-theme OS-signal bindings (`prefers-color-scheme: dark`,
  `prefers-contrast: more`, `forced-colors: active`) so the OS route survives
  arbitrary theme names (E38). Describing surface: schema unit tests; RED: the
  rejection fixtures. Acceptance (`repo-safe`: fixtures + mutation check per
  testing-strategy §Prove the guard bites).
- **W2.2 The identity emitter** (E5). Manifest → brand CSS + asset/icon manifest +
  theme roster. Per identity, at ITS migration landing, the emitted CSS replaces
  the hand-authored sheet (replace-dont-bridge — no identity is served by both).
  The existing non-`:root` identity CSS is re-expressed as composition/component
  tokens or lands in the declared identity CSS layer; acceptance counts the rules
  surviving outside the layer (E4). Acceptance (`repo-safe`: emitter unit tests +
  per-identity migration proofs — emitted output serves the demo suites green).
- **W2.3 Theme roster generation** (E3). The theme roster becomes a generated
  artefact consumed by the kit runtime, the React types, the gate expectations,
  and the demo label maps — the five hand-maintained lists (verified:
  `oak-theme.ts:31/:48`, `oak-theme-store.ts:39`,
  `design-system-expectations.ts`, the CSS theme blocks, the hub's
  `THEME_LABELS`) derive from it or are build-checked against it. A theme-№N
  falsifier joins W2.6 (a config-minted test theme reaches `data-theme`, the
  matrix, and the labels with zero list edits). Acceptance (`repo-safe`: the
  falsifier red-then-green as a standing CI case).
- **W2.4 Theme overlays parameterised over identity** (E2). High-contrast and
  colour-safe re-authored to reference identity-supplied palette slots instead of
  private `--oak-*` primitives (today 68/71 HC declarations resolve to Oak
  primitives at winning specificity — every identity collapses to Oak in exactly
  the two non-negotiable themes). The brand contract amendment rides the ADR-213
  design-sync path. Acceptance (`repo-safe`: each identity renders its OWN
  high-contrast and colour-safe palettes, gate-proven per W2.5).
- **W2.5 Per-identity gate matrix** (E6/E30/E45). Mechanism stated: (i)
  token-pair contrast stays in-process per identity × theme over the identity's
  emitted token projection + pairings manifest (inheriting the base manifest by
  default), at the ratified levels (HC at AAA thresholds, others AA floor); (ii)
  rendered a11y runs over ONE specimen-carrier page per identity × theme carrying
  every component class once — browser cell count = identities × themes, never ×
  components; (iii) the expected cell count is recorded in the plan-adjacent
  gate expectations so a silently shrinking matrix is visible. Lands the dated
  ADR-147 §Standard + ADR-121 coverage-matrix amendments (E53). Acceptance
  (`repo-safe`: matrix wired into `pnpm check`; cell count pinned).
- **W2.6 Standing falsifiers** (E42/E75). (a) A synthetic identity fixture
  living outside the framework's importable tree, exercising EVERY census axis
  (colour, type, spacing, radius, shadow, motion, iconography, polarity,
  off-horizontal, composition ordering, assets), rendered in the same
  identity × theme matrix — red the moment an axis is unreachable from config;
  (b) the schema-rejection fixtures (W2.1); (c) thinness enforced by boundary
  rules (depcruise/eslint: no framework module imports identity data; no
  identity data imports framework source) — the red proof is an illegal import,
  never an unobservable "touch". Plus the theme-№N case (W2.3) and the
  minting-needs-no-demo-edit extension (W3.3). Acceptance (`repo-safe`: all
  fixtures standing in CI, each proven biting by mutation once).
- **W2.7 Off-horizontal dimension.** Token shape scaffolded FIRST with
  accessibility constraints attached (E8/E40): `$type: number` degrees
  convention composed into `transform` at emission; tokens under `semantic.` /
  `component.` per the tier detector; Oak's value a structural zero; no tilt on
  text-bearing blocks above a bounded angle; tilt never on interactive targets
  unless the untransformed hit area meets the 44px floor; animated tilt rides
  the motion tokens; the tilted identity's 320px reflow cell re-runs in W2.5.
  THEN the owner design session (frontmatter gate) prices all three identities'
  values with the corrected attribution evidence; BRAND.md canonical updates
  ride the same change via design-sync (E78). Acceptance (`repo-safe`: token
  shape + constraints tests; `owner-held`: the session's recorded values).
- **W2.8 Identity asset delivery** (E12). Asset delivery decided and landed:
  icon fonts/SVGs vendored into the identity directory, offline-safe, licence
  notices beside them (the kit's Lexend/Roboto Mono precedent); the icon set a
  required manifest field; the showcase identity payload carries icons + logo so
  each identity renders complete. Acceptance (`repo-safe`: hermetic demo suites
  — zero third-party origin fetches — plus the licence rows).
- **W2.9 Identity design authorship** (F5). Deliberate visual authorship of
  EMC² and Freedonia's config values (palette, type voice, composition
  preferences, polarity, tilt grammar per W2.7's session) — each identity
  passing the W0.7 instrument in its own right, so identity-as-configuration is
  proven with three configurations worth configuring. Acceptance (`owner-held`:
  rendered identity checkpoints; `repo-safe`: instrument records committed).
- **W2.10 ADR-147 gate extension for `oak-design-react`** — re-homed from the
  backlog plan's `ws-gate-extension` with a dated amendment there (§Relationships;
  E54/X2): per-theme axe runs, forced-colors render check, motion-axis coverage,
  a system-selects mechanism test, CI promotion of `test:a11y` for the tier
  package. The HARD gate on W3's first component export (ADR-213 §3). Acceptance
  (`repo-safe`: the extended gate green on the tier package).

### W3 — The React component tier

On the ADR-213 §3 shape — curated adoption, never a class-library re-wrap (the
standing rejection stands; no amendment needed because this plan does not mandate
the rejected shape — E14/E66). The owner's "full component set" is satisfied as
full COVERAGE: every W0.1 component class gets a recorded mapping decision.

- **W3.0 Landing-sequence obligations + the mapping rule.** The class→construct
  mapping rule recorded in the coverage table's contract: recipe class →
  component; modifier class → prop/variant union; layout primitive → composition
  component; utility → `className` passthrough only (E14). The ADR-213 §3
  landing-sequence set rides the first component export (E66): ADR-041 map
  gains the tier package's component surface note, `.design-sync/conventions.md`
  "exports no React components" rewrite + re-sync, fixtures-as-parity migration
  into the tier (re-homed from `ws-fixtures-parity`, dated amendment —
  §Relationships). Acceptance (`repo-safe`: the amendments in the landing PR
  diff; the coverage table's mapping column complete against the census — X27).
- **W3.1 Curated adoption, sliced by component family** (E47). Each family a
  single-story PR: the seed components REWRITTEN at adoption (E20) — consume kit
  classes (`.oak-btn`, `.oak-tag`, …) with variants as props; all `useState`
  hover/press/focus tracking deleted in favour of CSS state semantics; no
  `style` prop. The tier prop-API contract (E19): `className` accepted and
  merged after kit classes; ref as a prop (React 19); semantic element choice
  explicit (`as`/`Link` variant); fixtures-as-parity pinning equivalence with
  kit markup. Per interactive component: the APG pattern named + keyboard-model
  tests (roving tabindex/arrows, Escape + focus trap + return, aria-expanded/
  controls, live-region announcement, SC 1.4.13 dismissal) — page-level criteria
  gate at page level (E36). Describing surface per family: unit tests + the
  fixtures-parity file; RED: the family's first fixture. Acceptance (`repo-safe`:
  W2.10's gate green per component; coverage table rows for the family).
- **W3.2 Theme runtime completion** (E17/E18). Kit trunk (framework-neutral):
  `oakTheme.subscribe(listener)` fired on every `set`/`motion.set` plus a
  `storage`-event bridge — so writes outside React never leave React controls
  stale ("one mechanism" made structural). React adapter: `applied()` exposed as
  a separate scalar snapshot with `getServerSnapshot` returning the neutral
  value; detection stays CSS-owned for styling — no React branch selects styles
  from media state; media-derived control state appears only post-hydration.
  Acceptance (`repo-safe`: store unit tests incl. the cross-writer staleness
  case red-then-green).
- **W3.3 Identity runtime binding** (E16). Config-driven identity list fed by
  W2.1's schema output (no hardcoded union); a layout-level provider so identity
  survives client-side navigation; a pre-paint identity bootstrap beside
  `oak-theme.js` so reload/deep-link renders the chosen identity without a flash
  of Oak. The W2.6 falsifier extends: minting identity №N requires zero demo
  source edits. Acceptance (`repo-safe`: Playwright reload/deep-link cells; the
  extended falsifier).
- **W3.4 Server/client boundary policy** (E26). Presentational tier components
  ship without `'use client'`; only interactive residents carry it; providers
  take `children` as a slot. W4 exit check: showcase page and layout modules
  remain server components. Acceptance (`repo-safe`: a module-level assertion
  test over the tier's exports + the W4 exit check).

### W4 — The showcase, rebuilt to the wow bar

- **W4.1 Design grammar + the composed page set** (F0). The small set of
  product-grade composed pages is named FIRST, in the export's own layout
  grammar (lesson pages, front pages, worksheets — seeded by the census's
  `express-composed` rows); census features are then mapped ONTO them. The
  normative clause: a surface whose primary content is the feature itself (a
  specimen grid) FAILS the coverage matrix by definition; the bounded exception
  is the reference tier (W4.4's token page and the census rows dispositioned
  `reference-tier`), designed in the system's own language to the same wow bar.
  Acceptance (`repo-safe`: the page-set artefact the matrix derives from).
- **W4.2 Per-page migration landings** (E41/E24/E34). No standalone delete
  story. Per page, in one landing: the describing tests rewritten to specify the
  NEW page (Playwright + unit), the React/Tailwind page that greens them, the
  old markup removed. The rejected page's instruments are re-pointed, never
  deleted — named inventory: ring-contrast tool, 320px reflow probe,
  forced-colours cell, JS-disabled shell, identity × theme axe matrix, the
  hydration-geometry and load-then-swap invariants (moving into the tier or
  provider with tests attached). Each spec retained verbatim / re-expressed /
  dropped is stated with reason. Every composition variant demonstrated carries
  a scripted focus-order check — walk Tab, assert sequential focus order
  matches visual order (`getBoundingClientRect` monotonicity) and
  heading/landmark reading order stays meaningful (E29). Acceptance
  (`repo-safe`: suites green at every landing; the instrument inventory
  accounted; the focus-order cells; `owner-held`: per-page wow checkpoint).
- **W4.3 Export-page expression per the census dispositions.** Every
  `express-composed` and `fold-into-composition` row lands on a named showcase
  surface; the export's accessibility trio (a11y-charter, a11y-combinations,
  contrast-audit) renders its guarantee/obligation content FROM the gate's own
  report artefacts so published accessibility claims cannot drift from what CI
  measures (E39). Identity control on every page offers exactly the three
  configured identities, unchanged across theme/motion/identity switches (E51).
  Acceptance (`repo-safe`: matrix rows green; the trio's generated-source tests;
  `owner-held`: wow checkpoints).
- **W4.4 The token-reference page** (E22/E68/E13). Content generated at BUILD
  time from W2's per-identity emitted token projections (never the export's
  validator-only `dtcg/` during the dual-gate window, and never runtime
  `getComputedStyle` as the value source — one computed-style PARITY test proves
  generated values match the rendered cascade). Sections derived from the token
  roots at build with a fails-on-unrepresented-root check; iconography sourced
  from `icons.json`/`assets/icons/` with its own drift check (not DTCG — icons
  are deliberately unexported). Per-identity via the switcher; presentation
  designed in the system's own language to the wow bar. Acceptance (`repo-safe`:
  the build-time generation tests + parity test + root-coverage check;
  `owner-held`: wow checkpoint).
- **W4.5 Feature-coverage matrix, generated** (E46). Rows derived from the W0.1
  census artefacts; the gate fails when (a) a census entry has no demonstrating
  surface and (b) a demonstrating surface carries no passing assertion id — each
  row bound to a named test. "100% or owner-accepted" gaps carry the owner's
  recorded word per gap (X20). Acceptance (`repo-safe`: the matrix gate in
  `pnpm check`).
- **W4.6 Tailwind discipline in the showcase** (E15/E25). Decision (recorded in
  §Decision log): tier components paint via KIT CLASSES; Tailwind's role-mapped
  utilities are the showcase's page/layout COMPOSITION vocabulary, never a
  re-expression of kit recipes — W4 exit check asserts no kit recipe re-expressed
  as utilities. The arbitrary-value ESLint check (`-\[` pattern in JSX class
  strings, plus role-name resolution for colour/spacing utilities) lands in the
  SAME PR that adds Tailwind to the showcase. Acceptance (`repo-safe`: the
  lint check red-proven on a planted arbitrary value).

### W5 — The styled-components demo

- **W5.1 `demos/oak-styled-components` workspace.** The W1.1 plumbing contract
  repeated (E48/E73, second ADR-041 row in the same amendment family); the App
  Router style registry with a no-unstyled-first-paint assertion as an explicit
  acceptance line (E37); vendor surface (styled-components v6, `styled`,
  ThemeProvider interop) re-verified against current upstream docs at story open.
  Acceptance (`repo-safe`: `pnpm check` from cold; the first-paint assertion).
- **W5.2 Consumption through the tier.** Decision (recorded): the styled demo
  CONSUMES `oak-design-react` — the tier's second consumer, proving the thinness
  claim, with 1+N audit accounting (one behavioural audit amortises; this
  surface keeps its own visual pass) (E19). `styled(Component)` works because of
  W3.1's className-merge contract. Acceptance (`repo-safe`: demo suites; zero
  forked component copies — depcruise).
- **W5.3 Token discipline** (E10/E72). Cross-demo criterion: no framework theme
  object holds token values — a `ThemeProvider` value carries `var(--role)`
  references or nothing; every styled component reads roles through `var()`; the
  `color-scheme` bridge included. The template-literal detector (a lint rule
  over `styled`/`css` tagged templates reusing `findLiteralDesignValues`, with
  the zero-templates-scanned non-vacuity leg) lands red-first in the same PR
  that adds the dependency. Acceptance (`repo-safe`: detector red-proven; suites
  green).
- **W5.4 Wow checkpoint** (`owner-held`).

### W6 — Cross-demo closure

- **W6.1 Cross-demo verification, mechanical.** Per demo, the observable form
  (E49): resolved theme + motion attributes present on the document element
  BEFORE first paint under each emulated OS signal, surviving reload; the
  stored-`system` + contrast-more and JS-disabled cells (W0.2); for the styled
  demo, server-rendered styles arrive with the first HTML. The hub's story is
  VERIFICATION of its existing wiring (E9/E21/E61 — its delta may be zero
  beyond W0.6's proof surface); any axis found missing is named at the check,
  never asserted now. Acceptance (`repo-safe`: the named cells green in all
  four demos).
- **W6.2 Hub wow checkpoint** (`owner-held`, per the W0.3 charter reading).
- **W6.3 PR-709 closure acts** (E52/E58/E77/X13). Recorded as dated fact:
  #709 closed 2026-08-02 (adjudication on the PR). The transferring artefacts
  are enumerated BY FILE in the closure comment with destination story ids
  (appearance baselines → W4.2's instrument inventory; theme-control guards →
  W3.2/W6.1 cells); the MCP-app island-hydration/ADR-217 amendment tail is
  ROUTED to MCP-448 under ADR-217 with its own carrier, never absorbed.
  Acceptance (`repo-safe`: the closure comment's story-id list resolves against
  landed tests).
- **W6.4 Census refresh + drift closure** (X10). The census artefacts
  re-derived at a dated commit; the matrix recomputed; kit changes since W0.1
  dispositioned. Acceptance (`repo-safe`: zero undispositioned deltas).

## Cross-demo acceptance (all four, owner amendment 2026-08-02)

- Working theme detection AND selection in every demo, stated mechanically per
  W6.1 (attributes before first paint; persistence; high-contrast and
  colour-safe reachable from the visible theme control — control present,
  keyboard-operable, ≤2 activations from page load — X18; reduced motion =
  motion tokens collapse to the floor per the kit's `data-motion` semantics —
  X19).
- Styling sourced solely from the design system through each demo's declared
  consumption path. Zero raw literals at point of use for the showcase, plain,
  and styled demos (instruments per demo: W0.8 walker, W4.6 class-string check,
  W5.3 template detector). The hub's measured debt (548 arbitrary-value
  occurrences, first-hand count 2026-08-02 — E43) is RECORDED as accepted
  standing debt under its as-is ruling, reduced opportunistically, never a
  criterion this plan pretends is met.
- WCAG 2.2 AA per the W0.3 enumerated demos-tier DoD; keyboard-complete over
  every interactive element (X30); visible focus.

## Quality bar — the wow checkpoint (every demo, every page)

1. Rendered in the owner's Chrome at each page/demo checkpoint — pixels, never
   artefact paths. The owner's verdict is the gate. The verdict's HOME: recorded
   per page in the fidelity register (or the PR's checkpoint comment), so the
   owner-held criterion has a resolvable record (E62/D8).
2. Beneath his eye, always-on: the fidelity register for export-derived pages;
   the W0.7 design-review instrument + accessibility-expert leg run BEFORE any
   render is shown; the mechanical gates green first.
3. A page failing the checkpoint iterates within its PR. **Owner wow iterations
   are a distinct loop and do not consume PDR-132 review rounds** (F7); if a
   page is still failing after three wow iterations, the seat routes the page
   to the Director with the instrument's findings rather than iterating
   silently (X8's bound).
4. A wow failure on a fidelity-clean page auto-promotes the design change in
   the W0.5 intake (F6) — the owner's verdict, not the intake default, decides
   priority.

## Sequencing and PR discipline

W0 → W1 → W2 → W3 → W4 → W5 → W6, with W1 gated only on W0 and each W3 family
independent. Small single-story PRs; each PR: bot identity, Copilot at open,
full-condition merge, review-round budget TWO with tally-stop at budget
(PDR-132; v1 said three — the PDR's own number governs). Renders to the owner
at every W1/W4/W5 page landing and the W6.2 hub checkpoint.

## Decision log (owner word unless marked seat-verdict)

| Decision | Provenance |
| --- | --- |
| Hub stays Tailwind-mapped; plain path lives elsewhere | Card answer 2026-08-02 |
| Four demos with working theme detection + selection | Amendment message 2026-08-02 |
| Tailwind showcased; other varieties as further demos | Card answer (custom) |
| css-modules deferred | Follows from the four-demo set; reversible |
| Wow bar applies to each and every demo | "look at each and every demo and think 'wow'" |
| Off-horizontal: target delta priced at the W2.7 session, all three identities | Point 9 + corpus E7/E78 evidence |
| Iteration LOCAL; Claude Design at owner-instigated moments only | Post-v1 ruling 2026-08-02 |
| Wow-first decomposition; W1 is the first rendered checkpoint | Post-v1 ruling (F0/F2) |
| Tier components paint via kit classes; Tailwind = composition vocabulary | Seat verdict per E15, ADR-213 §3 tier-3 invariant |
| Styled demo consumes the tier (second consumer) | Seat verdict per E19; reviewable at W5 open |
| Three identities: reachable-at-all-times reading | Seat verdict per E32; simultaneous surfaces fire item-14 first |
| Hub wow reading: architecture as-is, visual quality in scope | Seat verdict per F4/D3 — recorded assumption, owner overrules at W6.2 |
| Identity = authored configuration (manifest + emitter); Oak kit keeps CSS→projection | Seat verdict per E4/E5/E67; ADR-213 §2 dated amendment carries it |
| Review topology: tiered fleet, zero-finding round before implementation | Ultracode directive 2026-08-02 |

## Relationships (the estate edges v1 lacked)

- **`design-system-integration` (backlog, 🟢 EXECUTING)** — the ADR-213 §3-named
  executor. BLOCKING dependency via `ws-gate-extension` (= W2.10's substance),
  carried here in the body because the backlog corpus sits outside the anchored
  estate's `depends_on` id-space.
  In THIS node's landing change, dated amendments on that plan re-home
  `ws-gate-extension` → W2.10, `ws-owned-component-tier` → W3, and
  `ws-fixtures-parity` → W3.0/W3.1, each naming this node as carrier (exactly one
  plan owns each workstream — E54/E69); ADR-213 §3's executor pointer updates to
  name the outcome; `ws-hub-migration`'s stale status is trued (the hub's
  `@theme inline` mapping is landed). Stage B (`ws-stage-b-convergence`),
  `ws-views-direct-kit-css`, `pr2-consistency-check`, and the design-sync batch
  STAY owned there; this plan's demos bind only the kit CSS surface during the
  window (E70), and W4.4 consumes W2's emitted projections, not the export dtcg.
- **`mcp-137-design-system-semantic-merge` (ratified)** — adjacent conservation
  lane (studio-corpus union + design-sync re-target); no shared workstreams; its
  re-synced studio baseline is an input to W0.5's intake routing.
- **Strategic node companion edit** (E65): `design-system-as-configured-framework`
  re-points `serves` to TOOLS-2 (its own §Why argues the open-by-default
  constraint-surface split) with APP-1 named in prose — rides this node's landing
  change.
- **ADR obligations by workstream** (E53): W0.3 → ADR-213 charter amendment;
  W1.1/W5.1 → ADR-041 demos rows; W2.1 → ADR-213 §2 identity-configuration
  amendment; W2.5 → ADR-147 §Standard + ADR-121 matrix amendments; W3.0 →
  ADR-213 §3 landing-sequence set; W6.3 → ADR-217/MCP-448 routing. Each
  amendment is an acceptance line of the workstream that triggers it.

## PR-709

Closed 2026-08-02 with the adjudication recorded on the PR (dated fact — E58).
The remaining acts are W6.3's: the by-file value-transfer comment and the
MCP-448 routing of the ADR-217 tail.

## Execution seat

Corsair hunts Surf (4d3282) — the authoring and executing seat (PDR-117). The
node routes to execution when the fleet re-review closes with zero surviving
findings AND the owner's implementation word arrives; the ratification stamp
completes at that word (§frontmatter gate note). Lane-internal review
dispatches follow invoke-code-experts; cross-lane residue routes to the
Director.

## Review record

- v1: tiered 31-agent fleet (4 haiku → sonnet verification → 6 Opus specialists
  - Fable frame-challenger), run `wf_b02eb59a-e81`, ~2.89M subagent tokens —
  FAILED (98 findings, 23 blocking). Corpus + adjudication:
  `.agent/reports/design/plan-review-2026-08-02/`.
- v2: authored by the executing seat 2026-08-02 with every v1 finding
  dispositioned in `dispositions.v2.md` (same directory). The same fleet
  topology re-reviews this text (resumable run); iteration continues to a
  zero-finding round before implementation.
