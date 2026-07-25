# Hooks Portability Plan

**Status**: Future enforcement promotion (capability research refreshed
2026-07-25; initial shared-core/thin-adapter architecture already present)
**Parent**: [ADR-125 (Agent Artefact Portability)](../../../../docs/architecture/architectural-decisions/125-agent-artefact-portability.md)
**Related**: [ADR-125 (Agent Artefact Portability)](../../../../docs/architecture/architectural-decisions/125-agent-artefact-portability.md)

## Context

ADR-125 established the three-layer model for agent artefacts: canonical
content in `.agent/`, thin platform adapters, and entry points. Hooks are
already partially inside that model:

- canonical policy lives in `.agent/hooks/policy.json`;
- shared enforcement runtime lives in `agent-tools`;
- Claude Code activates the command/content guard through a thin
  `PreToolUse` adapter;
- Codex activates a soft identity-context adapter through `SessionStart`.

The remaining problem is enforcement parity, not introducing hooks as a new
artefact type.

This plan describes the **remaining target enforcement architecture**, not the
current repo-local hook baseline. The authoritative local contract remains
[`cross-platform-agent-surface-matrix.md`](../../../memory/executive/cross-platform-agent-surface-matrix.md),
and the independently researched Codex capability baseline is the
[Codex CLI capability catalogue](../../../reports/agentic-engineering/codex-cli-agentic-capability-catalogue-2026-07-25.md).

Target-state platform posture:

| Platform | Repo-local status today | Target activation path if promoted |
| --- | --- | --- |
| Claude Code | Supported for tracked `PreToolUse` only | `.claude/settings.json` `hooks` key |
| Cursor | Unsupported in the local support matrix | `.cursor/hooks.json` after fresh verification and wiring |
| Gemini CLI | Unsupported in the local support matrix | `.gemini/settings.json` `hooks` key after fresh verification and wiring |
| Codex | Stable hooks; tracked `SessionStart` identity adapter only | Add a thin `PreToolUse` schema adapter in `.codex/`; retain shared policy/runtime |

## Problem Statement

Without completing the canonical enforcement path:

1. Codex does not receive the same deterministic command/content guard as
   Claude Code.
2. A copied guard would drift from the canonical policy and shared runtime.
3. Treating unlike vendor payloads as one loose schema risks both false allows
   and false blocks.

## Related Strategic Work

Hook portability covers native lifecycle integration only. Durable
session-associated metadata is broader than that: wrapper-only and importer-only
vendors need the same canonical storage and query contract even when no native
hook surface exists.

See [Cross-Vendor Session Sidecars — Strategic Plan](./cross-vendor-session-sidecars.plan.md)
for the local-first sidecar model and
[Manifest-Driven Adapter Generation — Strategic Plan](./adapter-generation.plan.md)
for adjacent wrapper automation. Sidecars are complementary infrastructure, not
a prerequisite for basic hook adoption.

## Proposed Architecture

Complete the existing shared-core/thin-vendor-adapter model:

```text
.agent/hooks/policy.json                 # Canonical behavior and reappraisals
agent-tools/src/hook-policy/             # Shared typed policy/runtime core

.claude/settings.json                    # Native activation and matcher
.claude/hooks/run-pretooluse-guard.mjs   # Claude payload/verdict adapter

.codex/config.toml                       # Native activation and matcher
.codex/hooks/*.mjs                       # Codex payload/verdict adapters
```

### Shared core

The core owns:

- canonical policy loading and validation;
- concept-grouped command/content decisions;
- vendor-neutral allow/block reasons and reappraisal text;
- tests over canonical input and output;
- explicit failure categories, without vendor-specific exit codes or response
  envelopes.

It does not inspect environment variables or loose property guesses to infer
the vendor.

### Thin vendor adapters

Each adapter owns only:

- its vendor's strict accepted input schemas;
- translation into canonical input;
- translation of the canonical verdict into native stdout/exit semantics;
- project-root discovery and invocation of the prebuilt shared runtime;
- observable missing-build and malformed-input behavior.

Multiple supported schemas are explicit alternatives. Exactly one schema must
match. Zero or multiple matches fail closed; the dispatcher never guesses a
vendor or accepts a permissive union which accidentally treats malformed input
as a different vendor. A successfully dispatched write request loads one
validated policy snapshot and receives exactly one canonical policy evaluation
before the matched adapter renders the native response. No adapter may create a
second policy implementation or a pass-through route.

