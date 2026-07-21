# Delivery-plan template (V0)

One page. Copy, fill, delete the guidance comments. The frontmatter must
pass `validate-plan-corpus` (the V0 contract); the body carries the
narrative (PDR-018: end goal, mechanism, means — never in frontmatter).

```markdown
---
id: <kebab-slug, stable forever>
node_type: plan
name: <Human name>
overview: <One line: what this delivers.>
kind: executable
serves_strategic_choice: <ID from docs/strategy, or "pending">
thread: <thread-slug>
last_updated: <YYYY-MM-DD>
depends_on:
  - plan: <plan-id>
    kind: blocking | beneficial
todos:
  - id: <slice-slug>
    content: "<Slice — one sentence.>"
    status: pending
---

# <Name>

## Goal

<The end state, one short paragraph. What is true when this is done that
is not true now.>

## Acceptance (falsifiable)

Each item states its evidence class:

- `repo-safe` — provable inside the repository (a test, a validator run,
  a CI check); cite the instrument.
- `owner-held` — provable only with owner-held access (a production
  console, an external dashboard); name who verifies and where the
  verification is recorded.

## Slices

Each slice is a single-story PR carrying its PDR-132 round-budget class
(default ≤2 review rounds; name the budget if it differs and why).

## Decision gates (dated)

Owner decisions this plan waits on, each with the date it was asked and
the date it needs an answer by. No open-ended gates (V0 §3.4).

## Out of scope

Explicit. What a reasonable reader might assume is included but is not,
each with one clause of why.
```
