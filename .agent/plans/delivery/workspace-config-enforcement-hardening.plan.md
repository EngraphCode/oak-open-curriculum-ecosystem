---
id: workspace-config-enforcement-hardening
node_type: delivery
name: "Workspace-config enforcement hardening: the four decided depth slices"
overview: "Harden the landed workspace-config boundary enforcement along four decided axes: one path idiom by construction, config file-class widening with coverage assertion, the tsconfig-extends package export, and bootstrap-closure ordering — every slice with a committed red-proof."
status: ratified
ratified_by: "Jim Cresswell"
ratified_date: 2026-08-11
ratified_where: "Owner approval of the decision-complete completion-arc plan, in-session at the implementer seat (Wren calls Downdraft 6b29b5), 2026-08-11 — the plan named this node's birth explicitly (successor carrying slices H1–H4, cut so the parent node stays one step of the lane)."
serves: outcome-informed-practice-learning
impact_areas:
  - practice-and-estate
tickets: []
depends_on:
  - plan: workspace-config-isolation
    kind: beneficial
owner_gates: []
last_updated: 2026-08-11
---

# Workspace-config enforcement hardening

## Goal

The boundary enforcement landed by the `workspace-config-isolation`
lane (depcruise rules at error severity plus the resolver-invisible
validator) holds against the drift classes the #836 review packet and
its stress-tests named: unrecognised path-arithmetic spellings, config
families outside the scanned class, workspace roots outside the rule
regex, relative tsconfig `extends` chains, and install-time build
ordering. Each slice closes one class structurally, with a committed
red-proof — never a silent gap.

The `depends_on` edge is `beneficial`: every slice is executable
against today's main. The minimum shippable shape without the parent's
remaining todos is exactly the four slices as specified — none reads
the census register or the de-hatched lint surface; H-slices and the
parent's census sweeps are cross-seat parallelisable because the
census register is partitioned per-surface.

## Mechanism — decisions, made (2026-08-11, all measured)

- **H1 — one path idiom, by construction.** Config-file path
  derivation standardises on native `import.meta.dirname` (~40
  mechanical one-line rewrites across four current spellings —
  measured; already live at two sites in `oak-eslint`'s own config,
  so runtime support is proven in-estate; the 53-site migration of
  the parent's todo 1 is the sweep precedent). The validator then
  recognises path arithmetic rooted at `import.meta.dirname` with
  literal segments (containment-checked) and REFUSES every other
  spelling (`import.meta.url` arithmetic, `__dirname`) and every
  non-literal — an unrecognised spelling can never silently pass
  again. The quote-parity false-refusal heuristic in the
  comment-stripping module is rewritten in the same slice, and the
  bin-level fs-unreadable exit-2 test lands here (the one refusal
  path that was implementation-verified-only). The config-VALUE leg
  (closed key list: `setupFiles`, `globalSetup`; literal strings
  containment-checked, non-literals refused) lands fixture-proven
  with expected zero live findings — the two live config-VALUE
  relative strings estate-wide both target lint-ignored
  `.agent/reference/**`. The sanctioned idiom is itself registered in
  the disabled-checks census with this plan as its policy pointer (an
  allowance in an enforcement surface carries its warrant).
- **H2 — config file-class widening + depth + coverage assert.**
  The scanned config class widens to the families measured present (9
  tracked files: 3 playwright, 1 vite, 2 next, 1 postcss, 2 esbuild)
  in BOTH the depcruise `from.path` classes and the validator's
  file-class predicate, under H1's final refusal semantics (H1 lands
  first so every per-family red-proof is written once). Two of the
  nine sit BELOW their workspace root — the depth the current
  one-segment anchor misses — so depth handling is part of this
  slice, not a separate row. A new validator leg asserts every
  expanded `pnpm-workspace.yaml` member directory is matched by the
  depcruise `from.path` alternation (assert-not-derive: recomputes
  coverage instead of generating config; a synthetic unmatched member
  is the red-proof), so a new workspace root can never silently sit
  outside the rule.
