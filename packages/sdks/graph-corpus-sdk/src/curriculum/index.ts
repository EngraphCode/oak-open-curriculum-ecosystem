/**
 * Curriculum graph subpath barrel: `@oaknational/graph-corpus-sdk/curriculum`.
 *
 * The curriculum prerequisite graph foundation (G1a): the generated one-graph
 * corpus bridged into the domain-generic graph substrate. The G1b
 * prior-knowledge view and its anchored `get-prior-knowledge-graph` query
 * surface build on top of this foundation.
 */

export {
  graphCorpus,
  createCurriculumPrerequisiteGraph,
  type GraphCorpus,
  type GraphCorpusEdge,
  type GraphCorpusNodeId,
  type GraphCorpusUnitNode,
  type CurriculumPrerequisiteGraph,
} from './graph-corpus.js';
