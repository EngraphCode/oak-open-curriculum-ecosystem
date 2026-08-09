---
id: identity-switchboard-first-pixels
node_type: delivery
name: "Identity switchboard in the showcase — first-pixels pull-forward"
overview: >-
  The showcase serves a design-system-built identity-switchboard page — picker
  chrome plus a query-addressable full specimen composition — faithful to the
  Claude Design export except recorded workspace-clash divergences.
status: sketch
ratified_by: null
ratified_date: null
ratified_where: null
serves: design-system-as-configured-framework
impact_areas:
  - design-system
tickets: []
depends_on: []
owner_gates: []
last_updated: 2026-08-09
---

# Identity switchboard in the showcase — first-pixels pull-forward

Authored at the owner's word (2026-08-09 morning, plan-mode build selection):
a decision-complete pull-forward that takes the estate to the showcase app
serving a design-system-built version of the export's identity-picker page
(`packages/design/oak-design-system/studio-source/Identity Switchboard.html`
framing `studio-source/whitelabel/specimen.html`), then returns the lane to
the original `design-system-completion` order. Ground verified first-hand
2026-08-09 by three exploration sweeps (export + showcase anatomy;
plan-estate conventions + the W0.5 ledger; fidelity + instrument machinery).

## Goal

`demos/oak-design-showcase` serves `/identity-switchboard` (non-primary): the
export picker rebuilt on the design system — controls switching the identity
of the framed specimen, the full ten-region specimen composition — judged by
the W0.7 instrument before the owner sees it, browsed by the owner as pixels
in Chrome, with every divergence from the export recorded and dispositioned,
never silent. On completion the lane resumes the design census at its
slice-A boundary (the named resume gate: todo 5).

## Step 0 — compaction preparation (owner word: the very first step)

Executed at this plan's landing, before any implementation: napkin lens
harvest; thread-record freeze entry carrying the full resume map (this node
as the executing input; the census at its slice-A boundary with its resume
gated on this node's completion per todo 5 — the uncommitted
`census-types.ts` stays untracked in the `w01-census` worktree until that
resume, recorded in the freeze entry; worktree inventory; claim retained);
canonical freeze broadcast; monitor state verified. The resuming seat
re-arms per start-right and opens the first implementation todo.

## Mechanism (decision-complete)

### Shape: two routes, reproducing the export's scoped switching

The export keeps its picker chrome Oak-branded while the specimen switches
inside an iframe via `?brand=` query reload. The faithful equivalent,
entirely inside our workspaces:

