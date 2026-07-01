# C6 data-plane evidence — pedagogy seam over varied lessons

Probe of `GET /api/lesson/{slug}` proving the C4 additive pedagogy seam exposes real,
correctly-shaped data across subjects and key-stages, and degrades to null cleanly when a
lesson is unavailable. Author: Frigate holds Estuary (data-plane Implementer). Captured against the live demo dev server (localhost:3010) with the live OAK_API_KEY.

## Happy path — real lessons (KS1–KS4, multiple subjects)

| Lesson | Subject | KS | HTTP | summary | subjectTitle | keyStageTitle | unitTitle | lessonKeywords | keyLearningPoints |
|---|---|---|---|---|---|---|---|---|---|
| `photosynthesis` | Science | KS3 | 200 | present | yes | yes | yes | 5 item(s) | 5 item(s) |
| `an-exploration-of-act-3-scenes-4-to-6` | English | KS4 | 200 | present | yes | yes | yes | 5 item(s) | 5 item(s) |
| `applying-trigonometric-ratios-in-context` | Maths | KS4 | 200 | present | yes | yes | yes | 4 item(s) | 2 item(s) |
| `generating-knowledge-about-the-great-fire-of-london` | English | KS1 | 200 | present | yes | yes | yes | 2 item(s) | 5 item(s) |
| `fronted-adverbials-single-words-and-phrases` | English | KS2 | 200 | present | yes | yes | yes | 4 item(s) | 5 item(s) |

### Sample populated values (proves real content, not just shape)

- **photosynthesis** (Science/KS3): subject="Science", keyStage="Key Stage 3", unit="Plant nutrition and photosynthesis"
  - keyword[0] = "producer"; keyLearningPoint[0] = "Producers make their own food using a process called photosynthesis."
- **an-exploration-of-act-3-scenes-4-to-6** (English/KS4): subject="English", keyStage="Key Stage 4", unit="Shakespeare: first reading"
  - keyword[0] = "reign"; keyLearningPoint[0] = "Act 3 sees Shakespeare explore Macbeth’s illegitimate reign over Scotland"
- **applying-trigonometric-ratios-in-context** (Maths/KS4): subject="Maths", keyStage="Key Stage 4", unit="Right-angled trigonometry"
  - keyword[0] = "Trigonometric functions"; keyLearningPoint[0] = "Trigonometric ratios are used in many scenarios"
- **generating-knowledge-about-the-great-fire-of-london** (English/KS1): subject="English", keyStage="Key Stage 1", unit="The Great Fire of London: non-chronological report"
  - keyword[0] = "knowledge"; keyLearningPoint[0] = "The Great Fire of London happened in the past."
- **fronted-adverbials-single-words-and-phrases** (English/KS2): subject="English", keyStage="Key Stage 2", unit="Review of determiners, prepositions and fronted adverbials"
  - keyword[0] = "fronted adverbial"; keyLearningPoint[0] = "A fronted adverbial is a sentence starter that is followed by a comma."

## Unhappy path — degrade-to-null (unavailable lesson)

| Slug | HTTP | body | summary on client |
|---|---|---|---|
| `this-lesson-does-not-exist-xyz` | 200 | `{"summary":null,"quiz":null,"assets":null}` | `null` → guarded, no-content state |

Observed behaviour (verified, not assumed): an absent lesson does **not** throw. Each summary/quiz/
assets endpoint returns a non-OK response, which `getLesson` maps to `null` per part and still
resolves `ok({summary:null,quiz:null,assets:null})` — so `/api/lesson` returns HTTP 200 with a
null-bearing body, not a 5xx. The client guard `isLessonContent` accepts the shape (top-level keys
present) but `summary` is `null`, and every pedagogy field is read via optional chaining, so the
lesson view degrades to its no-content state rather than crashing. (The route's 502
`lesson_unavailable` branch is reserved for a *thrown* transport error — `getLesson` returning
`err({kind:'failed'})` — not for a cleanly-absent lesson.)

Field-level sparseness in this sample: keyword/key-learning-point counts varied per lesson
(keywords 2–5, KLPs 2–5); none were empty in these 5, so a genuinely
empty-pedagogy-field case is not yet captured (optional-chaining guarding covers it by construction).
