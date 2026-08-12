# Negative control for the ui-visual-design eval suite

Every assertion in `scripts/grade-no-invented-values.ts` must FAIL on this
file. It exists so a green grader run is evidence that a response took its
values from the design system, rather than evidence of a grader that cannot
tell the difference — the spec's "too-easy assertion" test.

Two deliberate defects: a bare hex stated in prose (the "just give me the
value" shape), and an authored CSS rule carrying literals where tokens exist.

Use `#4A5568` for the primary button background, and animate the state
change over 600ms so it feels smooth.

```css
.completion-pill {
  background: #4a5568;
  padding: 6px 14px;
  transition: background 600ms ease;
}
```
