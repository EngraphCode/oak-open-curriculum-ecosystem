import path from 'node:path';

import { codeUnitCompare } from './compare.js';

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function assertArray(value: unknown, label: string): unknown[] {
  if (!Array.isArray(value)) {
    throw new TypeError(`${label} must be an array`);
  }
  return value;
}

function assertRecord(value: unknown, label: string): Record<string, unknown> {
  if (!isPlainRecord(value)) {
    throw new Error(`${label} must be an object`);
  }
  return value;
}

function isItemIndent(character: string | undefined): boolean {
  return character === ' ' || character === '\t';
}

// Manual scan replacing `/^[ \t]+-[ \t]+(.*)$/` — a failed match of that
// shape backtracks quadratically across all-whitespace lines (S8786); the
// scan is linear by construction and accepts the identical language:
// one-or-more indent, `-`, one-or-more separator, remainder (may be empty).
function parseWorkspaceListItem(line: string): string | null {
  let index = 0;
  while (isItemIndent(line[index])) {
    index += 1;
  }
  if (index === 0 || line[index] !== '-') {
    return null;
  }
  index += 1;
  const afterDash = index;
  while (isItemIndent(line[index])) {
    index += 1;
  }
  if (index === afterDash) {
    return null;
  }
  return line.slice(index);
}

