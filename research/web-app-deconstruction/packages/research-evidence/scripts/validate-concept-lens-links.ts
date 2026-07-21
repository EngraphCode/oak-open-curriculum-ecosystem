import { execFile as execFileCallback } from 'node:child_process';
import path from 'node:path';
import { promisify } from 'node:util';

import {
  defaultComponentsRoot,
  defaultOwaRoot,
  emitJson,
  parseArgs,
  resolveFromCwd,
  usageError,
  recordRoot,
  workspaceRoot,
} from '../lib/cli.js';
import { validatePinnedSourceLinks } from '../lib/pinned-source-links.js';
import { assertRepository } from '../lib/repository.js';
import type { RepositoryInfo } from '../lib/repository.js';

const execFile = promisify(execFileCallback);

interface RepositoryCheckoutEntry extends RepositoryInfo {
  root: string;
  readSource: (file: string) => Promise<string>;
}

interface RepositoryEvidence {
  package: string;
  version: string;
  revision: string;
  clean: boolean;
}

function stringOption(value: string | boolean | undefined): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function describeError(error: unknown): string {
  if (typeof error === 'object' && error !== null) {
    if ('stack' in error && typeof error.stack === 'string') {
      return error.stack;
    }
    if ('message' in error && typeof error.message === 'string') {
      return error.message;
    }
  }
  return String(error);
}

const defaultOceRoot = path.join(workspaceRoot, 'oak-open-curriculum-ecosystem');
const defaultDatabaseToolsRoot = path.join(workspaceRoot, 'Database-Tools');
const defaultOakOpenApiRoot = path.join(workspaceRoot, 'oak-openapi');
// Resolved from the record's own projection location, not from a retired
// sibling layout, so the no-argument invocation inspects THIS record.
const defaultMarkdownRoot = path.join(
  recordRoot,
  'docs/current-state/owa-components-concept-lenses',
);
const usage = `Usage: pnpm exec tsx scripts/validate-concept-lens-links.ts [options]

Options:
  --docs <path>        Concept-lens Markdown directory
  --owa <path>         OWA checkout (default: sibling Oak-Web-Application)
  --components <path>  Components checkout (default: sibling oak-components)
  --database-tools <path> Database-Tools checkout (default: sibling Database-Tools)
  --oak-openapi <path> oak-openapi checkout (default: sibling oak-openapi)
  --oce <path>         OCE checkout (default: sibling oak-open-curriculum-ecosystem)
  --output <path>      Write normalized JSON evidence to this path instead of stdout`;

async function main(): Promise<void> {
  const args = parseArgs(
    process.argv.slice(2),
    [],
    ['docs', 'owa', 'components', 'database-tools', 'oak-openapi', 'oce', 'output'],
  );
  const markdownRoot = resolveFromCwd(stringOption(args.docs), defaultMarkdownRoot);
  const databasePortfolio = markdownRoot.split(path.sep).includes('database-tools');
  // Projection-aware: this public projection carries NO pinned links into
  // the private repositories (ADR-215 Decision 4 reduced them to plain-text
  // citations), so those checkouts are validated only when a caller with
  // access supplies them explicitly — the full pinned-link validation lives
  // with the private master.
  const databaseToolsRoot = stringOption(args['database-tools']);
  const oakOpenApiRoot = stringOption(args['oak-openapi']);
  const roots: Record<string, string> = databasePortfolio
    ? {
        ...(databaseToolsRoot === undefined
          ? {}
          : { 'Database-Tools': resolveFromCwd(databaseToolsRoot, defaultDatabaseToolsRoot) }),
        ...(oakOpenApiRoot === undefined
          ? {}
          : { 'oak-openapi': resolveFromCwd(oakOpenApiRoot, defaultOakOpenApiRoot) }),
        'oak-open-curriculum-ecosystem': resolveFromCwd(stringOption(args.oce), defaultOceRoot),
      }
    : {
        'Oak-Web-Application': resolveFromCwd(stringOption(args.owa), defaultOwaRoot),
        'oak-components': resolveFromCwd(stringOption(args.components), defaultComponentsRoot),
        'oak-open-curriculum-ecosystem': resolveFromCwd(stringOption(args.oce), defaultOceRoot),
      };
  const expectedPackages: Record<string, string> = {
    'Oak-Web-Application': 'oak-web-application',
    'oak-components': '@oaknational/oak-components',
    'Database-Tools': 'oak-database-tools',
    'oak-openapi': 'oak-openapi',
    'oak-open-curriculum-ecosystem': '@oaknational/open-curriculum-ecosystem',
  };
  const repositories: Record<string, RepositoryCheckoutEntry> = {};

  for (const [name, root] of Object.entries(roots)) {
    const input = await assertRepository(root, expectedPackages[name]);
    const cache = new Map<string, Promise<string>>();
    repositories[name] = {
      root,
      ...input,
      async readSource(file: string): Promise<string> {
        if (!cache.has(file)) {
          cache.set(
            file,
            execFile('git', ['-C', root, 'show', `${input.revision}:${file}`], {
              encoding: 'utf8',
              maxBuffer: 32 * 1024 * 1024,
            }).then(({ stdout }) => stdout),
          );
        }
        const cached = cache.get(file);
        if (cached === undefined) {
          throw new Error(`No cached source available for ${file}`);
        }
        return cached;
      },
    };
  }

  const result = await validatePinnedSourceLinks(
    markdownRoot,
    repositories,
    Object.keys(repositories),
  );
  if (result.failures.length > 0) {
    throw new Error(result.failures.join('\n'));
  }

  await emitJson(
    {
      input: Object.fromEntries(
        Object.entries(repositories).map(([name, repository]): [string, RepositoryEvidence] => [
          name,
          {
            package: repository.package,
            version: repository.version,
            revision: repository.revision,
            clean: repository.clean,
          },
        ]),
      ),
      result: {
        documentCount: result.documentCount,
        sourceLinkCount: result.sourceLinkCount,
        lineAnchorCount: result.lineAnchorCount,
        byRepository: result.byRepository,
      },
    },
    stringOption(args.output),
  );
}

main().catch((error: unknown) => usageError(describeError(error), usage));
