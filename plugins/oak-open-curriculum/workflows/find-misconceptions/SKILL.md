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
4. Order by the teaching sequence. The misconception graph returns lessons in slug order, not curriculum order, so take each unit's `unitLessons[].lessonOrder` from `get-units-summary` and present the misconceptions in that order, grouped by unit. Do not rank by severity, frequency, or how much later learning depends on the error — the corpus evidences none of these.

Stay grounded in the graph. Do not generalise from intuition about what pupils "probably" get wrong.
