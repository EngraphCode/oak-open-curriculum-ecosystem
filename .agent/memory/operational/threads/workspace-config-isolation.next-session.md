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

## Current Continuation (frozen 2026-08-10 ~21:0xZ, compaction freeze 3)

- **#836 is MERGED to main** (merge commit `d4e256294`, 2026-08-10
  20:08:40Z, merge-bot at SETTLE-READY under the Director's sha-pinned
  grant at `97febf893`). The whole swap arc is live: package, migration,
  four depcruise rules under the three owner rulings, resolver-invisible
  validator legs, cold-install bootstrap cure. Post-merge quiet-window
  harvest ran CLEAN.
- **Todo 3 is executed as PR #848** (branch
  `jimcresswell/stryker-real-config`, worktree
  `.claude/worktrees/stryker-real-config`, head `c38bd4e66`): Stryker
  points at the real `vitest.config.ts`, the duplicate is deleted, the
  re-run is banked (18/18, 100%, zero warnings) PLUS the reversible
  config-load sentinel probe (`mutation-evidence/config-load-probe.md`).
  #848 is the BOT-AUTHORED successor of #847 (closed at the owner's
  identity directive — `gh pr create` had run under the owner's gh
  login; the mint-token front door now covers PR creation too). Two
  review rounds fully dispositioned (cure shas `aa69109b8`,
  `c38bd4e66`); Copilot re-requested on #848; ticket MCP-540 links
  both. NEXT: tally #848's rounds at the standing rigour, settle,
  Director recount, merge-bot merge, Phase-8 harvest, worktree cleanup.
- **Owner directive (2026-08-10, standing)**: all fleet PRs are
  BOT-authored (mint-token for every write channel including
  `gh pr create`), and every PR from either identity carries the
  `jimbot` label (applied+verified on 12 PRs this window).
- **Claims**: `377c0b30` (this lane) and `04883b1e` (osz,
  owner-paused) retained at the freeze; heartbeats stopped with the
  freeze broadcast.
- **Plan state**: isolation plan todos 1 and 3 DONE (todo 3 completes
  at #848's merge); todo 2 (de-hatch, reshaped by the right-tool
  ruling) next; todos 4-5 (census) behind it; register rows 7a-7l
  carry every routed follow-up. The canary plan carries its dated
  retirement amendment.

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

## Next safe step — the depcruise swap cycle (this lane holds the design pen)

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
