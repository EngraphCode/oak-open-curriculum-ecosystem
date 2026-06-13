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

The unified Claude Code statusline lane: the Oak-mark logo column (landed) plus
the session-shape indicators (pending). Both render through the same
`renderStatusline`, so they are one lane, not two. Authoritative scope,
sequencing, and the pickup brief live in the controlling plan — this record is
the discoverable pointer to it.

## Current continuation

- **Controlling plan**:
  [`statusline-session-shape-indicators.plan.md`](../../../plans/agent-tooling/current/statusline-session-shape-indicators.plan.md)
  ("Statusline Enhancements — Oak Mark + Session-Shape Indicators") — read its
  **§Landed** (what shipped) and **§Pickup** (the ordered resume brief) first.
- **Landed**: the Oak acorn mark — a 4-row logo-column with the segments flowing
  to its right, default `braille-sharp` via `OAK_STATUSLINE_LOGO`
  (`braille` / `quad` / `sextant` / `none` alternatives). Commits `40ef58a06`
  (feature) + `5cc13977e` (lane unification) + `8efc58d83` (lessons), on
  `feat/comms-research` (re-derive push state first-hand).
- **Pending**: the session-shape indicators (WS1–WS5) — Director demark,
  team-shape icon, ArcAngel wing. WS1 was staged on `feat/statusline-enhancements`
  and is paused on an upstream sdk-codegen blocker (the `/keywords` description
  change, comms event `7ca3eba2`).

## Next safe step (the fresh session's first move)

Per the plan §Pickup, in order:

1. **Reconcile the two branches** — the mark is on `feat/comms-research`; the
   indicators' WS1 on `feat/statusline-enhancements`. Get both onto one base so a
   single branch edits `renderStatusline`.
2. **Re-fit WS3 to the 4-row layout** — read the current `renderStatusline` /
   `composeWithLogo` first; the indicators' old single-line "fixed-width prefix"
   placement is superseded by the logo column. WS1/WS2/WS4/WS5 are unaffected.
3. **Clear the WS1 blocker** before resuming the chain.

## Participating agent identities

| Platform | Model | Agent name | Role on this thread | last_session |
| --- | --- | --- | --- | --- |
| claude-code | Opus 4.8 | Bilby hunts Eventide | Oak mark landed; lane unified; thread opened | 2026-06-13 |

Prior, on the indicators half (pre-unification, `feat/statusline-enhancements`):
Monsoon guards Cirrus (WS1 staged, paused on the sdk-codegen blocker), and the
2026-06-12 statusline redesign merged as PR #198.

## Landing target for the next session

Reconcile the branches and re-fit WS3's indicator placement to the 4-row logo
layout, landing at least one indicator (Director demark on the identity row) with
render evidence, per the plan's WS5 test discipline.
