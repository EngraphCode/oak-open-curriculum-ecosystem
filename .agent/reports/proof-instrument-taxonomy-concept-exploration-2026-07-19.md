# Concept exploration: the proof-instrument taxonomy

**Dispatch** (owner, 2026-07-19): "tests prove behaviour of product code, not
implementation, not configuration, and not behaviour of test code. Always use the correct
tool for each type of proof." Attached: `principles.md`, `testing-strategy.md`.

**Method**: the four-movement concept-exploration workflow; movements 1–3 from this
session's first-hand frictions, movement 4 grounded in a five-scanner estate sweep
(536k tokens, 194 tool calls, every instance quote-verified by the scanner that reported
it; load-bearing claims re-verified first-hand where noted).

## Movement 1 — raw observations

Five first-hand frictions in one working session, all at instrument seams:

1. **The drift anchor's three-collision journey.** A compile-time proof (zod schema ↔
   hand-authored interface, bidirectional) had no value-free home: module const →
   `no-unused-vars`; export → knip; final state: `SCHEMA_MATCHES_MANIFEST` barrel-exported
   onto a package's public API with zero consumers. A type proof living as runtime API
   because three machinery layers police value surfaces and none routes type proofs.
2. **The untypeable fixture.** A walker defence against arrays (inexpressible in
   `DtcgTokenTree`) needed its describing test to launder `any` through a typed
   `JSON.parse` alias — after `no-unsafe-assignment` correctly blocked the direct form.
3. **Walker hole-patching as a sequence.** Object-`$value`, hybrid node, array node —
   three successive defences added to one trusted-typed function in one day, each fixture
   harder to construct legally. The accumulation is the signal, not any single hole.
4. **Checksum wording vs semantic probe.** The plan's consistency-check todo said
   "checksum or regeneration comparison"; doctrine calls hashing-and-pinning "the
   antithesis". The verification actually performed (parse both sides, compare 537 token
   values) was the correct shape.
5. **Baselines vs fixtures.** 136 verified contrast rows tempt as test fixtures; pinning
   them would config-test values that must flex with design iteration.

Inherited assumptions exposed: *a test file is the default home for any proof* (the
misfit generator); *machinery resistance means find a workaround* (the unasked question
in friction 1 was whether a runtime value is the right vehicle at all);
*defence-in-depth is free* (each defence demands a proof; proofs of type-forbidden states
demand laundering); *verification data are test fixtures*.

## Movement 2 — the problem space

**Kind**: instrument-selection-and-placement over a mostly-closed set of proof kinds. Not
a test-quality gap — the sweep confirms the doctrine's centre holds well (clean signals:
the flag-engine rule is applied by name; no checksum misuse anywhere; no product-workspace
test reads `.agent/**` — though the sampled agent-tools corpus holds at least one live
violation, `agent-tools/tests/protocol-wire/wire.unit.test.ts` reading
`.agent/practice-core/protocol.json`, a cross-artefact conformance proof that belongs to
the seam-3 validator kind and joins the remediation list; zero `as any` in test files
estate-wide; the no-real-io lint fence works).
The frictions all sit at the **seams between instruments**, where doctrine assigns no
named home.

**Prevalence** (sweep): confirmed misfits are bounded, not systemic, and cluster in
named classes — sdk-codegen config-mirror tests, frozen-allowlist content-scan tests,
type-anchor shapes, a tautological version check, and one live-data duplicate. The
appendix enumerates verified exemplars of these classes as of the sweep's tree — an
open set, never a closed inventory; counts are non-load-bearing (an open corpus makes
any closure claim a moving target). A further set of correct-but-unnamed patterns today
survives on per-file self-justification and reviewer judgment.

**Mechanism**: proof-kind choice happens at authoring speed under gate pressure; the
fluent default is vitest; per-surface machinery (knip, `no-unused-vars`, `no-unsafe-*`)
polices its own patch but nothing routes the author to the correct instrument. The
owner's 2026-07-07 ruling that settles the largest seam (doc↔code sync = validator, not
test) is recorded only in `validate-ratified-lists.ts` TSDoc; `testing-strategy.md`
contains zero occurrences of "validator".

