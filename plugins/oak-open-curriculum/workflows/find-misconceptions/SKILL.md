---
name: find-misconceptions
description: Surface the known pupil misconceptions for a topic, each paired with how the error shows up and how to respond.
argument-hint: <topic> <year or key stage>
---

Find misconceptions for: $ARGUMENTS

Delegate to the **misconception-miner** agent.

The agent must:

1. Pull the misconception set for the topic with `get-misconception-graph`.
2. Corroborate with the distractors pupils actually choose, drawn from `get-lessons-quiz` for related lessons.
3. For each misconception, return: the error in pupil terms, where it typically surfaces in the sequence, and a concrete teacher response.
4. Order by how often the error blocks later learning, not by how interesting it is.

Stay grounded in the graph. Do not generalise from intuition about what pupils "probably" get wrong.
