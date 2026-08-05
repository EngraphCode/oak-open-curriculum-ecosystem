# ADR-222: Bulk schema contract — interim hand-truing, then full derivation from the upstream schema

- **Status**: Accepted (owner ruling 2026-08-03, recorded verbatim below)
- **Date**: 2026-08-03
- **Deciders**: Jim Cresswell (owner); recorded at the Director seat (Magnetar
  binds Oblivion, 74d914) during the upstream-update investigation lane

## Context

The estate validates Oak curriculum bulk-download data with hand-written Zod
schema templates
(`packages/sdks/oak-sdk-codegen/code-generation/typegen/bulk/schema-templates*.ts`,
generated into `src/types/generated/bulk` by `bulkgen`). The templates were
authored by reconstruction from observed data at a time when upstream declared
no schema for the bulk format.

That premise has changed, discovered first-hand 2026-08-03: the upstream
`oak-openapi` service rebuilt its bulk generation (2026-07-09), fixed a
material data bug in it (2026-07-22 — lessons had been truncated to one per
unit), and now **publishes a formal JSON Schema for bulk files**
(`src/app/api/bulk/schema.json/` upstream, served beside the bulk endpoint).
Our validation contract therefore has a declared upstream counterpart for the
first time, and two mechanisms became possible: keep hand-maintaining our
templates, or derive the contract from the upstream schema.

The decision moment falls inside a critical release window: the first
submission is in preparation (Matt's work), and foundational mechanisms must
not change beneath it.

## Decision (owner ruling, 2026-08-03, verbatim)

> "there is no choice there... during this critical time as Matt works on the
> first submission we cannot change a foundational mechanism, so for now we
> update our hand written schema, but as soon as the release is done, making
> that contract fully derived from the upstream bulk schema is a priority"

Operationally, two phases with the transition condition named:

1. **Interim (now, for the release window)**: the hand-written Zod templates
   remain the operating mechanism and are **manually trued against the
   upstream published schema**. The upstream schema is the authority the
   truing follows. The validation mechanism itself does not change.
2. **Post-release (priority at release completion)**: the bulk contract
   becomes **fully derived from the upstream bulk schema** — generation, not
   hand maintenance, in the same schema-first direction the OpenAPI leg
   already follows (upstream spec → generated types).

## Authority ordering (constitutive, both phases)

The upstream published schema is authoritative for what upstream serves.
A conflict between real bulk data and that schema is an **upstream bug to
report**, never a reason to prefer the local templates and never a prompt to
loosen local validation until data passes
(`strict-validation-at-boundary`). Local validation may be a deliberately
stricter consumer profile, but its correctness is judged against the upstream
schema, not the other way around.

## Consequences

- The interim truing work updates template content only; any mismatch found
  during truing is evidence (upstream bug or stale local model), handled by
  report or true-up, never by widening.
- The post-release derivation work is a named priority, not an open option:
  planning for it starts at release completion, and the generation-fidelity
  questions it contains (JSON-Schema draft semantics, `$defs` composition,
  constraint preservation in Zod generation) are worked with the owner per
  his standing direction on non-trivial type approaches (2026-08-03).
- This ADR supersedes any reading of the bulk templates as an independent
  authority. The templates' historical reconstruction role is acknowledged,
  not preserved.

This decision instantiates the owner's stated systems value (2026-08-03):
cost of change in the broad systems sense — "enabling rapid innovation
without compromising quality or stability". The stability arm holds through
the release window; the innovation arm (full derivation) is the named
post-release priority, not a deferred hope.

## Related

- `schema-first-execution` directive — the estate-wide direction this
  decision completes for the bulk leg.
- ADR-093 (bulk-first ingestion strategy) — the consumer pipeline whose
  boundary this contract guards.
- The upstream-update lane records (napkin 2026-08-03 entries; the lane's
  drift findings) — the discovery context.
