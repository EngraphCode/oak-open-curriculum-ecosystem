# Pre/post-compaction and handover docs — self-review (simplification & excellence, 2026-07-16)

Owner-requested self-review of the Director-authored continuity instruments: the
compaction record (`2026-07-16-director-compaction-mussel-6f8857.md`), the seat handoff
record (`2026-07-15-director-mussel-to-tuna-0f4be777.md`), the three fresh-seat briefs
(implementer / dispatcher / audit), and the post-compaction statement pattern. Same lenses
as the continuity review. Review only; no changes applied.

## The headline finding, owned plainly

My own documents carry the restatement disease in milder form — milder because the SHAPE
is right, present because the CONTENT discipline leaks. Three instances of cached volatile
state went stale within minutes-to-hours, observed first-hand:

1. The Mussel→Tuna handoff record needed TWO ADDENDA plus an owner-correction section
   within the hour of freezing — because its §1 cached lane states (chain step numbers,
   spend figures, registry freshness) that moved before pickup.
2. The implementer brief's Job 1 was superseded by events within hours and needed a
   manual truing edit ("DONE BY THE DIRECTOR — superseded, retained for context").
3. The audit brief contradicted the plan file on module ownership the moment the owner
   staffed Vole — caught by Vole pre-bootstrap, cured by hand.

The sweep's find-phase already counted 30 gate assertions across seven handoff records,
and BOTH of its INVENTED exemplars came from a Director handoff record — these documents
are a stale-gate propagation vector on par with the bootstrap surfaces. And all of this
was authored while actively hunting the defect class: the generator operates under full
attention, which is the strongest argument that the cure is mechanical (validators,
template contracts), not vigilance.

## Per-document findings

### Compaction record (2026-07-16) — good bones, ~35% trimmable without loss

- **Right**: §3 (the four adversarially-checked fix designs) and §4 (behaviour-binding
  corrections) are pure judgment with no other home — the record's unique payload. §5 is
  a conservation INDEX that points rather than carries — the correct shape. §6 ordered
  first acts — judgment, correct.
- **Restatement violations**: §2 duplicates ~8 lines of the persistent plan file
  (a two-line pointer suffices — the plan survives compaction); the task-list block
  restates harness-persistent state; §1 caches `autoMergeRequest` state that can flip
  before re-read (it does carry the conditional "if unmerged, read rulesets" — the right
  instinct, half-applied).
- **Verdict**: ~90 → ~55 lines under the refined template below, zero judgment lost.

### Seat handoff record (Mussel→Tuna) — the shape is proven; §1 and §4 leak

- §1 "current edit state" is a volatile-state dump (the addenda prove it); the excellent
  form is pointers + deltas: claims registry for who-holds-what, lane records for lane
  state, a comms cursor for the stream — inline only what has no live home.
- §4's inherited "owner-gated" labels propagated without forcing facts (the sweep's
  INVENTED exemplars). The gate-language convention (already a Walk-A rider) applies to
  handoff records with full force: a gate named in §4 carries its forcing fact inline or
  does not appear.
- §2/§3 (in-flight reasoning; decisions made) — correct content, keep whole.

### Fresh-seat briefs — decision-completeness is right; the leak is unmarked volatility

The self-containment rule is CORRECT for directives and judgment (Vole's flawless
execution on a sonnet seat is the evidence), and must not be simplified away. The leaks:

- Restating stable committed content (the audit brief re-typed the schema enum from the
  plan; the dispatcher brief re-typed the full declaration) — cite the committed source,
  inline only the 3–5 load-bearing values, mark them "at authoring".
- No PRECEDENCE declaration — Vole had to ask which document wins (brief vs plan).
  Every brief needs: "this brief supersedes the following statements in the documents it
  cites: […]; on any OTHER conflict, flag to the Director, do not choose" (fleet-pattern
  12, now with its second worked instance).

### Post-compaction statement — already evolved to the right form

Yesterday's ~200-word contract-inline form vs today's 6-line form (identity + single
re-entry pointer + two behaviour bindings). Today's is the model; the record carries the
substance, the statement carries the key.

## The refined template (one contract for all these instruments)

1. **POINTERS** for anything with a live authoritative home — claims registry, PR state,
   plan file, task list, comms cursor. Never re-type them.
2. **VALUES inline** only when load-bearing for the consumer's first hour, each marked
   "at freeze"/"at authoring".
3. **JUDGMENT in full** — reasoning, decisions, corrections, designs, orderings. This is
   the only content whose sole home is the author's context; it is why the document
   exists.
4. **PRECEDENCE + SUPERSEDES** declarations in every brief; gates only with inline
   forcing facts in every record.
5. **A conservation INDEX** (points, never carries) closing every compaction record.

Enforcement path (SUPERSEDED SAME-DAY by owner direction — no follow-ups, no deferral):
both actions are now PLAN ITEMS in the current arc, per
`restatement-remediation-change-plan-2026-07-16.md` — the contract amends the
session-handoff SKILL and the handoff-messages rule in this arc's cures PR (change plan
§C2), and the audit corpus is amended to T3+U with the untracked live tier as group (h)
(§C1), because untracked files are first-class: local for being high-traffic and
ephemeral, never for mattering less.

— Mussel rides Coral (6f8857), sitting Director, team Mango
