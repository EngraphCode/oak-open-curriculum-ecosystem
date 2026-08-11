---
id: workspace-config-isolation
node_type: delivery
name: "Workspace-config isolation: shared config bases become a declared dependency, enforced"
overview: "Move the root vitest/tsup/e2e config bases into a config workspace consumed via declared package dependencies, cure all 53 parent-relative config imports, and land enforcement that cannot silently vanish — a dedicated repo validator plus de-hatched lint coverage plus a standing disabled-checks census."
status: ratified
ratified_by: "Jim Cresswell"
ratified_date: 2026-08-11
ratified_where: "Owner approval of the decision-complete completion-arc plan, in-session at the implementer seat (Wren calls Downdraft 6b29b5), 2026-08-11 — the plan-mode artefact enumerated the three scope deltas explicitly (search-contracts layer move with ADR record; tsconfig-extends entering scope; acceptance-criterion 5 + Mechanism ESLint rewrite) and the approval is the re-ratification word. Prior stamp history in §Notes."
serves: outcome-informed-practice-learning
impact_areas:
  - practice-and-estate
tickets:
  - MCP-540
  - MCP-542
depends_on:
  - plan: mutation-testing-core-canary
    kind: blocking
owner_gates: []
last_updated: 2026-08-11
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

- **53 config files across 29 workspaces** reach the repo root by
  relative path, against **three** root bases: 24 `vitest.config.ts`
  → `vitest.config.base`, 23 `tsup.config.ts` → `tsup.config.base.js`
  (the `.js` specifier for root `tsup.config.base.ts` under the
  repo-wide `bundler` module resolution; three factory flavours
  `createLibConfig` / `createAppConfig` / `createSdkConfig`), and 6
  files in 4 workspaces → `vitest.e2e.config.base` (4
  `vitest.e2e.config.ts` plus `vitest.smoke.config.ts` and
  `vitest.experiment.config.ts` in `apps/oak-search-cli`). Escape
  depth varies from `../` to `../../../../` — the class, not one
  specifier, is the target.
- **A fourth root file moves with them**: `test.setup.no-network.ts`,
  which the e2e base loads by path arithmetic against its own module
  URL (`vitest.e2e.config.base.ts:26`) — a relative escape no import
  scanner sees. Left at root, the moved base resolves it into the
  package's `dist/` where it does not exist and every e2e suite in
  four workspaces fails to boot. `turbo.json` also names it twice.
- **The naive package shape hard-fails turbo** (measured on the
  pinned turbo 2.10.6 in a scratch two-package repo): a
  devDependency-only cycle between the standards package and the
  config package (`oak-eslint`'s own configs are among the 53, so it
  would devDepend on `workspace-config`, which under estate
  convention would devDepend back) exits 1 on every `turbo run`. The
  package-scoped `dependsOn: []` override silences the failure but
  leaves a "Circular package dependency" WARNING on every turbo
  command and a pnpm cyclic-workspace warning on every install —
  disqualified twice under no-warning-toleration. The cure is
  structural: zero internal workspace dependencies (below).
