---
id: open-surface-zero
node_type: delivery
name: "Open-surface zero: every PR merged or closed, every branch carried by a PR"
overview: "Drive the whole open surface to zero unmanaged items — every open PR merged or closed with recorded grounds, every pushed branch either carried by a draft PR or dispositioned — oldest first, executing from the census ledger below, and graduate the pushed-implies-PR invariant so the state cannot recur."
status: ratified
ratified_by: "Jim Cresswell"
ratified_date: 2026-08-09
ratified_where: "Owner card at the Director seat 2026-08-09 ~10:1xZ (card answers: 'Ratify' + '#731 executor: Director executes it'; session Plover lifts Troposphere b10c37)"
serves: outcome-informed-practice-learning
impact_areas:
  - practice-and-estate
tickets: []
depends_on: []
owner_gates: []
last_updated: 2026-08-09
---

# Open-surface zero

## Goal

The open surface is fully managed: every open PR is merged or closed
with recorded grounds, every pushed branch is carried by a PR or
dispositioned (merged work preserved, else deleted with provenance
surfaced), and the standing invariant the owner named 2026-08-09 —
**"if it is worth pushing it is worth opening a draft PR"** — is
graduated into enforced practice so the unmanaged state cannot
silently recur.

Commissioning word (2026-08-09, owner): "I would like a plan to exist
to either merge or close all of them, including the ones we don't
have yet, and I would like that plan to start moving, oldest PR first
unless there is good reason to do it otherwise."

