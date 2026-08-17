---
name: cut-coordination-branch
classification: active
description: Cut or name a coordination branch with the collision-safe sha6 suffix, minted by the agent-tools coordination topic. Use whenever a coordination branch is created — at the fold ceremony's successor cut, or any seat opening a coordination surface — and never hand-transcribe the name.
---

# Cut Coordination Branch

## Why the name has a suffix

Coordination branches are named `coordination/<UTC date>-<sha6>`, where
`sha6` is the first six hex characters of the base commit the branch is
cut from. The suffix is deliberate owner policy (2026-08-17, restated at
the convention break that motivated this skill): this is a real repo
with many live checkouts, and a date-only name lets two checkouts mint
the SAME branch and collide silently. The sha suffix makes a checkout
cutting from a different tip mint a different name instead. It also
disambiguates same-day rotations and makes the lineage walkable from
names alone — each fold's successor carries the fold-merge commit that
birthed it (`…-ca6b0f → …-c8586f` in the 2026-08-13 chain).

## The mechanism

Mint the name with the tool — never by hand, never from memory:

```bash
pnpm --silent agent-tools coordination successor-name
```

It prints `coordination/<today UTC>-<sha6 of origin/main>` and nothing
else (pass `--base <ref>` to cut from another commit; an unresolvable
ref is a typed refusal). Cut tree-preserving and publish:

```bash
git fetch origin main
git switch -c "$(pnpm --silent agent-tools coordination successor-name)" origin/main
git push -u origin HEAD
```

## When this fires

- The [coordination-fold ceremony](../coordination-fold/SKILL-CANONICAL.md)
  step 9 — the successor cut after the fold merge.
- Any seat creating a coordination branch outside the ceremony
  (recovery after a broken rotation, a parallel coordination surface).

## Failure the mechanism prevents

The convention previously lived only in continuity records while the
fold skill named a different form; the first seat to read the skill
literally minted an unsuffixed name (2026-08-17, frictions register
F-161). A convention that must be transcribed is vigilance; this skill
plus the tool make it structure.
