# Skill usage census — 2026-09-03 (Flounder turns Estuary, c5cc2c)

Owner ask, verbatim: "which repo skills have rarely or never been used?" then "record the
skills data in a report, that is a lot of skills we are not using, and note that claude loads
some skills or rules twice because they appear in two locations and it doesn't appear to be
able to dedupe them." Recorded 2026-09-03 ~17:2xZ from two instruments on the owner's machine.
Nothing here is a decision; the dispositions at the end are recommendations with falsifiers.

## Instruments and their bounds

| Instrument | What it counts | Window | Bound |
| --- | --- | --- | --- |
| Harness record: the `skillUsage` map in the Claude Code user config | Explicit invocations of a skill by name (the Skill tool or a slash command), summed per name, with the last-used time | Since the record began; every project on the machine | Claude Code only; Codex and Cursor sessions are invisible; a skill invoked under an earlier prefix is counted under that prefix (see the eras table) |
| Transcript census: the 53 local session transcripts for this repo and its worktrees | Sessions that invoked a skill (as above) and, separately, sessions in which the skill's canonical file path appeared (a read or a reference) | 2026-08-04 to 2026-09-03 (the 30-day transcript retention) | Sessions, not calls; the "appeared" column is inflated for skills whose path sits in every session's boilerplate (`commit`, `under-the-hood`, `working-with-agentic-ai`) |

Neither instrument sees passive loading: an always-active skill such as `napkin` or
`comms-channels` shapes a session without ever being invoked, so a low count there is not
evidence of disuse. The `oak-` prefix dates from 2026-05-22 (ff8254336); harness counts under
it run from 2026-06-12.

## Headline

| Fact | Value |
| --- | --- |
| Repo skills (canonical `SKILL-CANONICAL.md` files) | 61 |
| Skills ever invoked under the `oak-` prefix | 35 |
| Skills never invoked under the `oak-` prefix | 29 (26 of them never invoked in the 30-day window either) |
| Total `oak-` invocations recorded by the harness | 3,118 |
| Invocations carried by the top 15 skills | 3,069 (98.4%) |
| Skills with no trace at all in the 30-day window (neither invoked nor appeared) | 8 |
| Sessions in the window with at least one explicit invocation | 38 of 53 |

## The full table

Columns: harness invocations under `oak-` (all time), the last such invocation, sessions in the
30-day window that invoked the skill, sessions in the window in which its canonical path
appeared. Sorted by harness invocations, ascending.