// A trailing `# comment` counts only when whitespace precedes the `#`;
// an item with `#` hard against the value is malformed and skipped,
// exactly as the former single-regex parse behaved.
function workspaceItemValue(item: string): string | null {
  const hashIndex = item.indexOf('#');
  let rawValue: string;
  if (hashIndex === -1) {
    rawValue = item;
  } else {
    rawValue = item.slice(0, hashIndex);
    if (!/[ \t]$/.test(rawValue)) {
      return null;
    }
  }
  const value = rawValue.trim().replace(/^(['"])(.*)\1$/, '$2');
  return value || null;
}

export function parseWorkspacePatterns(source: string): string[] {
  const patterns: string[] = [];
  let inPackages = false;

  for (const line of source.split(/\r?\n/)) {
    if (!inPackages) {
      if (/^packages:\s*(?:#.*)?$/.test(line)) {
        inPackages = true;
      }
      continue;
    }
    if (/^\S/.test(line)) {
      break;
    }
    const item = parseWorkspaceListItem(line);
    if (item === null) {
      continue;
    }
    const value = workspaceItemValue(item);
    if (value) {
      patterns.push(value);
    }
  }

  if (patterns.length === 0) {
    throw new Error('pnpm-workspace.yaml contains no package patterns');
  }
  return patterns;
}

function workspacePatternRegex(pattern: string): RegExp {
  let source = '';
  for (let index = 0; index < pattern.length; index += 1) {
    const character = pattern[index];
    if (character === '*' && pattern[index + 1] === '*') {
      source += '.*';
      index += 1;
    } else if (character === '*') {
      source += '[^/]*';
    } else if (character === '?') {
      source += '[^/]';
    } else {
      source += character.replaceAll(/[|\\{}()[\]^$+?.]/g, String.raw`\$&`);
    }
  }
  return new RegExp(`^${source}$`);
}

export function resolveWorkspaceDirectories(trackedFiles: string[], patterns: string[]): string[] {
  const packageDirectories = trackedFiles
    .filter((file) => file === 'package.json' || file.endsWith('/package.json'))
    .map((file) => path.posix.dirname(file));
  const workspaces = new Set<string>();

  for (const pattern of patterns) {
    const matcher = workspacePatternRegex(pattern);
    const matches = packageDirectories.filter((directory) => matcher.test(directory));
    if (matches.length === 0) {
      throw new Error(`Workspace pattern matched no tracked package: ${pattern}`);
    }
    for (const match of matches) {
      workspaces.add(match);
    }
  }

  return [...workspaces].sort(codeUnitCompare);
}

export function hubRouteFromPage(file: string): string | null {
  const match = /^demos\/oak-curriculum-hub\/app\/(.*\/)?page\.(?:js|jsx|ts|tsx)$/.exec(file);
  if (!match) {
    return null;
  }

  const route = (match[1] ?? '')
    .split('/')
    .filter(Boolean)
    .filter(
      (segment) => !(segment.startsWith('(') && segment.endsWith(')')) && !segment.startsWith('@'),
    )
    .join('/');
  return route ? `/${route}` : '/';
}

export interface GraphCorpusSummary {
  version: unknown;
  generatedAt: unknown;
  sourceVersion: unknown;
  nodeCount: number;
  edgeCount: number;
  reportedNodeCount: unknown;
  reportedEdgeCount: unknown;
  reportedCountsMatchPayload: boolean;
  reportedSubjectsCovered: unknown[];
  reportedSubjectsCoveredCount: number;
  distinctNodeSubjectValues: string[];
  distinctNodeSubjectValueCount: number;
}

export function summarizeGraphCorpus(value: unknown): GraphCorpusSummary {
  const corpus = assertRecord(value, 'graph corpus');
  const nodes = assertArray(corpus.nodes, 'graph corpus nodes');
  const edges = assertArray(corpus.edges, 'graph corpus edges');
  const stats = assertRecord(corpus.stats, 'graph corpus stats');
  const reportedSubjects = assertArray(stats.subjectsCovered, 'graph corpus stats.subjectsCovered');
  const distinctNodeSubjectValues = [
    ...new Set(
      nodes
        .map((node) => assertRecord(node, 'graph corpus node').subject)
        .filter((subject): subject is string => typeof subject === 'string'),
    ),
  ].sort(codeUnitCompare);

  return {
    version: corpus.version,
    generatedAt: corpus.generatedAt,
    sourceVersion: corpus.sourceVersion,
    nodeCount: nodes.length,
    edgeCount: edges.length,
    reportedNodeCount: stats.totalNodes,
    reportedEdgeCount: stats.totalEdges,
    reportedCountsMatchPayload:
      stats.totalNodes === nodes.length && stats.totalEdges === edges.length,
    reportedSubjectsCovered: [...reportedSubjects].sort((left, right) =>
      codeUnitCompare(String(left), String(right)),
    ),
    reportedSubjectsCoveredCount: reportedSubjects.length,
    distinctNodeSubjectValues,
    distinctNodeSubjectValueCount: distinctNodeSubjectValues.length,
  };
}

export interface CourseSummary {
  unitCount: number;
  moduleCount: number;
  introSectionCount: number;
  moduleSectionCount: number;
  sectionCount: number;
  blockCount: number;
}

export function summarizeCourse(value: unknown): CourseSummary {
  const course = assertRecord(value, 'course');
  const units = assertArray(course.units, 'course units');
  const modules = assertArray(course.modules, 'course modules');
  const intro = assertRecord(course.intro, 'course intro');
  const introSections = assertArray(intro.sections, 'course intro sections');
  const moduleSections = modules.flatMap((module) =>
    assertArray(assertRecord(module, 'course module').sections, 'course module sections'),
  );
  const sections = [...introSections, ...moduleSections];
  const blockCount = sections.reduce<number>(
    (total, section) =>
      total +
      assertArray(assertRecord(section, 'course section').blocks, 'course section blocks').length,
    0,
  );

  return {
    unitCount: units.length,
    moduleCount: modules.length,
    introSectionCount: introSections.length,
    moduleSectionCount: moduleSections.length,
    sectionCount: sections.length,
    blockCount,
  };
}

export interface RuleIndexRow {
  path: string;
  classification: string;
}

export function parseRuleIndexRows(source: string): RuleIndexRow[] {
  const rows: RuleIndexRow[] = [];
  const pattern = /^\|\s+`(\.agent\/rules\/[^`]+\.md)`\s+\|\s+([a-z-]+)\s+\|/gm;
  for (const match of source.matchAll(pattern)) {
    rows.push({ path: match[1], classification: match[2] });
  }
  return rows;
}
