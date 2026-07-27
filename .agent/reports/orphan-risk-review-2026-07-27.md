---
status: permanent-dated-record
date: 2026-07-27
capture_boundary_utc: 2026-07-27T17:25:00Z
subject: release-drive-orphan-risk
identity: Squall wakes Apex / claude-code / claude-fable-5 / 459fd1 (Director)
---

# Orphan-risk review — 27 July 2026

Owner-commissioned after a release meeting shifted priorities: *"a careful review of what we
were working on, and what we are working on now, so that we do not risk orphaning any work."*

Every claim below is first-hand at the capture boundary: live PR state, worktree `git status`,
the claims registry, and the Linear board. Anything that could drift after that boundary is
marked as needing recount before action.

## The question, sharpened

Orphaning has three distinct failure modes, and they need different instruments:

1. **Lost artefacts** — uncommitted work in a worktree whose seat has retired. Detected by
   `git status` across every worktree; cured by committing or by explicit disposition.
2. **Lost lanes** — work marked *In Progress* with no live seat. Invisible to git; detected only
   by crossing the board against the claims registry. This is the dominant mode today.
3. **Lost intent** — a lane whose priority changed at a meeting the board never heard about.
   Detected only by the owner reading the list back.

## Mode 1 — lost artefacts: ONE REAL FINDING, and a correction to this review

**Correction, recorded because the first pass got it wrong.** An earlier revision of this report
claimed "all twelve worktrees were inspected". There are **twenty-four**; the first sweep was
silently truncated by a `head -12` and the conclusion was then stated over the whole set. The
error is the interesting part: a truncated read produced a confident all-clear, and only a
follow-up count caught it. Coverage claims must be derived from the same command that produced
the evidence, never from the window that displayed it. All twenty-four are now inspected.

Of the seven belonging to retired seats (Cutter, Smelter, Thistle, Peony, design lane), **every
one is clean** — zero uncommitted files, six main-ancestral, the seventh at `e18b6ec94` which is
PR #582's pushed head. Smelter's six-file phase-(b) work, the one genuinely at risk on a
machine-temp path an hour earlier, is absorbed into that head. Of the remaining seventeen, one
carries an untracked directory (`mcp-128-pre-ratification`) that proved to be a **superseded
earlier copy** of design reports already tracked in fuller form — no loss.

**The real finding: ADR-217 never landed.** The superseded landing branch carries eight commits
not in main, including `fbaab6bb4` — "add ADR-217 on server-rendered HTML in the MCP app".
The restack (#578 → #580 → #583) re-authored the landing page rather than cherry-picking it, so
the *code* transferred and the page is live, but the ADR's scheduled home was PR-4, which the
release does not need and nobody is building. MCP-128 is closed Done, so nothing on the board
carried it. The architectural decision behind a live public surface exists **only on an unmerged
branch**. Minted as **MCP-289**, with the branch marked do-not-delete until discharged.

This is the review's justification in one instance: the git sweep alone reported "nothing
uncommitted" and would have missed it entirely. Unlanded-but-committed work on a branch whose
ticket is closed is invisible to both `git status` and the board.

The specific fear worth naming, because it was real an hour earlier: Smelter's six-file
uncommitted phase-(b) work, in a machine-temp worktree an OS clean-up could have taken. It is now
absorbed into #582's pushed cure. Nothing is stranded.

**One open item**: the primary checkout carries eleven uncommitted modified files — widget source
(`App.tsx`, `BrandBanner.tsx`, their unit tests, `index.css`, the generated widget HTML, the
banner spec) and the `mcp-agent-facing-content-audit` registry artefacts. No claim covers them and
no comms event names the lane. Swallow has eliminated itself in writing; a fleet ping is out to
the rest. Until attributed, no batch or commit touches those paths.

## Mode 2 — lost lanes: SEVEN, ranked

Crossing sixteen *In Progress* tickets against five registry claims (three live seats) leaves
these with no seat:

| Ticket | What it is | Why it matters now |
| --- | --- | --- |
| **MCP-63** | PostHog product analytics | **Sharpest risk.** Urgent, M6, and now a mechanical blocker on the submission act (MCP-106). Its carrier seat retired on spent credits; the MCP-234–244 replacement stack is unbuilt. The submission blocks on a lane nobody is holding. |
| **MCP-16** | Anthropic requirements review | M0 carrier, owner-assigned, unstarted in practice. Cheap, and gates nothing else — but it is on the submission's own checklist. |
| MCP-150/154/155/156 | Copilot CLI first-class support | Four tickets marked In Progress since 24 July. The owner ruled Copilot integration returns **after** submission; leaving them In Progress makes the board lie about what is active. |
| MCP-159 | Codex CLI capability catalogue | Carrier seat (Codex) retired on credits. Genuinely orphaned. |
| MCP-151 | Dependency estate sweep | In Progress since 25 July, seatless; the security slice already landed as PR #530, so the remainder is the mechanical tail. |
| MCP-121 | Guidance serving architecture | M1, sequenced into the Engineering Complete window — In Progress overstates it. |
| MCP-263 | Licence-safe search re-index | Believed **complete**: Swallow promoted the index at 13:36Z on the owner's go, restricted findable 0/2,641. Needs state truing against their first-hand evidence, not an assumption. |

## Mode 3 — lost intent: the owner's read-back

The board cannot answer this one. What the release meeting changed is only visible to the owner,
so the list above is written to be read back rather than acted on unilaterally. Two shifts are
already recorded and absorbed: the submission moved to Friday 31 July, and the DPIA/privacy
execution was raised to *soon* (MCP-272's new children, MCP-281 gating).

## What is actually live now

Three seats, verified fresh: Swallow on the canonical-domain edge (MCP-172, with the Cloudflare
change open as `oaknational/Cloud-Config` PR #551 — note the cross-repo number collision: #551 in
*this* repository is an unrelated merged dependency PR, so cross-repo PR numbers must always carry
their `owner/repo`), plus MCP-269 lane-go given; Raccoon on #582's base refresh; Schooner offered
MCP-281 with #570 as the fallback. The Director holds the merge arm.

Every PR attached to a backlogged ticket was checked for stranded work: #534, #529, #535, #540,
and #530 are all merged, and #522 was explicitly closed as superseded with that fact recorded on
its ticket. No orphaned PR work exists behind the state changes below.

## Dispositions taken

- Copilot lane (MCP-150/154/155/156) and MCP-159 moved out of *In Progress* to reflect the
  owner's after-submission ruling and the retired carriers, each with a comment recording why and
  what would restart it. Reversible; no work is deleted, and the tickets keep their content.
- MCP-63's seatlessness is carded for the owner's return — it needs a seat, and seats are the
  owner's to open.
- Worktree pruning of the six provably-safe retired worktrees is deferred to the next quiet
  window; each was proven clean and main-ancestral at this boundary and must be re-proven at the
  instant of removal.

## Falsifier

If a seat reports that any lane above is in fact live in a worktree this review did not inspect,
the mode-2 list is wrong for that row and the ticket state should return immediately. The review
inspected every worktree registered to this repository at the capture boundary; a lane living
outside that set would be invisible to it.
