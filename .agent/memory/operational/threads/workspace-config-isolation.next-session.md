# Next-Session Record — `workspace-config-isolation`

Thread identity: **`workspace-config-isolation`** — the config-boundary cure
lane: shared vitest/tsup/e2e config bases as a declared-dependency package
(`@oaknational/workspace-config`), the enforcement instruments, and the
de-hatching arc. Born from the `mutation-testing-core-canary` lane (the
Stryker sandbox's duplicate-config workaround exposed the violation class).
Controlling plan:
[`workspace-config-isolation.plan.md`](../../../plans/delivery/workspace-config-isolation.plan.md)
(RATIFIED 2026-08-09, known-issues ledger inside). The canary plan is
archived (completed 2026-08-11) and todo 3 is complete — see the
Current Continuation below.

## Current Continuation (COLD PAUSE, owner-ordered 2026-08-11 ~09:1xZ — "Cold pause now, monitor later"; design fleet runs meanwhile)

- **RESUME ACT 1 — merge PR #850**: SETTLED (19/19 green on
  `c5403c8e1`, three Copilot rounds converged 2→1-suppressed→0, all
  dispositioned, Director grant `ED661CC7` sha-pinned). The merge did
  NOT execute before the pause: the merge-bot's quiet window anchors
  later and runs longer than assumed (still SETTLING-QUIET-WINDOW ~30
  min after the round-3 review; three poller runs were cut short —
  two early SIGTERMs of ~1–3 polls remain unexplained but moot). At
  resume: the head has MOVED since settlement (observed `367cd6f6e` at
  the 2026-08-11 fold vs settled `c5403c8e1`) — the settlement is void;
  run a FRESH full harvest first (head, reviews incl. suppressed blocks,
  threads, checks), re-settle, then
  `pnpm agent-tools merge-bot merge --pr 850 --expect
  copilot-pull-request-reviewer` (foreground), then Phase-8 harvest,
  MCP-542 → Done, prune worktree `.claude/worktrees/mcp-542-turbo-globs`,
  delete merged branches.
- **RESUME ACT 2 — Linear-ticket change monitors (owner-commissioned
  2026-08-11)**: Matt's bots comment on Linear tickets instead of
  PRs, so PR-round tallies are blind to ticket-borne findings. Arm
  monitors over the lane's live tickets (comments + status since a
  baseline) and fold ticket commentary into every settle tally.
  Explicitly sequenced AFTER the pause, never during.
- **THEN S2** (MCP-543) cuts its branch under the corrected contract.
  The plan Amendment's S2 section needs its dated correction commit
  BEFORE the branch cuts. The COMPLETE correction ledger (pre-execution
  review, opus, CHANGES-REQUESTED — all absorbed; durable here because
  session task state does not survive seat death):
  1. Baseline is ELEVEN field-integrity files, not twelve — the
     include list already carries a phantom (`task-0.0-gap-ledger`
     deleted in `fc02f28a2`); delete dead include line 30 in the same
     commit; proof = `vitest list -c vitest.field-integrity.config.ts
     --filesOnly` diffed before/after (recompute, never the array).
  2. The `'contracts'` role lands WITH an `assertNever` exhaustiveness
     backstop in `createSdkBoundaryRules` (the trailing implicit-
     runtime return silently absorbs unknown roles); the role fences
     the sdk consumers (`oak-search-sdk`, `curriculum-sdk`,
     `graph-corpus-sdk` + relative zones), NOT a copy of `'search'`;
     never reuse `searchSdkImportPatterns` (wrong message); carry
     `no-restricted-globals` (process/__dirname/__filename) into the
     role or record the drop in ADR-041.
  3. Five added surfaces: `pnpm-lock.yaml` importer key;
     `.cursor/rules/invoke-elasticsearch-expert.mdc` glob (silent
     agent-routing rot — portability validator checks existence only);
     ADR-138 lines 51–52 References; ADR-041 line 22 enumeration +
     line 78 BOTH cells + line 35; `output-schema-plan-audit.workflow.js:229`.
  4. `docs/architecture/README.md:64` is a policy sentence to REWRITE
     (exception clause deleted); root README row MOVES Libraries→SDKs
     table (different row convention).
  5. ADR-108 amendment reconciles the "why not five" rejected option
     honestly (it governs a workspace's OWN interfaces; this is the
     ADR-138 contract surface) + trues §Boundary Invariants' two-role
     drift + `createSdkBoundaryRules` TSDoc; flatten
     `LIB_SDK_BOUNDARY_MESSAGE`'s dead exception clause; drop the
     always-empty `paths:` key.
  6. Red-proof: pre-mv, delete ONLY the `pathNot` line, run depcruise,
     observe exactly one `no-libs-to-sdks` error on
     field-inventory.ts, put back — the real edge (a bare-specifier
     libs fixture FALSE-GREENS: unresolvable → npm-no-pkg, the rule
     matches `to.path`).
  7. RIDER CUT: canary path re-points are their own two-file PR after
     the archival reaches main (live surfaces only: stryker.config.mjs
     and survivor-dispositions.md; frozen snapshots stay).
  8. `lib-boundary.unit.test.ts`: also delete `getRestrictedImportPaths`
     and the `getMatchingPatternGroups` import; `sdk-boundary.unit.test.ts`
     gains the `'contracts'` describe block; line 284 re-points to a
     surviving lib.
  9. Keep `createLibConfig` tsup shape (name the deliberate exception
     in the PR body + widen its remarks); `oak-search-sdk` declares
     search-contracts under `dependencies` though only tests import it
     — name known-and-out-of-scope in the PR body.
  10. Fleet at implementation: architecture-expert + config-expert
      deep; docs-adr-expert + test-expert focused. One PR (~27 files);
      PDR-132 crossing recorded (indivisible under the
      validate-boundaries recompute + every-landed-state-correct).

