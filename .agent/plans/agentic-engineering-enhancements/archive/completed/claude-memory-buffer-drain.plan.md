---
name: "Claude Per-User Memory Buffer Drain"
status: completed
overview: >
  Dedicated-knowledge-curation pass draining the Claude Code per-user memory
  buffer (240 entry files plus a truncated 223-line MEMORY.md index) into
  repo doctrine homes, executing the backlog behind PDR-124 (definition-surface
  context economy) and the amended per-user-memory-is-a-buffer lifecycle
  (index-line retirement on graduation). Owner-directed 2026-07-03: doctrine
  landed in the morning session; this plan runs the drain.
lineage:
  serves_thread: continuity-memory-and-knowledge-flow
  serves_stream: agent operating substrate / knowledge-flow discipline
  strategic_choice: >
    per-user platform memory is a buffer with a drainage contract, never an
    accumulator (per-user-memory-is-a-buffer; PDR-124)
  derives_from: >
    PDR-124-definition-surface-context-economy.md; the amended
    per-user-memory-is-a-buffer rule; owner direction 2026-07-03
    ("exploring context usage" session, Sardine spins Estuary)
todos:
  - id: loop-0-setup
    content: Land plan, reconcile work-list (17 orphans), verified inventory, fitness snapshot
    status: completed
  - id: stratum-a-graduated
    content: Verify and retire the already-marked-graduated entries (8 verified in homes, lines retired 2026-07-03; index 232/240)
    status: completed
  - id: stratum-b-project-reference
    content: Disposition 25 project_* and 3 reference_* entries (done 2026-07-03 — 27 retired; 13 duplicates verified in homes, 6 superseded at delete-stakes, 8 enriched/re-homed; 1 kept live pending the PDR-052-gated editorial-tone fold)
    status: completed
  - id: stratum-c-feedback-batches
    content: "Feedback duplicate/enrichment batches, alphabetical — COMPLETE 2026-07-05 (Hedgehog stirs Rime): C-1 46ff52892 + 8f788c837; head fold b21bafa39; loops C-2..C-15 through d3e1b6fed; the nine PDR-052-deferred directive folds at e8b3eb986 (incl. the owner-working-style extraction to executive memory); loops C-16..C-25 (74eaecd6b, d39bd05bc, 04fe9944c, 5447a3e82, 3ec41b8ed, aba5b72cd, 2450e36ee, 645a10b8b, 0f2c7df99, 46b50e24e). All 212 feedback_* files dispositioned; index at 12 live-only lines mapping one-to-one to the ROUTED-TO-D/DEFERRED set; final orphan reconciliation exact"
    status: completed
  - id: stratum-d-novel-doctrine
    content: "COMPLETE 2026-07-05 (Hedgehog stirs Rime), five commits: user-collaboration split_strategy + its deferred fold set at 7f4988c63 (owner-signal-interpretation.md is the new executive-memory companion); principles.md §Decision Lenses fold at b10d90dc0; the design-agency rule unit authored as design-from-impact-not-the-cowpath at 35cf09bf9 (four entries; attribute-system-properties-to-the-system clause included); the intent-and-mechanism doctrine at b839fe03d (mechanism-without-legible-intent pattern with the eight assertions as ADR-200 intent-layer seed; PDR-038 bidirectional amendment; owner-working-style retired per the owner's 2026-07-05 reframe); the final four dispositions at 7d424cc9d (crosswalk + derive-controlled-surface patterns; build_vs_buy into the plan skill + invoke-code-experts; graphs_as_method into ADR-173 §The estate is plural by design, cited by OQ-10). Batches 1-2 docs-adr-expert-reviewed pre-commit; batches 3-4 independently grounded first-hand after the reviewer died on the org monthly spend limit (the sanctioned classifier-unavailable fallback)"
    status: completed
  - id: closeout
    content: "COMPLETE 2026-07-05: final census exact — 212 feedback_* files all carry terminal line-anchored markers across three marker generations (Disposition / DUPLICATE-family / Retired-from-index), 21 project_*/reference_* files carry Stratum B retirement markers, zero unmarked, zero live ROUTED-TO-D/DEFERRED; MEMORY.md at zero lines, live-only and untruncated. Verdict in §Closeout"
    status: completed
