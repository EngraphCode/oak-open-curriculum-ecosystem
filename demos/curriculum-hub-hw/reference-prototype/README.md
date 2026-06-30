# Reference prototype

`Oak-Curriculum-Hub-prototype.html` is the original HTML prototype the Next.js
workspace is ported from — bundled into a single self-contained file. Open it
in any browser; no server or dependencies needed.

**Use it as the visual reference for the port.** The search box, the
lesson / unit / thread result groups, the subject chips, key-stage tags, card
styling and Oak branding in the Next.js app all come from here.

Note: in this prototype the search runs against a small **baked snapshot**
(`data/curriculum.json`) of curriculum data, purely so the demo works offline.
The Next.js app replaces that snapshot with live `oak-search-sdk` retrieval —
that swap is the whole point of the workspace (see `../PROJECT-BRIEF.md`, §8).

The hub also includes training-course and quality-standards sections that are
out of scope for the search workspace; ignore those for this port.
