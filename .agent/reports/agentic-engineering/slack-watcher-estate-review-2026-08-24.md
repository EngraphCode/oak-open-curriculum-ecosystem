# Slack Watcher estate review — working report

**Owner-commissioned review of the Slack Watcher organ** (plan:
[`slack-watcher-estate-review.plan.md`](../../plans/delivery/slack-watcher-estate-review.plan.md),
ratified 2026-08-24 in-session; commissioning word 2026-08-24: "a review
of the skills, guidance and mechanisms behind the The Watcher of Slack
and agents communicating with or via The Watcher"). Author: Raven stirs
Murmur (`c4031b`), reviewing seat. This session executed **leg 1** (the
full primary-source inventory, read in full, drift recorded as
findings); legs 2–5 are pending and their sections below are stubs.
Method: discovery-based projection sweep (method published in §Leg 1)
plus full end-to-end reads of every inventoried surface; every drift
claim carries its file evidence and was observed first-hand this
session.

**Review contract.** Purpose: give the owner grounds to trust — or
distrust, with specifics — the Watcher as the estate's comms organ: can
a fresh Watcher seat start, run, and hand off from the written surfaces
alone, and can agents communicate with or via it without drift,
double-delivery, or silent loss? Questions a review of THIS record
should test: does the leg-1 inventory really enumerate every projection
the published sweep method would find; is each drift finding
reproducible from the named files; are severity readings warranted by
the evidence rather than the prose? Evidence standard: every finding
re-derivable from named files at named paths (castr paths are in the
read-only clone at commit `89914b4`). Authority boundary: this record
AUTHORISES NOTHING — verdicts and proposals land in leg 5 and their
adoption is the owner's consolidation decision. Non-goals: amending
Watcher skills or rules (out of scope for this lane); the castr loop
review's territory (cross-estate findings route there as pointers).
A successful review either confirms the findings against their files or
names the specific finding, file, and mismatch.

## Leg 1 — primary-source inventory (COMPLETE, this session)

### Sweep method (published, per the ratified plan's leg 1)

1. Filename sweep for watcher-named artefacts across every projection
   tier in this repo: `ls`/glob over `.agent/skills/`, `.agent/rules/`,
   `.agents/skills/`, `.agents/rules/`, `.claude/skills/`,
   `.claude/rules/`, `.cursor/rules/` for `*watcher*`, `*liveness*`,
   `*silence*`.
2. Permission sweep: `grep -i "watcher\|slack"` over
   `.claude/settings.json`.
3. Consumer sweep: `grep -rln "SLACK_WATCHER"` over the whole repo
   (node_modules excluded) and over the castr clone.
4. Out-of-repo store sweep: `find ~/.claude` for watcher-named skills
   (caught the account-synced store at `/root/.claude/skills/synced/`)
   and the plugin registry (`installed_plugins.json` — empty).
5. Castr twin sweep: the same filename sweep over the castr clone, plus
   `diff` of every twin against its OCE counterpart.

### Inventory (every surface read in full this session)

| # | Surface | Tier | Notes |
| --- | --- | --- | --- |
| 1 | `.agent/skills/slack-watcher/SKILL-CANONICAL.md` | canonical | mantle protocol, tenure-bound vacancy validity rule, watch loop, exit criteria, fallback pairing |
| 2 | `.agent/skills/talk-to-slack-watcher/SKILL-CANONICAL.md` | canonical | correspondent protocol, silence-is-never-liveness reading, never-take-mantle |
| 3 | `.claude/skills/oak-slack-watcher/SKILL.md` + `oak-talk-to-slack-watcher/SKILL.md` | Claude adapter | thin pointers; descriptions verbatim-synced; drift gate-checked by `skills:check` (pre-push) |
| 4 | `.agents/skills/oak-slack-watcher/SKILL.md` + `oak-talk-to-slack-watcher/SKILL.md` | cross-tool adapter | thin pointers, same descriptions |
| 5 | `.claude/settings.json:79-82` | permissions | `Skill(oak-slack-watcher)`, `Skill(oak-talk-to-slack-watcher)` + `:*` forms pre-approved |
| 6 | `.agent/rules/comms-all-channels-watcher.md` (+ `.agents/rules/` pointer, `.claude/rules/` pointer, `.cursor/rules/*.mdc`) | rule + 3 projections | the incoming-visibility organ; F-95 gates; PDR-133 class model |
| 7 | `.agent/rules/liveness-heartbeat-cron.md` (+ same 3 projection tiers) | rule + projections | outgoing visibility; PDR-078/ADR-186; consumer-absent exemption |
| 8 | `.agent/rules/silence-is-never-liveness.md` (+ same 3 projection tiers) | rule + projections | positive-deadman invariant |
| 9 | `.agent/skills/comms-channels/SKILL-CANONICAL.md` | canonical (overlay) | delivery lanes; agent-collaboration-channels card named as routing authority |
| 10 | `.agent/claude-harness-integrations/cloud-environment.md` §Environment settings | ops doc | `SLACK_WATCHER_CHANNEL_ID` + `SLACK_WATCHER_WORKSPACE` live in the write-only environment dialog; "not secrets"; probed live this session: both set (`C0B9AQ2BK5E` / `engraph-workspace`) |
| 11 | `.agent/plans-backlog-2026-07/slack-assistants/` (README, roadmap, `current/ask-oisin.plan.md`, `future/ask-oak.plan.md`) | backlog | adjacent Slack-assistant organ (Ask Oisín/Ask Oak); shares Slack coupling, does not define Watcher behaviour |
| 12 | `.agent/plans-backlog-2026-07/speculative/watcher-liveness-self-heal.md` | speculative idea | honest "do NOT build yet" status; names the unowned-restart gap on Claude Code |
| 13 | `.agent/research/outreach/slack-assistant-logging-observability-design.md` | research note | resolved 2026-07-08; assistant-scoped observability topology, not Watcher-scoped |
| 14 | `/root/.claude/skills/synced/oce-slack-watcher/SKILL.md` | **account-synced, out-of-repo** | a second, live, older Watcher playbook in every session's roster — see finding L1-F6 |
| 15 | castr `.agent/skills/slack-watcher/` + `talk-to-slack-watcher/` canonicals; `.claude/skills/engraph-*` + `.agents/skills/engraph-*` wrappers; `.agents/rules/` + `.cursor/rules/` watcher rules (clone `89914b4`) | castr twins | see findings L1-F1..F4 |

Plugin marketplaces: `~/.claude/plugins/installed_plugins.json` is empty
— no plugin-delivered watcher skill exists (PR #14's letter confirmed;
but see L1-F6 for its spirit).

### Drift findings

- **L1-F1 — castr `talk-to-slack-watcher` canonical: one-character
  whitespace drift.** Line 40 lost its three-space continuation indent
  (`<account holder>'s Slack):`). Semantically nil; evidences that twin
  sync is prose-discipline only — no instrument diffs cross-repo skill
  twins (the cloud-environment twins have a declared byte-identical
  doctrine; the skill twins have no equivalent check).
- **L1-F2 — castr `comms-all-channels-watcher` rule is doctrinally
  behind OCE.** Castr's canonical mandates "self-exclusion only" against
  the `(agent_name, platform, session_id_prefix)` tuple; OCE's mandates
  self-exclusion via the PDR-076a `sameAgentRoutingKey` comparator PLUS
  the sanctioned F-146 `--exclude-tag` mechanism with its
  mandatory F-75 peer-liveness pairing. A castr seat following its own
  rule is out of contract with the OCE fleet's standby economics; the
  two estates' watcher obligations have silently forked. (Routes as a
  pointer to the castr estate; recorded here as cross-estate drift
  evidence.)
