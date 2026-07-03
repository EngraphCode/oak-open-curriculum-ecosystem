---
name: "Claude Per-User Memory Buffer Drain"
status: active
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
    content: Feedback duplicate/enrichment batches, alphabetical, ~25-30 entries/loop (revisable down)
    status: pending
  - id: stratum-d-novel-doctrine
    content: Classifier-routed doctrine authoring for uncovered entries; docs-adr-expert per batch
    status: pending
  - id: closeout
    content: Final index verification (live-only, untruncated); value-and-impact closeout with honest verdict
    status: pending
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

## Lifecycle

Completion runs the consolidation closeout (this plan IS a consolidation
pass); the plan then archives to `../archive/completed/` with its knowledge
already in permanent homes (a completed plan is safe to delete). Quality
gates: `pnpm markdownlint-check:root` per loop; commit hooks are the blocking
tier; `pnpm practice:fitness:informational` is signal only.
