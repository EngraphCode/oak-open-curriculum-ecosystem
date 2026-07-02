---
fitness_line_target: 200
fitness_line_limit: 320
fitness_char_limit: 20000
fitness_line_length: 100
fitness_content_role: reference
merge_class: index-narrative
---

# Director Handoff — Central Pick-Up Point

The single in-repo file an agent reads to **become the Director** of a
multi-session, multi-agent effort, and the one place the current Director
**hands off** from. It has two layers held apart by their change-rate:

- a durable **Director Brief** (sections below up to `CURRENT HANDOFF STATE`) —
  plan-agnostic, the operational instance of the role doctrine: how to take the
  seat, the readiness gate, the standing lessons, the routing contract. It does
  not change between handoffs.
- a volatile **`CURRENT HANDOFF STATE`** section that the sitting Director
  refreshes at every handoff — who is live, what is open, what is owner-gated.

The role doctrine itself is
[PDR-117](../../practice-core/decision-records/PDR-117-director-and-implementer-roles.md);
this file is its operational entry point — read PDR-117 alongside, do not
duplicate it here. The **work** the Director directs lives in a guiding plan
(see _The work you direct_ below); this file carries the role, never the
work-TODO.

This file exists because succession kept relying on a scattered, half-uncommitted
rehydration path (a thread-specific plan seed plus a per-user memory plus a comms
snapshot). On 2026-06-25 a successor broadcast a Moment-2 acknowledgement,
immediately retracted it as "premature/erroneous", and stood down — the takeover
had nothing solid to land on. This file is that solid thing: the brief is what a
successor lands on; the readiness gate is what the failed takeover lacked.

## The work you direct

The Director directs a **guiding plan**, not this file. The current effort's plan
is named in `CURRENT HANDOFF STATE`. The strategic root is the
worktree-per-agent transition (move from one-dev-many-agents on a single shared
checkout to many-checkouts / variable-agent-density with an author-agnostic
substrate); the operating model under trial is the Director + ephemeral-Implementer
contract itself. The current effort's **adjudication obligation, if any** — for
example whether this arc's acceptance must test the operating model rather than
merely whether the lanes shipped — is stated in the guiding plan named in
`CURRENT HANDOFF STATE`, not here; this brief stays plan-agnostic so it sticks to
the seat, not to any one pilot.

## How to take the Director seat

1. **Read this brief end to end**, then PDR-117 (minimum-action; route, do not
   execute; single owner-interface; the Implementer→Director→owner routing
   contract) and the Standing Lessons below.
2. **Rehydrate the live state** from the `CURRENT HANDOFF STATE` section and the
   surfaces it names — the guiding plan (work detail), the comms stream (recent
   events), `active-claims.json`, `repo-continuity.md`, and the napkin's recent
   entries.
