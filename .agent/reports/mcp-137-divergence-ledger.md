# MCP-137 S1 — divergence ledger

Git-vs-git comparison of the complete original-studio capture
(`packages/design/oak-design-system/studio-source/original-capture-2026-07-23/`,
329 files, completed by PR #523 merge `86cf48089`) against the live working
system (`packages/design/oak-design-system/`, preservation records excluded).
Authored by the design-lane seat at S1 of the ratified
[`mcp-137-design-system-semantic-merge.plan.md`](../plans/delivery/mcp-137-design-system-semantic-merge.plan.md).

## Method

- **Denominators**: capture side = the manifest's 329 `fetched-committed`
  rows (authoritative). Live side = `git ls-files` over the package minus the
  two preservation folders, `PRESERVATION-README.md`, and the capture
  manifest: 295 tracked files.
- **Path mapping** (derived empirically, not assumed): a capture path maps to
  the workspace root or to `studio-source/` — whichever exists in the live
  tracked set (the Stage-A import placed production classes at the workspace
  root and non-production classes under `studio-source/`, per the structural
  boundary of ADR-213 and the 2026-07-19 import-verification report). Exactly
  one path was ambiguous (`README.md`, present in both locations) and is
  resolved by authorship: the workspace-root `README.md` is the evolved studio
  README (manifest class 3), `studio-source/README.md` is a repo-authored
  boundary document (repo-only).
- **Byte comparison**: sha256 per mapped pair.
- **Format normalisation**: for differing pairs, the capture bytes were run
  through the repo's own Prettier configuration addressed AS the live path
  (`prettier --stdin-filepath <live-path>`), so the Stage-A import's
  formatting transform is reproduced exactly. `prettier(capture) == live`
  proves the pair is semantically identical and BOTH sides static since
  import (a moved original could not still equal the formatted import).
- **Ancestry test**: for semantically-differing pairs, the capture was
  compared (normalised) against the live path's import-era blob
  (`922f2e806` or the file's first-tracking commit, rename-followed). Equal ⇒
  the original has not changed since the import ⇒ the divergence is pure
  repo-side evolution.
- **Provenance**: `git log --follow` per live path, bucketed into the four
  first-class sources: import-era (2026-07-19 Stage A + PR2 cures), the
  2026-07-20 hardening arc, the Heron-era 2026-07-23 fixes (MCP-132 + review
  rounds), and the iteration-pull.

## Classification (sum = union denominator)

| Class | Count | Meaning |
| --- | --- | --- |
| `identical` (byte) | 153 | Same bytes both sides |
| `repo-evolved`, non-semantic | 112 | 108 differ only by the import's Prettier formatting; 4 differ only by import-time normalisation (markdown asterisk/underscore escaping ×3 and `styles.css`'s comment/quote-style cure ×1 — see §Notable) |
| `repo-evolved`, semantic | 23 | Genuine repo-side content evolution; the original is static since import for every row (ancestry-tested for 20 rows; qualified for 3 — see the note under §Semantic rows). Full row list in §Semantic rows |
| `original-only` | 41 | 39 = the held-out-class records, committed 2026-07-24 by owner ruling — capture-only by construction (the working system's root hold-out stands). 2 = studio READMEs the import never carried (§Semantic rows) |
| `repo-only` | 7 | Repo-authored surfaces with no studio counterpart (§Repo-only) |
| `diverged-both-sides` | **0** | **Empirically empty.** Every semantic difference is one-sided repo evolution; no path shows original-side movement since the import. (Corroborated externally: the 2026-07-20 and 2026-07-24 studio exports are byte-identical across all 329 paths — the original has been dormant since at latest 2026-07-20.) |

Union denominator: 329 capture paths + 7 repo-only = **336**;
153 + 112 + 23 + 41 + 7 = 336. Zero unclassified.

## Semantic rows (the S2 adjudication surface)

Every row below: original static since import; repo side carries landed,
reviewed, protected-by-default work. **Recommended disposition for all 23:
`keep-repo`** — zero-loss holds because the original's version is
byte-preserved in the capture folder; the union is the repo state.

Ancestry-evidence qualification (reviewer finding, applied): the
capture-equals-import-blob test passes for 20 of the 23 rows. It structurally
cannot run for the other three — `README.md` (the import commit already
carried the repo-added Integration section) and the two `.d.ts` files (first
tracked at the PR2-cure commit, already cured). For those three,
one-sidedness rests on the deltas matching their documented repo commits
exactly plus the export-dormancy corroboration (the 2026-07-20 and 2026-07-24
studio exports are byte-identical), which formally leaves the
2026-07-19→07-20 window uncovered for them — noted honestly rather than
claimed as tested.

| Live path (workspace-relative) | Repo evolution (provenance) |
| --- | --- |
| `CHANGELOG.md` | Import → hardening arc → MCP-132 + review rounds (release records) |
| `KNOWN-ISSUES.md` | Import cures (Salmon F1–F8) → fonts → MCP-132 |
| `LICENCES.md` | Marks ruling, OFL notices, Roboto Mono localisation |
| `README.md` | Integration additions (class-3 evolved studio README) |
| `brand.css` | MCP-132 review round 2 (derived surfaces follow source of truth) |
| `colors_and_type.css` | Roboto localisation → MCP-132 + both review rounds (incl. dark-token refinements) |
| `components.css` | MCP-132 source fixes |
| `print.css` | PR2 cures → review round 2 |
| `oak-theme.js` | 2026-07-20 hardening (embed truncation, persistence, OS-contrast listener) |
| `dtcg/README.md` | Salmon F1 cure (imported) → review round 2 |
| `dtcg/component.json` | MCP-132 (regenerated from CSS) |
| `dtcg/contrast-pairings.json` | MCP-132 |
| `dtcg/palette.json` | MCP-132 — iteration tokens added (`lavender20`, `dark-red30`, `dark-red50`, …) |
| `dtcg/semantic.light.json` | MCP-132 |
| `dtcg/semantic.dark.json` | MCP-132 (dark-token refinements) |
| `dtcg/semantic.high-contrast.json` | MCP-132 + review round 2 |
| `studio-source/components/OakButton/OakButton.jsx` | PR2 cures (a11y: disabled-link handling) |
| `studio-source/components/OakButton/OakButton.d.ts` | PR2 cures (documents `aria-disabled` behaviour; adds `type` prop — never an implicit form submitter) |
| `studio-source/components/OakSubjectChip/OakSubjectChip.jsx` | PR2 cures |
| `studio-source/components/OakSubjectChip/OakSubjectChip.d.ts` | PR2 cures (adds `label` accessible-name prop) |
| `studio-source/preview/contrast-audit.html` | Boundary move → review round 2 |
| `docs/integration-oak-curriculum-hub.md` | PR2 cures → Roboto Mono recipe |
| `docs/consuming-nextjs.md` | PR2 cures → Roboto Mono recipe → 2026-07-20 hardening: theme-bootstrap recipe rewritten from `next/script beforeInteractive` to the inline-script form (ADR-213 §3 records the correction). Initially mis-bucketed as hygiene-only; reclassified at review — the capture side lacks the theme-flash correction |

**Original-only rows needing a decision** (both additive, no conflict —
recommended `take-original` into the live tree at their mapped paths, i.e.
`studio-source/integrations/revealjs/README.md` and
`studio-source/ui_kits/oak/README.md`):

| Capture path | Situation |
| --- | --- |
| `integrations/revealjs/README.md` | Studio doc for the vendored reveal.js integration; the import never carried it (same omission class as the cured F1 `dtcg/README.md`) |
| `ui_kits/oak/README.md` | Studio doc for the reference build; same omission class |

The remaining 39 `original-only` rows are the held-out-class records —
disposition `capture-only`, settled by the 2026-07-24 owner ruling and
PR #523; no S2 action.

## Repo-only rows (no studio counterpart; no S2 action)

| Live path | Why it exists repo-side only |
| --- | --- |
| `.gitignore` | Repo-integration artefact (manifest class 17) |
| `LICENSING-MANIFEST.md` | Repo-integration artefact (class 17) |
| `package.json` | Repo-integration artefact (class 17) |
| `studio-source/README.md` | Repo-authored structural-boundary doc |
| `fonts/Lexend-OFL.txt` | OFL condition-2 notice (2026-07-20) |
| `fonts/RobotoMono-VariableFont_wght.ttf` | F3 cure — Google-Fonts runtime dependency localised |
| `fonts/RobotoMono-OFL.txt` | OFL notice for the above |

(`oak-flat.generated.css` is gitignored generated output — outside both
denominators by construction.)

## Notable findings

1. **The original's `styles.css` header comment self-terminates early**: the
   text `--surface-*/` closes the CSS comment mid-sentence, making the
   original file syntactically hazardous (Prettier's CSS parser rejects it).
   The import cured the comment (and quote style) with zero semantic change.
   S4 note: the repo→studio re-sync will overwrite the studio's broken copy
   with the cured one — the correct direction, worth knowing at sync review.
2. **The import dropped three studio READMEs**; one (`dtcg/README.md`) was
   caught and cured at Stage-A verification (F1), the other two surfaced only
   under this ledger's complete denominator — the take-original rows above.
3. **The capture's three markdown-escaping edge rows**
   (`DECISIONS.md`, `docs/pairing-ark-ui.md`,
   `studio-source/templates/worksheet/worksheet.md`) differ only by
   import-time markdown hygiene (escaping) — verified by direct diff, not
   assumed from the normaliser (whose own markdown-escaping instability
   produces false positives on exactly these rows). One further S4-relevant
   detail on `pairing-ark-ui.md`: the import transform mangled the unescaped
   pipes in `[data-state="active|checked|open"]` into spurious table
   columns, so the LIVE table renders broken relative to the capture — a
   repo→studio re-sync would push the mangled table studio-ward; fix the
   live table (escape the pipes) before or at S4.

## Owner's inventory mapping (completeness checklist)

| Inventory item | Concrete paths (live tree) | Status |
| --- | --- | --- |
| Print styles | `print.css` (+ `dtcg` print-relevant tokens) | Present both sides; repo-evolved |
| Projector styles | `studio-source/integrations/revealjs/` (deck, theme, vendored reveal.js) | Present both sides; format-only deltas (plus the folder's dropped studio README — the take-original row above) |
| Worksheet styles | `studio-source/templates/worksheet/` | Present both sides |
| Three identities | Oak (system-wide) + `studio-source/whitelabel/creature/` + `studio-source/whitelabel/freedonia/` | Present both sides |
| Four themes | `dtcg/semantic.{light,dark,high-contrast,colour-safe}.json` + the `light-dark()`/`[data-theme]` blocks in `colors_and_type.css` | All nine DTCG files present both sides |
| Component section | `studio-source/components/` (4 components × jsx/d.ts/card) | Present both sides; 2 repo-evolved |
| Design section | `studio-source/preview/` (63 files) + proof pages | Present both sides |
| Token section | `dtcg/` + `colors_and_type.css` | Present both sides; repo-evolved additively |
| Today's depth: landing page | `.agent/reports/mcp-128-landing/full-page-conversion.html` (landed record, MCP-133) — port target per the MCP-128 7-point contract | Outside the package by design; accounted |
| Today's depth: dark-token refinements | `dtcg/palette.json` + `dtcg/semantic.dark.json` + `colors_and_type.css` (MCP-132) | Present, repo side |

Zero inventory items unmapped; zero findings of absence.

## Acceptance

- Zero unclassified paths: 153 + 112 + 23 + 41 + 7 = 336 = |union|.
- Every inventory item mapped (table above).
- Every non-identical row carries a class, provenance, and (where S2-relevant)
  a recommended disposition with its rationale.

## Consequence for S2

The adjudication surface is small and one-sided: **no `diverged-both-sides`
rows exist**, so no meaning-level composition is required anywhere. S2 reduces
to ratifying two batches: (1) `keep-repo` across the 23 semantic rows
(protected-by-default already points this way; the original is preserved in
the capture); (2) `take-original` for the two dropped studio READMEs
(additive, no conflict). Whether either batch needs an owner card — or the
Director rules them mechanical under the plan's "card the owner ONLY on
genuine design calls" — is the S2 routing decision.

## S2 adjudication record (decisions, per the disposition-ledger discipline)

Routing authority: Director ruling, comms event
`317011f2-020d-48a6-a959-7b931759764c` (2026-07-24 17:46Z), answering
`f3cb3519`: the S2 due-card set is EMPTY and both batches are MECHANICAL,
scored against the gate clause ("genuine design-judgment calls
only; protected-by-default rules decide the rest; batched, not per-file") —
no design-judgment call exists in either batch, and the both-sides class the
cards were designed for is empirically empty. The ruling reserves: it covers
the rows AS CLASSIFIED in #524; any authoring-time doubt routes back for an
owner card. The owner sees the discharge as a glance-item on return — the
plan's `owner_gates` row clears on that sight, not on the ruling alone (see
the plan's dated note).

- **Batch 1 — `keep-repo`, all 23 semantic rows** (the §Semantic rows
  table). Rationale per row is the provenance column: every delta is landed,
  reviewed, protected-by-default repo work (MCP-132, PR2 cures, the
  2026-07-20 hardening arc); no `take-original` is proposed on any evolved
  path, so the plan's stale-capture-inversion risk clause is never invoked.
  Zero-loss: the original's version of every row is byte-preserved in
  `studio-source/original-capture-2026-07-23/`.
- **Batch 2 — `take-original`, the two dropped studio READMEs** —
  materialised at `studio-source/integrations/revealjs/README.md` and
  `studio-source/ui_kits/oak/README.md`, content-identical to their capture
  copies and import-normalised (the repo's Prettier, exactly as every
  working-tree studio file was at Stage A — blank-line insertions only, in
  the ui_kits README); the byte-originals remain preserved in the capture
  (same omission class as the Stage-A F1 cure that imported
  `dtcg/README.md`).
- **The 39 held-out-class rows**: `capture-only`, settled by the 2026-07-24
  owner ruling and PR #523 — recorded here for ledger completeness, no S2
  action. Discharge evidence for the plan's Amendment item 3 (the per-piece
  re-review): the owner reviewed the held-out set as a list on 2026-07-24
  (card "Review the list now", per-piece verdicts presented), then ruled
  "Commit all 39" (~15:45Z), landed as #523 merge `86cf48089`. The S4
  precondition "the held-out per-piece re-review answered" is
  satisfied-in-substance on this evidence; final confirmation folds into the
  S4 owner card, which fires regardless (account switch + the original
  project's post-switch fate).
- **S3 obligations, scoped to what this adjudication changes**: no CSS file
  changes hands (Batch 1 is keep-repo, Batch 2 is markdown), so
  `oak-flat.generated.css` regeneration and the conventions-header
  re-validation are vacuous for this slice; the package CHANGELOG is
  untouched because neither README joins the package export surface (the
  public contract is unchanged). The `pairing-ark-ui.md` table repair (the
  ledger's §Notable S4 tripwire) rides this slice so the mangled table can
  never sync studio-ward.
