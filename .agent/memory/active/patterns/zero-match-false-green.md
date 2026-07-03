---
name: "Zero-Match False-Green"
polarity: anti-pattern
use_this_when: "Reading success from any filtered or glob-scoped tool run — a targeted test filter, a path-scoped linter, a sweep over a file set — without confirming the filter actually matched the intended targets."
category: build-system
proven_in: "Discovery-run rescued candidates C35 and C47 (2026-07-02 salvage): a targeted vitest path/name filter silently expanded to the full workspace run and reported green with zero tests matched; markdownlint-cli without --dot matched ZERO files under dot-directory paths (.agent/), printed usage, exited 0 — voiding every prior targeted .agent/** markdownlint pass."
proven_date: 2026-07-02
barrier:
  broadly_applicable: true
  proven_by_implementation: true
  prevents_recurring_mistake: "Citing a green filtered run as evidence when the filter matched nothing — the operation was vacuous, so the green certifies nothing about the intended targets."
  stable: true
---

> **POLARITY: ANTI-PATTERN.** A green run whose filter matched zero
> targets is a verdict about an empty set, not about your files.

## The failure mode

A filter, glob, or path scope silently selects nothing (or something other
than what you named), and the tool legitimately exits 0. The exit code is
honest — the operation was vacuous. Worked variants, each observed live:

- A targeted vitest path/name filter that matches no file either runs zero
  tests and reports green, or silently expands to the full workspace run —
  either way the "targeted" verdict was never produced.
- `markdownlint-cli` without `--dot` matches zero files under any
  dot-directory path (e.g. `.agent/**`), prints usage, and exits 0 — a
  structural false-green that voided every prior targeted pass over that
  tree. (Separately, its globs do not respect `.gitignore`, so the
  opposite error — linting files you meant to exclude — also occurs.)

Siblings in the same false-green family:
[`wrapped-exit-codes-false-green.md`](wrapped-exit-codes-false-green.md)
(the verdict belongs to a wrapper, not the operation) and
[`turbo-cache-false-green.md`](turbo-cache-false-green.md) (the verdict is
a replay of a past run). Here the verdict belongs to the right operation
and the right run — but the operation was empty.

## The cure

When a filtered run is load-bearing, verify the match count, never just
the exit code: read the runner's reported file/test count, require it to
be non-zero (and plausibly sized), and prefer configurations that fail on
empty selection (e.g. vitest without `passWithNoTests`). For sweep tools,
prove the filter on one known-matching file before trusting a green sweep.
