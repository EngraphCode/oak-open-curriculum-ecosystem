# AIP-137 Stage B: the studio↔repo token interchange contract — concept exploration

**Author**: Heron seeks Bluff (`ef3eb0`, claude-code/fable-5), Implementer, design-system lane
(successor to Caracal wakes Tunnel `265648`). **Date**: 2026-07-20. **Thread**:
`design-system-integration` (AIP-137). **Method**: the concept-exploration skill's four
movements (metacognition ⇄ reason), run before Stage-B solution options are formed — the two
open questions Caracal's handoff named ("export re-rooting vs repo-boundary normalisation";
"the currentColor runtime-token clause") are treated as symptoms of one unshaped concept, not
as a formed decision. Every observation below was verified first-hand on 2026-07-20.
Provenance (epoch-2 correction — three sources, each cited inline at its site): the
baseline observations against the working tree at `packages/design/` (verified identical
to `origin/main` for that subtree at 08:14Z) and the landed `#412` validation layer;
the observations re-grounded during this PR's review rounds (O4, P1's contrast
projection, P5's resolver citation) against **#423's tip `e6b939a89`** and, after #423
merged (09:53:52Z, `dbfc765dd`), against post-#423 `origin/main`. Nothing here edits
ADR-213 or the plan; §Proposals routes the edits.

## Review contract

- **Purpose and impact**: shape the `ws-stage-b-convergence` implementing change and a
  proposed ADR-213 §2 dated amendment; the Stage-B implementer and the amendment's
  ratifier are the readers whose next actions this report serves.
