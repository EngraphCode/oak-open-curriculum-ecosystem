---
name: update-bulk-download-schema
classification: active
description: >-
  Align the estate to a changed upstream Oak bulk-download schema —
  summon on "bulk schema changed", "bulk data fails validation",
  "unrecognized_keys at ingest", "refresh the bulk downloads", or any
  drift between fresh bulk data and the strict Zod gate. ADR-222's
  authority ordering is constitutive: upstream's published bulk JSON
  Schema is the authority; the hand-written Zod templates are the
  interim mechanism trued against it; a data-vs-schema mismatch is an
  UPSTREAM BUG REPORT, never validation-loosening; local validation may
  be deliberately stricter. Use when fresh bulk data fails the gate,
  when upstream announces or ships a bulk format change, or when truing
  the templates. Do NOT use for the OpenAPI/REST spec surface (that is
  update-upstream-api-spec), and never to make failing data pass by
  widening schemas. Failure shapes it exists to prevent: loosening
  .strict(), z.unknown() escape hatches, treating observed data as the
  authority over the published schema, and truing templates against a
  stale bundle.
---

# Update the bulk-download schema alignment

The governing decision is
[ADR-222](../../../docs/architecture/architectural-decisions/222-bulk-schema-contract-interim-truing-then-derivation.md):
interim hand-truing of the templates against upstream's published bulk
JSON Schema now, full derivation from that schema as the named
post-release priority. This skill is the summonable routing for both
phases; the ADR owns the authority ordering and phase transition.

## Surfaces

- **Templates (the interim mechanism)**:
  `packages/sdks/oak-sdk-codegen/code-generation/typegen/bulk/schema-templates.ts`
  with `-part2.ts` and `-part3.ts`, generated into
  `src/types/generated/bulk` by `bulkgen`. Behaviour changes go in the
  templates, never the generated output.
- **The authority**: upstream's published bulk JSON Schema, served
  beside the bulk endpoint and shipped inside the bundle; the committed
  copy is `apps/oak-search-cli/bulk-downloads/schema.json`.
- **The bundle**: `apps/oak-search-cli/bulk-downloads/` — data files
  are gitignored and downloaded per-checkout; the tracked
  `manifest.json` records `downloadedAt`, which is the data's vintage.

## Procedure

1. **Refresh and date the bundle first.** Download a fresh bundle and
   read `manifest.json`'s `downloadedAt` before comparing anything —
   checkouts silently diverge in data vintage (worked instance
   2026-08-03: June data on one checkout, August on another). Truing
   against a stale bundle trues against history.
2. **Compare schema-to-schema, then data-to-schema.** Diff the fresh
   bundle's `schema.json` against the committed copy (that delta is the
   upstream change); then validate the fresh data through the strict
   gate. Classify every failure:
   - **Additive drift** (`unrecognized_keys` only, no type changes):
     declare the new fields in the templates, transcribed from the
     published schema — never reconstructed from observed data.
   - **Data-vs-schema mismatch** (data carries what the schema does
     not declare, or violates it): an upstream defect — report it
     (plain-language, agent-marked ticket; MCP-464 and MCP-205 are the
     precedents) and do NOT loosen the gate to admit it.
3. **Keep the gate strict.** `.strict()` stays; no `z.unknown()`
   escapes; local validation may remain a deliberately stricter
   consumer profile than the published schema
   (`strict-validation-at-boundary`). The one sanctioned
   explicitly-undeclared shape is a documented upstream defect carried
   with its ticket reference.
4. **Regenerate the companions in the same landing**: `bulkgen`
   output, and the ground-truth generated artefacts under
   `apps/oak-search-cli/ground-truths/generated/` that read bulk data —
   they are the truing's regen companions, adjudicated into the same
   PR deliberately.
5. **Phase 2 (post-release)**: the contract becomes fully DERIVED from
   the published schema — generation, not hand maintenance. The
   generation-fidelity questions (JSON-Schema draft semantics, `$defs`
   composition, constraint preservation in Zod) are worked per ADR-222
   §Consequences. When phase 2 lands, this skill's procedure collapses
   to "refresh, regenerate, adjudicate" and the template-truing steps
   above retire with the templates.

## Related

- [ADR-222](../../../docs/architecture/architectural-decisions/222-bulk-schema-contract-interim-truing-then-derivation.md)
  — the governing decision: phases, authority ordering, transition.
- [`update-upstream-api-spec`](../update-upstream-api-spec/SKILL-CANONICAL.md)
  — the sibling skill for the OpenAPI/REST surface.
- [`docs/engineering/upstream-api-alignment-runbook.md`](../../../docs/engineering/upstream-api-alignment-runbook.md)
  — the end-to-end operational flow shared by both alignment surfaces.
- [`verify-data-supports-shape-before-building`](../../rules/verify-data-supports-shape-before-building.md)
  — the same first-hand-evidence discipline at build time.