3. **Readiness gate — BEFORE you claim authority** (the gate the failed takeover
   lacked). The five questions below are the context you must be able to answer
   from rehydration, not assumption — but **answering them in prose is not the
   gate; the mechanical liveness check is.** You may only broadcast a Moment-2
   acknowledgement after BOTH (a) you can answer all five and (b) you have run the
   mechanical liveness check and pasted its output.
   - Who are the live implementers, what lane is each on, and which claims do
     they hold? (If the team is dissolved, who — if anyone — is operating, and
     under what direction?)
   - What open verdicts do you own, and what is each one's pre-merge / acceptance
     condition?
   - What is owner-gated versus team-doable right now?
   - What is the single next safe step?
   - **Is the outgoing Director actually standing down** — heartbeat stopped, or
     it pre-positioned you?

   **Mechanical liveness check (MANDATORY — paste its output before Moment-2).**
   Do NOT compute the outgoing Director's last-event age by hand and do NOT read
   any local clock. Run the tool and let it compute the age in UTC against a UTC
   `--now`:

   ```bash
   # The tool parses claimed_at (bumped on every heartbeat) and --now as UTC
   # epoch-ms and emits age_seconds + freshness_status itself — no local clock,
   # no mental arithmetic. Source: claim-reports.ts age_seconds = nowMs −
   # Date.parse(claimed_at), both UTC.
   pnpm agent-tools:collaboration-state -- claims active-agents \
     --active .agent/state/collaboration/active-claims.json \
     --now "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
   ```

   Read the outgoing Director's `freshness_status` and `fresh_until` from the
   tool's output. A `stale` Director (or one whose heartbeat you have confirmed
   stopped) is genuinely standing down; a `fresh` one is still live — do not take
   the seat over it without a pre-position. If you ever need a single claim's age,
   `claims status --active <path> --now <utc-iso>` prints the same UTC-computed
   `age_seconds` / `fresh_until` per claim. **Never** compare a `…Z` timestamp
   against a local wall-clock: on 2026-06-25 a successor read a `07:52Z`
   pre-position against an `~08:50` local-BST clock, computed a false 58-minute
   coordinator-less gap, and broadcast a premature Moment-2 — yet `07:52Z` _is_
   `08:52` BST. The tool's UTC-to-UTC computation makes that error structurally
   impossible; mental arithmetic does not.

   If you cannot answer all five questions, or the check is not pasted, you are
   **not ready** — keep rehydrating; do not acknowledge. A premature
   acknowledgement is worse than a slow one, and an authority/coordination action
   gets the **highest** verification bar: ground the load-bearing fact first-hand
   before acting, most strictly when the premise conveniently licenses the action.
4. **Take authority (PDR-064 Moment 2).** Open your own Director claim (replacing
   the retained one named in `CURRENT HANDOFF STATE`), broadcast the
   active-acknowledgement, and re-arm awareness: the all-channels comms watcher
   as **move 1, before any coordination** (it is constitutive team-membership,
   not discretionary — it recurs on a drain-timeout, so keep a foreground-sweep
   fallback), a heartbeat loop **with an exit criterion**, and **stop the
   outgoing Director's heartbeat** if it is still emitting (false-liveness risk).
5. **Operate the seat.** Route durable **lanes**; do not choreograph individual
   pickups (implementers self-organise faster than fine-grained routing — and that
   routing races them). Before routing to a specific agent, **verify its current
   state right then** (its claim freshness via the same mechanical check above),
   not the state from minutes prior. Route **nothing** to an agent that has been
   told to close out or is high-context — route to its successor; check "has this
   agent been told to close out / is it high-context?" before routing anything to
   it. Own verdicts and verify them first-hand — including a PR's **inline review
   comments**, not just `gh pr checks`. Lens-resolve Implementer questions;
   escalate to the owner only when the lenses genuinely fail or the call is
   constitutively the owner's.
6. **Owner-away: keep going until ALL work is complete, then pause** — not a
   stand-down at the first stable point. "Complete" = every lane landed or cleanly
   parked with a durable handoff, every team-doable item done, only owner-gated
   items remaining. At completion, pause and **wind down your own heartbeat
   explicitly** — its exit is COMPLETION, not N-idle.
7. **Hand off when your context deepens.** Refresh `CURRENT HANDOFF STATE` below
   and **commit it** (do not leave the seed uncommitted); pre-position your
   successor; stop your own heartbeat first; and require the successor's
   readiness gate (step 3, including the pasted mechanical check) before its
   Moment-2. The continuity-commit may be blocked by pre-existing markdownlint
   debt in shared multi-agent buffers — the proper path is a dedicated
   consolidation pass (rotate + lint, then commit), never a destructive git
   workaround or a narrow-commit dodge.

## Standing lessons (this Director lineage)

Each lesson is the cure for a churn cause observed in the pilot.

- **Arm the comms watcher as move 1, before any coordination** — it is
  constitutive team-visibility, not discretionary infrastructure; an
  un-armed watcher went blind to a simultaneous identical-branch claim. n=2
  retains it; only the heartbeat is in the drop-set.
