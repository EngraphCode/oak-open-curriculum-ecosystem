/**
 * Subpath barrel: `@oaknational/sdk-codegen/graph-corpus`
 *
 * The one bulk curriculum graph corpus (Decision A): unit nodes carrying
 * kind-qualified ids (`unit:<unitSlug>`) and `prerequisiteFor` edges, emitted
 * by the vocab-gen pipeline as a single identity space and surfaced for bounded
 * query views (e.g. `graph-corpus-sdk` constructs a `createGraphView` over it).
 *
 * The runtime corpus is a large generated structure (loaded from `data.json`)
 * excluded from the lint TypeScript program; this barrel is the single import
 * surface for both the corpus value and its types, so consumers depend on one
 * stable subpath rather than reaching into `generated/`.
 *
 * Re-exports resolve to the graph-corpus generated module directly, not the
 * aggregate `generated/vocab` barrel: importing the aggregate would eagerly
 * load every legacy vocab dataset's `data.json` (misconception, vocabulary,
 * nc-coverage, prior-knowledge, thread-progression) just to reach `graphCorpus`.
 */

export { graphCorpus } from './generated/vocab/graph-corpus/index.js';
export type {
  GraphCorpus,
  GraphCorpusUnitNode,
  GraphCorpusEdge,
  GraphCorpusNodeId,
  GraphCorpusStats,
  GraphCorpusDroppedEdge,
} from './generated/vocab/graph-corpus/index.js';
