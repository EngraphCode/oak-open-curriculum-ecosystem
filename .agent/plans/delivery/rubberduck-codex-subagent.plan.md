---
id: rubberduck-codex-subagent
node_type: delivery
name: "Rubberduck Codex subagent — isolated child bridge and local lineage"
overview: "Add one Claude rubberduck wrapper that gives every child its own Codex MCP process and thread, with minimal untracked lineage from the parent Claude session through that child to the Codex thread."
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
      Jim Cresswell ratifies the one-child/one-process/one-thread ownership
      boundary, the intentional Claude Sonnet 5 model pin at high effort, and
      the machine-local lineage schema before implementation starts
    expires: 2026-08-15
last_updated: 2026-08-01
---

# Rubberduck Codex subagent — isolated child bridge and local lineage

## Goal

A Claude parent can invoke `rubberduck-codex` through Claude Code's ordinary
subagent mechanism and receive a reflective Codex response without loading
Codex MCP tools into the parent. Every child invocation owns exactly one
`codex mcp-server` process and one Codex thread. Machine-local operational
memory can later answer which parent Claude session reached which Codex thread
through which child Claude agent, without tracking prompts or responses.

## Decided shape

The implementation adds a platform-independent workflow template at
`.agent/sub-agents/templates/rubberduck-codex.md` and a thin Claude wrapper at
`.claude/agents/rubberduck-codex.md`. The wrapper loads the template as its
first action, following the repository's three-layer subagent architecture.
The template owns the rubberduck workflow and response contract. Claude-only
frontmatter, MCP lifecycle, and hook wiring stay in the Claude wrapper.

The wrapper deliberately pins Claude Sonnet 5 at high effort because that is
part of this agent's requested capability contract, rather than inheriting the
parent model. Its frontmatter is equivalent to:

```yaml
---
name: rubberduck-codex
description: >-
  Use when a parent Claude session needs a bounded Codex rubberduck dialogue
  for reflection, challenge, or design clarification.
model: claude-sonnet-5
effort: high
tools: mcp__codex__codex, mcp__codex__codex-reply
mcpServers:
  - codex:
      type: stdio
      command: codex
      args: ["mcp-server"]
---
```

The exact model identifier is validated against the Claude wrapper schema and
the installed Claude Code version during implementation. If the requested
full identifier is not accepted by that version, implementation stops for an
owner decision rather than silently substituting `sonnet` or `inherit`.

## Ownership and lifecycle invariants

- One Claude child invocation owns one inline `codex` stdio server definition.
  Claude starts that process for the child and disconnects it when the child
  finishes or is cancelled.
- The Codex server is not registered in project `.mcp.json`, parent settings,
  or any shared daemon. The parent therefore cannot call its tools and two
  children cannot accidentally share one process.
- One child calls `mcp__codex__codex` exactly once. The returned
  `structuredContent.threadId` becomes that child's sole Codex thread.
- Every later turn calls `mcp__codex__codex-reply` with that exact thread ID.
  Starting a second Codex thread, switching IDs, or replying before an initial
  ID has been recorded fails closed.
- Child completion closes the MCP transport. No Codex process or thread is
  retained for reuse by a later Claude child.
- Startup failure, a missing thread ID, a process exit, or lineage-write
  failure ends the child visibly. There is no fallback to a shared server or
  an unrecorded conversation.

This boundary allows several parent or child sessions to run concurrently:
`N` live `rubberduck-codex` children imply `N` separately spawned MCP
processes and at most `N` separately initialised Codex threads. The design does
not require multiple parent Claude processes, a long-lived Codex app server,
or a new provider abstraction.

## Rubberduck protocol

The canonical template keeps the task narrow: restate the uncertainty, send a
bounded context packet to Codex, probe the disagreement or hidden assumption,
and return a concise synthesis to the parent. It does not delegate execution,
edit files, or expose generic shell and repository tools.

The first `codex` call contains the parent's question and only the minimum
repository context supplied to the child. Follow-up calls use `codex-reply`
only when a discriminating question materially improves the synthesis. The
child reports Codex's thread ID only in local operational state, not in its
normal response. The parent receives conclusions, unresolved disagreement,
and suggested next evidence—not a transcript dump.

## Untracked operational lineage

The implementation reserves:

```text
.agent/state/collaboration/rubberduck-codex-lineage/
```

The directory is added to the root `.gitignore`. It is runtime operational
memory: local to one checkout, absent from commits, and not a replacement for
tracked collaboration records. One immutable JSON record is written per
successful initial Codex call:

```json
{
  "schema_version": "1.0.0",
  "parent_claude_session_id": "...",
  "child_claude_agent_id": "...",
  "codex_thread_id": "...",
  "created_at": "2026-08-01T00:00:00.000Z"
}
```

The filename is collision-resistant and sortable, derived from the UTC
creation time plus the child-agent identifier. The writer creates the
directory with owner-only permissions where the platform supports them,
writes a sibling temporary file, fsyncs where available, and atomically
renames it. Existing records are never amended in place.

The record deliberately excludes prompts, replies, summaries, repository
paths, working directories, user or account identifiers, credentials, MCP
transport data, process environment, and tool output. Session, child, and
thread identifiers are still operationally sensitive metadata: readers must
not print them incidentally in routine logs, and state files use restrictive
permissions.

## Hook and guard contract

Claude subagent hooks provide the three identifiers without teaching the
rubberduck prompt to persist them:

1. A `PostToolUse` hook scoped to `mcp__codex__codex` receives the Claude
   `session_id`, child `agent_id`, and successful tool response. It validates
   `tool_response.structuredContent.threadId` as a non-empty string and writes
   the immutable lineage record.