---

# Claude Per-User Memory Buffer Drain

**Mode**: `dedicated-knowledge-curation` under `/oak-consolidate-until-done`.
Bridge statement: fitness output is routing evidence only; the value is
conserving each entry's insight into its highest-impact home; completion
requires real item-level disposition of every entry, never a softer index or a
smaller file.

**Buffer**: `~/.claude/projects/<this-repo's-project-slug>/memory/` — 240
entry files (~600KB; 212 `feedback_*`, 25 `project_*`, 3 `reference_*`) plus
`MEMORY.md` (223 lines, harness-truncated at load). **17 entry files have no
index line** (verified 2026-07-03): the directory listing is the authoritative
work-list; the index is the self-tracking view, made whole at Loop 0 and
re-reconciled every loop close.

**Scope (owner-ratified via plan approval, 2026-07-03)**: this buffer plus
whatever the drain routes into — a candidate this pass routes to
`pending-graduations.md` is decided in the same pass, never left as an
undecided register entry. Non-goals: open-questions drain, napkin rotation,
comms rotation, Codex/Cursor/Gemini sweeps — their inventory status is
recorded below, verified not asserted.

## Binding doctrine

- **First-hand only**: every entry and every candidate home read by the main
  agent; subagents never make dispositions.
- **Never trim**: the only cures are homing and honest rejection with reason.
- **No ledger** (`permanent-doc-is-the-consolidation-record`): the reconciled
  index is the work-list — a line retires only when its entry is dispositioned.
  The plan skill's "apply-all-of-X disposition ledger" clause is deliberately
  not followed: that rule states a skill instruction mandating a ledger "is
  itself the anti-pattern; the instruction is not license". Do not "fix" this
  back into a ledger.
- **Index operations are disk reads only** — never the session-injected copy,
  which is truncated at load (the defect being cured).
- **Order of operations** (memory dir is unversioned): land the repo home →
  commit → then mark the entry file / retire the index line. Memory-file
  deletion is irreversible → supersession evidence is read and cited before
  any deletion.
- **new-rule-vs-pdr-clause classifier** before authoring any doctrine home:
  pattern file > existing-PDR clause > existing-rule clause > new rule > new
  PDR.
- **PDR-098 recurrence check** on every duplicate; live instance in hand: the
  owner re-raised "critically assess subagent results" on 2026-07-03 while
  `feedback_validate_specialist_findings_before_acting` sits in this buffer —
  that entry gets the recurrence treatment, not a silent duplicate-retire.
- **PDR-052 guard**: graduations editing `.agent/directives/*` defer to a
  fresh-context moment with the <30% check (`.agent/rules/` files are not
  directives and land normally).
- **PDR-003/PDR-104**: Core/PDR amendments main-agent-only, best-effort
  authored, surfaced through the normal review flow.
- **Deferral honesty (PDR-026)**: an undecided entry carries a named
  constraint plus falsifiability and stays visible as a live index line.

## Execution strata (cheap → expensive)

- **Stratum A** — already-marked graduated (~9 files): read entry, read the
  named home, verify substance live (pre-archive verification gate), ensure
  file marker, retire index line.
- **Stratum B** — `project_*` / `reference_*`: stale state → verify
  supersession then delete or re-home the still-true kernel as
  pointer-and-check into `repo-continuity.md` / thread records; live state →
  pointer-form re-home; reference pointers → fold into the home where they
  fire.
- **Stratum C** — `feedback_*` (bulk): alphabetical batches of ~25–30 (an
  upper estimate — smaller realised batches are the mechanism working, not
  failure). Per entry: read file, read candidate home, then duplicate
  (recurrence-checked) / duplicate-with-enrichment (fold the sharper substance
  into the home — non-deferrable graduation work) / route to Stratum D.
