# Design-system estate: state and understanding (2026-07-23)

Authored by the Director seat (Forge rides Brimstone, 398e24) at the
owner's word, as input to the MCP-137 semantic-merge lane. Epistemic
discipline throughout: every claim is marked **[verified]** (first-hand
this session), **[owner]** (owner word, date given), or **[inference]**
(flagged — successors must not inherit these as facts).

## 1. The estate map

- **The design system**: `packages/design/oak-design-system` — the
  design source of truth (ADR-213 §1) **[verified: ADR on main]**. Three
  token tiers; `.oak-*` class library; four themes (`light`, `dark`,
  `high-contrast`, `colour-safe`, plus a `system` value)
  **[verified: colors_and_type.css]**; white-label contract
  (`brand.css` Parts A/B); two counter-brand identities staged under
  `studio-source/whitelabel/` — Freedonia DSE and EMC ("Educate My
  Creature Too" — the owner's "EMC2") **[verified]**.
- **ADR-213 as amended 2026-07-23** (#498, landed `737a527d7`): the
  owned React component tier is a **separate downstream binding package**
  under `packages/design/`, downstream of `oak-design-system`, whose
  framework-neutral surface is permanent **[verified: amendment text]**.
- **Strategic direction**: the *Oak Surface Isolation and Generic
  Foundation Programme*
  (`.agent/plans-backlog-2026-07/architecture-and-infrastructure/future/oak-surface-isolation-and-generic-foundation-programme.plan.md`,
  owner-clarified 2026-04-28) — every non-Oak capability generic first,
  every Oak package a thin instance; tranche 2 is the design-system
  split (generic token engine + thin Oak leaf) **[verified: plan text]**.
- **The governing principle** (owner, 2026-07-23): the generality-depth
  gradient — deeper layers must be more general; investment rises with
  depth; it compounds. Rulings that follow: semantic/role tokens are
  never Oak-specific; Oak tokens constrain to Oak's theme; counter-brand
  identities exist to force generalised infrastructure **[owner]**.
- **The 3×4 requirement** (owner, 2026-07-23): three identities (Oak,
  Freedonia, EMC) × four themes (light, dark, high-contrast,
  colour-safe) as **integrated, gate-exercised functionality** — not
  staged files. Tracked as MCP-136 **[owner]**.

## 2. The four-source topology (the merge problem)

**Owner framing [owner, 2026-07-23]**: "two different design systems
with some common ancestry… a semantic merge rather than marrying two
clean histories" — with a fourth source named explicitly [owner,
~21:45]: "the local repo design system, the one actually integrated
into the repo, has been iterated by Heron, so that is another
important source in this multi-way audit and merge." Absolute
constraint: **nothing lost** from any of them.

1. **The original studio project** — Claude Design project
   `314dd517-493d-4be2-bd08-56ae0e80e780`, "Oak Open Curriculum Design
   System", on the account NOW connected (the original Oak account;
   DesignSync verified reachable, `canEdit: true`,
   `PROJECT_TYPE_DESIGN_SYSTEM`) **[verified]**. The fullest expression
   of the original work: per the owner it carries print styles,
   projector styles, worksheet styles, three identities, four themes,
   and component/design/token sections **[owner]**. Its CHANGELOG tops
   at 1.7.0 (2026-07-19) **[verified: get_file]**; ~122 icons (its own
   1.6.6 entry's count) **[verified: changelog text]**.
2. **The repo** — an **incomplete import** of (1) **[owner]**, evolved
   since: CHANGELOG 1.7.1 (2026-07-20) + repo-side Unreleased
   **[verified]**; 128 icons **[verified]**; today's MCP-132 fixes
   (PR #507, settling at time of writing) and the iteration outputs
   landing via the MCP-133 chain.
3. **The iteration-account project** (`634a588e-…`) — a **partial push
   of the repo's state** **[owner: "I don't think we pushed everything
   we had locally"]**, where today's landing-page/dark-token iteration
   happened; **now inaccessible** (account switched away) **[owner]**.
   Its valuable outputs are already pulled: #494 (gap-check, copy,
   candidates) landed; the finished page + five templates + dark-theme
   review pull via MCP-133 **[verified: PR record / Heron broadcasts]**.
4. **The repo's CURRENT state as iterated by Heron** — a first-class
   source in its own right **[owner, ~21:45]**, distinct from the
   import-era baseline in (2): the MCP-132 source fixes (accordion
   scope, band padding, dark-token ramp, icon requirements), the
   iteration-pull integration, and the expert-round cures. Git history
   makes this source fully enumerable: `git log` per path separates
   import-era content from Heron-era evolution, so the ledger records
   WHICH evolution each repo-side difference came from — these changes
   are protected contributors to the union, never implicit background.

**Superseded claim, kept for honesty**: this seat's earlier "repo is
AHEAD on every content surface" verdict generalised two witnesses
(changelog, icon count) beyond their scope; the owner's
incomplete-import + partial-push facts invalidate the generalisation.
Recorded on MCP-136/137. Per-file version stamps cannot adjudicate
surfaces that never crossed or diverged on both sides.

## 3. Structural divergence evidence so far [verified]

Mechanical path-level diff (original project `list_files` vs
`git ls-files` on the package, studio-source flattened):

- **Original-only** (≈21 paths): `reference/figma/*` +
  `reference/oak-components-theme/*.ts.txt` (the provenance sets the
  repo's zero-drift audits cite — highest value); root `support.js`;
  `ui_kits/oak/README.md`; `integrations/revealjs/README.md`;
  `_adherence.oxlintrc.json`; studio scaffolding (`CLAUDE.md`,
  `HANDOFF.md`, `CLAUDE-CODE-HANDOFF.md`, `SKILL.md`); studio build
  outputs (`_ds_bundle.js`, `_ds_manifest.json`, thumbnails —
  regenerable, do-not-pull class).
- **Repo-only**: `.gitignore`, `LICENSING-MANIFEST.md`, `assets/icons/`
  (128 files — the original keeps icons project-side too; name-level
  comparison NOT yet done **[inference that repo ⊇ original on icons —
  verify by comm at S1]**), plus everything repo-side since import.
- **Shared paths**: content-level diff NOT yet performed — this is
  S1's job. Both sides have plausibly evolved (repo: 1.7.1 + fixes;
  original: unknown post-export edits — **[inference: original
  unchanged since 2026-07-19, from its changelog; unverified]**).

## 4. Mechanics the merge seat needs

- **DesignSync**: authorised under the original account (owner ran
  `/design consent` 2026-07-23 ~21:20); `get_file` caps at 256 KiB —
  fonts (`.ttf`), `Oak Lesson Deck.pptx`, `Oak Worksheet.docx`,
  screenshots in `uploads/`, and possibly `_ds_bundle.js` may exceed it
  **[inference: sizes unverified]**. Fallbacks: repo already holds
  same-named font/pptx/docx — hash-compare rather than re-fetch;
  genuinely oversized originals may need owner-assisted export. A
  failed fetch is a ledger row marked `unfetchable`, never a silent
  skip.
- **`.design-sync/config.json`** still targets the dead iteration
  project `634a588e-…` — MUST NOT be re-targeted until the merge lands
  (a re-sync's delete-reconciliation against the original would destroy
  un-merged original-only files). Re-target to `314dd517-…` is S4, by
  owner word **[owner: sync target = the original project]**.
- **Regeneration obligations** on any tier-CSS change:
  `oak-flat.generated.css` re-cat (`.design-sync/NOTES.md`), conventions
  header re-validation (every class name vs built CSS).
- **The repo is the SSOT** (ADR-213) — the merge lands in the repo;
  the studio is brought up to the merged state afterwards, never the
  reverse.

## 5. Adjacent in-flight work (do not collide)

- **Heron (d3c364)**: MCP-132 (#507, DS source fixes — accordion, band
  padding, dark tokens, icons-as-requirement) → MCP-133 (pull of the
  iteration outputs) → MCP-128 landing-page port. The merge seat's S0
  capture is read-only and parallel-safe; S2/S3 adjudication of shared
  CSS files must coordinate with Heron's landed fixes (their changes are
  part of "today's innovation" — protected).
- **MCP-134** (component-tier candidates) gated open by #498; **MCP-135**
  (token SSOT convergence) backlog; **MCP-136** (3×4 matrix) builds on
  the merged base. All related-linked in Linear.

## 6. Owner items open at time of writing

- MCP-137 plan ratification (the plan lands beside this report,
  status: sketch).
- Adjudication cards will arrive during S2 (design-judgment calls only).
- Expert-author engagement for the five guidance docs (owner's own
  thread, unrelated to this lane but the release path's human leg).
