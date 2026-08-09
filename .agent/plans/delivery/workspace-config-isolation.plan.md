---
id: workspace-config-isolation
node_type: delivery
name: "Workspace-config isolation: shared config bases become a declared dependency, enforced"
overview: "Move the root vitest/tsup/e2e config bases into a config workspace consumed via declared package dependencies, cure all 53 parent-relative config imports, and land enforcement that cannot silently vanish — a dedicated repo validator plus de-hatched lint coverage plus a standing disabled-checks census."
status: sketch
serves: outcome-informed-practice-learning
impact_areas:
  - practice-and-estate
tickets: []
depends_on:
  - plan: mutation-testing-core-canary
    kind: blocking
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

The dependency edge above is completion-blocking, not start-blocking:
todos 1, 2, 4, and 5 are independent of the mutation canary; only
todo 3 (and its acceptance criterion) waits on the canary landing its
config files.

## Evidence (all first-hand, 2026-08-09; counts re-derived at review)

- **53 config files across 28 workspaces** reach the repo root by
  relative path, against **three** root bases: 24 `vitest.config.ts`
  → `vitest.config.base`, 23 `tsup.config.ts` → `tsup.config.base.js`
  (the NodeNext specifier for root `tsup.config.base.ts`; three
  factory flavours `createLibConfig` / `createAppConfig` /
  `createSdkConfig`), and 6 files in 4 workspaces →
  `vitest.e2e.config.base` (including `vitest.smoke.config.ts` and
  `vitest.experiment.config.ts` in `apps/oak-search-cli`). Escape
  depth varies from `../` to `../../../../` — the class, not one
  specifier, is the target.
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
  bound there (decoys implying coverage that did not exist). Six
  further workspaces have no config-file boundary binding at all —
  nothing to de-hatch, coverage simply absent.
- **The rule fires once the layers are removed** (proven first-hand,
  2026-08-09): with the tsup globs deleted from the shared `ignores`
  and `import-x/no-relative-packages: 'error'` bound to the
  config-file block, a rebuild of the standards package (consumed
  from `dist/` — an earlier probe that edited `src/` without
  rebuilding produced a false "rule does not fire" reading) and a
  lint of `graph-core` yields exactly the two expected errors:
  `tsup.config.ts:1` on `../../../tsup.config.base.js` and
  `vitest.config.ts:1` on `../../../vitest.config.base`. The
  pre-migration violations themselves are the red-proof of the lint
  arm.
- **Un-ignoring surfaces no parser fallout in any of the three
  workspace shapes** (measured 2026-08-09): `graph-core` (shared-base
  factory), `result` (hand-rolled config-file block with hatch), and
  `oak-search-sdk` (no config-file block) all lint their
  newly-visible `tsup.config.ts` with zero errors and zero parser
  failures. Per-workspace confirmation completes at todo 2's estate
  lint.
- depcruise polices layer direction only, and its orphan rule excludes
  config files with the comment "standalone by design" — which is
  exactly what they are not.
- **The violation already cost real work**: Stryker's per-workspace
  sandbox (which symlinks `node_modules` — declared dependencies
  resolve; relative escapes do not) could not resolve the real
  `vitest.config.ts`, forcing the `vitest.config.stryker.ts`
  duplicate in the mutation canary (see
  `mutation-testing-core-canary`, ratified and in flight). A
  package-based convention would have needed no duplicate. The
  sandbox-resolution assumption is source-verified:
  `@stryker-mutator/core` `sandbox.js` symlinks `node_modules` when
  `symlinkNodeModules && !inPlace` — a future Stryker config change
  to either option re-opens the question.
- **The move has silent downstream consumers**: `turbo.json` names
  the root bases in `$TURBO_ROOT$` task `inputs` (and already carries
  one stale entry — `$TURBO_ROOT$/vitest.config.ts` names a file that
  does not exist; turbo does not error, it silently stops
  invalidating). Root `tsconfig.json` includes `*.config.base.ts`.
  Both are in todo 1's scope; the stale-input class gets its own
  validator leg.
- A probe worktree (`.claude/worktrees/vitest-config-workspace`,
  branch renamed to `jimcresswell/vitest-config-workspace`, local
  only) carries the seed edits: the base-config hatch removed, the
  boundary rule bound to config files, and the tsup globs deleted
  from the shared `ignores` — the state in which the firing and
  parser probes above were measured.

## Mechanism

One config workspace makes the violation class structurally
unnecessary; a deterministic validator makes its return structurally
loud; the census makes the *silencing of checks* itself a policed
surface. Decisions, made:

- **`@oaknational/workspace-config`** at `packages/core/workspace-config`
  (core layer, the `oak-eslint` precedent), exporting the vitest base
  test config, the vitest e2e base, and the three tsup factories. The
  root `vitest.config.base.ts`, `vitest.e2e.config.base.ts`, and
  `tsup.config.base.ts` files MOVE into it and are deleted at the
  root in the same landing — move, never bridge; no re-export shim
  survives. Like the standards package it is consumed from `dist/`;
  turbo's `dependsOn: ["^build"]` orders the build for turbo-driven
  runs, the package's own config files import nothing from itself
  (the self-bootstrap exception), and direct in-workspace tool
  invocation without a prior build inherits the same estate property
  the standards package already has.
