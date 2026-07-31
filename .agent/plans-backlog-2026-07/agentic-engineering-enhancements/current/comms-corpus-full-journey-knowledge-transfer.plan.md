---
name: "Comms Corpus Full-Journey Knowledge Transfer — every event processed to merged"
status: current
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
  verification and closes the journey onto main. Shape RATIFIED by the owner
  2026-07-31 ("this is the comms event run, as planned"); the P2 engine/spend
  decision still cards to the owner at P2 open. Executor: Ingot tracks Slag
  (be4ac9), claim d0ba8352, n=2 with Director Falcon hunts Flight (52841f).
todos:
  - id: p0-make-current-pass-durable-on-main
    content: "Roll up coordination/estate-2026-07-30-c to main (cut branch from the tip, PR, truly-green merge per merge rulings — bot REST at settled; this seat executes if the Director is still paused). The 2026-07-30 pass's graduations (c89ce0fae + 5d31621aa) and Falcon's records currently exist ONLY on the coordination branch — invisible to a fresh checkout of main. Nothing else in this plan matters until this lands. DONE 2026-07-31: PR 662 merged (529711891), 17/17 checks green, zero threads; snapshot branch deleted; c89ce0fae/5d31621aa/25fdb487e verified in main ancestry. (PR 661 was closed: opened under the wrong credential; recreated as 662 under the bot.)"
    status: completed
    depends_on: []
  - id: p1-census-and-heartbeat-aggregate
    content: "Mechanical census of the live corpus (by class/tag/author/day — jq, committed as a table in the discovery report). Then extract the heartbeat aggregate ONCE (~5,766 events → one committed section: cadence norms, seat roster over the window, label conventions, the by-intent stop/pause vocabulary in live use) following the 2026-07-23 precedent ('cadence aggregate extracted once, first'). After the aggregate, heartbeat bytes are spent. DONE 2026-07-31: reports/agentic-engineering/comms-corpus-knowledge-transfer/discovery-report-2026-07-31.md — census conservation-checked (8,196 events; P2 read surface derived at 2,251 body-read + 177 re-verify; the 17 pre-07-23 tagged events reassigned to the body-read sweep), heartbeat aggregate extracted once (5,769 events, 46 seats)."
    status: completed
    depends_on: [p0-make-current-pass-durable-on-main]
  - id: p2-coordination-class-sweep
    content: "The core: body-read-grade sweep of ~2,230 coordination/directed events + 515 pre-2026-07-23 residue + re-verification listing of the 195 knowledge-tagged (already absorbed 2026-07-30 — verify, don't re-extract). PROPOSED ENGINE (owner prices before execution): the estate's own corpus-analysis pipeline (PDR-122; corpus-mapper windows on an economical tier → corpus-reducer clustering → keep-set tier table with corroboratedBy home claims → corpus-meta home-verification), producing an immutable committed discovery report + keep-set — the sanctioned rescue-set shape (consolidate-docs §Discovery-Run Rescue Sets). FALLBACK if fleet spend is declined: inline windowed reads (~10-12 windows across sessions, durable per-window notes). Either way the CRITICAL-ASSESSMENT leg is non-negotiable: every keep and every corroborated-home claim verified first-hand (verify-dont-trust; subagent reports corroborate, never substitute). Known residual-risk classes to hunt: seats that died without closeout; directed routing decisions never mirrored durably; owner words relayed in events and nowhere else. IN PROGRESS 2026-07-31: MAP COMPLETE (981 leaves, 23/23 windows, checkpoint committed ff57f16d1; w08/w15/w19 inline-read per owner card after classifier blocks). REDUCE running as two shards (537+444 leaves, opus/medium) after a 981-leaf single-agent think-loop was stopped (~170k tokens sunk; calibration lesson in the napkin, graduation home PDR-122 §6). Remaining: cross-shard merge → META home-verification fleet (corpus-meta batches) → first-hand adjudication. OWNER ULTRACODE GRANT (2026-07-31, verbatim substance: 'if also deploying a multi-agent, multi-function fleet would help, that is absolutely fine, I condone it') supersedes the earlier 2.4-2.6M envelope; fleet legs: meta-verification, P6 full-coverage sweep (upgraded from sampling, running), P7 probe fleet."
    status: in_progress
    depends_on: [p1-census-and-heartbeat-aggregate]
  - id: p3-journey-the-keeps
    content: "Process the keep-set as first-class consolidation intake, evidence-tiered: novel keeps → napkin capture → same-pass graduation to highest-impact homes (rules/PDRs/patterns/governance/tickets); corroborated re-finds → verify-and-enrich the named home (PDR-098 recurrence check before any duplicate-skip); rejected/noise → reason recorded in the discovery report only (permanent-doc-is-the-consolidation-record: no separate ledger). Commits on the coordination branch as batches land. OWNER RESHAPE (2026-07-31, binding): P3 OPENS with the ontological step-back — 'no home found means a deep analysis of what the missing homes might be, and how they relate to the existing estate, what seams we have, what seams we should have... consider ontologies and epistemics before we take any action.' The discovery report's §The homeless set carries the first cut (five failure-mode classes: graduation-latency, stale-home, wrong-tier, shattered-compound, orphaned-obligation); the adjudication classifies every homeless item under it, the seam proposals route through the ratified knowledge-estate trio (PDR-134/ADR-221) and TO THE OWNER before any new surface is created, and only then do graduations execute per class."
    status: pending
    depends_on: [p2-coordination-class-sweep]
  - id: p3b-synthetic-contamination-scan
    content: "Owner-directed post-processing scan (2026-07-31 ruling on the pilot-canary incident): deterministic grep for the six synthetic fingerprints — the reserved canary UUID prefix 00000000-c0c0-4000, the fictitious surface term quill-sync, the invented seats Quillon guards Ledger / Fathom binds Sounding and their session prefixes aa00c1 / bb00d2 — over (a) every run checkpoint before it commits, (b) the discovery report + keep-set, and (c) the full git diff origin/main...HEAD at the P4 gate. PASS = zero hits outside the three incident-record surfaces that legitimately describe the incident (this plan, the napkin entry, the discovery report's incident section). Any other hit is contamination: quarantine the artefact and re-derive it from clean sources. Context: four synthetic calibration events were injected into two pilot bundles, safety-flagged, and cured by full bundle rebuild (zero fingerprints on rebuild, verified); the platform classifier block is confirmed as a working protection layer for this class."
    status: pending
    depends_on: [p3-journey-the-keeps]
  - id: p4-merge-to-main
    content: "Roll-up PR of all P1-P3 landings to main; truly-green merge. THIS is the ask's finish line: 'graduated and merged'. The successor's checkout of main then carries everything."
    status: pending
    depends_on: [p3-journey-the-keeps, p3b-synthetic-contamination-scan]
  - id: p5-spend-the-corpus
    content: "Disposition of the spent bytes per owner retention policy (knowledge retained = source spent): run the provenance check (0 violations required), write the pass-level watermark record ('swept through T'), then archive-move or delete. OWNER CARD embedded here: the 7-day coordination window exists to protect a LIVE working stream — with primary development moving off this checkout, does the owner rule move-all-after-absorption, or keep the windows for whatever fleet activity remains on this machine? Also card: archive vs delete for the heartbeat bytes."
    status: pending
    depends_on: [p4-merge-to-main]
  - id: p6-machine-local-residue-verification
    content: "The same successor-can't-see-it exposure covers more than comms: sample-verify the absorbed-by-construction claims for the ~140 machine-local handoff records (the 2026-07-30 pass risk-sampled the recent terminal ones; this leg samples the older strata), and confirm nothing load-bearing lives only in comms-seen/scratchpads/closed-claims. Verification leg, not a re-read — widen only if a sample fails. UPGRADED to FULL COVERAGE under the owner's 2026-07-31 ultracode grant: 159 records (handoffs + conversations/sidebars/escalations) swept by an 11-batch corpus-meta fleet (launched 2026-07-31, run wf_9ae882c3-ac2); unhomed finds fold into the P3 keep-set; dependency on P4 relaxed to co-run since the doctrine roll-ups (#662/#663) already put the home universe on main. SWEEP COMPLETE 2026-07-31 (checkpoint p6-machine-local-sweep-2026-07-31.json: 138 absorbed / 21 records carrying 36 unhomed items); the adjudication-fold of the 36 items is P3 work under the ontological frame."
    status: completed
    depends_on: [p1-census-and-heartbeat-aggregate]
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

