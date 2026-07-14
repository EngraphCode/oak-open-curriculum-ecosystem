---
fitness_line_target: 120
fitness_line_limit: 180
fitness_char_limit: 12000
fitness_line_length: 100
drain_strategy: "Extract settled entries to permanent docs (ADRs, PDRs, governance, READMEs, patterns)"
merge_class: curated-learning-register
fitness_content_role: drainable-buffer
fitness_rationale: >-
  Lowered 2026-05-25 after owner-requested processing through `oak-consolidate-docs`.
  The active file carries the conservation role and graduation pointers.
  Falsifiability: if a napkin rotation adds high-signal learning that has no
  stable permanent home, preserve it first and revise the envelope by substance
  rather than trimming the lesson.
---

# Distilled Cross-Session Lessons

A brief staging surface for cross-session lessons between a napkin rotation and
their promotion to a permanent home. An entry lands here only when a rotation
surfaces a lesson that is not immediately homed; it is **promoted on the next
consolidation by judgment** — to a `patterns/` file, a rule, a PDR/ADR, or a
governance doc.

**Promote on the first instance.** We do not hold a lesson here waiting for a
second sighting; we promote it and trust the Practice to invalidate a wrong
promotion through experience (owner direction, 2026-06-27). A lesson sitting in
this buffer does not fire when the next agent needs it — graduation is the whole
point. Apply judgment about *which* home, not about *whether* the lesson has
earned promotion.

New napkin rotations append below; the next consolidation promotes them out.

<!-- Buffer drained empty at the 2026-07-06 dedicated consolidation (Zenith wakes
Perigee): every entry of the 2026-06-29→07-06 window was graduated to a verified
permanent home or confirmed already-homed. The commits and the homes are the
record. -->

## Landing-containment checks are substance-probes against current main (2026-07-14, Quasar mends Umbra)

Two verification methods produced FALSE orphan/loss verdicts in one closeout, and the same
day produced two REAL silent losses that a weak check had previously blessed:

- `git diff origin/main...<sha>` (three-dot) compares against the MERGE-BASE — content that
  landed on main after the base reads as "missing". Containment questions need a two-dot
  content check (`git show origin/main:<path>` diffed, or a direct grep of main's blob).
- Exact-line greps/diffs are line-wrapping-sensitive: formatter rewrapping makes present
  content look absent. Probe for several distinctive SHORT phrases (substance-probes) and
  judge on the set.
- The inverse failure is real too: PR #376's BEHIND auto-update silently dropped a napkin
  entry and a handoff refresh that "looked merged" — after ANY merge/update event, verify
  each load-bearing surface's content actually reached main, by substance-probe.

Routing: pending-graduations candidate (rule amendment to `verify-dont-trust` or a sibling
rule) captured 2026-07-14; graduate at the next consolidation.
