# Specimen null experiment — can the landed fleet see terminal-state propagation? (v1, FINAL)

Operator: Falcon hunts Flight (52841f), Director seat. 2026-08-02. Fired at owner word
(the #717 custody cards): the properly-constructed null for the governed-forgetting
proposal set — current Practice *including its tooling* — before any new build.

## Question

The governed-forgetting reports (PR #717) diagnose a defect class: a terminal decision
recorded at one site while operational readers in the same corpus stay causally live.
The assumptions review found the landed restatement-audit fleet uncited by the reports
and possibly sufficient. This experiment asks exactly one thing: **run the fleet over
the three verified specimens — does it flag them?**

## Design (f8 pattern)

Pinned detached worktree at `SHA:5fef92640` (origin/main at dispatch; all three
specimens verified present and uncured). One window, three files, absolute paths into
the pin: PDR-078 (liveness-heartbeat contract), `practice-lineage.md`, curator-pass
`SKILL-CANONICAL.md`. Stages run as seeded artefacts via the fleet's own builder:

- map (`wf_ec4fc9ff-6c1`): corpus-mapper, sonnet/low, compiled five-trigger-class
  procedure — 39 instances, `mapComplete: true`, zero errors, 79s.
- reduce (`wf_5ff87f47-861`): deterministic exact-key join + code-recounted reducer —
  **zero clusters**, `reduceComplete: true`, 34s. Validate/vote had nothing to judge;
  the experiment terminates here, decisively.

Checkpoints committed beside this note: `specimen-partition.v1.json`,
`specimen-instances.v1.json`.

## Result — the null loses at the extraction layer, and the miss is by design

The fleet extracted every terminal-state **fact** in the specimens and none of the
operative prose that contradicts them:

| Terminal fact (extracted) | Contradicting live reader (NOT extracted) |
| --- | --- |
| PDR-078 L102 `PDR-078-clause-2 / status = retired 2026-08-02` (authored) | §5 operative prose at L202-227, L369, L407 ("the cron-redundancy rule suppresses…") — no instance |
| curator L151 `per-pass-log-file / status = superseded` (authored) | Closeout/Cascade steps still instructing the superseded surface — no instance |
| lineage L153 `practice-context-peer-companion / status = retired 2026-04-29` (history) | L170 vs L209 Practice Box path conflict — neither path claim extracted |

Zero clusters is therefore not a join miss or a gazetteer gap: the conflict in this
defect class is never between two extractable fact assertions. It is between a fact
and prose that silently **uses** a dead fact. The fleet's five fact classes capture
assertions; operative dependence is outside their design, so the defect class is
invisible to the pipeline end-to-end.

## Verdict

**Extend, don't build.** The reports' P1/P2/P3/P6 collapse to one narrow extension of
the existing capability: a status-dependent-operative-prose extraction class, joined
against status assertions — with the fleet's join, conjunctive voting
(`liveSurface`/`genuineConflict`), held-for-review discipline, and deterministic
disposition layers reused unchanged. No new skill, reviewer, or store is warranted by
this evidence.

**Gate.** The three live specimens are cured by hand (branch
`docs/terminal-state-propagation-cures`, 2026-08-02), so the extension pays only at
the next occurrence. It therefore joins P4/P5/P8 behind the owner's named recurrence
gate (2026-08-02 card): a fourth specimen in a materially different artefact family,
appearing after the cures land. One gate, one trigger.

**Falsifier for this verdict**, runnable at the gate: hand the fourth specimen to the
extended mapper as its first fixture; if extraction still misses it, the facet was
mischaracterised here and the reports' larger build question re-opens.
