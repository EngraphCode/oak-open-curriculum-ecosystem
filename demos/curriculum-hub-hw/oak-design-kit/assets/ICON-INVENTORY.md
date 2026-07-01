# Oak icon inventory (C1 asset supply)

Full name list of the remote Oak design-system `assets/icons/` set + brand/logos, with pull
status. Pulled via DesignSync (chat-scoped to the Director session) on request. All UNCOMMITTED
(C7 LICENSE licensing gate). Consume from `oak-design-kit/assets/` (via `oak-icons.css` classes or
direct `<img src>`).

## Delivered (byte-validated well-formed SVG)

Chrome / nav / footer / lesson glyphs — pulled + written:
`search` · `hamburger` · `cross` · `external` · `chevron-right` · `chevron-down` · `download` · `tick`
Plus `oak-icons.css` (the `--i-*` custom-property + `.oak-icon`/`.oak-mask` wiring).

## Available already (via Titan's decode — byte-exact, no pull needed)

Oak logo (wordmark) = `from-prototype/brand-svgs/brand-eb503978.svg` (also at demo
`public/oak-logo.svg`); Oak acorn mark = `brand-54b85bd1.svg` (also `public/oak-logo-mark.svg`).

## Pending — pull on demand (name a glyph and it's delivered next batch)

**UI / general:** additional-material, ai, arrow-down, arrow-left, arrow-right, arrow-up, bell,
book-steps, bookmark-filled, bookmark-outlined, books, bubble-1, bubble-2, burst, chevron-left,
chevron-up, clipboard, confetti, content-guidance, copy, copyright, curriculum-plan, dot, edit,
equipment-required, error, expand, filter, free-tag, go, header-underline, home,
homepage-robot-waving, homepage-teacher, homepage-three-pupils, info, intro, lightbulb,
lightbulb-yellow, lock, logo, magic-carpet, minimise, pause, pencil, play, project, question-mark,
quiz, rocket, save, send, share, slide-deck, slide-deck-3, speech-bubble, spreadsheet, success,
supervision-level, teacher-lesson, teacher-unit, underline-1, video, warning, worksheet,
worksheet-3.

**Social (footer):** facebook, instagram, linkedin, threads, twitter, x, social-facebook, social-x.

**Subject icons (chips/cards):** subject-art, subject-biology, subject-chemistry,
subject-citizenship, subject-communication-and-language, subject-computing,
subject-cooking-nutrition, subject-creative-arts, subject-design-technology, subject-drama,
subject-dt, subject-english, subject-english-grammar, subject-english-spelling,
subject-financial-education, subject-french, subject-geography, subject-german,
subject-handwriting, subject-history, subject-independent-living, subject-language, subject-latin,
subject-literature, subject-maths, subject-music, subject-numeracy, subject-pe, subject-philosophy,
subject-physical-development, subject-physical-education, subject-physical-therapy, subject-physics,
subject-reading-writing-oracy, subject-religious-education, subject-rshe-pshe, subject-science,
subject-sensory-integration, subject-social-science, subject-spanish, subject-speech-and-language,
subject-swimming, subject-theology, subject-therapy, subject-understanding-the-world,
subject-vocabulary.

**Brand decoratives / logos:** brand-arrow-small, brand-line-straight, brand-line-straight-2,
brand-shape-diamond, brand-shape-noise, brand-speech-bubble, favicon, logo-acorn-black,
logo-acorn-official, logo-full-black, logo-full-official.

## Mechanism note (Director context-economy)

Large multi-path SVGs (the wordmark/acorn logos) are NOT hand-transcribed through the Director's
context — they come byte-exact from the decode or a filesystem copy. Small glyphs are pulled via
DesignSync and XML-validated. Bulk 140-icon pre-pull through one chat context is avoided in favour
of on-demand delivery per section, so the Director's context (the scarce warm-cache resource) is
spent on coordination, not asset bytes.
