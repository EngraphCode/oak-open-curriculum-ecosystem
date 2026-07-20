# AIP-137 Stage B: the studio↔repo token interchange contract — concept exploration

**Author**: Heron seeks Bluff (`ef3eb0`, claude-code/fable-5), Implementer, design-system lane
(successor to Caracal wakes Tunnel `265648`). **Date**: 2026-07-20. **Thread**:
`design-system-integration` (AIP-137). **Method**: the concept-exploration skill's four
movements (metacognition ⇄ reason), run before Stage-B solution options are formed — the two
open questions Caracal's handoff named ("export re-rooting vs repo-boundary normalisation";
"the currentColor runtime-token clause") are treated as symptoms of one unshaped concept, not
as a formed decision. Every observation below was verified first-hand on 2026-07-20 against
the working tree at `packages/design/` (verified identical to `origin/main` for that subtree
at 08:14Z) and against the landed `#412` validation layer. Nothing here edits ADR-213 or the
plan; §Proposals routes the edits.

## Movement 1 — load-bearing observations

- **O1. Three naming conventions coexist for one token.** The kit's canonical CSS declares
  bare variable names (`--text-primary`, `--state-hover`, `--color-accent`;
  `colors_and_type.css:327–329`) with the `--oak-<name>` prefix on colour primitives only.
  The kit's DTCG export round-trips those CSS names into dot-paths (`text.primary` →
  `--text-primary`; `dtcg/README.md` §Conventions) except the palette, which it pre-rooted at
  `oak.color.<name>` to meet the repo convention. The repo pipeline
  (`design-tokens-core/src/index.ts`) derives names as `--oak-` + full path
  (`toCssVariable`), so the same grey is `--oak-grey` (kit CSS), `oak.color.grey` (export
  path), and would emit as `--oak-oak-color-grey` (repo flattener) — the export's
  "lands on their convention" claim is mechanically false, as the Stage-A import found.
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
- **O4. The value grammar is closed at the contrast boundary, open at the CSS boundary.**
  `#412`'s `colour-literals.ts` admits `#rrggbb` | `rgb(R G B / A)` | full-string reference;
  expressions are rejected with structured `Err`, and alpha literals are admitted but
  reported for exclusion from the WCAG hex map. The export carries 15 expressions verbatim
  (3 × `color-mix` in `semantic.light` `state.*`; 12 × `calc` in `component.json`), and the
  studio's own contract doc instructs "a consuming build should pass them through untouched".
  Both sides are right — for different consumers.
- **O5. Two of the three `color-mix` tokens can never be statically resolved.**
  `state.hover`/`state.pressed` mix `currentColor` — context-dependent at paint time, no
  export-time pre-computation exists. `state.selected` mixes a referenced role at 24% alpha,
  so even resolved it lands in the alpha class the WCAG map excludes. None of `state.*`
  appears in `contrast-pairings.json` (0 hits; 34 pairs, all resolvable solid roles).
- **O6. The 12 `calc` expressions are dimension-class, not colour.** They parameterise
  layout off `{density}` and `{space.*}`. `{density}` is itself a component-tier token
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
  makes the export honest and the gate's exclusions contractual. The `#412` interim
  ("emission passes through, contrast resolution rejects") was the right behaviour awaiting
  its name.
- **The export generator is first-class repo-adjacent work.** Under the owner's integration
  ruling the studio is not an upstream to petition; export-generator corrections (the false
  convergence claim, the pair-count drift) are design-sync work items of the same standing as
  repo code — which removes the "fix it on our side because we can't touch theirs" pressure
  that made boundary normalisation look inevitable.

## Movement 4 — proposals

Each proposal names its warrant and a falsifier. Sequencing constraint: ADR-213 and the plan
file are live conflict surfaces on `#423`/`#414` (verified by the cycle-3 seat, 08:16Z) — the
doctrine edits below land **after** `#423`, on Director sequencing, never concurrently.