- **Stratum D** — genuinely novel: classifier-routed doctrine authoring;
  docs-adr-expert on each doctrine batch before its commit.

**Loop close (every loop)**: markdownlint + `/oak-commit` the repo-side batch
(explicit pathspec; memory/state files commit whole) → update memory-side
files and delete retired index lines (minimal deletion, never a rebuild;
descriptions edited only for entries dispositioned this loop) → fresh disk
re-read + orphan reconciliation → context check; if the session cannot
complete another batch, write the session-handoff opener naming the next
batch and end cleanly.

## Loop 0 inventory (verified 2026-07-03, this session)

- Orphan reconciliation: RUN AT EXECUTION — see status below.
- `open-questions.md`: verified empty (0 `Q-` entries; file states "currently
  empty").
- `pending-graduations.md`: verified empty (no live inline-bracket entries).
- Napkin: live, owned by its own rotation pass (not in scope).
- Codex/Cursor/Gemini surfaces: RUN AT EXECUTION — see status below.

## Stratum C completion rulings (decision-complete, owner-directed 2026-07-04)

The next dedicated session's goal is **Stratum C complete**: every remaining
`feedback_*` entry (C-2 onward from
`feedback_artefact_annotation_is_not_rationale.md`) dispositioned, including
the watchlist items below. The rulings here remove every known judgment call
so the session executes without re-analysis or owner round-trips.

Pre-decided here is the ANALYSIS only, never the verification:
first-hand-only still applies in full — the session reads each named home
itself before marking (the fold edit, the `verify-dont-trust` read, the
`start-right-team` §3 read). All "verified … 2026-07-04" notes below are
plan-author-time routing evidence; the session's own read at execution time
is the disposition's verification, and if a home has moved since 2026-07-04
the session verifies the substance wherever it now lives rather than
stalling.

- **Session shape**: loop-by-loop per the Loop close above; a context
  summarisation/compaction boundary does not end the goal — re-ground by
  reading, in order: (1) this plan (§Binding doctrine and this section),
  (2) the thread record
  `.agent/memory/operational/threads/continuity-memory-and-knowledge-flow.next-session.md`
  §Current Continuation, (3) a fresh disk listing of the memory directory
  plus `MEMORY.md` (never the injected copy). The resume point is the
  alphabetically-first `feedback_*` file carrying neither a disposition
  marker nor a routed-to-D note; per-loop commits make everything before it
  durable. If the session is
  genuinely forced to end early, the standing loop-close handoff applies and
  the completion goal carries to the immediate successor unchanged — the goal
  is never re-scoped downward.
- **Directive-target folds run at the session head.** One is already known:
  fold the *unless*-tell (2026-06-06 — an "unless you'd rather…" clause
  appended to an answer the principle has already forced, reopening it as a
  trade-off; when excellence has forced the answer there is nothing to
  surface, only something to settle) into
  `principles.md` §Architectural Excellence Over Expediency, verified absent
  2026-07-04. Execute it as the first post-grounding action (PDR-052; the
  pillars-fold precedent `46ff52892`), then disposition
  `feedback_no_cheap_cure_option` as duplicate-with-enrichment. Any further
  directive-target enrichment discovered mid-session defers to the next
  fresh-context boundary, or to the immediate successor's head with a live
  index line (deferral honesty) — never edited under context pressure. "Next
  fresh-context boundary" means the first subsequent moment that passes the
  PDR-052 <30% check (a post-compaction re-grounding qualifies if it passes);
  if no such moment occurs before session end, the successor's head takes it.
- **`feedback_validate_specialist_findings_before_acting`**: recurrence-checked
  DUPLICATE against `verify-dont-trust`'s multi-clause subagent-output
  discipline, per the ws1b DECIDED verdict (2026-07-03, Vega mends Oblivion:
  no new clause; the gap is firing, not text; a ninth restatement is the t6
  self-referential trap). Read `verify-dont-trust` first-hand as for any
  duplicate; cite that verdict in the marker; do not re-run the recurrence
  analysis.
- **`feedback_opus_team_quota_ceiling`**: expected duplicate of
  `start-right-team` §3's seat-cost discipline (name the seat cost;
  fold-check on high seat count; cheaper sub-agent routes), verified
  substantively present 2026-07-04. Residual check: the
  Sonnet-default-for-reviewer-subagents point — verify
  `.agent/memory/executive/invoke-code-experts.md` carries it; enrich there
  if absent.
