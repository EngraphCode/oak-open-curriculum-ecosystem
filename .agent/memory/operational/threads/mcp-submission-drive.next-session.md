---
fitness_line_target: 350
fitness_line_limit: 500
fitness_char_limit: 35000
fitness_line_length: 100
fitness_content_role: reference
overflow_disposition: 'leave-if-live; else conserve-insight-and-delete — never archive/split/rotate/shard (see continuity-practice.md §Disposition of Continuity Surfaces)'
merge_class: index-narrative-tables
---

# Next-Session Record — `mcp-submission-drive`

> **Record created 2026-08-13**, at the drive's first wrap. The thread had been
> named in claims and comms since 2026-08-06 with **no record on disk** — five
> Director seats used it as a coordination key while its index of homes lived
> only in dead session context. That gap is this record's founding reason.

## The goal

Oak's MCP app reaches public beta, **publicised 6 September 2026**
(owner-confirmed 2026-08-13). Not general availability — GA's bar stays ahead.

**The constraint that actually governs scheduling** (owner, 2026-08-13): MG's
effective availability ends **20 August**. He is away the following week and
busy the week he returns. So the operative question for anything dated after
20 Aug is not "is it before 6 Sept" but **"does it need MG personally, and can
that dependency be removed or pulled inside the window?"** Re-dating without
answering that produces schedule pressure without reducing risk.

## Coverage map — the human OKR project's five critical-path tickets

Produced 2026-08-13 from a full read of both boards. `MCP App: First Major
Release` (engineering) and `MCP OKR: We reach 8000 requests` (Aakesh's) sit on
one team and **share one issue-number space** — always name the project.

| Their ticket | Coverage | Engineering home |
|---|---|---|
| **MCP-575** per-user API keys | **Was uncovered.** MCP-274 and MCP-90 were both *Canceled* — retired when in-code rate limiting went (MCP-411). That settled *where* enforcement lives, never *what identity it keys on*. | **MCP-593** (new). Deliberately not decision-complete: needs Jim + Remy. |
| **MCP-577** Sentry observability | Covered but **invisible** — eight tickets sat with no project, so they appeared on no board. | MCP-544, MCP-495, MCP-493, MCP-481, MCP-480, MCP-559, MCP-546, MCP-580 — all now homed on the project. |
| **MCP-574** tool error rates | Half. Its two symptoms are separate defects. | `error=unknown` → **MCP-582** (re-scoped, larger than stated). `harness=other` → **MCP-594** (new, PR #880). |
| **MCP-579** carousel hosting | Mechanism covered, act was not. | **MCP-595** (new) → PR #883. Images verified PNG 1000×1000. |
| **MCP-94** Oak website | **Split across repos.** Landing page ours; nav dropdown is not. | Ours: MCP-128/509/350/182/348/421. Not ours: **MCP-596** (new) — no lane, no owner, still open. |

**Three items Aakesh's list did not surface** that outrank parts of it: the
Privacy/DPIA milestone (14 open, several Urgent, DPO consultation needs external
lead time); M2/M3 guidance pipeline and content (both 0%, and the release bet
rests on them); and MCP-536, the server-key naming decision — renaming after
publicity is far worse than before.

## Where everything lives (the index a successor needs)

- **Board of record**: `MCP App: First Major Release`, target 2026-09-06.
  Milestones re-dated 2026-08-13 and re-cut against the 20 Aug edge.
- **Tickets minted this drive**: MCP-593 (per-user credentials), MCP-594
  (harness attribution), MCP-595 (carousel), MCP-596 (web-app lane gap),
  MCP-597 (monitor disabled), MCP-599 (standing sign-off criteria).
  MCP-598 exists as a **duplicate of MCP-445** — the Sentry-identifier question
  already had a home.
- **Failure-mode doctrine**: `patterns/observer-must-see-the-terminal-state.md`
  (new); recurrence recorded on `patterns/turbo-cache-false-green.md`; three
  classes in the napkin.
- **Formation letter**: `.agent/experience/2026-08-13-wildfire-holds-quench-*`.
- **Owner-liaison seat**: reconstitutes from `SEAT-BRIEF.md` on
  `chore/owner-liaison` (`e24629a93`).

## State at wrap, 2026-08-13

| PR | State |
|---|---|
| **#878** MCP-580 canonical `/healthz` | **MERGED and LIVE** — production returns `200`, `no-store`. |
| **#880** MCP-594 client attribution | Open, all checks green, blocked on MG's own `CHANGES_REQUESTED`; request moved to `jimCresswell`. |
| **#881** MCP-301 public documentation | Open. 24 claims sourced, 7 gaps as owner options. |
| **#882** knowledge + consolidation | Open, based on the coordination branch. |
| **#883** MCP-595 carousel | Open, 19/19 green, awaiting Aakesh's name verification. |

## Next safe steps

1. **Two billing limits** — the highest-leverage items, both minutes of admin,
   both gating the only automated watchers that function across MG's absence:
   Claude Code overage (automated PR review is dead org-wide) and Sentry PAYG
   (monitor 1593267 cannot be enabled).
2. **Rotate the GitHub PAT** visible in plaintext in the process list.
3. **MCP-597**: after the billing unblock, re-point monitor 1593267 to
   `https://www.thenational.academy/mcp/healthz` — **bare form, no trailing
   slash** (the slash form routes through Clerk; identical bodies, so a
   status-code assertion cannot tell them apart) — enable it, and **prove checks
   ran from the history**, never from the config field.
4. **MCP-458** is down to one human act: confirm the prompt is not visible in
   the three carousel images. Format, width, naming, placement and byte
   integrity are discharged.
5. **M6's milestone description still says "EU data residency" and is false**
   (MCP-470: 5 EU + 4 US, owner-chosen). Offered to the owner; not yet fixed.

## Standing traps this thread has paid for

- **`agent-tools spawn`, never raw `git worktree add`.** Measured across four
  worktrees: spawn-created ones pass the pre-commit gate; a hand-rolled one
  cannot, and the failure presents as a `next/font/google` build error.
- **`gh` is authenticated as the owner even though git is ambient emgeebot.** A
  bare `gh pr create` authors as `mantagen` and silently drops the reviewer
  request, leaving the code-owner gate unsatisfiable. Mint a token; verify with
  `--json author,reviewRequests`. Five instances to date.
- **A non-existent path under `/mcp/` returns 406, not 404.** Any check written
  as "confirm it is not a 404" passes on a completely broken URL.
- **Board state is not work state.** Five of MCP-309's eight declared blockers
  were already Done while the board implied otherwise; one discharged gate read
  as the top launch risk.

## Participating agent identities

| agent_name | platform | model | session_id_prefix | role | first_session | last_session |
|---|---|---|---|---|---|---|
| Wisteria lifts Verdure | claude-code | claude-opus-5 | c4294f | director | 2026-08-06 | 2026-08-06 |
| Schooner rides Marsh | claude | Opus-5 | d9d5b8 | director | 2026-08-12 | 2026-08-12 |
| Walrus herds Jetty | claude | Opus-5 | a9cd9a | director | 2026-08-12 | 2026-08-12 |
| Marlin binds Wave | copilot | GPT-5.6 Sol | a8a9e9 | pr-review-warden | 2026-08-12 | 2026-08-12 |
| Wildfire holds Quench | claude | Opus-5 | ee2764 | director | 2026-08-13 | 2026-08-13 |
| Orchid holds Bark | claude | Opus-5 | 2abbd1 | liaison | 2026-08-13 | 2026-08-13 |
