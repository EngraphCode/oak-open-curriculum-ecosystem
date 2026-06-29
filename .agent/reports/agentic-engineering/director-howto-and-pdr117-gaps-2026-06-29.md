# Director: how-to brief + PDR-117 role-definition gaps (Trawler tenure, 2026-06-29)

Authored at the Trawler mends Buoy → Falcon wakes Stratus handover, owner-requested:
(1) a brief to the incoming Director on **how** to hold the seat, drawn from the lived
tenure (the part that dies with the outgoing context); (2) the **missing dimensions and
axes** in [PDR-117](../../practice-core/decision-records/PDR-117-director-and-implementer-roles.md)
that this tenure exposed, as a seed for the review/expansion the owner called for. The
operational pickup is `director-handoff.md` §CURRENT HANDOFF STATE; this is the *role
craft*, not the work-state.

## Part A — How to be a Director (experiential, this tenure)

Sharpenings beyond `director-handoff.md` §Standing lessons (which already holds
minimum-action, verify-first-hand, route-don't-execute, stop-heartbeat-at-standdown,
inline-comment-verify):

1. **Taking the seat is the highest-stakes act, and the freshness≠liveness trap lives
   right there.** At takeover the claims-registry read every agent — including the
   outgoing Director — as `stale`; the *comms-heartbeat stream* showed them LIVE. Trusting
   the registry alone would have been a Moment-2 over a live Director. Always cross-check
   the mechanical claim-age (tool, UTC-to-UTC) AGAINST the comms heartbeat stream; they
   measure different things. This same conflation is the live F-44 code defect — it is
   systemic, not incidental.
2. **Context is the Director's scarcest resource — pace it like the warm cache it is.**
   I spent context on deep synthesis and several workflows and reached ~74%, which is *why*
   the owner triggered this handoff. Delegate Implementer-class work aggressively (the #282
   fix and the register reconciliation went to sub-agents cleanly); do NOT self-author what
   a cheaper agent can; do not run a heavy workflow or long prose for every turn. A Director
   that burns context on delegable synthesis shortens the tenure the role exists to maximise.
3. **Ground in the homed plan before designing.** I launched a design workflow before
   grounding in `collaboration-substrate-coordination-rightsizing.plan.md` — the design was
   already homed there; I risked forking an SSOT. Read the plan estate FIRST; most "design"
   is crosswalk + activation, not greenfield.
4. **Workflows (ultracode) are powerful but have failure modes you own:** keep
   `agent()` output schemas FLAT (a complex nested matrix schema hit the StructuredOutput
   retry-cap and failed with no output); never seed a *contested* call as "settled" in a
   brief (I seeded "the exclude-filter is a cowpath" → the agents reflected it and the
   adversarial verifier could not catch it, because I had marked it settled — it was wrong);
   critically assess EVERY result and its SOURCES first-hand (the register lagged; an
   "unmeasured 10:1" was really a measured 1.59:1; a cited SHA was not in main).
5. **Owner direction is a stream; corrections are verdicts.** This tenure was corrected
   repeatedly (overnight-pause confound, merge-no-admin, reject-either-or,
   matrix-before-surfacing, restart-heartbeat-at-handoff). Absorb each as a reflex update,
   do not defend the prior framing, and re-derive.
6. **Run the five decision lenses before surfacing ANY question; surface only the
   constitutively-owner.** I surfaced a lens-resolvable filter-vs-register choice as an
   owner question — that was offloading synthesis. The matrix usually resolves it.
7. **Reject either/or — find the third option / the both.** The filter-vs-derive
   "choice" dissolved into one object (the register *is* both immediate relief and the
   structural cure). When handed a binary, that is the signal to climb.
8. **At a handoff, cadence never goes dark.** I dropped my heartbeat + watcher on an
   "n=1 consumer-absent" read — but a *named successor* is a consumer; the owner corrected
   it. The consumer-absent exemption ends the moment a successor is named or a handoff
   begins (PDR-064 never-dark-between-moments).
9. **Closeout is serial mutation, verified first-hand at the instant.** Re-verify a
   worktree clean immediately before `git worktree remove` (never `--force`); archive-not-
   delete (move, count-conserved); branch-existence-is-not-preservation (patch-id-verify a
   squash-merged branch before pruning); never line-merge memory/state files.
10. **Only you can scan your own context for losses.** The handover loss/metaloss scan is
    first-hand — a sub-agent verifies artefacts, never detects what the context-holder
    uniquely carries. Run it recursively before standing down.

## Part B — PDR-117 missing dimensions / axes (seed for the review)

PDR-117 defines Director (minimum-action, route-don't-execute, single-owner-interface,
two-moment handoff, dissolve-when-clear) + Implementer. The tenure exposed axes it does
not yet carry — candidates to expand (the review should design these from first principles,
not bolt them on):

1. **Context-budget economy as a first-class Director axis.** PDR-117 asserts
   minimum-action→longevity but gives no *discipline*: delegation heuristics (when to
   route vs do), the cost of self-synthesis, a pacing model, and the Director's OWN
   handoff-trigger calibration (PDR-063's ~50%/80% are about Implementers/cycles, not the
   Director's warm-cache spend-rate). This is the axis whose absence ended this tenure.
2. **Takeover verification under freshness≠liveness.** The two-moment handoff (PDR-064)
   is referenced but the *takeover hazard* — registry-freshness ≠ comms-liveness — is not
   baked in as first-class takeover doctrine.
3. **Owner-interaction MODES, beyond "escalate when lenses fail."** The lived interface
   had at least three modes PDR-117 does not name: GENERATIVE co-design (the owner
   reasoning with the Director on impact/design), CORRECTION-stream absorption, and the
   matrix-before-surfacing / verdicts-not-menus / reject-either-or disciplines. The
   owner-interface is richer than escalation.
4. **Director-as-orchestrator (workflow authoring).** PDR-117 says route-don't-execute
   (no self-dispatched reviewers) — yet a Director authoring + running ultracode workflows
   is a distinct, legitimate mode this tenure used heavily. When is a Director-run workflow
   right vs routing to an Implementer? The schema/seed-bias/critically-assess disciplines
   for Director-run workflows belong here.
5. **Closeout / arc-end as a named Director responsibility.** PDR-117 is steady-state;
   the arc closeout (merge-drive, comms archival, worktree/branch hygiene, register/
   continuity reconciliation, serial-mutation discipline) is real Director work that is
   currently undefined.
6. **The loss/metaloss conservation axis at handoff.** "Continuous externalisation" is
   named, but the recursive first-hand loss-scan discipline (and *what* counts as a
   metaloss — stale memory, lost meta-pattern, lost loss-detection capability) is not.

A seventh, cross-cutting: PDR-117 is **first-instance** (one pilot). This arc is a further
instance (a 5th Director tenure, taken over a live Director, full closeout under one seat) —
fold it as second-/third-instance evidence, and let the AC6 metric (owner-visible
coordination prompts per landed cycle) be recomputed against this session honestly (it had
many *generative* owner turns, which are NOT coordination escalations — the metric needs that
distinction, itself a missing axis).

**Routing:** the review/expansion is a doctrine-design task for Falcon or a dedicated
session (not the outgoing Director at spent context). This report is its input; PDR-117 is
the surface to amend.
