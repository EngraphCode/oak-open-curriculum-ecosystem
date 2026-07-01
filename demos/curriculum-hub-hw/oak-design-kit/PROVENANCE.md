# Provenance — oak-design-kit

What this directory is, where each asset came from, and how it was obtained. Licence terms are
the repository's root licences (owner-confirmed 2026-07-01, no separate licence file needed):
code under [`LICENCE`](../../../LICENCE) (MIT); Oak curriculum content (the data snapshots) under
[`LICENCE-DATA.md`](../../../LICENCE-DATA.md) (Open Government Licence v3.0, attribution
required); and Oak brand assets covered by MIT not granting trademark rights in Oak's own
repository.

## Purpose

The local, committed home for the **entire Oak design kit** needed to reproduce the Curriculum
Hub prototype as a live demo (owner directive, 2026-06-30: "pull it all… separate directory…
separate licence terms"). It supersedes the earlier decision to keep the kit gitignored.

## `from-prototype/` — decoded from the committed prototype

Extracted by Titan weaves Ether from the embedded asset store of
`demos/curriculum-hub-hw/reference-prototype/Oak-Curriculum-Hub-prototype.html` (a self-contained
bundled React export). Deterministic decode (gunzip of the base64 asset store + the rendered-DOM
script block) — not reverse-engineering of minified code.

- `fonts/` — 7 Oak brand fonts (6× woff2, 1× ttf) lifted from the bundle's asset store.
- `brand-svgs/` — 2 Oak brand SVGs from the asset store. **NOT the full icon set** — the
  prototype bundle embeds only these two; the ~140 `assets/icons/*.svg` (incl. `subject-*`) are
  **not** present here and must come from DesignSync.
- `design-system-js/` — the design-system JS bundle (`@ds-bundle OakNationalAcademyDesignSystem`)
  + dc-runtime, for reference only.
- `data-snapshots/` — the prototype's own static data: `snapshot-07e33aee.json` (≈199KB quality-
  standards / `qsData`) and `snapshot-b3bf6a09.json` (≈41KB curriculum snapshot from
  thenational.academy). The curriculum snapshot is what the live demo **replaces** with the SDK
  data plane; the qsData is the static source for the Quality Standards section.
- `oak-figma-tokens.css` — the complete (~119KB) Figma-generated token CSS (every
  `--primitives-brand-*`, radii, border widths) — the authoritative token source for matching
  the prototype exactly.
- `hub-page-rendered.html` — the prototype Hub page's full server-rendered DOM (openable in a
  browser = the visual target for the Hub landing page).
- `visual-target/` — reference screenshots: `shot-prototype.png` / `proto-bundle-landing.png`
  (prototype Hub landing), `shot-live-home.png` / `shot-live-results.png` (current live demo,
  for side-by-side). Pages 2–3 (Oak Course / Oak Standards) render blank headless and are built
  from decoded content per owner decision.

## Related (NOT here)

- `demos/curriculum-hub-hw/oak-design-system/` — Herring holds Jetty's partial **DesignSync**
  download (gitignored working reference): docs, `colors_and_type.css`, `tokens/`, `icons.json`,
  `ui_kits/oak/{shared,Sections}.jsx`. DesignSync remote project
  `3ddccf31-dab4-48b3-a189-fbd0a03fb423` is **READ-ONLY** (owner directive). Whether that
  download folds into this committed dir is a Squall + Titan decision (see the plan).
