---
name: check-coverage
description: Check a plan against National Curriculum statements as addressable nodes, reporting which statements are satisfied, partially met, or silent.
argument-hint: <subject> <key stage> <paste or reference the plan>
---

Check national-curriculum coverage for: $ARGUMENTS

Delegate to the **coverage-checker** agent.

The agent must:

1. Resolve the relevant National Curriculum statements for the subject and key stage.
2. For each statement, find the unit or lesson in the plan that addresses it, using `get-key-stages-subject-units`, `get-key-stages-subject-lessons`, and `get-units-summary`.
3. Classify each statement as satisfied, partially met, or silent, citing the specific unit that satisfies it.
4. Return a coverage report keyed by statement identifier, not prose, so the result is checkable rather than rhetorical.

Note on dependency: programmatic, statement-level coverage requires National Curriculum statements exposed as addressable nodes (a CASE projection of the ontology). Until that layer is live, this agent reports thematic coverage and marks each judgement as provisional. Be explicit about which mode it is running in.
