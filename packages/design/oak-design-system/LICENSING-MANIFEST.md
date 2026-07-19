# Licensing manifest — initial integration (ADR-213 §1)

Per-file-class dispositions for the design system's initial import from the
Claude Design studio (project "Oak Open Curriculum Design System", v1.7.0).
This manifest is the owner's licensing review surface: every class the studio
holds is listed with provenance, licence, and disposition. Held-out classes
are explicitly gitignored here with the studio as the re-obtain path.

The system's own gate clause, verbatim (its `LICENCES.md` §"Oak marks (not
open-licensed)"):

> The Oak logo, the official icon set (`assets/icons/`), brand imagery in
> `uploads/`, and the Oak name are Oak National Academy brand assets —
> excluded from any open licence on this project's code, mirroring the
> ecosystem repo's `BRANDING.md`. […] making this system a tracked open
> package is gated on explicit licensing of these marks (DECISIONS "Ecosystem
> convergence").

**Owner ruling (2026-07-19, discharging the marks gate)**: "any Oak material
in OCE will automatically have the correct license, as long as brand assets
are kept separate and their licence file references BRANDING.md." Both
conditions hold here: brand assets live in the bounded `assets/` class and
[LICENCES.md](LICENCES.md) references [BRANDING.md](../../../BRANDING.md)
directly. The Oak-material owner-call flags below are therefore RESOLVED:
track. The hub's tracked `oak-logo*.svg` baseline is ratified by the same
ruling. Class 14a (third-party social marks) sits OUTSIDE the ruling — not
Oak material — and remains tracked-for-referential-use with its LICENCES.md
rows on the studio sync-back list.

The gate bound the **marks**, not the code: everything MIT/OFL below always
proceeded; the marks classes were the owner call, now ruled. Repo baseline for that call: this is
Oak's own repository, `BRANDING.md` already excludes Oak marks from the MIT
licence repo-wide, and the hub demo already **tracks** `public/oak-logo*.svg`
under exactly that posture (ratify or correct as part of this review).

## Dispositions

| #   | Class                             | Files                                                                                                                                                                                | Provenance / licence                                                                                                                                                                                                      | Disposition                                                                                                                                                    |
| --- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | System CSS + JS                   | `styles.css`, `colors_and_type.css`, `components.css`, `print.css`, `brand.css`, `oak-icons.css`, `oak-theme.js`                                                                     | Oak-authored code, MIT                                                                                                                                                                                                    | **Track**                                                                                                                                                      |
| 2   | DTCG export                       | `dtcg/*.json`, `dtcg/README.md`                                                                                                                                                      | Generated from the CSS, MIT                                                                                                                                                                                               | **Track**                                                                                                                                                      |
| 3   | System records                    | `README.md`, `DECISIONS.md`, `CHANGELOG.md`, `KNOWN-ISSUES.md`, `LICENCES.md`                                                                                                        | Oak-authored; MIT for code-bearing files, prose © Oak National Academy under OGL v3.0 (the system's own licence statement, README §Licence)                                                                               | **Track**                                                                                                                                                      |
| 4   | Voice toolkit text                | `brand_voice.txt`                                                                                                                                                                    | © Oak National Academy; licence undetermined pending the owner call                                                                                                                                                       | **Track** (RESOLVED by the 2026-07-19 owner ruling)                                                                                                            |
| 5   | Consumption docs                  | `docs/**`                                                                                                                                                                            | © Oak National Academy under OGL v3.0 (docs class); referenced libraries MIT                                                                                                                                              | **Track**                                                                                                                                                      |
| 6   | Compiled components               | `components/**` (4 × `.jsx` + `.d.ts` + card)                                                                                                                                        | Oak-authored code, MIT                                                                                                                                                                                                    | **Track** (off the package export surface per ADR-213 §3)                                                                                                      |
| 7   | Specimens                         | `preview/**`                                                                                                                                                                         | MIT (code); cards load pinned React from unpkg with SRI — specimen infrastructure only, never the shipped system                                                                                                          | **Track**                                                                                                                                                      |
| 8   | Reference build                   | `ui_kits/oak/**`                                                                                                                                                                     | Oak-authored code, MIT                                                                                                                                                                                                    | **Track**                                                                                                                                                      |
| 9   | White-label proofs                | `whitelabel/**` (incl. fictional logos, `failing-example.css`), `Identity White-Labelling.html`, `Identity Switchboard.html`, `Example Front Pages.html`                             | MIT (code, incl. the fictional counter-brand marks authored for the system); referenced fonts/icons OFL / Apache 2.0 / MIT (see LICENCES.md)                                                                              | **Track**                                                                                                                                                      |
| 10  | Templates                         | `templates/**` (DC sources, JS, `worksheet.md`, `.docx`, `.pptx`)                                                                                                                    | MIT (sources); binaries are generated editable exports of those sources, embedded content © Oak under OGL v3.0                                                                                                            | **Track** (owner-call flag on the two binaries — regenerable from the DC sources)                                                                              |
| 11  | Font                              | `fonts/Lexend-VariableFont_wght.ttf`                                                                                                                                                 | Google Fonts, SIL OFL 1.1                                                                                                                                                                                                 | **Track** (OFL permits redistribution; LICENCES.md carries the notice)                                                                                         |
| 12  | reveal.js vendor                  | `integrations/revealjs/**`                                                                                                                                                           | reveal.js MIT (vendored; KNOWN-ISSUES #9 notes the consuming repo should later take it as a real dependency)                                                                                                              | **Track**                                                                                                                                                      |
| 13  | **Oak marks — logos & brand art** | `assets/logo-*.svg`, `assets/brand-*.svg`, `assets/favicon.svg`                                                                                                                      | Oak marks, **not MIT** (BRANDING.md)                                                                                                                                                                                      | **Track** — RESOLVED by the 2026-07-19 owner ruling (brand assets separate; LICENCES.md references BRANDING.md)                                                |
| 14a | **Third-party social marks**      | `assets/icons/facebook.svg`, `instagram.svg`, `linkedin.svg`, `twitter.svg`, `x.svg`, `social-facebook.svg`, `social-x.svg`                                                          | Trademarks of their respective platforms — NOT Oak's to disposition and NOT covered by the Oak-marks clause; platform brand-usage terms generally permit referential display, but each needs its own source/licence note  | **Owner call.** Recommendation: track for referential UI use with per-mark rows added to LICENCES.md (a studio sync-back item — its register omits them today) |
| 14  | **Oak marks — official icon set** | `assets/icons/*.svg` excluding the 14a social marks (121 of 128), `icons.json`                                                                                                       | Oak marks per LICENCES.md, **not MIT**                                                                                                                                                                                    | **Track** — RESOLVED by the 2026-07-19 owner ruling (same basis as #13); `oak-icons.css` URL tokens resolve                                                    |
| 15  | Studio provenance                 | `uploads/**` (screenshots, brand toolkit PDF, note sources), `reference/**` (Figma dump, oak-components theme extracts)                                                              | Mixed; explicitly provenance-not-runtime; `uploads/` named in the marks clause                                                                                                                                            | **Hold out** (gitignored; lives in the studio; re-obtain there)                                                                                                |
| 16  | Studio infrastructure             | `_ds_bundle.js`, `_ds_manifest.json`, `_adherence.oxlintrc.json`, `.thumbnail`, `thumbnail.html`, root `support.js`, `CLAUDE.md`, `SKILL.md`, `HANDOFF.md`, `CLAUDE-CODE-HANDOFF.md` | Studio compiler output, thumbnails, and the studio's own session/handoff surfaces (the studio's `CLAUDE-CODE-HANDOFF.md` names root `support.js` and `_ds_*` as compiler output: "copy nothing from these into the repo") | **Hold out** (regenerable / studio-side working state; the repo's records are class #3)                                                                        |
| 17  | Repo-integration artefacts        | `.gitignore`, `LICENSING-MANIFEST.md`, `package.json`, README §Integration additions                                                                                                 | Repo-authored in this integration (not studio content), MIT                                                                                                                                                               | **Track** (synced studio-ward only where applicable)                                                                                                           |

The studio's `CLAUDE-CODE-HANDOFF.md` also carries a "do NOT ship" list
(specimens, proofs, ui_kits, templates). That list is **consumer-fencing** —
what goes into a consuming app — written under the pre-integration hand-off
frame. Under ADR-213 those classes are part of the system and live here (they
are its validation instruments and fidelity targets); the package `exports`
map is what fences consumers.

## Referential-integrity condition (ADR-213 §1)

No tracked file may reference a held-out file **on the repo-consumable public
surface** (the CSS entry points, tokens, and docs) — verified clean (prose
mentions only). Known, documented exception: studio-runtime wiring — the four
component specimen cards, `templates/*/ds-base.js`, and the standalone deck
load the studio's compiled `_ds_bundle.js`; that wiring renders live on the
studio surface only and is recorded in the workspace README. With the
recommended dispositions (marks tracked), classes 15–16 are the only holdouts.
If the owner holds out class 13/14 instead, the import must apply the
gitignored-local-assets pattern (tracked code + gitignored `assets/` + a
documented re-obtain runbook) before landing.
