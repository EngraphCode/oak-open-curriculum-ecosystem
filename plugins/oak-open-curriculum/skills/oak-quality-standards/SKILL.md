---
name: oak-quality-standards
description: >-
  Evaluate, quality-assure, or audit education content against Oak National Academy's quality standards and its Technical and Pedagogical rubrics. Use whenever the user wants to review or QA a lesson or resource — slide deck, worksheet, quiz, video, lesson guide, additional material, or lesson/curriculum information — and check whether it meets Oak's bar: "review this lesson", "is this up to Oak standard", "QA this resource", "check this against the rubric", "audit this deck/worksheet/quiz". Classifies each applicable standard as met, partially met, not met, or not applicable — with evidence and a fix — scoped by resource component, subject, key stage, and practical PE, and separates Required standards (must) from Model Practice (should). Pairs with the Oak Curriculum MCP for live exemplars; falls back to the bundled standards without it. Complements oak-curriculum-principles and oak-accessibility.
license: Quality standards © Oak National Academy. See references/sources.md.
compatibility: >-
  Works standalone from the bundled standards. Richer when the Oak Curriculum MCP is connected — it can pull real Oak lessons as exemplars to benchmark against. Without the MCP, review against the bundled standards and say what is general judgement rather than Oak-verified.
metadata:
  author: Oak National Academy
  version: '0.1.0'
  producesArtefacts: false
---

# Oak Quality Standards

## Overview

This skill holds **Oak National Academy's quality standards** — the bar every Oak lesson and resource is held to — and a method for evaluating content against them. It turns "is this good enough for Oak?" into a checkable, evidence-backed review.

The standards come in two strengths:

- **Required standards** — the _must_-haves. A failure here is blocking.
- **Model Practice** — the _should_-haves. Recommendations that raise quality; not blocking on their own.

They are organised by the **resource component** they apply to (slide deck, worksheet, quiz, video, media clips, additional material, lesson/curriculum information, PE lesson guide), with cross-cutting standards (accessibility, safeguarding, diversity and inclusion, spelling/grammar) and subject-specific layers (MFL, Computing, RE, Music, Art, and a parallel set for **practical PE**). Two rubrics — **Technical** and **Pedagogical** — organise the highest-tariff standards into assessable questions, and **Annex B** (the Curriculum & Lesson Specification) is the spec they operationalise.

This skill is for **evaluating** content; for the pedagogy behind the standards, `oak-curriculum-principles`.

## When to use it

Use it when the user wants to review, audit, QA, or quality-check any Oak-style lesson or resource against the standards or the rubrics. Don't use it to design from scratch or for purely visual brand checks.

## How a review works

1. **Scope the review.** Establish what you are reviewing before loading standards:
   - which **resource component(s)** — deck, worksheet, quiz, video, media clip, additional material, lesson/curriculum info, PE lesson guide;
   - the **subject** and **key stage**;
   - whether it is **practical PE** (the PE parallel standards then apply).

2. **Load only the relevant standards.** Open the reference file(s) for the component(s) in scope (see the map below) rather than all of them. Use `assets/quality-standards.json` when you need to filter precisely (by `component`, `subject`, `type`, `practicalPE`). Only **Active** standards are included.

3. **Ground in real Oak content where you can.** If the **Oak Curriculum MCP** is connected, pull a comparable real Oak lesson as an exemplar (match tools by suffix — `search`, `fetch`, `get-lessons-summary`, `get-lessons-quiz`). If it is **not** connected, review against the bundled standards and mark clearly what is general judgement versus Oak-verified.

4. **Judge each applicable standard.** For every standard in scope, classify it:
   - **Met** — cite where in the artefact it is satisfied.
   - **Partially met** — what is there, what is missing.
   - **Not met** — what is wrong, and a concrete fix.
   - **Not applicable** — why it does not apply (e.g. no media clips in this lesson).

   Judge against the **descriptor and its measure**, not a paraphrase. Where a standard is genuinely ambiguous for the artefact, say so rather than guessing.

5. **Separate must from should.** Report **Required** failures first as blocking; list **Model Practice** gaps as recommendations. A resource can be "meets the required bar" while still having model-practice improvements.

6. **Report.** Lead with a verdict and counts (Required: met / partial / not met; Model Practice: met / partial / not met), then a table of findings ordered by severity, then the fixes. Keep the report itself accessible — real headings, a table with a header row, no reliance on colour alone, plain language. See `oak-accessibility`, since WCAG 2.2 AA is itself one of the required standards.

## Reference map

Load the file(s) for what you are reviewing:

| Reviewing…                          | Reference file                                                       |
| ----------------------------------- | -------------------------------------------------------------------- |
| A slide deck                        | `references/slide-deck.md`                                           |
| A worksheet / worksheet answers     | `references/worksheets.md`                                           |
| A quiz (starter / exit)             | `references/quizzes.md`                                              |
| A lesson video                      | `references/video.md`                                                |
| Media clips (demos, audio)          | `references/media-clips.md`                                          |
| Additional materials                | `references/additional-materials.md`                                 |
| Lesson / curriculum information     | `references/lesson-and-curriculum-info.md`                           |
| A PE lesson guide (practical PE)    | `references/pe-lesson-guide.md`                                      |
| Diversity & inclusion (any surface) | `references/diversity-and-inclusion.md`                              |
| Subject-specific (MFL, Computing…)  | `references/subject-specific.md`                                     |
| Anything (accessibility, SPaG, …)   | `references/cross-cutting.md`                                        |
| Scoring against a rubric            | `references/technical-rubric.md`, `references/pedagogical-rubric.md` |
| The underlying specification        | `references/curriculum-lesson-spec.md`                               |

The full machine-readable set (for precise filtering) is `assets/quality-standards.json`. Sources and attribution are in `references/sources.md`.

## Always

- **Attribute.** The quality standards, rubrics, and specification are **Oak National Academy's**. A review that reproduces or derives from them should credit Oak National Academy and, where it draws on Oak's curriculum data via the MCP, link to the relevant lesson on thenational.academy and to the Open Government Licence v3.0.
- **Be honest about provenance and certainty.** Distinguish a clear standard breach from a judgement call, and Oak-verified (MCP-grounded) from general guidance. Quote the descriptor you are judging against.
- **Protect privacy.** Never reproduce personal data about pupils or staff from the content under review or from the standards themselves; keep findings about the resource, not its authors.
- **Keep the report accessible.** The review you produce meets WCAG 2.2 AA — headings, a table header row, no colour-only meaning, plain language (see `oak-accessibility`).

## This is experimental

This skill encodes Oak's standards to help an agent review content the way Oak does, but its judgements are **AI-generated, not an official Oak quality decision**, and have not been through Oak's editorial or moderation process. Treat the review as a structured starting point to check and adapt; a human reviewer or subject expert signs off whether a resource actually meets the bar.
