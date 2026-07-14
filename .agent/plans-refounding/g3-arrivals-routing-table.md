# G3 packet — arrivals-routing table (plan-corpus refounding, r1)

Status: **RULED at the 2026-07-14 sitting** (owner, ~12:25–12:30Z, relayed by
Director directed event 12:29:05Z) — see §Ratification record. Headline
adjustments: an owner **moratorium** governs the (hours-scale) hard freeze
window — no incoming plan-corpus work lands while it is open, and this table's
role inside the window is **violation-detection**, resuming ordinary routing
after it closes; **operational registers are OUT of the corpus** (G3.3, applied
to the freeze rule); deletions halt for owner ruling (A4 ratified). Authored
2026-07-14 by Cedar rides Undergrowth (270379), R1 implementer. Gate content per
the [owner-gate register](./owner-gate-register.md) G3 row: **what auto-freezes
vs what takes a per-arrival ruling**. Ruled at the same sitting as
[`g2-s0-landing-packet.md`](./g2-s0-landing-packet.md).

## Evidence — the measured arrival stream (not a hypothetical)

- Design-date window (2026-07-06 → 2026-07-14, 8 days, at `origin/main`
  `SHA:2ccc0e2e0`): **17 files added, 138 modification events, 1 rename** across
  the in-scope globs (`.agent/plans/**`, `.agent/milestones/**`,
  `.agent/proposals/**`); zero deletions.
- The final 2.5 hours alone (the TAU merge window) touched 8 distinct in-scope
  files (+4 net).
- Stream shape: (a) **active-plan accretion edits dominate** (the controlling
  refounding plan itself took 7 edits in the window); (b) roughly **two new
  files per day**; (c) **high-churn operational registers** — the frictions
  register took 15 edits in 8 days; (d) deletions absent, renames rare.

Conclusion the table is built on: arrivals are a steady, benign, accretion-shaped
stream. Auto-freeze must be the default or the ruling queue drowns (P11); the
only class that warrants a human ruling is the one the stream almost never
produces (removals).

## The table (v1, proposed)

| # | Arrival class | Detected by | Routing | Mechanics |
| --- | --- | --- | --- | --- |
| A1 | Modification of an already-frozen file | merge-recheck denominator re-derivation at stable points and batch boundaries | AUTO-FREEZE | versioned `frozen-v2` copy of the arrival; scoped inventory/tiling extension; no ruling (matches the plan's r4 text) |
| A2 | New file in an in-scope glob | same | AUTO-FREEZE | denominator amendment adds the row; verbatim copy captured at the amendment point |
| A3 | Rename of an in-scope file | same, as an ADDED path plus a DELETED path — the detector has no rename status: no old→new association is produced, and a rename-with-edit is not hash-inferable | AUTO-FREEZE with mapping at the window boundary | the operator associates the add+delete pair and the amendment records the old path → new path mapping (manual provenance until the detector grows rename support); bytes conserved under both |
| A4 | Deletion of an in-scope file | same (delete status) | **PER-ARRIVAL RULING** | the frozen copy already conserves the bytes (P14 — nothing is discarded); the ruling decides the ledger disposition of the removal, never a default |
| A5 | High-churn operational registers (e.g. the frictions register) | **RESOLVED at the sitting (G3.3)** | OUT OF THE CORPUS | operational surfaces, not plans — excluded from the frozen denominator by the freeze rule's `operational-registers` class (exact six-path list; warrant recorded in the rule); they never generate arrivals because they are never in-scope |
| A6 | Protocol-authored writes | structurally impossible as arrivals | n/a | the artefact root and the destination root sit OUTSIDE the frozen denominator (G1 ruling 4; sanctioned-writer set ratified EMPTY) |
| A7 | Writes to sweep surfaces (`plans-old-archive`, prompts, thread records) | not arrivals — outside the frozen denominator | n/a | sweep re-runs at stable points cover them |

## Ratification questions (as put)

| # | Question | Recommendation |
| --- | --- | --- |
| Q1 | Ratify A1–A3, the auto-freeze family (modifications, additions, renames) | YES — evidence-derived from the measured stream; matches the plan's r4 arrival mechanics |
| Q2 | Ratify A4: deletions are the ONLY per-arrival ruling class | YES — the measured stream shows zero deletions in 8 days; expected ruling load ≈ zero, and the class is exactly where human judgement belongs |
| Q3 | Accept A5's interim posture (auto-freeze now; register-vs-lane question routed to Walk A) | YES |
| Q4 | Record A6/A7 as boundary statements (no new mechanics; restates G1 ruling 4 and the sweep design) | YES |

## Ratification record (2026-07-14 sitting)

Owner rulings ~12:25–12:30Z, relayed by the Director's directed event to this
seat at 12:29:05Z (the evidence pointer of record):

1. **G3.1 — superseded by an owner moratorium**: NO incoming plan-corpus work
   during the (hours-scale) hard freeze window. Inside the window this table's
   role is violation-detection; ordinary routing (A1–A3 auto-freeze) resumes
   when the window closes.
2. **G3.2 — YES**: deletions halt for owner ruling (A4 as drafted).
3. **G3.3 — RULED NOW**: high-churn operational registers are OUT of the
   corpus — operational surfaces, not plans; live operational state churns
   through any work, so exclusion dissolves the moratorium-vs-registers
   conflict. Applied: the freeze rule's `operational-registers` class (exact
   six-path list, warrant in the rule; membership changes need
   re-ratification; exact-list confirmation rides the freeze-planning
   sitting), the enumeration's out-subtraction semantics (test-first), and the
   A5 row above. Drafted A5 interim posture superseded.
4. **G3.4 — YES**: the table stands as the routing record, adjusted for the
   above.
