---
fitness_line_target: 200
fitness_line_limit: 400
fitness_char_limit: 25000
fitness_line_length: 100
fitness_content_role: reference
overflow_disposition: 'leave-if-live; else conserve-insight-and-delete — never archive/split/rotate/shard (see continuity-practice.md §Disposition of Continuity Surfaces)'
merge_class: index-narrative-tables
---

# Next-Session Record — `statusline-enhancements` thread

The unified Claude Code statusline lane: the Oak-mark logo column plus the
session-shape indicators. Both render through the same `renderStatusline`, so
they are one lane, not two. The lane is **COMPLETE** on `feat/comms-research` —
indicators re-fit onto the 4-row layout, an unknown-vs-solo resolver correctness
fix, and all five glyphs verified in the owner's terminals; it now rides the
branch's push/merge lifecycle. Authoritative scope and acceptance live in the
controlling plan — this record is the discoverable pointer to it.

## Current continuation

- **Controlling plan**:
  [`statusline-session-shape-indicators.plan.md`](../../../plans/agent-tooling/current/statusline-session-shape-indicators.plan.md)
  ("Statusline Enhancements — Oak Mark + Session-Shape Indicators").
- **Landed (mark)**: the Oak acorn mark — a 4-row logo-column, default
  `braille-sharp` via `OAK_STATUSLINE_LOGO` (`braille` / `quad` / `sextant` /
  `none` alternatives). Commits `40ef58a06` + `5cc13977e` + `8efc58d83` on
  `feat/comms-research`, **pushed** (verified `@{u}..HEAD` level 2026-06-13 —
  the earlier "UNPUSHED" note was stale).
- **Landed (indicators re-fit, 2026-06-13, Skylark wakes Summit)**: WS1 (claim
  `role` field), WS2 (pure session-shape resolver), WS3 (render) — originally
  committed on `feat/statusline-enhancements` against the OLD single-line layout
  (`ac2901fe1` / `1ac430378` / `4270ea49d`) — were brought onto
  `feat/comms-research` and **re-fit into the 4-row layout**: Director demark on
  the identity row, team-icon + ArcAngel wing trailing it; `logo:'none'`
  preserves the single line byte-compatibly. WS5 green (1081 agent-tools tests).
  The old "WS1 paused on an sdk-codegen blocker (`7ca3eba2`)" note was wrong —
  the role-field commit touches no sdk/keywords files; mis-attributed.
- **Landed (WS4 glyphs + unknown/solo, 2026-06-13, Skylark wakes Summit)**: WS4
  glyph terminal verification is **COMPLETE** — all five verified rendering in the
  owner's terminals: Director `🧭` U+1F9ED, directed-team `👪` U+1F46A, peer-team
  `🤝` U+1F91D (replaced `👥` U+1F465, which rendered nowhere), solo `🧍` U+1F9CD,
  ArcAngel wing `🪶` U+1FAB6. Plus a resolver **correctness** fix: an unreadable
  registry now resolves to `unknown` (no team icon — honest absence) instead of a
  false `solo`; a confident solo carries its own marker (`c456cda0d`). WS5 green
  (1081 agent-tools tests).

## Next safe step (the fresh session's first move)

The statusline lane is **COMPLETE** on `feat/comms-research` — all workstreams
landed, all five glyphs verified, 1081 agent-tools tests green. No
statusline-specific next step remains; the commits ride the branch's normal
push/merge lifecycle (the branch is shared with the comms-research and
agent-naming lanes). Statusline commits this arc: `a1fb8e9c4` `5c01ee7ee`
`221ee4a9f` (test-IO compliance), `c456cda0d` (unknown/solo + verified glyphs).

Carried-over note: `statusline-identity.ts` `listExperiments` uses
`Dirent.parentPath` (Node ≥ 20.12 / 21.4); no engines floor is declared, runtime
is Node 24 — fine in practice, worth pinning a floor. (The earlier WS1
`cli-claim-role.integration.test.ts` real-IO item is RESOLVED — that test was
deleted and its dispatch-allowlist guard re-expressed IO-free; see
`agent-tools-test-io-compliance.plan.md` for the remaining pre-existing test-IO
elsewhere in agent-tools.)

## Participating agent identities

| Platform | Model | Agent name | Role on this thread | last_session |
| --- | --- | --- | --- | --- |
| claude-code | Opus 4.8 | Skylark wakes Summit | Re-fit WS1–WS3 onto the 4-row layout; unknown-vs-solo resolver fix; WS4 glyphs verified; test-IO compliance; corrected this record + plan | 2026-06-13 |
| claude-code | Opus 4.8 | Bilby hunts Eventide | Oak mark landed; lane unified; thread opened | 2026-06-13 |

Prior, on the indicators half (pre-unification, `feat/statusline-enhancements`):
Monsoon guards Cirrus authored WS1–WS3 against the single-line layout, and the
2026-06-12 statusline redesign merged as PR #198.

## Landing target for the next session

None outstanding for the statusline lane — it is complete (all workstreams
landed, all five glyphs verified, 1081 agent-tools tests green) and rides
`feat/comms-research`'s push/merge. A fresh session opening this thread should
confirm the branch has merged and then **archive this record + the controlling
plan** per the lifecycle triggers. Unrelated follow-on: the pre-existing
agent-tools test-IO compliance tracked in
[`agent-tools-test-io-compliance.plan.md`](../../../plans/agent-tooling/current/agent-tools-test-io-compliance.plan.md).
