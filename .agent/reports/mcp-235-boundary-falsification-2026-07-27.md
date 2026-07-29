---
status: permanent-dated-record
date: 2026-07-27
subject: mcp-product-analytics
identity: Swallow guards Tailwind / claude-code / claude-fable-5 / 805902
---

# MCP-235 boundary falsification — 27 July 2026

Cutter's successor record
(`mcp-63-focused-successor-handoff-2026-07-27.md`) states the falsifier for its
own proposed slicing:

> Its falsifier is any live dependency proof showing a ticket cannot be
> reviewed or validated independently; if found, document the exact
> indivisibility rather than widening by convenience.

That falsifier has fired for MCP-235. This record documents the exact
indivisibility.

## Evidence (first-hand, frozen head `aac01d12d`, verified against `origin/main` at `396dfc4c2`)

The record's eight-file MCP-235 boundary does not compile alone. It imports two
files the same record assigns to **MCP-237**:

| Importer (MCP-235) | Import | Kind | Target's assigned ticket |
| --- | --- | --- | --- |
| `event-policy.ts:18` | `projectActiveActor` from `./active-actor-projection.js` | **value** | MCP-237 |
| `event-policy-contract.ts:6` | `PostHogOperationalErrorKind` from `./product-analytics-runtime-contract.js` | type-only | MCP-237 |
| `event-policy-helpers.ts:10` | `PostHogOperationalErrorKind` from `./product-analytics-runtime-contract.js` | type-only | MCP-237 |

**The dependency on `active-actor-projection.ts` is mutual, not one-way.** That
file value-imports `isActorPseudonym` and `reportSafely` from
`./event-policy-helpers.js` — an MCP-235 file. The two are cyclically bound
across the ticket boundary and cannot land in separate pull requests in either
order.

`product-analytics-runtime-contract.ts` (68 lines, contract-only: the EU
ingestion host literal and the operational-error kinds) is the one separable
piece: it imports only `actor-pseudonym-contract.js` and
`@oaknational/build-metadata`, both already on main.

Three vendor dependencies also first arrive with this slice and are absent from
the package manifest on main: `posthog-node`, `@posthog/mcp`, and
`@modelcontextprotocol/sdk`.

## Consequence for the stack

The minimal boundary that compiles and can be proven is **twelve files**: the
record's eight, plus `active-actor-projection.ts`,
`product-analytics-runtime-contract.ts`, `package.json`, and `pnpm-lock.yaml`.
This shrinks MCP-237 to `product-analytics-sink.ts` and its integration test.

The considered alternative — pre-slicing `product-analytics-runtime-contract.ts`
as its own three-file PR, leaving MCP-235 at nine — is sound but buys one file
of review surface for an extra settle-and-merge round trip.

This is the same shape as the sanctioned MCP232+MCP233 bundle: indivisible
because the *proof* is indivisible, not because combining was convenient. It is
not precedent for combining later independent tickets.

## Authority boundary

Ticket scope belongs to the Director. This record states the evidence and the
recommendation; the slicing decision and any ticket-description correction are
routed, not taken here.

## What this says about the parent record

Nothing that weakens it. The record explicitly published its own falsifier and
labelled the extraction map a *candidate* requiring verification against the
live ticket and main before editing. Running that verification is what surfaced
this, roughly fifteen minutes into the slice, before any code was written — the
discipline worked exactly as designed.
