# v1 finding dispositions — design-system-completion plan v2 (2026-08-02)

Authored by the executing seat (Corsair hunts Surf, 4d3282) with the v2 rewrite.
One row per finding in `findings.v1.json` (80 expert E0–E79 by array index, 8
frame F0–F7, 10 landscape D0–D9, 31 dropped-at-cap X0–X30). **Readers**: the v2
re-review fleet (verify your finding's row against the v2 text) and the
Director's adjudication. Dispositions: `applied` (cure landed in the v2 text at
the named location), `absorbed-with-correction` (cured with a stated deviation
from the suggested cure, grounds given), `superseded-by-redesign` (the v2
architecture removes the defect's precondition), `routed` (cure owned by a
named other carrier), `duplicate-of` (same defect as the named row).

## Expert findings

| ID | Disposition | Where / grounds |
| --- | --- | --- |
| E0 | superseded-by-redesign | W4.4 sources build-time emitted projections (schema-typed by W2.1/W2.2), never the export dtcg — no `$type` guessing anywhere; export `$type` completeness stays a W0.5 studio sync-back candidate |
| E1 | applied | §Out-of-scope (Stage B + window binding), W0.1 (two trees censused separately), W4.4 (tree named) |
| E2 | applied | W2.4 — overlays parameterised over identity palette slots; brand-contract amendment via design-sync; acceptance = per-identity HC/CS gate-proven |
| E3 | applied | W2.3 generated roster (five lists verified first-hand); theme-№N falsifier in W2.6 |
| E4 | applied | W2.1 manifest split (JSON-Schema + DTCG token file + declared identity CSS layer); W2.2 re-expression with rules-outside-layer acceptance count |
| E5 | applied | W2.2 identity emitter; W2.6 falsifier consumes it (one manifest file, zero diffs outside identity dir) |
| E6 | applied | W2.5 — mechanism stated (in-process token-pair per identity×theme; rendered axe over specimen-carrier per identity×theme; pinned cell count) |
| E7 | applied | W2.7 + frontmatter gate — session primed with corrected attribution; target-delta framing in §Direction carry-forward |
| E8 | applied | W2.7 — `$type: number` degrees, `semantic.`/`component.` placement, Oak structural zero, token-value assertions |
| E9 | applied | W6.1 — hub story is verification of existing wiring; change only on a failed assertion |
| E10 | applied | W5.3 — no token values in ThemeProvider; `var(--role)` only; `color-scheme` bridge |
| E11 | applied | W0.2(b) + frontmatter item-14 gate + W0.3 simultaneous-fires-item-14 rule |
| E12 | applied | W2.8 — vendored assets, offline-safe, licences, icon set required in manifest |
| E13 | applied | W4.4 — sections derived from token roots with fails-on-unrepresented-root; icons from `icons.json` with own drift check |
| E14 | applied | W3.0 — class→construct mapping rule; coverage = mapping decision per class; no re-wrap mandate remains, so the §3 rejection stands unamended |
| E15 | applied | W4.6 + §Decision log — kit classes paint; Tailwind = composition vocabulary; exit check |
| E16 | applied | W3.3 — config-driven list, layout provider, pre-paint identity bootstrap; falsifier extension |
| E17 | applied | W3.2 — `applied()` scalar snapshot, neutral server snapshot, detection stays CSS-owned |
| E18 | applied | W3.2 — kit-trunk `subscribe` + storage-event bridge |
| E19 | applied | W3.1 prop-API contract; W5.2 tier-consumption decision with 1+N accounting |
| E20 | applied | W3.1 — seed rewrite (kit classes, CSS state semantics, no `style` prop, fixtures-as-parity) |
| E21 | applied | W6.1 — verified baseline replaces the false clause; convergence question named at the check |
| E22 | applied | W4.4 — consumes W2 emitted projections; runtime `getComputedStyle` prohibited as value source; one parity test |
| E23 | applied | W0.1 page census with per-page dispositions; W4.3 expresses from it; W3 coverage derives from the same census |
| E24 | applied | W4.2 — markup deleted, specs re-pointed as regression floor, invariants move with tests, drops stated with reason |
| E25 | applied | W4.6 — arbitrary-value lint in the same PR that adds Tailwind |
| E26 | applied | W3.4 — use-client policy + server-component exit check |
| E27 | applied | W0.6 — hub a11y proof surface as a W0 story, CI-wired |
| E28 | applied | W0.2(c) — `prefers-contrast` CSS fallback + `system`-stored `auto()` consult + two gate cells |
| E29 | applied | W0.3 charter rule (DOM-order divergence = defect) + W4.2 acceptance (scripted Tab-walk/visual-order monotonicity per composition variant) |
| E30 | applied | W2.1 (per-identity trees + pairings required) + W2.5 (ratified levels) + W2.6 (falsifier asserts auto-gating) |
| E31 | applied | W0.2(b) — a11y entries fix-only; dark-link-on-lemon pairing added; item 14 owner-ruled prerequisite |
| E32 | applied | W0.3 — reachable-at-all-times reading; simultaneous surfaces fire item-14 first |
| E33 | applied | W0.3 — enumerated demos-tier a11y DoD |
| E34 | applied | W4.2 — named instrument inventory, re-pointed red-then-green, never deleted |
| E35 | applied | W0.7 — accessibility-expert leg at the same checkpoint, recorded beside the register |
| E36 | applied | W3.1 — APG pattern + keyboard-model tests per interactive component; page-level criteria at page level |
| E37 | applied | W0.3 per-demo pre-paint mechanisms + W5.1 registry with no-unstyled-first-paint acceptance |
| E38 | applied | W2.1 — per-theme OS-signal bindings in the schema; runtime reads the declared roster |
| E39 | applied | W4.3 — the a11y trio in the census/inventory, content generated from the gate's own reports |
| E40 | applied | W2.7 — constraints scaffolded before the owner session |
| E41 | applied | W4.2 — per-page migration landings; no standalone delete story |
| E42 | applied | W2.6 — standing discriminating fixtures + schema-rejection cases + boundary rules; mutation-proven |
| E43 | applied | §Cross-demo — criterion split per demo; hub debt recorded as measured standing debt (548, 2026-08-02); detectors per consumption path |
| E44 | applied | W0.6 — RED from missing assertions; behaviour verified first-hand before authoring |
| E45 | applied | W2.5 — matrix unit stated; cell count pinned; specimen-carrier pattern generalised from showcase-a11y.spec.ts |
| E46 | applied | W0.1 mechanical census + W4.5 generated matrix bound to assertion ids |
| E47 | applied | Every story names describing surface + first RED; W3.1 sliced by family; PDR-132 in §Sequencing |
| E48 | applied | W1.1 + W5.1 — full new-workspace test contract incl. hermetic interception |
| E49 | applied | W6.1 — attributes-before-first-paint cells; styled demo first-HTML case |
| E50 | applied | W2.1 — rejection fixtures with mutation checks |
| E51 | applied | W4.3 — per-page identity-control assertion, set stable across switches |
| E52 | applied | W6.3 — transferring artefacts enumerated by file with destination story ids |
| E53 | applied | §Relationships ADR-obligations map; each amendment an acceptance line of its workstream |
| E54 | absorbed-with-correction | §Relationships re-homing amendments + ADR-213 §3 pointer update. Deviation: the edge is body-carried, not frontmatter — the plan-corpus validator refuses `depends_on` ids outside the anchored estate, and the backlog plan lives outside it (verified live: the frontmatter form is validator-red) |
| E55 | applied | W0.3 — charter as dated ADR-213 amendment; README reduced to pointer + table |
| E56 | applied | W0.3 — attribution corrected; provenance lives in the amendment |
| E57 | applied | W0.3 — kit-side correction set enumerated by path, landing with the re-assignment |
| E58 | applied | §PR-709 dated fact + W6.3 MCP-448 routing under ADR-217 |
| E59 | applied | W1.2 — fresh authoring declared; studio-source pages stay; §1 mechanism not triggered |
| E60 | applied | W0.1 — filesystem enumeration at dated commit, per-member disposition; W4.5 derives rows |
| E61 | applied | W6.1 — verified baseline; verification step replaces the false clause |
| E62 | applied | Every acceptance line typed `repo-safe`/`owner-held`; wow verdict home in §Quality bar 1 |
| E63 | absorbed-with-correction | Frontmatter gate 1 disentangles mint from ratification (the cure's core). Deviation: v2 stays `sketch` until the zero-finding round + the owner's implementation word completes the stamp — the v2 SHAPE has not yet had the owner's glance, and born-sketch discipline governs; the subtree is unanchored so the validator is green throughout |
| E64 | absorbed-with-correction | Census/coverage sets are read-time-derived artefacts; rosters derive from workspace inventory. Deviation: the four-demo set stays enumerated — it is the owner's own amendment wording, a ratified closed set, not an open one |
| E65 | applied | §Relationships — strategic node re-points `serves` to TOOLS-2 (its §Why argues that choice), APP-1 named in prose; companion edit in the landing change |
| E66 | applied | W3.0 + W2.10 — landing-sequence set carried; hard gate re-homed with dated amendment; no §3 amendment needed (no re-wrap mandate survives in v2) |
| E67 | applied | W2 preamble — identity = authored configuration surface; ADR-213 §2 dated amendment; owning workspace `design-tokens-core`; Oak kit direction unchanged |
| E68 | applied | W4.4 — re-sourced to emitted projections (identity-bearing, CSS-derived); iconography from the asset mechanism |
| E69 | absorbed-with-correction | §Relationships — one owner per workstream; `ws-hub-migration` status trued. Same frontmatter-edge deviation as E54 (validator boundary) |
| E70 | applied | §Out-of-scope binding + W0.3 charter consumption-path rows carry the kit-CSS-only rule per demo for the window's duration |
| E71 | applied | W0.8 — instruments re-homed above the demos tier, roster derived, sequenced before W1 |
| E72 | applied | W5.3 — tagged-template lint reusing `findLiteralDesignValues` + non-vacuity leg, red-first |
| E73 | applied | W1.1 + W5.1 — plumbing stories with ADR-041 amendments, boundary legs, depcruise rules |
| E74 | applied | W1.2 — mechanism stated (fresh authoring; pages stay studio-source) |
| E75 | applied | W2.6 — falsifier legs checkable; red proof = illegal import via boundary rule |
| E76 | superseded-by-redesign | v2's drift claims do not rest on the dtcg↔CSS check (W4.4 re-sourced); the 4-tree extension remains `design-system-integration`'s pending `pr2-consistency-check` work, noted in §Relationships |
| E77 | applied | §PR-709 + W6.3 — recorded-closed; carriers named for every adjudicated value |
| E78 | applied | W2.7 — all three identities on the session agenda; BRAND.md updates same change via design-sync |
| E79 | applied | Typed acceptance throughout; wow checkpoint has a recorded home |

## Frame findings

| ID | Disposition | Where / grounds |
| --- | --- | --- |
| F0 | applied | W4.1 — composed pages named first, features mapped on; specimen-primary surfaces fail the matrix by definition; reference tier bounded |
| F1 | applied | W0.7 — instrument specified with rubric, reference corpus, fail state, red-then-green calibration (export passes / rejected page fails) |
| F2 | applied | W1 — the plain demo promoted to first rendered checkpoint, before W2/W3 investment; calibrates the instrument |
| F3 | applied | W0.1 — gap census (kit-vs-requirements, kit-vs-export) with an implementing story per gap class |
| F4 | applied | W0.3 hub wow reading (architecture as-is; visual quality in scope; recorded assumption) + W6.2 checkpoint |
| F5 | applied | W2.9 — identity design authorship as first-class work, each identity passing the instrument |
| F6 | applied | W0.5 + §Quality bar 4 — wow-fail on fidelity-clean page auto-promotes the design change |
| F7 | applied | §Quality bar 3 — wow iterations a distinct loop outside PDR-132 rounds, with a 3-iteration Director route |

## Landscape survivors

| ID | Disposition | Where / grounds |
| --- | --- | --- |
| D0 | applied | W0.1 census dispositions → W4.3 expression → W4.5 matrix derivation |
| D1 | applied | W0.1(a) — page census a committed W0 deliverable with per-page assignment |
| D2 | applied | W2.7 — scaffold-first ordering; structural validation before the session; session prices values |
| D3 | applied | W0.3 + W6.2 — hub inside the wow checkpoints; reading recorded |
| D4 | applied | W0.3 — two existing READMEs cite now; W1/W5 READMEs cite at creation (tracked forward dependency, not a W0 gate) |
| D5 | applied | Per-story W2 acceptance dissolves the ambiguous "validates all three" line; Freedonia values explicitly gate-pending (W2.7) |
| D6 | applied | W0.5 — intake mechanics: surface, read cadence, per-entry blocking word, auto-promotion |
| D7 | applied | W2.10 motion-axis coverage + W6.1 reduced-motion cells + census motion rows in the matrix |
| D8 | applied | §Quality bar 1 — verdict home named (fidelity register / PR checkpoint comment) |
| D9 | applied | W0.3 — charter single-phase in the ADR amendment; README citations phased with tracked dependency |

## Dropped-at-cap

| ID | Disposition | Where / grounds |
| --- | --- | --- |
| X0 | applied | §Review record populated (v1 + v2 rounds) |
| X1 | duplicate-of D4 | applied at W0.3 |
| X2 | applied | §Relationships blocking dependency + W2.10 (body-carried per the E54 validator boundary) |
| X3 | applied | W2.7 gate non-blocking for other stories; expiry surfacing per estate rules; W2 acceptance per-story |
| X4 | applied | Frontmatter gate 1 — mint vs ratification disentangled |
| X5 | applied | W3.2 explicit; W6.1 depends on it; W1 exempt (kit-native runtime) |
| X6 | applied | W0.2(a) — gates verified first-hand before anything else |
| X7 | applied | W0.4 named as W2's input with explicit dependency |
| X8 | applied | §Quality bar 3 — bounded with a Director route |
| X9 | absorbed-with-correction | W5.1 keeps vendor verification at story open (read-nextjs-docs-before-coding binds it there); the risk is recorded, not removed — verifying now would itself go stale |
| X10 | applied | W0.1 dated + W6.4 re-derivation and drift closure |
| X11 | applied | W0.5 — read-at-workstream-open cadence; W6.4 closes the loop |
| X12 | applied | W1 preamble — plain demo is kit-native; no W3.2 dependency (resolved, verified: detection+selection are kit-runtime contract) |
| X13 | applied | §PR-709 — dated fact, not a dependency |
| X14 | applied | §Out-of-scope — recorded assumption, owner-extendable, cheap to correct |
| X15 | duplicate-of X0 | §Review record |
| X16 | absorbed-with-correction | The wow verdict is deliberately owner-held subjectivity (his word IS the bar); v2 makes it recordable (§Quality bar 1) and instrument-preceded (W0.7) rather than pretending it is mechanical |
| X17 | applied | W6.1 — mechanical attribute-before-first-paint restatement |
| X18 | applied | §Cross-demo — "reachable" defined (visible control, keyboard-operable, ≤2 activations) |
| X19 | applied | §Cross-demo — reduced-motion behaviour = motion tokens collapse per `data-motion` semantics |
| X20 | applied | W4.5 — owner's recorded word per accepted gap |
| X21 | applied | W4.2 + §Quality bar — divergence dispositions recorded in the fidelity register; authority = the owner's checkpoint verdict |
| X22 | applied | W2.6 — standing CI falsifiers, mutation-proven once, never one-off |
| X23 | duplicate-of D4 | applied at W0.3 |
| X24 | applied | W0.1 — census structure = generated artefacts with dispositioned rows |
| X25 | applied | W0.2 — evidence = linked gate outputs in the PR |
| X26 | applied | W2.1 — validation = schema + rejection fixtures + mutation |
| X27 | applied | W3.0 — coverage table complete against the census |
| X28 | applied | W3.1 — per-family fixtures at each landing; W0.8 instrument covers literals continuously |
| X29 | applied | W4.4 + W4.5 — the token page is a census row bound to assertions |
| X30 | applied | §Cross-demo — keyboard-complete over every interactive element |

## Corrections (dated appendix, 2026-08-02 — round-2 adjudicated; original rows above left as written)

Appended by the executing seat after the round-2 fleet review
(`findings.v2.json`, `adjudication.v2.md`); the original rows are the record the
round-2 fleet read and are not rewritten. Each correction names what was actually
true.

- **E47** — recorded `applied — Every story names describing surface + first RED`;
  round-2 EX40 verified only 3 of 40 stories named a describing surface. Corrected
  disposition: `absorbed-with-correction` — v2.1 states one describing surface per
  WORKSTREAM (each preamble) with stories tagging their boundaries against it.
- **E14/E66** — recorded `applied — no re-wrap mandate remains, so the §3 rejection
  stands unamended`; round-2 EX18/EX56/EX68 (three-expert convergence,
  Director-verified) showed W3.0's unconditional mapping rule was the wholesale
  shape, and the kit-class-painting decision collides with §3's descriptive
  consumption-mechanism clause. Corrected disposition: the mapping vocabulary gains
  the no-construct default (Director ruling), and W3.0 carries a dated §3 amendment
  scoped to the consumption-mechanism description recording both shapes' roles —
  the REJECTION itself stands unamended, which is the part the original rows got
  right.
- **E63** — recorded the sketch-vs-ratified deviation only; round-2 EX63 showed the
  finding's other half (multi-paragraph decision narrative in frontmatter
  `clears_when`, against the delivery contract) was undischarged and survived into
  v2's gates. Corrected disposition: `absorbed-with-correction` — v2.1 reduces
  every `clears_when` to one sentence and moves provenance to the body (§Owner
  rulings).
