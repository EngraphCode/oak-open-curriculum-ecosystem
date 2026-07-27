---
status: permanent-dated-record
date: 2026-07-27
capture_boundary_utc: 2026-07-27T19:50:00Z
subject: mcp-product-analytics
identity: Swallow guards Tailwind / claude-code / claude-fable-5 / 805902
supersedes_partially: mcp-63-focused-successor-handoff-2026-07-27.md
---

# MCP-63 stack successor handoff — evening of 27 July 2026

Self-contained successor record for the MCP-63 replacement stack at the point
three further slices landed. It continues
[`mcp-63-focused-successor-handoff-2026-07-27.md`](mcp-63-focused-successor-handoff-2026-07-27.md)
(Cutter hunts Lagoon's record), which remains authoritative for everything it
states except the extraction-map corrections recorded below.

Written at ~70% seat headroom by deliberate choice, at the Director's ask:
a clean record now is worth more than a fourth slice and a cliff.

## State at the capture boundary

| Ticket | PR | Merge commit | State |
| --- | --- | --- | --- |
| MCP-230 | #585 | `4c677f391` | Done (prior seat) |
| MCP-231 | #586 | `8dba5ab53` | Done (prior seat) |
| MCP-232 + MCP-233 | #592 | `f2c1d75ae` | Done (Director) |
| **MCP-234** actor pseudonyms | **#598** | `396dfc4c2e8e` | **Done** |
| **MCP-235** event policy | **#599** | `54e6cf5bf982` | **Done** |
| **MCP-236** transport observer | **#600** | `b0a2f832a428` | **Done** |
| MCP-237 | — | — | **Not started; scope narrowed, see below** |
| MCP-238 | — | — | Not started |
| MCP-239 – MCP-244 | — | — | Not started |

`main` at capture: `b0a2f832a428`. Every slice above went green on CI first
time except MCP-234, which needed two cure rounds (recorded below).

**#576 stays open.** Its close condition — every replacement through MCP-238
has a pushed and linked PR — is still false. Frozen head unchanged:
`aac01d12dd696e4e1831a683b41fde692be721ca`.

## Corrections to the parent record's extraction map

The parent record labelled its map a *candidate* requiring verification against
the live ticket and `main` before editing. Running that verification caught two
things it could not have known. **Run it every time**; it has now paid twice.

### 1. MCP-235's eight-file boundary was not compilable (ruled and executed)

Full evidence:
[`mcp-235-boundary-falsification-2026-07-27.md`](mcp-235-boundary-falsification-2026-07-27.md).
`event-policy.ts` value-imports `projectActiveActor` from
`active-actor-projection.ts`, which value-imports `isActorPseudonym` and
`reportSafely` back from `event-policy-helpers.ts` — a mutual cycle across the
record's MCP-235/MCP-237 line, so no PR ordering existed in which either side
compiled. `product-analytics-runtime-contract.ts` came with them (both the
policy contract and its helpers type-import its operational error kinds).

Director-ruled as one indivisible landing, the MCP232+233 shape: bundled
because the *proof* is indivisible, and explicitly **not** precedent for
combining later independent tickets.

### 2. MCP-237 is therefore narrowed

**True remaining scope: `product-analytics-sink.ts` and
`product-analytics-sink.integration.test.ts`.** Recorded on the ticket itself so
its carrier reads truth rather than the superseded map. The three vendor
dependencies (`posthog-node`, `@posthog/mcp`, `@modelcontextprotocol/sdk`)
already arrived with MCP-235, and `@oaknational/observability` with MCP-236, so
a manifest change may not be needed at all.

### 3. The parent record's open MCP-238 Vitest question is answered

A package-local `vitest.config.ts` re-exporting the root `baseTestConfig` **is**
the house pattern — six of six sibling `packages/libs/*` carry it. A freshly
scaffolded package also needs `vitest.config.ts` added to the config-files
override in its own `eslint.config.ts`, or the relative import of the shared
base trips `import-x/no-relative-packages`. Both landed with MCP-234. This is
no longer an open question, and the file-ceiling worry attached to it is
discharged.

## Ceiling overruns: two, both named rather than absorbed

| Slice | Ceiling | Landed | Why |
| --- | --- | --- | --- |
| MCP-234 | 7 | 8 | The test scaffold the package had never had (`vitest.config.ts` + the one-line ESLint override). **Probed, not assumed**: the suite passes without it, so it is repo-consistency, not proof-required. Director accepted. |
| MCP-235 | 8 (12 ruled) | 13 | `knip` correctly failed on three unused exports in the early-arriving `product-analytics-runtime-contract.ts`; the cure was publishing the contract's real public surface through the package index, which is exactly what the frozen source's index does. Director accepted. |

The discipline that made both acceptable: probe rather than assume, name the
overrun in the PR body with evidence, and route scope changes rather than
taking them. A ceiling exists to stop scope creep, not to force a package to be
the only one in the repo without a test config.

## A proof gap worth knowing about

MCP-234's inherited suite proved the *principal* is never serialised but never
asserted the same of the **key** — the actual secret, since the principal is
pseudonymous input already — while the ticket's proof contract named
"secret-non-disclosure". One case was added rather than extracted: it projects
with a distinctive key and fails on a leak in hex, base64, base64url or
byte-array form, across both projectors and both error paths.

**Read each ticket's own stated proof set against the extracted suite.** The
parent record's summaries are shorter than the tickets. MCP-236's ticket names
six obligations (correlation, overlapping IDs, callback order, metadata/options
identity, promise identity, fail-open); all six were confirmed present before
merging, promise identity by reference equality.

## Operational facts earned this session

- **`Vercel` is a required status context and publishes no check-run.** A
  check-runs-only settle read goes green while a required context is pending or
  failed. Derive required contexts from `/rules/branches/main`, then read each
  by name across **both** `/commits/{sha}/check-runs` and
  `/commits/{sha}/status`. Now the estate standard.
- **The bot token can expire *during* the pre-push gate chain**, because that
  chain runs inside `git push` and it is long. The signature is a bare `403` on
  write while reads still succeed. Cure: re-mint and retry — not a permissions
  investigation.
- **`git push … | tail; echo $?` reports `tail`'s status, not git's.** It
  printed `EXIT:0` over a failed push here; the failure was visible only from
  the absent remote ref. Redirect to a file and echo `$?` un-piped.
- The merge endpoint requires the **full 40-character SHA**; an abbreviated one
  returns 422.
- Fresh worktrees need `pnpm install` **and**
  `pnpm turbo build --filter=<pkg>^...` before type-check resolves workspace
  dependencies.

## First successor action

1. Read the parent record and this one; the pair is complete.
2. Take MCP-237 at its **narrowed** scope. Verify the map against `main` first —
   it has caught something twice.
3. Extract by path from frozen `aac01d12d`; never cherry-pick its mixed commits.
4. One replacement PR open at a time. Merge at settled under the standing
   mandate, both surfaces by name.
5. Mint the bot token immediately before each push:
   `pnpm --silent agent-tools merge-bot mint-token` (no `--` before
   `merge-bot`).

## Definition of done, unchanged

The stack is complete only when MCP-230–MCP-244 have settled under their ticket
proofs, #576's preservation condition is true and it is closed without merging,
MCP-63's acceptance evidence is current, and the final built application proves
the ratified privacy and lifecycle contract. A useful partial slice is not
completion.
