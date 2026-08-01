---
id: the-codex-dialogues
node_type: delivery
name: "The Codex dialogues — direct cross-vendor reflective dialogue for a live seat"
overview: "A live Claude seat opens a bounded multi-turn reflective dialogue with a Codex interlocutor over a direct MCP connection to a read-only-pinned codex mcp-server; one structured comms event at dialogue close is the analysis record. First step toward invoking third-party agents as ordinary in-session capability."
status: sketch
ratified_by: null
ratified_date: null
ratified_where: null
serves: first-major-release
impact_areas:
  - practice-and-estate
tickets: []
depends_on: []
owner_gates:
  - awaiting: owner-decision
    clears_when: >-
      Jim Cresswell ratifies the direct-first v1 shape at PR review: the
      project-level codex MCP registration with the process-pinned
      read-only/no-approvals launch args, the dialogue-protocol skill and
      its exchange budget, and the close-event record shape. The
      direction, name, record purpose, and no-wrapper-in-v1 rulings are
      already his word (2026-08-01) and are not re-opened by this gate.
    expires: 2026-08-15
last_updated: 2026-08-01
---

# The Codex dialogues — direct cross-vendor reflective dialogue for a live seat

## Direction (owner word, 2026-08-01)

This capability is the first step toward invoking third-party agents from
within a session as ordinary capability. It is NOT a replacement for or
alternative to Cricket: Cricket wrappers typically run the same vendor as
the parent session, so its diversity is stance-diversity; this is
vendor-diversity — a genuinely different model family probing the seat's
reasoning over several real exchanges. The overlap in intention is
partial and deliberate. Owner rulings already given, encoded here and not
re-opened: the name is `the-codex-dialogues`; v1 is DIRECT (no conduit
wrapper); the record exists for later analysis of what is explicitly an
experimental setup, and one structured comms event at dialogue close is
its mechanism.

## Goal

A live Claude seat, mid-task, opens a bounded multi-turn reflective
dialogue with a Codex-family model — restates an uncertainty, is probed
against a different vendor's prior over several genuine turns, and
conserves a synthesis quoting Codex's final position — without a second
Practice seat being live. What exists today serves adjacent needs, not
this one: Cricket is single-shot; the `codex exec` helper recipe is
one-shot with no thread state; ArcAngel needs a second live seat; the
standing second-opinion grant is permission, not mechanism.

Falsifier (trial-window): if a review of close events shows cross-vendor
dialogues are not changing decisions — dissent never alters the seat's
course — the experiment reports that honestly and the capability is
retired or reshaped; there is no fold-into-Cricket disposition, because
Cricket is not this instrument's alternative.

Thread persistence, stated truthfully (review-verified against CLI
0.146.0): Codex persists each thread's rollout locally by default
(`Config.ephemeral` defaults to `false`), so a closed dialogue is
resumable in principle and its transcript survives under the Codex
home. The protocol NEVER resumes a closed thread (discipline, below) —
but persistence is not fought: for an experiment whose records exist
for later analysis, the Codex-side rollout is a free third analysis
source alongside the close event and the seat's own transcript.

## v1 decided shape — direct connection

1. **MCP registration.** The project `.mcp.json` gains one entry:

   ```json
   {
     "codex": {
       "type": "stdio",
       "command": "codex",
       "args": [
         "mcp-server",
         "-c",
         "sandbox_mode=read-only",
         "-c",
         "approval_policy=never"
       ]
     }
   }
   ```

   The launch pins are the process DEFAULT — deliberately not claimed
   as a cap. Review evidence from the upstream source (codex-rs
   `mcp_server/codex_tool_config.rs`: per-call `sandbox` values include
   `danger-full-access`, and `into_config` builds a fresh config from
   per-call overrides without carrying the launch overrides) says a
   caller passing per-call authority parameters can BROADEN a thread
   past these pins, and `approval_policy=never` suppresses prompts
   rather than denying execution. The pre-build probe settles this
   empirically (below) rather than inscribing either reading as fact.
   Authority therefore rests on three layers stated in order of real
   strength: the estate's same-UID trust ruling (the calling seat is
   already trusted with full user authority — this tool adds no new
   authority class); the skill's hard rule that a dialogue call NEVER
   passes per-call sandbox/approval parameters; and the launch-arg
   defaults for any call that omits them. Tool schemas are deferred by
   the harness, so the registration's ambient cost to unrelated
   sessions is names-only.

