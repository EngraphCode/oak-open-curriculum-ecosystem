# Component-System Architecture — Concept Exploration (2026-07-19)

**Commissioned**: owner, session Caracal wakes Tunnel (265648), under ultracode effort —
the third `/oak-concept-exploration` invocation of the AIP-137 lane, post-ADR-213 (Proposed).
**Contract**: not a re-open of the formed decision — an adversarial verification giving
ADR-213 §3 its own evidentiary legs (confirm / refine / overturn, clause by clause) ahead of
the owner's ratification gate. Harrier rides Updraft (416a38) and Salmon binds Undertow
(de5c10) independently returned discharged-by-recognition verdicts on re-running the
exploration; this record is the complement their verdicts anticipated.

**Method**: orchestrated fleet (27 agents, 5 phases): four grounded readers (kit consumption
docs; hub shipped reality; non-React surfaces; estate doctrine) → two framing agents
(movements 1–2) → five option-advocates with adversarial priors (platform-first class
library; headless composition; shared workspace now; light-DOM custom elements;
oak-components parity) each verifying live vendor claims → three refute-default lenses per
proposal (a11y-as-blocking-gate; maintenance economics; estate fit) → one synthesis
(movement 4). Verdict board:

| Proposal | a11y | economics | estate-fit |
| --- | --- | --- | --- |
| Platform-First Class Library | REFUTED (high) | survives (medium) | REFUTED (high) |
| Headless Composition (ADR-213 §3) | REFUTED (medium — sequencing/self-description, not shape) | survives (medium) | survives (high) |
| Shared workspace now | REFUTED (high) | REFUTED (high) | REFUTED (high) |
| Light-DOM custom elements | REFUTED (high) | REFUTED (high) | REFUTED (medium) |
| oak-components Parity Oracle | survives (high) | REFUTED (high) | survives (medium) |

The synthesis below is the fleet's movement-4 output, verbatim.

---

# Movement 4 — Synthesis: the component-system architecture for the Oak open-curriculum estate

Exploration of the component-system question across five adversarially-verified proposals (Platform-First, Headless Composition, Workspace-Now, Custom-Element Carrier, Parity Oracle), three lenses each (a11y-as-blocking-gate, maintenance economics, estate fit). Scoreboard: Headless Composition survived two lenses outright and was refuted on the third only for sequencing and self-description, not shape; Workspace-Now and the Custom-Element Carrier were refuted on all three; Platform-First was refuted where it redrew the owner's allocation and exempted the platform from audit, but contributed the most verified corrections; the Parity Oracle survived a11y and estate-fit but died on economics. The synthesis below is Headless Composition's skeleton wearing the survivors' organs.

---

## 1. THE ARCHITECTURE

**Name: Contract-first headless composition, symmetric-audited, adopted at need.**

The component system is not a React component set. It is:

