# Fleet topology trial: cross-examination round in a design fleet (2026-08-01)

Run `wf_33677bb9-0db`, dispatched by the Director seat (Falcon hunts Flight,
52841f) at owner word to re-true the PR #680 rubberduck-codex sketch.
Deliverable landed at 94c303eb5 on `docs/rubberduck-codex-plan`; decision
memo on PR #680. This record is the experiment side: what the topology was,
what it cost, and what the trial taught.

## Topology

Five phases, 14 agents, one novel stage (Cross-examine):

1. **Ground** (4, parallel, mutually blind): estate prior-art mapper
   (sonnet/medium); Claude Code vendor-contract prober (agentType
   `claude-code-guide`, live docs); Codex vendor-contract prober
   (sonnet/medium, live docs); internal-coherence critic (inherit/high).
   Barrier after — every designer consumes all four reports.
2. **Design** (4, parallel): three stance-diverse designers
   (minimal-product, practice-integration, capability-contract;
   inherit/high) plus a frame-challenger holding the null option
   explicitly (inherit/high — the "Opus frame-challenger" doctrine seat,
   run at inherit per fall-back-UP with a Fable session model).
3. **Cross-examine** (3, parallel) — the trial stage: each designer's
   proposal critiqued by a fresh agent holding the NEXT stance
   (round-robin), returning accepted/rejected amendments before synthesis.
4. **Synthesize** (1, inherit/xhigh): decision memo + full replacement
   plan.
5. **Verify** (2, parallel, deliberately asymmetric): an estate-compliance
   checker and an adversarial refuter ("default to refuted when
   uncertain").

## Cost

14/14 legs completed, 0 errors: ~1.33M subagent tokens, 108 tool uses,
20.3 min wall-clock. Per-leg figures: the run journal
(session 52841f, `subagents/workflows/wf_33677bb9-0db/journal.jsonl`).

## Findings

1. **Dispatch defect (Director error, worth a standing habit): Workflow
   args passed as a JSON-encoded string, not a JSON object** — the exact
   misuse the tool's own docs warn about. Every leg received the literal
   string "undefined" for the sketch path and the owner's verbatim ask.
   Legs recovered the sketch from the git record and the ask from handoff
   surfaces — impressive, but two early design verdicts were manufactured
   against defects the sketch does not contain. Habit: after composing a
   Workflow call, check the args field is a bare JSON value.
2. **The cross-examination round earned its place on its first outing**:
   both fabricated verdicts were caught by peer critics holding a
   different stance, before synthesis. This is the panel analogue of the
   supply-side compression lesson — peers with different priors audit
   each other's evidence chains where a single synthesis seat absorbs
   them.
3. **Asymmetric verifiers beat symmetric ones**: the compliance checker
   returned `sound: true, findings: []`; the adversarial refuter returned
   two serious findings (a process-level authority pin the plan itself
   should have chosen, verified first-hand against the installed CLI; and
   fleet-reconstructed intent presented as owner fact) plus two honest
   minors. Perspective diversity caught what redundancy would not — keep
   at least one refuter in every verify pair.
4. **A specialist agentType as a grounding leg works well**:
   `claude-code-guide` returned per-claim verified/refuted verdicts with
   source URLs, including a load-bearing negative (silent model fallback
   on excluded values) the design then carried as an acceptance
   criterion.
5. **Self-recovery is a double-edged behaviour**: legs that reconstruct
   missing inputs keep a broken dispatch productive AND manufacture
   grounding drift. The cure is upstream (check the dispatch), not
   suppressing the recovery.

## Disposition

Cross-examination is recommended for future design fleets at this scale
(cost: one extra agent per design stance; benefit demonstrated on first
run). The args-check habit applies to every Workflow dispatch. Refuter
asymmetry in verify pairs is already estate doctrine (adversarial verify);
this run adds a measured instance.
