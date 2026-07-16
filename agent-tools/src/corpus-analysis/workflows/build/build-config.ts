/**
 * corpus-analysis's workflow-build coupling: stage registry, out dir, inline plugins.
 *
 * @remarks
 * The ONE module-side surface the shared build core (`src/workflow-build/`) needs:
 * everything else (bundling, harness emission, output contract, verification runner)
 * is module-agnostic and imported from the core. The plugin filters are scoped to THIS
 * module's `workflows/` directory — two pipeline modules coexist in this workspace,
 * and an unscoped `workflows/agent-schemas.ts$` filter would substitute the wrong
 * module's schemas into a bundle that crosses module boundaries.
 *
 * @packageDocumentation
 */

import {
  makeAgentSchemasInlinePlugin,
  makeRunDataInlinePlugin,
} from '../../../workflow-build/schema-inline-plugin.js';
import type {
  StageDefinition,
  WorkflowBuildConfig,
} from '../../../workflow-build/workflow-builder.js';
import { deriveAgentJsonSchemas } from '../agent-schemas.js';
import { meta as mapMeta } from '../map.meta.js';
import { meta as metaMeta } from '../meta.meta.js';
import { meta as reduceMeta } from '../reduce.meta.js';
import { meta as validateMeta } from '../validate.meta.js';

/** Resolved-path filter for the module the schema plugin substitutes. */
export const AGENT_SCHEMAS_MODULE_FILTER = /corpus-analysis[/\\]workflows[/\\]agent-schemas\.ts$/;

/** Resolved-path filter for the module the run-data plugin substitutes. */
export const RUN_DATA_MODULE_FILTER = /corpus-analysis[/\\]workflows[/\\]run-data\.ts$/;

/** The four pipeline stages, in run order. */
export const STAGE_DEFINITIONS: readonly StageDefinition[] = [
  { name: 'map', entry: 'src/corpus-analysis/workflows/map.workflow.ts', meta: mapMeta },
  { name: 'reduce', entry: 'src/corpus-analysis/workflows/reduce.workflow.ts', meta: reduceMeta },
  {
    name: 'validate',
    entry: 'src/corpus-analysis/workflows/validate.workflow.ts',
    meta: validateMeta,
  },
  { name: 'meta', entry: 'src/corpus-analysis/workflows/meta.workflow.ts', meta: metaMeta },
];

/** Where built workflow artefacts land (gitignored; rebuilt before every run). */
export const WORKFLOW_OUT_DIR = 'dist/corpus-analysis/workflows';

/** The module's build coupling, passed to every shared-core build call. */
export const BUILD_CONFIG: WorkflowBuildConfig = {
  outDir: WORKFLOW_OUT_DIR,
  agentSchemasPlugin: makeAgentSchemasInlinePlugin({
    moduleFilter: AGENT_SCHEMAS_MODULE_FILTER,
    deriveSchemas: deriveAgentJsonSchemas,
  }),
  makeRunDataPlugin: (stage, data) =>
    makeRunDataInlinePlugin({ moduleFilter: RUN_DATA_MODULE_FILTER, stage, data }),
};
