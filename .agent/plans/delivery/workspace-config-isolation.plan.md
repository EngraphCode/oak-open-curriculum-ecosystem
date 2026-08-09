---
id: workspace-config-isolation
node_type: delivery
name: "Workspace-config isolation: shared config bases become a declared dependency, enforced"
overview: "Move the root vitest/tsup config bases into a config workspace consumed via declared package dependencies, cure all 40 parent-relative config imports, and land enforcement that cannot silently vanish — a dedicated repo validator plus de-hatched lint coverage plus a standing disabled-checks census."
status: sketch
serves: outcome-informed-practice-learning
impact_areas:
  - practice-and-estate
tickets: []
depends_on: []
owner_gates: []
last_updated: 2026-08-09
---

# Workspace-config isolation

## Goal

Every workspace imports shared configuration only through declared
`package.json` dependencies — never by relative paths that reach
outside the workspace — and the enforcement of that boundary is
structural, so it cannot be silently switched off again. The owner's
stated rule is the goal verbatim: "Workspaces must NEVER import from
outside of themselves except via explicit package.json dependencies."

Commissioning word (2026-08-09, owner, in-session): create the
worktree, turn the validators back on, author this decision-complete
plan, and add a periodic sweep for disabled validators and checks.

Second owner word (2026-08-09, in-session, verbatim): "please stop the
tsup files being ignored, and fix the ignoring all the way down,
'strict, everywhere, all the time' is a central concept in this repo".
This elevates lint coverage of config files from defence-in-depth to a
commissioned outcome in its own right: no source-file class is exempt
from lint, and every layer of the ignoring — the shared `ignores`
globs, the src-only rule binding, the decoy `'off'` hatches — is
cured, not worked around.

## Evidence (all first-hand, 2026-08-09)

- **40 config files** reach the repo root by relative path: 18
  `vitest.config.ts` (`../../../vitest.config.base`) and 22
  `tsup.config.ts` (`../../{1,2}/tsup.config.base.js`, three factory
  flavours: `createLibConfig` / `createAppConfig` / `createSdkConfig`).
- **The invisibility is three layers deep**: (1) the shared ESLint
  `ignores` list globally ignores every tsup config
  (`'**/tsup.config.ts'`, `'**/tsup.config.*'`) — those files are
  never linted at all. The second glob's own comment says it targets
  ephemeral bundled artefacts, but those are already covered by the
  adjacent `'**/*.bundled_*.mjs'` entry, so its only real effect is
  ignoring source files; deleting both globs loses nothing. (2) The
  boundary rules (`import-x/no-relative-packages: 'error'`) bind only
  to `files: ['src/**/*.ts']`. (3) The shared base config's
  config-file block AND 20 workspace-local copies carried explicit
  `'off'` lines for the boundary rules — suppressing rules that never
  bound there (decoys implying coverage that did not exist).
- **The rule fires once the layers are removed** (proven first-hand,
  2026-08-09): with the tsup globs deleted from the shared `ignores`
  and `import-x/no-relative-packages: 'error'` bound to the
  config-file block, a rebuild of the standards package (consumed
  from `dist/` — an earlier probe that edited `src/` without
  rebuilding produced a false "rule does not fire" reading) and a
  lint of `graph-core` yields exactly the two expected errors:
  `tsup.config.ts:1` on `../../../tsup.config.base.js` and
  `vitest.config.ts:1` on `../../../vitest.config.base`, with no
  parser errors from the newly-linted file. The pre-migration
  violations themselves are the red-proof of the lint arm.
- depcruise polices layer direction only, and its orphan rule excludes
  config files with the comment "standalone by design" — which is
  exactly what they are not.
- **The violation already cost real work**: Stryker's per-workspace
  sandbox (which symlinks `node_modules` — declared dependencies
  resolve; relative escapes do not) could not resolve the real
  `vitest.config.ts`, forcing the `vitest.stryker.config.ts` duplicate
  in the mutation canary (see `mutation-testing-core-canary`,
  archived). A package-based convention would have needed no duplicate.
- A probe worktree (`.claude/worktrees/vitest-config-workspace`,
  branch renamed to `jimcresswell/vitest-config-workspace`, local
  only) carries the seed edits: the base-config hatch removed, the
  boundary rule bound to config files, and the tsup globs deleted
  from the shared `ignores` — the state in which the firing proof
  above was measured.

## Mechanism

One config workspace makes the violation class structurally
unnecessary; a deterministic validator makes its return structurally
loud; the census makes the *silencing of checks* itself a policed
surface. Decisions, made:

- **`@oaknational/workspace-config`** at `packages/core/workspace-config`
  (core layer, the `oak-eslint` precedent), exporting the vitest base
  test config and the three tsup factories. The root
  `vitest.config.base.ts` and `tsup.config.base.js` files MOVE into it
  and are deleted at the root in the same landing — move, never
  bridge; no re-export shim survives.
- **Consumption**: each workspace adds the `workspace:*` devDependency
  and imports by package name. Package imports resolve inside
  Stryker's symlinked sandbox, per-workspace tooling, and any future
  consumer that copies a workspace subtree.
- **ESLint coverage of config files is a commissioned outcome**
  (second owner word above), landing with the same strictness as any
  source file: delete both tsup globs from the shared `ignores`
  (nothing is lost — the bundled-artefact ephemera the second glob
  claims to target are covered by `'**/*.bundled_*.mjs'`), bind
  `import-x/no-relative-packages` to the config-file block in the
  shared base, and delete every workspace-local `'off'` hatch. The
  rule is proven to fire (§Evidence); a committed lint fixture in the
  standards package's own test suite keeps it firing — a rule whose
  coverage can silently vanish is the defect class this plan exists
  to kill.
