# What's where

The design-system file map. Paths are relative to the design-system root:
`packages/design/oak-design-system/` in this repo; the project root in the
studio. Where the two homes differ, both paths are given.

## Styles

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

## Building blocks

- `templates/lesson-deck/`, `templates/worksheet/` — starting points for
  teaching slides and printable A4 worksheets (PDF-ready). Start from these
  for lesson artifacts.
- `components/` — compiled React components (OakButton, OakTag,
  OakSubjectChip, OakIcon) with typed props.
- `assets/icons/*.svg` — local flat-black-stroke icons; recolour with
  `filter: var(--filter-icon)`.
- `fonts/` — the shipped typeface files.

## Reference builds and specimens

- `preview/*.html` — specimen cards: exhaustive states for every component,
  plus motion, theming, and accessible-combination guides.
- `ui_kits/oak/index.html` — full homepage reference build; the model for
  composing screens.
- `whitelabel/` — the white-label contract proofs. The counter-brand
  directories are named in the skill entry's "What's where"; alongside them
  sit `specimen.html` (byte-identical full app page, `?brand=<slug>`) and
  `failing-example.css` (the negative control). Root pages
  `Identity White-Labelling.html` / `Identity Switchboard.html` /
  `Example Front Pages.html` demonstrate the contract.

## Guidance documents

Repo home: the design-system root and `docs/`. Studio home: `guidelines/`
and `guidelines/docs/`.

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
- `integrations/revealjs/` — the Oak reveal.js theme.

## Provenance capture (repo only)

Upstream Figma/library provenance dumps live only in this repo's committed
capture tier (`studio-source/original-capture-2026-07-23/reference/`) —
never load them at runtime, and they do not ship to the studio.
