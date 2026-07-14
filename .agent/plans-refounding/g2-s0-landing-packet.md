# G2 packet — S0 landing sanction (plan-corpus refounding, r1)

Status: **RULED at the 2026-07-14 sitting** (owner, ~12:25–12:30Z, relayed by
Director directed event 12:29:05Z) — G2.1/G2.2/G2.3 ratified as drafted; G2.4
overruled in favour of a HARD freeze window (§4 as amended); **S0 HELD** pending
the Director's pre-freeze estate review and a freeze-planning sitting. §6 is the
ratification record. Authored 2026-07-14 by Cedar rides Undergrowth (270379), R1
implementer, from a full `refound-freeze` evidence run. Gate content per the
[owner-gate register](./owner-gate-register.md) G2 row and the
[controlling plan](../plans/product-development-governance/active/plan-corpus-refounding.plan.md)
§Owner-gate register: **denominator totals, scoped gate exclusions with reasons,
secret-scan attestation, declared commit window**.

Evidence provenance: the freeze ran end-to-end in the isolated r1 worktree at base
`SHA:cf3327515` (2026-07-14 ~10:41Z); drift measurements refreshed against
`origin/main` `SHA:2ccc0e2e0` at ~12:05Z. Every number below is re-derivable by
re-running the tool; none is hand-authored.

## 1. Denominator totals — evidence plus the re-derivation protocol

| Measure | At `SHA:cf3327515` | Refreshed at `SHA:2ccc0e2e0` |
| --- | --- | --- |
| In-scope files | 679 (659 plans / 5 milestones / 15 proposals) | 683 (+4 net) |
| Lines | 205,136 | re-derived at S0 |
| Bytes | 10,422,585 | re-derived at S0 |

The corpus moves: 8 distinct in-scope files were touched in the 2.5 hours between
the two SHAs alone (the TAU merge), and the 8-day design window saw 17 additions.
The sanction sought is therefore on the **landing shape and process, never the
literal totals**: S0 re-runs the freeze on the S0-day `main` tip, the committed
`denominator.v1.json` is THAT run's output, and merge-recheck re-derives the
denominator at every stable point and batch boundary (P2). Ratifying literal
numbers would be invalidated by the first arrival.

**Registers-OUT amendment (G3.3 ruling, applied)**: the owner ruled high-churn
operational registers OUT of the corpus — operational surfaces, not plans. The
freeze rule now carries an `operational-registers` class (verdict `out`, exact
six-path closed list: the frictions register, the refounding cost ledger, three
`documentation-sync-log.md` files, the deferred-controls register), and the
enumeration subtracts `out`-class matches from overlapping `in` globs (before
this an overlapping `out` class was silently inert — cured test-first with the
amendment). Under the amended rule at the merged head the in-set is **677**
(tool-derived, equal to the independent git arithmetic 683 − 6). The exact list
rides the freeze-planning sitting for confirmation; the six files stay live and
untouched in the repo — out of the frozen corpus is not out of the estate.

## 2. Scoped gate exclusions, with reasons

Governing principle: the frozen archive (`.agent/plans-refounding/archive/**`) is
a **byte-identity contract** — `verify-freeze` re-hashes it, so ANY rewrite is a
red proof. Fix-mode tools must never touch it; read-only check-mode tools stay ON
unless they would spuriously block the landing. Every exclusion is scoped to the
archive path only, never a global disable (`never-disable-checks`). The
markdownlint-cli2 config's own scope doctrine already names archive material as
the excluded class and calls moving a folder "a deliberate governance act" — this
sitting is that act.

| Gate | Mechanism | Proposed treatment | Reason |
| --- | --- | --- | --- |
| prettier (pre-commit `prettier-staged`; `format:root` writes) | `.prettierignore` | EXCLUDE `archive/**` under the existing "DO NOT FORMAT" class | a fix-mode rewrite breaks byte-identity; a check-mode red would spuriously block S0 whenever a frozen source predates current formatter config |
| markdownlint (pre-commit staged; `markdownlint:root` is `--fix`) | `.markdownlint-cli2.jsonc` `ignores` | EXCLUDE `archive/**` | same byte-identity reason; the config's doctrine names the archive class explicitly |
| gitleaks (`secrets:scan`) | none | KEEP covering the archive | read-only; defence in depth alongside the freeze tool's own refusal-gated scan (§3) |
| `encoding:check` | none | KEEP | read-only; byte-copies of in-tree passing files pass |
| repo-validators (machine-local paths etc.) | none | KEEP; any red at the S0 branch gates is investigated, never blanket-excluded | read-only; copies of passing files pass |
| `practice:fitness` | scanner scope | VERIFY at S0: if the scanner walks the archive, EXCLUDE the artefact root | fitness signals route work on live doctrine surfaces; a frozen archive is not one |
| type-check / tests / knip / depcruise | n/a | no change | not a source surface |
| PR-surface (Sonar, CodeQL, review bots) | n/a | no gate change; the S0 PR body pre-declares the shape (one conservation commit, ~680 verbatim copies) so large-diff noise reads as designed | observational |

