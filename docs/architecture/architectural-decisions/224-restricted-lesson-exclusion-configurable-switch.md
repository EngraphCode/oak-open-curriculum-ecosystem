# ADR-224: Restricted-lesson exclusion is a documented, configurable switch

**Status**: Accepted  
**Date**: 2026-08-12  
**Related**: ADR-093 (Bulk-First Ingestion Strategy), ADR-089 (Index-Everything Principle), ADR-140 (Search Ingestion / SDK Boundary), MCP-204 (restriction concept in search), MCP-590 (lesson-search Bucket 1)

## Context

Restricted lessons — those upstream flags `restricted: true`, whose usage
licence does not permit serving — have been excluded from every generated and
served search surface since the MCP-204 ruling (owner-directed, 2026-07-27,
"we filter what goes in"). That exclusion was implemented as a hardcoded,
unconditional filter (`excludeRestrictedLessons` in `@oaknational/sdk-codegen`),
applied at two generation call sites: the Elasticsearch ingest boundary
(`apps/oak-search-cli`) and the vocab-gen pipeline.

The exclusion is a product decision, not a technical constraint, and MCP-204
always named it revisitable post-submission (e.g. index-all + filter-at-query).
A hardcoded filter makes revisiting a code edit, and leaves the current policy
implicit rather than stated. The owner ruled (2026-08-12): keep restricted
lessons out for now, but make the choice a documented, configurable switch.

## Decision

The restricted-exclusion policy is one switch — a parameter on the SDK filter —
not a hardcoded filter and not a new config system.

- `excludeRestrictedLessons(files, { includeRestricted })` takes an options
  object; `includeRestricted` defaults to `false` (exclude), reproducing the
  standing behaviour byte-for-byte. When `true`, the files pass through
  unchanged and the excluded count is zero.
- The switch is threaded, without inversion, through both exclusion call sites
  and surfaced as a documented `--include-restricted` flag on the
  `admin versioned-ingest` and `admin stage` commands (mirroring `--bulk-dir` /
  `--subject-filter`). The vocab-gen pipeline reads it from
  `PipelineConfig.includeRestricted`.
- The `admin verify` expected-document count is derived from the indexed stats,
  so it tracks the switch automatically — there is no third policy edit.

The policy is recorded here, in this ADR, not in the stale `INGESTION-GUIDE.md`
runbook (which documents a superseded `es:ingest` interface).

## Consequences

- Revisiting the policy is a config change (`--include-restricted`), not a code
  edit; the current choice (exclude) is stated, not implicit.
- **Including restricted lessons is not free.** `--include-restricted` only
  removes the exclusion at the generation boundary; it does NOT mark the
  retained lessons as restricted in the produced documents. Serving restricted
  lessons correctly additionally requires threading the `restricted` flag
  through the lesson-document builder so included lessons are labelled in
  results (and downstream consumers honour it). That work is named, not built
  here (MCP-590 Bucket 1, Out of scope). So `--include-restricted` today
  produces an index that serves restricted lessons UNMARKED — appropriate for
  testing and measurement, not for a licence-compliant served surface until the
  follow-on lands.
- No behaviour change at the default: existing ingests and codegen runs exclude
  exactly as before.
