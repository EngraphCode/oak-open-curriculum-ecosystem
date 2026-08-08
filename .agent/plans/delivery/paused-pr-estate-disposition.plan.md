---
id: paused-pr-estate-disposition
node_type: delivery
name: Paused-PR estate disposition (the 17 owner-labelled PRs)
overview: >-
  Every PR labelled "paused for submission" carries a recorded disposition —
  merge at condition, close with adjudication, or hold at a named gate — and
  a named owner; execution is sized to the unique substance.
status: sketch
ratified_by: null
ratified_date: null
ratified_where: null
serves: first-major-release
impact_areas:
  - practice-and-estate
tickets: []
depends_on: []
owner_gates: []
last_updated: 2026-08-08
---

# Paused-PR estate disposition

Owner directive (2026-08-08 morning, in-session at the Director seat):
seventeen open PRs carry the "paused for submission" label; "we need a
plan for merging or closing each of them." This node is the disposition
ledger — the record that no PR was silently dropped. The owner answered
the ledger's three forks the same sitting: #766 merges as research docs,
and BOTH execution lanes are routed.

## The ledger (every PR, its verdict, its ground)

| PR | Verdict | Ground and owner |
|---|---|---|
| #737 | Merge at Matt's review | Cured and re-requested 2026-08-07; on the human reviewer's own clock |
| #788 | Merge at full condition | Small dead-code retirement; freshness re-check then merge — sweep lane |
| #818 | Merge path | Custodial pair lane: Copilot foundation + finding-3 config-class expert ruling, undraft, merge |
| #819 | Merge path | Custodial pair lane: docs-adr + onboarding passes + Copilot, merge |
| #731 | Reconcile-then-merge | The grouped-by-concern owner ruling re-trues it before merge; one seat, source work |
| #745 | Adjudicate at MCP-528 pickup | Overlaps the ratified seat-register plan; that implementer rules merge-or-supersede |
| #734 | Owned by its live lane | The typescript-estate lane's landing vehicle (owner-directed worktree); re-slicing question at that lane's resume |
| #783 | Design lane owns | Feeds Act 2 of the unsealed payload; the design seat adjudicates merge-or-supersede inside Act 2 |
| #784 | Design lane owns | Accumulating sitting-records register; merges when its window closes |
| #746 | Sweep lane adjudicates | Pre-submission plan node trued against the moved estate: merge if current, close-with-adjudication if superseded |
| #769 | Sweep lane adjudicates | Same class as #746 |
| #771 | Sweep lane adjudicates | Same class as #746 |
| #774 | Sweep lane adjudicates | Same class as #746 |
| #792 | Sweep lane adjudicates | Same class as #746 |
| #805 | Sweep lane adjudicates | Orphan-rescue report: merge as report if substance unhomed, close-with-adjudication if conserved (the #806 precedent) |
| #807 | Close-with-adjudication (candidate) | Spike evidence for the pending mutation-testing decision; branch preserved, evidence linked — sweep lane confirms |
| #766 | Merge as research docs | OWNER WORD 2026-08-08: freshness re-check then full-condition merge — sweep lane carries it |

## Goal

The open-PR board returns to the standing discipline — every open PR
merged, closed, or owned — with a recorded decision per PR and no
silent drops. Success is the label emptying through recorded
dispositions, not through bulk action.

## Mechanism

Two routed lanes execute the unique substance; four PRs are already
owned by named lanes or clocks and need no new work:

1. **Plans-truing sweep lane** (ROUTE on the comms stream, 2026-08-08):
   seven adjudications (#746, #769, #771, #774, #792, #805, #807) plus
   two merges (#788 freshness-checked, #766 at owner word). One
   sitting; each superseded plan closes with its adjudication recorded.
2. **Custodial pair lane**: #818 + #819 through their expert passes and
   full-condition merges under the Copilot-foundation review posture.
3. Already-owned: #737 (Matt's clock), #734 (typescript-estate lane),
   #783/#784 (design lane), #731 (reconcile seat when routed), #745
   (MCP-528's implementer).

## Acceptance criteria (each with a proof — required)

1. Every ledger row's disposition is executed or its named gate/owner is
   live, and the "paused for submission" label holds zero PRs without a
   recorded decision. Proof: `repo-safe` — the label query plus each
   PR's closing/merging record.
2. No close loses substance: every close-with-adjudication names where
   the substance lives or that the branch is preserved. Proof:
   `repo-safe` — the adjudication comments.

## Out of scope

- Executing #734's re-slicing, #745's adjudication, or the design
  lane's Act-2 calls — those belong to their owning lanes; this ledger
  only records that they own them.
- Any change to the merge instruments — the merge-decision
  Copilot-foundation truing is its own routed story.

## Review notes

The `plan-body-first-principles-check` fires at authoring; the sweep
lane's per-PR adjudications carry their own evidence on each PR. No
vendor forks.
