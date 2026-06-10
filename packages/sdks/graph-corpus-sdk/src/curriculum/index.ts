/**
 * Curriculum graph subpath barrel: `@oaknational/graph-corpus-sdk/curriculum`.
 *
 * The generated one-graph corpus (G1a) plus the bounded anchored
 * prior-knowledge view over it (G1b): `priorKnowledgeSubgraph` answers "what is
 * the prior knowledge of these units?" as a depth-bounded predecessor subgraph.
 */

export {
  graphCorpus,
  type GraphCorpus,
  type GraphCorpusEdge,
  type GraphCorpusNodeId,
  type GraphCorpusUnitNode,
} from './graph-corpus.js';

export {
  DEFAULT_PREREQUISITE_DEPTH,
  MAX_PREREQUISITE_DEPTH,
  createCurriculumPriorKnowledgeView,
  priorKnowledgeSubgraph,
  type CurriculumPriorKnowledgeView,
  type PriorKnowledgeSubgraph,
} from './prior-knowledge-view.js';
