---
status: current
kind: executable
lineage:
  serves_thread: agentic-engineering-enhancements
  derives_from: .agent/directives/continuity-practice.md#disposition-of-continuity-surfaces
todos:
  - id: curate-current-state
    content: "Per-entry live/finished disposition of repo-continuity §Current State; conserve-then-delete finished residue, keep live forward-pointers"
    status: completed
  - id: compact-active-threads-cells
    content: "Compact the bloated Active-Threads identity cells to the table's index shape (lane state lives in thread records)"
    status: completed
  - id: verify-lossless
    content: "Verify no live forward-pointer dropped: live-token survival grep + thread-row + link-ref counts + markdownlint"
    status: completed
---

# repo-continuity Curation — restore the compact-active-state role

## End goal

`repo-continuity.md` stays a **compact, truthful pickup surface** that answers the four
continuity questions (which thread is active, which plan is authoritative, what must not be
violated, the next safe step), not a reverse-chronological session-landing log.

## Mechanism

The file goes critical not from size but from **role drift**: the lightweight session-handoff
loop appends a new Current-State entry each session, while the conserve-and-delete of *finished*
entries (`continuity-practice.md` §Disposition #2) lags behind. The cure is to apply that
disposition per entry: finished + insight-homed → delete the residue (git holds the literal
record); finished + un-homed → route the insight to its permanent home first; live → keep,
compacted. The recurrence is owned by [Phase 2](../future/continuity-surface-drift-prevention.plan.md).

## Means (the curation runbook — reusable on each continuity-drain)

1. For each `## Current State` entry apply the bridge question *live or finished?* (do not infer
   from age). Verify a finished entry's insight is live in its cited home BEFORE deleting
   (`ground-convenient-claims`; the semantic-merge §Verify proof) — "it's all homed" is a claim to
   check, not trust.
2. Compact `## Active Threads` cells to thread / purpose / record-link / one-line latest; lane
   state and identity history live in the thread record, not here.
3. Compress spent `## Next Safe Steps` subsections to a one-line pointer.
4. **Forbidden** (§Disposition): no split / shard / rotate / rename for score; conserve-then-delete
   is the only sanctioned drain. Leave anything genuinely live in place, verbatim.

## Acceptance (proof contract — non-code)

- File under its fitness thresholds **as a side-effect** of real curation, never by trimming live
  substance (knowledge-preservation is absolute).
- **Lossless verification recipe** (run after the rewrite): every live token from the pre-curation
  file survives (`grep -F` each live-pointer token); the thread-index row count is unchanged; the
  link-ref count is unchanged; `markdownlint:root` clean. An empty dropped-token set is the proof.

## First application (2026-06-28, Clover lifts Root)

Applied this session: 575 → 308 lines by draining finished-session narrative (substance in
git + ADR-207/204/127, PDR-111, the thread records); kept Beluga's "scope LOCKED" entry verbatim and
every live forward-pointer; verification recipe passed (zero dropped live tokens, 22 thread rows + 19
refs intact, markdownlint 0 errors).

## Non-goals

- Not a recurrence fix (that is Phase 2). Not a continuity-practice doctrine rewrite (§Disposition is
  the doctrine; this plan is its operational runbook + verification recipe).

## Lifecycle

Learning-loop closure: this curation ran inside a dedicated consolidation; the commit + the curated
file are the record (`permanent-doc-is-the-consolidation-record`). Archive when Phase 2's structural
cure makes manual curation unnecessary.
