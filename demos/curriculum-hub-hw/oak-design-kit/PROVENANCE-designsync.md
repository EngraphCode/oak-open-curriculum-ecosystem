# Provenance — DesignSync pull (Herring holds Jetty, C1)

Companion to [`PROVENANCE.md`](./PROVENANCE.md) (which covers Titan's `from-prototype/` decode).
This file records assets pulled from the **live Oak design-system project** via the DesignSync
tool, which is chat-scoped to the session that holds the claude.ai/design login.

- **Source project:** `Oak National Academy Design System`
  (id `3ddccf31-dab4-48b3-a189-fbd0a03fb423`, owner "Simon").
- **Method:** DesignSync `get_file` (READ-ONLY — owner directive: never write to the remote
  project), one file at a time, content transcribed verbatim to disk.
- **Layout:** flat canonical, mirroring the remote project's paths (e.g. remote
  `src/styles/theme/color.ts` → `oak-design-kit/src/styles/theme/color.ts`).
- **Licensing:** covered by the repository's root licences (owner-confirmed 2026-07-01) — code
  under [`LICENCE`](../../../LICENCE) (MIT), Oak curriculum content under
  [`LICENCE-DATA.md`](../../../LICENCE-DATA.md) (Open Government Licence v3.0, attribution
  required), and Oak brand assets by MIT not granting trademark rights in Oak's own repository.
  No separate licence file and no legal-signoff gate. These assets are committable; the branch
  still stays local (no push — owner direction).

## Verification

- Text assets (theme TS): structural validation via `tsc --noEmit --strict` (0 errors). The
  `satisfies Record<string, FontParameters>` constraint in `typography.ts` independently
  confirms tuple/token fidelity.
- Byte-level diff against source is not possible (the source exists only transiently in the
  pulling agent's tool-result context, never independently on disk); structural validation +
  the C6 build gate are the fidelity bar.

## Pulled so far

| Path | Source remote path | Notes |
|---|---|---|
| `src/styles/theme/color.ts` | `src/styles/theme/color.ts` | Oak colour + colour-filter + UI-role tokens |
| `src/styles/theme/typography.ts` | `src/styles/theme/typography.ts` | font-size / font / decoration tokens |
| `src/styles/theme/borders.ts` | `src/styles/theme/borders.ts` | border-width + border-radius tokens |
| `src/styles/theme/dropShadow.ts` | `src/styles/theme/dropShadow.ts` | incl. signature lemon offset shadow |
| `src/styles/theme/default.theme.ts` | `src/styles/theme/default.theme.ts` | UI-role → colour-token map |

## Pending (build-critical-first)

`assets/icons/*.svg` (~140), `assets/oak-icons.css`, `assets/` brand SVGs + 4 logos,
`README.md`, `SKILL.md`, `_adherence.oxlintrc.json`, key `preview/*.html`. Icon set is a
per-file serialisation point (no bulk path; `icons.json` is a partial Cloudinary map and the
CDN 404s) — pulling the demo-used subset first, long tail per owner scope decision.
