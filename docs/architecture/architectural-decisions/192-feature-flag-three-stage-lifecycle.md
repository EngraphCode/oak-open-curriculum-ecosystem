# ADR-192: Feature-Flag Three-Stage Lifecycle

**Status**: Accepted (amended 2026-07-23)

> **Amendment (2026-07-23 — mcp-101 visible-surface allowlist).** A second
> exit from the lifecycle now exists: a flag whose ONLY job is
> registration-surface membership can be superseded by the declarative
> served-surface definition rather than completing the three stages. Worked
> instances: `OAK_CURRICULUM_MCP_USER_SEARCH_ENABLED` (pre-release, exited
> at stage 1) and `OAK_CURRICULUM_MCP_EEF_ENABLED` (release-pre-proof,
> exited at stage 2) — both now live/dormant rows in
> `apps/oak-curriculum-mcp-streamable-http/src/served-surface/`, where
> enabling or disabling is a reviewed change. The lifecycle below still
> governs flags for runtime behaviour (kill-switches whose flip must not
> require a deploy).
> **Date**: 2026-06-06 (ratified by owner 2026-06-06)
> **Related**:
> [ADR-191](191-deterministic-data-surface-agent-reasons.md)
> (the EEF evidence surface that introduced the live instance of this lifecycle);
> the EEF plan's **D7** in
> `eef-graph-tool-completion.plan.md`
> (the pre-release → release-pre-proof move in flight);
> `eef-outcome-evaluation-infrastructure.plan.md`
> (owns the post-proof flag removal).

## Context

Oak ships surfaces that are engineering-complete but not yet value-proven (for
example the EEF evidence tools) behind an environment-variable feature flag such
as `OAK_CURRICULUM_MCP_EEF_ENABLED`. The lifecycle of such a flag — its default,
who flips it, and when it is removed — was an undocumented owner convention,
re-derived at each go-live edit. This ADR records the convention so go-live and
kill-switch work cites it rather than re-deriving it.

## Decision

A feature flag moves through three stages:

1. **Pre-release.** The flag defaults to `false`; only an explicit `true` env
   value enables the surface. Used while the surface is not yet live (for example
   `OAK_CURRICULUM_MCP_EEF_ENABLED` before EEF D7).
2. **Release-pre-proof.** The flag defaults to `true`; only an explicit `false`
   disables it (the kill-switch). Merging the PR makes the surface live in
   deployed environments with no separate env step, while it is
   engineering-complete and potentially — but not yet proven — valuable.
3. **Release-post-proof.** The flag is removed; the surface is unconditionally
   registered. This happens only after the delivered-value proof passes.

## Consequences

- Go-live and kill-switch edits cite a settled convention instead of
  re-deriving the default and the owner-of-the-flip per surface.
- The default flip (`false` → `true`) is the live-on-merge moment; the explicit
  `false` kill-switch is the rollback lever during release-pre-proof.
- Flag removal is gated on a value proof, not on engineering completion — the two
  are distinct: a surface can be complete and live yet not yet proven, which is
  exactly the release-pre-proof state.