1. **A styling contract** — the tier-3 token CSS and the `.oak-*` class library, one namespace, CSS canonical (DTCG and terminal-theme are generated projections), converged via the Stage A/B atomic switch. This is the only layer that provably crosses all four rendering substrates.
2. **A routing chooser** whose default engine is the platform, run against *verified* support floors, inside the owner's widget-class allocation.
3. **Base UI as the admitted default library for the residual hard set** (menu, combobox, auto-activating tabs, toast, slider, multi-select listbox), adopted per widget at first materialised need, never ahead of it — pinned exact in `package.json`, per-component imports, wrapped per §7b.
4. **A symmetric audit doctrine**: the wrapped-widget checklist obligation binds *every* construction path — library wrap, hand-rolled APG module, and platform primitive alike. The browser is a vendor too. No path ships on asserted accessibility.
5. **Mechanised guards** replacing README discipline: exact pin with `package.json` as source of truth; bump ceremony (batched, elective — pins make vendor cadence *our* cadence); eslint widget-class allowlist per app (coarse, refreshed at bumps); liftability lint on `components/widgets/**` covering imports **and** styling (classNames restricted to `.oak-*`/token classes — an import-clean widget styling-coupled to an app's Tailwind pipeline is not liftable); terminal token-path resolution test inside the design package build so a token reorganisation fails there, not at a downstream import.
6. **A patched consolidation trigger**: second *app* consumer of the same *composed* widget — **plus** the grandfather patch: a second app needing a widget *class* that already exists hand-rolled in another app counts as a material touch on the grandfathered copy, so the trigger fires on class convergence, never letting hand-rolled Tabs and Base UI Tabs coexist forever with no rule firing. When it fires: widget + tests + checklist record move together, and every checklist names the CSS delivery, class-library version, and theme set it covered — the audit accounting is honestly **1+N** (one behavioural audit amortises; each surface retains its visual pass: focus appearance, forced-colors, contrast in its real CSS context).
7. **A hard sequencing precondition**: the ADR-147 gate extension — owner-ratified theme cardinality, Playwright+axe per ratified theme, a forced-colors render check, pre-push/CI promotion (item 0d) — lands **before** the first Base UI widget ships. Today the ship condition ("passes in all five themes + forced-colors") has no executor: the gate covers two themes, no forced-colors tooling exists, and the checklist contradicts itself (×4 vs five). A gate that cannot run is discharged by assertion, which is the Radix failure mode wearing our own colours.

**What lands now, independent of any future widget:**

- **Intra-hub behaviour consolidation.** Consolidate-at-second-consumer has already fired *inside one app*: TabsBlockView reimplements the roving pattern quiz-keyboard.ts encapsulates and cites it as "the precedent"; the synthetic-key helper is copy-pasted five times. Cure: a hub-local `components/widgets/behaviour/` module (liftable convention) — preserving **two named key-set contracts** (radio: Up/Down/Left/Right/Home/End with the any-key fall-through guard that exists because generic key handling once revealed quiz answers to a pupil tabbing through; tabs: Left/Right/Home/End), never one flattened abstraction. The migration is a behaviour-bearing refactor and gets an SR spot-check, per the symmetric-audit doctrine.
- **Fixtures-as-parity, inside oak-design-system**, against its own four compiled components — where reference markup and CSS co-live and update atomically. This converts the "by construction, unchecked" no-drift claim into a checked one without any package move, and it is where the `.oak-*` string-coupling risk actually gets caught.
- **Doc corrections via design-sync**: the §5b pin note misattributes the Checkbox/Switch and Tabs `keepMounted` changes to v1.3 (vendor records them at v1.0.0-rc.0; v1.3.0 stabilised Drawer; v1.0 stable is Dec 2025, not "2026"); the popover hint row must be annotated behaviour-only (role, keyboard pattern, and announcement are per-use obligations — the bare attribute cannot satisfy the checklist's own tooltip row); anchor positioning is progressive enhancement only until ~2027; customizable select is banned as load-bearing (not Baseline, SSR hydration warnings); the date row is rewritten (below); one sentence in pairing-ark-ui.md names `@zag-js/vanilla` (verified published, 1.42.0) as the no-framework binding and records **light-DOM-only** as a closed constraint (cross-root ARIA ID references are broken; Reference Target is an unshipped WICG proposal).
- **Hub evidence re-graded.** The hub's hand-rolled widgets are the estate's only shipped widget code, and they are *candidate* evidence, not gate-passing evidence: jsdom axe with color-contrast disabled, light-only, zero recorded SR pairs anywhere in the repo, AA asserted in comments. They are neither "legacy" nor "the proven alternative" until they pass the estate's own bar.

**What is explicitly rejected, with the exploration's own grounds:** pre-styled libraries (derivable from the token contract — a second styling system forking tier-3); re-wrapping the class library (same fork); a shared React component workspace now (refuted 3×: zero styleable consumers, fixture rig with no reference, a theme gate needing the dependency the package forswears); a custom-element carrier landed ahead of need (refuted 3×: pre-upgrade ARIA contradiction, undocumented Zag binding path, doubled audit for zero consumers — the *creation gate* survives as the whole decision); adopting/vendoring/runtime-importing oak-components (styled-components in maintenance mode by its maintainer's own statement, next-cloudinary peer dependency, two themes vs five, forced `'use client'`); a standing parity-oracle gate (guards token *definitions* while the demonstrated drift channel is point-of-use raw values — CalloutBlockView's four hexes, PlayChip's tokenless shadow — invisible to it by construction).

### Contributor playbook

**Static content block.** Semantic HTML + `.oak-*` classes + tier-3 tokens per the §7 recipe. No import, no React component, no `'use client'`. New value → new token, never a raw value; new colour pairing → contrast-audit list. *Honest caveat:* this path is blocked in the hub until Stage A/B convergence plus hub class-library adoption land — interim hub rule is @theme tokens only, zero new arbitrary values or raw hexes, with a point-of-use no-raw-values lint landing with the convergence lane.

**Hard widget — tabs.** First ask whether it is genuinely tabs; a disclosure set routes to `<details>` (shipped, RSC, zero JS — the one row where doctrine and shipped observation independently agree). Real tabs in the hub today: the consolidated hub behaviour module (grandfathered paradigm, now one copy). Real tabs in a new app: Base UI per §7b — tabs sit inside the owner's Base UI allocation, and the moment a second app needs the class, the grandfather patch fires and the estate converges on one construction. Leaf `'use client'` file in `components/widgets/`, styling on library parts and `data-*` state attributes with `.oak-*` classes only, checklist with a real SR pair recorded in the PR.

**Hard widget — combobox.** No platform primitive; residual set; Base UI at first materialised need (a ticket, not an anticipation — zero shipped instances exist today). Precondition: the gate extension has landed. Pin exact, wrap per §7b, real-SR checklist (combobox announcement is a known NVDA/VoiceOver divergence locus — this is where the rotating two-pair matrix earns its keep), pairings into the contrast audit, admission recorded in DECISIONS.md with date.

**Date picker.** Three-way split, replacing the old row: (1) known/memorable dates → GDS-style multi-field text inputs (`inputmode="numeric"`) styled by `.oak-*` — the most-audited public-sector design system deliberately routes away from `<input type="date">`; (2) calendar/range/locale needs → React Aria date widgets, the scoped admission, `/date`-style capability boundary recorded in the app README; (3) `<input type="date">` not load-bearing — its picker is browser chrome outside the DOM axe can see, un-themeable by `[data-theme]`, and its pairings cannot enter the contrast audit (owner fork 4).

**New MCP view.** React inside the single self-contained bundle; token CSS via `@import` plus the 76-variable host bridge, untouched; both ADR-147 levels (resource-level Playwright+axe with token CSS fixture, and basic-host integration) — neither alone suffices. No behaviour library inside the 233KB committed constant without a materialised need. **Known trap, verified:** the widget bundle carries token CSS but *not* the class library — a component emitting `.oak-*` classes there renders with none of its focus/target/forced-colors contract while every gate stays green. Solve CSS delivery into the bundle before any shared component emits `.oak-*` into a view. The landing page's convergence is tokens, not components — its only interactive need is already met by native `<details>`.

**Terminal surface.** `import { StatusBadge } from '@oaknational/oak-design-ink'` with a `StatusTone`; colours from the 11-name terminal-theme projection; state never colour alone; NO_COLOR honoured. Nothing browser-shaped ever crosses; tokens cross as vocabulary. New mechanism: the design-package build resolves every terminal-theme token path, so a reorganisation fails there.

**Future second app.** Day one: depend on oak-design-system CSS (the hub's hand-mirrored @theme is the anti-pattern this architecture exists to kill — never repeat it); Tailwind `@theme inline` mapping onto role variables; theme bootstrap as the raw inline head script; app-shell prerequisites (`isolation: isolate` root, `position: relative` body) when the first Base UI widget arrives. Before building any widget class, check the estate inventory: if the class exists anywhere (including grandfathered hub code), the patched trigger fires — converge, don't duplicate. Widgets in `components/widgets/` under the liftability lint (imports **and** styling). When the trigger fires, the workspace is born seeded by the four compiled components, and widgets move with tests and checklists — a file-move, because the lint made it one.

---

## 2. DIFF vs ADR-213 §3, clause by clause

| Clause | Verdict | Grounds (the exploration's own, not transmitted) |
|---|---|---|
| Static/content UI → semantic HTML + `.oak-*` + tokens | **CONFIRMED** | Double-grounded: shipped hub native-first evidence + derivable from the token contract; survived every lens on every proposal. Refinement note: binds in the hub only after convergence. |
| New hard widget (React) → Base UI | **CONFIRMED, with refinements** | No longer transmitted authority: every alternative posture was adversarially refuted (platform-default-with-redrawn-allocation, workspace-now, custom-element carrier, oak-components adoption); vendor contract verified live (React 19 peers, headless, per-component imports, vendor a11y seam matching the checklist exactly); the counterfactual hand-rolled path carries a demonstrated bug class and zero SR records. Refinements: adoption at materialised need only; preconditioned on the gate extension; pin source of truth is `package.json`; Next 16 fit remains inferential — first adoption smoke-tests it. |
| Date/time/locale → React Aria, scoped | **CONFIRMED; date routing REFINED** | The scoped admission survived every attack (only credible accessible date/time story). Refined: GDS multi-field inputs are the default for known dates; React Aria for genuine picker needs; native date input not load-bearing. |
| Non-React/multi-framework → Ark UI/Zag.js | **REFINED** | Row survives as routed optionality behind a creation gate (no package, no recipe ahead of need — the pre-baked carrier was refuted 3×). Concrete binding named now in one sentence: `@zag-js/vanilla`, light-DOM-only (closed shape, evidenced). The estate's one shipped non-React surface meets its needs with native `<details>` — the row's first consumer does not exist. |
| Radix → existing code only | **CONFIRMED** | Unchallenged by any lens. |
| Console/TUI → Ink + tone vocabulary, web libraries never | **CONFIRMED, mechanism added** | Independently reconfirmed by every proposal; add the token-path resolution test to the design build (the import-time throw is currently invisible to a token reorganiser). |
| Standing rule 1: no re-wrap of the class library | **CONFIRMED** | Derivable from the tier-3 contract; every proposal, including the hostile ones, kept it. |
| Standing rule 2: no shared workspace yet; second-app-consumer trigger; liftable convention | **CONFIRMED as timing; REFINED three ways** | Workspace-now refuted on all three lenses (zero styleable consumers; fixture rig with no reference; vacuous theme gate). Refinements: (a) grandfather patch — second-app *class* need counts as material touch, else the trigger structurally never fires; (b) liftability lint must cover styling, not just imports, or "provably a file-move" is false against the hub's 552-arbitrary-value substrate; (c) consolidation carries honest 1+N audit accounting. And the *raw* rule fires now intra-hub — the narrowing never licensed intra-app duplication. |
| Standing rule 3: four compiled components off the export surface, seed the future workspace | **CONFIRMED; REFINED** | Fixtures-as-parity lands against them now, in-package — they stop being an unchecked claim while staying exactly where they are. |
| Standing rule 4: grandfathering, migrate-on-material-touch | **REFINED** | Grandfathered widgets are re-graded: candidate evidence, not legacy and not gate-passing. "Material touch" now includes the behaviour-module consolidation (happening now, with SR re-audit) and second-app class convergence. The fiat becomes a named convergence condition. |
| App-shell prerequisites (isolation, body position) | **CONFIRMED at vendor source** | Verified live by two independent proposals — these two transcriptions were correct. |
| §5b pin note ("v1.3 changed Checkbox/Switch/Tabs…") | **OVERTURNED as fact; pin discipline CONFIRMED** | Vendor attributes those changes to v1.0.0-rc.0; v1.3.0 stabilised Drawer; v1.0 stable was Dec 2025. Second measured error in the studio transmission channel — verify-at-adoption is now doctrine, not precedent. |
| Theme wiring: raw inline head script | **CONFIRMED** | Unchallenged; remains the repo-corrects-studio precedent. |
| Tailwind consumption = mapping, not adapter | **CONFIRMED** | Unchallenged; hub convergence lane is where it becomes real. |
| Page composition per region contract | **REFINED** | Doctrine binds nowhere in shipped code (grep-verified). It must acquire a named first binding surface (hub shell at convergence) or be recorded future-surfaces-only (owner fork 5). |
| §5b native-first matrix | **REFINED, four rows** | Dialog fully load-bearing (96%); popover load-bearing **with** per-use designed degradation **and** per-use ARIA obligations (behaviour-only primitive — reconcile with the checklist's tooltip row, which the bare attribute cannot satisfy); anchor positioning progressive-enhancement only, named revisit; customizable select banned as load-bearing. Record routes and revisit conditions without embedded percentages (no-moving-targets). |

---

## 3. Four-movement output contract

### 3a. Problem frame and load-bearing observations

The problem (Movement 2) stands: a contract-and-governance decision, not a technology pick — which invariants are enforced by construction vs checked by mechanism, across four rendering families sharing one substrate, with asymmetric reversibility (per-widget cheap, contract names expensive) and a pending ratification gap. The observations that did the deciding:

- The hub ships every widget class it has needed with zero behaviour libraries (package.json verified) — and its a11y proof is below the estate's own bar: jsdom axe with color-contrast disabled, light-only, zero SR records, AA asserted in comments. Both halves matter; neither alone settles the library question.
- The residual widget set (the classes that would require Base UI) has zero shipped instances anywhere.
- Intra-hub duplication is real and rule-triggering: TabsBlockView cites quiz-keyboard as precedent while duplicating it; five synthetic-key copies; two deliberately different key-set contracts whose flattening would reopen a demonstrated answer-reveal bug.
- The drift channel is point-of-use, not token definitions: raw hexes beyond the one known instance (CalloutBlockView ×4, MediaBox, PlayChip's shadow matching no token) — this killed the standing parity oracle.
- Gate reality: test:a11y is local-only (item 0d open); 2 themes gated vs 5 claimed vs 1 shipped; no forced-colors tooling exists; the checklist contradicts itself (×4 vs five).
- The MCP widget bundle carries token CSS but not the class library — `.oak-*` emitted there renders unstyled while all gates stay green.
- The studio transmission channel has a measured error rate of 2 (beforeInteractive; the v1.3 pin misattribution).
- Vendor facts verified live: Base UI 1.6.0, ~monthly minors carrying behaviour changes; dialog 96%/popover 89.75% (behaviour-only)/anchor positioning 81.67%; customizable select not Baseline; `@zag-js/vanilla` published; custom-elements-everywhere 100% for React/Vue/Svelte; styled-components maintenance-mode by maintainer statement; hub palette matches oak-components on 11/11 spot-checks.
- The estate's only irreducibly human recurring cost is real-SR audit time; every architecture choice should be scored on how much of that one resource it consumes.

### 3b. Assumptions that CHANGED during this exploration

- **A1 (Base UI default)**: transmitted authority → evidence-backed default-at-need. Still awaits its final re-grounding: the first shipped wrapped widget passing the checklist.
- **B1 (hand-rolled paradigm)**: changed twice — from "grandfathered legacy" to "counter-evidence" (Platform-First) to its resting state: *candidate evidence below the estate's own bar*.
- **C1 ("which library, not whether")**: scoped, not inverted — the question shrank to "at first materialised need", but hand-rolling the residual set as default posture was refuted.
- **A9/A10 (audit + pin discipline)**: confirmed and *extended symmetrically* — platform primitives and own modules carry the same checklist; the browser is a vendor.
- **E3 (narrowed trigger)**: found to contain a structural blind spot (grandfathered classes make the trigger unfireable) — patched.
- **A7 (no-drift by construction)**: scope-bounded — the claim cannot cover the MCP bundle, which never receives the class-library CSS; fixtures land now to check what it can cover.
- **E4 (channel error rate)**: doubled — verify-vendor-facts-at-adoption promoted from precedent to doctrine.
- **D1/D2 (oak-components)**: D2 (not a candidate system) now has first-hand technical grounds, not just owner authority; D1 (values mirror production) empirically verified true and *unenforced* — routed to the owner as a question, not to a mechanism.
- **Native-first matrix**: two rows corrected on fetched evidence (date → GDS multi-field; hint → behaviour-only popover), two platform features rejected as load-bearing (anchor positioning, customizable select).
- **Theme cardinality**: surfaced as the single most consequential unresolved integer in the estate — every proof obligation scales by it.

### 3c. Proposed next steps (each with warrant and falsifier)

1. **Consolidate the hub's roving/synthetic-key duplication** into a hub-local `components/widgets/behaviour/` module preserving both key-set contracts, replace-don't-bridge (callers updated, copies deleted, one landing), with an SR spot-check of the migrated widgets. *Warrant:* the raw second-consumer rule has already fired intra-app; a11y-fix non-propagation is the demonstrated harm mechanism. *Falsifier:* the two contracts resist a shared abstraction or the migration fails SR re-audit — keep two small modules and record why.
2. **Land fixtures-as-parity inside oak-design-system** for the four compiled components. *Warrant:* converts the unchecked no-drift claim; single-package atomic updates; lifts with the components if a workspace is ever born. *Falsifier:* fixture-update-only churn dominates intentional markup changes over a quarter — the rig is renegotiated.
3. **Sequence the ADR-147 gate extension before first Base UI adoption**: owner theme-cardinality ruling → Playwright+axe per ratified theme + forced-colors render check + pre-push/CI promotion (0d) → fix the checklist's ×4-vs-five inconsistency. *Warrant:* the ship condition is currently unexecutable; an unexecutable gate is discharged by assertion. *Falsifier:* the tooling genuinely needs a real widget to exercise it — re-sequence to land gate + first widget in one change, never widget-before-gate.
4. **Checklist upgrades**: symmetric platform-primitive/hand-rolled checklist mirroring the wrapped-widget one; rotating two-pair SR matrix (NVDA/Firefox alternating with VoiceOver/Safari per widget class); named SR operator and cadence. *Warrant:* single-SR spot-checks structurally undercover the multi-AT failure class the Radix episode (35 issues) proves; hand-carried code currently ships under the *lightest* audit despite the highest demonstrated risk. *Falsifier:* owner rules the rotating matrix over-ceremony for this estate — record single-pair plus explicit risk acceptance.
5. **Design-sync corrections batch**: pin-note misattribution, v1.0 date, popover row annotation, anchor-positioning and customizable-select rejections, GDS date row, `@zag-js/vanilla` + light-DOM-only sentence in pairing-ark-ui.md. *Warrant:* verified errors in a channel whose correction is bidirectional by precedent. *Falsifier:* per-item — a fresh vendor check contradicting any correction.
6. **Amend and ratify ADR-213**: grandfather patch to the trigger; pin-in-package.json; liftability styling guard; 1+N audit accounting at consolidation; hub-blocked-until-convergence note; terminal token-path test; then Proposed → Accepted, executing the ADR-148 source-format supersession atomically. *Warrant:* the table's rows now carry the exploration's own grounding — ratification stops being transmitted authority. *Falsifier:* owner overturns any row at ratification; the amendments are severable.
7. **One-shot oak-components parity diff script** (throwaway; no workspace, no gate, no ADR amendment) reporting how much of the estate palette matches production 3.0.0. *Warrant:* the cheap experiment before any permanent mechanism; spot-checks suggest near-total match, and the finding (e.g. green-subdued = production mint30 mislabelled; cream unmapped) is owner-decision input. *Falsifier:* none needed — the script is the falsifier for the parity premise itself.

### 3d. Unresolved evidence that could materially change this synthesis

- **No real-SR pass exists anywhere in the estate.** The first checklist run — on either paradigm — is the single highest-value observation outstanding and could re-rank the construction paths.
- **Theme cardinality** (1 shipped / 2 gated / 5 claimed) is unresolved; every audit and gate obligation scales by it.
- **Oak's actual browser floor** is unmeasured (the hub has no analytics stream); the popover degradation's status (fallback vs primary) is undecidable until a proxy exists.
- **Base UI on Next 16** is inferential from React 19 peers, not vendor-claimed — first adoption smoke-tests it.
- **The export-fidelity mandate vs tokenisation collision** is unadjudicated; the hub convergence lane could stall on it, and with it the `.oak-*` path in the estate's only React app.
- **MCP bundle CSS delivery** for class-library styles is unsolved; it gates any shared component reaching a view.
- **Licensing-manifest disposition** (Oak marks outside MIT, hub logo SVGs) remains the standing owner gate it was.
- **`@zag-js/vanilla`** is verified published but never exercised in-estate; the non-React carrier row rests on it.

---

## 4. OWNER FORKS

1. **Theme cardinality and high-contrast level.** *Question:* Is the ratified proof surface 2 themes (current gate), 4 colour trees, or 5 themes + motion axis — and is high-contrast AA or AAA? *Recommendation:* ratify the five-value theme set as the contract target, extend the mechanical gate to all four colour trees at AA before the first Base UI widget, and hold AAA-high-contrast as a separate later decision. No widget ever ships claiming a theme the gate does not cover.
2. **Brand parity with production Oak.** *Question:* Is visual parity with oak-components a goal or an accident of transcription? (Spot-checks: 11/11 values match; the channel is enforced by nothing.) *Recommendation:* run the one-shot diff, then adopt parity-as-documented-vocabulary — a bilingual dictionary in the design-system docs, refreshed opportunistically — never a standing gate; a11y outranks parity wherever they conflict.
3. **SR audit operator and cadence.** *Question:* Who physically drives NVDA/VoiceOver, and at what cadence — per ship, batched with bump ceremonies, or budgeted external audit? Agents cannot do this; it is the estate's scarcest resource. *Recommendation:* owner-run VoiceOver/Safari at each widget ship, NVDA/Firefox alternating per widget class, batched with pin-bump re-audits; the operator named in the checklist so the obligation has an address.
4. **Native date-input chrome.** *Question:* Accept `<input type="date">`'s un-themeable, un-auditable browser calendar inside a themed, zero-tolerance contract — or close the row? *Recommendation:* close it — GDS multi-field inputs for known dates, React Aria for picker needs — with a named revisit if browsers ever expose themeable, auditable date chrome.
5. **Region contract disposition.** *Question:* Bind the region contract at the hub's convergence-lane shell, or record it explicitly as future-surfaces-only? It currently binds nowhere. *Recommendation:* bind at the hub shell when the convergence lane lands; record future-surfaces-only until then, so the doctrine stops being unfalsifiable.