| Skill | Harness uses | Last used | 30-day sessions invoked | 30-day sessions appeared |
| --- | --- | --- | --- | --- |
| `chatgpt-report-normalisation` | 0 | never | 0 | 1 |
| `claude-design-pipeline` | 0 | never | 0 | 0 |
| `codex-helper` | 0 | never | 0 | 3 |
| `cut-coordination-branch` | 0 | never | 0 | 3 |
| `dependency-currency` | 0 | never | 0 | 3 |
| `gates` | 0 | never | 0 | 4 |
| `ground-truth-design` | 0 | never | 0 | 0 |
| `ground-truth-evaluation` | 0 | never | 0 | 0 |
| `knowledge-safety-sweep` | 0 | never | 0 | 1 |
| `parallax-audit` | 0 | never | 0 | 3 |
| `parallax-decide` | 0 | never | 0 | 2 |
| `parallax-design-experiment` | 0 | never | 0 | 1 |
| `parallax-design-inquiry` | 0 | never | 0 | 1 |
| `parallax-frame` | 0 | never | 0 | 2 |
| `parallax-learn` | 0 | never | 0 | 2 |
| `parallax-product-experiment` | 0 | never | 0 | 1 |
| `parallax-synthesise` | 0 | never | 0 | 2 |
| `sif` | 0 | never | 0 | 6 |
| `slack-watcher` | 0 | never | 0 | 3 |
| `talk-to-slack-watcher` | 0 | never | 0 | 1 |
| `ticket-management` | 0 | never | 0 | 8 |
| `tsdoc` | 0 | never | 0 | 0 |
| `ui-visual-design` | 0 | never | 0 | 0 |
| `undo-change` | 0 | never | 0 | 2 |
| `update-dependencies` | 0 | never | 0 | 4 |
| `update-upstream-api-spec` | 0 | never | 0 | 0 |
| `visual-comparison` | 0 | never | 0 | 0 |
| `visual-verification` | 0 | never | 0 | 0 |
| `working-with-agentic-ai` | 0 | never | 0 | 33 |
| `complex-merge` | 1 | 2026-06-13 | 0 | 9 |
| `go` | 1 | 2026-06-24 | 0 | 2 |
| `under-the-hood` | 1 | 2026-06-28 | 0 | 33 |
| `retrospective` | 1 | 2026-07-23 | 0 | 1 |
| `the-codex-dialogues` | 1 | 2026-08-06 | 1 | 7 |
| `curator-pass` | 1 | 2026-08-07 | 1 | 4 |
| `working-with-graphs` | 1 | 2026-08-07 | 1 | 2 |
| `inter-practice-collaboration` | 1 | 2026-08-08 | 0 | 2 |
| `update-bulk-download-schema` | 1 | 2026-08-12 | 1 | 3 |
| `napkin` | 1 | 2026-08-13 | 0 | 2 |
| `comms-channels` | 1 | 2026-09-03 | 1 | 9 |
| `parallax` | 3 | 2026-09-02 | 3 | 5 |
| `coordination-fold` | 4 | 2026-08-19 | 2 | 5 |
| `design-system-usage` | 5 | 2026-08-13 | 4 | 6 |
| `cricket` | 5 | 2026-09-03 | 4 | 33 |
| `set-up-worktree-lane` | 7 | 2026-09-03 | 6 | 14 |
| `semantic-merge` | 8 | 2026-07-20 | 0 | 11 |
| `proportionality` | 15 | 2026-09-03 | 12 | 25 |
| `pr-lifecycle` | 30 | 2026-09-03 | 10 | 22 |
| `consolidate-until-done` | 35 | 2026-08-14 | 2 | 2 |
| `start-right-thorough` | 64 | 2026-09-03 | 8 | 10 |
| `wrap` | 66 | 2026-09-03 | 20 | 27 |
| `free-play` | 78 | 2026-09-03 | 27 | 30 |
| `start-right-quick` | 138 | 2026-09-03 | 4 | 34 |
| `concept-exploration` | 177 | 2026-09-03 | 30 | 33 |
| `reason` | 182 | 2026-09-03 | 7 | 32 |
| `plan` | 196 | 2026-09-03 | 20 | 25 |
| `consolidate-docs` | 203 | 2026-09-03 | 5 | 8 |
| `commit` | 251 | 2026-09-03 | 13 | 35 |
| `session-handoff` | 364 | 2026-07-26 | 0 | 15 |
| `start-right-team` | 627 | 2026-09-03 | 34 | 34 |
| `metacognition` | 643 | 2026-09-03 | 31 | 31 |

## Prefix eras in the harness record

The harness keys usage by the invoked name, so the estate's earlier prefixes remain visible.

| Prefix | Distinct skills | Invocations | Last invocation |
| --- | --- | --- | --- |
| `jc-` | 15 | 910 | 2026-08-09 |
| `engraph-` | 18 | 359 | 2026-07-19 |
| `oak-` | 35 | 3,118 | 2026-09-03 |

An `engraph-` prefixed estate ran on this machine through July; its 18 skills are the same
core that dominates the `oak-` era. `jc-` invocations after the 2026-05-22 migration come from
a checkout that kept the old adapters.

## Reading the shape

