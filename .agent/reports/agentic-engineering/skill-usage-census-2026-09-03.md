# Skill usage census — 2026-09-03 (Flounder turns Estuary, c5cc2c)

Owner ask, verbatim: "which repo skills have rarely or never been used?" then "record the
skills data in a report, that is a lot of skills we are not using, and note that claude loads
some skills or rules twice because they appear in two locations and it doesn't appear to be
able to dedupe them." Recorded 2026-09-03 ~17:2xZ from two instruments on the owner's machine.
Nothing here is a decision; the closing section names the decisions the data surfaces and
lays out the factors for each.

## Review contract

- **Purpose and impact.** Give the owner a first-hand measurement of which repo skills are
  used, how often, and by which signal, so that the shape of the skills estate can be decided
  from data rather than impression. The report changes nothing itself.
- **Questions a review should test.** Do the headline counts reconcile to the full table and to
  the stated instruments? Are the bounds of each instrument stated honestly, including what it
  cannot see? Is the double-loading finding supported by the cited debug evidence and the
  documentation quoted? Does any line pick an answer to a call reserved for an owner-ratified
  deliverable rather than laying out the factors?
- **Evidence standard and authority.** Every number derives from the harness's own usage
  record, the local transcripts, or a logged debug run, by the commands in the Reproduction
  section below; the intermediate files are machine-local and the report is the record. The
  report has no authority
  over the skills estate; its shape is decided in owner-ratified plans and rulings.
- **Non-goals.** This is not a retirement list, not a measure of any skill's quality or
  correctness, and not a census of Codex or Cursor sessions.
- **A successful review** establishes that the counts reconcile and that every line stays on
  the considerations side of the line the reports README draws. Missing evidence or a
  contract mismatch is reported as a review thread on the carrying pull request naming the
  line; it is cured in the report, never argued down.

## Instruments and their bounds

| Instrument | What it counts | Window | Bound |
| --- | --- | --- | --- |
| Harness record: the `skillUsage` map in the Claude Code user config | Explicit invocations of a skill by name (the Skill tool or a slash command), summed per name, with the last-used time | Since the record began; every project on the machine | Claude Code only; Codex and Cursor sessions are invisible; a skill invoked under an earlier prefix is counted under that prefix (see the eras table) |
| Transcript census: the 53 local session transcripts for this repo and its worktrees | Sessions that invoked a skill (as above) and, separately, sessions in which the skill's canonical file path appeared (a read or a reference) | 2026-08-04 to 2026-09-03 (the 30-day transcript retention) | Sessions, not calls; the "appeared" column is inflated for skills whose path sits in every session's boilerplate (`commit`, `under-the-hood`, `working-with-agentic-ai`) |

Neither instrument sees passive loading: an always-active skill such as `napkin` or
`comms-channels` shapes a session without ever being invoked, so a low count there is not
evidence of disuse. The `oak-` prefix dates from 2026-05-22 (ff8254336); harness counts under
it run from 2026-06-12.

## Reproduction

Run from the repository root on the machine whose sessions are being measured. Paths use the
harness's own locations; `<project-dir>` is the directory the harness keeps for this checkout
under `~/.claude/projects/` (its name is the checkout path with separators replaced), and the
worktree checkouts each have their own.

```bash
# The canonical skill ids (the population of the table)
find .agent/skills -name SKILL-CANONICAL.md -exec grep -m1 '^name:' {} \; | sed 's/^name: *//' | sort -u

# Instrument A: the harness usage record, by invoked name, with the last-used time
jq -r '.skillUsage | to_entries[] | "\(.value.usageCount) \(.value.lastUsedAt/1000|floor|strftime("%Y-%m-%d")) \(.key)"' ~/.claude.json | sort -rn

# Instrument B1: sessions that invoked a skill (the Skill tool or a slash command), one row per session and skill
for f in ~/.claude/projects/<project-dir>*/*.jsonl; do sid=$(basename "$f" .jsonl); \
  grep -a -o -E '"name":"Skill","input":\{"skill":"[^"]+"|<command-name>/[a-z0-9-]+</command-name>' "$f" \
  | sed -E 's/.*"skill":"([^"]+)".*/\1/; s#<command-name>/([a-z0-9-]+)</command-name>#\1#' \
  | sed 's/^oak-//' | sort -u | sed "s/^/$sid /"; done

# Instrument B2: sessions in which a skill's canonical path appeared (a read or a reference)
for f in ~/.claude/projects/<project-dir>*/*.jsonl; do sid=$(basename "$f" .jsonl); \
  grep -a -o -E 'skills/(cognition/)?[a-z0-9-]+/SKILL-CANONICAL\.md' "$f" \
  | sed -E 's#skills/(cognition/)?([a-z0-9-]+)/SKILL-CANONICAL\.md#\2#' | sort -u | sed "s/^/$sid /"; done

# The double-loading probe: one non-interactive run with --debug, then the skill lines of its log
claude -p 'reply with the single word ok' --debug --output-format text > /dev/null
grep -i -E 'Loaded .* skills|Loading skills from|plugin skills loaded' ~/.claude/debug/"$(ls -t ~/.claude/debug | head -1)"
```

