---
name: audit-sequence
description: Check that a draft plan teaches prerequisites before the units that depend on them, walking Oak's prior-knowledge graph and thread progressions.
argument-hint: <paste or reference the plan to audit>
---

Audit this sequence: $ARGUMENTS

Delegate to the **sequencing-auditor** agent.

The agent must:

1. Read the draft sequence into an ordered list of units.
2. For each unit, retrieve its prerequisites from `get-prior-knowledge-graph` and its position in `get-thread-progressions`.
3. Flag every case where a prerequisite is taught later than, or absent from, the unit that depends on it.
4. Report findings as a short table: unit, missing or late prerequisite, suggested fix.

This is a structural check, not a stylistic one. Report only genuine ordering breaks, ranked by how much later downstream learning they put at risk.