- `app/identity-switchboard/specimen/page.tsx` — the FULL specimen
  composition (all ten regions of `whitelabel/specimen.html`: utility,
  masthead incl. search form and sign-in, hero with four-crumb breadcrumb,
  facets, results, detail, resources, support, cta, footer), authored as
  route-local React components, hook-clean (zero inline styles — the
  workspace ESLint bans them; presentation in route CSS walked by
  `validate-authored-css`, tokens only). Identity is QUERY-ADDRESSABLE: the
  route reads `?brand=` (validated against the imported `IDENTITIES` from
  `components/useIdentity.ts` — never a re-typed slug, keeping the
  identity-naming ratchet at zero delta) and applies the brand sheet
  (`/brands/<slug>/brand.css`, already served and manifest-guarded) at
  FIRST PAINT — no flash of the Oak base before the brand (a Playwright
  cell proves it; the exact link-injection mechanics are the execution
  cycle's call within this stated shape and acceptance).
- `app/identity-switchboard/page.tsx` — the picker chrome: header
  (`oak-heading-4` plus the export's framing prose MINUS its stale "wind
  the contract back to Part A" sentence — the prose is flagged for the
  owner-voice batch at the checkpoint, the W0.5 item-10 class); the
  controls strip; `main.stage` framing the specimen route in an IFRAME
  whose src the controls drive (the export's mechanism minus
  `document.write`); an `.oak-link` "Open full page ↗" kept in sync with
  the frame src. The frame is RESPONSIVE (width 100%,
  `aspect-ratio: 16/10`) — the export's fixed-1280 `scale()` fit is
  replaced for SC 1.4.10 reflow, a recorded accessibility-clash
  divergence.

### Controls — the taste-anchor affordance

A route-local `SegmentedControl`: `fieldset`/`legend` with
`role="radiogroup"` over real radio inputs hidden with the kit's
`.oak-visually-hidden` (not the export's hand-rolled 1px hide); pills
styled via `:has(input:checked)` / `:has(input:focus-visible)` from
tokens; control rhythm from `--input-min-h` — never the export's
`--size-target-min` pin (the routed kit finding recorded in the showcase
`globals.css`). IDENTITY group: three options, labels from the imported
`IDENTITY_LABELS`. THEME group: the five kit presets wired to
`oakThemeStore` — a segmented group, not the export's native select, per
the estate's ruled control pattern (design-system-completion W1.2, L0 r2:
"never a native select") — the clearest instance of the owner's "except
where it clashes" clause; the export's empty "Page default" option is
dropped (`system` owns default semantics) — recorded. NO motion control
(export adherence; runtime honouring intact).

### Discoverability

One nav link to `/identity-switchboard` added to the root page's masthead.
The root route's own fate stays with design-system-completion W1.5.

### Content provenance (W0.5 item 3, blocking)

Every persona, institution, statistic and product name in the composed
specimen enters the content-provenance manifest as
verified-real-or-fictional; rides the page PR.

### Fidelity machinery (ported per the fidelity-review skill's porting section)

Copy the hub's tools (`export-server`, `dev-server`, `image-diff`,
`fidelity-report*`, `fidelity-html`, `fidelity-register`,
`fidelity-review`, `capture-checks`) into
`demos/oak-design-showcase/tools/`; author a showcase `fidelity-pairs.ts`
with SIX diff-eligible pairs — three identities × {fold, full}: the
specimen route `?brand=<slug>` vs the export's
`whitelabel/specimen.html?brand=<slug>` served by the ephemeral export
server rooted at `packages/design/oak-design-system/studio-source/`
(capture tooling only — nothing app-serves the fenced tree) — plus ONE
`reference-only` chrome pair (picker page vs the export picker, divergent
by ruled design). Pair ids use target-state naming (`picker-oak-*`,
`picker-pds-*`, `picker-emc2-*`); slugs derive from the imported constant
in code, never literals, so the ratchet stays at zero delta in every new
file. `exemptSurfaces`: the root route (owner-rejected; W1.5's) with its
reason. Seed `fidelity-register.json` as `{"version":1,"entries":[]}`;
add a `tool:fidelity` script. Every finding is dispositioned
(`fix|deliberate|investigate|matched|superseded`; author = role handle).
Expected deliberate rows, pre-known: responsive frame vs scaled 1280;
segmented theme control vs native select; dropped "Page default" option;
dropped stale prose sentence; visually-hidden mechanism; control-rhythm
token.

### Instrument run (before any render reaches the owner)

Mechanical gates green first; then the seat leg SEALED before expert
dispatch; `accessibility-expert` and `design-system-expert` blind on
opus, per-criterion over all seven rubric slugs, notes on every non-PASS.
Rows land in `docs/design/design-review/wow-verdict-register.json`
(pre-read class WITH all three legs filled — the honest post-instrument
shape; the register identity for the pre-rename-slugged brand is `pds`),
validated by the agent-tools suite. A leg FAIL routes to the Director in
the Quality-bar rule-3 shape (findings, screenshot, blocker assessment)
plus an `instrument-blocked` row; the three-iteration bound applies.

### Owner browse

`pnpm --filter @oaknational/oak-design-showcase dev:open` (3020) with the
export served beside it on 3030 for comparison; pixels in the owner's
Chrome, verdicts batched and Director-relayed verbatim → checkpoint row;
on PASS the page's rendered screenshot baselines land in the same PR
window (Quality-bar rule 6).

### Return clause

On the checkpoint verdict's registration: a dated amendment note lands on
`design-system-completion` naming this node as the switchboard-page
carrier feeding W1.5 (root replacement and the probe's remaining scope
stay there); the lane resumes the census at its slice-A boundary; this
node takes its completion note.

## Todos

Each slice is a single-story PR within its PDR-132 round budget (≤2
rounds); the per-cycle code-expert pre-execution review fires at each
slice per the standing rule.

1. Step 0 — compaction preparation at plan landing (above). DONE marker
   lands in the thread record's freeze entry.
2. PR-1 — fidelity tooling port + pairs + seeded register + `tool:fidelity`
   script (tools only; no page).
3. PR-2 — the two routes + `SegmentedControl` + route CSS + unit tests +
   Playwright cells (the a11y matrix gains the new routes' identity ×
   theme cells and the no-flash first-paint cell) + the
   provenance-manifest rows + the root nav link. Single-story by
   construction: the page IS the story; its size ground is stated in the
   PR body.
4. PR-3 — evidence: fidelity run + dispositions, wow-register rows, (on
   PASS) screenshot baselines, the completion amendment note on
   `design-system-completion`.
5. Return: the census resumes at its slice-A boundary; completion note
   here.

## Out of scope (YAGNI)

Root-route replacement (W1.5's); a motion control; a Part-A-only lever;
logo-per-identity (no token role carries a logo — deliberate, recorded);
serving `studio-source/` from any app; identity persistence across
reloads (deliberate showcase behaviour, recorded).

## Acceptance criteria

- `repo-safe`: workspace `type-check`/`lint`/`test` green;
  `validate-authored-css` green over the new route CSS;
  `validate-kit-assets` green (manifest closure, incl. any new rows);
  `test:ui` and `test:a11y` green including the new routes' cells and the
  no-flash cell; `tool:fidelity` mechanically green with ZERO
  UNREGISTERED pairs; the wow-verdict register parses with the new rows
  (agent-tools suite); the identity-naming ratchet census-exact (zero new
  occurrences by construction).
- `owner-held`: the browse verdict recorded as a checkpoint row with the
  owner's Director-relayed words as `source`; on PASS, the screenshot
  baselines landed.

## Review notes (plan-body-first-principles-check)

The shape clause fired at this authoring (this body). Landing-path: the
three PRs above. Vendor-literal: none — no new vendors; the three
already-whitelisted external origins are unchanged. Record-consumers: the
fidelity register is read by PR review and W4.2's inventory dispositions;
the wow rows by the instrument's miss-rate obligation; the provenance
manifest by W2.9. Optionality: closed vocabularies throughout
(dispositions, identities, themes).

## Relationships

This node executes the owner's 2026-08-09 pull-forward word and owns ONLY
the switchboard page pair, its fidelity machinery, and its evidence.
`design-system-completion` keeps W1.2 (the plain-demo pages), W1.5 (probe
scope + root replacement — this node's landing is its switchboard-page
input, noted by dated amendment), W0.9 (unchanged, already unblocked),
and the census/charter continue in parallel per its own §Sequencing
(first pixels never gated on them). W0.5's blocking ledger binds here as
at W1.2: items 1 (asset closure via the kit + manifest), 2 (ordered-calm,
judged by rubric criterion 7), 3 (the provenance manifest), and 10 (the
framing-prose owner-voice batch at the checkpoint); items 6-defect and 7
do not render on this page.

## Verification (end-to-end)

1. `pnpm check` green from cold at each PR.
2. PR-2: `dev:open` → both routes render; switching identity re-brands
   the specimen with no Oak flash; the theme group drives `data-theme`;
   keyboard-only operation of both groups; 400%-zoom reflow of the picker
   page.
3. PR-3: the `tool:fidelity` report open — six pairs, ratios, zero
   unregistered; the instrument legs' verdicts in the register; the owner
   browse at 3020 with the export at 3030 beside it.