2. **Dialogue-protocol skill.** A canonical skill (three-layer:
   `.agent/skills/the-codex-dialogues/SKILL-CANONICAL.md` plus generated
   platform adapters) owns the protocol: when to open a dialogue (and
   when to route to Cricket — single-shot second opinion — or ArcAngel —
   live-peer dialogue), the bounded context packet (Cricket's
   OBJECTIVE FRAME / INTENT / QUESTION / RECENT ACTIONS shape, reused
   not re-minted), the exchange budget (default six, stop earlier on
   stabilised or irreconcilable positions), the one-thread discipline
   (one `codex` initialisation, every reply via `codex-reply` to that
   exact `structuredContent.threadId`), never resuming a closed thread,
   NEVER passing per-call sandbox/approval parameters (the authority
   discipline above), and — before opening any dialogue — checking
   `codex --version` against the probe's recorded version and running
   the landed probe script first on any mismatch (the version gate that
   makes an unverified CLI upgrade a loud stop instead of a silent
   drift). The conservation contract: the conserved synthesis QUOTES
   Codex's final position — in direct mode the seat holds the verbatim
   turns, so fidelity is by construction, not by discipline.

3. **The record (owner-stated purpose: later analysis of an
   experiment).** One structured comms event at each dialogue close:
   dialogue id (the Codex thread id is NOT carried — it is closed,
   never protocol-resumed, and operationally sensitive; a fresh opaque
   id is), question class, turn
   count, stop reason, harness and Codex CLI versions, outcome flag
   (position-changed / dissent-unresolved / confirmed), and a pointer to
   wherever the synthesis was conserved. The event rides the
   fold-committed comms substrate: durable, greppable, analyzable — no
   bespoke store, no hooks, no CLI (owner ruling 2026-08-01, superseding
   the sketch's ledger machinery; the seat's session transcript and the
   Codex-side rollout that persists by default under the Codex home are
   free second and third analysis sources in direct mode).

## Invariants — stated honestly

One initialisation per dialogue, reply-to-exact-thread, no resumption of
closed threads, and no per-call authority parameters are ALL skill
discipline, not machine enforcement. The thread-discipline violations
cost wasted spend and a muddled dialogue, made visible by the close
event's turn count. The authority discipline sits inside the estate's
recorded same-UID trust ruling — the calling seat already holds full
user authority, so a seat electing to pass a broadening parameter is
the same trust question as every other tool it holds; the launch-arg
defaults cover every disciplined call, and the probe records what the
harness actually enforces. No guard hooks in v1; the verified hook
primitives (PreToolUse deny, PostToolUse capture, SubagentStop) are the
named hardening path if misuse is observed.

## Evidence-gated follow-on — the conduit wrapper (pointer, not spec)

A thin subagent conduit (dialogue outside the parent's context, synthesis
returned) becomes worth building only on measured evidence: close events
showing dialogues long enough that parent-context cost hurts. It carries
its own deferred questions — the child model tier coupled to a
verbatim-passthrough contract, per-child cost ceiling — none of which
exist in v1, where the parent holds the dialogue and adjudicates
first-hand. Do not build it speculatively.

## Pre-build verification

Before authoring the skill: run `codex mcp-server` locally WITH the
launch `-c` pins, drive one bounded codex → threadId → codex-reply
exchange end-to-end, prove a write attempt is refused on a disciplined
call, then EXPLICITLY attempt to broaden per-call (pass
`sandbox: danger-full-access` on a call) and record which layer wins —
the launch pins or the per-call override. That recorded outcome, not
any source reading, is the plan's authority evidence. Record the tested
Codex CLI version. PR 1 lands this probe as a RUNNABLE script wired to
the recorded version; the skill's version gate (dialogue-open check
above) runs it on any CLI version mismatch, so an installed upgrade is
a loud stop rather than a silently unverified surface. The vendor's MCP
reference has drifted (the original sketch's URL no longer documents
the tools), so the probe is the durable contract evidence.

## Acceptance criteria (each with a proof)

- Registration exact: the `.mcp.json` entry carries the process-level
  pins verbatim. Proof: repo-safe — config lint/pin test.
- Dialogue round-trip: one live dialogue completes within budget; the
  synthesis quotes Codex's final position; the close event appears on
  the canonical stream with every field. Proof: owner-held — one real
  seat, one real uncertainty, linked from the implementation PR.
- Authority evidenced: a disciplined call's write attempt is refused,
  AND the per-call broadening attempt's outcome is recorded (cap or
  default — whichever the harness proves). Proof: repo-safe probe
  script output, plus the owner-held live run.
- Version gate live: the skill's dialogue-open step detects a CLI
  version mismatch against the probe record and stops until the probe
  re-runs. Proof: repo-safe — skill text + probe-record pin test.