- **L1-F3 — castr `liveness-heartbeat-cron`: formatting-only drift**
  (`*emphasis*` vs `_emphasis_` throughout — different formatter
  passes). Cosmetic; same no-instrument evidence class as L1-F1.
- **L1-F4 — `silence-is-never-liveness` is absent from castr
  entirely** (no canonical, no projections), while castr's
  `slack-watcher` canonical — byte-identical to OCE's — states "silence
  is never liveness" as load-bearing doctrine (§3, the fallback-pairing
  paragraph). A castr Watcher seat is told to obey a rule its estate
  does not carry. (Pointer to castr; drift evidence here.)
- **L1-F5 — OCE `.cursor/rules/comms-all-channels-watcher.mdc`
  description is stale doctrine.** It says "self-exclusion only" while
  the canonical it points at sanctions `--exclude-tag` (F-146). The
  body is a pointer so behaviour routes to canonical, but the
  description is the trigger surface a Cursor session reads first.
  Observed fact: `portability:check` and the full pre-push gate ran
  green three times this session with this drift present — rule-adapter
  description drift is not instrument-checked (skills adapters are, via
  `skills:check`).
- **L1-F6 — the account-synced `oce-slack-watcher` skill is a second,
  weaker, live Watcher protocol.** `/root/.claude/skills/synced/
  oce-slack-watcher/SKILL.md` appears in this session's skill roster
  alongside `oak-slack-watcher`, with a near-identical trigger surface
  ("become the Slack Watcher", "take over the Watcher mantle"). It
  hard-codes what the repo canonical forbids hard-coding ("Channel and
  workspace come from the environment … never from this repo"): channel
  `C0B9AQ2BK5E`, `#remote-coding`, engraph-workspace, and the first
  holder's name. Protocol-wise it predates the canonical's hardening:
  no mantle-state validity resolver, no tenure-bound vacancy sign-off,
  no gap-sweep on relief (baseline is its own intro), no exit criteria,
  no independent fallback pairing. PR #14's round-2 cure correctly
  removed the claim that this exists as a *plugin* skill; the synced
  copy survives outside the repo where no repo gate or PR can touch it.
  A session whose skill router matches the `oce-` name runs the weaker
  protocol against the same live channel — a routing-collision and
  double-delivery hazard on the very organ under review.
- **L1-F7 — inventory-shape finding (already cured in the ratified
  plan): the pre-refinement leg-1 enumeration missed four projection
  tiers.** The PR #14-cured list named only the canonicals, the
  `.claude/skills/oak-*` wrappers, and castr twins; the sweep found
  `.agents/skills/`, `.agents/rules/`, `.cursor/rules/`, the
  `.claude/settings.json` permission entries, and the out-of-repo
  synced store besides. Recorded as evidence for the discovery-sweep
  refinement the owner ratified 2026-08-24.

### Leg-1 observations carried forward to later legs (not findings yet)

- The watcher skill's liveness story (§3: self-re-arming `send_later`
  chain + "a separate long-interval scheduled check (an hourly cron
  routine or equivalent)" + on-turn overdue checks) reads as
  instrument-shaped prose; leg 2 must classify each element
  instrument-backed vs prose-only against the 2026-08-24 retrospective's
  lens, and against `watcher-liveness-self-heal.md`'s named gap (a dead
  Claude Code Monitor stays dead; the restart step is unowned).
- The Slack Watcher's mantle/liveness machinery (channel-post state
  resolution) is entirely disjoint from the estate's comms-stream
  liveness machinery (heartbeat events, F-95 asserts, PDR-133 classes)
  — the Slack channel is its own substrate with no PDR-133 class
  declaration. Leg 2/leg 3 territory.
- `cloud-environment.md` singles-sources SLACK_WATCHER_* in the
  write-only dialog (leg 4's subject); the repo reference file is the
  only readable authority, per the 2026-08-24 outage lessons.
- Both canonical skills tell an unset-variable session to "ask the
  owner — never hard-code or guess" (fail-fast posture); what a
  *partially* broken configuration does (set but wrong channel id)
  is undefined anywhere. Leg 4.

## Leg 2 — liveness and lifecycle mechanics (PENDING)

## Leg 3 — communication routing coherence (PENDING)

## Leg 4 — configuration and environment coupling (PENDING)

## Leg 5 — synthesis: verdicts and routed proposals (PENDING)