## Movement 3 — what changed in the solution space

- The cure is **consolidation and naming, not new machinery**: the estate already
  contains the clean solution to almost every seam — it just hasn't been named.
- For the untypeable-fixture seam, the solution class shifted from "house the awkward
  proof" to "dissolve the need": a parse boundary makes the internal defences
  unreachable-by-construction and relocates their proofs to where `unknown` fixtures are
  legitimate.
- Enforcement is proportionate only where mechanical and recurrent; the misfit count does
  not justify an enforcement programme.

## Movement 4 — synthesis

**The owner's four-clause statement is already the estate's live doctrine at the centre
of each class, enforced by lint fences and review. The misfits cluster exactly at five
unnamed seams, and for each of the five the estate already contains a worked, clean
instrument that doctrine has not yet blessed:**

| Seam | Clean in-estate precedent | Current misfit shape |
| --- | --- | --- |
| Type anchors (bidirectional, negative, exhaustiveness) | `packages/libs/logger/tests/logger-contract.typecheck.ts` (`Assert`/`AssertFalse`, off-API, tsc-proven); module-scope `expectTypeOf` (plan-state) | Public-API export with zero consumers; dummy consuming `it()`; three type-only `it()` blocks (banned shape, live) |
| Defences against type-forbidden input | `unknown`-typed guards (strand-lookup); `parseContrastManifest` | `JSON.parse` typed alias; `Object.defineProperties` contortion (verify-clerk-token); walker hole-patch sequences |
| Cross-artefact consistency | `validate-patterns-index` (regeneration-comparison + `--fix`); `validate-boundaries` (workspace-owned, root-chained); the owner's 2026-07-07 ruling | Three frozen-allowlist content-scan tests; a tautological package-version test; "checksum" plan wording |
| Live-data quality gates | `oak-design-tokens/src/build.ts` contrast gate (engine unit-tested on fixtures; live data gated at build) | The `build-css.integration.test.ts` duplicate — ADJUDICATED and cured on PR #423 (2026-07-20): the every-pairing re-proof removed, the two named checks retained as declared threshold exemplars |
| Owned-message / vendor-conformance assertions | Module-TSDoc-declared owned messages; ADR-142 vendor drift tripwires | Exception exists in product TSDoc only; sibling-module and vendor message pinning unadjudicated |

Secondary findings the sweep surfaced (file-level evidence in the appendix below):
mutation testing is scaffolding-only (a root `mutate` script delegates to Turbo but zero
workspaces define the task, so the run is a no-op — doctrine's "audits the test surface"
is presently aspirational); red-first leaves no post-hoc artefact by design
(review is its only enforcement locus); one literal test-of-a-test-helper exists; the
portability validator presence-checks `computedHash` without recomputing it — the worked
example of `validators-must-recompute`, live and unfixed; `expectTypeOf` is proven only
because tsconfigs include test files under `pnpm type-check` — an implicit dependency
recorded nowhere.

## Proposals (each with warrant and falsifier)

1. **Name the proof-instrument router in `testing-strategy.md`** — one compact table:
   proof kind → instrument → run point. Absorbs the 2026-07-07 validator ruling into
   doctrine; names the validator kind, the typecheck surface, the live-data gate kind,
   the probabilistic kind (already in validation-strategy), and the conformance tripwire.
   *Warrant*: three reviewers relitigated seams in one session; the ruling lives in a
   script comment. *Falsifier*: if review threads on instrument choice do not drop after
   adoption, the table is dead weight — measure by thread topics over the next weeks.
2. **Bless `tests/*.typecheck.ts` as THE home for module-scope type anchors** (logger
   precedent), migrate the four divergent surfaces onto it, and split
   `typescript-gotchas`' blanket "delete `expectTypeOf`" into declaration-mirror (delete)
   vs derivation-proof (keep: paired-with-runtime or typecheck-surface). Record the
   implicit tsconfig-inclusion dependency. Retrofit: `SCHEMA_MATCHES_MANIFEST` moves off
   the design-tokens-core public API. *Warrant*: four surfaces for one proof kind; the
   negative-assignability capability exists only in the blessed form. *Falsifier*: a
   workspace whose tsconfig excludes tests silently proves nothing — the adoption step
   verifies inclusion per workspace, and if that verification cannot be made mechanical
   the convention is unsafe as doctrine.