2. A `PreToolUse` hook for a second `mcp__codex__codex` call denies the call
   once that child has a lineage record.
3. A `PreToolUse` hook for `mcp__codex__codex-reply` requires an existing
   record for the same parent/child pair and exact equality between the
   requested `threadId` and recorded Codex thread ID.
4. `SubagentStop` verifies that a child which called either Codex tool has one
   complete, coherent lineage record. It reports incomplete state visibly but
   never invents a thread ID.

Checked hook logic lives in `agent-tools`, with thin hook entrypoints and
project wrapper configuration. Root-level script logic is not introduced.
Schemas are closed, invalid or extra fields fail validation, and tool response
parsing treats all provider data as untrusted input.

The implementation must probe the installed Claude Code hook payloads before
landing. The current design relies on documented `session_id`, subagent
`agent_id`, and `PostToolUse` response fields; if any is unavailable in the
supported host version, lineage is unsupported and the wrapper must not ship
with a weaker inferred identity.

## Reader and repair surface

Add a small deterministic operator surface under the existing agent-tools
CLI:

```text
pnpm agent-tools rubberduck-codex lineage list
pnpm agent-tools rubberduck-codex lineage show <child-agent-id>
pnpm agent-tools rubberduck-codex lineage check
pnpm agent-tools rubberduck-codex lineage prune --before <UTC-instant>
```

`list` emits bounded metadata in creation order; `show` requires an exact
child ID; `check` reports malformed, duplicate, orphaned, and internally
inconsistent records without rewriting them. `prune` is the only deletion
path, requires an explicit UTC boundary, previews its count unless confirmed,
and never follows symlinks. Repair means quarantine and explain, not infer or
rewrite missing identities.

There is no automatic upload, cross-checkout synchronisation, background
retention service, or claim that this local ledger is an audit log. Its sole
question is: for this checkout, which parent Claude session indirectly spoke
to which Codex thread through which child Claude agent?

## Acceptance criteria (each with a proof)

- **The Claude wrapper is exact and discoverable.** It is named
  `rubberduck-codex`, loads the canonical template first, pins
  `claude-sonnet-5`, sets `effort: high`, and grants only the two Codex MCP
  tools. Proof: `repo-safe` — wrapper-schema, name/path, composition,
  discoverability, and `pnpm subagents:check` tests.
- **Every child owns its MCP process.** Two simultaneous children start two
  distinct `codex mcp-server` PIDs; cancelling one closes only its transport
  and leaves the other usable. Neither process appears in parent MCP config.
  Proof: `repo-safe` — fake-stdio lifecycle/concurrency tests; `owner-held` —
  a live Claude Code run records bounded PID and teardown evidence.
- **Every child owns exactly one Codex thread.** A child can initialise once
  and reply only to the returned thread ID. Second initialisation, pre-init
  reply, switched ID, absent ID, and server failure all fail closed. Proof:
  `repo-safe` — hook and fake-MCP integration tests; `owner-held` — two live
  children return independent rubberduck syntheses.
- **Lineage answers the required relationship.** A successful initial call
  creates exactly one immutable record containing parent session, child agent,
  Codex thread, schema version, and UTC creation time. Proof: `repo-safe` —
  literal hook fixtures, atomic-writer tests, concurrent-child tests, and
  list/show/check CLI golden tests.
- **Operational memory stays untracked and bounded.** The state directory is
  ignored, `git status --short` remains empty after a fixture run, permissions
  are restrictive where supported, schemas reject extra or transcript-bearing
  fields, and pruning cannot escape the directory. Proof: `repo-safe` — ignore,
  sanitiser, hostile-path, symlink, permission, and prune dry-run tests.
- **The supported host contract is first-hand.** The landing records the
  Claude Code and Codex CLI versions, proves documented hook fields and inline
  MCP behaviour, and proves that `codex` returns the thread ID consumed by
  `codex-reply`. Proof: `owner-held` — a safe local acceptance run linked from
  the implementation pull request, with secrets and conversation content
  removed.

## Todos

- **A — contracts and adversarial fixtures (one PR; at most two review
  rounds).** Add closed lineage schemas, hook payload fixtures, atomic storage,
  ignore rule, deterministic reader/checker, and failure/concurrency tests.
- **B — Claude wrapper vertical (one PR; at most two review rounds).** Add the
  canonical rubberduck template, thin Claude Sonnet 5/high-effort wrapper,
  inline per-child Codex MCP server, hooks, and fake-stdio end-to-end proof.
- **C — live host proof and runbook (one PR; at most two review rounds).** Pin
  the supported Claude Code/Codex CLI evidence, run concurrent child and
  teardown canaries, document bounded operation and pruning, and ratify the
  user-visible invocation contract.
- **D — corpus integration (one PR; at most two review rounds).** Add the
  subagent to current inventories and routing guidance, regenerate platform
  adapters where applicable, and run the complete agent-estate validation.

## Out of scope

- A generic Claude-to-arbitrary-provider subagent framework.
- A shared or long-lived Codex MCP/app-server pool.
- Reusing Codex threads across child invocations or resuming them later.
- Letting the parent Claude session call Codex MCP tools directly.
- Persisting prompts, responses, transcripts, summaries, credentials, or
  environment details.
- Cross-machine identity, central observability, billing attribution, or an
  authoritative audit trail.
- Automatic code changes or execution by the rubberduck agent.
- Pinning the Codex model; the Codex CLI's configured default remains outside
  this wrapper's contract.

## External contract references

- Claude Code subagents: <https://code.claude.com/docs/en/sub-agents>
- Claude Code hooks: <https://code.claude.com/docs/en/hooks>
- Codex as an MCP server: <https://developers.openai.com/codex/mcp/>