- Routing stated: the skill names the Cricket / ArcAngel / here
  boundaries so keyword routing does not misfire against Cricket's
  rubber-ducking triggers (the rename to `the-codex-dialogues` kills
  the worst collision at source; the routing language closes the rest).
  Proof: repo-safe — skill text review + adapter regeneration checks.
- Host contract first-hand: pinned Claude Code and Codex CLI versions
  with the probe script's recorded output. Proof: repo-safe script +
  owner-held run record.

## Delivery

Ticket first, embargo-aware, and binding at RATIFICATION: this plan
serves `first-major-release`, an anchored subtree (sibling plans carry
tickets), so the anchoring-consistency validator requires a ratified
delivery plan here to name a ticket — ratification itself, not just
implementation, needs one. Linear is out of bounds until 2026-08-10
08:00 London (owner ruling 2026-08-01; exceptions are one-off owner
statements only), so the plan stays `sketch` until the embargo lifts or
an owner one-off mints the ticket; `tickets: []` stands meanwhile.

- PR 1 (single story): the `.mcp.json` registration, the canonical
  skill + generated adapters, the runnable probe script with its
  recorded evidence, and the routing/usage documentation. Owner-held
  acceptance run linked before merge.

Done-test: one real seat runs one real dialogue whose close event lands
on the stream and whose synthesis is conserved with Codex's position
quoted.

## Out of scope

- The conduit wrapper (evidence-gated pointer above; its model-tier and
  cost questions travel with it).
- Any lineage store, guard hooks, or lineage CLI (owner ruling
  2026-08-01 — the close event is the record).
- Unprompted Codex wake or shared long-lived Codex processes (the
  deliberately-deferred `codex-app-server-idle-wake` plan's space, and
  the speculative `codex-upstream-idle-wake-contribution` exploration).
- Reusing or resuming Codex threads across dialogues.
- Pinning the Codex model; the CLI's configured default stays outside
  this contract.
- A Codex-initiated Claude dialogue — out of v1 scope but NO LONGER an
  unverified asymmetry: `claude mcp serve` (probed first-hand
  2026-08-01, Claude Code 2.1.220, server `claude/tengu`) exposes the
  full Claude Code toolset over stdio, including the `Agent` +
  `SendMessage` pair — spawn a named Claude interlocutor, then continue
  it with context intact — i.e. layer-B state continuation keyed by
  agent name rather than thread id. This is the named SECOND EXPERIMENT
  (owner word, 2026-08-01), and it meets the factoring trigger: the
  dialogue doctrine is now general across two verified bindings, so the
  skill is authored two-layer from day one (general invoked-dialogue
  doctrine + per-binding annex). Its own open question is authority:
  the serve surface hands the caller Bash/Edit/Write — full Claude Code
  authority — so the reverse direction needs a read-only story
  (permission mode / allowed-tools of the serving process) proven by
  its own probe before any dialogue runs.
- Changes to Cricket or ARC.

## External contract references (verification status)

- `codex mcp-server` stdio; `codex` / `codex-reply` tools;
  `structuredContent.threadId` round-trip; per-call approval/sandbox
  parameters: VERIFIED 2026-08-01 against the grounding record, with the
  original reference URL drifted — the runnable probe against the
  installed CLI is the durable evidence.
- `codex mcp-server -c sandbox_mode=read-only -c approval_policy=never`
  accepted at launch: VERIFIED first-hand against codex-cli 0.146.0,
  2026-08-01. Whether launch pins CAP per-call overrides: OPEN — review
  evidence from the upstream source says per-call `sandbox` builds a
  fresh config that ignores launch overrides; the pre-build probe's
  recorded broadening attempt is the deciding evidence.
- `Config.ephemeral` defaults `false` — Codex persists thread rollouts
  locally across process exit: review-verified against CLI 0.146.0;
  embraced by this plan as the third analysis source rather than
  fought.
- Claude Code MCP registration and deferred tool schemas: VERIFIED
  2026-08-01 at <https://code.claude.com/docs/en/mcp>.
- `claude mcp serve` (the reverse binding): VERIFIED first-hand
  2026-08-01 by live MCP probe — Claude Code 2.1.220 serves its full
  toolset over stdio (`Agent`, `SendMessage`, `Bash`, `Read`, `Edit`,
  `Write`, and the rest); `Agent` + `SendMessage` provide named-agent
  multi-turn continuation. Authority pinning on this surface: OPEN —
  its own probe gates the reverse experiment.
- Claude Code hooks (the named hardening path only): VERIFIED 2026-08-01
  at <https://code.claude.com/docs/en/hooks>.
