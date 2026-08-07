---
name: find-misconceptions
description: Surface the known pupil misconceptions for a topic, each paired with how the error shows up and how to respond.
argument-hint: <topic> <year or key stage>
---

Find misconceptions for: $ARGUMENTS

Delegate to the **misconception-miner** agent.

The agent must:

1. Resolve the topic to lesson, unit, or thread slugs first (`search` or the browse tools), then pull the misconception set with `get-misconception-graph` anchored by those slugs — it takes corpus slugs, not free text.
2. Corroborate with the authored distractors in related lessons' quizzes, drawn from `get-lessons-quiz` (authored content, not pupil-response telemetry).
3. For each misconception, return: the error in pupil terms, where it typically surfaces in the sequence, and a concrete teacher response.
4. Order by whether the error corrupts knowledge that later units depend on, and how many depend on it, per `get-prior-knowledge-graph` — not by estimated frequency, and not by how interesting it is.

Stay grounded in the graph. Do not generalise from intuition about what pupils "probably" get wrong.
