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
the flag-engine rule is applied by name; no checksum misuse anywhere; no test reads
`.agent/**`; zero `as any` in test files estate-wide; the no-real-io lint fence works).
The frictions all sit at the **seams between instruments**, where doctrine assigns no
named home.

**Prevalence** (sweep): ~12 confirmed misfits estate-wide — bounded, not systemic —
concentrated in sdk-codegen config-mirror tests and three frozen-allowlist content-scan
tests. Plus ~10 correct-but-unnamed patterns that today survive on per-file
self-justification and reviewer judgment.

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
unnamed seams, and for four of the five the estate already contains a worked, clean
instrument that doctrine has not yet blessed:**

| Seam | Clean in-estate precedent | Current misfit shape |
| --- | --- | --- |
| Type anchors (bidirectional, negative, exhaustiveness) | `packages/libs/logger/tests/logger-contract.typecheck.ts` (`Assert`/`AssertFalse`, off-API, tsc-proven); module-scope `expectTypeOf` (plan-state) | Public-API export with zero consumers; dummy consuming `it()`; three type-only `it()` blocks (banned shape, live) |
| Defences against type-forbidden input | `unknown`-typed guards (strand-lookup); `parseContrastManifest` | `JSON.parse` typed alias; `Object.defineProperties` contortion (verify-clerk-token); walker hole-patch sequences |
| Cross-artefact consistency | `validate-patterns-index` (regeneration-comparison + `--fix`); `validate-boundaries` (workspace-owned, root-chained); the owner's 2026-07-07 ruling | Three frozen-allowlist content-scan tests; a tautological package-version test; "checksum" plan wording |
| Live-data quality gates | `oak-design-tokens/src/build.ts` contrast gate (engine unit-tested on fixtures; live data gated at build) | The same proof duplicated in `build-css.integration.test.ts` (proof-happens-once violation, unadjudicated) |
| Owned-message / vendor-conformance assertions | Module-TSDoc-declared owned messages; ADR-142 vendor drift tripwires | Exception exists in product TSDoc only; sibling-module and vendor message pinning unadjudicated |

Secondary findings the sweep surfaced (verified quotes in the workflow record):
mutation testing is scaffolding-only (zero `mutate` scripts — doctrine's "audits the test
surface" is presently aspirational); red-first leaves no post-hoc artefact by design
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
   package-version test; the `computedHash` recompute defect; a lint fence for `.test.ts`
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
- Whether the `build-css.integration.test.ts` duplicate carries chain-position value
  (proposal 5's falsifier) — resolvable when the four-theme gate work opens that file.
