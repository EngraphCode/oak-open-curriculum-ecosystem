# Round-2 dispositions — one row per finding in `findings.v2.json` (v2 → v2.1)

Authored by the executing seat (Corsair hunts Surf, 4d3282), 2026-08-02, after the
round-2 fleet review (run `wf_368f0694-4a8`) and the Director's adjudication
(`adjudication.v2.md`). Id convention (array index into `findings.v2.json`):
`L#` = `landscapeSurvivors[#]`, `D#` = `droppedAtCap_unverified[#]`,
`EX#` = `expertFindings[#]`, `FR#` = `frameFindings[#]`. Every repository claim a
disposition relies on was re-verified first-hand at this seat before it was cited
(verification batch recorded in the session; the twelve load-bearing checks named in
the absorption ack, event `4e2797bf`). Corrections to three round-1 ledger rows land
as a dated appendix on `dispositions.v2.md`, never a silent rewrite.

Readers: the round-3 re-review fleet + the Director's adjudication.

## Landscape survivors

- **L0** applied — W1.2 names the theme control's mechanism: a toggle-button group in
  each page's masthead (the export's Identity Switchboard pattern, never a native
  select per the taste calibration), real `<button>`s wired to `oak-theme.js` `set()`,
  visible from page load (≤2 activations).
- **L1** applied — W3.1 defines the family: one recipe-class census row plus its
  modifier/element classes; grouping derived mechanically from the W0.1 census + the
  W3.0 mapping table; the count follows the census, never a hand list.
- **L2** applied at the verdict's corrected severity (minor) — one input clause added
  to the W2 preamble naming W0.4. The verdict's note stands: the original evidence
  misattributed E54/E69 (cross-plan edge) to an intra-plan workstream edge.
- **L3** applied — merged with D16/EX45: W3.0's completeness clause now names its
  instrument (a check consuming the W0.1 census: one row per class, zero unmapped,
  red-proven on a planted class; report-consuming mechanics per EX45).

## Dropped-at-cap (unverified — dispositioned, not dismissed)

- **D0** applied — §Quality bar 3 names the Director-route resolution set: defer the
  page / land with a recorded exception / re-scope / extend the iteration budget for
  that page — owner word wherever the landed bar changes.
- **D1** applied — the charter ADR merges before W1.1 opens (explicit sequencing
  clause in W0.3).
- **D2** applied — W4's preamble distinguishes: composed-page work rides the kit CSS
  surface; W4.4 alone blocks on W2.2's emitted projections.
- **D3** applied — the X14 row now carries the cost shape (the kit-owned identity
  runtime per EX20 makes extension a per-demo wiring story, order days) and the
  decision point (first wow checkpoint of the affected demo).
- **D4** applied — W0.5 names the intake surface concretely (design-sync NOTES
  surface, entries beside the fidelity register) and the confirmation moment (W1.3).
- **D5** superseded-by-redesign — see EX75: no standing cross-corpus blocking edge
  survives the re-homing, so there is no blocking dependency to flag; the frontmatter
  comment now states what is true.
- **D6** applied — §Quality bar 1 carries the verdict record's required form
  (PASS/FAIL/ITERATE + the qualities judged + date); the register schema lands in
  W0.7 (with D14).
