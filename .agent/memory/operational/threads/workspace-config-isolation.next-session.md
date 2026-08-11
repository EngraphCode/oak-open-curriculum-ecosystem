# Next-Session Record — `workspace-config-isolation`

Thread identity: **`workspace-config-isolation`** — the config-boundary cure
lane: shared vitest/tsup/e2e config bases as a declared-dependency package
(`@oaknational/workspace-config`), the enforcement instruments, and the
de-hatching arc. Born from the `mutation-testing-core-canary` lane (the
Stryker sandbox's duplicate-config workaround exposed the violation class).
Controlling plan:
[`workspace-config-isolation.plan.md`](../../../plans/delivery/workspace-config-isolation.plan.md)
(RATIFIED 2026-08-09, known-issues ledger inside). The canary plan remains
ratified-live; its restore step is superseded by this plan's todo 3.

## Current Continuation (COLD PAUSE, owner-ordered 2026-08-11 ~09:1xZ — "Cold pause now, monitor later"; design fleet runs meanwhile)

- **RESUME ACT 1 — merge PR #850**: SETTLED (19/19 green on
  `c5403c8e1`, three Copilot rounds converged 2→1-suppressed→0, all
  dispositioned, Director grant `ED661CC7` sha-pinned). The merge did
  NOT execute before the pause: the merge-bot's quiet window anchors
  later and runs longer than assumed (still SETTLING-QUIET-WINDOW ~30
  min after the round-3 review; three poller runs were cut short —
  two early SIGTERMs of ~1–3 polls remain unexplained but moot). At
  resume the window will have elapsed: verify head unmoved, run
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
- **THEN S2** (MCP-543) cuts its branch under the corrected contract
  (pre-execution review absorbed; the eleven-files field-integrity
  truth; assertNever backstop; five added surfaces; red-proof =
  pathNot-line reversible probe; rider cut). The plan Amendment's S2
  section still needs its dated correction commit BEFORE the branch
  cuts — the full delta list lives in the session task record and the
  review transcript; primary carriers: eleven-not-twelve baseline +
  dead include line 30, boundary.ts assertNever + 'contracts' role
  fencing sdk consumers, pnpm-lock importer key, the elasticsearch
  .mdc glob, ADR-041/108/138 exact-line corrections, README policy
  rewrite + table move, LIB_SDK_BOUNDARY_MESSAGE flatten.

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
  amendments same PR, twelve-file field-integrity proof).
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
