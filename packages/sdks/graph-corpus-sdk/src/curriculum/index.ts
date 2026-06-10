/**
 * Curriculum graph subpath barrel: `@oaknational/graph-corpus-sdk/curriculum`.
 *
 * The generated one-graph corpus (G1a) plus the bounded anchored views over
 * it: `priorKnowledgeSubgraph` (G1b) answers "what is the prior knowledge of
 * these units?" as a depth-bounded predecessor subgraph;
 * `misconceptionsForLessons` / `misconceptionsForUnits` /
 * `misconceptionsForThread` (G2) answer "which misconceptions does this
 * anchor address?" over the thread→unit→lesson→misconception chain.
 */

export {
  graphCorpus,
  type GraphCorpus,
  type GraphCorpusEdge,
  type GraphCorpusLessonNode,
  type GraphCorpusMisconceptionNode,
  type GraphCorpusNodeId,
  type GraphCorpusThreadNode,
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

export {
  buildCurriculumMisconceptionProjection,
  type CurriculumMisconceptionProjection,
} from './misconception-projection.js';

export {
  DEFAULT_THREAD_UNIT_LIMIT,
  MAX_THREAD_UNIT_LIMIT,
  misconceptionsForLessons,
  misconceptionsForThread,
  misconceptionsForUnits,
  type LessonMisconceptions,
  type LessonMisconceptionsSubgraph,
  type ThreadMisconceptions,
  type ThreadMisconceptionsSubgraph,
  type ThreadMisconceptionsWindow,
  type ThreadWindowInvalid,
  type UnitMisconceptions,
  type UnitMisconceptionsSubgraph,
} from './misconception-view.js';
