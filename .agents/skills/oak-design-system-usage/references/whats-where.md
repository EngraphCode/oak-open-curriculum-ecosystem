# What's where

The design-system file map. **Rows are STUDIO paths**, relative to the studio
project root; the repo's design-system root is
`packages/design/oak-design-system/`. The homes are not flat copies of each
other, so each section states which of three mapping rules applies:

| Rule | Studio | Repo |
| --- | --- | --- |
| Consumable files | `<file>` | `<file>` |
| Instrument directories | `<dir>/` | `studio-source/<dir>/` |
| Guidance documents | `guidelines/<doc>` | `<doc>` |

The instrument-directory rule is a quality-gate boundary rather than a filing
preference (owner ruling 2026-07-19): the gate exclusions bind
`studio-source/**` alone, everything at the repo's workspace root is product
surface under the full strict gate, and anything under `studio-source/` that
becomes consumed by product code moves out of it in the same change. The
system's own `README.md` file index describes the studio layout, and says so.

## Styles — consumable, root to root in both homes

- `components.css` — buttons, tags, cards, chips, inputs, checkbox/radio,
  banners, quiz answers, links, skip-link, utilities, **and the authoring
  blocks** (the lesson anatomy: `.oak-outcome`, `.oak-key-learning-points`,
  `.oak-keywords`, `.oak-quiz`, `.oak-worked-example`, `.oak-misconception`,
  `.oak-practice`, `.oak-teacher-tip`, `.oak-guidance`, each with
  `.oak-block-label`). Copy the class, not the CSS.
- `colors_and_type.css` — tokens, themes, type classes (`oak-heading-1…7`,
  `oak-body-1…4`), `.oak-scope`.
- `brand.css` — the white-label contract: re-branding overrides canonical
  intent roles only, never the aliases, and never a raw value at a use site.
- `print.css` — the print/PDF layer.
- `styles.css` — the one-line entry that loads the tier files above.

## Building blocks — mixed, per row

- `templates/lesson-deck/`, `templates/worksheet/` — starting points for
  teaching slides and printable A4 worksheets (PDF-ready). Start from these
  for lesson artifacts. **Instrument**: `repo:studio-source/templates/`.
- `components/` — compiled React components (OakButton, OakTag,
  OakSubjectChip, OakIcon) with typed props. **Instrument**:
  `repo:studio-source/components/`. In the repo these are deliberately NOT on
  the package's export surface (ADR-213 §3) — apps compose Base UI plus the
  class library instead.
- `assets/icons/*.svg` — local flat-black-stroke icons; recolour with
  `filter: var(--filter-icon)`. **Consumable**: root in both.
- `fonts/` — the shipped typeface files. **Consumable**: root in both.

## Reference builds and specimens — instrument, all under `studio-source/`

Every path in this section is `repo:studio-source/<path>`.

- `preview/*.html` — specimen cards: exhaustive states for every component,
  plus motion, theming, and accessible-combination guides.
- `ui_kits/oak/index.html` — full homepage reference build; the model for
  composing screens.
- `whitelabel/` — the white-label contract proofs. The counter-brand
  directories are named in the skill entry's "What's where"; alongside them
  sit `specimen.html` (byte-identical full app page, `?brand=<slug>`) and
  `failing-example.css` (the negative control). The proof pages
  `Identity White-Labelling.html` / `Identity Switchboard.html` /
  `Example Front Pages.html` sit at the studio root and at
  `repo:studio-source/` — they demonstrate the contract.

Some files here reference `_ds_bundle.js` / `_ds_manifest.json`, which is the
studio's compiled bundle and is held out of the repo. Those pages render live
on the studio surface only; in the repo they are sources and fidelity targets,
never served pages.

## Guidance documents — the `guidelines/` re-homing

Studio home: `guidelines/` and `guidelines/docs/`. Repo home: the
design-system root and `docs/`. Rows below are named repo-side because that is
where a repo agent reads them; prefix `guidelines/` for the studio.

- `DECISIONS.md` — why the system is the way it is: decisions, rationale,
  rejected alternatives, hard-won lessons. Read it before changing
  architecture; keep it current when you do.
- `CHANGELOG.md` — semver history + public-surface definition.
- `KNOWN-ISSUES.md` — understood gotchas, read before debugging.
- `docs/consuming-nextjs.md` — install, theme wiring, identity,
  §5b behaviour-library chooser, §7 new-component recipe.
- `docs/pairing-base-ui.md` (default) / `docs/pairing-react-aria.md`
  (dates + conformance) / `docs/pairing-ark-ui.md` (non-React) — the
  behaviour-library pairing guides.
- `docs/wrapped-widget-a11y-checklist.md`, `docs/console-tui-tones.md`,
  `docs/integration-oak-curriculum-hub.md` (the live consumer's migration
  plan), `docs/nextjs-theme-switcher.tsx.txt`.
- `docs/one-html-many-css-compositions.md` — the white-label composition
  doctrine.

## Generated and integration surfaces

- `dtcg/` — generated DTCG JSON token export (the CSS is canonical).
  **Consumable**: root in both.
- `integrations/revealjs/` — the Oak reveal.js theme. **Instrument**:
  `repo:studio-source/integrations/revealjs/`.

## Provenance capture (repo only)

Upstream Figma/library provenance dumps live only in this repo's committed
capture tier (`studio-source/original-capture-2026-07-23/reference/`) —
never load them at runtime, and they do not ship to the studio.