- **Routed-to-Stratum-D is not a terminal disposition**: the entry file gains
  a routed-to-D note, and its index line STAYS LIVE for the D pass.
- **C-complete acceptance**: every `feedback_*` file on disk carries either a
  disposition marker (duplicate / duplicate-with-enrichment /
  rejected-with-reason) or a routed-to-D note; index lines retired for every
  dispositioned entry; per-loop commits green; the orphan reconciliation
  (line-less files all marker-verified) re-run at the final loop close.

## Acceptance criteria

1. Every one of the 240 entry files (directory listing is the authoritative
   census) dispositioned: graduated (home read back), duplicate (home
   verified), or rejected-with-reason.
2. `MEMORY.md` holds only live entries and loads untruncated (well under the
   ~200-line/40KB truncation point).
3. No substance lost: every graduation's home read back before its line
   retired; enrichments visible in the homes' diffs.
4. Repo-side changes in per-loop commits with green gates.
5. Closeout reports value and impact with an honest verdict (`complete` /
   `partial slice landed`); no counts, no ledger, no before/after fitness
   tables.

## Risks

Context exhaustion (per-loop commits + self-tracking index + handoff opener);
peer agents on the branch (advisory claim; memory/state files commit whole;
semantic-merge on divergence); Stratum-D scope balloon (classifier prefers
cheap homes; PDR-sized stragglers keep live index lines with
deferral-honesty); concurrent auto-memory writes (fresh disk re-read before
every index edit); irreversible memory deletions (supersession evidence read
at delete-stakes).

## First-principles check

`plan-body-first-principles-check` fires before each stratum's first batch and
before any Stratum-D doctrine authoring: re-verify the entry's claim against
the current repo — rules and PDRs may have moved since capture.

## Closeout (2026-07-05, Hedgehog stirs Rime)

**Verdict: complete.** Every entry file in the buffer is dispositioned
first-hand and the index is empty, live-only, and untruncated. The drain's
value landed in three shapes: (1) **conserved doctrine** — every entry's
insight is in a permanent home (directive fold, rule, pattern, PDR clause,
ADR section, skill clause, or executive-memory card) or honestly rejected
with reason, with the home read or authored first-hand at disposition; (2)
**structural doctrine the drain itself generated** — the
intent-and-mechanism-are-co-equal frame (owner-ratified 2026-07-05) became
PDR-038's bidirectional amendment, the mechanism-without-legible-intent
pattern, and the design-from-impact rule's
attribute-system-properties-to-the-system clause, with the eight
working-style assertions re-expressed as ADR-200 intent-layer seed
statements; (3) **a proven buffer lifecycle** — the
per-user-memory-is-a-buffer drainage contract ran end-to-end (index as
work-list, per-loop commits before memory-side retirement, line-anchored
multi-generation marker census), and the buffer is ready to accrete again.
Impact is honest: the doctrine homes are landed and gate-checked, but the
generative-intent cure direction (the ADR-200 intent layer) is seeded, not
built — that work belongs to the ADR-200 rewrite and the OQ-10 authoring
session, not to this plan.

## Lifecycle

Completion runs the consolidation closeout (this plan IS a consolidation
pass); the plan then archives to `../archive/completed/` with its knowledge
already in permanent homes (a completed plan is safe to delete). Quality
gates: `pnpm markdownlint-check:root` per loop; commit hooks are the blocking
tier; `pnpm practice:fitness:informational` is signal only.
