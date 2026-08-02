---
id: design-system-completion
node_type: delivery
name: "Design-system completion — four demos, identity contract, React tier, the wow bar"
overview: "Complete the Oak Open Curriculum Design System as a layered identity-agnostic framework: verified census and a normative Demos Charter; a schema'd identity/theme contract with mechanical gates; the full React component tier; four demos (hub and showcase on React/Next/Tailwind, a plain HTML+CSS demo, a React/Next/styled-components demo) each with working theme detection and selection; every demo meeting the owner's wow bar at rendered checkpoints."
status: sketch
ratified_by: null
ratified_date: null
ratified_where: null
serves: design-system-as-configured-framework
impact_areas:
  - design-system
tickets: []
depends_on: []
owner_gates:
  - awaiting: external-input
    clears_when: >-
      MECHANICAL ONLY — the substance is RATIFIED by owner word 2026-08-02
      (Director session Magnetar binds Oblivion 74d914): the eleven-point
      mandate, the two decision-card answers (hub stays Tailwind-mapped;
      Tailwind showcased with other varieties as further demos), the
      four-demo amendment with cross-demo theme detection AND selection,
      and the every-demo wow bar are all his word. This gate clears when
      the plan's ticket mints — Linear is embargoed until 2026-08-10
      08:00 Europe/London — at which point status flips to ratified with
      the 2026-08-02 word as its record. No decision re-opens; the gate
      awaits the external condition only.
    expires: 2026-08-17
  - awaiting: owner-decision
    clears_when: >-
      W1 off-horizontal design input: a short owner session naming which
      elements tilt for Freedonia, at what angles, and where the
      personality lives (Oak stays fully orthogonal — owner word
      2026-08-02: "Freedonia has more off-horizontal elements, Oak has
      none"). Scheduled by the executing seat when W1 opens; W1's other
      stories do not block on it.
    expires: 2026-08-31
last_updated: 2026-08-02
---

# Design-system completion — four demos, identity contract, React tier, the wow bar

## Direction (owner words, 2026-08-02, verbatim substance)

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
Surf, 4d3282, warm-paused). Amendment (same day): "we need a third demo and fourth
demo, one for plain html and css, one for React and nextjs and styled components, all
with working theme detection and selection." The bar, strengthened: "I want to look at
each and every demo and think 'wow, that looks _amazing_'."

## Goal · In · Out

**Goal**: the design system completed as a configured framework (strategic parent's
kernel), proven by four demos at the wow bar with structural quality gates.

**In scope**: the kit and token packages under `packages/design/`; `oak-design-react`;
all four demo apps under `demos/`; the Demos Charter; identity/theme contract and
gates; the token-reference page; the export-tweaks intake; #709 closure.

**Out of scope (recorded deferrals — take-or-defer at owner word, never silent)**:
css-modules consumption (dropped from the four-demo set by the 2026-08-02 amendment);
RTL/logical-properties internationalisation; data-visualisation palettes; terminal
(`oak-design-ink`), print, and deck target upgrades beyond keeping existing behaviour
green; Linear ticket true-ups before the 2026-08-10 embargo end.

## First-principles check (plan-body rule, clauses 4–6)

- No decided-state herein contradicts standing owner word: every decision row in
  §Decision log carries same-day owner provenance. The prior lost agreement
  (curriculum demo = pure HTML/CSS) is consciously superseded at the owner's card
  answer and recorded in the Demos Charter's provenance section — not silently.
- Landing path: plan nodes land in the anchored subtree and are validated by the plans
  conformance check; demo workspaces land under the `demos/` first-class tier rules
  (strict TS, shared ESLint, TDD, WCAG 2.2 AA — `demos/README.md`).
- Vendor literals verified at authoring: `oak-theme.js` (export runtime),
  `light-dark()` roles, Tailwind v4 `@theme inline` mapping
  (`docs/nextjs-theme-mapping.css` in the export), Next.js 16 / React 19 (hub
  `package.json`), `oak-design-react` first-component export gated on the ADR-147
  accessibility-gate extension (its README). The styled-components demo's vendor
  surface (v6, `styled`, `ThemeProvider` interop with CSS custom properties) must be
  re-verified against current upstream docs by the executing seat at W4 story open
  (read-nextjs-docs-before-coding applies to every Next demo story).

## Workstreams

### W0 — Ground truth, stabilise, charter

