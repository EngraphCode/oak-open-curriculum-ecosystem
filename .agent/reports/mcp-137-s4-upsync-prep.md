# MCP-137 S4 — local up-sync preparation (no studio access required or used)

Prepared at the S4 hard stop under the Director's local-prep authorisation
(comms event `c69b25af` routing, prep authorised in the reply), while the
owner-held gate stands carded. Everything here is derivable from the repo;
nothing touches the studio. Base: main at `709002ec0` (S0→S3 complete).

## The up-sync file-set (derived from working surfaces)

The sync runs the `package` shape per `.design-sync/config.json`; the shipped
set is the config's globs plus the runbook's REQUIRED cargo. Staged manifest
with per-file sha256 at
[`mcp-137-s4-upsync-manifest.tsv`](./mcp-137-s4-upsync-manifest.tsv)
(155 files, hashed against main at `709002ec0`):

| Role | Count | Source |
| --- | --- | --- |
| Guidelines | 11 | `README.md`, `DECISIONS.md`, `KNOWN-ISSUES.md`, `docs/*.md` (7, including the `pairing-ark-ui.md` repaired at S2/S3), plus the conventions header `.design-sync/conventions.md` |
| Fonts | 4 | `fonts/` — both variable fonts with their OFL notices (OFL condition 2) |
| Assets (REQUIRED cargo) | 139 | `assets/` — the full mask-icon set + root logos/brand/favicon; the 2026-07-23 first-sync omission of these caused the Cloudinary-hotlink incident, never again |
| Bundle entry | 1 | `oak-theme.js` (the package's only JS export) |
| Derived at sync time | 1 | `oak-flat.generated.css` via `pnpm --filter @oaknational/oak-design-system build:flat` — REGENERATE immediately before the sync; a stale flat file ships stale styles silently |

**Exclusions, named per the plan (Amendment item 4)**: both preservation
folders — `studio-source/original-capture-2026-07-23/` and
`studio-source/iteration-pull-preservation-2026-07-23/` — plus their sibling
records (`PRESERVATION-README.md`, the capture manifest). These are ALSO
excluded by construction: no config glob reaches `studio-source/`, verified
against the config's glob set. `dtcg/*.json` does not ship (no resolvable
`tokensPkg`; every custom property rides the CSS — the runbook's token-count
check covers the gap). The workspace-root held-out classes do not exist in
the working tree.

## Pre-flight checklist (executes only when the owner discharges the gate)

1. **Owner**: account switch to the studio-access account (carded; standing).
2. **Owner/Director word**: the original project's post-switch fate
   (plan Amendment item 4's remaining precondition).
3. `/design consent` on the new account (fresh consent — the switch
   invalidates prior consent state).
4. `DesignSync get_project` probe on `314dd517-493d-4be2-bd08-56ae0e80e780`:
   confirm it exists, is `PROJECT_TYPE_DESIGN_SYSTEM`, and `canEdit` is
   true — BEFORE any write.
5. Update `.design-sync/config.json` `projectId` →
   `314dd517-493d-4be2-bd08-56ae0e80e780` (the owner-ruled go-forward
   studio) — commit rides the S4 change.
6. **True the runbook in the same change**: `.design-sync/NOTES.md`
   §Re-sync risks final paragraph currently instructs "never sync to the
   other account from this config" — written before the owner ruled the
   original project go-forward. It must be rewritten at S4 (same
   resolve-by-projectId discipline, new target) or the runbook forbids the
   very sync it governs. Heron's two process rules also append to
   §Re-sync risks in this change (their recorded gate is "MCP-137 S4, the
   next re-sync execution"): (a) mechanical claim re-verification at every
   sync-back; (b) theme screenshots settle ≥150 ms past the transition.
7. `pnpm --filter @oaknational/oak-design-system build:flat` (regenerate);
   re-validate the conventions header's class vocabulary against the fresh
   flat CSS (grep loop per the 2026-07-23 sync transcript).
8. Run the re-sync (design-sync resync driver, package shape).
   Delete-reconciliation is safe by construction — everything it could
   remove is in git history (the plan's zero-loss mechanism, now including
   the 39).
9. **Post-sync verification** (from the runbook + S1 ledger notes):
   two `--i-*` asset URLs from the shipped CSS resolve in the project;
   custom-property count ≥ the last sync's 474 and consistent with the
   token tier; `_ds_sync.json` sidecar current; the studio's `styles.css`
   now carries the cured header comment (the S1 ledger's Notable finding 1 —
   correct overwrite direction, verify it happened); config committed.
10. Owner glance at the studio (`owner-held` proof per the plan's S4
    acceptance).

## Standing evidence at this stop

- Unfetchable manifest class: empty by construction (owner-export
  acquisition) — S4's discharge precondition already satisfied.
- Held-out per-piece re-review: satisfied-in-substance (#523, owner ruling
  "Commit all 39"); final confirmation folds into the owner card above.
- The up-sync set touches no preservation material: structural (glob-scoped)
  AND named exclusions agree.
