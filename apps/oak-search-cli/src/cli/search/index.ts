/**
 * Search subcommand group — retrieval operations.
 *
 * Provides commands for querying lessons, units, sequences, threads,
 * type-ahead suggestions, and sequence facets via the Search SDK.
 *
 * Resource ownership pattern:
 * - ES client: created by handler, cleaned up by `withEsClient`
 *
 * @see ADR-133 CLI Resource Lifecycle Management
 *
 * @example
 * ```bash
 * oaksearch search lessons "expanding brackets" --subject maths --key-stage ks3
 * oaksearch search units "fractions" --size 5
 * ```
 */

import { Command } from 'commander';
import type { Result } from '@oaknational/result';
import { createRetrievalService } from '@oaknational/oak-search-sdk/read';
import type { RetrievalService, RetrievalError } from '@oaknational/oak-search-sdk/read';
import type { CliObservability } from '../../observability/index.js';
import {
  createEsClient,
  withEsClient,
  withLoadedCliEnv,
  type CliSdkEnv,
  type SearchCliEnvLoader,
  printJson,
  printError,
  validateSubject,
  validateKeyStage,
  parsePositiveIntOption,
} from '../shared/index.js';
import { buildSearchSdkConfig } from '../shared/build-search-sdk-config.js';
import { handleSearchLessons, handleSearchUnits, handleSearchSequences } from './handlers.js';
import { registerThreadsCmd } from './register-threads-cmd.js';
import { registerSuggestCmd } from './register-suggest-cmd.js';
import { registerFacetsCmd } from './register-facets-cmd.js';
import { searchDeps } from './search-deps.js';
import { searchLogger } from '../../lib/logger.js';

/**
 * Common CLI option shape for commands with subject, key stage, and size.
 */
interface SubjectKeyStageOpts {
  readonly subject?: string;
  readonly keyStage?: string;
  readonly size: number;
}

/**
 * Parameters the subject/key-stage registrar passes to a search handler.
 */
interface SubjectKeyStageSearchParams {
  readonly query: string;
  readonly subject: ReturnType<typeof validateSubject>;
  readonly keyStage: ReturnType<typeof validateKeyStage>;
  readonly size: number;
}

/**
 * Specification for one subject/key-stage search subcommand.
 */
interface SubjectKeyStageCmdSpec<TResult> {
  readonly name: string;
  readonly description: string;
  readonly commandName: string;
  readonly handler: (
    retrieval: RetrievalService,
    params: SubjectKeyStageSearchParams,
  ) => Promise<Result<TResult, RetrievalError>>;
}

/**
 * Register one subject/key-stage search subcommand (`lessons`, `units`).
 *
 * The two commands are structurally identical — same options, same
 * validation, same output handling — differing only in name, description,
 * handler, and observability command name, so one registrar serves both.
 *
 * @param parent - The parent Commander command to register under
 * @param cliEnvLoader - Cached loader for validated CLI environment values
 * @param spec - The per-command name, description, handler, and span name
 * @param observability - Optional CLI observability for span wrapping
 */
function registerSubjectKeyStageCmd<TResult>(
  parent: Command,
  cliEnvLoader: SearchCliEnvLoader,
  spec: SubjectKeyStageCmdSpec<TResult>,
  observability?: CliObservability,
): void {
  parent
    .command(spec.name)
    .description(spec.description)
    .argument('<query>', 'Search query text')
    .option('-s, --subject <subject>', 'Filter by subject slug')
    .option('-k, --key-stage <keyStage>', 'Filter by key stage (ks1-ks4)')
    .option('--size <n>', 'Maximum results to return', parsePositiveIntOption, 25)
    .action(
      withLoadedCliEnv(
        cliEnvLoader,
        async (cliEnv: CliSdkEnv, query: string, opts: SubjectKeyStageOpts) => {
          const esClient = createEsClient(cliEnv);
          await withEsClient(
            esClient,
            async () => {
              const retrieval = createRetrievalService(esClient, buildSearchSdkConfig(cliEnv));
              const result = await spec.handler(retrieval, {
                query,
                subject: validateSubject(opts.subject),
                keyStage: validateKeyStage(opts.keyStage),
                size: opts.size,
              });
              if (!result.ok) {
                searchLogger.error(`${result.error.type}: ${result.error.message}`, result.error);
                printError(`${result.error.type}: ${result.error.message}`);
                searchDeps.setExitCode(1);
                return;
              }
              printJson(result.value);
            },
            searchDeps,
          );
        },
        observability ? { observability, commandName: spec.commandName } : undefined,
      ),
    );
}

/**
 * Register the `search sequences` subcommand.
 *
 * @param parent - The parent Commander command to register under
 * @param cliEnv - Validated CLI environment values
 */
function registerSequencesCmd(
  parent: Command,
  cliEnvLoader: SearchCliEnvLoader,
  observability?: CliObservability,
): void {
  parent
    .command('sequences')
    .description('Search sequences (subject-phase programmes)')
    .argument('<query>', 'Search query text')
    .option('-s, --subject <subject>', 'Filter by subject slug')
    .option('--size <n>', 'Maximum results to return', parsePositiveIntOption, 25)
    .action(
      withLoadedCliEnv(
        cliEnvLoader,
        async (cliEnv: CliSdkEnv, query: string, opts: { subject?: string; size: number }) => {
          const esClient = createEsClient(cliEnv);
          await withEsClient(
            esClient,
            async () => {
              const retrieval = createRetrievalService(esClient, buildSearchSdkConfig(cliEnv));
              const result = await handleSearchSequences(retrieval, {
                query,
                subject: validateSubject(opts.subject),
                size: opts.size,
              });
              if (!result.ok) {
                searchLogger.error(`${result.error.type}: ${result.error.message}`, result.error);
                printError(`${result.error.type}: ${result.error.message}`);
                searchDeps.setExitCode(1);
                return;
              }
              printJson(result.value);
            },
            searchDeps,
          );
        },
        observability ? { observability, commandName: 'search.sequences' } : undefined,
      ),
    );
}

/**
 * Create the `search` subcommand group.
 *
 * @param cliEnv - Validated CLI environment values
 * @returns A Commander `Command` with search subcommands registered
 */
export function searchCommand(
  cliEnvLoader: SearchCliEnvLoader,
  observability?: CliObservability,
): Command {
  const cmd = new Command('search').description(
    'Query lessons, units, sequences, threads, and suggestions',
  );

  registerSubjectKeyStageCmd(
    cmd,
    cliEnvLoader,
    {
      name: 'lessons',
      description: 'Search lessons using hybrid BM25 + ELSER retrieval',
      commandName: 'search.lessons',
      handler: handleSearchLessons,
    },
    observability,
  );
  registerSubjectKeyStageCmd(
    cmd,
    cliEnvLoader,
    {
      name: 'units',
      description: 'Search units using hybrid BM25 + ELSER retrieval',
      commandName: 'search.units',
      handler: handleSearchUnits,
    },
    observability,
  );
  registerSequencesCmd(cmd, cliEnvLoader, observability);
  registerThreadsCmd(cmd, cliEnvLoader);
  registerSuggestCmd(cmd, cliEnvLoader);
  registerFacetsCmd(cmd, cliEnvLoader);

  return cmd;
}