1. **Amend ADR-213 §2 (dated) to a per-consumer projection contract.** Replace the
   export-normalisation parenthetical with: the export is the kit-vocabulary projection; the
   repo consumes it through three declared projections — contrast (native read, overlay
   composition, closed colour grammar with typed refusals), web CSS transitional (explicit
   naming map, P3), terminal (explicit 11-path map, P5). *Warrant*: O1–O3 (naming is derived,
   so tree-shape normalisation is consumer breakage); the #423 gate already proves the
   native-read projection. *Falsifier*: if a projection cannot be expressed as a total,
   checked map over the export (e.g. repo-only tokens with no kit counterpart and no recorded
   disposition), the per-consumer frame is wrong and a single normalised interchange tree is
   the honest shape after all.
2. **Declare the `runtime-computed` value class.** Contract text (ADR-213 §2 amendment, same
   change as P1): values whose computation is paint-time-contextual (`currentColor` mixes)
   are exported verbatim, pass through to CSS emission, are excluded from static contrast
   resolution **by contract** with their paths listed in the gate's audit output, and are
   barred from the terminal's 11 paths (asserted at build). `state.selected` joins the class
   by value shape (alpha output ⇒ statically uncomputable contrast). *Warrant*: O4/O5; the
   studio's own pass-through instruction; the gate's existing typed-refusal mechanics already
   compute the classification. *Falsifier*: a member of the class turning up in a contrast
   manifest pair — then exclusion-by-contract would be hiding a gate obligation, and the
   token must instead be re-designed studio-side to a resolvable form.
3. **Make the Stage-B naming map an explicit, generated, checked artefact.** A total map from
   kit export paths to the emitted `--oak-*` variables that `index.css` serves MCP views
   today, byte-stable output as the acceptance bar, checked by the dtcg↔CSS consistency
   validator (the re-homed `pr2-consistency-check`, plan task #5 — exactly the
   `oak.color.x`→`--oak-x` transform the napkin's Stage-B hazard names). Retirement
   condition recorded in the same change: the map dies when MCP views bind the kit CSS
   directly (a named post-Stage-B lane, not part of the atomic switch). *Warrant*: O2 (the
   silent-rename hazard); replace-dont-bridge is satisfied because the map is a projection
   inside one source, not a second source. *Falsifier*: if byte-stable reproduction of
   current `index.css` from kit trees is impossible through any total map (repo tokens with
   no kit counterpart beyond the recorded dispositions), Stage B needs a consumer-migration
   leg in the same change, and the map's acceptance bar shifts from byte-parity to a
   reviewed rename ledger.
4. **Route the studio-side corrections through the design-sync lane** (append to the
   existing ~21-item sync-back batch): correct the README's false "lands on their
   convention" claim to describe the P1 contract; fix the 32-vs-34 pair-count drift; record
   the `{density}` component-tier self-reference as deliberate (or re-tier it studio-side).
   *Warrant*: O9; the sync discipline makes the studio doc the contract statement both
   surfaces cite. *Falsifier*: none needed — these are description-truth fixes; if the sync
   session finds the README already regenerated, the items retire.
5. **Point the terminal's 11 paths at the kit vocabulary via the P3 map, not via tree
   re-rooting.** The build already fails on unresolvable paths; the map keeps that property
   while the trees stay kit-shaped. *Warrant*: O8; re-rooting whole trees to stabilise 11
   lookups inverts the size of cause and effect. *Falsifier*: if Stage B's regenerated
   trees cannot supply all 11 roles through the map, ADR-213's recorded exception (the
   terminal keeps its own tree, deliberate and recorded) fires instead — the ADR already
   anticipates exactly this.

## Unresolved evidence that could change the synthesis

- **#423's landed shape** (in flight, conflict resolution under the cycle-3 seat): the
  compose/gate APIs are the contrast projection's actual code; if its final form diverges
  from native-read (e.g. it re-roots internally), P1's first projection needs re-grounding.
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
  refinement: **after #423 lands**, sequenced by the Director; natural author is this lane
  (ADR directory sits in `packages/design/**`'s doctrine orbit — coordinate with the
  cycle-3 seat, which holds an ADR-213 conflict in flight).
- P3+P5 (the map + validator): the Stage-B implementing change itself; seeds are plan task
  #5 and this report.
- P4: the design-sync session's batch (owner-gated future lane).