- **W0.1 Feature census**: first-hand enumeration of every kit feature — tier-1
  primitives, tier-2 roles, the component class library, five themes + motion axis,
  composition tokens (`--main-areas` et al.), print/deck/worksheet targets, icons,
  fonts, `oak-theme.js` behaviours, the DTCG source (`dtcg/` in the export;
  `oak-design-tokens` in the workspace). Output: the coverage checklist W3 consumes.
- **W0.2 Stabilise**: KNOWN-ISSUES triage (fix / accept-with-record / defer); all
  existing design gates run green (`validate-authored-css`, `validate-kit-assets`,
  contrast and a11y suites); kit and token packages build clean from cold.
- **W0.3 The Demos Charter** (`demos/README.md` §Charter, normative): the assignment
  table — hub = Tailwind-mapped product demo (as-is, owner word 2026-08-02);
  showcase = React + Tailwind full-feature system demonstration; plain demo = plain
  HTML + CSS consumption; styled demo = React/Next/styled-components consumption —
  plus the provenance note (the lost original agreement, the drift ADR-213
  normalised, the 2026-08-02 deliberate re-assignment). Each demo README cites the
  charter row it implements.
- **W0.4 Identity census**: what differentiates Oak / EMC² / Freedonia today
  (brand.css contents, assets, voice, polarity) — W1's input.
- **W0.5 Export-tweaks intake**: open the owner's tweak list channel; tweaks route
  through the design-sync path (ADR-213); none block later workstreams unless the
  owner marks one blocking.

Acceptance: census checklist committed; gates green with evidence; charter landed and
cited from all four demo READMEs (two exist, two are created in W4).

### W1 — Identity and theme contract, gates

- **W1.1 Identity schema**: a DTCG-shaped identity definition (tokens + assets +
  voice + composition preferences + polarity default) validated at build. Themes per
  identity likewise; the schema REQUIRES light, dark, and high-contrast and defaults
  colour-safe on. Adding a theme is data, not code.
- **W1.2 The identity-№N falsifier, mechanical**: CI mints a test identity from
  config only; if the mint touches framework code, the build fails. This is the
  strategic kernel's thinness clause as a gate.
- **W1.3 Off-horizontal dimension**: rotation/tilt as tokened identity attributes —
  Freedonia's grammar uses them, Oak's values are structurally zero. Blocked only on
  the owner design-input gate (frontmatter); scaffold the token shape first so the
  session prices real options.
- **W1.4 Gate matrix**: contrast + a11y per identity × theme × component in CI,
  generalising the existing four-theme contrast gate. All three identities render
  across all themes in CI — the point-8 "at all times" as structure.
- **W1.5 ADR-147 accessibility-gate extension**: land it for `oak-design-react` —
  the named blocker on the React tier's first component export.

Acceptance: schema validates all three live identities; the №N falsifier demonstrably
fails on a framework-code touch (proven once, red-then-green); matrix gate wired into
`pnpm check`.

### W2 — The React component tier

- **W2.1** Ship the full component set in `oak-design-react`, mirroring the kit's
  class library (census-driven; every W0.1 component class gains its component or a
  recorded rationale why not).