3. **Name parse-don't-validate and connect it to testing**: a runtime defence that needs
   an untypeable fixture is the signal of a missing `unknown`-typed parse boundary; the
   proof belongs to the boundary. Retrofit: `parseDtcgTokenTree(unknown)` in
   design-tokens-core (dissolves the `JSON.parse` alias and ends the hole-patch
   sequence). *Warrant*: two independent fixture contortions in one estate week; the
   hole-patch sequence. *Falsifier*: if a defence exists that the boundary cannot own
   (deep-position invariants), the walker proof stays and the typed-alias idiom gets
   named instead.
4. **Cross-artefact consistency is validator-kind, semantic recompute, never checksum**:
   fix the plan's "checksum" wording; build dtcg↔CSS as a workspace-owned validator
   chained into `repo-validators:check` (regeneration-comparison shape, `--fix` where
   generable); migrate the three frozen-allowlist content tests to their named
   instruments (depcruise edge; lint rule; validator). *Warrant*: owner ruling + two live
   validator precedents + the frozen allowlist's own closure-plan requirement.
   *Falsifier*: a validator too slow for pre-commit runs CI-only — still validator-kind;
   if even CI cost is prohibitive the shape question reopens.
5. **Generalise engine-not-config to live-data gates**: mechanism proofs on synthetic
   fixtures; live data through the build-time gate; expected-output baselines are
   acceptance references, never pinned fixtures; the gate owns the live-data proof
   (proof-happens-once). Adjudicates the existing build.ts/vitest duplication — fold into
   the four-theme gate work. *Warrant*: the gate already enacts the pattern; the
   duplication exists today. *Falsifier*: if removing the vitest duplicate loses a
   pre-commit signal the gate does not provide at the same chain position, the duplicate
   was load-bearing and the adjudication inverts.
6. **Bounded remediation list** (mechanical, low-priority lane): the seven config-mirror
   tests (most have adjacent behavioural twins — deletion-shaped); the tautological
   package-version test; the `computedHash` recompute defect; the protocol-wire test's
   `.agent/practice-core/protocol.json` read (migrate the conformance proof to a
   validator, per the absolute no-`.agent`-reads rule); a lint fence for `.test.ts`
   under `test-helpers/**`; correct `testing-strategy.md`'s present-tense mutation-testing
   wording (misleading-docs rule). *Warrant*: every instance verified with quotes.
   *Falsifier*: per-instance — a "mirror" that is actually the only wiring-completeness
   proof converts to behavioural shape rather than deletion.
7. **Name the small legitimate-pattern vocabulary** in `testing-patterns.md` (pointer
   entries, not essays): removal-condition canary; golden-vector stability contract;
   config-activation-via-effect; variant-selector fake; owned-error-message exception
   (with an ownership-scope line); vendor-conformance drift tripwire (reconciling
   ADR-142 with "never test external functionality"). *Warrant*: each has worked
   instances surviving on self-justification. *Falsifier*: any pattern without a second
   consumer in a reasonable window was premature naming.

## Unresolved evidence

