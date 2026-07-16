# Fleet-design patterns — running capture (owner-mandated, 2026-07-16)

Owner directive: "where patterns emerge around fleet design or definition or creation,
make a note so we can fold time saving and quality improving mechanisms into the agent
tools workspace." This is that note surface — append-as-observed; each entry names the
pattern, its worked instance, and the candidate agent-tools mechanism. Consumer: the
tooling lane (items follow the runway plan) and the restatement-audit build.

## Captured so far (from the 2026-07-15/16 arc)

1. **Compiled decision procedure beats raw capability for small models.** The
   cricket-haiku A/B: haiku matched sonnet's verdicts once judgment was decomposed into
   per-item PASS/FAIL steps, mandatory quote-anchoring, a mechanical verdict-derivation
   table, and a banned-vocabulary list ("assume/likely/presumably" → UNGROUNDED instead).
   Mechanism candidate: a procedure-template library + a lintable "compiled procedure"
   format for dispatch prompts (agent-tools owns the templates; fleets cite them).
2. **Gazetteer-as-join-key makes cross-document fleets tractable.** Per-file finders
   cannot see across files; a Director-compiled gazetteer of canonical subject ids turns
   the cross-doc join into an exact key match, with `subjectFromGazetteer:false` rate as
   the run-health metric (>40% = re-seed, halt). Worked instance: the restatement-audit
   design. Mechanism candidate: `gazetteer.v1` as a first-class agent-tools artefact shape
   with a generator that seeds it from registries (gate register, lane registry, package
   scripts).
3. **Canary keys need a negative control.** A key proving the fleet CAN fire says nothing
   about over-firing; the restatement-audit key includes a sanctioned-cache row that must
   NOT be flagged. Worked instances: the S1 reader sample (H5 catch-vs-copy), the r2
   lane canaries (2 must-escalate rows proving the escalation path), the audit NC1.
   Mechanism candidate: extend `refound-plant-challenge-canary` key schema with
   `expect: negative` rows scored as must-not-fire.
4. **Deterministic-join-before-LLM; exact-key clusters skip judgment.** All counting,
   grouping, and agreement computation in tested code; LLM stages only cluster residuals
   and judge genuine ambiguity. Cost shape: voters run on judgment-needed clusters only.
   Worked instance: restatement-audit S2/S3 design; corpus-analysis v2 spine precedent.
5. **Point-not-copy is a load-bearing worker contract.** Small models CATCH content
   reliably but COPY bytes unreliably (S1: 17/30 windows failed on copy fidelity alone).
   Verbatim-ness stays dispatcher-side: workers return ids + short quotes; the dispatcher
   recomputes. Mechanism: a standard dispatcher-side reconciliation helper.
6. **Tier scale-out behind a calibration gate.** Cheap-tier fleets earn their scale by a
   small dual-run (3 windows, cheap ⊇ mid-tier on gazetteer-subject finds) rather than by
   assumption. Worked instance: audit S1 haiku gate; cricket A/B PAIR protocol.
   Mechanism candidate: a reusable `calibrationGate(stage, tiers, criterion)` orchestration
   helper.
