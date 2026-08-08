---
name: oak-update-bulk-download-schema
description: "Align the estate to a changed upstream Oak bulk-download schema — summon on \"bulk schema changed\", \"bulk data fails validation\", \"unrecognized_keys at ingest\", \"refresh the bulk downloads\", or any drift between fresh bulk data and the strict Zod gate. ADR-222's authority ordering is constitutive: upstream's published bulk JSON Schema is the authority; the hand-written Zod templates are the interim mechanism trued against it; a data-vs-schema mismatch is an UPSTREAM BUG REPORT, never validation-loosening; local validation may be deliberately stricter. Use when fresh bulk data fails the gate, when upstream announces or ships a bulk format change, or when truing the templates. Do NOT use for the OpenAPI/REST spec surface (that is update-upstream-api-spec), and never to make failing data pass by widening schemas. Failure shapes it exists to prevent: loosening .strict(), z.unknown() escape hatches, treating observed data as the authority over the published schema, and truing templates against a stale bundle."
---

# Update Bulk Download Schema (Cross-tool)

Read and follow `.agent/skills/update-bulk-download-schema/SKILL-CANONICAL.md`.
