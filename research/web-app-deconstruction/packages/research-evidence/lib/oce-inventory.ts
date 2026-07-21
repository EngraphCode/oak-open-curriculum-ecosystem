import path from 'node:path';

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function assertArray(value: unknown, label: string): unknown[] {
  if (!Array.isArray(value)) {
    throw new Error(`${label} must be an array`);
  }
  return value;
}

function assertRecord(value: unknown, label: string): Record<string, unknown> {
  if (!isPlainRecord(value)) {
    throw new Error(`${label} must be an object`);
  }
  return value;
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

    const match = line.match(/^\s+-\s+([^#]+?)(?:\s+#.*)?$/);
    if (!match) {
      continue;
    }
    const value = match[1].trim().replace(/^(['"])(.*)\1$/, '$2');
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

  return [...workspaces].sort();
}

export function hubRouteFromPage(file: string): string | null {
  const match = file.match(/^demos\/oak-curriculum-hub\/app\/(.*\/)?page\.(?:js|jsx|ts|tsx)$/);
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
  ].sort();

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
    reportedSubjectsCovered: [...reportedSubjects].sort(),
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
