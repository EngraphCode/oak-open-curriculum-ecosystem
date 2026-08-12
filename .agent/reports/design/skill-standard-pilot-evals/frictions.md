# Eval iteration 1 — frictions

Harvest material for the skill-craft skills the parent plan names as a WS9
candidate (skill-design, skill-writing, eval-design, eval-running). Recorded
at occurrence during the first execution of the estate's eval convention on
`design-system-usage` and `ui-visual-design`, 2026-08-12. Each entry is what
actually got in the way, not a retrospective tidy-up.

## The estate's classifier is workspace-bound, not a library

`demos/oak-design-showcase/tools/css-literal-values.ts` is a pure classifier
and exactly the right thing for an eval grader to reuse — but it lives inside
a demo workspace, so a grader in the skills tree reaches it through a seven-
segment relative import. It works, and it is the right call over re-deciding
what counts as a literal, but the path is fragile to any move of either end.

*Route:* WS8-general. The classifier wants a home a grader can import by
package name.

## `validate-authored-css` cannot grade an arbitrary file

The repo's authored-CSS gate walks a fixed workspace root. An eval needs to
grade one page at a path chosen at run time, so the gate could not be invoked
directly — only its classifier could be reused. The plan's grounding named
`validate-authored-css` as a grader that exists; the accurate statement is
that its *classifier* exists and its *walker* is workspace-bound.

*Route:* WS8-general, alongside the entry above. A `--path` mode on the
validator would make the gate and the eval the same instrument.

## Assertions pass vacuously unless a negative control is built

`grade-theming.ts` returned green on the reference `ThemeSwitcher` with the
evidence "data-theme values written: none" — a true pass, but one that would
have read identically if the detector were broken. Both suites now ship a
negative control fixture that every assertion must fail, and iteration 1
records that run. Without it the green runs prove nothing.

*Route:* this is a standard clause candidate, not a machinery gap — an eval
suite without a negative control is not evidence.

## The identity ratchet fires on moved text, not just new text

Re-homing reference substance out of the skill entry moved a line naming a
counter-brand into a new file, which the identity-naming ratchet correctly
read as a new occurrence of the outgoing identity. The re-home was reshaped
so the named line stays in the entry. A pure move of existing prose can trip
a content ratchet, and the failure arrives at commit time rather than at
authoring time.

*Route:* worth a line in the skill-writing skill — when re-homing substance,
check content ratchets before the gate does.

## The without-skill leg needs an explicit no-reading constraint

A clean-context subagent given a repo path will go and read the repo, which
destroys the comparison. The leg had to be told, as a hard constraint, not to
read anything under the repo root and not to "help" by finding project
documentation. This is a deviation from the spec's blind comparison — the
legs are blind to each other, but the without-skill leg is ungrounded by
instruction rather than by sandbox.

*Route:* eval-running skill. The honest form of "without skill" needs a
sandbox, not a promise.

## Case 3's temptation prompt has no artefact to grade

Cases (a) and (b) produce files a script can grade. Case (c) — the ad-hoc-CSS
temptation — produces a *response*, and its assertion ("zero ad-hoc rules") is
only mechanically decidable if the response is captured to a file first. The
grader handles fenced CSS blocks in prose for exactly this reason, but the
run shape for a response-only case is different from a file-producing case
and the convention does not currently distinguish them.

*Route:* eval-design skill — response-shaped cases and artefact-shaped cases
need different run instructions.