- **H3 — tsconfig-extends via the package.** `tsconfig.base.json`
  MOVES into `@oaknational/workspace-config` (move, never bridge) as
  a package-root JSON listed in `files` — never a `dist/`-mapped
  export, which would break every tsconfig in the estate before the
  first build (the #836 cold-install class). The 35 relative
  `extends` sites migrate to the package specifier; root
  `tsconfig.json` and `tsconfig.depcruise.json` extend the package
  specifier too (the root manifest carries the devDependency); the
  22 `$TURBO_ROOT$/tsconfig.base.json` turbo inputs are DELETED under
  the `^build`-edge argument (the parent plan's identical
  turbo-input cure); the package's own tsconfig extends by relative
  path (the self-reference precedent). The slice OPENS with the
  decisive probe — `tsc --showConfig` on a scratch config extending
  the package specifier, on the pinned TypeScript — and its execution
  gate is a cold install (`rm -rf node_modules && pnpm install &&
  pnpm type-check`): warm-tree green is recorded non-evidence for
  this class. This slice deliberately crosses the PDR-132 §2 size
  warnings as one mechanical story (re-examined at authoring: the
  same one-token swap N times plus one small export; fragmenting
  moves cost into integration).
- **H4 — bootstrap closure hardening.** Two cures in one slice, both
  extending `agent-tools/src/bootstrap/bootstrap-helpers.ts` with
  red-proof unit tests: an install-time-closure ordering check (every
  config import in the install-time closure must be registered
  earlier in `WORKSPACE_DEPS` — the cold-install recurrence class),
  and the shared config package's dist artifacts counted as leaf
  staleness inputs (transitive staleness: today a workspace-config
  rebuild does not invalidate the leaf deps' staleness skip; bounded
  exposure meanwhile — cold installs unaffected, turbo's `^build`
  edge rebuilds leaves on the next orchestrated build).

## Todos (each a single-story PR; ticket minted at pickup)

1. H1 — idiom standardisation + validator refusal rewrite +
   config-VALUE leg + comment-stripping rewrite + fs-unreadable bin
   test.
2. H2 — family widening + depth handling + workspace-root coverage
   assert (after H1).
3. H3 — tsconfig-extends package export + migration sweep + turbo
   input deletions (opens with the probe; gated by the cold install).
4. H4 — bootstrap ordering check + transitive staleness inputs.

## Acceptance criteria (each with a proof)

- Config-file path derivation uses `import.meta.dirname` exclusively;
  the validator refuses every other spelling and every non-literal —
  `repo-safe`: validator green estate-wide + committed red-proofs for
  the refused spellings; the sanctioned idiom's census row carries
  this plan as its policy pointer.
- Every config family present in the estate is inside the scanned
  class at any depth, and every pnpm-workspace member is matched by
  the depcruise rule — `repo-safe`: per-family red-proofs + the
  synthetic-unmatched-member red-proof + depcruise green.
- No tsconfig extends by relative path across a workspace boundary;
  a cold install type-checks green — `repo-safe`: grep zero relative
  base-extends + the recorded cold-install gate run.
- The install-time bootstrap refuses an unregistered config import in
  its closure, and a workspace-config rebuild invalidates dependent
  leaf staleness — `repo-safe`: red-proof unit tests on
  `bootstrap-helpers.ts`.

## Out of scope

- Everything the parent plan owns: the census mechanism and sweeps,
  the lint de-hatch arc, S1/S2. This node hardens instruments; it
  does not adjudicate register rows.
- Estate-wide mutation-testing roll-out (owner-committed, later,
  staged — carried at the parent plan's Out of scope).
- Deriving the depcruise config from `pnpm-workspace.yaml`
  (generation) — rejected for the assert-leg shape in H2:
  recompute-and-assert gets the same drift protection without config
  codegen machinery.