- **Consumption**: each consuming workspace adds the `workspace:*`
  devDependency and imports by package name. Package imports resolve
  inside Stryker's symlinked sandbox, per-workspace tooling, and any
  future consumer that copies a workspace subtree.
- **ESLint coverage of config files is a commissioned outcome**
  (second owner word above), landing with the same strictness as any
  source file: delete both tsup globs from the shared `ignores`
  (nothing is lost — the bundled-artefact ephemera the second glob
  claims to target are covered by `'**/*.bundled_*.mjs'`), and land
  the boundary binding everywhere it belongs: the shared-base factory
  block covers its three consumers; each of the 20 workspace-local
  `'off'` hatches is REPLACED with an explicit
  `'import-x/no-relative-packages': 'error'` binding (deleting the
  hatch alone would leave the rule unbound — the exact
  looks-covered-is-not defect this plan kills); the six workspaces
  with no config-file block gain one carrying the binding. The rule
  is proven to fire (§Evidence); a committed lint fixture in the
  standards package's own test suite keeps it firing.
- **A dedicated repo validator is the second, drift-immune gate** (the
  `validate-no-machine-local-paths` shape): scan every
  `{vitest,tsup,eslint,tsconfig-adjacent}` config file in every
  workspace for relative imports that resolve outside that workspace's
  directory; exit non-zero naming file and import. Deterministic and
  independent of lint configuration, resolver behaviour, and rebuild
  state — the three surfaces this incident showed can silently defeat
  lint. A second leg fails on any `$TURBO_ROOT$` input path in
  `turbo.json` that does not resolve to an existing file — killing
  the silent-cache-invalidation class and curing the pre-existing
  stale entry. Wired into `repo-validators:check` (pre-commit + CI);
  ships with fixture red-proofs for both legs.
- **Ordering, not co-landing**: todo 1 lands the migration AND the
  validator in one PR, so every subsequent landed state is guarded;
  todo 2's un-ignoring lands green only after that cure. The reverse
  order (coverage before cure) is estate-wide red and is the one
  forbidden sequence.
- **The whole shared `ignores` list is audited under the same word**
  ("fix the ignoring all the way down"): every entry is dispositioned
  as generated/ephemeral output (stays, with grounds recorded in the
  disabled-checks register) or content-bearing source (un-ignored,
  findings cured). Dispositions already measured: the two tsup globs
  (deleted, above); `reference/` (dead glob — the directory does not
  exist; deleted); `commitlint.config.js` (root JS config, never
  linted — cured in the audit); `research/` (35 loose TS files never
  linted plus the `research-evidence` workspace member — registered
  with measured grounds, cured as its own PR in todo 2's arc since
  the loose files need a lint-project decision).
- **Directive truing lands with the move**: principles.md §Tooling
  reads "the canonical patterns defined in the base configs at the
  repo root" — true today, false after the migration. The line is
  re-pointed at the config-workspace convention in the same landing
  (misleading docs are blocking).
- **The disabled-checks census** generalises the lesson: a validator
  enumerating the estate's check-disabling surfaces (ESLint `'off'`
  entries and `eslint-disable` pragmas, Sonar exclusions,
  `.prettierignore` entries, knip ignores, skipped tests, depcruise
  exclusion entries) against a committed register in which every entry
  carries its grounds; an unregistered disable fails the check. The
  sweep is "periodic" structurally — it runs on every
  `repo-validators:check` (pre-commit + CI), not on a calendar. The
  seeding contract, decided: every existing disable is registered
  from day 1 by mechanical derivation (source location as initial
  grounds), so the validator binds immediately; hand-authored grounds
  accrete at cure time; rows whose grounds are contested surface to
  the owner as cards at execution. The census run measured ~320 rows
  across the surfaces — registration is therefore its own sweep
  (todo 5), separate from the mechanism (todo 4).

## Todos (sliced per PDR-132 §5; classes named per todo)

1. **The isolation cure** (source/config sweep):
   `@oaknational/workspace-config` package; all 53 imports across 28
   workspaces migrated to package imports with `workspace:*`
   devDependencies; the three root base files deleted; `turbo.json`
   `$TURBO_ROOT$` inputs and the root `tsconfig.json` include
   re-pointed; the boundary repo validator (both legs) with fixture
   red-proofs wired into `repo-validators:check`. This crosses the
   PDR-132 §2 size warnings deliberately and is re-examined here at
   authoring: it is one mechanical story (the same one-line import
   swap 53 times plus one small package plus one validator), and
   fragmenting it would move cost into integration; it proceeds as
   one PR. The probe-worktree seed edits fold in here.
