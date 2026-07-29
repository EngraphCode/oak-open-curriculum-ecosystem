# Sources and attribution

The quality standards, rubrics, and specification in this skill are **Oak National Academy's**, reproduced here so an agent can review education content against Oak's bar.

## What is included

- **`assets/quality-standards.json`** and the component reference files (`slide-deck.md`, `worksheets.md`, …) are generated from Oak's Quality Standards database. Only standards with **State = Active** are included; Archived and Future standards are excluded. Each entry keeps the descriptor, type (Required / Model Practice), resource component(s), guidance area(s), rubric(s) and rubric code(s), subject, and whether it is relevant to practical PE.
- **`technical-rubric.md`** and **`pedagogical-rubric.md`** reproduce Oak's Technical and Pedagogical rubrics — the assessable, high-tariff questions and their measures, keyed by the same rubric codes (`TG1`, `PS2`, `PE-PV3`, …) the standards carry.
- **`curriculum-lesson-spec.md`** reproduces Annex B, the Curriculum & Lesson Specification the standards operationalise.

## What is removed

Internal authorship metadata (who created or last edited a standard), edit history, working notes, and any internal source-system links are **not** reproduced here — only the standard itself. No personal data about Oak staff or pupils appears in this skill.

## Provenance and licence

- The standards, rubrics, and specification are © **Oak National Academy** and are reproduced for the purpose of reviewing content to Oak's standard.
- When a review draws on Oak's live curriculum data via the Oak Curriculum MCP, credit **Oak National Academy**, link to the relevant lesson/unit on `thenational.academy`, and link to the **Open Government Licence v3.0**: _"Contains data from Oak National Academy, licensed under the Open Government Licence v3.0."_

## Keeping it current

This plugin is a subset copy of Oak's private `oak-skills` repository, which owns the generator (`scripts/build_quality_standards.py` there) and its CI check. To update: regenerate in `oak-skills`, then re-sync this copy. Within this repository the committed dataset and reference files are updated together as one reviewed change.
