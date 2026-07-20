import { execFile as execFileCallback } from 'node:child_process';
import { lstat, readFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';

import { emitJson, parseArgs, resolveFromCwd, usageError, workspaceRoot } from '../lib/cli.js';
import {
  hubRouteFromPage,
  parseRuleIndexRows,
  parseWorkspacePatterns,
  resolveWorkspaceDirectories,
  summarizeCourse,
  summarizeGraphCorpus,
} from '../lib/oce-inventory.js';
import { assertRepository } from '../lib/repository.js';

const execFile = promisify(execFileCallback);
const defaultOceRoot = path.join(workspaceRoot, 'oak-open-curriculum-ecosystem');
const expectedPackage = '@oaknational/open-curriculum-ecosystem';
const usage = `Usage: pnpm exec tsx scripts/oce-inventory.ts [options]

Options:
  --oce <path>     OCE checkout (default: sibling oak-open-curriculum-ecosystem)
  --output <path>  Write normalized JSON evidence to this path instead of stdout`;

const args = parseArgs(process.argv.slice(2), [], ['oce', 'output']);

function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function errorMessage(error: unknown): string | undefined {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const { message } = error;
    if (typeof message === 'string') {
      return message;
    }
  }
  return undefined;
}

const oceRoot = resolveFromCwd(optionalString(args.oce), defaultOceRoot);

const paths = {
  workspaceManifest: 'pnpm-workspace.yaml',
  graphCorpus: 'packages/sdks/oak-sdk-codegen/src/generated/vocab/graph-corpus/data.json',
  generatedVocabulary: 'packages/sdks/oak-sdk-codegen/src/generated/vocab/',
  hubCourse: 'demos/oak-curriculum-hub/lib/course/oak-course.json',
  hubQualityStandards: 'demos/oak-curriculum-hub/lib/data/quality-standards.json',
  hubApp: 'demos/oak-curriculum-hub/app/',
  widget: 'apps/oak-curriculum-mcp-streamable-http/src/generated/widget-html-content.ts',
  rulesIndex: 'RULES_INDEX.md',
  canonicalRules: '.agent/rules/',
};

function parseJson(buffer: Buffer, label: string): unknown {
  try {
    const parsed: unknown = JSON.parse(buffer.toString('utf8'));
    return parsed;
  } catch (error) {
    throw new Error(`Could not parse ${label}: ${errorMessage(error)}`, { cause: error });
  }
}

function toMebibytes(bytes: number): number {
  return Number((bytes / (1024 * 1024)).toFixed(3));
}

function toKibibytes(bytes: number): number {
  return Number((bytes / 1024).toFixed(3));
}

async function trackedFiles(): Promise<string[]> {
  const { stdout } = await execFile('git', ['-C', oceRoot, 'ls-files', '-z'], {
    encoding: 'buffer',
    maxBuffer: 32 * 1024 * 1024,
  });
  return stdout.toString('utf8').split('\0').filter(Boolean).sort();
}

async function readTracked(file: string, trackedFileSet: Set<string>): Promise<Buffer> {
  if (!trackedFileSet.has(file)) {
    throw new Error(`Required OCE evidence path is not Git-tracked: ${file}`);
  }
  const absolute = path.join(oceRoot, file);
  const metadata = await lstat(absolute);
  if (!metadata.isFile()) {
    throw new Error(`Required OCE evidence path is not a regular file: ${file}`);
  }
  return readFile(absolute);
}