- **The stale turbo input is five entries, not one, and turbo is
  silent about all of them** (measured): `$TURBO_ROOT$/vitest.config.ts`
  at `turbo.json:293/386/398/411/433`; a live dry-run shows it
  surviving into resolved task definitions and contributing zero
  hashed files with no warning — the silent-cache-invalidation class
  the validator leg targets, demonstrated on the live tree.
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
  (core layer, the `oak-eslint` precedent), with subpath exports
  `./vitest`, `./vitest-e2e`, `./tsup`, and `./no-network-setup` —
  never one barrel, because a barrel would pull `tsup` into every
  vitest config's module graph and five consuming workspaces have no
  `tsup` in their closure at all. The root `vitest.config.base.ts`,
  `vitest.e2e.config.base.ts`, `tsup.config.base.ts`, and
  `test.setup.no-network.ts` files MOVE into `src/` and are deleted
  at the root in the same landing — move, never bridge. The base
  files keep their filenames (depcruise's existing
  `vitest\.config`/`tsup\.config` orphan-exemption patterns then
  cover them with zero new exclusion entries); the setup file is
  renamed `no-network.setup.ts` in the move so the existing
  `\.setup\.` pattern covers it too, and the e2e base's
  path-arithmetic line becomes the bare specifier
  `'@oaknational/workspace-config/no-network-setup'` (order-safe
  under `mergeConfig` — the no-network setup stays first). Export
  NAMES stay identical (`baseTestConfig`, `baseE2EConfig`, the three
  factories; the e2e base's redundant default export is dropped), so
  every migration site is a one-token specifier swap.
- **The package declares ZERO internal workspace dependencies** (the
  measured turbo-cycle evidence above): its own `eslint.config.ts`
  is hand-rolled on raw `typescript-eslint` — the exact
  self-bootstrap precedent `oak-eslint` already sets — and its own
  config files import from `./src/` (within-workspace relative, so
  the new validator passes it by construction; never a self-reference
  through `exports`, which is chicken-and-egg on a cold build). This
  is the estate's second standards-package exemption and is
  registered as such in the disabled-checks census. `tsup` and
  `vitest` are optional `peerDependencies` (the built configs execute
  in the consumer's resolution context) plus devDependencies for the
  package's own build. Build mirrors `oak-eslint` (`tsup && tsc
  --emitDeclarationOnly`) — the declarations are load-bearing for
  consumer type-checks. Consumed from `dist/`; turbo's
  `dependsOn: ["^build"]` orders the build for turbo-driven runs;
  direct in-workspace tool invocation without a prior build inherits
  the same estate property the standards package already has (stated
  in the package README).
- **Consumption**: each consuming workspace adds the `workspace:*`
  devDependency and imports by package name.
  `pnpm-workspace.yaml` enumerates `packages/core/*` members
  individually — the new package needs its explicit line or
  `workspace:*` fails at install. `knip.config.ts` gains the
  compiled-package entry block (the `oak-eslint` precedent at its
  line 217); the root `tsup` devDependency and its knip
  `ignoreDependencies` entry are deleted together (its only root
  importer is the moving base; root `vitest` STAYS — the
  field-integrity config uses it). Package imports resolve inside
  Stryker's symlinked sandbox, per-workspace tooling, and any future
  consumer that copies a workspace subtree.
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
  with no config-file block gain one carrying the binding. Two
  measured constraints on the binding: the config-file `files` glob
  widens to the `vitest*.config.ts` class — the literal
  `'vitest.config.ts'` glob misses six of the 53 (e2e, smoke,
  experiment) — and the binding is the SINGLE named rule, never a
  `...boundaryRules` spread, because the spread carries
  `import-x/no-extraneous-dependencies` with
  `devDependencies: false`, which would turn every migrated config
  file red on its `workspace:*` devDependency import. The rule is
  proven to fire (§Evidence); a committed lint fixture in the
  standards package's own test suite keeps it firing.
- **A dedicated repo validator is the second, drift-immune gate** (the
  `validate-no-machine-local-paths` shape, run from source via tsx —
  the CI static-checks job installs without building, so the
  validator imports nothing from `workspace-config`). Leg (a):
  lexical containment — resolve the `pnpm-workspace.yaml` globs to
  workspace directories, take the longest-prefix owner per config
  file (`{vitest*,tsup,eslint}.config` across
  `.ts/.mts/.cts/.js/.mjs/.cjs`), `path.resolve` every static
  relative specifier, finding iff the resolved path escapes the
  owner. Containment is a directory question — never resolve to a
  real file (no extension mapping, no realpath; determinism against
  any checkout), and the `import.meta.url` path-arithmetic pattern
  is a second scanned class (the e2e setup line is the motivating
  instance). Non-literal import arguments fail loud as unanalysable.
  Leg (b): `$TURBO_ROOT$` inputs — strip a leading `!` (negations
  are existence-exempt); no glob metacharacter → the file must
  exist; glob → the leading literal prefix must exist. Applied to
  today's tree this yields exactly the five stale entries and
  nothing else (measured — the red-proof). `turbo.json` is JSONC, so
  the leg parses it with a comment-tolerant parser (`jsonc-parser`
  as an agent-tools devDependency — none is in the tree today).
  Deterministic and independent of lint configuration, resolver
  behaviour, and rebuild state — the three surfaces this incident
  showed can silently defeat lint. Wired into
  `repo-validators:check` (pre-commit + CI); fixture red-proofs for
  both legs.
- **The redundant turbo inputs are DELETED, not re-pointed**
  (measured): once consumers carry the `workspace:*` edge, turbo
  folds `workspace-config#build`'s hash into every consumer task via
  `dependsOn: ["^build"]` — a dependency-source edit changes the
  consumer's task hash with no `$TURBO_ROOT$` input at all.
  Re-pointing the twelve base-config entries at package source would
  create cache keys that track `src/` while consumers read `dist/` —
  the next stale-input candidate. The five stale
  `vitest.config.ts` entries and the two `test.setup.no-network.ts`
  entries are cured in the same pass; the `$TURBO_ROOT$/eslint.config.ts`
  legs correctly stay (the root ESLint config is not a package).
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
  (deleted, above); `reference/` AND `commitlint.config.js` (both
  dead globs — no root-level `reference/` directory exists;
  `.agent/reference/` does exist (14 tracked files) but the
  root-anchored flat-config glob matches nothing (ground trued
  2026-08-11) — and the commitlint
  config is `commitlint.config.mjs`, so the `.js` entry ignores
  nothing; both deleted, and whether `commitlint.config.mjs` is
  inside the lint surface is the live audit question in their
  place); `research/` (35 loose TS files never linted plus the
  `research-evidence` workspace member — registered with measured
  grounds, cured as its own PR in todo 2's arc since the loose files
  need a lint-project decision).
- **Doc truing lands with the move** (misleading docs are blocking;
  every surface enumerated first-hand): principles.md §Tooling
  reads "the canonical patterns defined in the base configs at the
  repo root" — true today, false after the migration; re-pointed at
  the config-workspace convention. Also in the landing:
  testing-strategy.md's two root-base references (lines ~620/628),
  ADR-010 (the tsup-base decision record — its stated decision
  changes, an amendment not a stale-mention edit), ADR-168 line ~415
  (lists "resolve the vitest.config.base coupling" as open work this
  PR closes — a status change), the false comment at
  `apps/oak-curriculum-mcp-streamable-http/build-scripts/esbuild-config.ts:16`
  ("tsup.config.base.ts survives at the repo root"), and the root
  `tsconfig.json` include (keep the `*.config.base.ts` glob —
  `stryker.config.base.ts` stays — and true the `stryker.config.mjs`
  entry, which names a file that does not exist at root).
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

## Mechanism amendment (2026-08-10, owner-ruled — supersedes the validator leg (a) shape above)

Three owner rulings landed after ratification and reshaped the
enforcement instruments; recorded here at occurrence, executed inside
PR #836:

- **Dependency-cruiser is the containment instrument** ("if we use
  regex it is because we are using the wrong tool… dep cruise is
  clearly the right tool for the job"; doctrine in
  validation-strategy.md §Gate integrity). Leg (a)'s static-specifier
  regex scan is REPLACED by four depcruise rules in
  `.dependency-cruiser.mjs`: `workspace-config-containment` (a `$1`
  workspace back-reference, probe-verified on 18.1.0),
  `workspace-config-no-phantom-deps` (built-in undeclared-dependency
  detection — the packet's H3 substance), `no-commonjs-require`, and
  `no-dynamic-import`. A check-fires integration test imports the real
  rules by reference and red-proofs each. The cruise scope gained the
  nested research workspaces so no pnpm-workspace member sits outside
  the rule.
- **ESM ruling**: zero `require` statements estate-wide at error
  severity (the three generated vocab loaders were the only sites —
  cured at the generator, fs-read replacing `createRequire`), and
  dynamic `import()` at error severity with a named per-site exemption
  set (empty at landing; estate-wide zero measured).
- **What stays bespoke in the validator** (probe-verified
  resolver-invisible): literal `import.meta.url` path arithmetic,
  the non-literal refusal channel (depcruise emits NO edge for a
  non-literal dynamic import), and the turbo-inputs JSONC leg — plus a
  new degenerate-scan guard (exit 2 on zero workspaces or zero config
  files).

## Amendment (2026-08-11, owner-ratified — the decision-complete completion arc)

Four owner rulings (2026-08-11) reshaped the remainder: error-severity
findings get fixed, never warranted; an exemption inside an enforcement
surface is an alarm bell — fix the problem or change the policy, with a
clock; follow-up registers receive critical assessment then sequencing
or rejection; and the lane's scope stays isolation-only (estate-wide
mutation roll-out is owner-committed future work — "We ARE going to
roll out mutation testing everywhere, but later, and in stages" — see
Out of scope). Reviewed pre-ratification by an assumptions-expert pass
and a design stress-test; all 23 findings folded in. The four
enforcement-hardening slices cut to the successor node
[`workspace-config-enforcement-hardening`](workspace-config-enforcement-hardening.plan.md)
(born with the same ratification word) so this node stays one step of
the lane and archives when its criteria prove.

### State record

- **Todo 1 DONE**: PR #836 merged `d4e256294` (2026-08-10) — package,
  migration, depcruise rules, resolver-invisible validator,
  cold-install cure.
- **Todo 3 DONE**: PR #848 merged `bb40ecdf5` (2026-08-11) — Stryker
  runs the real `vitest.config.ts`, duplicate deleted, re-run banked
  (18/18, 100%) plus the reversible config-load sentinel probe. The
  `mutation-testing-core-canary` plan archives in this same landing
  (its criteria prove via #848), clearing this plan's blocking edge.
- Ground correction (would otherwise seed the census register
  verbatim): §Mechanism's ignores-audit disposition said "no
  `reference/` directory exists"; the true ground is that no
  **root-level** `reference/` exists — `.agent/reference/` does exist
  (14 tracked files) but the root-anchored flat-config glob matches
  nothing. The disposition (delete the dead glob) is unchanged.
- 7f closure, trued: exit-2-on-unreadable is implemented
  (`validate-workspace-config-isolation.ts` readRepoFile try/catch)
  and the JSONC parse-error refusal path is test-covered; the
  fs-unreadable branch is implementation-verified-only — its bin-level
  test lands with the successor node's H1 validator rewrite.

### Register triage ledger (supersedes the open rows of §Enforcement-completeness follow-ups)

| Row | Disposition |
|---|---|
| 7a | Sequenced → successor H3 (tsconfig-extends; reverses this plan's former Out-of-scope clause — ratified scope delta) |
| 7b | Reshaped → successor H1: one idiom by construction (4 spellings / ~40 legitimate sites measured; allowlist-one-refuse-rest would refuse ~40 correct files) |
| 7c | Sequenced → successor H1; honestly sized: 2 live config-VALUE relative strings estate-wide, both targeting lint-ignored `.agent/reference/**` — fixture-proven leg, expected zero live findings |
| 7d | Cured in successor H1's validator rewrite (the quote-parity false-refusal heuristic is rewritten, not fixture-patched) |
| 7e | Sequenced → successor H2 |
| 7f | Closed — already done (trued in State record above) |
| 7g | Sequenced → successor H4 |
| 7h | In flight → slice S1 (ticket MCP-542) |
| 7i | Folded → todo 2 with a decision gate: `@oaknational/no-dynamic-import` already fires on every ImportExpression once config files are linted; todo 2 opens with one `--print-config` check for `@typescript-eslint/no-require-imports` — present → doc note; absent → its own rule-authoring PR |
| 7j | Merged into successor H2 (two widened-family configs sit below their workspace root; the row has no live material until H2 lands) |
| 7k | Folded → successor H4 |
| 7l | Reclassified — a recorded falsifier condition already living in the rule comment, not work; row deleted |

### Slice S1 — dead references in root build configs (MCP-542, in flight)

First act: pin the matcher and the domain — "tracked" means
`git ls-files`; glob semantics are the turbo-compatible subset (`**`
matches zero or more segments, `*`, `?`, leading `!` negation stays
existence-exempt), and the validator REFUSES pattern syntax outside
that subset rather than guessing. Then DERIVE the dead-entry set under
the pinned matcher and delete every derived-dead entry.

Execution record (2026-08-11, commit `653d170ec` on the S1 branch;
pre-execution code-expert review findings absorbed): the derivation
ran against turbo's own `--dry=json` resolved inputs — the
authoritative instrument — and settled both disputes. The `*.yaml`
entry is ALIVE (`**` matches zero segments; `pnpm-workspace.yaml`
hashes under it) and stays; the dead set is exactly the three
`js/cjs/mjs` entries, deleted. Two further review facts recorded:
turbo's `inputs` globs walk the FILESYSTEM, not the git index
(probe-measured — untracked and gitignored files hash), so the
validator's tracked-set domain is a deliberate deterministic
over-approximation whose finding message names the class honestly;
and the root `tsconfig.json` stryker include was verified ALREADY
DISCHARGED (removed at the todo-1 landing), so that fold-in is a
no-op. The canary-archival plan-path re-points moved OUT of this
slice (the archival commit sits on the coordination branch until the
next fold, so a main-based PR would create dangling references) —
they ride S2 under a live-surfaces rule: only
`packages/core/type-helpers/stryker.config.mjs` and
`mutation-evidence/survivor-dispositions.md` re-point; the frozen
`.txt` evidence snapshots and their verbatim reproductions in
`mechanics-report.md` stay as historical record.

### Slice S2 — search-contracts layer move (the exemption dies)

Routing chain, recorded: the depcruise rule comment marked this cure
Director-routed; the Director ruled PROCEED (2026-08-11) on the
consumer-graph evidence; the owner ratified it here. Its admission to
this lane is warranted by the exemption-alarm ruling — the exemption
is this lane's own artifact. Evidence: the package's `src/` is exactly four files —
field-inventory.ts, stage-contract-matrix.ts (same-package importer),
one test, and index.ts; every external consumer is a test file (two in
`apps/oak-search-cli`, two in `packages/sdks/oak-search-sdk`); no
other libs package imports it. Considered and rejected: folding the
modules into `sdk-codegen` (hand-authored contracts inside the
generated-code package, against ADR-138's separation).

One single-story PR: `git mv packages/libs/search-contracts
packages/sdks/search-contracts` (package name unchanged);
`pnpm-workspace.yaml` member line; `vitest.field-integrity.config.ts`
re-point WITH proof the suite still executes twelve files (the
include-list would otherwise drop a leg silently); the standards
package's boundary vocabulary — `boundary.ts` lib-package inventories,
the search-contracts constants and the whole
`searchContractsSdkException` branch deleted, `lib-boundary.unit.test.ts`
sites updated, and `validate-boundaries.ts` (asserting the inventory
equals the live `packages/libs/` listing) kept green by SAME-COMMIT
boundary edits; the moved package's own eslint config moves to
`createSdkBoundaryRules` with a new `'contracts'` role added to the
closed role enum (closed-and-additive; allowed imports: sdk-codegen
subpaths + core; check at execution whether ADR-108 carries the role
list and amend if so); `knip.config.ts` re-key; the two README path
references; **ADR-041 and ADR-138 amendments in the same PR** — the
post-move sdk→sdk edge is unpoliced by design, and that policy change
is recorded where policy lives. Red-proof: the moved tree green AND a
libs-fixture probe fires `no-libs-to-sdks` before the `pathNot`
exemption deletion lands.

### Census enrichment (todos 4–5)

The census is grounded in PDR-136 (quality gates are a registered
corpus; its pending 2026-08-10 amendment is noted, not blocked on).
Register rows classify as **scoping** (the check correctly excludes
generated/ephemeral output — grounds recorded, legitimate, no clock)
or **suppression** (the check would fire on real source and is being
silenced — every row carries exactly one of `fix-routed(ticket)` /
`policy-ratified(pointer)` / `pending(owner card raised at the
sweep)`). No open-ended warranted state exists — the exemption-alarm
ruling, encoded structurally. The inline owner-initials approval
marker in `@oaknational/no-eslint-disable` (one live site:
`packages/core/result/src/unwrapping.ts`, the sanctioned
Result-pattern throw) folds in as a suppression class; that site is
`policy-ratified`. Seeding is mechanical and PROGRAMMATIC — it
evaluates ESLint flat configs rather than grepping, so the reflective
JS-override pattern (four workspaces, grep-invisible) is captured.
The seed count re-derives at seeding time (326 measured 2026-08-11 is
a sizing input only; todo 2 deletes rows first, and the mechanical
seeder re-runs as todo 2's final commit). The register is partitioned
per-surface (one file per surface: eslint, prettierignore, knip,
depcruise, sonar, tests) so parallel slices co-edit without
contention. Sweep dispositions already decided: depcruise
`no-deprecated-node` moves warn→error (or gains a registered
disposition if findings resist same-PR cure); the `.prettierignore`
entries naming non-existent workspace paths are deleted as dead.

### Execution order

A1/A2 landing → S1 → S2 → todo 2 ∥ todo 4 → todo 5 → successor node
H1→H2→H3→H4 (H1 before H2 so per-family red-proofs are written once,
under final refusal semantics) → todo 6. Todo 2's arc is three named
PRs: (a) de-hatch + ignores audit + shared-preset binding + fixture;
(b) the `research/` cure; (c) the 7i rule PR only if its opening check
shows `no-require-imports` absent. H-slices and todo 5 are cross-seat
parallelisable (the per-surface register partition makes co-edits
safe).

## Todos (sliced per PDR-132 §5; classes named per todo)

1. **The isolation cure** (source/config sweep) — **DONE, PR #836
   merged `d4e256294` 2026-08-10**:
   `@oaknational/workspace-config` package (zero internal deps,
   subpath exports, the four moved files per the Mechanism); all 53
   imports across 29 workspaces migrated (counts re-derived at
   execution) with `workspace:*` devDependencies; root files
   deleted; `pnpm-workspace.yaml` member line; the redundant turbo
   inputs deleted and the five stale entries cured; root
   `tsconfig.json` include trued; `knip.config.ts` compiled-package
   entry plus the root-tsup deletion pair; the doc-truing surfaces
   from the Mechanism; the boundary repo validator (both legs) with
   fixture red-proofs wired into `repo-validators:check`. This
   crosses the PDR-132 §2 size warnings deliberately and is
   re-examined here at authoring: it is one mechanical story (the
   same one-token specifier swap 53 times plus one small package
   plus one validator), and fragmenting it would move cost into
   integration; it proceeds as one PR. The probe-worktree seed edits
   fold in here.
2. **Lint de-hatching (commissioned; config sweep)** — reshaped
   2026-08-11 (owner-ratified; right-tool ruling applied; nothing
   commissioned is reduced): ALL 52 decoy `'off'` lines are DELETED
   (measured: 21 × `import-x/no-relative-packages`, 31 ×
   `import-x/no-relative-parent-imports`, across 21 files) — no hatch
   survives. The binding moves to the SHARED preset, not
   per-workspace blocks (fix the generator: one config-file binding
   in `oak-eslint`'s shared config covers every workspace; the former
   "six absent blocks" item dissolves). `no-relative-packages` is
   inherited, with depcruise remaining the authoritative
   cross-workspace gate; `no-relative-parent-imports` is BOUND, not
   retired — depcruise's `to.pathNot ^$1/` deliberately permits
   within-workspace paths, so this rule is the only instrument
   policing `../` within a workspace; sites that fire are cured, and
   a cure-resistant site returns as an owner policy card, never a
   silent `'off'`. Both tsup globs and the two dead globs leave the
   shared `ignores`; the full ignores-list audit is dispositioned;
   the `files` glob widens to the `vitest*.config.ts` class;
   `linterOptions.reportUnusedDisableDirectives` lands at error
   (unset anywhere today); coverage proof is config files present in
   the effective lint surface (`--print-config`) plus the committed
   firing fixture. The reflective JS-override pattern (four
   workspaces, grep-invisible) is census-registered with grounds; its
   removal follows `.js`-source retirement, not this lane. The
   `research/` cure lands as its own PR inside this todo's arc under
   a decided policy: all research TS joins the lint surface under the
   standard preset with no new hatches (the config mechanism is
   implementer discretion recorded in that PR). Opens with the 7i
   decision gate (Amendment §Register triage ledger).
3. **Stryker config cured — the silent fallback dies** (small source
   change) — **DONE, PR #848 merged `bb40ecdf5` 2026-08-11** (18/18
   at 100%, sentinel probe banked): measured 2026-08-09, `stryker.config.mjs` on main names
   `vitest.stryker.config.ts` — a file that does NOT exist — and a
   dry-run SUCCEEDS anyway (11 tests), so mutation testing currently
   works through a silent fallback, the fail-fast violation class
   this estate bans. Cure: point `vitest.configFile` at the real
   `vitest.config.ts` (possible once todo 1 merges — and a sandboxed
   dry-run on the merged branch already ran green through the package
   imports, retiring todo 3's one open question early), delete the
   duplicate-config comment scar, and bank a canary re-run under
   `mutation-evidence/` as the end-to-end proof. This SUPERSEDES the
   canary plan's restore-the-conserved-copy step — reconcile that
   plan's todo in the same landing. Executable immediately after
   todo 1 merges.
4. **Disabled-checks census mechanism** (source): the register
   schema, the census validator with fixture red-proof, mechanical
   day-1 seeding of all ~320 rows (source location as grounds),
   wiring into `repo-validators:check`.
5. **Census registration sweeps** (record class): per-surface
   hand-authored grounds, contested rows surfaced as owner cards,
   cures routed to their owning lanes.
6. **Closing re-derivation** (record class): acceptance criteria
   re-proven against the live tree; plan archived with dispositions.
7. **Enforcement-completeness follow-ups** — SUPERSEDED 2026-08-11 by
   the Amendment's register triage ledger (every former row a–l
   dispositioned there: closed, in flight as S1, folded into todo 2,
   reclassified as a recorded condition, or sequenced into the
   successor node's H1–H4, whose slice definitions carry the
   surviving evidence). One row's substance stays here as a recorded
   condition rather than work: the phantom-deps rule enforces
   declaredness, and the `workspace:*` protocol cannot drift silently
   ONLY while `@oaknational/workspace-config` has no registry
   presence; if the package is ever published, a manifest-level
   protocol check lands with a red-proof (also recorded in the rule
   comment).

## Known issues at execution (recorded 2026-08-09; every row has a named immediate home)

- **Stryker silent fallback on a missing config file** — cured by
  todo 3 (reshaped above), executable the moment todo 1 merges.
- **Declaration-portability and loader-resolution classes in the new
  package** — CURED in PR #836 itself (exported `WorkspaceTsupConfig` +
  `Options` re-export for TS2883; `default` export condition for
  the vite `require` path); recorded here as evidence, no action.
- **Cold-install failure at the root postinstall** (found 2026-08-09
  by the PR's own CI, Actions run 31316920558, after the freeze-window
  push): the install-time bootstrap builds the agent-tools leaf
  closure with each package's own tsup, and the migrated leaf tsup
  configs import `@oaknational/workspace-config/tsup` from `dist` —
  absent on a cold checkout, so every cold `pnpm install` (CI, Vercel,
  fresh clones) died before any build could exist. CURED in PR #836
  (commit cd822f20f: workspace-config joins the bootstrap's
  install-time closure at position 0 — sound precisely because of the
  zero-internal-deps invariant — with per-dep staleness witness
  artifacts replacing the assumed `dist/index` barrel). Recorded as
  evidence with the general lesson: a dist-consumed config package has
  THREE consumer classes — turbo-ordered runs, direct tool invocation,
  and install-time hooks — and the third is structurally invisible to
  every warm-tree check, so cold-install verdicts come only from CI or
  a genuinely cleaned closure.
- **Install-time peer-range lag warnings** (`typescript` 6.0.3 vs
  third-party `^5` ranges: tsconfck, openapi-typescript, a
  typescript-eslint 8.56.1 resolution) — pre-existing estate-wide,
  surfaced on every install; home: Director-routed cure lane
  (`peerDependencyRules.allowedVersions` extension or dependency
  bumps), out of this plan's scope but named so it is not re-lost.
- **Pre-existing `no-throw-statement` warning surface** (15 in
  graph-core, 37 in oak-search-sdk, more in research-evidence and
  agent-tools — active WARNINGS, not disables, so outside the census'
  register) — home: Director-routed no-warning-toleration lane;
  broadcast 2026-08-09.
- **Commit-tooling defects observed during this plan's landing** —
  frictions register F-157 (the inner pathspec commit dropped four
  staged-new files from a 118-path intent; workflow exited 0) and
  F-158 (full `pnpm check` green minutes before the same tree's
  commit-hook turbo run found 24 real type-check reds); home:
  agent-tooling backlog via the register; interim disciplines
  recorded in the entries (verify commit content, hook is the verdict
  of record).
- **Copilot review request does not attach via the merge-bot token**
  (two attempts on #836, both silently dropped); home: retry at
  settle or owner-click; selective-not-ceremony applies.

## Acceptance criteria (each with a proof)

- Zero config files import by relative path across their workspace
  boundary — `repo-safe`: the boundary validator green at zero
  findings, with its committed fixture red-proof showing it fires.
- The shared bases live only in `@oaknational/workspace-config`; no
  root copies, no bridge; every `$TURBO_ROOT$` input in `turbo.json`
  resolves — `repo-safe`: all four moved files absent at root; the
  turbo-input validator leg green; full `pnpm check` green
  estate-wide.
- The Stryker canary runs against the real `vitest.config.ts` with
  `vitest.config.stryker.ts` deleted — `repo-safe`: the banked re-run
  log under `mutation-evidence/` showing config load and a completed
  pass. **PROVEN 2026-08-11** (#848 `bb40ecdf5`: 18/18 at 100% plus
  the config-load sentinel probe).
- Every check-disabling surface in the estate is enumerated in the
  register with grounds, every row classified scoping/suppression,
  every suppression row carrying exactly one disposition
  (`fix-routed` / `policy-ratified` / `pending` with its owner card),
  and an unregistered disable fails CI — `repo-safe` for the
  mechanism (validator + fixture); `owner-held` for `pending` rows,
  recorded in the register files themselves (each carries the comms
  event id of its owner card and the answer). (Rewritten 2026-08-11
  with the classification scheme.)
- Zero `'off'` entries for `import-x/no-relative-packages` and
  `import-x/no-relative-parent-imports` anywhere in the estate;
  config files lint under the shared preset; and no source-file class
  is ignored — `repo-safe`: the hatch grep returns zero, config files
  appear in the effective lint surface (`--print-config`), every
  surviving `ignores` entry has a registered generated/ephemeral
  disposition, and the de-hatch PR carries the committed firing
  fixture. Cross-workspace containment proof cites the depcruise
  check-fires suite, not lint. (Rewritten 2026-08-11 — the former
  "replaced with live bindings" wording prescribed the superseded
  lint-containment design.)
- `no-libs-to-sdks` carries zero `pathNot` entries AND `boundary.ts`
  carries no search-contracts sdk-exception machinery — `repo-safe`:
  greps + depcruise green + `validate-boundaries` green + the
  ADR-041/ADR-138 amendment diffs present in the S2 PR. (Added
  2026-08-11.)
- `search-contracts` resides under `packages/sdks/` and the
  field-integrity suite still executes twelve files — `repo-safe`:
  paths + the explicit file-count proof + full `pnpm check` green.
  (Added 2026-08-11.)
- Every positive `$TURBO_ROOT$` glob input matches ≥1 tracked file
  under the pinned matcher — `repo-safe`: the widened validator leg
  green + its committed red-proof. (Added 2026-08-11.)
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
- Root-anchored conventions that are their tools' own design (turbo
  pipeline config, commitlint/husky) — named here so their exclusion
  is deliberate. (Rewritten 2026-08-11: the `tsconfig.base.json`
  extends-chain was formerly excluded on the ground that "`extends`
  is not a module import and crosses no resolver boundary"; the owner
  ratified its entry into scope as the successor node's H3 — a copied
  workspace subtree DOES lose its relative extends target, the same
  portability class this plan cures for imports. The former ground is
  hereby re-trued rather than silently contradicted.)
- **Estate-wide mutation-testing roll-out** — owner-committed future
  work, not this plan's scope (owner word 2026-08-11: "We ARE going
  to roll out mutation testing everywhere, but later, and in
  stages"). Carrier: a staged roll-out delivery plan authored at
  owner scheduling, priced with the canary's real cost data.
- Considered-and-rejected alternatives, recorded at the decision:
  folding search-contracts into `sdk-codegen` (hand-authored
  contracts inside the generated-code package, against ADR-138's
  separation); a `safe-path`-style path helper for config files (adds
  a dependency to every config's install-time closure; the native
  `import.meta.dirname` property is zero-dep — successor H1).
- The Sonar disposition policy and `.sonarcloud.properties` doctrine —
  its own owner-ruled surface; the census REGISTERS its exclusions,
  never re-adjudicates them.
- Renaming or restructuring the ESLint standards package itself.

## Notes

- Stamp history: born sketch 2026-08-09, ratified the same day
  ("Owner ratification card at the implementer seat 2026-08-09
  ~11:1xZ, card answer 'Ratify as presented', on the plan at
  5698208fc"). Returned to sketch and RE-RATIFIED 2026-08-11 at the
  decision-complete completion-arc approval (current stamp in
  frontmatter) — the scope deltas ratified there are enumerated in
  the Amendment. Review trail, all 2026-08-09: the
  `assumptions-expert` pass before presentation (verdict: not-ready
  on measurement grounds; every flagged count re-measured first-hand
  and cured before the stamp), then the pre-execution `code-expert`
  design review (proceed-with-changes: the turbo cycle, the fourth
  root file, the depcruise orphan disposition, the glob-aware turbo
  predicate) with its two empirical claims independently CONFIRMED
  by `config-expert` (scratch-repo turbo dry-runs; the exact
  five-entry stale-input enumeration). All dispositions are folded
  into this body; the transcripts and this file's history carry the
  detail.
- The probe worktree carries only regenerable seed edits; losing it
  costs minutes. Its branch: `jimcresswell/vitest-config-workspace`.
- Linear ticket: mint when the standing ticket embargo lifts
  (2026-08-10) and backfill `tickets`.
