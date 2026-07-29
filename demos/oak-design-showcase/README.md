# Oak Design Showcase

A one-page live showcase of the
[Oak Open Curriculum Design System](../../packages/design/oak-design-system/README.md):
plain-CSS kit consumption — no Tailwind, no PostCSS, no mapping layer — with
identity and theme switching over the kit's own classes and token roles.

The [Curriculum Hub](../oak-curriculum-hub/README.md) demonstrates the
Tailwind-mapped consumption path; this app demonstrates the plain path. The
kit's `consuming-nextjs.md` documents the Tailwind path with the hub as its
worked example; this app is the plain-path counterpart and will join that
documentation as the showcase page lands.

## Run it

From the repo root:

```bash
pnpm design:showcase
```

That starts the dev server on port 3020 and opens the page in your browser.
Inside this workspace, `pnpm dev` starts the server without opening a
browser.

## What is here today

The absorb slice: the workspace at estate standards (shared strict
TypeScript, the full ESLint ruleset, Turbo-wired gates, unit + Playwright
UI + a11y tests) serving a kit-styled placeholder. The showcase page itself —
the foundations-first tour with the identity × theme switcher matrix — is the
next slice of [MCP-371](https://linear.app/oaknational/issue/MCP-371).

## Consumption mechanism

`app/globals.css` is one line: the kit's exported aggregate stylesheet
(`@oaknational/oak-design-system/styles.css`), the package's single entry
point and the source of truth for sheet composition and order. Fonts are
the kit's own self-hosted faces — no `next/font`, no network at build.
Page markup uses `.oak-*` classes and token roles only.

## Tests

- `pnpm test` — unit tests (happy-dom): component contracts as assistive-tech
  roles and structure, plus the opener-command platform mapping.
- `pnpm test:ui` — Playwright checks against the BUILT page (`pnpm start`):
  page identity and the kit stylesheets taking effect.
- `pnpm test:a11y` — Playwright + axe WCAG 2.2 AA checks (grep-tagged).
