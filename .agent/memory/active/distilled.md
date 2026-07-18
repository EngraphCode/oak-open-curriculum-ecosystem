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

## 2026-07-17 — Foundry guards Vapor (72fa18): two behaviour-changing lessons from the AIP-131/127 arc

- **Stale-capture-wins merge class.** A branch that CAPTURES working-tree copies of files
  can silently REVERT newer approved versions on main: if main's newer version was already
  in the merge base, `git merge origin/main` completes clean and the capture's stale copy
  wins — no conflict ever fires. Three Director-approved refounding finals were rolled
  back this way on the estate branch, caught only by reviewer byte-comparison. The check,
  before merging or PR-ing any capture branch: for every captured file, probe a few
  distinctive marker substrings of main's CURRENT version against the capture copy; a
  missing marker means the capture predates main's evolution and must be re-based on
  main's version (re-applying only the capture's genuine additions). Routing: pattern
  candidate at the next dedicated consolidation (single instance suffices per PDR-100;
  the worked instance and the check recipe are in the 2026-07-17 napkin entries).
- **Substance-probes are the conservation check; diffs are not.** Twice today (Zodiac's
  #398, June's #402) "is this content conserved?" was settled in minutes by grepping 3–5
  distinctive phrases per hunk against the content's CURRENT home — where a whole-file
  diff screamed false-loss because the home had evolved (re-wording, re-homing,
  corrections). Third seat-independent instance of the class (Quasar's false-orphans
  2026-07-14, Mussel's pagination blindness 2026-07-16). Graduation-ready: fold into a
  verification-methods pattern at the next dedicated consolidation.

## 2026-07-18 — Petrel calls Aether (d4f4b7): enforcement mechanisms carry no escape hatches

- **No escape hatches, ever — and examine the impulse to offer one.** Designing the
  AIP-128 ticket-first branch gate, I offered the owner a menu of hotfix bypass shapes.
  Owner verbatim: **"there are no escape hatches, examine the source of the question, we
  are never in such a rush that doing things badly is a good idea."** The lesson has two
  layers: (1) an enforcement mechanism must not ship with a bypass surface — urgency never
  licenses degraded practice, and the refusal message teaches the correct path (mint the
  ticket) rather than naming an override; (2) the impulse to design a valve is itself the
  signal to examine — it imports a rush-assumption the estate rejects. Coheres with the
  2026-07-15 "no-risk-of-loss operations are absolute" ruling (pending-graduations): the
  value of a discipline is its absoluteness. Routing: pending-graduations candidate
  (principles.md §First Principle worked-instance or a rule clause via
  new-rule-vs-pdr-clause) at the next dedicated consolidation; owner verbatim + context in
  the 2026-07-17 napkin entries.
