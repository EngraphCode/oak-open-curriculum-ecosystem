---
name: "Comms Corpus Full-Journey Knowledge Transfer — every event processed to merged"
status: sketch
impact_areas:
  - practice-and-estate
overview: >
  Owner-directed (2026-07-31, verbatim intent): primary development is moving to a
  successor on a DIFFERENT CHECKOUT, and "they need to know what we know" — so every
  live comms event, of every type, is processed through the entire knowledge journey
  (event → napkin → distilled/graduated → COMMITTED → MERGED TO MAIN), because the
  comms stream is machine-local by design (`.agent/state/` is untracked; a different
  checkout sees none of it). The 2026-07-30 dedicated pass verified event-level
  absorption for the knowledge-tagged channel only; the coordination/directed class
  (~2,230 events) is absorbed BY CONSTRUCTION (seats' closeout discipline), not
  verified per event — this plan converts that construction-claim into event-level
  verification and closes the journey onto main. Born sketch; the owner ratifies the
  shape and prices the P2 fleet spend before execution.
todos:
  - id: p0-make-current-pass-durable-on-main
    content: "Roll up coordination/estate-2026-07-30-c to main (cut branch from the tip, PR, truly-green merge per merge rulings — bot REST at settled; this seat executes if the Director is still paused). The 2026-07-30 pass's graduations (c89ce0fae + 5d31621aa) and Falcon's records currently exist ONLY on the coordination branch — invisible to a fresh checkout of main. Nothing else in this plan matters until this lands."
    status: pending
    depends_on: []
  - id: p1-census-and-heartbeat-aggregate
    content: "Mechanical census of the live corpus (by class/tag/author/day — jq, committed as a table in the discovery report). Then extract the heartbeat aggregate ONCE (~5,766 events → one committed section: cadence norms, seat roster over the window, label conventions, the by-intent stop/pause vocabulary in live use) following the 2026-07-23 precedent ('cadence aggregate extracted once, first'). After the aggregate, heartbeat bytes are spent."
    status: pending
    depends_on: [p0-make-current-pass-durable-on-main]
  - id: p2-coordination-class-sweep
    content: "The core: body-read-grade sweep of ~2,230 coordination/directed events + 515 pre-2026-07-23 residue + re-verification listing of the 195 knowledge-tagged (already absorbed 2026-07-30 — verify, don't re-extract). PROPOSED ENGINE (owner prices before execution): the estate's own corpus-analysis pipeline (PDR-122; corpus-mapper windows on an economical tier → corpus-reducer clustering → keep-set tier table with corroboratedBy home claims → corpus-meta home-verification), producing an immutable committed discovery report + keep-set — the sanctioned rescue-set shape (consolidate-docs §Discovery-Run Rescue Sets). FALLBACK if fleet spend is declined: inline windowed reads (~10-12 windows across sessions, durable per-window notes). Either way the CRITICAL-ASSESSMENT leg is non-negotiable: every keep and every corroborated-home claim verified first-hand (verify-dont-trust; subagent reports corroborate, never substitute). Known residual-risk classes to hunt: seats that died without closeout; directed routing decisions never mirrored durably; owner words relayed in events and nowhere else."
    status: pending
    depends_on: [p1-census-and-heartbeat-aggregate]
  - id: p3-journey-the-keeps
    content: "Process the keep-set as first-class consolidation intake, evidence-tiered: novel keeps → napkin capture → same-pass graduation to highest-impact homes (rules/PDRs/patterns/governance/tickets); corroborated re-finds → verify-and-enrich the named home (PDR-098 recurrence check before any duplicate-skip); rejected/noise → reason recorded in the discovery report only (permanent-doc-is-the-consolidation-record: no separate ledger). Commits on the coordination branch as batches land."
    status: pending
    depends_on: [p2-coordination-class-sweep]
  - id: p4-merge-to-main
    content: "Roll-up PR of all P1-P3 landings to main; truly-green merge. THIS is the ask's finish line: 'graduated and merged'. The successor's checkout of main then carries everything."
    status: pending
    depends_on: [p3-journey-the-keeps]
  - id: p5-spend-the-corpus
    content: "Disposition of the spent bytes per owner retention policy (knowledge retained = source spent): run the provenance check (0 violations required), write the pass-level watermark record ('swept through T'), then archive-move or delete. OWNER CARD embedded here: the 7-day coordination window exists to protect a LIVE working stream — with primary development moving off this checkout, does the owner rule move-all-after-absorption, or keep the windows for whatever fleet activity remains on this machine? Also card: archive vs delete for the heartbeat bytes."
    status: pending
    depends_on: [p4-merge-to-main]
  - id: p6-machine-local-residue-verification
    content: "The same successor-can't-see-it exposure covers more than comms: sample-verify the absorbed-by-construction claims for the ~140 machine-local handoff records (the 2026-07-30 pass risk-sampled the recent terminal ones; this leg samples the older strata), and confirm nothing load-bearing lives only in comms-seen/scratchpads/closed-claims. Verification leg, not a re-read — widen only if a sample fails."
    status: pending
    depends_on: [p4-merge-to-main]
  - id: p7-acceptance-probe
    content: "The cold-reader test, run AFTER P4/P5: stratified random sample of N=30 archived/spent events (10 heartbeat, 15 coordination/directed, 5 tagged); for each, either its substance is findable on a fresh checkout of MAIN (named home) or its noise-disposition is stated in the discovery report. Any miss reopens P3 for that class. This probe is the plan's falsifier: if a miss survives, the construction-claim was wrong and the sweep was insufficient."
    status: pending
    depends_on: [p5-spend-the-corpus, p6-machine-local-residue-verification]
isProject: false
---

# Comms Corpus Full-Journey Knowledge Transfer

## Why this exists (the impact, stated once)

A successor takes over primary development on a different checkout. Everything
under `.agent/state/` — 8,192 live comms events, comms-seen cursors, handoff
records — is machine-local and invisible to them. "What we know" must therefore
live on **main**. The 2026-07-30 dedicated consolidation proved the
knowledge-tagged channel absorbed and rotated the napkin, but its coverage claim
for the coordination/directed class rests on the fleet's closeout discipline
(absorption by construction), never on an event-level read. This plan converts
that claim into verified fact and lands the whole journey on main.

## Corpus at plan-author time (recompute at execution — it may have grown)

Census 2026-07-31 ~06:00Z, first-hand jq over `.agent/state/collaboration/comms/`:
8,192 events — ~5,766 heartbeat-tagged; ~2,230 coordination/directed/untagged;
195 knowledge-tagged (failure-mode/behaviour-note; event-level absorption
verified 2026-07-30); 515 pre-2026-07-23 (left in-window or quarantined by
prior passes). `comms-archive/` is empty on this machine.

## Warrants and falsifiers

- **Warrant for the class-tiered shape**: heartbeats carry aggregate-level
  knowledge only (2026-07-23 precedent); coordination events carry the residual
  risk; the tagged channel is already verified. Falsifier: if P7's probe finds a
  heartbeat event carrying unique un-homed substance, the aggregate tier was
  wrong and heartbeats need body-read sampling too.
- **Warrant for the pipeline engine**: PDR-122's corpus machinery exists for
  exactly this scale and produced the sanctioned discovery/keep-set shape
  before. Falsifier: a spot-check finding the mapper missed a load-bearing
  signal in its window → widen the fallback inline reads.
- **Warrant for P0/P4's primacy**: the ask's own words — "graduated and
  merged"; a graduation on an unmerged coordination branch is invisible to the
  successor exactly like a comms event.

## Owner decisions this plan carries (card at the named moments)

1. **P2 engine + spend**: pipeline fleet (tier-per-leg, mapper legs on an
   economical tier, Opus only where frame judgement is needed) vs inline
   windows. Estimate presented at P2 open.
2. **P5 window question**: move-all-after-absorption vs respect the 7-day
   coordination window for residual fleet activity on this machine.
3. **P5 byte disposition**: archive-move vs delete (owner retention policy
   allows either once knowledge is homed; archive ENABLES future mining,
   never hedges).

## Standing constraint (owner directive, 2026-07-31, verbatim substance)

"All long-term important information from both runs is recorded in the repo,
not just in tickets; the MCP Linear project should only contain information
relevant to the imminent submissions; general work and knowledge stays in the
repo." Binding on every phase: tickets are delivery pointers, never the sole
home of durable knowledge; nothing general joins the submission project
(enacted at capture: MCP-446/447 moved off it); every P3 graduation lands a
repo home first, with any ticket carrying only the pointer.

## Non-goals

- No successor-facing briefing document is authored here — the homes on main
  plus the under-the-hood orientation lens ARE the briefing surface.
- No comms tooling changes (the curator-disposition input channel stays with
  the storage-redesign lane).
- No re-processing of the 2026-07-30 pass's verified surfaces.

## Resume map (for the post-compaction session that executes this)

Ground via start-right-quick; re-derive branch state first (`git status -sb`;
the primary may have rotated). The 2026-07-30 pass's full working state is in
the session scratchpad `consolidation-state.md` (survives compaction, dies with
the session — the plan itself is the durable map). Claim to open: curator/
implementer on this plan's surfaces. The Director (Falcon hunts Flight, 52841f)
was cold-paused 2026-07-30 ~21:04Z, resume expected 2026-07-31 — coordinate P0
with them if seated; execute solo per merge rulings if not.
