# Landing dispositions — 2026-07-23 design-session sync-back (MCP-133)

The 2026-07-23 studio outputs were fetched to local disk before the studio
account switch; this record landed entirely from that local copy (no
workspace access needed). Workspace-side re-sync and cleanup belong to the
MCP-137 semantic-merge lane, not this landing. Every pulled item's decision:

| Item | Disposition |
| --- | --- |
| `full-page-conversion.html` | **Landed, cleaned**: overlay `<link>` removed (see below); the back-button icon moved from a Cloudinary hotlink to the local mask-icon role (`ic-external`). |
| `SESSION-NOTES.md` | **Landed verbatim** — the session record incl. the upstream ledger (executed as MCP-132). Prose mentions of the overlay are historical narrative. |
| `dark-theme-token-review.md` | **Landed verbatim** — MCP-132's rationale. Its "APPLIED as theme-enhancements.css" status line is historical; the permanent home it names (upstream source) is now real. One claim falsified since writing: "≥5.3:1 on every dark decorative base" — dark-lemon is 4.48:1, see the design-system `KNOWN-ISSUES.md` #13. |
| `PRE-INTEGRATION-AUDIT.md` | **Landed verbatim** — the pre-integration a11y audit; its three confirmed fails were cured in MCP-132 / ride the MCP-128 port. |
| `theme-enhancements.css` | **Not landed** (owner's no-stopgaps ruling: no overlay ever crosses into the repo). Its entire substance lives at source in `colors_and_type.css` since MCP-132; the file remains in workspace history. Consuming references stripped: the `<link>` in `full-page-conversion.html`, the append block in `templates/oak-site-page/ds-base.js` (retirement note left in place). |
| `theme-control.js` | **Landed verbatim** — evidence of the studio theme-switcher wiring; the app port consumes the design system's own `oak-theme.js`, not this file. |
| `assets/logo.svg`, `assets/header-underline.svg` | **Landed verbatim** — page assets the MCP-128 port consumes. |
| `candidate-a-band-hero.patched.html`, `candidate-b-home-shell.patched.html` | **Not landed** (ticket recommendation adopted): superseded explorations; they remain in workspace history and in the studio session record. |
| `templates/*` (five `*.dc.html`, `oak-site-page/README.md` + `ds-base.js`) | **Landed as references** for future app surfaces, not build inputs. Cloudinary-hotlinked icons (back-button ×5, search-page filter + warning) replaced with the design system's local mask-icon roles per the owner's B4 ruling — hotlinks are not an acceptable state on any surface. |

Checks run at landing: no webfont imports in any landed artifact
(KNOWN-ISSUES #12 pattern); zero `res.cloudinary.com` and zero
`theme-enhancements` references in live markup/loader code after cleaning.