The estate is a small working core and a long tail. Fifteen skills carry 98% of invocations:
the start-right trio, the cognition set (`metacognition`, `concept-exploration`, `reason`,
`free-play`, `proportionality`), `plan`, `commit`, `pr-lifecycle`, `wrap`, `consolidate-docs`,
`consolidate-until-done`, and `session-handoff` (whose invocations stop on 2026-07-26 because
wrap absorbed it at the owner's 2026-07-28 ruling).

The 29 never-invoked skills fall into classes with different meanings:

| Class | Skills | What the zero means |
| --- | --- | --- |
| Event-driven runbooks | `update-upstream-api-spec`, `update-dependencies`, `dependency-currency`, `cut-coordination-branch`, `undo-change`, `knowledge-safety-sweep` | Fire on an event that did not occur in the window; frequency is not their measure |
| The parallax family | `parallax-audit`, `parallax-decide`, `parallax-design-experiment`, `parallax-design-inquiry`, `parallax-frame`, `parallax-learn`, `parallax-product-experiment`, `parallax-synthesise` (the orchestrator `parallax`: 3) | Seven of eight never invoked, ever: the largest idle block, eight skill listings for one instrument |
| Design and visual | `claude-design-pipeline`, `ui-visual-design`, `visual-comparison`, `visual-verification` (`design-system-usage`: 5) | Idle since the design lane paused; four of the eight no-trace skills |
| Search quality | `ground-truth-design`, `ground-truth-evaluation` | Idle with the search-quality lane |
| Multi-seat and cross-vendor instruments | `slack-watcher`, `talk-to-slack-watcher`, `sif`, `codex-helper` (`the-codex-dialogues`: 1, `inter-practice-collaboration`: 1, `comms-channels`: 1) | Need a second seat or a second vendor; recent sessions were solo |
| Authoring and orientation aids | `tsdoc`, `chatgpt-report-normalisation`, `working-with-agentic-ai`, `gates`, `ticket-management` (`go`: 1, `under-the-hood`: 1, `retrospective`: 1) | `working-with-agentic-ai` and `under-the-hood` are read by people, not invoked; `tsdoc` is the anomaly, since code shipped in the window |

## Skills and rules present in two locations

The owner's observation, verbatim: "claude loads some skills or rules twice because they
appear in two locations and it doesn't appear to be able to dedupe them."

What is on disk at f88be5afe:

| Surface | `.claude/` | `.agents/` | `.cursor/` | Canonical |
| --- | --- | --- | --- | --- |
| Skills | 70 dirs | 70 dirs, the same 70 names | — | 61 under `.agent/skills` (plus 9 vendored) |
| Rules | 125 files | 125 files | 127 files | 125 under `.agent/rules` |

The two skill adapters for one name differ only in their heading line ("(Claude Code)" versus
"(Cross-tool)"); both point at the same canonical file. Every rule file under `.claude/rules`
is a one-line pointer to its canonical.

What the Claude Code documentation states (skills page, read 2026-09-03): project skills load
from `.claude/skills/`; same-name conflicts resolve by source level (enterprise over personal
over project), plugin skills carry a `plugin:skill` namespace so they cannot collide, and
nested `.claude/skills/` directories surface under a directory-qualified name. The page does
not name `.agents/skills/` as a discovery location, so whether the `.agents/` projection is
also scanned is not settled by the documentation. The listing cost is documented precisely:
"The listing always contains every skill name, but if you have many skills, Claude Code
shortens descriptions to fit the listing's character budget, which can strip the keywords
Claude needs to match your request." `/doctor` reports the listing's context cost and its
biggest contributors; the Skills row of `/context` reports the size after the budget.

What a `--debug` run of Claude Code 2.1.259 on this checkout logged (2026-09-03 17:23Z), with
the machine-local path prefixes replaced by their portable forms:

- "Loading skills from: managed=…, user=~/.claude/skills, project=[<repo>/.claude/skills]" —
  one project directory.
- "Loaded 72 unique skills (72 unconditional, 0 conditional, managed: 0, user: 2, project: 70,
  additional: 0, legacy commands: 0)" — the 70 are `.claude/skills` exactly.
- "Total plugin skills loaded: 38 (0 duplicate/user-owned entries skipped)" — figma 14,
  cloudflare 11, sonarqube 9, mcp-server-dev 3, frontend-design 1.
- No line in the log names `.agents/skills`; the directory is not scanned by this version.

So on this host the repo's skills are not loaded twice: `.agents/skills` and `.cursor/rules`
are projections for other hosts and cost Claude Code nothing. What the 70-entry listing
does cost is its description budget (above). If the doubled loading was observed on another
host (Codex or Cursor reading both `.agents/` and `.claude/`), that is the place to measure;
the generator emits a projection per host precisely so each host reads one.

## Recommended dispositions, with falsifiers

- **Confirm the double-load first, then cure it in the generator, not by hand.** If `/doctor`
  shows both projections contributing, the adapter generator should stop emitting a Claude-
  readable projection into `.agents/skills/` (or emit it under a non-colliding name); a manual
  deletion regenerates on the next `skills:generate`. Falsifier: `/doctor` attributes the
  listing cost to one directory only, in which case the cost is the 70-entry listing itself.
- **Collapse the parallax family to its orchestrator plus reference files.** Eight listings for
  one instrument, seven never invoked. Falsifier: a user of the family who invokes the parts
  directly, which the harness record would show under their names.
- **Fold `session-handoff` into `wrap` structurally.** The ruling already made wrap the only
  close; the separate listing is a residue. Falsifier: a platform that runs handoff without
  wrap.
- **Keep the event-driven runbooks and the safety skills regardless of frequency.** Their
  measure is whether they are found when their event fires. Falsifier: an event that fired
  and was handled without the skill, which would show the skill is not on the path.
- **Let the design, visual and search-quality families follow their lanes.** They are idle
  because the lanes are; retiring them ahead of a lane decision is a decision by omission.
- **Look at `tsdoc`.** Code shipped in the window and the skill was never touched. Either the
  code-expert path covers it, or it is not on the authoring path it was written for.

Data files for this census are machine-local and not tracked; this report is the record.