## Prior continuation (superseded by the pause block above; kept for the arc record)

- **#848 MERGED** (`bb40ecdf5`, 2026-08-11, merge-bot under Director
  grant `113D7A7F`) — todo 3 complete; canary fully complete for
  type-helpers; MCP-540 Done; both lane worktrees pruned, branches
  swept. (#836 merged `d4e256294` 2026-08-10; both arcs live on main.)
- **Owner rulings 2026-08-11** (all in durable memory): error findings
  get fixed, never warranted; an exemption in an enforcement surface
  is an alarm bell — fix or change policy, with a clock; "residue"
  registers get critical assessment then sequencing or rejection;
  mutation roll-out is owner-committed — "everywhere, but later, and
  in stages" (carried at the isolation plan's Out of scope).
- **The decision-complete completion arc is RATIFIED** (owner
  approval in-session 2026-08-11; both review passes folded — 23
  findings): the isolation plan carries its 2026-08-11 Amendment
  (register triage ledger, todo-2 reshape, census enrichment, slices
  S1/S2, criteria rewrites, new stamp); the successor node
  `workspace-config-enforcement-hardening` (H1–H4) is born-ratified;
  the canary plan is ARCHIVED completed. Full sequence: S1 → S2 →
  todo 2 ∥ todo 4 → todo 5 → H1→H2→H3→H4 → todo 6.
- **In flight**: S1 = MCP-542 executed at `653d170ec` (worktree
  `.claude/worktrees/mcp-542-turbo-globs`, branch
  `jimcresswell/mcp-542-turbo-zero-match-globs`): derivation under
  the pinned matcher settled the yaml dispute (ALIVE — `**` matches
  zero segments per turbo's own dry run) and deleted exactly the
  three js/cjs/mjs entries; ≥1-tracked-match validator leg with
  red-proofs + hand-mutation check + live red-green landed; the
  root-tsconfig item was already discharged at todo 1; the
  canary-archival path re-points moved to S2 (live surfaces only:
  stryker.config.mjs + survivor-dispositions.md; frozen snapshots
  stay) because the archival sits coordination-side until the next
  fold. PR pending review/merge. Next: S2 =
  search-contracts whole-package move (Director PROCEED + owner
  ratification; full surface enumerated in the plan Amendment incl.
  boundary.ts machinery deletion, `'contracts'` role, ADR-041/138
  amendments same PR, eleven-live-file field-integrity proof — corrected
  2026-08-11 from the prior twelve-count, one dead include).
- **Standing**: all fleet PRs bot-authored (mint-token every write
  channel incl. `gh pr create`); every PR carries the `jimbot` label;
  Copilot review binds async ~5min, re-request per head move; my own
  REST replies mint empty jimbot COMMENTED reviews — exclude from any
  recount.

## Three owner rulings landed 2026-08-09 (all after ratification; all binding)

1. **Depcruise is the endpoint**: "I was hoping you would arrive at
   dependency cruiser for enforcing rules about dependencies."
2. **The swap happens inside #836**: "if we use regex it is because we are
   using the wrong tool… dep cruise is clearly the right tool for the job."
   The containment leg's regex scanner is REPLACED by dependency-cruiser
   rules before #836 lands (re-slice under PDR-132, no-stopgaps in view).
   Doctrine landed by the Director in validation-strategy.md §Gate integrity
   (dated "right tool" clause). The plan's todo 2 eslint framing reshapes the
   same way — the owner named that framing his own; no archaeology owed.
3. **ESM ruling**: "there should be ZERO require statements in this strictly
   ESM only repo. And dynamic imports are STRONGLY discouraged." →
   `require`/CJS dependency types forbidden estate-wide at error severity
   (presence IS the finding, no containment analysis); dynamic `import()`
   forbidden at error severity with a narrow, named, per-site recorded
   exemption set (warrant per site); no warn-tier rules. This retires packet
   blocker H1's analysis shape entirely.

## Depcruise capability facts (Director-pinned against the vendor rules reference, 2026-08-09 — conserved here because comms events are ephemeral)

- A `from.path` capture group is referenceable as `$1` in
  `to.path`/`to.pathNot` — workspace containment is ONE rule (from
  `^(packages/[^/]+/[^/]+)/…` config files, `to.pathNot ^$1/`), no
  per-workspace generation.
- `to.dependencyTypes ["unknown","undetermined","npm-no-pkg","npm-unknown"]`
  is built-in phantom-dependency detection — packet blocker H3's substance.
- `from.path` scopes rules to the config-file class directly.
- Dynamic `import()` and `require()` are first-class analyzed dependency
  types.

## The depcruise swap cycle — EXECUTED (steps below completed via #836/#848; conserved as the worked record; the live sequence is the plan Amendment's Execution order)

1. **Verify first-hand before designing**: (a) depcruise's cruise scope
   currently INCLUDES workspace-root config files (if not, extending the
   scan set is part of the swap); (b) the committed red-proof tests reshape
   cleanly to rule-config form.
2. Author the rule set per the three rulings: one $1-group containment rule
   for config files; one zero-tolerance `require`/CJS rule estate-wide; one
   dynamic-import error rule with the named exemption set; phantom-dep
   detection via dependencyTypes.
3. Delete the regex containment leg; **re-derive which packet cures
   survive** — B2's two Sonar issues sit in `containment.ts`/
   `text-position.ts`, code that may disappear with the swap.
4. What stays bespoke regardless (Director-adjudicated): the
   path-arithmetic refusal channel (no static analyzer sees runtime path
   building), config-VALUE relative strings (`setupFiles` — not imports),
   and the turbo-inputs JSONC leg. The turbo leg gains Codex's new
   follow-up: positive globs must match ≥1 tracked file with
   turbo-compatible semantics (today only the leading literal directory is
   checked).
5. Land the surviving record cures from the packet: ADR-168 bullet
   placement (move after line 501), the two false in-code statements
   (`workspace-config/eslint.config.ts:10` census claim → pending;
   `turbo.json:116` and `:397` stale inputs), the recommended same-landing
   set (stryker config stale comments, PR-body count re-true to 55/30,
   README portability claim, durable ADR citation targets).
6. The packet's seven named follow-ups land as recorded plan todos with
   red-proofs (tsconfig-extends leg, path-arithmetic idioms, config-value
   strings, comment-stripping robustness, file-class allowlist + honest
   success line, exit-2-on-unreadable, bootstrap-closure ordering check) —
   plus Codex's turbo-glob item. Never silent gaps.
7. Then: recount at settled green → Director merge grant → todo 3
   immediately (Stryker silent-fallback cure, plan has the shape) → todo 2
   (reshaped by ruling 2) → todos 4–5 (census).

## Landed and verified (2026-08-09, this seat, first-hand)

- Todo 1 substance on PR #836: package, 55-file/30-workspace migration,
  validator green at 103 files/34 workspaces on the merged head, doc
  truings; adversarially confirmed strong by an 18-agent round (packet
  §Verified strong).
- Cold-install cure `cd822f20f` (bootstrap closure position 0 + per-dep
  staleness witnesses) — red-proofed byte-identical, adopted by both opus
  legs, pushed. Plan ledger carries the three-consumer-classes lesson.
- Plan ledger + napkin freeze-harvest landed as `40cea91c2` on
  `coordination/2026-08-09-b5f347`.

## Flagged inferences and bounds (do not inherit as facts)

- "Jim pressed update-branch on #836" is an INFERENCE from the merge
  commit's author/shape (`c265c1253`, Jim Cresswell, 14:14Z); the mechanism
  (UI button vs local) was not observed.
- The primary repo was SHALLOW (3 boundary entries) until this seat ran
  `git fetch --unshallow` on 2026-08-09; the origin of the shallow state is
  UNKNOWN — do not assume it cannot recur.
- The `claude[bot]` entry on #836 is a spend-limit skip notice (org overage
  cap), not a review. Copilot review attach still silently drops; retry at
  settle, never a blocker.
- The Codex addendum was absorbed into this record (addendum 2); no further
  addendum was expected at freeze, but check the PR comments at pickup.

## Participating agent identities (PDR-027)

| platform | model | agent_name | role | last_session |
|---|---|---|---|---|
| claude-code | claude-fable-5 | Wren calls Downdraft | implementer | 2026-08-10 |
