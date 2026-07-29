# Oak Design Showcase

A one-page live showcase of the
[Oak Open Curriculum Design System](../../packages/design/oak-design-system/README.md):
plain-CSS kit consumption — no Tailwind, no PostCSS, no mapping layer — with
live identity and theme switching over the kit's own classes and token roles.
One set of markup, many faces: every visible difference between identities
and themes is the token contract at work.

The [Curriculum Hub](../oak-curriculum-hub/README.md) demonstrates the
Tailwind-mapped consumption path; this app demonstrates the plain path. The
kit's `consuming-nextjs.md` documents the Tailwind path with the hub as its
worked example; this app is the plain-path counterpart and will join that
documentation as the showcase matures.

## Run it

From the repo root:

```bash
pnpm design:showcase
```

That starts the dev server on port 3020 and opens the page in your browser.
Inside this workspace, `pnpm dev` starts the server without opening a
browser.

## The page

The kit's region contract (`.oak-canvas` over sibling `data-region`
elements, under the shipped `home` composition map): a utility bar carrying
the switchboard, a masthead, a main with hero and specimen regions (type
ramp, buttons, tags, a card — all `.oak-*` classes), and a footer. The
switchboard drives three axes:

- **Theme** — all five kit themes (light / dark / match-device /
  high-contrast / colour-safe) through the kit's `oak-theme.js` runtime,
  inlined pre-paint in `app/layout.tsx` so a stored choice applies before
  first paint. A theme choice persists (localStorage, the runtime's
  contract).
- **Motion** — the orthogonal motion axis (match-device / reduced / full),
  same runtime.
- **Identity** — Oak, plus the kit's two counter-brands (Freedonia DSE and
  EMC²), by swapping a `brand.css` link loaded after every bundled sheet so
  the brand wins the cascade at equal specificity.

Two deliberate demo-only properties, recorded so they read as decisions:

- **Identity does not persist across reloads.** Persisting it would need a
  second pre-paint bootstrap to avoid a flash of Oak brand — exactly the
  problem `oak-theme.js` exists to solve for themes. The demo swap is
  in-page state; a reload returns to Oak.
- **Client-side identity switching is the showcase's mechanism, not the
  production shape.** The kit's `consuming-nextjs.md` §5 productionises
  identity as one server-emitted static sheet per tenant ("no flash, no
  client logic"); a cookie + refresh shape was weighed and rejected here
  because a live switchboard should not pay a server round trip per flick.
  Production consumers should follow §5.

The masthead is text-only by design: the kit's brand-asset mechanism is
file replacement (`brand.css`: "replace assets/logo-\*.svg"), and no token
role carries the logo, so a live three-identity logo swap has no kit
mechanism to ride — a text brand-name keeps the markup honest under every
identity.

## Consumption mechanism

`app/globals.css` starts with one import: the kit's exported aggregate
stylesheet (`@oaknational/oak-design-system/styles.css`), the package's
single entry point and the source of truth for sheet composition and order.
Fonts are the kit's own self-hosted faces — no `next/font`, no network at
build. Page markup uses `.oak-*` classes and token roles only; the few
page-level hook rules (`.mast`, `.util`, `.foot` — the kit specimen's
hook-clean contract, restyled by counter-brand expression layers) compose
token roles and keywords exclusively.

The counter-brand sheets reference their own web fonts and icon CDNs at
browser time (kit-authored content, copied verbatim); the test suite aborts
those hosts and asserts no unexpected third-party host ever appears.

## Kit-asset copies

`public/oak-theme.js` and `public/brands/*/…` are tracked byte-copies of
kit files, serving constraints only (the pre-paint script is inlined by a
plain file read; the brand sheets are swapped by URL). The workspace
package stays the single source: `pnpm validate-kit-assets` (chained into
the root `repo-validators:check` gate) fails on any byte drift AND
recomputes each sheet's local import/url() closure so an incompletely
copied set fails loudly.

## No hardcoded design values

Owner invariant: everywhere the showcase uses a value it must come from the
design system. Enforced by instrument, not review vigilance:

- **TSX**: the `style` attribute is banned outright (ESLint
  `no-restricted-syntax`) — presentation lives in `globals.css` hooks
  composed from token roles, never inline where a brand's expression layer
  cannot reach it.
- **CSS**: `pnpm validate-authored-css` (same root gate) parses every
  authored stylesheet with postcss and fails on any literal design value —
  hex colours, colour functions, unit-carrying numbers — including inside
  `var()` fallbacks. Kit-authored copies under `public/` are definitions,
  not consumption, and are owned by the parity validator instead.

## Tests

- `pnpm test` — unit tests (happy-dom): component contracts as
  assistive-tech roles and structure through the view + binder split (the
  switchboard renders from an injected fake runtime store), the theme
  store's notification contract, the instrument classifiers, and the
  opener-command platform mapping.
- `pnpm test:ui` — Playwright against the BUILT page (`pnpm start`): region
  contract in effect (live grid areas), theme/identity/motion switches
  proven through the real controls (attribute + cascade + computed-style
  assertions), pre-paint persistence, and the dark-first counter-brand's
  polarity.
- `pnpm test:a11y` — axe WCAG 2.2 AA across the full identity × theme
  matrix (15 cells; the match-device cells run under an emulated dark OS so
  they prove the `light-dark()` ride), plus 320px reflow per identity.