This node **supersedes `paused-pr-estate-disposition.plan.md`** for
the still-open remainder: that plan's recorded adjudications carry
forward by reference into the ledger below (its completed rows stay
its own record; it archives with `superseded_by: open-surface-zero`
at this node's ratification).

## Mechanism

A census-anchored disposition ledger plus oldest-first execution.
Thoroughness is every item carrying a recorded decision, not every
item spawning its own cycle: items whose adjudication already exists
execute directly; items without one get their first-hand adjudication
at their queue slot (merge / close / fold-into / supersede — grounds
recorded on the PR or branch at the decision). Execution slots split
by executor class: **Director-executable** (docs/plan PRs, merges at
recorded adjudications, branch dispositions) run from the Director
seat immediately; **seat-needing** (code reconciles) surface as ONE
dated owner ask each at their queue slot. The silent-waiting failure
this plan cures is recorded honestly: the #731 reconcile stood
"opener-ready awaiting a seat" for a day with no visible ask reaching
the owner; under this plan every waiting lane carries a dated
owner-visible ask or a Director execution slot — no third state.

Counts below are census-anchored (2026-08-09 ~09:5xZ) and re-derived
at execution time; substance preservation outranks stale arithmetic.

**Execution order re-based to impact (owner word 2026-08-09 ~14:5xZ:
"Agreed, impact order please" — the commissioning word's
good-reason clause exercised).** The standing order for the
remainder: finish the in-flight set (#766 cure round, WS7 group 1;
the PR #792 merged at the word) → #816 → #805 → #819 → #818 → the
PR #745 seat slice → orphan sweep → invariant graduation → closing
report. In parallel: #746 executes via the ratified corpus-amendment
plan (subagent, owner's un-draft word still gates its merge); the
pair #836 and #834 land at their own seats; #774 holds per its row.

## The census ledger (2026-08-09; oldest first)

### Open PRs — ours to disposition (jimbot/bot/owner-draft)

| PR | Opened | Item | Standing adjudication at census |
|----|--------|------|--------------------------------|
| #731 | 08-03 | Parallax family relocation (draft) | DETERMINATE (ratified skills structure, WS6): retire the superseded family-bundle walker shape, keep reusable machinery, land Parallax as `cognition/parallax-*`. Seat-needing — the ask fires first in the queue. **EXECUTED 2026-08-09: MERGED `1356579ca`** (grant `86E976CA`; owner card "dismiss via bot" on the stale Aug-3 review; Director-executed at the owner's naming). |
| #734 | 08-03 | typescript-estate measurement foundations | Carried ledger row: the typescript-estate lane owns it; adjudicate merge-vs-close at slot if that lane stays unstaffed. **EXECUTED 2026-08-09: MERGED `dab59963f`** (grant `440D4744`; owner card: four S6564 issues ACCEPTED with residual-risk authorisation, recorded server-side per-issue; own-review gate waived "merge on green"; Director-executed per the 10:16Z re-homing). |
| #745 | 08-03 | claim-freshness pilot (draft) | Carried ledger row: MCP-528's implementer consumes it; adjudicate at slot. **ADJUDICATED 2026-08-09 (Director, first-hand): KEEP-AND-LAND via a bounded seat reconcile** — the pilot (ADR-223 + validator + tests) stays current truth: MCP-528's own plan preserves claim-TTL liveness intact (its "Liveness stays exactly where it is" clause), so the two compose; reconcile measured at 2 config-file conflicts (knip.config.ts, package.json), 389 commits behind, 3 stale-head check failures, zero reviews yet. Seat-needing; queues behind WS7 (the owner's 2026-08-09 landing priority). |
| #746 | 08-03 | deploy-reliability plan node (draft) | No standing adjudication — first-hand at slot (Director-executable, docs). **ADJUDICATED 2026-08-09 (Director, first-hand): KEEP — route via the corpus-amendment plan already on main** (`deploy-reliability-corpus-amendment.plan.md`, authored 2026-08-05 expressly to make #746 mergeable; none of the four nodes is on main, so nothing is superseded). Blocked on that plan's ratification (`status: sketch`) — surfaced on the owner card 2026-08-09; amendment slice executes at the stamp, then merge at full condition. |
| #766 | 08-04 | MCP-501 research (owner draft) | ADJUDICATED: merges as research docs (plans-truing sweep). Director-executable. **2026-08-09: un-drafted; freshness holds; BLOCKED on three substantive Copilot threads on the owner-authored analysis (references requirement; compliance-invariant phrasing ×3 sites; §2.5 hard-budget contradiction) — authorial forks, carded to the owner.** |
| #769 | 08-05 | release-redeploy guard-truing plan (draft) | Plans-truing sweep set — adjudications recorded; Director-executable. **EXECUTED 2026-08-09: MERGED (grant `9790652E`; checks green, threads 0, clean vs main, born-sketch node class).** |
| #771 | 08-05 | observability-contract plan (draft) | Plans-truing sweep set; Director-executable. **2026-08-09: adjudicated MERGE; first attempt refused — required check Vercel absent at the draft-era head (checks-by-name lesson re-proven); branch updated to re-fire, settle-watch armed, merges at settled green.** |
| #774 | 08-05 | sdk-v2 spike plan (draft) | Plans-truing sweep set; Director-executable. **ADJUDICATED 2026-08-09: DATED HOLD** — explicit author-time DO-NOT-MERGE title marker; the node's guard-contract content is shaped by the open MCP-143 series (#761/#772). Re-adjudicate when that series settles; not a silent third state — this row is the dated record. |
| #788 | 08-06 | extraction-pilot opener refactor | ADJUDICATED to merge (plans-truing sweep). Director-executable. **EXECUTED 2026-08-09: MERGED `30eabd181`** (grant `80D0B33B`; reviews absorbed, threads 0, clean vs main, no file drift). |
| #792 | 08-06 | watch-commands node amendment | Plans-truing sweep set; Director-executable. **ADJUDICATED 2026-08-09: RECONCILE-THEN-MERGE** — the Aug-6 branch would cleanly revert main's later "DISCHARGED by PR #790" truing (the stale-capture-wins class, caught by diff-read before merge); keep the amendment + owner-gate block, preserve main's discharged record. Also surfaced: the node carries an owner gate (slice-2 bootstrap pair, expires 2026-08-20) never carded — carded 2026-08-09. |
| #805 | 08-06 | fleet-topology writeup (WIP preview) | First-hand at slot: complete-and-merge vs close-as-preserved. |
| #807 | 08-06 | mutation canary slice 1 | **EXECUTED 2026-08-09: MERGED `d502341e7`** (grant `4a1db233`; ratified canary plan complete, evidence on main). |
| #818 | 08-07 | statusline logging (draft) | Custodial pair — standing route; Director-executable adjudication at slot, seat ask if code work surfaces. |
| #819 | 08-07 | developer-experience home (draft) | Custodial pair, as #818. |

### Open PRs — tracked, not ours to execute

| PR | Opened | Whose | Posture |
|----|--------|-------|---------|
| #750 | 08-03 | mantagen (Matt's agents) | Tracked; nudge-free per colleagues-on-trust; surfaced to the owner in the plan's closing report if still open then. |
| #761 | 08-04 | emgeebot (MCP-143 PR-3) | Same series as #772/pr5; coordinate with that lane's owner at slot. |
| #768 | 08-05 | mantagen | As #750. |
| #772 | 08-05 | mantagen | As #750. |
| #816 | 08-07 | emgeebot (tenure record) | Docs record; adjudicate merge at slot with provenance check. |

(#833, the live coordination fold, is ceremony — not a disposition item.)

### Branches with no PR (draft-PR-or-disposition; oldest-first at slot)

Real orphans at census — 19 after excluding `gh-readonly-queue/*`
(GitHub merge-queue internals, platform-managed) and
`jimcresswell/mutation-testing-core-canary` (the prefixed twin of the
PR #807 head; deleted at that PR's merge as its recorded disposition):
`agent/n8n-practice-comparative-research`,
`agent/persistent-reflex-layer-report`,
`chore/aip-131-primary-estate-snapshot`,
`claude/mcp-143-clerk-guards-pr5` (emgeebot series — coordinate),
`docs/agent-operability-deferred-work-map`,
`docs/copilot-cli-practice-citizenship`,
`docs/first-class-copilot-agent-support`,
`feat/mcp-128-landing-public-beta`,
`fix/claude-hook-hardening`,
`fix/mcp-143-guard-cascade`,
`fix/mcp-507-oauth-facade`,
`jimcresswell/commit-queue-sameagent-id-routing`,
`jimcresswell/jim-next-2026-08-04`,
`jimcresswell/mcp-103-content-workspace`,
`jimcresswell/mcp-372-hub-demo-conformance-true-up…`,
`jimcresswell/mcp-475-preview-build-validation`,
`jimcresswell/mcp-487-sanitise-numeric-input`,
`test/emgeebot-ambient-verify`.
Per branch at slot: read content first-hand → already-merged/superseded
⇒ surface provenance and propose deletion (never unprompted removal);
live value ⇒ open the draft PR that should have existed; unclear ⇒
one-line owner ask. Owner-authored branches (`jimcresswell/jim-next…`)
get the ask, never a unilateral disposition.

## Acceptance criteria (each with a proof)

- Every census PR row carries an executed disposition (merged sha or
  closed-with-grounds link), re-derived against the live PR list at
  completion — `owner-held`: the closing report enumerates each row's
  outcome with links; the owner confirms nothing is silently dropped.
- Zero branches without PRs (excluding platform-managed refs), against
  a fresh `ls-remote` at completion — `repo-safe`: the census script's
  no-PR sweep returns empty at the closing run.
- The pushed-implies-PR invariant has a durable enforcement home
  (rule/sweep graduated through the estate's rules process), not just
  this plan's memory — `owner-held`: the landed rule or sweep named in
  the closing report.
- No disposition removed work without surfaced provenance and, for
  deletions, an owner word — `owner-held`: deletion asks visible in
  the record.

## Out of scope

- Executing Matt's (mantagen) lanes — tracked and reported, moved by
  their owner.
- Re-litigating adjudications already recorded in the superseded
  ledger — they carry forward; only genuinely new facts reopen one.
- The coordination-branch fold cycle (its own doctrine governs).
- Bulk branch deletion without per-branch first-hand reads — speed
  never licenses skipping the read.

## Todos (oldest-first; slices sized at pickup per PDR-132)

1. **#731 Parallax reconcile — the queue's head and the owner's named
   surprise**: fire the single dated seat ask (or Director-execution
   ruling if the owner prefers) immediately at ratification; the
   reconcile shape is determinate in the ratified skills plan (WS6).
2. **Director-executable backlog, oldest first**: #734/#745
   adjudications; #746; then the plans-truing set (#766, #769, #771,
   #774, #788, #792) at their recorded adjudications; #805; the
   custodial pair (#818/#819).
3. **Orphan-branch sweep, oldest first** per the ledger's per-branch
   procedure (draft PRs opened as found-live; deletion asks batched
   into ONE owner card per sweep round, never one-per-branch).
4. **Invariant graduation**: route "pushed ⇒ draft PR exists" through
   the rules process with the census sweep as its enforcement arm.
5. **Closing report**: re-derived census, every row's outcome, the
   superseded ledger archived with its pointer.