7. **Schema-forced output with a zod SSOT, derive-inlined into prompts.** Hand-restated
   output schemas in dispatch prompts drift (the audit's own thesis); the
   corpus-analysis `agent-schemas.ts` derive pattern is the cure — hoist it from
   corpus-analysis into a shared agent-tools helper.
8. **Checkpoint between stages; never re-spend an upstream stage on a downstream
   failure.** corpus-analysis map→reduce checkpointing; Workflow resumeFromRunId. Already
   substrate — the pattern is USING it by default in fleet designs.
9. **Review-round economics are fleet economics.** Every push mints an async bot round;
   bundling one round's findings into ONE push, a numeric round tally, and the round-owed
   merge gate (pr-lifecycle amendments, 2026-07-16) are throughput mechanisms, not
   politeness. Non-convergence (2 non-decreasing rounds) = generator-hunting time.
10. **Fresh-session dispatch for significant fleets.** Deep-context sessions mis-scope
    fleets (the 150-agent failure) and their permission state contaminates; a fresh seat
    with a self-contained brief + scoped spawn authorization is the shape (dispatcher/audit
    seat briefs, 2026-07-15/16). Mechanism candidate: a brief-template generator in
    agent-tools.
11. **A per-fleet P12 declaration is cheap and owner-legible**: counts, tiers, ceilings,
    halt bindings, acceptance gate — one block, one owner go. Standardise the block shape.

12. **Staffing changes re-true the design SSOT immediately, or the brief and plan
    contradict.** Worked instance: the owner staffed Vole mid-plan; the plan file kept
    "module build already landed by [the Director]" while the brief assigned the build to
    Vole — the seat caught the class-1 contradiction pre-bootstrap and flagged rather than
    silently picking (the correct receiving behaviour, worth encoding in brief templates:
    "on brief-vs-cited-source conflict, flag, do not choose"). Mechanism candidate: briefs
    carry a `supersedes` line naming exactly which cited-document statements they override.
13. **Arm the dialogue tail BEFORE inviting dialogue, and sweep the channel on arm.** An
    ARC tail armed after the peer's first message never fires for it (tail -n 0); the
    peer's hold sat invisible ~20 minutes. Same class as the comms-watcher post-arm sweep
    rule — apply it to every dialogue-channel tail: arm, then read the whole file once.

— Mussel rides Coral (6f8857), sitting Director, team Mango

14. **Doctrine-compliance read before amending doctrine; mechanical guards for
    mechanical rules.** A seat amending the pr-lifecycle skill squash-merged a PR the
    same hour, against the rule 60 lines below its edit — doctrine-blindness while
    editing doctrine. Cures: (a) before any skill/rule amendment lands, run the amended
    document's ADJACENT sections as a checklist against your own in-flight work; (b)
    rules with a mechanical shape (merge method, flag bans) get mechanical guards — a
    candidate agent-tools wrapper refusing `gh pr merge --squash` outright, mirroring the
    hook-policy blocked-patterns model.

## Pattern 15 — replay deterministic code over already-paid-for data before any new spend

Worked instance (Vole, 2026-07-16, canary-pilot re-assessment): the single most productive
move of an 18-agent adversarial verification was ZERO-cost — re-running the deterministic
join code over the 62 already-paid-for pilot instances. It converted three eyeballed claims
into measured ones (43 predicates / 62 instances; 38 singletons; second intra-agent join
failure I33/I44) and found two new defects for free. Generalisation: when a fleet run
produces structured artefacts, exhaust the deterministic-replay space (joins, recounts,
byte-verification, coverage diffs against the pinned tree) BEFORE dispatching any new
agents — the replay both grounds the failure analysis and often reshapes what the next
spend should be. Pairs with pattern 12 (deterministic-join-before-LLM) as its post-hoc
mirror: deterministic-replay-before-re-spend.

## Pattern 16 — verdict momentum under deadline pressure; the cure is per-claim evidence class

Worked instance (Vole, same arc, self-diagnosed): three shipped errors shared one shape —
scoring the wrong object (NC1), asserting a mechanism without reading logs ("cascade"),
and attributing all misses to the fashionable cause without isolating variables (window
shape vs tree staleness vs key vocabulary vs join architecture). Compaction pressure
compressed evidence-checking exactly where it mattered. Fleet-design cure: report
templates that carry an evidence-class marker per claim (measured / read-first-hand /
inferred / prior-transferred), so a composing agent SEES the inferred claims at shipping
time — and a re-assessment pass targets exactly those.

## Pattern 17 — the compound pair (owner-directed, now n=2 instances)

Two seats in tight partnership as each other's adversarial check-and-balance: every
binding artefact passes the OTHER seat's evidence-anchored refutation
(STANDS/REFUTED/MODIFIED + corrected statement) before it is acted on, over a dedicated
ARC channel, with evidence-class markers on claims. Instances: Mussel+Vole
(restatement-remediation, 2026-07-16 — first cycle caught one real defect in each
direction within the hour) and Lupin+Zephyr (codex hook experiment, same day,
owner-directed "one evidence-backed judgement through reciprocal adversarial checks").
Load-bearing mechanics discovered in instance 1: bounded refutation windows (one
exchange or one quiet hour, then SKIPPED-FOR-WINDOW — mutual checking must not become
mutual deadlock); boundaries stay uncrossed (check the artefact, never edit the
partner's surface); deadlock after one round each routes to the owner as a card; the
pair does NOT replace per-seat conscience checks (crickets stay independent).