## Future doctrine seed (owner intent, 2026-07-31)

This plan "will form the basis of a future policy, doctrine, skill" — as the
work spreads to more machines, the estate "will need to pay much more
attention to keeping that shared state knowledge current across those
machines." The execution is therefore ALSO a doctrine-harvest: the executor
records, as they run it, the generalisable shape — which state classes are
legitimately machine-local (ephemeral coordination) versus knowledge that
must flow to the repo; what the currency invariant is (nothing load-bearing
exists only on one machine); and what standing cadence/mechanism replaces
this one-off rescue (the "journey to merged" as a continuous pipeline, not a
salvage). At completion, that harvest surfaces as a **PDR candidate**
(Practice-governance, multi-machine — the adopter-scope test says PDR, not
ADR), with a skill-shaped operational companion if the cadence needs a
runnable workflow. Adjacent doctrine it must reconcile with, not duplicate:
PDR-094 (comms substrate + retention), ADR-199 (untracked-by-design state —
a decision made when one machine WAS the estate; this circumstance exposes
its boundary), works-for-any-user-any-machine, and the durability hierarchy
(only permanent docs are durable).

## Non-goals

- No successor-facing briefing document is authored here — the homes on main
  plus the under-the-hood orientation lens ARE the briefing surface.
- No comms tooling changes (the curator-disposition input channel stays with
  the storage-redesign lane).
