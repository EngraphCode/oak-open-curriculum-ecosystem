# POC fully integrated — project notes

## Quality standards format (important)
Whenever a quality standard appears in training content (Oak Course.dc.html), it MUST be presented in the standard format used throughout the training — never as a generic callout like "What good looks like".

Use the callout block with the `qs` codes:

```
{t:'callout', variant:'info', title:'Quality standard', qs:['QS-XXX', ...], text:"<the standard wording>"}
```

This renders with the blue border, the QS code chip(s), and a "View standard" link to `Oak Standards.dc.html#qs=...`. Find the correct QS code(s) and exact wording in `data/quality-standards.json` (685 standards). Match the content to a real QS id rather than inventing one.

## Multiple quality standards — list each individually (important)
Never synthesise several standards into one combined sentence. When a callout covers more than one standard, use the `items` array so each standard is written out verbatim as its own bullet, each with its own QS chip:

```
{t:'callout', variant:'info', title:'Quality standard', items:[
  {qs:'QS-87', text:"Explanations are framed around small steps"},
  {qs:'QS-85', text:"All key learning points are evident in explanations"}
]}
```

Each bullet's `text` must be the exact wording from `data/quality-standards.json`. Single-standard callouts keep using `qs:['QS-XXX'], text:"..."`.

## Quality standards always render as QS-chip-led bullets (important)
Every quality-standard callout — single OR multiple — must display the QS number chip at the START of each statement, as a bullet row (chip, then verbatim wording). Never render a single standard as a chip-beside-the-title with the text in a separate paragraph below. The callout logic normalises a single `qs`+`text` into the same one-item bullet list the `items` array produces, so authoring a single standard as `qs:['QS-XXX'], text:"..."` is fine and will render in the correct chip-led format automatically. Do not reintroduce the title-chip layout.