async function main(): Promise<void> {
  const input = await assertRepository(oceRoot, expectedPackage);
  const files = await trackedFiles();
  const trackedFileSet = new Set(files);
  const [
    workspaceManifestBuffer,
    graphCorpusBuffer,
    hubCourseBuffer,
    qualityStandardsBuffer,
    widgetBuffer,
    rulesIndexBuffer,
  ] = await Promise.all([
    readTracked(paths.workspaceManifest, trackedFileSet),
    readTracked(paths.graphCorpus, trackedFileSet),
    readTracked(paths.hubCourse, trackedFileSet),
    readTracked(paths.hubQualityStandards, trackedFileSet),
    readTracked(paths.widget, trackedFileSet),
    readTracked(paths.rulesIndex, trackedFileSet),
  ]);

  const workspacePatterns = parseWorkspacePatterns(workspaceManifestBuffer.toString('utf8'));
  const workspaceDirectories = resolveWorkspaceDirectories(files, workspacePatterns);
  const vocabularyFiles = files.filter((file) => file.startsWith(paths.generatedVocabulary));
  const vocabularyBuffers = await Promise.all(
    vocabularyFiles.map((file) => readTracked(file, trackedFileSet)),
  );
  const vocabularyBytes = vocabularyBuffers.reduce((total, buffer) => total + buffer.byteLength, 0);

  const graphCorpus = summarizeGraphCorpus(parseJson(graphCorpusBuffer, paths.graphCorpus));
  const course = summarizeCourse(parseJson(hubCourseBuffer, paths.hubCourse));
  const qualityStandards = parseJson(qualityStandardsBuffer, paths.hubQualityStandards);
  if (!Array.isArray(qualityStandards)) {
    throw new Error('Hub quality standards payload must be an array');
  }

  const pageRoutes = files
    .filter((file) => file.startsWith(paths.hubApp))
    .map(hubRouteFromPage)
    .filter((route) => route !== null)
    .sort();
  const canonicalRuleFiles = files.filter(
    (file) =>
      file.startsWith(paths.canonicalRules) &&
      file.endsWith('.md') &&
      !file.slice(paths.canonicalRules.length).includes('/'),
  );
  const indexedRuleRows = parseRuleIndexRows(rulesIndexBuffer.toString('utf8'));
  const indexedRuleFiles = indexedRuleRows.map((row) => row.path).sort();
  const canonicalRuleSet = new Set(canonicalRuleFiles);
  const indexedRuleSet = new Set(indexedRuleFiles);
  const classifications = Object.fromEntries(
    [...new Set(indexedRuleRows.map((row) => row.classification))]
      .sort()
      .map((classification): [string, number] => [
        classification,
        indexedRuleRows.filter((row) => row.classification === classification).length,
      ]),
  );

  await emitJson(
    {
      schemaVersion: 1,
      input,
      method: {
        basis:
          'Git-tracked paths and current working-tree bytes; revision and cleanliness recorded separately',
        worktreeQualification: 'Treat measurements as revision-exact only when input.clean is true',
        workspaceCount:
          'Resolve pnpm-workspace.yaml package patterns against tracked package.json paths',
        testSpecCount: 'Count tracked paths containing .test. or .spec.',
        generatedSizes:
          'Sum uncompressed working-tree bytes for tracked regular files; excludes filesystem allocation and compression',
        payloadCounts:
          'Parse tracked working-tree JSON payloads directly (revision-exact only when input.clean is true); do not run code generation or application schemas',
        hubRoutes:
          'Derive routes from tracked demos/oak-curriculum-hub/app/**/page.{js,jsx,ts,tsx} paths',
        ruleCount:
          'Compare RULES_INDEX.md table entries with top-level tracked .agent/rules/*.md files',
      },
      repository: {
        trackedFileCount: files.length,
        workspacePatternCount: workspacePatterns.length,
        workspacePatterns,
        declaredWorkspaceCount: workspaceDirectories.length,
        workspaceDirectories,
        numberedArchitectureDecisionRecordCount: files.filter((file) =>
          /^docs\/architecture\/architectural-decisions\/\d{3}-.*\.md$/.test(file),
        ).length,
        trackedTestSpecFileCount: files.filter((file) => /\.(?:test|spec)\./.test(file)).length,
      },
      generatedVocabulary: {
        path: paths.generatedVocabulary,
        trackedFileCount: vocabularyFiles.length,
        rawBytes: vocabularyBytes,
        mebibytes: toMebibytes(vocabularyBytes),
      },
      graphCorpus: {
        path: paths.graphCorpus,
        rawBytes: graphCorpusBuffer.byteLength,
        ...graphCorpus,
      },
      curriculumHub: {
        pageRoutes,
        course: {
          path: paths.hubCourse,
          ...course,
        },
        qualityStandards: {
          path: paths.hubQualityStandards,
          count: qualityStandards.length,
        },
      },
      widget: {
        path: paths.widget,
        rawBytes: widgetBuffer.byteLength,
        kibibytes: toKibibytes(widgetBuffer.byteLength),
      },
      practice: {
        rulesIndexPath: paths.rulesIndex,
        canonicalRuleFileCount: canonicalRuleFiles.length,
        indexedCanonicalRuleCount: indexedRuleRows.length,
        classifications,
        indexMatchesCanonicalFiles:
          canonicalRuleFiles.length === indexedRuleFiles.length &&
          canonicalRuleFiles.every((file) => indexedRuleSet.has(file)) &&
          indexedRuleFiles.every((file) => canonicalRuleSet.has(file)),
        unindexedCanonicalRuleFiles: canonicalRuleFiles.filter((file) => !indexedRuleSet.has(file)),
        missingCanonicalRuleFiles: indexedRuleFiles.filter((file) => !canonicalRuleSet.has(file)),
      },
    },
    optionalString(args.output),
  );
}

void main().catch((error) => usageError(error.stack ?? error.message, usage));