- **Substantive questions a review should test**: (1) are observations O1–O9 reproducible
  from their cited sites; (2) does each proposal's warrant actually follow from the
  observations it cites; (3) is the per-consumer projection frame sounder than a single
  normalised interchange tree (P1's falsifier is the crux); (4) is any token value class
  left without a declared per-consumer disposition?
- **Evidence standard and authority boundary**: every claim is first-hand-verified against
  the named files at the stated date; transmitted claims (studio README, plan text) are
  marked as such. The report asserts no decisions — ADR/plan edits are proposals routed to
  the Director-sequenced doctrine slot, and studio-side fixes are routed to the
  design-sync lane.
- **Non-goals**: this report does not authorise the Stage-B change, any ADR/plan edit, or
  any studio edit; it does not choose the motion-cascade cure or any matter outside the
  two named Stage-B questions.
- **A successful review** challenges at least the crux falsifiers (P1, P3) against the
  evidence and reports any missing evidence or contract mismatch as a finding on the
  landing PR's threads, where each receives a first-hand-verified disposition.

## Movement 1 — load-bearing observations

- **O1. Three naming conventions coexist for one token.** The kit's canonical CSS declares
  bare variable names (`--text-primary` at `colors_and_type.css:264`, `--color-accent` at
  `:319`, the `--state-*` trio at `:327–329`) with the `--oak-<name>` prefix on colour
  primitives only. The kit's DTCG export round-trips those CSS names into dot-paths
  (`text.primary` → `--text-primary`; `dtcg/README.md` §Conventions) except the palette,
  which it pre-rooted at `oak.color.<name>` to meet the repo convention. The repo pipeline
  (`design-tokens-core/src/index.ts`) derives names as `--oak-` + full path
  (`toCssVariable`), so the same grey is `--oak-grey50` (kit CSS, `colors_and_type.css`
  palette block), `oak.color.grey50` (export path), and would emit as
  `--oak-oak-color-grey50` (repo flattener) — the export's "lands on their convention"
  claim is mechanically false, as the Stage-A import found.
- **O2. Variable identity is derived from tree paths, not declared.** `toCssVariable(path)`
  is the real interchange contract: any re-rooting of trees **renames every emitted CSS
  variable**, and MCP App views consume those names from the generated `index.css`
  (`build-css.ts` emits `:root`, the dark media query, and `[data-theme='dark']`). A path
  convention decision is therefore a consumer-migration decision in disguise.
- **O3. Tier classification is root-segment fall-through.** `getTokenTier` maps root
  `semantic` → semantic, `component` → component, **anything else → palette**. The kit's
  semantic trees root at bare role names (`bg`, `state`, `text`, …), so the repo pipeline
  would classify them as palette and fail fast on their first reference ("Palette tokens must
  use raw values"). Safe by accident, not by design; the designed rejection is `#412`'s
  `validateTreeRoots` (caller-supplied allow-list, structured `Err`).
- **O4. Two value-grammar regimes serve the contrast path — an instrument and the live
  gate** (round-4 correction; verified against #423's tip `e6b939a89` and the landed
  ADR-213 §2 amendment of 2026-07-20). `#412`'s `colour-literals.ts` defines the closed
  grammar (`#rrggbb` | `rgb(R G B / A)` | full-string reference; expressions rejected with
  structured `Err`) — the amendment scopes it to trees *required to be expression-free*,
  which the kit's semantic trees deliberately are not. The **live four-theme gate**
  (`design-system-contrast.ts`) instead composes base ⊕ overlay, resolves references to a
  **fixpoint** (`resolveColourTokens`; in-tree forward references are by design), filters
  the WCAG comparand to six-digit hex by **one closed post-resolution value-shape rule**
  (`toHexComparand`), and guards drift with a **pinned expected comparand count per
  composed theme**; a manifest pairing on any dropped path surfaces as `unresolved_token`.
  The roots, overlay-coverage, and manifest-parse validators from #412 run in the gate
  path; the colour-grammar validator does not. The export carries 20 functional values
  verbatim (3 × `color-mix` in `semantic.light` `state.*`; 12 × `calc`, 1 × `min`,
  3 × `minmax`, 1 × `clamp` in `component.json` — the studio README's "15 tokens carry
  `color-mix()`/`calc()`" undercounts by omitting the grid/layout functions), and the
  studio's own contract doc instructs "a consuming build should pass them through
  untouched" — pass-through is the CSS-emission consumer's contract; the contrast path
  drops by value shape what it cannot statically evaluate.
- **O5. Two of the three `color-mix` tokens can never be statically resolved — the third
  can.** `state.hover`/`state.pressed` mix `currentColor` — context-dependent at paint
  time, no export-time pre-computation exists. `state.selected` mixes a referenced role at
  24% alpha: statically evaluable to an alpha colour (a different class — its residual
  problem is compositing-dependent contrast, the same disposition the alpha literals
  already have), never paint-time-contextual. None of `state.*` appears in
  `contrast-pairings.json` (0 hits; 34 pairs, all resolvable solid roles).
- **O6. The 17 layout expressions are dimension-class, not colour.** The 12 `calc` values
  parameterise layout off `{density}` and `{space.*}`, and the `min`/`minmax`/`clamp`
  values (round-3 review addition) are grid/sizing expressions of the same class — all
  pass-through-legitimate for CSS emission and outside the colour grammar's scope by
  value type. `{density}` is itself a component-tier token
  (`component.json:212`, mirroring the `--density` brand knob), so component→component
  references exist in the export — a second dialect-alias class alongside the
  semantic→semantic aliases ADR-213 §2 already names. `resolveCssValue` would emit them as
  valid CSS `calc(var(…))`; only the tier-direction rule rejects them.
- **O7. The four semantic trees are sparse overlays over light** (139/63/67/12 leaves) —
  confirmed as the studio's own semantics (the `light-dark()` second arms and `[data-theme]`
  override blocks), already ratified into the amended §2 overlay model, with base ⊕ overlay
  composition landing in `#423` (`compose-theme-tree.ts`).
- **O8. The terminal contract is 11 fixed dot-paths in repo vocabulary**
  (`terminal-theme.ts`: `component.page-background` … `semantic.focus-ring`), resolved at
  build so a token reorganisation fails at build, not at import.
- **O9. The studio's contract doc is now in-repo and load-bearing** (`dtcg/README.md`,
  re-obtained after the Stage-A omission): it states generation direction (CSS canonical),
  the path→name round-trip rule, the prefix delta and two candidate cures (one of which —
  widening `PALETTE_VARIABLE_PATTERN` — ADR-213 §2 bans), the pass-through instruction for
  expressions, and `system`-as-behaviour. It also claims 25+7 = 32 manifest pairs; the
  manifest holds 34 — description drift on the studio side.

## Movement 2 — the problem frame

The unshaped concept is the **interchange contract between two projections of one system**.
The DTCG export is a faithful projection of the kit's CSS namespace; the repo pipeline is a
projector from DTCG trees into consumer artefacts (web CSS variables for MCP views, the
terminal theme, contrast reports). ADR-213 §2's Stage-B parenthetical ("trees rooted
`color.`/`semantic.`/`component.`, dialect aliases resolved, expressions pre-computed")
implicitly frames the export as a defective repo tree awaiting normalisation. The
observations invert that: each "defect" is a fidelity property of the projection —
name round-tripping (O1), runtime-computed values (O5), parameterised dimensions (O6),
sparse overlays (O7), dialect aliases (O6). The gap that harms Stage-B implementers is not
"which side transforms" but that **five distinct transform concerns are conflated into one
imagined normalisation step**: naming (O1/O2), tier classification (O3), per-consumer value
grammar (O4–O6), theme composition (O7, resolving via #423), and alias resolution (O6).
Success is a Stage-B change where emitted names for existing consumers are byte-stable or
migrated with a checked map, every value class has a declared per-consumer disposition, the
studio contract doc states the true convention, and validators recompute all of it.

## Movement 3 — inherited shapes that changed

- **The re-root-vs-normalise binary dissolves per consumer.** The contrast gate (#423)
  already reads the kit trees natively — overlay-composed, manifest paths in kit vocabulary —
  with no re-rooting anywhere. The end-state web surface is the kit's own CSS (ADR-213 §2:
  the design system owns web CSS delivery), where the kit's bare names are the vocabulary and
  re-rooting never happens. Only the **transitional** `index.css` for MCP views and the
  11-path terminal projection need kit-path→repo-name resolution at all. The question "where
  does the transform live" becomes "which consumer owns which projection" — and each answer
  is small and checkable instead of one tree-wide rewrite on either side.
- **"Pre-computed at export or rejected at boundary" is a false dichotomy.** O5 exhibits a
  third, legitimate class: runtime-computed values that no static consumer can ever resolve.
  Treating them as an "unhandled case" makes them a standing exception; declaring the class
  makes the export honest and the gate's exclusions contractual. The landed #423 mechanism
  (emission passes through; the contrast comparand drops non-hex value shapes
  post-resolution, guarded by pinned counts) was the right behaviour awaiting its name.
- **The export generator is first-class repo-adjacent work.** Under the owner's integration
  ruling the studio is not an upstream to petition; export-generator corrections (the false
  convergence claim, the pair-count drift) are design-sync work items of the same standing as
  repo code — which removes the "fix it on our side because we can't touch theirs" pressure
  that made boundary normalisation look inevitable.

## Movement 4 — proposals

Each proposal names its warrant and a falsifier. Sequencing constraint: ADR-213 and the plan
file are live conflict surfaces on `#423`/`#414` (verified by the cycle-3 seat, 08:16Z) — the
doctrine edits below land **after BOTH `#423` merges AND `#414`'s plan-file re-resolution
completes** (the Director's doctrine-writer queue, slot (c)), on Director sequencing, never
concurrently.

1. **Amend ADR-213 §2 (dated) to a per-consumer projection contract.** Replace the
   export-normalisation parenthetical with: the export is the kit-vocabulary projection; the
   repo consumes it through three declared projections — contrast (native read, overlay
   composition, fixpoint resolution, post-resolution hex-comparand filtering with
   pinned-count drift nets — the landed #423 mechanism, round-4 correction), web CSS
   transitional (explicit naming map, P3), terminal (explicit 11-path map, P5).
   *Warrant*: O1–O3 (naming is derived,
   so tree-shape normalisation is consumer breakage); the #423 gate already proves the
   native-read projection. *Falsifier*: if a projection cannot be expressed as a total,
   checked map over the export (e.g. repo-only tokens with no kit counterpart and no recorded
   disposition), the per-consumer frame is wrong and a single normalised interchange tree is
   the honest shape after all.
2. **Declare the `runtime-computed` value class — paint-time-contextual values only.**
   Contract text (ADR-213 §2 amendment, same change as P1): values whose computation is
   paint-time-contextual (`currentColor` mixes: `state.hover`, `state.pressed`) are exported
   verbatim, pass through to CSS emission, are excluded from static contrast resolution
   **by contract**, and are barred from the terminal's 11 paths. The terminal bar does NOT
   yet exist mechanically (epoch-2 correction: `requiredColour` checks path presence only,
   and resolution carries expressions verbatim), so it is named Stage-B work: the terminal
   map's build check gains a value-shape leg — every mapped value must resolve to a
   terminal-compatible static colour literal (P5 carries it in the map contract).
   The contrast-side enforcement already exists (round-4 correction — the landed #423
   mechanism): such values drop via `toHexComparand`'s post-resolution value-shape rule,
   and the pinned per-theme comparand counts are the audit trail; P2 therefore proposes
   NAMING the class in the contract text, not building a new mechanism. `state.selected`
   is NOT in this class (round-1 review correction): it is statically evaluable to an
   **alpha** colour, so its disposition is the existing alpha-exclusion one — pre-compute
   at export to an rgb-alpha literal or leave it to the same value-shape drop, in either
   case outside the WCAG comparand. Where a per-path listing is wanted beyond the pinned
   counts, it extends the gate's exclusion reporting — a small delta; the
   paint-time/static-alpha discrimination itself lives in the contract prose.
   *Warrant*: O4/O5; the studio's own pass-through instruction. *Falsifier*: a member
   of either class turning up in a contrast manifest pair — then exclusion-by-contract
   would be hiding a gate obligation, and the token must instead be re-designed studio-side
   to a resolvable form.
3. **Make the Stage-B naming map an explicit, generated, checked TOTAL DISPOSITION map.**
   The original total-map-to-byte-parity premise is already falsified by count evidence
   (round-1 review, verified first-hand: the kit's light projection carries 395 leaves —
   84 palette + 98 primitives + 139 semantic + 74 component — while the current light
   emission sources carry 134 — 38 palette + 34 semantic + 62 component), so a bijective
   map reproducing `index.css` byte-for-byte cannot exist. The artefact is therefore a
   **total disposition map with reverse coverage**: every kit path maps to exactly one of
   `emit as <--oak-* variable>` | `omit (recorded reason)`, every variable in the
   current `index.css` is accounted for by exactly one kit path or a recorded repo-only
   disposition, AND every `emit` target is unique across the whole map (epoch-2 review
   correction: reverse coverage constrains only names already present in the old output —
   without whole-map uniqueness two kit-only paths could emit the same new variable name,
   pass every other check, and leave duplicate declarations where one silently wins). The
   acceptance bar is byte-stable reproduction of the **covered emission
   set** plus zero unaccounted entries on either side plus zero emit-target collisions — checked by a **new Stage-B
   migration-parity check that lands as part of the Stage-B change itself** (round-2
   review correction: plan task #5, the re-homed `pr2-consistency-check`, guards a
   different surface — the kit's dtcg export against the kit's own canonical CSS — with a
   different failure meaning, so its green is never proof of repo-output compatibility;
   the napkin's `oak.color.x`→`--oak-x` Stage-B naming hazard is owned by the
   migration-parity check, while task #5 keeps guarding export canonicality). Retirement
   condition recorded in the same change: the map dies when MCP views bind the kit CSS
   directly (a named post-Stage-B lane, not part of the atomic switch). *Warrant*: O2 (the
   silent-rename hazard); replace-dont-bridge is satisfied because the map is a projection
   inside one source, not a second source. *Falsifier*: if the disposition map cannot
   reach zero unaccounted entries (a currently emitted variable with neither a kit source
   nor a recordable repo-only disposition), Stage B needs a consumer-migration leg in the
   same change, and the acceptance bar shifts from covered-set byte-parity to a reviewed
   rename ledger.
4. **Route the studio-side corrections through the design-sync lane** (append to the
   existing ~21-item sync-back batch): correct the README's false "lands on their
   convention" claim to describe the P1 contract; fix the 32-vs-34 pair-count drift;
   correct the "15 tokens carry `color-mix()`/`calc()`" undercount to the full 20-value
   functional inventory (O4); record the `{density}` component-tier self-reference as
   deliberate (or re-tier it studio-side). *Warrant*: O9; the sync discipline makes the
   studio doc the contract statement both surfaces cite. *Falsifier*: if the studio
   session regenerates `dtcg/README.md` from the CSS and the regenerated text still
   carries these errors, the defect lives in the export **generator**, not the doc — the
   routing shifts from doc correction to a generator fix, and doc-level edits would be
   symptom-patching.
5. **Give the terminal its own 11-entry role→kit-path map, not the P3 name map.** The
   terminal resolves a **dot-path-keyed** map (`terminal-theme.ts` looks up
   `component.page-background` etc. against the path-keyed map returned by
   `resolveColoursOrThrow`, the post-#423 fixpoint wrapper over `resolveColourTokens` —
   citation updated in epoch 2; the earlier-named `resolveTokenTreeToHex` was replaced on
   #423's tip), so P3's kit-path→CSS-variable-name map is the wrong type for it (round-1
   review correction — this also restores consistency with P1's "explicit 11-path map"
   wording).
   The terminal artefact is an 11-entry map from terminal role (`page`, `panel`, …,
   `danger`) to kit dot-path, resolved at build; the build already fails on unresolvable
   paths, and that property is preserved while the trees stay kit-shaped — with one new
   leg (epoch-2 correction, paired with P2): the build check asserts BOTH resolvability
   AND value shape, because today's `requiredColour` rejects only missing paths and a
   verbatim expression string would pass silently. *Warrant*: O8;
   re-rooting whole trees to stabilise 11 lookups inverts the size of cause and effect.
   *Falsifier*: if Stage B's kit trees cannot supply all 11 roles through the map,
   ADR-213's recorded exception (the terminal keeps its own tree, deliberate and recorded)
   fires instead — the ADR already anticipates exactly this.

## Unresolved evidence that could change the synthesis

- **#423's landed shape — RESOLVED in full**: the gate was verified first-hand at tip
  `e6b939a89` (native read confirmed; the mechanism is fixpoint resolution +
  post-resolution hex-comparand filtering + pinned counts, per the 2026-07-20 ADR-213 §2
  amendment), O4/P1/P2 were re-grounded on it, and #423 MERGED to `main` at 09:53:52Z
  (`dbfc765dd`) — the amendment is landed doctrine; nothing remains open here.
- **The MCP views' binding surface**: whether the views can bind kit CSS directly in a
  bounded follow-on determines the P3 map's lifetime — short (transitional scaffolding) or
  long (a de-facto second naming authority, which would start to smell like a bridge).
- **Repo-only token inventory**: the repo palette carries `shadow.*` roots the kit's
  primitives lack (kit shadows live in its semantic tree); the P3 falsifier check
  (total-map coverage) is the mechanical way to enumerate this class — run it before
  drafting the Stage-B change.
- **`#420`'s merge** (in the drain queue) retires the kit's last runtime network call; no
  interaction with this contract, listed only because it is this lane's other live item.

## Routing

- P1+P2 (ADR-213 §2 dated amendment) and the plan's `ws-stage-b-convergence` todo
  refinement: **after #423 lands AND #414's plan-file re-resolution completes** (doctrine
  slot (c) in the Director's queue), sequenced by the Director; natural author is this lane
  (ADR directory sits in `packages/design/**`'s doctrine orbit — coordinate with the
  cycle-3 seat, which holds an ADR-213 conflict in flight). **Discoverability rides the
  same slot** (round-2 review correction): the plan's `ws-stage-b-convergence` todo does
  not yet reference this report, so an implementer entering through the canonical plan
  will not find it — slot (c)'s plan edit adds the report pointer to that todo alongside
  the refinement. Until slot (c) lands, this report is reachable via the
  `design-system-integration` thread record, the comms pointer (b5a6be89), and this PR.
- P3+P5 (the map + validator): the Stage-B implementing change itself; seeds are plan task
  #5 and this report.
- P4: the design-sync session's batch (owner-gated future lane).
