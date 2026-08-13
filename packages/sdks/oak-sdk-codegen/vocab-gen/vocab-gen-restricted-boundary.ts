/**
 * The restricted-inclusion boundary for the vocabulary corpus (ADR-224).
 *
 * The generated vocab corpus is committed to the repository and exported to
 * MCP tools via the graph-corpus subpath, so the ADR-224 restricted-lesson
 * exclusion policy applies to every pipeline run regardless of dryRun — the
 * rejection fires before any bulk data is read. The index-producing boundary
 * in oak-search-sdk (`enforceRestrictedInclusionBoundary`) enforces the same
 * policy; the predicate is mirrored here because sdk-codegen sits upstream of
 * oak-search-sdk in the dependency direction. Removal condition: the
 * labelled-serving follow-on plus owner word (ADR-224).
 */
import { type PipelineConfig, type PipelineResult } from './vocab-gen-config.js';

/**
 * Rejects restricted-lesson inclusion at the corpus-producing boundary:
 * returns a failed {@link PipelineResult} (`success: false`, `error` naming
 * ADR-224) when `includeRestricted` is set, with zeroed extraction stats
 * because nothing ran. The rejection is returned, not thrown (ADR-088's
 * no-throw discipline; `PipelineResult` predates the typed-Result
 * convention). Returns `undefined` when the run may proceed.
 */
export function enforceRestrictedInclusionCorpusBoundary(
  config: Pick<PipelineConfig, 'includeRestricted'>,
): PipelineResult | undefined {
  if (config.includeRestricted === true) {
    return {
      success: false,
      error:
        'includeRestricted is not permitted for corpus-producing runs: the generated vocab ' +
        'corpus is committed and consumed by MCP tools, and the restricted-lesson exclusion ' +
        'policy (ADR-224) applies to it as to every index family. Restricted-lesson output ' +
        'awaits the labelled-serving follow-on.',
      filesProcessed: 0,
      totalLessons: 0,
      totalUnits: 0,
      uniqueKeywords: 0,
      totalMisconceptions: 0,
      totalLearningPoints: 0,
      totalTeacherTips: 0,
      totalPriorKnowledge: 0,
      totalNCStatements: 0,
      uniqueThreads: 0,
      restrictedLessonsExcluded: 0,
      outputFiles: [],
      durationMs: 0,
    };
  }
  return undefined;
}
