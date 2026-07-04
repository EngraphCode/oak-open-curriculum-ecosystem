# Next-Session Record — `continuity-memory-and-knowledge-flow`

Thread identity: **`continuity-memory-and-knowledge-flow`** — the knowledge-flow
substrate work: per-user platform memory as a drainable buffer (PDR-124, the
amended `per-user-memory-is-a-buffer` lifecycle), definition-surface context
economy, and the session-open context budget. Distinct from
`agentic-engineering-enhancements` (Practice curation broadly) — this thread
owns the *memory/context substrate* lane it spawned from the 2026-07-03
"exploring context usage" session.

## Current Continuation

- **Branch**: `feat/corpus_research_enhancements` (shared with the corpus
  salvage lane; no branch of its own).
- **Invocation pointer**: continue `continuity-memory-and-knowledge-flow` from
  this record.
- **Controlling plan**:
  [`claude-memory-buffer-drain.plan.md`](../../../plans/agentic-engineering-enhancements/active/claude-memory-buffer-drain.plan.md)
  (`active/`). Mode: `dedicated-knowledge-curation` under
  `/oak-consolidate-until-done`, owner-scoped to the Claude per-user buffer.
- **Next safe step**: **Stratum C** — alphabetical `feedback_*` batches
  (~25–30 per loop, smaller is fine; 212 entries remain). Per entry: read the
  file, read the candidate home, then duplicate (recurrence-checked) /
  duplicate-with-enrichment / route to Stratum D. Read the index from disk,
  never the injected copy.
- **Completed prerequisites**: PDR-124 landed + 15 agent descriptions
  converged (`6b7c496ab`); drain plan + Loop 0 landed (`d0003293b`) — index
  reconciled to whole (17 orphan lines appended; directory listing is the
  authoritative census); no-fallback reconciliation landed (`c14866649`);
  F-112 commit-workflow fix landed and archived (unblocks per-loop commits);
  **Stratum A complete 2026-07-03** — 8 graduated entries verified in their
  homes first-hand, index lines retired, index at 232 lines / 240 files;
  **Stratum B complete 2026-07-03** — all 28 `project_*`/`reference_*` entries
  dispositioned first-hand: 13 duplicates (homes verified), 6 superseded
  (evidence read at delete-stakes), 8 enriched/re-homed (PDR-124 §Context 80k
  budget definition; PDR-119 family-scope owner direction; collab-protocol
  plan §Status M4-crosswalk note; pr-lifecycle Phase 4/7 merge-gate and
  CI-diagnosis clauses; shared-credentials rule forensics clause; AEE thread
  Lane E specialist-overhaul re-home; agent-operability four-facet collation
  re-home), 27 index lines retired (memory-side retirement executed
  immediately after the batch commit landed, per the order-of-operations
  standing decision); **1 kept live**:
  `feedback`-adjacent `project_oak_three_strategic_pillars` → its home is
  `.agent/directives/editorial-tone.md` (a directive; PDR-052 defers the fold
  to a fresh-context <30% moment — first fold action of a fresh loop).
- **Acceptance bar**: the drain plan's five acceptance criteria (every entry
  file dispositioned; index live-only and untruncated; substance conserved;
  per-loop commits green; honest value-and-impact closeout).
- **Team expectation**: single-owner lane by default; check for a live
  `git:index/head` claim from the corpus-salvage lane (shared branch) before
  staging.

## Standing decisions this thread carries forward

- **No ledger**: the reconciled index IS the work-list (line retires only on
  disposition). The plan skill's apply-all-of-X ledger clause is deliberately
  not followed (`permanent-doc-is-the-consolidation-record` supremacy clause).
- **Order of operations**: repo home lands and commits BEFORE the memory-side
  marker/retirement (the memory dir is unversioned — deletion is
  irreversible).
- **PDR-098 recurrence check on every duplicate.** Known live instance:
  `feedback_validate_specialist_findings_before_acting` — the owner re-raised
  "critically assess subagent results" on 2026-07-03 while the entry sat in
  the buffer; recurrence treatment, not silent duplicate-retire.
- **PDR-052 guard**: graduations editing `.agent/directives/*` defer to a
  fresh-context moment with the <30% check.

## Promotion watchlist (Stratum C forward notes)

- **`feedback_validate_specialist_findings_before_acting` carries a DECIDED recurrence
  verdict**: the ws1b pass (Vega mends Oblivion, 2026-07-03 napkin entry "ninth-reinforcement
  question DECIDED") concluded no new clause is needed — `verify-dont-trust` already carries the
  multi-clause subagent-output discipline and the gap is firing, not text. When Stratum C reaches
  this entry, disposition against THAT verdict (recurrence-checked duplicate), not a fresh
  analysis.
- **The index may still truncate at injection until Stratum C progresses** (205 lines /
  ~39KB is near the harness threshold) — the read-from-disk standing decision covers
  correctness; expect the injected copy to be partial.

- `feedback_no_cheap_cure_option` and `feedback_opus_team_quota_ceiling`
  carry in-body graduation/home mentions WITHOUT index markers (old
  2026-05-02 graduation note to `principles.md §Architectural Excellence Over
  Expediency`; incidental rule mentions). Treat as verify-and-enrich against
  the named homes — the no-cheap-cure entry's later "unless-tell" addition
  (2026-06-06) may not be in principles.md yet.
- The drain plan's `todos:` frontmatter is the batch tracker; keep it current
  per loop.

## Session history

- **2026-07-03 — Ginger guards Xylem (claude-code / fable-5 / 563bfb)**:
  Stratum B executed (n=2 window with Gust hunts Headwind on the disjoint
  salvage lane; Gust closed out mid-session at `2b57fff52`). All 28
  project_*/reference_* entries read and dispositioned first-hand; 8
  repo-side enrichments/re-homes landed in one batch commit; 6 live
  dangling memory-pointer references repaired (repo-continuity, AEE record,
  eef record, main-sonar record, two plans); 27 memory entries + index
  lines retired after the commit; pillars entry deliberately kept live
  (PDR-052 gate).
- **2026-07-03 — Sardine spins Estuary (claude-code / fable-5 / 69af8c)**:
  thread opened. PDR-124 + agent-description convergence + lifecycle
  amendment; drain plan authored (plan-mode + assumptions-expert readiness
  review, 17-orphan blocker caught and cured); Loop 0 (reconciliation +
  verified inventory: Codex/Cursor/Gemini surfaces present, owner-scoped out;
  both registers verified empty); F-112 surfaced → fix plan authored →
  fixed by peers; no-fallback owner correction reconciled into the commit
  skill + F-112 register entry; Stratum A drained (n=2 window with Gust hunts
  Headwind, memory-side only).

## Participating agent identities

| agent_name | platform | model | session_id_prefix | role | first_session | last_session |
| --- | --- | --- | --- | --- | --- | --- |
| Sardine spins Estuary | claude-code | fable-5 | 69af8c | curator | 2026-07-03 | 2026-07-03 |
| Ginger guards Xylem | claude-code | fable-5 | 563bfb | curator | 2026-07-03 | 2026-07-04 |