- No re-processing of the 2026-07-30 pass's verified surfaces.

## Resume map (refreshed at the 2026-07-31 ~11:10Z compaction boundary)

Ground via start-right-quick; re-derive branch state first (`git status -sb`).
Seat: Ingot tracks Slag (be4ac9), claim d0ba8352 HELD through the boundary;
n=3 window (Director Falcon hunts Flight 52841f on quiet watch; Badger guards
Lair 88e358 on the validator lane); ARC estate-dialogue channel live with
Falcon (tracked file, tail re-arms at resume). Monitors die at process
restart: re-arm the all-channels watcher (canonical block, same seen-file),
assert, foreground gap sweep; re-arm the ARC tail.

STATE: P0/P1 DONE and on main (PR 662, then Falcon's roll-up 663 carried the
P2 checkpoints too). P2: map/reduce/merge DONE — all checkpoints committed
under the discovery report's `data/` dir (map 981 leaves; merged 327
candidates); META home-verification fleet's verdicts land as
`meta-verify-2026-07-31.json`. P6 DONE as a checkpoint (159 records; 21
carrying 36 unhomed items) pending adjudication-fold. The discovery report
carries the pipeline run record, calibration lessons, and incident section.

NEXT ACTS in order: (1) first-hand adjudication of the keep-set — every
needs-home candidate + every home-missing-substance/no-home-found meta
verdict + the 36 P6 items; read the grounding events/records directly;
produce the adjudication ledger in the discovery report; (2) P3 graduations
in batches (repo homes first, tickets as pointers only — the standing
information-homing constraint binds); (3) p3b fingerprint scan (structurally
blocks P4); (4) P4 roll-up merge; (5) P5 spend cards to the owner; (6) P7
cold-reader probe (fleet-shaped under the standing ultracode grant). The
owner's express fleet authorization and ultracode grant are in the napkin
and the P2 todo verbatim-substance.