- **D7** applied — W2.7 acceptance requires the session's committed decision artefact
  (or the owner's explicit defer-with-date word) before any tilt render.
- **D8** applied — W0.7 commits an explicit rubric and calibrates against a graded
  corpus including a page outside the calibration set (composed with FR3/EX54).
- **D9** applied — W2.9's tilt renders are blocked until W2.7's values are committed;
  the checkpoint carrier is FR4's (per-identity static builds of composed pages).
- **D10** applied — W1.1/W5.1 acceptance names the ADR-041 amendment diff in the
  landing PR.
- **D11** applied — the reduced-motion floor is mechanical: computed
  `transition-duration`/animation collapse to 0ms (or the kit's named minimum) on a
  named element sample, under both the OS signal and `data-motion="reduced"`.
- **D12** applied — W0.2(a) commits a dated baseline snapshot of gate states at W0
  start; red gates named with linked fix PRs.
- **D13** applied — the icon drift check is specified: build-time `icons.json` ↔
  `assets/icons/` name parity, fails listing discrepancies, red-proven.
- **D14** applied — the fidelity register is minted in W0.7 as a committed artefact
  with a stated row schema.
- **D15** applied — the page-set artefact is finalised before any migration landing;
  later changes reopen the page-set story.
- **D16** applied — with L3.
- **D17** applied — W2.1 enumerates the rejection-fixture matrix (missing
  light/dark/high-contrast; colour-safe default absent; invalid OS binding;
  unmodelled axis; unresolvable dark + more-contrast binding), readable test names.
- **D18** applied — seat-verdict rows in §Decision log carry the seat and date.
- **D19** applied — via FR6/EX61: the hub reading resolves at the W0 pre-read; the
  charter carries the resolved reading; §Decision log holds it until then.

## Expert findings

- **EX0** applied — the Oak asymmetry is stated with its mechanism: a CSS→DTCG
  projection generator becomes a named W2 story (discharging ADR-213 §2's existing
  regenerated-export obligation); Oak's manifest references that generated projection
  for its token block; W2.5/W4.4's Oak input and the landed contrast gate's input
  continuity are named.
- **EX1** applied — W6.1's observable is the resolved rendering (computed
  `color-scheme`/role values; computed durations) for no-choice cells; attribute
  presence is asserted only for stored-choice and `prefers-contrast: more` cells; the
  no-attribute default is a named asserted invariant.
- **EX2** applied — the identity token block is a base tree + one overlay tree per
  rostered theme (mirroring `semantic.<theme>.json`), polarity authored as light/dark
  arms the emitter composes into `light-dark()`; orphan detection via the landed
  `validateThemeOverlayCoverage`; W2.5 states base ⊕ overlay composition with an
  uncomposed-overlay red fixture.
- **EX3** applied — W2.2 pins the emitted namespace to the kit's published role
  vocabulary with a two-way mechanical check (every emitted property is a read role;
  every required role is emitted); `toCssVariable`'s `--oak-*` convention is noted as
  the `oak-design-tokens` consumer's, not reused.
- **EX4** applied — W2.5 gains a colour-safety leg distinct from contrast (CVD
  simulation + minimum perceptual separation over state-distinguishing pairs, with a
  recorded expert sign-off route where mechanics are refused); "state is never colour
  alone" joins the demos-tier DoD as a checked criterion.
- **EX5** applied — `design-system-expectations.ts` stays hand-pinned and
  BUILD-CHECKED against the roster; the theme-№N falsifier is restated as "zero edits
  outside the pinned expectations module, plus a required reviewed re-baseline inside
  it".
- **EX6** applied — the OS-binding axis is restricted to `prefers-color-scheme` +
  `prefers-contrast`; forced-colours becomes a separate required manifest obligation
  (adaptation block) proven by the render cell.
- **EX7** applied — the negative cells land (explicit light/dark/colour-safe +
  `contrast: more` → high-contrast NOT applied, JS enabled and disabled) alongside the
  named scoping mechanism.
- **EX8** applied — with EX66: the identity-data home story (W2.0), its ADR-041 row,
  the §1 move-out statement for identity sheets, and the `KIT_ASSET_COPIES` re-point
  land together.
- **EX9** applied — W4.4's parity re-scoped: per identity × theme over the
  statically-resolvable class (the landed `toHexComparand` filter); `runtime-computed`
  and composed-shorthand tokens carry recorded dispositions (rendered specimen, no
  value assertion); the parity cell count is pinned.
- **EX10** applied — `$type` completeness becomes a named gap-census row with an
  implementing story (group-level `$type` declarations + a completeness check failing
  on unresolvable leaves); W4.4's root-coverage check gains type coverage.
- **EX11** applied — the off-horizontal tokens' root is stated in the kit-native
  vocabulary (a `tilt` root added to the identity allow-list); the tier-detector
  citation is dropped.
- **EX12** applied — the boundary sentence lands (glyph-construction rotation is out
  of the identity tilt dimension; content-block tilt is tokenised); the kit's 7
  rotation instances are dispositioned in the gap census.
- **EX13** applied — the kit contract is restated as "listeners fire from `apply()`";
  the store shape and neutral value are named; the post-load `contrast: more` flip
  becomes an acceptance cell.
- **EX14** applied — W3.0 gains the packaging story: per-component subpath exports (or
  preserve-modules), directive preservation, `external` react/react-dom/jsx-runtime,
  `peerDependencies` + devDependency mirrors on the `oak-design-ink` precedent;
  W3.4's assertion runs over `dist/*`.
- **EX15** applied — layering settled as an explicit recorded decision, option (a):
  composition utilities apply only to elements carrying NO kit recipe class
  (wrappers); the invariant is linted via the JSX class-string visitor and a planted
  computed-value cell makes the silent-loss failure visible. The kit's own CSS stays
  unlayered (it serves non-Tailwind consumers).
- **EX16** applied — W5.2 states the override mechanism (styled-components' `&&`
  specificity bump; kit modifier classes / custom-property hooks per EX26) with an
  acceptance cell asserting the override computes in `next dev` AND production.
- **EX17** applied — the storage bridge's obligation is stated (reset
  `current`/`mcurrent` from the incoming value, `apply()`, then emit) with the
  two-context acceptance cell.
