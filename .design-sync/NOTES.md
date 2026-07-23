# design-sync NOTES — oak-design-system

- Tokens-only sync (2026-07-23, first sync): the package deliberately
  exports no React components (ADR-213 §3 as landed). Owner's original
  vision includes the full building-block set — an owned React
  component tier is planned via ADR-213 amendment (sitting seed 11);
  when that package exists, add it via `extraEntries`/entry change and
  re-sync; the conventions header's "no React components" line must be
  rewritten then.
- `--entry` is `packages/design/oak-design-system/oak-theme.js` (the
  only JS export — the theme switcher). `--node-modules` must point at
  a workspace that carries react (pnpm strict hoisting keeps the root
  sparse): `apps/oak-curriculum-mcp-streamable-http/node_modules`.
- The converter copies `cssEntry` VERBATIM and does not follow its
  relative `@import`s — the package's real `styles.css` is an
  import-list, so we build a flattened entry:
  `cd packages/design/oak-design-system && cat colors_and_type.css
oak-icons.css components.css print.css > oak-flat.generated.css`
  (gitignored). REGENERATE IT whenever any tier CSS changes, before
  any re-sync — a stale flat file ships stale styles silently.
- Two dead `@font-face` blocks are dropped at build (Lexend/RobotoMono
  faces whose urls point outside the copied set) — the surviving four
  rules cover both families; fonts verified shipping in fonts/.
- DTCG JSON (dtcg/\*.json) does NOT ship: `tokensGlob` requires a
  `tokensPkg` resolvable from node_modules and the DS package is not
  installed anywhere. All 474 custom properties ship via the CSS
  (validate counts them), so the design agent loses nothing that
  renders. Improvement candidate for a later sync.
- Render check: zero component previews exist (tokens-only), so
  validate runs `--no-render-check` — accepted as vacuous 2026-07-23;
  revisit the moment components join the bundle (then previews MUST be
  authored and machine-verified).

## Re-sync risks

- `oak-flat.generated.css` is a derived file with no generator script —
  it silently goes stale if tier CSS changes and nobody re-cats it.
  (Cure candidate: a tiny package script, added when the component
  tier lands.)
- The conventions header enumerates the class vocabulary BY NAME —
  re-validate every name against the fresh `_ds_bundle.css` on every
  re-sync (grep loop in the sync transcript, 2026-07-23); classes
  renamed or removed in components.css will otherwise be taught wrongly.
- Naming (owner ruling 2026-07-23): the org's official "Oak Design
  System" is a SEPARATE, largely Figma-based system. This repo's system
  is the **Oak Open Curriculum Design System** — repo-scoped for now.
  Repo-scoped design surfaces carry the full name; never claim this is
  the org's design system.
- `.design-sync/config.json` `projectId` targets the THIS-account
  Claude Design project (named "Oak Open Curriculum Design System",
  owner-renamed from the initial "repo-synced" name). The OTHER
  account's studio carries the same name — always resolve by projectId
  (634a588e-…), never by name; never sync to the other account from
  this config.