- **W2.2** The Tailwind mapping as first-class consumption (the showcase's engine).
- **W2.3** Theme runtime binding (`OakThemeRuntime` contract edge): detection
  (`prefers-color-scheme`, `prefers-contrast`, `prefers-reduced-motion`) AND
  selection with persistence, exposed so every React demo consumes one mechanism.

Acceptance: component coverage table complete; tier consumed by W3 with zero
component-local literals; a11y gate green per component.

### W3 — The showcase, rebuilt to the wow bar

- **W3.1** Delete the current showcase page (owner-rejected). Its plumbing assertions
  survive as tests, not as a page.
- **W3.2** Express ALL export pages via the React tier + Tailwind: Identity
  Switchboard (real lesson-page specimen), Identity White-Labelling, Example Front
  Pages — the export's own switchboard styling, three identities present at all
  times, full theme + motion switching.
- **W3.3** The token-reference page: per-identity via the switcher, presentation
  designed in the system's own language, content GENERATED from the DTCG source so it
  cannot drift — colour, typography, spacing, radius, borders, shadows, motion,
  iconography, layers.
- **W3.4** Feature-coverage matrix: every W0.1 census feature demonstrated on a named
  showcase surface, including non-trivial composition re-ordering live. The matrix is
  the workstream's exit checklist.

Acceptance: coverage matrix 100% or each gap owner-accepted; fidelity register
against the export with every divergence dispositioned; the wow checkpoint (§Quality
bar) passed per page.

### W4 — The plain and styled-components demos

- **W4.1 `demos/oak-plain-pages`** (name at seat's discretion): plain HTML + CSS
  consumption — candidate shape: the export's three pages re-pointed at the live
  workspace kit, static markup, kit stylesheets, `oak-theme.js` for detection and
  selection. Zero build-time styling machinery.
- **W4.2 `demos/oak-styled-components`** (name likewise): React + Next.js +
  styled-components consumption — components styled through the kit's custom
  properties and class contract via styled-components, wrappers where the engine
  needs them, same theme runtime.
- **W4.3** Both demos: Oak identity default; identity switching is showcase-only
  scope unless the owner extends it (recorded assumption — cheap to correct).

Acceptance: both demos meet the cross-demo criteria below and the wow bar.

### Cross-demo acceptance (all four, owner amendment 2026-08-02)

- **Working theme detection AND selection** in every demo: OS signals respected
  pre-paint (no flash of wrong theme), user selection persisted, high-contrast and
  colour-safe reachable, reduced motion honoured. The hub gains this where it lacks
  it — the one change the hub takes while otherwise staying as-is.
- Styling sourced solely from the design system through each demo's declared
  consumption path; zero raw literals at point of use (the export's own rule).
- WCAG 2.2 AA per the demos-tier standard; keyboard-complete; visible focus.

## Quality bar — the wow checkpoint (every demo, every page)

1. Rendered in the owner's Chrome at each page/demo checkpoint — pixels, never
   artefact paths (standing practice). The owner's verdict is the gate; "looks
   amazing" is his call, nobody else's.
2. Beneath his eye, always-on layers: the fidelity register against the export for
   export-derived pages; a vision-based design-review leg (screenshot critique
   against professional design craft) run before any render is shown; the mechanical
   gate matrix green first.
3. A page failing the checkpoint iterates within its PR; the checkpoint is a DoD
   line, not advice. This cures the class failure that produced the rejected
   showcase: every prior gate was machine-checkable and nothing forced anyone to
   look.

## Sequencing and PR discipline

W0 → W1 → W2 → W3; W4.1 may start after W0 (it consumes the kit directly); W4.2
after W2. Small single-story PRs (design-work-for-small-prs); each PR: bot identity,
Copilot at open, full-condition merge, review-round budget THREE with the tally-stop
discipline at budget (PDR-132 — budgets bind at authoring; an over-budget round
routes to the Director, never silently extends). Renders to the owner at every W3/W4
page landing.

## Decision log (all owner word, 2026-08-02)

| Decision | Word |
| --- | --- |
| Hub stays Tailwind-mapped; plain path lives elsewhere | Card answer |
| Four demos: hub, showcase (React/Next/Tailwind), plain HTML+CSS, React/Next/styled-components | Amendment message |
| Theme detection + selection working in all four | Amendment message |
| Tailwind showcased; other varieties as further demos, how-to register | Card answer (custom) |
| css-modules deferred | Follows from the four-demo set; recorded, reversible |
| Wow bar applies to each and every demo | "look at each and every demo and think 'wow'" |
| Off-horizontal: Freedonia tilts, Oak never | Point 9 |
| Review topology: tiered fleet, pass-without-issue before Corsair implements | Ultracode directive |

## PR-709

PR number 709 (landing-page port retention draft) CLOSES at this plan's landing with a
pointer to this node: its adjudicated development-lane value — island hydration + ADR-217
amendment, appearance baselines, theme-control guards — transfers into W2.3, W3.2,
and the cross-demo theme criteria, which is the value-transfer its adjudication
required. Commits remain reachable via the PR ref.

## Execution seat

Corsair hunts Surf (4d3282), warm-paused, grounded, pre-briefed (event 69ae1223).
Activation: this plan node's path routed to the seat after the plan passes the
tiered review clean (owner directive); the seat re-reads the node at its landed
commit, opens the lane claim, and begins at W0. Lane-internal review dispatches
follow invoke-code-experts; the Director routes cross-lane residue.

## Review record

- Tiered fleet review (low/middle/high + experts) run at authoring, owner-directed
  (ultracode): findings and dispositions recorded in this section by the Director
  before hand-off; the plan does not route to the seat until a review round closes
  with zero surviving findings.