- **Verify a target agent's current state right before routing**, and route
  durable lanes rather than real-time pickups that race the implementers — a
  three-direction reversal in five minutes (and a finding routed to an agent that
  retired one second later) both came from routing on minutes-old state.
- **Route nothing to an agent told to close out / high-context** — route to its
  successor; that is what successors are for.
- **Authority/coordination actions get the highest verification bar** — confirm
  load-bearing facts first-hand and let the tool compute liveness age in UTC
  (never a local clock) before acting. Ground convenient premises hardest.
- **Stop your own heartbeat at stand-down** or it asserts false "active" liveness
  — a heartbeat loop with no exit ran ~8h of false liveness across an outage.
- **Verify a PR's inline review comments first-hand**, not just `gh pr checks` —
  inline bot findings are invisible to the check-status view (the PR #220 / #222
  Proto-finding blind spot).
- **Re-spinning a deep-context session does not reset its budget** — security- or
  quality-critical work wants a genuinely fresh seat, not a re-spin of a spent one.
- **For an artefact open weeks+, "what has been decided since this was written?"
  is the first-order question** before its internal merits — check the decision
  timeline for superseding decisions.
- **Curate, don't mechanically slice, prose-not-written-to-be-sliced**, and
  drift-guard the projection against source.
- **Director context-economy: stay silent on routine signals, act only on
  substance.** A long-lived Director should not reply to routine implementer
  heartbeats or narrate the monitors that carry them — act only on substantive
  events (questions, PR-opens, verdicts, blockers, genuine stalls). Over-narration
  spends the Director's scarcest resource (context) on signals that needed no
  action and shortens the very tenure the role exists to maximise. A concrete
  application of PDR-117 minimum-action (Firefly + Triton + Kraken all lived it).
- **Delegate Implementer-class work aggressively; pace context like the warm
  cache it is.** Sub-agent reviews, spec fetches, mechanical sweeps, and synthesis
  reconnaissance; do not self-author what a cheaper agent can. Measure your own
  context at the handoff gate — don't confabulate it (Kraken measured 52%, surfaced
  it, handed off clean). The spend-rate, not the calendar, is what ends a tenure.
