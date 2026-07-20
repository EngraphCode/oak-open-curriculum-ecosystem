---
name: Verification Method Must Answer the Question
polarity: anti-pattern
use_this_when: About to declare content conserved/absent/landed, a capture branch safe to merge, or a review surface fully read, on the strength of a diff, grep, or bounded API read
category: process
proven_in: .agent/memory/active/napkin.md (2026-07-14 false-orphan retractions; 2026-07-16 pagination blindness; 2026-07-17 substance-probe adjudications; 2026-07-20 omission-blind licence review)
proven_date: 2026-07-20
barrier:
  broadly_applicable: true
  proven_by_implementation: true
  prevents_recurring_mistake: "Trusting a verification method that answers a DIFFERENT question from the one at stake — false-loss verdicts from whole-file diffs, false-orphan verdicts from merge-base diffs, false-complete verdicts from unpaginated reads, false-sound verdicts from presence-only checks"
  stable: true
---

> **POLARITY: ANTI-PATTERN.** This entry names a failure shape to avoid:
> content-conservation and completeness verdicts issued by methods that answer
> a different question. The cures are the paired positive moves below.
>
> See [`patterns/README.md` § Polarity](README.md#polarity-required-every-pattern).

## Failure shape

At landing boundaries (merges, closeouts, adjudications, reviews), a seat
asks "is this content conserved / absent / fully read?" and answers it with
an instrument that measures something else. Recorded instances, each a
different costume of the same class:

- **Whole-file or exact-line diffs scream false-loss** when the content's
  home has evolved (re-wording, re-homing, prettier re-wrapping): two
  false-orphan verdicts retracted in one session (2026-07-14).
- **A three-dot diff (`git diff base...sha`) compares against the
  MERGE-BASE**, not current main — content landed after the base reads as
  absent.
- **A capture branch's stale copy silently WINS a clean merge** when main's
  newer version was already in the merge base — no conflict fires, and
  approved work is reverted invisibly (three Director-approved finals rolled
  back, caught only by byte-level review, 2026-07-17).
- **A bounded list read declares completeness**: `reviewThreads(first:100)`
  left six unresolved threads on page two invisible to every merge ceremony
  on a 134-thread PR (2026-07-16); a REST tail-slice missed a tip-bound
  review and got a READY refuted (2026-07-20).
- **Presence/consistency checks are blind to omission defects**: a licence
  review that greps for what IS recorded cannot see a missing obligation
  (the licence text a font's own licence requires to ship) or a missing
  sibling-removal instruction — both passed a grep sweep AND a reviewer
  SOUND verdict (2026-07-20).
- **Checking a different surface from the claimant**: a disk `find`
  "refuted" a reviewer's missing-files claim — the files existed on disk but
  were untracked; the reviewer was reading the PR tree (2026-07-20).

## Cures (each answers the actual question)

- **Substance-probes over diffs**: grep 3–5 distinctive short phrases per
  hunk against the content's CURRENT home. Settles conservation in minutes
  where diffs mislead.
- **Marker-probe capture branches before merging**: for every captured file,
  probe distinctive substrings of main's CURRENT version against the capture
  copy; a missing marker means the capture predates main's evolution and
  must be re-based on main's version, re-applying only genuine additions.
- **Paginate to exhaustion or compare against `totalCount`** on any list
  read backing a gate; "all verified" claims are instrument-relative — check
  the window before the verdict.
- **Check obligations, not just presence**: sweep sibling-removal
  instructions and the asset's own contract obligations (licence conditions,
  schema requirements, API contracts) alongside internal consistency.
- **Check the same surface the claimant checked** before refuting a claim.

The connecting discipline: before trusting any verification verdict, name
the question the method actually answers, and confirm it is the question at
stake.
