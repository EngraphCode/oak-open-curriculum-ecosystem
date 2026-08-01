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

   The authority pin is at the PROCESS, in the launch args (accepted by
   the installed codex-cli 0.146.0, verified first-hand 2026-08-01):
   every thread in the process is read-only/no-approvals regardless of
   per-call parameters, which remain belt-and-braces where the probe
   confirms them. Tool schemas are deferred by the harness, so the
   registration's ambient cost to unrelated sessions is names-only.

2. **Dialogue-protocol skill.** A canonical skill (three-layer:
   `.agent/skills/the-codex-dialogues/SKILL-CANONICAL.md` plus generated
   platform adapters) owns the protocol: when to open a dialogue (and
   when to route to Cricket — single-shot second opinion — or ArcAngel —
   live-peer dialogue), the bounded context packet (Cricket's
   OBJECTIVE FRAME / INTENT / QUESTION / RECENT ACTIONS shape, reused
   not re-minted), the exchange budget (default six, stop earlier on
   stabilised or irreconcilable positions), the one-thread discipline
   (one `codex` initialisation, every reply via `codex-reply` to that
   exact `structuredContent.threadId`), and the conservation contract:
   the conserved synthesis QUOTES Codex's final position — in direct
   mode the seat holds the verbatim turns, so fidelity is by
   construction, not by discipline.

3. **The record (owner-stated purpose: later analysis of an
   experiment).** One structured comms event at each dialogue close:
   dialogue id (the thread id is NOT carried — it is dead at close and
   operationally sensitive; a fresh opaque id is), question class, turn
   count, stop reason, harness and Codex CLI versions, outcome flag
   (position-changed / dissent-unresolved / confirmed), and a pointer to
   wherever the synthesis was conserved. The event rides the
   fold-committed comms substrate: durable, greppable, analyzable — no
   bespoke store, no hooks, no CLI (owner ruling 2026-08-01, superseding
   the sketch's ledger machinery; the session transcript is a free
   second analysis source in direct mode).

## Invariants — stated honestly

One initialisation per dialogue and reply-to-exact-thread are SKILL
discipline, not machine enforcement; the violation cost is wasted spend
and a muddled dialogue, made visible by the close event's turn count.
The AUTHORITY invariant does not share that soft cost profile and is
therefore pinned at process level in the launch args. No guard hooks in
v1; the verified hook primitives (PreToolUse deny, PostToolUse capture,
SubagentStop) are the named hardening path if misuse is observed.

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
process-level `-c` pins, drive one bounded codex → threadId →
codex-reply exchange end-to-end, prove a write attempt is refused, and
record the tested Codex CLI version. PR 1 lands this probe as a RUNNABLE
script wired to the recorded version, so a version-bump re-run is a
one-command act; no automatic trigger fires it at upgrades (stated, not
hidden). The vendor's MCP reference has drifted (the original sketch's
URL no longer documents the tools), so the probe is the durable contract
evidence.

## Acceptance criteria (each with a proof)

- Registration exact: the `.mcp.json` entry carries the process-level
  pins verbatim. Proof: repo-safe — config lint/pin test.
- Dialogue round-trip: one live dialogue completes within budget; the
  synthesis quotes Codex's final position; the close event appears on
  the canonical stream with every field. Proof: owner-held — one real
  seat, one real uncertainty, linked from the implementation PR.
- Authority pinned: a live write attempt inside a dialogue is refused.
  Proof: owner-held, alongside the round-trip run.
- Routing stated: the skill names the Cricket / ArcAngel / here
  boundaries so keyword routing does not misfire against Cricket's
  rubber-ducking triggers (the rename to `the-codex-dialogues` kills
  the worst collision at source; the routing language closes the rest).
  Proof: repo-safe — skill text review + adapter regeneration checks.
- Host contract first-hand: pinned Claude Code and Codex CLI versions
  with the probe script's recorded output. Proof: repo-safe script +
  owner-held run record.

## Delivery

Ticket first, embargo-aware: Linear is out of bounds until 2026-08-10
08:00 London (owner ruling 2026-08-01; exceptions are one-off owner
statements only). Gate-pass before that date holds the lane at
ticket-blocked rather than minting; `tickets: []` stands until the
embargo lifts or the owner names an exception.

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
- A Codex-initiated Claude dialogue (recorded asymmetry; the owner's
  direction makes symmetry a natural later step, as a pointer only).
- Changes to Cricket or ARC.

## External contract references (verification status)

- `codex mcp-server` stdio; `codex` / `codex-reply` tools;
  `structuredContent.threadId` round-trip; per-call approval/sandbox
  parameters: VERIFIED 2026-08-01 against the grounding record, with the
  original reference URL drifted — the runnable probe against the
  installed CLI is the durable evidence.
- `codex mcp-server -c sandbox_mode=read-only -c approval_policy=never`
  accepted at launch (process-level pin): VERIFIED first-hand against
  codex-cli 0.146.0, 2026-08-01.
- Claude Code MCP registration and deferred tool schemas: VERIFIED
  2026-08-01 at <https://code.claude.com/docs/en/mcp>.
- Claude Code hooks (the named hardening path only): VERIFIED 2026-08-01
  at <https://code.claude.com/docs/en/hooks>.