- Per-workspace tsconfig inclusion of test files under `pnpm type-check` (the premise of
  proposal 2's safety) — asserted from sampled workspaces, not exhaustively verified.
- E2E/smoke tests with `readFileSync` were not tier-audited (may legitimately read built
  artefacts); the agent-tools test corpus was sampled, not enumerated.
- ~~Whether the `build-css.integration.test.ts` duplicate carries chain-position value
  (proposal 5's falsifier)~~ RESOLVED on PR #423 (2026-07-20): removed as a pure
  re-proof; the wiring smoke and the two declared threshold exemplars stay.

## Evidence appendix — verified exemplars (an open set)

Every exemplar below was quote-verified by the scanner that reported it and is
re-verifiable at the cited location. Paths are repo-relative; lines are as of the sweep's
tree (main at `13c5fbc63` plus the merged PR #412 branch). The estate moves: this
appendix cites verified members of each class at that tree, never a closed inventory of
the class.

**Config-mirror misfits (proposal 6's seven):**

1. `packages/sdks/oak-sdk-codegen/code-generation/typegen/search/completion-contexts.unit.test.ts:22`
2. `apps/oak-curriculum-mcp-streamable-http/src/test-error/test-error-route.integration.test.ts:281`
3. `apps/oak-curriculum-mcp-streamable-http/build-scripts/esbuild-config.unit.test.ts:78`
4. `apps/oak-search-cli/evaluation/validation/validate-ground-truth.unit.test.ts:32`
5. `packages/sdks/oak-sdk-codegen/code-generation/typegen/search/field-definitions.unit.test.ts:170`
6. `packages/core/oak-eslint/src/rules/lib-boundary.unit.test.ts:114`
7. `packages/core/env/tests/root-package-version.unit.test.ts:26` (also the tautological
   cross-artefact case — dual-listed below)

**Frozen-allowlist content-scan tests (seam 3 migrations):**
`packages/core/env/tests/root-package-version.unit.test.ts:26`;
`packages/core/observability/src/no-node-only-imports.unit.test.ts:41`;
`packages/core/build-metadata/tests/git-sha.unit.test.ts:54`.

**Type-only `it()` blocks (banned shape, proposal 2 migrations):**
`packages/sdks/oak-sdk-codegen/code-generation/typegen/search/generate-subject-hierarchy.unit.test.ts:198`;
`packages/sdks/oak-sdk-codegen/code-generation/typegen/search/completion-context-alignment.unit.test.ts:192`;
`agent-tools/tests/agent-identity/schema-registry.unit.test.ts:92`. Adjacent: the
dummy-consuming `it()` at
`packages/sdks/oak-sdk-codegen/code-generation/typegen/mcp-tools/parts/generate-types-file.unit.test.ts:36`;
the public-API drift anchor at
`packages/design/design-tokens-core/src/contrast-manifest-parse.ts:59`.

**Typed-`JSON.parse` alias exemplars (the synthesis's defences-seam misfit; current
tree of this PR):** three launder type-forbidden shapes past the compiler for negative
tests — `packages/design/design-tokens-core/src/colour-literals.unit.test.ts:68` (array
root) and `:150` (array node), and
`packages/design/design-tokens-core/src/contrast-resolve.unit.test.ts:195` (non-string
`$value` object); two construct VALID own-`__proto__` keys where plain object literals
cannot (JSON-fidelity necessity, not type-forbidden laundering — a distinct, legitimate
purpose proposal 2's scope must carve out) —
`packages/design/design-tokens-core/src/compose-theme-tree.unit.test.ts:163` and
`packages/design/design-tokens-core/src/overlay-coverage.unit.test.ts:133`.

**Other remediation-list instances:**
test-of-a-test-helper at
`packages/sdks/oak-curriculum-sdk/src/mcp/test-helpers/null-generated-tool-registry.unit.test.ts:14`;
the `computedHash` presence-only check at
`agent-tools/src/validators/portability/rules-index-checks.ts:185`;
the `.agent/practice-core/protocol.json` read at
`agent-tools/tests/protocol-wire/wire.unit.test.ts:487`.

**Anchors cited in the synthesis table (clean precedents and current misfits):**
`packages/libs/logger/tests/logger-contract.typecheck.ts:22`;
`agent-tools/src/plan-state/plan-state-engine.unit.test.ts:15`;
`agent-tools/src/validators/ratified-lists/validate-ratified-lists.ts:24` (the 2026-07-07
owner ruling verbatim); `agent-tools/src/validators/patterns-index/validate-patterns-index.ts:19`;
`packages/core/oak-eslint/scripts/validate-boundaries.ts:48`;
`packages/design/oak-design-tokens/src/build.ts:44` and its since-removed vitest
duplicate (formerly `build-css.integration.test.ts:106`; adjudicated on PR #423);
`apps/oak-curriculum-mcp-streamable-http/src/auth/mcp-auth/verify-clerk-token.unit.test.ts:85` (the `Object.defineProperties` misfit).
