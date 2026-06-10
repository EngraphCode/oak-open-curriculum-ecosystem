---
fitness_line_target: 220
fitness_line_limit: 300
fitness_char_limit: 18000
fitness_line_length: 100
drain_strategy: "Extract settled entries to permanent docs, PDRs, rules, or archived napkins"
merge_class: append-only-narrative
fitness_content_role: drainable-buffer
---

## Session: 2026-06-09 — napkin rotated (Fruited Twining Canopy curation pass)

Rotated the 2026-06-08 → 2026-06-09 window during a dedicated knowledge-curation
pass. The processed window is preserved verbatim at
[`napkin-2026-06-09-fruited-curation.md`](archive/napkin-2026-06-09-fruited-curation.md).
Every behaviour-changing lesson was verified live in a permanent home before
rotation — type and markdown gotchas in the governance docs, the
fitness-threshold derivation principle in ADR-144, the status-surface-recompute
sharpening in `verify-dont-trust`, and the sweep-the-defect-class and
landed-invariant lessons in `distilled.md`. Fresh capture continues below.

## 2026-06-09 — graph-tools readiness session (Fragrant Spreading Sapling, 47f78a)

Readiness session: seam analysis → owner ratifications → R1/R2 → DECISION-COMPLETE (PR #143 + a
stacked PR). Four captures:

- **An inherited Step-0 recommendation is a hypothesis, not a plan.** I proposed the plan's own
  recommended surface/graph split to the owner verbatim; owner: "too crude, find the real
  membranes". The cure that worked: derive decomposition from dependency + solution-class +
  surface-cohesion analysis, then ratify. The document's own seam enumerations disagreeing (A5/B1
  contradictions) was the tell the split was never analysed. Sibling of [[premature-crystallization]].
- **Ground a tool's provenance class before designing its redesign.** The plan's keywords unit
  rested on a false belief (bulk-corpus) refuted by a 30-second check: `AGGREGATED_HANDLERS`
  membership + the generated tool file (`/keywords` GET, live API, params already present). An
  owner-directed scope addition (2026-06-08) carried the stale belief in; the readiness review
  caught it. Reflex: for any MCP tool, check generated-vs-aggregated dispatch + data provenance
  (live vs corpus) FIRST.
- **Audit my own verification filters, not just reviewer claims.** barney said "exactly six"
  factory importers; betty said the EEF tool was a seventh (blocking). My first-hand grep refuted
  betty (comment-only refs) — but my grep carried `-v .test.ts`, which hid the factory's own unit
  test as a REAL seventh importer that assumptions-expert later caught. Both halves fired: a
  blocking reviewer claim refuted by evidence AND my refutation-grep's exclusion filter audited.
  Sibling of [[feedback_validate_specialist_findings_before_acting]].
- **A contract change makes every calling prompt-step a data-flow rewrite, not a reference swap**
  (R2/mcp-expert's substantive catch): zero-arg → required-anchor tools mean prompt steps must
  thread the anchor from the preceding workflow step, or the prompt instructs invalid calls.
  "Repoint" language hid the gap; the plan now pins anchor-threading rewrites,
  correct-at-every-commit.

## 2026-06-09 — proportionality on routing an already-doctrined instance (Fruited Twining Canopy)

Curating, I circled the "derive-don't-drift listing" lesson — standalone distilled
entry vs pattern file vs memory corollary — longer than its value warranted. It was
plainly an instance of the existing `derive-dont-bridge-controlled-surface` doctrine;
the proportionate move was a one-line corollary to that doctrine's home. Sharpened
default: **an instance of existing doctrine → one-line corollary to that doctrine's
home, then move on.** Routing deliberation scales to novelty, not to thoroughness for
its own sake. Instance of [[feedback_stay_with_stated_scope]].

## 2026-06-09 — two curation-discipline catches in a shared-tree window (Fruited Twining Canopy)

- **A napkin rotation on a shared working tree can archive a peer's just-committed
  lesson without graduation-processing it.** A peer committed a planning-discipline
  lesson into the napkin AFTER my read but BEFORE my rotation. My `cp` archive caught
  it verbatim (conserved), but my graduation pass — working from my earlier read —
  never saw it, so it was archived un-homed; the rotation marker's "every lesson
  homed" claim was false until I diffed the archived window against my read and
  graduated the peer's lesson to `distilled.md`. Reflex: in a multi-agent window,
  `git log -p` the napkin (or diff archive vs your working read) BEFORE asserting the
  rotation homed everything. Sibling of the "staging a file holds another agent's
  work" lessons.
- **I asserted a convenient "it's an unwrappable table" to justify not-chasing a
  width-critical; grounding the checker source falsified it.** The practice-fitness
  prose-width metric measures ONLY `kind === 'prose'` lines — `markdown.ts` classifies
  code-fence / code-block / table / link-reference / frontmatter as non-prose and
  excludes them, and `measurableProseWidth` strips inline-link / autolink / bare-URL
  targets (`evaluate.ts:95`, `markdown.ts:1-120`). So a width hard/critical points at
  genuine over-long PROSE to reflow; it is NOT tripped by tables or link-heavy lines
  (already discounted). The convenient claim made the not-chase tidy — exactly
  [[feedback_ground_convenient_claims]]; grounding before asserting is the cure.