- **EX18** applied — the Director's ruling: the mapping vocabulary gains the
  no-construct / stays-class-only default with a curation criterion; §3 rejection
  untouched.
- **EX19** absorbed-with-correction — the construction-path decision per interactive
  family lands (Base UI default per §3, pinned exact, at materialised need; hand-roll
  only with recorded ground). Correction: the §3 app-shell prerequisites apply to the
  React app shells (showcase, styled demo, hub) — W1.1 is the plain demo and takes
  none.
- **EX20** applied — identity becomes a kit-owned runtime trunk (`oakIdentity` beside
  `oak-theme.js`: get/choice/set/subscribe, pre-paint application, load-then-swap,
  persistence), owning workspace the kit; W3.3 reduces to a `useSyncExternalStore`
  adapter + children-slot provider.
- **EX21** applied — the styled demo's surface split is declared (tier components for
  kit-covered recipes; styled-components for demo-local composition and chrome), and
  W5's checkpoint carries a differentiation line.
- **EX22** applied — a contract-parity assertion between the kit's runtime interface
  and the tier's re-declaration joins W3.2's acceptance; `subscribe` optionality and
  absent-runtime behaviour are stated.
- **EX23** applied — the W4 exit check is stated as the lintable inverse (a
  recipe-classed element carries no painting-category utility), red-proven, sharing
  EX15's visitor.
- **EX24** applied — the polymorphism decision is recorded: a render/`asChild` slot
  with the rendered element union constrained to `button | a`; no `next/link` in the
  tier.
- **EX25** applied — fixtures-as-parity is restated as a class-selection contract per
  prop combination; the W3.0 re-homing note says so.
- **EX26** applied — the sanctioned variation route is stated (kit modifier class, or
  a declared set of custom-property hooks), paired with the EX15 decision.
- **EX27** applied — the composition rule is replaced by the governance envelope: the
  canonical DOM carries a defensible base narrative (linearisation check); each
  variant DECLARES its reading sequence in the page-set artefact; the Tab-walk asserts
  the declared sequence via a pure comparator; `reading-flow` rides as progressive
  enhancement; "defect to re-author" narrows to variants that cannot state a coherent
  sequence.
- **EX28** applied, Director-CONFIRMED (ruling event 2026-08-02T21:56:52Z) with
  four constraints, all carried in the text: (1) the owner's four named states
  remain first-class nameable presets with compositions resolvable in addition
  (W2.1); (2) W2.1 states the simultaneous-signal composition rule and carries
  the unresolvable dark+more-contrast rejection fixture; (3) the kit
  re-architecture rides W2.4's overlay re-authoring as ONE story; (4) the
  theme-control surface implication is flagged to the wow-checkpoint notes, no
  separate gate (W2.4).
- **EX29** applied — with EX7: `html:not([data-theme])` scoping; the stored-`system` +
  contrast-more resolution is named (high-contrast composed with the system polarity
  once EX28's axes land; the interim polarity loss is recorded as that cure's
  target); the JS-disabled limitation gets a dated honesty note in the kit's docs;
  the explicit-light negative cell lands.
- **EX30** applied — the pinned browser cell count is the product over ALL declared
  axes (identity × theme × OS-signal emulation set); the three at-risk cells are
  named by file and title as must-retain rows in the generated inventory (EX48).
