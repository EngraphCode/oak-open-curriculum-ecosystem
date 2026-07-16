# Continuity surfaces — simplification & excellence review (2026-07-16)

Owner-requested review through the principles lenses (Decision Lenses in order; Strict and
Complete; the First Question; Documentation Is Infrastructure — SSOT, no god-documents,
stable indexes point-never-carry). Review only; no changes applied. Evidence: today's
first-hand structural inventory, the invented-gate sweep's 168-assertion classification,
and the #390 restatement post-mortem. Where a surface was not read end-to-end first-hand
today it is marked UNVERIFIED-beyond-structure.

## The one-sentence verdict

The continuity ARCHITECTURE (capture → distil → graduate → enforce; self-contained
per-rotation handoff records) is sound and has survived ~10 seat rotations without
knowledge loss; the SURFACES have decayed into caches-pretending-to-be-sources, and the
cure is the same one the r2 arc just proved: authored intent stays prose, derivable state
gets generated or cited — never restated.

## Per-surface findings and verdicts

### 1. `repo-continuity.md` (608 lines) — god-document + undeclared cache. WORST surface.

Evidence: five unrelated responsibilities in one file (Current State ~227 lines; thread
tables restating `threads/*`; ~230 lines of per-topic "Next Safe Steps" narratives; an
Open Owner-Decision Items nest; invariants). A research item RETIRED 2026-06-14 still
sits under "Next Safe Steps" (line 361) a month later. The invented-gate sweep found 45
gate assertions here — the estate's largest cure-worthy mass (10 INVENTED / 6 STALE in
the classification ledger). It is multi-writer (every seat refreshes identity cells) on
the shared primary checkout — it is one of the files blocking the primary's pull today.

**Verdict — split + generate + declare:** (a) the identity/claims/thread STATE sections
become a GENERATED projection (`continuity render` from the claims registry + comms
stream + git — the `validate-patterns-index` regenerate-and-compare model; candidate
tooling-lane item); (b) authored content shrinks to intent, rationale, and pointers;
(c) any remaining cached state carries the gate-register's declared-cache banner
("recorded status here is a cache — the cited records are the truth"), which today's
sweep proved machine-distinguishable (it was the negative control, and it passed);
(d) "Next Safe Steps" narratives move to their owning thread/plan records or retire.

### 2. `director-handoff.md` (438 lines) — two documents fused; the stale-gate propagation vector.

Evidence: a durable ROLE BRIEF (L16–256 — genuinely good: the readiness gate, the
mechanical UTC liveness check, standing lessons) fused to CURRENT HANDOFF STATE
(L257–420, ~163 lines / 37% of the file) — a volatile cache that every rotation must
hand-true and that went stale repeatedly this arc (the sweep found 17 gate assertions
here, 9–10 cure-worthy; the ledger's single highest-leverage cure rewrites its
"what is owner-gated?" readiness question into the GATE TEST form). Bootstrap-read =
every new Director inherits its staleness (the sweep's headline propagation finding).

**Verdict — extract the volatile half:** the per-rotation PDR-063 handoff record ALREADY
carries live state, self-contained, single-writer, dated; CURRENT HANDOFF STATE
duplicates it and adds a second place to go stale. Delete the section; the brief points
at "the newest handoff record + the claims registry" (depend on stable identity, not
volatile prose). Apply the ledgered cures to the surviving brief.

### 3. Handoff records (`handoffs/`, 47 files) — the HEALTHIEST surface. Keep.

Single-writer, single-purpose, self-contained, naturally archival; carried ~10 rotations
plus today's compaction without loss. Two smallest improvements: a `supersedes:` line
naming exactly which cited-document statements a brief overrides (fleet-pattern 12 —
Vole's catch), and month-subdirectories before the flat dir gets unwieldy.

### 4. Napkin (1,516 lines) + `distilled.md` — right design, overdue rotation.

The capture pipeline caught everything this arc; the buffer is past rotation scale
(flagged DUE by four seats). No design change: run the queued dedicated curator session
with a frozen corpus boundary. One structural option if multi-writer contention on the
primary checkout keeps biting (it contributed to the blocked pull): per-session capture
files merged at curation — evaluate at the curator pass, not before.

### 5. `frictions-register.md` (3,258 lines) — UNVERIFIED beyond size; presumptive graduation debt.

Five times the size of the Director brief. A frictions buffer this large means capture is
working and graduation is not (PDR-011's pipeline stalls at the distil edge). Curator-pass
candidate: most content likely graduates to rules/patterns/tooling items or retires.
Verdict deferred until read.

### 6. Threads (40 records) — conflation the Walk-A priors already diagnosed.

12+ active-labelled records against 2–3 true streams (the priors' own worked instance:
"the felt chaos was a labelling failure"). Plan-corpus thread semantics are WALK A'S
decision — do not front-run it there. But the operational RECORDS can be trued to WIP
reality now: relabel to the genuinely-live set, move the rest to paused/retired with
honest one-line states, and let the Director's compaction/handoff records serve as the
one cross-plan awareness map they already are in practice.

### 7. Cross-cutting — the restatement medicine, applied to continuity

The T3 restatement-audit corpus already includes `memory/operational/**`, so Vole's fleet
will produce the instance-level ledger for these surfaces; THIS review supplies the
structural verdicts a finder fleet cannot. The planned prevention validator (c)
(gate-status cite-not-restate) already scopes `memory/operational/*.md` — landing it
makes verdicts 1(c) and 2 mechanically enforced rather than aspirational.

## What is EXCELLENT and must not be simplified away

- The mechanical UTC liveness check (a real defect-killer with a worked instance).
- The four-section PDR-063 record shape and its self-containment rule.
- The gate register's declared-cache banner — the pattern to propagate, proven
  machine-checkable today.
- The capture discipline itself: nothing of value was lost across a chaotic two-day arc;
  every loss risk found today traced to RESTATEMENT or BUFFER OVERFLOW, never to
  under-capture.

## Recommended sequence (awaiting owner word; no changes made)

1. Extract CURRENT HANDOFF STATE from `director-handoff.md` (smallest cut, biggest
   propagation-vector kill) + apply its ledgered cures.
2. Land prevention validator (c) (already planned) → verdicts become enforced.
3. `repo-continuity.md` split: generated-state section (tooling item: `continuity
   render`) + a small authored-intent core + declared-cache banners; retire dead
   "Next Safe Steps" narratives into their owning records.
4. The queued curator session absorbs napkin rotation + frictions-register graduation.
5. Thread-record relabelling to WIP truth (operational tier only; plan-corpus semantics
   wait for Walk A).

— Mussel rides Coral (6f8857), sitting Director, team Mango
