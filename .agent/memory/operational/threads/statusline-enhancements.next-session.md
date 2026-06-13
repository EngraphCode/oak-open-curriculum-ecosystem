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
they are one lane, not two. The indicators are now **re-fit onto the 4-row
layout** (the load-bearing step) and the lane is consolidated on
`feat/comms-research`; what remains is owner glyph verification, then push + PR.
Authoritative scope and acceptance live in the controlling plan — this record is
the discoverable pointer to it.

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
  preserves the single line byte-compatibly. WS5 green (1075 agent-tools tests).
  The old "WS1 paused on an sdk-codegen blocker (`7ca3eba2`)" note was wrong —
  the role-field commit touches no sdk/keywords files; mis-attributed.
- **Remaining**: WS4 glyph **terminal** verification (the owner gate — render in
  iTerm2 / Terminal.app / VS Code, swap any tofu glyph to the pinned ASCII
  fallback). Glyphs: Director `🧭` U+1F9ED, directed-team `👪` U+1F46A, peer-team
  `👥` U+1F465, ArcAngel wing `🪶` U+1FAB6 (U+1FAB6 + the family emoji are the
  tofu-risk members). Then push the re-fit commit, then open/refresh the PR.

## Next safe step (the fresh session's first move)

1. **Glyph terminal verification (owner gate).** Run the built statusline in the
   owner's iTerm2 / Terminal.app / VS Code across the shape combinations (see the
   render-evidence sample in the re-fit commit body). Any glyph that tofus is
   swapped to its ASCII fallback (`[D]`/`[T]`/`[P]`/`[A]`, pinned in the
   `statusline-render.ts` glyph comment); record the terminals checked.
2. **Push** the re-fit commit on `feat/comms-research` (coordinate the window if
   the comms-research lane is still active on the shared branch).
3. **Open / refresh the PR** for the unified statusline lane.

Carried-over WS1/WS2 items (authored on `feat/statusline-enhancements`, surfaced
by this branch's checks — resolve at WS1/WS2 canonical landing, not part of the
re-fit scope):

- **WS2**: `statusline-identity.ts` `listExperiments` uses `Dirent.parentPath`
  (Node ≥ 20.12 / 21.4); no engines floor is declared, runtime is Node 24 — fine
  in practice, worth pinning a floor.
- **WS1**: `cli-claim-role.integration.test.ts` imports `node:fs/promises` (real
  IO) — a warn-level `@oaknational/no-real-io-in-tests` finding (ADR-078). The
  fix is to inject a fake fs; carried verbatim here to keep WS1 coverage complete
  and intact.

## Participating agent identities

| Platform | Model | Agent name | Role on this thread | last_session |
| --- | --- | --- | --- | --- |
| claude-code | Opus 4.8 | Skylark wakes Summit | Re-fit WS1–WS3 indicators onto the 4-row layout on `feat/comms-research`; corrected this record + plan | 2026-06-13 |
| claude-code | Opus 4.8 | Bilby hunts Eventide | Oak mark landed; lane unified; thread opened | 2026-06-13 |

Prior, on the indicators half (pre-unification, `feat/statusline-enhancements`):
Monsoon guards Cirrus authored WS1–WS3 against the single-line layout, and the
2026-06-12 statusline redesign merged as PR #198.

## Landing target for the next session

WS4 glyph terminal verification in the owner's terminals (swap any tofu to its
ASCII fallback), then push the re-fit commit and open/refresh the PR. The 4-row
re-fit and its render evidence are done; the suite is green at 1075.
