# Worktree Residency

**Owner directive (2026-07-31, verbatim substance):** when an agent is
working on a worktree, they must change their cwd to that worktree, and
it must be stable until the agent changes it — never bouncing back to
the principal checkout at the harness's discretion.

An agent working a worktree lane RESIDES in that worktree: its working
directory, its doctrine load, and the arm-time context of everything it
starts all point at the worktree. Residency is established by a
session-level mechanism, never by shell `cd` — on this platform a bare
`cd` between checkouts is not residency and does not survive.

## Trigger

Taking up a worktree lane (at claim-open, before the first lane
action); any observed `Shell cwd was reset` line; launching or
re-arming background tasks from a lane session.

## Action

1. **Establish residency at launch.** The primary mechanism is starting
   the lane session IN the worktree (`cd <worktree> && claude`, or
   `claude --worktree <name>` for `.claude/worktrees/` lanes). The
   worktree then IS the session's project root: doctrine (CLAUDE.md,
   rules, settings) loads from the lane branch — so establish residency
   only on a branch freshly cut from `origin/main`, per the existing
   lane convention, or the resident agent reads stale doctrine.
2. **Mid-session residency uses the session-level switch**, never
   `cd`: the `EnterWorktree` tool (`path` form for existing worktrees).
   It moves the session's working directory and is approval-gated for
   paths outside `.claude/worktrees/`; switches after the first are
   restricted to `.claude/worktrees/` worktrees.
3. **`Shell cwd was reset` is a residency-violation signal, never
   noise.** Bash cwd persists only inside the project directory and
   additional working directories; a `cd` into a sibling-directory
   worktree is reset to the project directory by design (documented
   behaviour; reproduced first-hand 2026-07-31 on Claude Code 2.1.220).
   On seeing the line, stop and establish residency properly rather
   than routing around it with repeated `cd` or `-C` improvisation.
4. **Arm background tasks only after residency is established.**
   Background tasks and monitors capture their working directory at
   arm time and keep it for life (documented). Keep the explicit
   `cd <repo-root> || exit 1` first line on every arm as
   belt-and-braces (the watcher rule's existing discipline).
5. **Residency never re-homes coordination surfaces.** Comms, claims,
   and the commit queue stay resolved to the PRIMARY coordination home
   with explicit absolute paths, per `worktree-hygiene` clause 8 and
   ADR-197. A resident agent reads and writes the shared stream, not a
   worktree-local decoy.
6. **The Director/principal seat resides in the principal checkout.**
   Residency binds lane implementers (PDR-117): isolate the doing in
   worktrees, centralise the awareness in the principal. A principal
   seat reaching into a worktree for a read uses `git -C <worktree>`
   and absolute paths — reads may roam; residency is declared.
7. **Subagents of a resident session start at the worktree** (a
   subagent's Bash starts at the session's project directory, which
   for a resident session is the worktree). `isolation: worktree`
   pins a subagent to its OWN fresh worktree — a deliberate, different
   choice; verify a spawned worktree's HEAD before trusting it (the
   parallel-dispatch anti-pattern).

## Platform mechanics (version-pinned)

Verified against Claude Code 2.1.220 and its tools reference,
worktrees, and sub-agents documentation, 2026-07-31: cwd persistence
boundary and reset line; background-task arm-time capture; subagent
project-directory start; `EnterWorktree`/`ExitWorktree` session-level
switch semantics and the `.claude/worktrees/` restriction; the
`--worktree` launch flag; `worktree.baseRef` setting. Re-verify from
the platform's current documentation when the CLI major-versions or
this rule's mechanics disagree with observation
(`capability-questions-from-original-sources`).

Two considered-and-rejected mechanics, recorded so they are not
re-proposed: adding the sibling `-worktrees/` directory to
`additionalDirectories` (it would make a bare `cd` silently persist,
hiding exactly the residency violations this rule exists to surface);
and relocating the lane convention into `.claude/worktrees/` wholesale
(launch-in-worktree works identically from the sibling directory, which
stays the visible estate convention; `.claude/worktrees/` remains
available where `EnterWorktree`-heavy flows want unrestricted
switching).

## Why a rule, not a PDR clause

A discrete operational invariant with one trigger (taking up a lane)
and one action (establish and hold residency), platform mechanics
attached; `worktree-hygiene` owns the lane lifecycle and points here
from its operate-from-a-worktree clause.

## Related surfaces

- [`worktree-hygiene`](worktree-hygiene.md) — lane lifecycle; clause 8
  operating mechanics.
- [PDR-117](../practice-core/decision-records/PDR-117-director-and-implementer-roles.md)
  — the Director/Implementer split residency binds to.
- [ADR-197](../../docs/architecture/architectural-decisions/197-coordination-home-owns-registry-state.md)
  — the coordination home residency never re-homes.
- `.agent/memory/active/patterns/parallel-worktree-dispatch-unreliable.md`
  — the spawned-worktree HEAD verification discipline.

## Enforcement

Behavioural, with a mechanical tell: the harness's own
`Shell cwd was reset` line marks every violation of clause 3 at the
moment it happens. Lane team-start broadcasts name the residency
(worktree path) alongside the claim.