- **EX31** applied — the specimen carrier renders every class in its declared state
  variants (from the census's modifier classes), keyboard-walked; it is a TEST-ONLY
  fixture route, excluded from wow checkpoints and the coverage matrix, and census
  rows may not claim it (with EX52).
- **EX32** applied — W0.6 gains the remediation branch (violations triaged fix-only
  per ADR-147, fix stories named as W0 work); the charter scopes "as-is" to
  architecture and consumption path, never accessibility defects; the hub's
  arbitrary-value debt is recorded as an a11y risk.
- **EX33** applied — W4.6's check extends to the motion/transform utility families;
  rendered collapse assertions land cross-demo (with D11).
- **EX34** applied — the DoD gains SC 2.4.11 (concrete sticky-switchboard cell),
  2.4.3/1.3.2, 1.4.13, 2.5.7, and is stated as a floor with the named manual-review
  pass (the W0.7 accessibility-expert leg).
- **EX35** applied — the trio generates only the measured half, with a scope
  statement (which pairings, tags, cells, commit); the obligations half stays
  authored; the inverse check (every published claim resolves to a report row) lands.
- **EX36** applied — the identity delivery mechanism is named (identity sheets
  present in the initial HTML, attribute-selected; server-side cookie resolution
  available to the Next demos) and W6.1 gains a first-frame capture cell asserting no
  base-palette frame, for identity AND theme.
- **EX37** applied — the identity CSS layer is value-free (`var(--role)` references
  only); identity directories join W0.8's walker roster; planted-hex red proof.
- **EX38** applied — W0.2(b) names the token cure (default: re-point `--text-link`
  within the decorative-5 band scope in dark; alternative: lift the base with a full
  re-audit) plus the 42 → 43 pair-count re-baseline in the same acceptance.
- **EX39** applied — the identity contract gains forced-colours obligations
  (decorative background-image suppression / explicit `forced-color-adjust`
  decisions, system colour keywords for meaning-bearing chrome, transparent-outline
  focus preserved); the cell strengthens to computed `--surface-page-image: none`.
- **EX40** applied — describing surfaces are stated once per WORKSTREAM in each
  preamble with stories tagging their test boundaries against it; the false
  plan-level claim is corrected; the E47 round-1 ledger row gets a dated correction.
- **EX41** applied — the falsifier's rendering surface is a test-only fixture route
  built from a fixture-manifest directory (excluded from shipped builds and the
  matrix); W4.3's criterion restates as "exactly the three owner-named identities by
  literal name"; fixture values must be discriminating on every axis.
- **EX42** applied — the derive/pinned consumer split (with EX5); the theme-№N
  falsifier keeps EX5's restated form; a mechanical consumer-census validator fails
  any literal theme-name roster outside the generated module + the pinned
  expectations module; the MCP-app `apply-theme.ts` literal is dispositioned in
  scope (joins the roster derivation at W2.3's landing as a named consumer row).
- **EX43** applied — the census's describing tests become bidirectional (a planted
  fixture must appear); each census axis binds to a method-independent parity count;
  W6.4 re-runs the parity legs.
- **EX44** applied — both stories state the pure-classifier vs walker-script split on
  the `css-literal-values` / `validate-authored-css` precedent; W3.4 becomes an
  ESLint boundary rule + a dist-level render assertion.
- **EX45** applied — the matrix gate consumes the runners' JSON reports and fails on
  the four modes (no id / orphan id / non-passing id / unbound test) with a
  non-vacuity leg.
- **EX46** applied — W2.10's gate lands atomically with W3.1's first component-family
  PR, with a non-vacuity leg (empty rendered roster fails; roster count parity with
  the tier's exports).
- **EX47** applied — W0.6 and W6.1's hub leg gain recorded mutation proofs per
  assertion group; W0.2(a) gains the defect-test obligation (reproducing test in the
  fix commit, generalised to the class).
- **EX48** applied — the hand inventory is replaced by a generated one at the first
  migration landing (`--list` reporter + co-located unit suites under deleted
  modules), one disposition per row, acceptance = zero undispositioned rows;
  EX30's three cells are must-retain seed rows.
- **EX49** applied — W6.1 states both observables (parser-blocking head-element
  structural assertion on served HTML; `addInitScript` readyState-loading capture)
  plus the JS-disabled leg.
- **EX50** applied — with FR1: the styled demo gains a content story naming its
  composed page set in the export's grammar, symmetric with W1.2.
- **EX51** applied — W3.1's criteria split: unit tests carry prop→class mapping +
  fixtures parity; keyboard/focus-trap/1.4.13 land in W2.10's Playwright gate per
  family per theme.
- **EX52** applied — with EX31.
- **EX53** applied — a pure reading-order comparator (unit-tested over literal rect
  fixtures incl. wrapped grid and reordered variant) carries the judgement; the
  Playwright cell only observes (the focus-ring-contrast precedent).
- **EX54** applied — recalibration binds to rubric revision; composed with FR3's
  graded corpus, per-workstream-open re-runs, and the recorded miss rate.
- **EX55** applied — W0.1 names the census domain by path (live `studio-source/`,
  excluding the two preservation trees, whose archive rule is stated); the pre-stated
  81 is removed — the plan's dated evidence note records the first-hand live count
  (79 at 2026-08-02) with the census artefact as the sole authority; the charter
  carries the same domain statement.
- **EX56** applied, Director-CONFIRMED (heads-up event `4e2797bf`; ruling event
  2026-08-02T21:41:53Z) — W3.0 carries a dated ADR-213 §3 amendment scoped ONLY to
  the consumption-mechanism description, with the ruling's precision point: the
  amendment records BOTH shapes' roles (the studio seeds remain the tier-3
  token-sufficiency proof, unchanged in purpose; ADOPTED tier components paint via
  kit recipe classes — the structurally stronger form of the no-fork invariant);
  the re-wrap REJECTION and curation doctrine explicitly unchanged. The E14/E66
  round-1 ledger rows get a dated correction.
- **EX57** applied — the §2 amendment states Oak's status: Oak's manifest carries the
  non-token axes and REFERENCES the kit-derived generated projection for its token
  block; non-Oak identities author theirs; no Oak token is authored twice; W2.3's Oak
  input path is explicit.
- **EX58** applied — the obligations map and W2.2's acceptance gain the ADR-041
  intra-design + ADR-213 §4 amendment (recording the emitter edge, or the
  out-of-tree-artefact no-edge rule that proves it).
- **EX59** applied — the W0.3 clause is rewritten: ADD a §Charter pointer + row
  table; §Projects rows point at charter rows instead of restating consumption
  prose; one edit, one home (with EX76).
- **EX60** applied — the charter lands as its own new ADR (PDR-019) citing ADR-213,
  with ADR-213 taking a one-line pointer amendment; the a11y DoD entries point at
  ADR-147 + `accessibility-practice.md`; the kit's stricter 44px floor is recorded
  once in the kit's own contract and referenced.
- **EX61** applied — with D19/FR6: the provisional hub reading stays in §Decision log
  until the W0 pre-read resolves it; the charter ADR carries only the resolved form.
- **EX62** applied — the ADR-147/ADR-121 amendments widen to true the stale
  CI-promotion clauses to the landed state and replace plan-item pointers with
  outcomes.
- **EX63** applied — every `clears_when` reduces to one sentence; provenance moves to
  the body (§Owner rulings / §Decision log); the E63 round-1 row gets a dated
  correction.
- **EX64** applied — a legend line lands under the v1→v2 note (id convention + report
  path); the strategic node's citation gains the path in its companion edit.
- **EX65** applied — both occurrences reworded to "the delivery tail ADR-217 §1's
  2026-07-31 amendment assigns to MCP-448".
- **EX66** applied — new W2.0 story: the identity-data home is a new
  `packages/design/` workspace (name at seat discretion) holding manifests, token
  trees, identity CSS layers, and assets; `DESIGN_PACKAGE_IMPORTS` entry +
  `createDesignBoundaryRules` branch (specifier and path-zone forms) + dated ADR-041
  design-row amendment are its acceptance lines; the emitter reads it at build time
  (a file read, never an import edge — stated).
- **EX67** applied — W2.3's mechanism is per consumer: emit-into-the-consumer codegen
  for the kit script, the tier's type file, and the demo label maps; the build-check
  lives in `oak-design-tokens`, the sole permitted join point.
- **EX68** applied — the Director's ruling (default-decline branch + curation
  criterion; coverage = recorded decision, never construct-per-class).
