# Live data contract — what the SDK seams actually return

For Squall (styling/UI): design the results + lesson presentational components against
**these real shapes + values**, not the prototype's static snapshots. Source = live capture
against the running demo (`/api/search`, `/api/lesson/[slug]`) on 2026-06-30, query
"comparing fractions". Authoritative types: `lib/search-types.ts`, `lib/curriculum.ts`.

Seam binding (per the accepted contract): you define the prop shape + ping me; I bind via
`@/lib/search-types` (`isSearchResults`, `SearchResults`, `Hit`) and `@/lib/curriculum`
(`getLesson`, `isLessonContent`, `LessonContent`). Ping before any shared shape change.

## Search — `GET /api/search?q=<query>` → `SearchResults`

`{ lessons: Hit[]; units: Hit[]; threads: Hit[] }` (sample counts: 9 / 6 / 8). Each `Hit`
carries different fields by kind — **design for these, treat the rest as absent**:

| Field | Lessons | Units | Threads | Notes |
|---|---|---|---|---|
| `id` | ✅ | ✅ | ✅ | slug; lesson `id` is the `/api/lesson/[slug]` key |
| `title` | ✅ | ✅ | ✅ | |
| `url` | ✅ | ✅ | **often `""`** | thenational.academy canonical; **threads frequently have NO url** — render non-link |
| `subjectSlug` | ✅ | ✅ | — | e.g. `maths` |
| `subjectSlugs` | — | — | ✅ | threads can span subjects (array) |
| `keyStage` | ✅ | ✅ | — | e.g. `ks2` |
| `years` | ✅ | — | — | string[] e.g. `["6"]` |
| `unitTitle` | ✅ | — | — | lesson's parent unit |
| `lessonCount` | — | ✅ | — | e.g. `5` |
| `unitCount` | — | — | ✅ | e.g. `32` |
| `snippet` | ✅ | ✅ | — | ES highlight, **contains `<mark>…</mark>` HTML** |

Sample lesson hit: `id: explain-which-strategy-for-comparing-non-related-fractions-is-most-efficient`,
`subjectSlug: maths`, `keyStage: ks2`, `years: ["6"]`, `unitTitle: "Comparing fractions"`.
Sample thread: `{ id: number-fractions, title: "Number: Fractions", url: "", subjectSlugs: ["maths"], unitCount: 32 }`.

**Snippet rendering:** `snippet` is server-trusted Oak index HTML with `<mark>` tags. The
committed slice renders it via the existing safe path — keep that; don't escape the marks
(they're the highlight) and don't accept snippet HTML from any other source.

## Lesson — `GET /api/lesson/[slug]` → `LessonContent`

`{ summary, quiz, assets }` — **each part is independently `null`** (a copyright-blocked or
missing part degrades to null, not an error). Always null-guard each section.

**`summary`** — the live API returns MORE than the committed type currently exposes. Available
live (sample): `lessonTitle`, `oakUrl`, `canonicalUrl`, `pupilLessonOutcome`,
`units: [{ unitSlug, unitTitle }]`, `subjectSlug`, `subjectTitle`, `keyStageSlug`,
`keyStageTitle`, `lessonKeywords: [{ keyword, description }]`,
`keyLearningPoints: [{ keyLearningPoint }]`.

> **Wireable pedagogy:** `lessonKeywords` + `keyLearningPoints` map to the prototype's
> keyword/learning-point sections — these can be **live**, not static. They aren't in the
> current `LessonSummaryFields` type yet. If your lesson components want them, ping me and I'll
> widen the seam **additively** (new optional fields; no break to the existing `{summary,quiz,assets}`
> contract).

**`quiz`** — `{ starterQuiz: unknown[], exitQuiz: unknown[] }` (item shape not yet narrowed —
ping me if you render individual questions and I'll type them from live data).

**`assets`** — `{ assets: [{ type, label }], oakUrl }`. Downloads **link out** to `oakUrl`
(the API asset `url` is an authenticated endpoint, not browser-usable — owner decision).

## What is NOT live (static, from decoded snapshots)

Training courses, quality standards (`data-snapshots/snapshot-07e33aee.json` = qsData),
rubrics, exemplars, wiki, pedagogy explainers, hub chrome. The `curriculum` snapshot
(`snapshot-b3bf6a09.json`) is the prototype's static curriculum data — **we replace it with the
live search/lesson seams above**.