Counting a session once per skill (`sort -u` per file) is what makes the 30-day columns
session counts. The transcript window is whatever the harness's retention leaves on disk.

## Headline

| Fact | Value |
| --- | --- |
| Repo skills (canonical `SKILL-CANONICAL.md` files) | 61 |
| Current repo skills ever invoked under the `oak-` prefix | 32 |
| Current repo skills never invoked under the `oak-` prefix | 29 (none of them invoked in the 30-day window either) |
| `oak-` invocations recorded by the harness on current repo skills | 3,112 |
| Invocations carried by the top 15 skills | 3,069 (98.6%) |
| Retired `oak-` names still in the harness record (not in the table) | 3 names, 6 invocations (the record holds 35 `oak-` keys and 3,118 invocations in all) |
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
| Event-driven runbooks | `update-upstream-api-spec`, `update-dependencies`, `dependency-currency`, `cut-coordination-branch`, `undo-change`, `knowledge-safety-sweep` | Frequency is not their measure, and the zeros differ in kind. No upstream spec change fired in the window. The dependency event DID fire: the MCP-549 wave of 2026-08-11 (23 lockfile-touching commits in the window). `update-dependencies` was added that same day (63482f961) and `dependency-currency` on 2026-08-26 (7a44d9d84), after the wave, so their zeros are "introduced during or after the event", and whether the next dependency event routes through them is the open question |
| The parallax family | `parallax-audit`, `parallax-decide`, `parallax-design-experiment`, `parallax-design-inquiry`, `parallax-frame`, `parallax-learn`, `parallax-product-experiment`, `parallax-synthesise` (the orchestrator `parallax`: 3) | All eight components never invoked, ever; only the orchestrator has been used: the largest idle block, nine skill listings for one instrument |
| Design and visual | `claude-design-pipeline`, `ui-visual-design`, `visual-comparison`, `visual-verification` (`design-system-usage`: 5) | Idle since the design lane paused; four of the eight no-trace skills |
| Search quality | `ground-truth-design`, `ground-truth-evaluation` | Idle with the search-quality lane |
| Multi-seat and cross-vendor instruments | `slack-watcher`, `talk-to-slack-watcher`, `sif`, `codex-helper` (`the-codex-dialogues`: 1, `inter-practice-collaboration`: 1, `comms-channels`: 1) | Need a second seat or a second vendor. Seat count per session was not measured: `start-right-team` (34 sessions) is the standard opener at any seat count, so its count says nothing about team size; the claims register's concurrent-seat history is the measure not taken. Until it is, the zero is either "no second seat" or a routing gap |
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

## Decisions this census surfaces, with the factors

Each item names a call that belongs to an owner-ratified deliverable and lays out what the
data says about it. None is decided here.

- **Whether the doubled projections cost anything on other hosts.** On this host the debug
  log settles it: one directory is scanned. Factors: the `.agents/` and `.cursor/` projections
  exist for Codex and Cursor, whose discovery rules were not measured; the generator emits one
  projection per host, so any cure belongs in the generator rather than in a hand deletion
  that regenerates on the next `skills:generate`. Discriminating evidence: the same debug-style
  probe on each other host.
- **What to do with the parallax family.** Nine listings for one instrument; the eight
  components have never been invoked and the orchestrator three times. Factors: the family
  was designed as a capability graph whose parts the orchestrator routes to, so the parts'
  zero may be by design; every listing costs description budget. Discriminating evidence: a
  session that invokes a part directly would appear under its name in the harness record.
- **Whether `session-handoff` keeps its own listing.** Its invocations stop on 2026-07-26,
  matching the ruling that made wrap the only close. Factors: it still appeared in 15 sessions'
  context in the window; a platform that runs handoff without wrap would need it. The call
  sits with the wrap and handoff doctrine, not here.
- **How to value the event-driven runbooks and safety skills.** Zero invocations in a window
  in which their events did not fire. Factor: their measure is whether they are found when the
  event fires, which usage frequency cannot show; an event handled without the skill would.
- **Whether idle families follow their lanes.** The design, visual and search-quality skills
  are idle while those lanes are paused. Factor: their status is a consequence of the lane
  decisions already recorded elsewhere, not a separate question this data can answer.
- **Why `tsdoc` was never touched while code shipped.** Either the code-expert path covers its
  purpose or the skill is not on the authoring path it was written for. Discriminating
  evidence: the transcripts of the sessions that shipped code in the window.

Data files for this census are machine-local and not tracked; this report is the record.