- **EX69** applied — the shared demos test harness (origin gate, cross-origin
  interception, apply-state) is hoisted above the demos tier in the widened W0.8;
  the `no-cross-demo` rule lands in the same PR, red-proven against the pre-hoist
  shape.
- **EX70** applied — W0.8 also re-homes `validate-kit-assets`/`kit-asset-parity` with
  the copy roster derived from the workspace inventory; W1.1/W5.1's plumbing
  contract gains kit-copy delivery + parity rows.
- **EX71** applied — §Relationships gains the `productionisation-and-reuse` row: a
  dated re-homing amendment on that plan records `ws0-topology-demos-tier`'s
  demos-tier boundary substance as carried by W1.1/W5.1 here, with
  `ws1-token-consolidation`'s disposition stated in the same amendment.
- **EX72** applied — W0.8's home is named: root repo-validators beside
  `validate-boundaries` (`packages/core/oak-eslint/scripts/`); the design-tier arm is
  dropped.
- **EX73** applied — the ADR-041 amendment adds the demos matrix row (outbound
  allowances enumerated) alongside the enumeration entries.
- **EX74** applied — W2.2 states the §1 move-out per identity (the authored sheet's
  substance becomes authored config in the W2.0 home; the served
  `public/brands/*` copies and their parity rows are re-pointed or retired in the
  same migration landing; no identity served by both).
