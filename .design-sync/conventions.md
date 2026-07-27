# Building with the Oak design system

This is a **tokens + class-library** system — it exports **no React
components**. You compose your own semantic HTML/JSX and style it with
Oak's classes and tokens. Never invent class names or raw values; every
name below exists in the shipped CSS.

## Setup (required)

- Wrap page content in `class="oak-scope"` — headings, prose, and links
  get Oak's typographic defaults only inside it.
- Theming: set `data-theme` on the root element — `"light"` (default),
  `"dark"`, `"high-contrast"`, `"colour-safe"` — or call
  `window.OakDS`'s theme switcher if the bundle is loaded
  (`oakTheme.set("dark")`, `oakTheme.get()`, `oakTheme.themes`).
- Fonts ship locally: **Lexend** (all UI text) and **Roboto Mono**
  (code). Never import webfonts.

## The styling idiom

Style with the class library first; where it has no class, use tier-2
role tokens via `var(--…)`. Never hex values, never invented tokens.

| Family   | Classes                                                                                                                                                                                                                                                                                                       |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Layout   | `oak-container` `oak-region` `oak-band` `oak-main` `oak-grid` `oak-stack` / `--s` / `--l` `oak-cluster` / `--s` / `--l` `oak-box` / `--s` / `--l` `oak-canvas` `oak-flow`                                                                                                                                     |
| Type     | `oak-heading-1`…`oak-heading-7`, `oak-heading-light-1`…`-7`, `oak-body-1`…`oak-body-4` (`-bold` on 1–3), `oak-code-2`…`oak-code-4` (+ `oak-code-2-bold`), `oak-prose`                                                                                                                                         |
| Actions  | `oak-btn` (mods: `oak-btn--secondary` `oak-btn--inverted` `oak-btn--sm`), `oak-icon-btn`, `oak-link`, `oak-card-link`, `oak-skip-link`                                                                                                                                                                        |
| Surfaces | `oak-card` (mods: `--lemon` `--mint` `--aqua` `--lavender` `--pink` `--flat` `--grey-shadow`), `oak-banner` (`--info` `--success` `--warning` `--error`), `oak-modal`, `oak-teacher-tip`, `oak-worked-example`, `oak-misconception`, `oak-guidance`, `oak-outcome`, `oak-practice`, `oak-key-learning-points` |
| Forms    | `oak-field` `oak-label` `oak-input` (`--error`) `oak-textarea` (`--error`) `oak-select` + `oak-select-wrap` `oak-checkbox` `oak-radio` `oak-choice` `oak-hint` `oak-error`                                                                                                                                    |
| Tags     | `oak-tag` (`--aqua` `--grey` `--lavender` `--mint` `--pink` `--white`), `oak-chip` (`--aqua` `--lavender` `--lemon` `--pink`), `oak-keyword`, `oak-keywords`                                                                                                                                                  |
| Quiz     | `oak-quiz`, `oak-quiz-answer` (`--selected` `--correct` `--incorrect`)                                                                                                                                                                                                                                        |
| Misc     | `oak-table`, `oak-accordion`, `oak-disclosure` (never nest `oak-accordion` inside it), `oak-icon` (`--mask`), `oak-skeleton`, `oak-empty`, `oak-visually-hidden`, `oak-block`, `oak-block-label`                                                                                                              |

Role tokens (tier 2, themable — the ones to reach for): backgrounds
`--bg-primary --bg-subtle --bg-raised --bg-neutral --bg-inverted
--bg-selected --bg-overlay --bg-error --bg-correct --bg-incorrect`;
text/border/surface/shadow/focus families follow the same `--text-*`,
`--border-*`, `--surface-*`, `--shadow-*`, `--focus-*` pattern — read
them from the stylesheet before use. A surface painted `--bg-inverted`
must also set `--focus-ring: var(--focus-ring-inverted)` and use
`--shadow-ground-inverted` — the canvas ring lands at ~1.1:1 there
(`var()` substitutes at declaration, so overriding `--shadow-ground`
alone never reaches the ring).

## Where the truth lives

Read `styles.css` and its import `_ds_bundle.css` — all three token
tiers plus the entire class library, with a11y baked in. DTCG token
JSON is under `tokens/`. `guidelines/pairing-base-ui.md` is the
composition doctrine: interactive behaviour comes from headless
primitives (Base UI idiom) styled with these classes — the system
deliberately ships behaviourless CSS.

## Idiomatic snippet

```jsx
<main className="oak-scope oak-main">
  <section className="oak-region oak-stack">
    <h1 className="oak-heading-2">Teach every lesson with confidence</h1>
    <p className="oak-body-1">Free, fully sequenced curriculum resources.</p>
    <div className="oak-cluster">
      <a className="oak-btn" href="#">
        Browse the curriculum
      </a>
      <a className="oak-btn oak-btn--secondary" href="#">
        How it works
      </a>
    </div>
    <div className="oak-card oak-card--lemon oak-stack--s">
      <span className="oak-tag oak-tag--mint">Coming soon</span>
      <p className="oak-body-2">The Oak app is in limited internal testing.</p>
    </div>
  </section>
</main>
```