- **A dedicated repo validator is the second, drift-immune gate** (the
  `validate-no-machine-local-paths` shape): scan every
  `{vitest,tsup,eslint,tsconfig-adjacent}` config file in every
  workspace for relative imports that resolve outside that workspace's
  directory; exit non-zero naming file and import. Deterministic and
  independent of lint configuration, resolver behaviour, and rebuild
  state — the three surfaces this incident showed can silently defeat
  lint. Wired into `repo-validators:check` (pre-commit + CI); ships
  with a fixture red-proof.
- **The whole shared `ignores` list is audited under the same word**
  ("fix the ignoring all the way down"): every entry is dispositioned
  as generated/ephemeral output (stays, with grounds recorded in the
  disabled-checks register) or content-bearing source (un-ignored,
  findings cured). Entries already flagged first-hand beyond the tsup
  globs: `commitlint.config.js`, `reference/`, `research/`.
- **Directive truing lands with the move**: principles.md §Tooling
  reads "the canonical patterns defined in the base configs at the
  repo root" — true today, false after the migration. The line is
  re-pointed at the config-workspace convention in the same landing
  (misleading docs are blocking).
- **Cure and coverage land together**: enabling enforcement before the
  migration is estate-wide red; migrating without enforcement invites
  silent regression. One landing keeps every landed state correct.
- **The disabled-checks census** generalises the lesson: a validator
  enumerating the estate's check-disabling surfaces (ESLint `'off'`
  entries and `eslint-disable` pragmas, Sonar exclusions,
  `.prettierignore` entries, knip ignores, skipped tests, depcruise
  exclusion entries) against a committed register in which every entry
  carries its grounds; an unregistered disable fails the check. The
  sweep is "periodic" structurally — it runs on every
  `repo-validators:check` (pre-commit + CI), not on a calendar.
  Initial register content is seeded from the census run; rows whose
  grounds are contested surface to the owner as cards at execution,
  which keeps this plan decision-complete without pre-judging every
  historical disable.

## Todos (each a single-story PR within its PDR-132 budget)

1. **The isolation cure**: `@oaknational/workspace-config` package;
   all 40 imports migrated to package imports with `workspace:*`
   devDependencies; root base files deleted; the boundary repo
   validator with its fixture red-proof wired into
   `repo-validators:check`. Mechanical 40-file sweep + one small
   package + one validator = one story; the probe-worktree seed edits
   fold in here.
2. **Lint de-hatching (commissioned)**: both tsup globs removed from
   the shared `ignores`, the full ignores-list audit dispositioned
   (each entry registered-with-grounds or un-ignored-and-cured),
   boundary rule bound for config files, all 20 local hatches
   deleted, the committed firing fixture landed in the standards
   package's test suite; the principles.md §Tooling truing rides
   here. Lands immediately behind todo 1 — the migration is what
   lets the un-ignoring land green.
3. **Stryker duplicate retired**: `vitest.stryker.config.ts` deleted,
   `stryker.config.mjs` pointed at the real `vitest.config.ts`, canary
   re-run banked under `mutation-evidence/` as the end-to-end proof
   that package imports resolve in the sandbox.
4. **Disabled-checks census**: the register (seeded from the census
   run, grounds per row), the validator, wiring into
   `repo-validators:check`; contested rows surface as owner cards.
5. **Closing re-derivation**: acceptance criteria re-proven against
   the live tree; plan archived with dispositions.

## Acceptance criteria (each with a proof)

- Zero config files import by relative path across their workspace
  boundary — `repo-safe`: the boundary validator green at zero
  findings, with its committed fixture red-proof showing it fires.
- The shared bases live only in `@oaknational/workspace-config`; no
  root copies, no bridge — `repo-safe`: root files absent; full
  `pnpm check` green estate-wide.
- The Stryker canary runs against the real `vitest.config.ts` with the
  duplicate deleted — `repo-safe`: the banked re-run log under
  `mutation-evidence/` showing config load and a completed pass.
- Every check-disabling surface in the estate is enumerated in the
  register with grounds, and an unregistered disable fails CI —
  `repo-safe` for the mechanism (validator + fixture); `owner-held`
  for the register's contested rows (his card answers recorded).
- The 20 lint hatches are gone and no source-file class is ignored —
  `repo-safe`: the hatch grep returns zero; every surviving `ignores`
  entry has a registered generated/ephemeral disposition; the
  de-hatch PR carries the committed firing fixture.
- principles.md §Tooling names the config-workspace convention, not
  root base configs — `repo-safe`: the stale line is absent from the
  landed tree.

## Out of scope

- Cross-package relative imports in `src/**` — already policed by the
  existing boundary rules; no change.
- Root-anchored conventions that are their tools' own design
  (`tsconfig.base.json` extends-chains, turbo pipeline config,
  commitlint/husky) — named here so their exclusion is deliberate:
  `extends` is not a module import and crosses no resolver boundary.
- The Sonar disposition policy and `.sonarcloud.properties` doctrine —
  its own owner-ruled surface; the census REGISTERS its exclusions,
  never re-adjudicates them.
- Renaming or restructuring the ESLint standards package itself.

## Notes

- Born-sketch: the owner's commissioning word is cited above; the
  ratification stamp is his act on presentation. An
  `assumptions-expert` review pass is owed before that presentation
  (post-compaction first act for whichever seat picks this up).
- The probe worktree carries only regenerable seed edits; losing it
  costs minutes. Its branch: `jimcresswell/vitest-config-workspace`.
- Linear ticket: mint when the standing ticket embargo lifts
  (2026-08-10) and backfill `tickets`.
