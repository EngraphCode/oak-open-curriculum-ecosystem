---
id: workspace-config-isolation
node_type: delivery
name: "Workspace-config isolation: shared config bases become a declared dependency, enforced"
overview: "Move the root vitest/tsup/e2e config bases into a config workspace consumed via declared package dependencies, cure all 53 parent-relative config imports, and land enforcement that cannot silently vanish — a dedicated repo validator plus de-hatched lint coverage plus a standing disabled-checks census."
status: ratified
ratified_by: "Jim Cresswell"
ratified_date: 2026-08-09
ratified_where: "Owner ratification card at the implementer seat 2026-08-09 ~11:1xZ (card answer: 'Ratify as presented', on the plan at 5698208fc; session Wren calls Downdraft 6b29b5 — the seat the owner commissioned directly in-session, both commissioning words quoted in §Goal)"
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
  dead globs — no `reference/` directory exists, and the commitlint
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

## Todos (sliced per PDR-132 §5; classes named per todo)

1. **The isolation cure** (source/config sweep):
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
2. **Lint de-hatching (commissioned; config sweep)**: both tsup globs
   removed from the shared `ignores`, the full ignores-list audit
   dispositioned (each entry registered-with-grounds or
   un-ignored-and-cured, per the Mechanism's measured dispositions),
   the 20 hatches replaced with explicit `'error'` bindings (single
   rule, never the `boundaryRules` spread), the six absent
   config-file blocks added, the `files` glob widened to the
   `vitest*.config.ts` class, the committed firing fixture landed in
   the standards package's test suite. Lands after todo 1 — the
   migration is what lets the un-ignoring land green. The
   `research/` cure lands as its own PR inside this todo's arc.
3. **Stryker config cured — the silent fallback dies** (small source
   change): measured 2026-08-09, `stryker.config.mjs` on main names
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
7. **Enforcement-completeness follow-ups** (recorded per the #836
   review packet + Codex addendum, 2026-08-09/10 — each lands with a
   red-proof, never as a silent gap; sliced into single-story PRs at
   pickup):
   a. tsconfig-`extends` leg — package the base tsconfig as a
      `@oaknational/workspace-config` export (TypeScript resolves
      package-specifier `extends`); true the "crosses no resolver
      boundary" ground in this plan's Out of scope and in
      principles.md §Tooling.
   b. Path-arithmetic idiom coverage — the validator matches one
      spelling; `new URL(rel, import.meta.url)`,
      `fileURLToPath(new URL(...))`, the two-step `dirname` form,
      `join(...)`, and `import.meta.dirname` pass silently.
   c. Config-VALUE relative strings (`setupFiles:
      ['../../x.ts']` escapes with no import statement).
   d. Comment-stripping robustness (`/*` inside string globs; the
      quote-parity false-refusal).
   e. Config file-class widening — playwright/vite/next/postcss/
      esbuild configs are unscanned by rule and validator alike.
   f. Exit-2-on-unreadable — documented in the bin, unimplemented
      (`readRepoFile` throws → exit 1 + stack).
   g. Bootstrap-closure ordering check (the cold-install recurrence
      class): every config import in the install-time closure must be
      registered earlier in `WORKSPACE_DEPS`.
   h. Turbo-glob resolution (Codex): positive `$TURBO_ROOT$` globs are
      checked only to their leading literal directory — require ≥1
      tracked-file match with turbo-compatible semantics.
   i. Estate-wide syntactic bar for non-literal dynamic imports AND
      non-literal `require(expr)` calls — the depcruise rules see only
      resolvable (literal) sites for both forms (probe-verified for
      import; the require analog was Copilot-confirmed on the swap
      round, 2026-08-10); the live `@oaknational/no-dynamic-import`
      ESLint rule already bars every dynamic-import form in LINTED
      files, so the residue is config files until todo 2 lands plus a
      require-form rule; lands with todo 2's reshaped arc.
   j. Workspace-root drift in the depcruise rule regexes — the
      from.path alternation hand-encodes workspace root locations;
      evaluate deriving it from `pnpm-workspace.yaml` (or a validator
      leg asserting every expanded member dir is matched) so a new
      workspace root cannot silently sit outside the rule.

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

- Born sketch 2026-08-09, ratified the same day (stamp in
  frontmatter). Review trail, all 2026-08-09: the
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