2. **Lint de-hatching (commissioned; config sweep)**: both tsup globs
   removed from the shared `ignores`, the full ignores-list audit
   dispositioned (each entry registered-with-grounds or
   un-ignored-and-cured, per the Mechanism's measured dispositions),
   the 20 hatches replaced with explicit `'error'` bindings, the six
   absent config-file blocks added, the committed firing fixture
   landed in the standards package's test suite; the principles.md
   §Tooling truing rides here. Lands after todo 1 — the migration is
   what lets the un-ignoring land green. The `research/` cure lands
   as its own PR inside this todo's arc.
3. **Stryker duplicate retired** (small source change):
   `vitest.config.stryker.ts` deleted, `stryker.config.mjs` pointed
   at the real `vitest.config.ts`, canary re-run banked under
   `mutation-evidence/` as the end-to-end proof that package imports
   resolve in the sandbox. Waits on `mutation-testing-core-canary`
   landing those files (the frontmatter's blocking edge).
4. **Disabled-checks census mechanism** (source): the register
   schema, the census validator with fixture red-proof, mechanical
   day-1 seeding of all ~320 rows (source location as grounds),
   wiring into `repo-validators:check`.
5. **Census registration sweeps** (record class): per-surface
   hand-authored grounds, contested rows surfaced as owner cards,
   cures routed to their owning lanes.
6. **Closing re-derivation** (record class): acceptance criteria
   re-proven against the live tree; plan archived with dispositions.

## Acceptance criteria (each with a proof)

- Zero config files import by relative path across their workspace
  boundary — `repo-safe`: the boundary validator green at zero
  findings, with its committed fixture red-proof showing it fires.
- The shared bases live only in `@oaknational/workspace-config`; no
  root copies, no bridge; every `$TURBO_ROOT$` input in `turbo.json`
  resolves — `repo-safe`: root base files absent; the turbo-input
  validator leg green; full `pnpm check` green estate-wide.
- The Stryker canary runs against the real `vitest.config.ts` with
  `vitest.config.stryker.ts` deleted — `repo-safe`: the banked re-run
  log under `mutation-evidence/` showing config load and a completed
  pass.
- Every check-disabling surface in the estate is enumerated in the
  register with grounds, and an unregistered disable fails CI —
  `repo-safe` for the mechanism (validator + fixture); `owner-held`
  for the register's contested rows, recorded in the register file
  itself (each contested row carries the comms event id of its owner
  card and the answer).
- The 20 lint hatches are replaced with live bindings, the six absent
  blocks added, and no source-file class is ignored — `repo-safe`:
  the hatch grep returns zero `'off'` entries for the boundary rules;
  every surviving `ignores` entry has a registered
  generated/ephemeral disposition; the de-hatch PR carries the
  committed firing fixture.
- principles.md §Tooling names the config-workspace convention, not
  root base configs — `repo-safe`: the stale line is absent from the
  landed tree.

## Out of scope

- Cross-package relative imports in `src/**` — already policed by the
  existing boundary rules; no change.
- `stryker.config.base.ts` and `vitest.field-integrity.config.ts` at
  the root — zero relative importers (verified); each is audited at
  todo 1 execution and either consumed by a non-import mechanism
  (stays, with the consumer named) or dead (deleted). They are named
  here so their exclusion from the 53 is deliberate.
- Consolidating the 20 hand-rolled ESLint config-file blocks onto
  shared machinery — a real generator-level improvement, but its own
  story; todo 2 touches each block one line, not its shape.
- The demo workspaces' `vitest.config.ts` files that import no base —
  excluded by fact, not by rule; the validator scans them harmlessly.
- Root-anchored conventions that are their tools' own design
  (`tsconfig.base.json` extends-chains, turbo pipeline config,
  commitlint/husky) — named here so their exclusion is deliberate:
  `extends` is not a module import and crosses no resolver boundary.
  (The `commitlint.config.js` lint-coverage cure in todo 2's audit is
  the ignoring question, not this structural one.)
- The Sonar disposition policy and `.sonarcloud.properties` doctrine —
  its own owner-ruled surface; the census REGISTERS its exclusions,
  never re-adjudicates them.
- Renaming or restructuring the ESLint standards package itself.

## Notes

- Born-sketch: the owner's commissioning words are cited above; the
  ratification stamp is his act on presentation. The
  `assumptions-expert` review pass ran 2026-08-09 (verdict:
  not-ready on measurement grounds); this revision re-measured every
  flagged count first-hand (53/28/3 confirmed), added the
  `vitest.e2e.config.base` class, the `depends_on` edge, the
  turbo.json scope, the de-hatch replace-not-delete restatement, and
  the two requested probe measurements. Findings and dispositions
  live in the review transcript and this file's history.
- The probe worktree carries only regenerable seed edits; losing it
  costs minutes. Its branch: `jimcresswell/vitest-config-workspace`.
- Linear ticket: mint when the standing ticket embargo lifts
  (2026-08-10) and backfill `tickets`.
