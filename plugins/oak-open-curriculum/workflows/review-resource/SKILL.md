---
name: review-resource
description: Review an Oak-style lesson resource against Oak's quality standards and the Technical and Pedagogical rubrics, classifying each applicable standard as met, partially met, not met, or not applicable, with evidence and a fix.
argument-hint: <component, e.g. deck/worksheet/quiz/video/lesson-guide> <subject + key stage> <paste or reference the resource>
---

Review this resource against Oak's quality standards: $ARGUMENTS

Delegate to the **standards-reviewer** agent.

The agent must:

1. Scope the review — resource component(s), subject, key stage, and whether it is practical PE — and state any assumptions where these are unclear.
2. Load only the relevant `oak-quality-standards` references for the component(s), plus the cross-cutting standards, filtering the dataset where precision is needed. Active standards only.
3. Ground the review in a comparable real Oak resource via the Oak Curriculum MCP when it is connected; otherwise review against the bundled standards and mark what is general judgement versus Oak-verified.
4. Classify each applicable standard as met, partially met, not met, or not applicable — quoting the descriptor, citing evidence, and giving a concrete fix for every gap.
5. Separate Required standards (blocking) from Model Practice (recommendations); lead with a verdict and counts, keep the report accessible, and be explicit that it is an AI review for a human to sign off.
