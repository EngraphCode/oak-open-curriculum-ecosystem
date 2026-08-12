---
name: design-system-usage
classification: active
concern: domain-craft
domain: ui-design
description: >-
  Build well-branded, accessible (WCAG 2.2 AA), themable interfaces and assets
  with the Oak Open Curriculum Design System — production surfaces or throwaway
  prototypes, mocks, decks, and worksheets. Use whenever composing UI, documents,
  or teaching artefacts from the system's tokens, component class library,
  compiled React components, templates, fonts, icons, or brand voice.
---

# Design-system usage

**Two homes, one canonical.** This skill serves repo agents directly and ships
to the Claude Design studio (project pinned in `.design-sync/config.json`) as a
derived copy at every sync — the studio's `SKILL.md`, with studio frontmatter,
per `.design-sync/estate.json` §directWrites. Edit only this canonical; the
shipped copy is regenerated from it.

**Path context.** Paths below are relative to the design-system root:
`packages/design/oak-design-system/` in this repo; the project root in the
studio. The structural difference between the homes is one re-homing: the
guidance documents the repo keeps at the root and in `docs/` —
`DECISIONS.md`, `CHANGELOG.md`, `KNOWN-ISSUES.md`, `docs/**` — live under
`guidelines/` in the studio (`guidelines/docs/**` for the last).

Read the system's `README.md`, then build. The one-line setup for anything new:

```html
<link rel="stylesheet" href="styles.css" />
```

That loads the themable token layer (`colors_and_type.css`), the component
class library (`components.css`), and the print/PDF layer (`print.css`).
Compose UI from the `oak-*` classes and semantic tokens; check every line of
copy against `brand_voice.txt`. (Pages inside the studio project link the
tier CSS files directly — see `KNOWN-ISSUES.md` #1.)

## Rules of the road

- **Voice:** empowering, personable, direct. Sentence case everywhere. British
  spelling. Pupils (not students). Aila (never AILA). Contractions always.
- **Build with semantic tokens** (`--text-primary`, `--bg-primary`,
  `--surface-mint`, `--border-primary`, `--filter-icon` for img icons) — never
  raw hexes. Aliases like `--surface-mint`/`--shadow-lemon` resolve to
  canonical intent roles (`--surface-decorative-1`, `--shadow-accent`);
  re-branding overrides canonicals only, via `brand.css` (the white-label
  contract) — validate with the "Contrast audit (live)" card. **Five
  selectable themes, four token-bearing:** offer light / dark / system /
  high-contrast / colour-safe everywhere a theme choice is offered (DDR-004 —
  a control listing a subset is non-conformant); the four palette themes
  carry token trees via `data-theme` on `<html>` or any subtree, and `system`
  resolves to light or dark and mints no tree of its own. `oak-theme.js`
  persists the user's *choice* — the applied value never round-trips back
  into state (DDR-003).
- **A11y is non-negotiable (WCAG 2.2 AA):** keep the built-in focus rings,
  ≥44px targets, real labels, `alt` text, state never conveyed by colour
  alone, quiet motion (120/200ms, reduced-motion respected).
- **Signature motif:** thick black border (2–3px) + offset lemon shadow; hover
  widens it, press collapses it with a +2px,+2px translate. `.oak-interactive`
  gives you this.
- **No gradients. No emoji. No title case.** Body text is Lexend 300 on white;
  on pastel fills use weight 400+.
- **Icons:** local `assets/icons/*.svg` (flat black strokes); recolour with
  `filter: var(--filter-icon)`. Missing icon? Use Lucide and flag it.

## What's where

The four you reach for constantly:

- `components.css` — every component class **and the authoring blocks** (the
  lesson anatomy). Copy the class, not the CSS.
- `colors_and_type.css` — tokens, themes, type classes (`oak-heading-1…7`,
  `oak-body-1…4`), `.oak-scope`.
- `templates/lesson-deck/`, `templates/worksheet/` — start here for teaching
  slides and printable A4 worksheets.
- `preview/*.html` and `ui_kits/oak/index.html` — exhaustive component states,
  and the full reference build that models how screens compose.
- `whitelabel/` — the white-label contract proofs, built on the two
  counter-brands `creature/` and `freedonia/`.

The full map — compiled React components, the white-label proofs, the DTCG
export, the reveal.js theme, the consumption and pairing guides, and where
each guidance document lives in each home — is
[`references/whats-where.md`](references/whats-where.md). Read it before
hunting the tree; read `DECISIONS.md` before changing architecture.

## Authoring educational content

When writing lesson content (not just consuming templates), compose from the
authoring blocks in Oak's real lesson anatomy and order: **pupil outcome**
(one "I can…" sentence) → **key learning points** (3–5 precise knowledge
statements) → **keywords** (pupil-facing definitions, one clause each) →
**starter quiz** (checks prior knowledge) → learning cycles of
**explanation (worked examples) → check → practice** → **misconceptions and
common mistakes** (the wrong idea verbatim in quotes + the teacher response) →
**teacher tips** → **content guidance + supervision level** where needed →
**exit quiz** (checks the key learning points; distractors target the
misconceptions). Classes: `.oak-outcome`, `.oak-key-learning-points`,
`.oak-keywords`/`.oak-keyword`, `.oak-quiz`, `.oak-worked-example`,
`.oak-misconception`, `.oak-practice`, `.oak-teacher-tip`, `.oak-guidance` —
each semantic HTML with a visible `.oak-block-label`; headings take
`--font-display` so authored content re-brands with everything else. See the
"Authoring blocks" card for the full anatomy with real content.

## Page composition (region contract)

Build any full page shell on the region contract: `.oak-canvas` >
`[data-region="utility|masthead|main|footer"]`, and
`<main class="oak-main oak-region" data-region="main">` > sibling
`[data-region]` sections (hero/navigation/featured/facets/results/detail/
content/context/resources/support/cta). Declare the page type
(`data-page="unit|home|proof"` or a new one) on `<body>`/canvas and scope any
new map under `[data-page="…"]` — never `:root`. Regions must be SIBLINGS (no
wrapper columns); DOM order is canonical; brands recompose via the map tokens.
See the "Composition" card and `brand.css` §composition surface.
