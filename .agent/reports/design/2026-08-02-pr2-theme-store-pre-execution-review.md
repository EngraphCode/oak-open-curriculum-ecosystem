# PR-2 (shared theme-store extraction) — pre-execution review absorption

Design lane, movement 2. Reviewer: code-expert (opus), 2026-08-02, verdict
**PROCEED with three blocking revisions** against the Sycamore pause-record
§PR-2 inventory (`.agent/state/collaboration/handoffs/sycamore-herds-xylem-compaction-continuation-2026-07-30.md`),
each verified against main `58e5be461` (post-#710). This file is the durable
absorption record; it rides the PR-2 branch.

## Blocking revisions (inventory facts false against current main)

1. **"Divergence is comments-only" is false — merge the UNION.** The hub copy
   (`demos/oak-curriculum-hub/lib/oak-theme-store.ts:71-72`) carries a shared
   `prefers-contrast` media subscription (one listener, attached with the
   first subscriber, detached with the last) that the showcase copy lacks.
   The merged sibling store keeps it (additions never subtract standing
   capabilities).
2. **Keep factory param 2 as `resolveContrastQuery`.** The inventory's
   "second factory param DELETED" was written against the showcase copy; in
   the hub copy param 2 is the ADR-078 test seam
   (`ThemeSwitcher.test.tsx:53`). Delete `sessionChoice`,
   `createStoredChoiceResolver`, `resolveGlobalStoredChoice`,
   `RUNTIME_STORAGE_KEY`; keep `resolveContrastQuery` — every existing
   two-arg call site then compiles unchanged.
3. **The hub's theme select would render BLANK for first-time visitors.**
   Adopting the choice model moves the hub snapshot to `''` with no choice;
   the hub's `AxisSelect` has no `''` option (`ThemeSwitcher.tsx:57-61`) and
   no test asserts the select's rendered value. Port the showcase's
   placeholder option (`LabelledSelect.tsx:56` — `<option value="" disabled
   hidden>` + visible "Page default" text) to the hub in this PR.

**The guard test, written FIRST (red against today's hub):** render the hub
ThemeSwitcher over a fake runtime whose `choice()` returns `null`; assert
`themeSelect.value === ''` AND visible option text "Page default". Red today
(hub shows `light`); green only once both the store shrink and the
placeholder port land.

## Absorbed strengthenings

- **getTheme keeps the two-level result**: `undefined` = no runtime (the
  hydration gate at both demos, `ThemeSwitcher.tsx:75`), `''` = no choice.
  Explicit runtime guard, then `runtime.choice() ?? ''` (kit returns `null`,
  `oak-theme.ts:35`).
- **Merged suite composition** (the inventory's "hub superset" line is
  inverted — hub is superset in exactly two tests): showcase setter/snapshot
  tests + hub's two contrast-subscription-lifecycle tests
  (`oak-theme-store.test.ts:68,:81`); DROP the five choice-model tests the
  kit's own `oak-theme.integration.test.ts:126-151` already covers
  (re-asserting them through a fake runtime tests the fake) and the two
  `createStoredChoiceResolver` tests deleted with their function.
- **Boundary: inbound edits required, not just the new member's branch.**
  The `assertNever` backstop only forces the NEW member's outbound rules.
  Add the sibling to `DesignPackageImport`, edit ALL FOUR existing members'
  specifier branches + both path-zone blocks (the kit's enumeration at
  `boundary.ts:434-438` must gain the sibling or the kit could import the
  store against its own message).
- **`DESIGN_PACKAGE_IMPORTS as const` must be exported** (derive the type
  from it) — `validate-boundaries.ts` legs compare against runtime tuples,
  and the bare type union has no runtime value.
- **`oak-design-assets` blocks the validate-boundaries design leg**: it has
  a `package.json` but sits in neither union and has no `eslint.config.ts`.
  Decide explicitly (admit with branches, or exclude with recorded reason)
  before adding the leg.
- **Sibling tsconfig needs `"lib": ["ES2023", "DOM"]`** (base is
  ES2023-only; template design-tokens-core has no override; precedent
  `oak-design-system/tsconfig.json:4-5`).
- **Challenge happy-dom**: after the shrink every collaborator is injected
  and global reads are optional-guarded — run under `baseTestConfig` (node)
  first; add happy-dom only on an actual failure. Base include glob already
  matches `*.unit.test.ts` — no glob change for co-location.
- **ADR-041 design row is stale by three workspaces** ("design-tokens-core,
  oak-design-tokens" only, `041:28-29`) and has NO demos row — true the row
  in the same edit that adds the sibling.
- **ADR-213 §3 amendment must settle the sibling's identity**: state whether
  this package IS the future tier package (gaining React later, arming the
  ADR-147 gate on itself) or distinct; and that its edge to the kit is
  CONTRACT-ONLY (re-declared interface, not a dependency) so §4's promised
  `oak-design-system → <tier package>` edge doesn't contradict the boundary
  rules. Gate stays ARMED: §3's hard gate binds "the first component
  export"; a store is not a component export.
- **Kit `src/oak-theme.ts:27`** ("the Window augmentation below is the
  estate's canonical oakTheme typing") goes false when the demos'
  declare-global blocks delete in favour of the sibling's ambient declarer —
  docs-sweep item.
- **D1/D2/D3/D5 config deltas: the source temp file is unrecoverable**
  (encrypted transcript blobs in a dead session's task store). Their applied
  form survives in the pause record's own §PR-2 text (options fallbacks →
  undefined; exports single-entry verbatim; NO knip entry; NO react
  peerDep) plus the two re-derived config items above (DOM lib; vitest
  environment challenge). Re-derive at build; nothing else was load-bearing.
- **Sonar CPD verified safe**: `.sonarcloud.properties` cpd-excludes
  `**/*.config.*` and test files, so verbatim template configs + moved
  suites cannot re-trigger the duplication gate holding #644 open.

## Line drift (inventory → current main)

`ThemeSwitcher.tsx:23-24` → **14-15** (plus a stale prose reference at `:4`);
`ThemeSwitcher.test.tsx:22-23` → **15-16**. All four showcase pointers
correct. MISSING from the inventory: the factory CALL sites
(`Switchboard.unit.test.tsx:36-39,62-65,77-80`;
`ThemeSwitcher.test.tsx:55-58`) — under revision 2 they compile unchanged.
Both demos already depend on the kit (`workspace:*`); the sibling dep is a
plain package.json + lockfile addition; neither demo has design-boundary
ESLint rules to edit.

## Round-1 supersession addendum (2026-08-02, additive)

Blocking revisions 1 and 2 above record this PRE-EXECUTION review's verdict
as adjudicated before the build, and the build landed them. Review round 1
(opus gateway + Copilot, absorbed at `SHA:235f0211a`) then probe-proved the
contrast-media mirror INERT under the ratified choice model: the kit's
OS-contrast path writes only the applied attribute, never `choice()`, so no
exposed snapshot could change on that trigger and every mirror
re-notification bailed out of `useSyncExternalStore`. The capability those
items protected (a select tracking the applied theme) is the conflation the
choice model exists to cure, so round 1 deleted the mirror, the
`resolveContrastQuery` factory parameter, and both lifecycle tests together;
an applied-theme accessor (with a mirror that then has a consumer) lands at
first materialised need. The round-1 disposition comment on PR #715 carries
the adjudication. Items 1–2 are therefore historical (superseded by that
probe); item 3 (the placeholder port) stands as landed.