- **At takeover, registry-freshness ≠ comms-liveness.** The claims registry can
  read every agent — including the outgoing Director — as `stale` (the 4h claim
  window) while the comms-heartbeat stream shows them LIVE; they measure different
  things. Cross-check both before a Moment-2; taking the seat over a live Director
  is the trap. This is the live **F-44** code defect (`active-agents.ts` reads claim
  freshness as liveness) — systemic, not incidental. (Falcon lived this at the
  Trawler handover: a 55-min heartbeat gap was the correct n=1 consumer-absent
  suspension, not retirement — the owner's correction prevented a false takeover.)
- **Cadence never goes dark at a handoff.** The PDR-078 §4 consumer-absent exemption
  ends the moment a successor is named — a named successor IS a consumer. Re-arm
  watcher + heartbeat when the handoff begins; do not read "n=1" while a successor
  is inbound.
- **Ground in the homed plan before designing — most "design" is crosswalk +
  activation, not greenfield.** Read the plan estate first; launching a design
  workflow over an already-homed plan risks forking an SSOT.
- **Director-run workflows (ultracode): flat output schemas** (a nested matrix
  schema hit the StructuredOutput retry-cap and failed silently), **never seed a
  contested call as "settled" in a brief** (the agents reflect it and the
  adversarial verifier cannot catch what you marked settled), and **critically
  assess every result AND its cited sources first-hand** (a cited SHA was not in
  main; an "unmeasured 10:1" was a measured 1.59:1).
- **Reject either/or — climb to the third option / the both.** A binary handed to
  the Director is the signal to climb (filter-vs-derive dissolved into one object
  that was both relief and structural cure). Run the five decision lenses before
  surfacing ANY question; surface only the constitutively-owner one.
- **Closeout is serial mutation, verified first-hand at the instant.** Re-verify a
  worktree clean immediately before `git worktree remove` (never `--force`);
  archive-not-delete (move, count-conserved); patch-id-verify a squash-merged branch
  before pruning (branch-existence is not preservation); never line-merge
  memory/state files.
- **A reserve/standby seat burns the very freshness it exists to preserve** if it
  cannot filter the heartbeat firehose — reserve-seat watcher filtering (the Lane-C
  `--exclude-tag heartbeat` work) is load-bearing economics, not a nicety; standby
  burn shortens the Director tenure the bench exists to extend.
- **The auto-update-branch babysitter** (reusable release-churn cure): a Monitor
  that `gh pr update-branch`es any OPEN+BEHIND auto-merge-enabled PR and emits only
  on a conflict. Safe because `--auto` enforces every merge gate server-side, so it
  only lets a genuinely-ready PR win the release-churn race — removing per-round
  babysitting from the Director's context.

The experiential source for the last several lessons is the Trawler-tenure how-to
brief ([`director-howto-and-pdr117-gaps-2026-06-29.md`](../../reports/agentic-engineering/director-howto-and-pdr117-gaps-2026-06-29.md)).
Its **Part B (PDR-117 missing axes)** is a queued doctrine-design task — context-budget
economy as a first-class axis, takeover-verification doctrine, owner-interaction modes,
Director-as-orchestrator, arc-closeout-as-responsibility, the loss-scan axis — to be
authored on fresh context (owner-directed), with PDR-117 as the surface to amend.

## Known friction (route to tooling, not to the brief or the plan)

These are tooling gaps, not doctrine gaps — they belong in the agent-tooling
backlog (`.agent/plans/agent-tooling/frictions-register.md`), named here only so a
successor recognises them rather than rediscovers them. Register state below is
first-hand as of 2026-06-25.

- **`claims` CLI has no adopt/transfer and cannot set `handoff_record_path`** —
  PDR-063 hand-off requires retaining a claim for the successor and the successor
  adopting it, but the CLI lacks `claims adopt --claim-id <id>` and
  `claims set-handoff --claim-id <id> --path <path>`. Hand-editing the registry is
  unsafe in a busy window, and reusing `--claim-id` created a duplicate row. Work
  around it out-of-band; do not treat the friction as a brief or plan defect.
  **F-94 in the register; FIXED in PR #225 (`e95fb9594`)** — `claims adopt` +
  `claims set-handoff` now exist.
- **No start-right watcher-presence fail-fast gate** — the "arm the watcher as
  move 1" rule is prose; it was skipped once under ceremony-aversion, going blind
  to a simultaneous identical-branch claim. The structural cure is a
  session-open / `start-right-team` check that fails fast when invoked without a
  live comms watcher, so the prose rule is backed by a mechanical gate rather than
  agent diligence. **F-95 in the register; FIXED in PR #225 (`e95fb9594`)** — the
  gate now exists (move-1 `comms assert-watcher-live` check + `claims open`
  blind-write backstop, solo-exempt), backing the prose rule mechanically.
- **Continuity-buffer handoff commit blocked by markdownlint** — a mid-arc handoff
  commit can hit a markdownlint wall on shared multi-agent buffers; the interim
  cure is the dedicated consolidation pass (rotate + lint, then commit), but a
  lint-incremental / per-committer scope would unblock the handoff commit without
  it. Partially captured: **F-83** (whole-tree pre-commit gate hostage on a shared
  checkout; structural cure = the worktree transition) and **F-39** (markdownlint
  MD004 wrap friction) are in the register; the specific continuity-buffer
  handoff-commit cure is not yet its own entry.
- **Comms watcher drain-step hits its 60s deadline** under high comms volume and
  needs manual re-arming across a long session — supervise or raise the deadline;
  fail-loud already works.
- **No PR monitor covers inline review comments + PR terminal state** — until one
  exists, poll `gh pr view N --json state,reviewDecision`,
  `gh api repos/.../pulls/N/comments`, and `gh pr view N --json comments` by hand.

## CURRENT HANDOFF STATE

> ### ▶ ACTIVE EFFORT: CURRICULUM HUB PROGRAM — Director: Comet hunts Lightyear (#8, RESUMED 2026-07-02 post-compaction; n=1 to MERGE by owner direction)
>
> **SESSION SHAPE (owner-set, 2026-07-02 ~afternoon — read this first):** the Director session
> was compacted and RESUMED with restored context (resume broadcast `284a65a5`); the owner ruled
> **n=1 — Director only — until `feat/curriculum-hub-demo` merges to main**. No successor agents
> launch before merge; the degenerate-team clause applies (the sole member executes directly).
> All three implementers CLOSED OUT 2026-07-02 ~14:55Z: Limpet (data) and Peregrine (styling)
> with full closeout broadcasts, `pnpm check` green, claims `fd0ee59e` / `cf62bda9` retained
> with pickup records REFRESHED (`handoffs/2026-07-02-curriculum-hub-limpet-data-plane.md` /
> `…-styling-peregrine-lifts-cirrus.md` — the stale Junk/Galago pointers are cured); Thyme
> (hygiene) ended WITHOUT a closeout broadcast on the stream (experience + register writes on
> disk; `16be897b` unchanged, pause-retained). Heartbeats stay down (PDR-078 §4 consumer-absent
> at n=1); the Director watcher is live. THE BUILD IS COMPLETE and pushed to origin `1461e5cb4`
> (every page, all 18 block components, both searches, six cards, E1–E3). Window #10 (this
> train) lands the frozen set — verified first-hand 272/272 / lint 0 / tsc 0 before staging:
> Peregrine's jest-axe §E backstop + the proven /course no-JS 320 cure; Thyme's jest-axe dep
> pair; Limpet's 14 evidence PNGs + the two-state measure-320 hardening (completion confirmed
> in their heartbeat-end `fb0f5610`); the owner's `.mcp.json.example` claude-design entry; the
> triple-closeout continuity writes. Then: final §D/§E passes, pre-push tidy (the
> `oak-design-system/` delete needs the owner's explicit authorisation AT that moment),
> milestone commit, PR, MERGE; §J = owner-hosted from main. Post-merge re-assessment (team
> shape, deep consolidation — napkin over threshold, the WS2 crosswalk) is owner-scheduled.
>
> **NEW CAPABILITY (owner, 2026-07-02 ~11:15Z): the claude-design MCP is NOW AVAILABLE**
> (project listing/reading/writing, file access, render-preview — see the `mcp__claude-design__*`
> tool set). The owner expects this to LIKELY CHANGE the approach for pulling down projects and
> project updates — i.e. the stream-2 ingestion pipeline (productionisation plan WS2) and the
> `future/demo-maintenance-and-structure.md` canonical-export-sync mechanism were designed
> around committed export zips; re-evaluate both against direct MCP pull BEFORE executing
> either as written. Owner-context decision, not unilateral: surface the crosswalk to the owner.
>
> The current Director-led multi-session effort is the **Curriculum Hub program**: reproduce the
> ENTIRE Oak Curriculum Hub from the Claude Design canonical export — ALL pages + ALL components,
> visual-matched — + two-search + 6 cards, to the guiding plan's **DoD §A–J**. Branch
> `feat/curriculum-hub-demo`, PUSHED. **Near-term bar (owner, 2026-07-01 late): §A–I + E1–E3 →
> milestone commit → push → PR → MERGE TO MAIN; §J = owner-hosted from main 2026-07-02.**
>
> **A successor rehydrates from** (detail lives there, not duplicated): the thread record
> `threads/curriculum-hub-demo.next-session.md` (identity table + lane state current), the
> Birch→Comet record `handoffs/2026-07-02-curriculum-hub-director-birch.md` (self-contained:
> completion bar, remaining pre-merge map, the proven operating protocol, tracked debts), the
> guiding plan `.agent/plans/curriculum-hub-demo/active/port-prototype-to-live-demo.md`
> (§Ratified decisions — the owner's four calls 2026-07-01 ~21:30Z + the paginated-player ruling
> #7), and the post-merge plan
> `.agent/plans/curriculum-hub-demo/current/productionisation-and-reuse.plan.md` (WS0–WS6 + the
> 2026-07-02 three-co-equal-value-streams mapping — uncommitted delta rides Thyme's config
> window).
>
> **Director:** Comet hunts Lightyear (`e7f728`, #8, claude / claude-fable-5; owner-named
> succession from Birch; Moment-2 `a43d3f2e` 2026-07-02T06:46:22Z with the pasted UTC liveness
> check + the F-44 comms-live cross-check; Birch stood down cleanly 06:49:25Z — heartbeat-end +
> closeout, nothing retained). Chain: Herring → Swordfish → Lantern → Hawthorn → Sycamore →
> Panther → Birch → Comet. Holds `35d9c8f2`; watcher + heartbeat live.
>
> **Cast state (2026-07-02 ~15:00Z, supersedes the ~09:50Z three-active-lanes snapshot):** all
> three implementer sessions are CLOSED — **Peregrine lifts Cirrus** (styling, full closeout,
> `cf62bda9` retained with the pickup record refreshed), **Limpet herds Marsh** (data, full
> closeout, `fd0ee59e` retained likewise), **Thyme guards Dewfall** (hygiene, session ended
> without a closeout broadcast; `16be897b` unchanged pause-retained). Their build work was
> complete at the pause; every lane deliverable is landed and pushed. Nine Director-run commit
> windows landed ~26 commits through the earlier seat (concept gate live on comms; Framework
> page DROPPED as superseded, Director-ruled with two-lane corroboration). The owner-ratified
> comms concept gate means hedging/deferral vocabulary is mechanically refused at the comms
> write path (capture-tagged events exempt).
>
> **Owner-gated (constitutive only):** §J hosting setup (owner, 2026-07-02) · final visual
> sign-off vs the canonical export · the `oak-design-system/` destructive-delete authorisation at
> pre-push-tidy time · the WS6 SSO decision set (named in the productionisation plan) · the
> fourth-stream strategy question (open decision row in `docs/strategy/README.md`).
>
> **Readiness gate before any Moment-2:** five questions + a pasted mechanical UTC liveness check
> (comms-live, not registry-stale — F-44); then adopt `35d9c8f2`, arm heartbeat, stop the outgoing
> heartbeat.
>
> ---
>
> ### ▶ TEAM-TOOLING ARC CLOSED (prior effort, conserved) — Director: Falcon wakes Stratus (2026-06-29)
>
> **Director: Falcon wakes Stratus** (`adb1f3`, 6th Director; clean PDR-064 from Trawler mends
> Buoy, Moment-2 `3078f8c6`). Chain: Firefly → Merlin → Triton → Kraken → Trawler → Falcon.
> Watcher + heartbeat live; single Director claim `4180e263`.
>
> **THE TEAM-TOOLING ARC IS CLOSED.** All PRs #269–#286 + #282 merged to main; the arc-end
> coordination PR **#268 MERGED** (`1b5ce326`, Falcon — 6 review threads resolved: 2 doc fixes,
> 4 not-defects). All worktrees removed; arc branches pruned; comms archived (count-conserved).
> Deep consolidation of the arc's captures is in progress on
> `consolidation/deep-closeout-2026-06-29`.
>
> **NEXT WORK — the SYNTHESIS PHASE (owner-directed, fresh-context; not yet started, inputs conserved):**
>
> 1. **Worktree-per-agent / PDR-117 MODEL VERDICT** — the comms/liveness substrate cure is homed
>    in `collaboration-substrate-coordination-rightsizing` (M1–M4) + `comms-watch-storage-redesign`
>    WS2 (mtime-watermark) + `comms-watch-liveness-floor`; the live **F-44 freshness≠liveness SAFETY
>    defect** (`active-agents.ts` reads claim freshness as liveness) is the do-first item.
> 2. **PDR-117 expansion** — the missing axes seeded in
>    [`director-howto-and-pdr117-gaps-2026-06-29.md`](../../reports/agentic-engineering/director-howto-and-pdr117-gaps-2026-06-29.md)
>    Part B (context-budget economy, takeover-verification, owner-interaction modes,
>    Director-as-orchestrator, arc-closeout responsibility, the loss-scan axis). PDR-117 is the
>    surface to amend.
> 3. **do-first efficiency matrix** (2/3 produced; workflow `w5xlcz6iu`) and **rightsizing-plan
>    M1→M2 activation** (owner decision; the 2026-05-25 archival hold is already lifted).
> 4. **NEXT TEAM (owner-set):** two co-equal lanes — architecture-efficiency (rightsizing) AND
>    intent-graph (opens with a broad shallow plan-estate scan); interim = owner deep-consolidation
>    sessions.
>
> **OWNER STANDING DIRECTIONS (apply going forward):** green + all-conversations-resolved ⇒ the
> Director merges directly, no `--admin`; reject every either/or ⇒ third-option / both; run the five
> decision lenses before surfacing any question (surface only the constitutively-owner one); UTC
> canonical for every internal timestamp (label zones, convert BST explicitly); archive-not-delete;
> critically assess ALL subagent results AND their sources.
>
> **OWNER-ACTION QUEUE (genuinely the owner's):** overage limit — the automated `claude` PR-reviewer
> is OFF org-wide (claude.ai/admin-settings); orientation-MCP lane provisioning
> (`mcp-tool-taxonomy-and-orientation.plan.md` — no lane owns it); O4/OQ5 composed-liveness decision;
> the rightsizing M1→M2 activation.
>
> **READINESS GATE for the next Director:** answer the five questions + paste the mechanical liveness
> check (UTC-to-UTC) before Moment-2; then open your Director claim and relinquish Falcon's
> `4180e263`. Prior-rotation detail (the Firefly→…→Trawler tenures, the 2026-06-25 worktree-pilot
> mandate, the worktree orphan map) is conserved in git history, the handoff records under
> `.agent/state/collaboration/handoffs/`, and `repo-continuity.md`.

## Key surfaces

- [PDR-117](../../practice-core/decision-records/PDR-117-director-and-implementer-roles.md)
  — the portable Director/Implementer role doctrine (now landed on `main`).
- [PDR-064](../../practice-core/decision-records/PDR-064-coordinator-handoff-two-moments.md)
  — coordinator handoff (two moments); this brief's readiness gate is the gate
  before its Moment 2.
- `.agent/plans/agentic-engineering-enhancements/future/worktree-per-agent-transition.plan.md`
  — the strategic root (the transition this work serves; promotion-evidence home).
- `.agent/plans/agentic-engineering-enhancements/current/worktree-pilot-consolidation-and-model-verdict.plan.md`
  — the forward guiding plan (the remaining arc + the model verdict).
- `.agent/plans/agentic-engineering-enhancements/active/worktree-pilot-coordination.plan.md`
  — the pilot's detail and Log; the evidence source the model verdict consumes.
- `.agent/state/collaboration/active-claims.json`, the comms stream, and
  `repo-continuity.md` — live coordination state (currently carrying stale
  dissolved-team claims pending a curator pass).
- `.agent/memory/active/napkin.md` (2026-06-25 entries) — the session's full
  lessons before they graduate.