- **EX75** absorbed-with-correction (deviation from the suggested cure, grounds
  stated) — the round-1 "blocking dependency" framing was itself the defect: the
  dated re-homing amendments make THIS node the owner of the three workstreams at
  its landing change, after which no cross-corpus blocking edge exists;
  `depends_on: []` is then simply true. The frontmatter comment and §Relationships
  are rewritten to say so. Promotion of the backlog plan (or a minted corpus node)
  cures a condition that no longer obtains once the framing is corrected.
- **EX76** applied — with EX59.
- **EX77** applied — `packages/design/README.md` joins W0.3's correction set
  (verified: `oak-design-react` and `oak-design-assets` missing).

## Frame findings

- **FR0** applied — the plan is re-sequenced: the design grammar + composed page set
  move to W1 time, and an early showcase wow probe (two composed showcase pages,
  kit-class painted) lands at an owner checkpoint BEFORE W2/W3 spend; W3 families
  land beneath approved pixels page by page.
- **FR1** applied — with EX50: the styled demo gains its content story and W5's
  checkpoint gains its object.
- **FR2** applied — demonstration density becomes a designed quantity: the page-set
  artefact carries a per-page feature budget adjudicated by the W0.7 instrument;
  fold-into-composition dispositions are instrument-reviewed design decisions;
  low-glamour census rows may satisfy the matrix in the reference tier without
  per-gap owner ceremony.
- **FR3** applied — the instrument calibrates against a graded corpus (deliberately
  degraded export-page variants as additional must-fails), re-calibrates at each
  workstream open and on every rubric revision (EX54), and records its miss rate
  against owner verdicts.
- **FR4** applied — W2.9's checkpoint carrier is named: per-identity static builds of
  the composed pages; specimen carriers are barred from owner-checkpoint objects.
- **FR5** applied — with EX27: the reordering envelope replaces the blanket rule, and
  the owner's non-trivial CSS re-ordering requirement gets a named demonstrating
  surface (a declared-sequence composition variant).
- **FR6** applied — a zero-cost hub wow pre-read lands in W0 (serve the existing hub,
  owner browses, verdict recorded); a failed pre-read mints scoped visual-cure
  stories with budget into the plan body immediately.
- **FR7** applied — a closing whole-demo checkpoint per demo (owner browses
  end-to-end), a cross-page cohesion clause in the W0.7 rubric, and batched page
  verdicts (composed sets, never a drip of single-page asks).
- **FR8** applied — the first-light path is thinned: the instrument's v0 is the
  committed rubric applied manually side-by-side (mechanisation is a later story,
  off W1's critical path); the `prefers-contrast` route moves from W0.2(c) into W2's
  axes/overlay work; W1's W0 gate set is enumerated; the first render doubles as a
  live calibration sitting.
- **FR9** applied — the coverage reading of "full optional React component set" is
  carded to the owner as a new frontmatter gate clearing at W3.0 open, and joins
  §Decision log as a flagged seat reading until his word.