Sequencing: the exclusion config edits land as their **own commit on the S0
branch BEFORE the freeze commit**, so the S0 commit stays the pure atomic
conservation event (P2: freeze + denominator + proofs as one commit) and the
pre-commit hooks pass over the ~680 staged frozen files.

## 3. Secret-scan attestation

`refound-freeze` resolves a trusted gitleaks binary (8.30.1 at the evidence run),
runs it over the full in-scope set, and **refuses to write anything on any hit** —
the freeze cannot exist without a clean scan, by construction. The evidence run at
`SHA:cf3327515` was CLEAN over all 679 files. The S0 run re-attests by the same
mechanism; its output line is the attestation of record and rides the S0 commit.

## 4. Declared commit window — HARD FREEZE WINDOW (as ruled)

The drafted declaration-not-lock shape was **overruled at the sitting (G2.4)**.
The ratified shape:

- **The window is a hard freeze window: the team holds landings during S0.**
  No merges to `main` and no in-scope writes land while the window is open.
  Owner clarification: the window is **hours, never weeks**.
- The owner-moratorium companion (G3.1): no incoming plan-corpus work during
  the window; the arrivals table's role inside the window is
  **violation-detection**, and it resumes ordinary routing when the window
  closes.
- Mechanics that stand from the draft: S0 executes in the r1 worktree on a
  fresh branch cut from then-current `origin/main` — never `main`; window OPEN
  and CLOSE are comms broadcasts; inside the window: clear the exploration's
  accidental freeze artefacts (the tool refuses over a non-empty frozen tree),
  run the freeze, stage by explicit pathspec, land the one atomic S0 commit
  (the exclusion configs having landed as their own preceding commit), push,
  merge.
- **S0 is HELD**: the owner directed a step-back — the Director is reviewing
  all open sessions, PRs, branches, and uncommitted work before the freeze; a
  freeze-planning sitting follows. The window opens only after that sitting.

## 5. Ratification questions (as put)

| # | Question | Recommendation |
| --- | --- | --- |
| Q1 | Sanction the landing shape (§1): freeze re-runs at the S0 tip; the committed denominator is that run's output; evidence totals are illustrative, not the ratified artefact | YES |
| Q2 | Ratify the scoped exclusion set (§2): prettier + markdownlint archive-scoped ignores; gitleaks / encoding / repo-validators stay ON; fitness verify-then-posture | YES as drafted |
| Q3 | Accept the attestation shape (§3): the tool's refusal-gated scan at S0 is the attestation of record | YES |
| Q4 | Ratify the commit-window shape (declaration-not-lock; open/close comms events; exclusions-commit-first, then one atomic freeze commit) | YES |

## 6. Ratification record (2026-07-14 sitting)

Owner rulings ~12:25–12:30Z, relayed by the Director's directed event to this
seat at 12:29:05Z (the evidence pointer of record):

1. **G2.1 landing shape — YES** as drafted.
2. **G2.2 scoped archive gate exclusions — YES**; exclusion configs as their
   own commit before the freeze commit.
3. **G2.3 attestation — YES**; the S0 run's own output line is the attestation
   of record.
4. **G2.4 — NO to declaration-not-lock**: the owner rules a HARD freeze window
   (team holds landings during S0; hours-scale). §4 above carries the ratified
   shape; the drafted Q4 text is conserved in §5 for the record.
5. **S0 HOLD**: "we need to step back and plan this properly" — pre-freeze
   estate review (all open sessions, PRs, branches, uncommitted work) by the
   Director, then a freeze-planning sitting. S0 does not proceed before it.

G3 (the arrivals-routing table) was ruled at the same sitting —
[`g3-arrivals-routing-table.md`](./g3-arrivals-routing-table.md) carries its
record, including the G3.3 registers-OUT ruling applied in §1 above.

## Addendum (mirrors the G3 record) — 2026-07-14, post-sitting re-homing

The G3.3 ruling ("operational registers are OUT of the corpus") was
subsequently strengthened structurally: the owner approved re-homing all six
registers out of `.agent/plans/**` entirely (frictions register and
deferred-controls register to `.agent/memory/operational/`, the three
documentation-sync-logs to `.agent/memory/operational/documentation-sync-logs/`,
the cost ledger to the refounding artefact root). The freeze rule's
`operational-registers` class is therefore DELETED, not confirmed: the
plans tree contains only planning intent, the exclusion list has no members,
and the freeze-planning sitting re-ratifies a rule with no register clause.