Platform-specific hook types and hosted-tool gaps remain in native config and
tests. They do not inflate the shared core into a lowest-common-denominator
framework.

## Promotion order

| Capability | Event | Current state | Promotion target |
| --- | --- | --- | --- |
| Command guard | `PreToolUse` shell | Canonical core + Claude adapter | Codex thin adapter over the same core |
| Content guard | `PreToolUse` edit/patch | Canonical core + Claude adapter | Codex tool-schema adapters over the same core |
| Session identity | `SessionStart` | Claude and Codex thin adapters | Keep soft; improve only from observed failures |
| Hook failure capture | Adapter/runtime boundary | Claude logging exists | Equivalent observable Codex failure record |
| Other lifecycle behavior | Other native events | Not promoted by this plan | Separate evidence and value case first |

## Open Questions

1. Beyond the observed `apply_patch` payload (`tool_input.command` containing
   the patch program), which strict Codex schemas cover shell and MCP local
   function tools in `0.145.0`?
2. What fail-closed verdict should the Codex adapter emit for zero or multiple
   schema matches, and how is that failure made observable without bricking a
   fresh checkout?
3. Which tool inputs Codex permits `PreToolUse` to rewrite, and which guard
   paths should remain decision-only?
4. Which missing-build, crash, timeout, malformed-input, concurrent-hook, and
   trust cases require integration fixtures beyond core unit tests?
5. How will release refresh detect a changed vendor schema before it becomes a
   false allow?

## Phases

### Phase 0: Research and Design

- Treat the 2026-07-25 Codex catalogue as the completed Codex capability probe
- Capture pinned Codex `PreToolUse` allow/block/rewrite fixtures
- Reconcile any promotion proposal against the local support matrix before
  wiring new activation surfaces
- Specify multiple strict vendor schemas with exactly-one-match arbitration
- Fail closed for zero or multiple schema matches
- Prove one canonical policy evaluation for each successfully dispatched write
  request and prohibit pass-through routes
- Preserve the established TypeScript shared runtime and thin Node adapters
- Reconcile ADR-125 and the matrix with the already-wired Codex adapter

### Phase 1: Shared runtime and Codex schemas

- Add strict Codex input schemas without weakening existing Claude schemas
- Add schema routing with tested zero-match and multiple-match failures
- Translate supported inputs into the existing canonical command/content core
- Unit-test allow, block, malformed, ambiguous, no-match, and evaluation-count
  behavior

### Phase 2: Codex activation and integration proof

- Add the Codex `PreToolUse` adapter and matcher in `.codex/`
- Verify shell and patch/edit guard calls through real Codex invocations
- Prove missing-build, runtime-failure, timeout, trust, and concurrent-hook
  semantics
- Record the paths hooks do not cover

### Phase 3: Other platforms or lifecycle events

- Require a fresh official-source capability probe per platform
- Promote only a demonstrated Practice need
- Keep separate native adapters and the same canonical core
- Update documentation, the matrix, and ADRs from verified runtime evidence

## Risks and Mitigations

| Risk | Mitigation |
| --- | --- |
| Input schemas drift | Pin fixtures to the CLI release; reject unknown schemas and refresh on upgrade |
| Hooks slow down agent workflow | Keep hooks fast (< 1s); use async where supported |
| Vendor schemas differ | Keep strict thin adapters; require exactly one schema match and fail closed for zero or multiple matches |
| A feature flag is mistaken for CLI coverage | Require official surface docs plus an installed-runtime probe for each relied-on path |
| Codex hosted tools bypass local hook dispatch | Claim coverage only for probed local function-tool paths |
| Tool names differ | Keep matchers and tool-name translation in the vendor adapter |

## Dependencies

- ADR-125 (three-layer model) — already accepted
- Codex capability probe — complete in the version-pinned 2026-07-25 catalogue
- Repo-local enforcement beyond Claude Code `PreToolUse` — requires
  implementation, integration tests, and matrix updates
- Shared matrix / ADR-125 sequencing — apply only after the active Copilot
  documentation changeset lands

## Non-Goals

- Replacing Cursor's activation triggers (`.mdc` rules) with hooks — triggers and hooks serve different purposes
- Creating a universal hook abstraction layer — the thin-wrapper pattern is sufficient
- Treating hosted Web Search or specialized execution paths as guarded without
  direct evidence
