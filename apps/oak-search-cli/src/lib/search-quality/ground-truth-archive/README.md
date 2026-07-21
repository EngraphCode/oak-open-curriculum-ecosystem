# Ground Truth Archive

**Archived**: 2026-02-04  
**Superseded by**: Foundational Ground Truths (`../ground-truth/`)

---

## What This Contains

This archive preserves the original comprehensive ground truth implementation:

- **401 TypeScript files**
- **120 queries** (30 subject-phases × 4 categories)
- **Split architecture**: `.query.ts` + `.expected.ts` per query
- **Four categories**: `precise-topic`, `natural-expression`, `imprecise-input`, `cross-topic`

---

## Why It Was Archived

The original approach was comprehensive but complex. Key issues:

1. **High zero-hit rate** — 59% on natural-expression queries
2. **Subjective relevance** — Disagreement on what "should" match
3. **Maintenance burden** — 401 files, complex validation
4. **Query-first design** — Queries invented, then results expected

### The Replacement

The new Foundational Ground Truths system uses **Known-Answer-First** methodology:

| Original Approach               | New Approach                       |
| ------------------------------- | ---------------------------------- |
| 120 queries                     | 30 queries (one per subject-phase) |
| Query-first design              | Known-answer-first design          |
| 4 categories per subject        | Single entry per subject-phase     |
| 59% natural-expression failures | 0% zero-hit rate                   |
| Complex validation              | Simple benchmark integration       |

See [ADR-106](/docs/architecture/architectural-decisions/106-known-answer-first-ground-truth-methodology.md) for the methodology decision.

---

## When to Use This Archive

The archive is useful for:

1. **Reference** — Understanding previous query patterns
2. **Selective restoration** — Pulling specific category queries back
3. **Expansion planning** — Informing future ground truth growth

---

## Restoration

### Selective Restoration

To restore specific entries:

```bash
cd src/lib/search-quality

# Copy a specific category back
cp ground-truth-archive/maths/secondary/natural-expression.query.ts ground-truth/entries/
cp ground-truth-archive/maths/secondary/natural-expression.expected.ts ground-truth/entries/
```

Note: Requires adapting to `LessonGroundTruth` type.

### Full Restoration

To fully restore the original system:

```bash
mv ground-truth-archive/* ground-truth/
```

**Warning**: This requires:

- Updating all imports in benchmark files
- Reverting `benchmark-adapters.ts` changes
- Updating `benchmark-main.ts` to use old registry

---

## Structure

```text
ground-truth-archive/
├── registry/
│   ├── index.ts         # Subject-phase registry
│   └── types.ts         # GroundTruthEntry type
├── types.ts             # Query and category types
├── art/
│   ├── primary/
│   │   ├── precise-topic.query.ts
│   │   ├── precise-topic.expected.ts
│   │   ├── natural-expression.query.ts
│   │   ├── natural-expression.expected.ts
│   │   └── ...
│   └── secondary/
│       └── ...
├── maths/
│   └── ...
└── ... (other subjects)
```

---

## Related Documents

| Document                                                                                                                                             | Purpose               |
| ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| [ADR-106](/docs/architecture/architectural-decisions/106-known-answer-first-ground-truth-methodology.md)                                             | Why this was archived |
| [ground-truth/README.md](../ground-truth/README.md)                                                                                                  | Current system        |
| [expansion-plan.md](../../../../../../.agent/plans-backlog-2026-07/semantic-search/future/09-evaluation-and-evidence/ground-truth-expansion-plan.md) | Future expansion      |
