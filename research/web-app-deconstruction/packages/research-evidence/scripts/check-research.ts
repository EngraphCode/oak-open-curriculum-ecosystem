import fs from 'node:fs';
import path from 'node:path';

import { validateConceptLensStructure } from '../lib/concept-lens-structure.js';
import { resolveInternalLink } from '../lib/research-links.js';

interface MarkdownLink {
  line: number;
  rawTarget: string;
}

const root = process.cwd();
const markdownRoot = path.join(root, 'README.md');
const excludedDirectories = new Set(['.git', 'node_modules', '.turbo', 'dist']);
const portableExtensions = new Set([
  '.cjs',
  '.js',
  '.json',
  '.md',
  '.mjs',
  '.ts',
  '.tsx',
  '.yaml',
  '.yml',
]);
const machineLocalPatterns = [
  /\/Users\/[^/\s]+/,
  /\/home\/[^/\s]+/,
  /[A-Za-z]:\\Users\\[^\\\s]+/,
  /\/private\/tmp(?:\/|\b)/,
  /\/var\/folders(?:\/|\b)/,
];

function walk(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (excludedDirectories.has(entry.name)) {
      return [];
    }
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(absolute) : [absolute];
  });
}

function relative(file: string): string {
  return path.relative(root, file).split(path.sep).join('/');
}

function extractMarkdownLinks(source: string): MarkdownLink[] {
  const links: MarkdownLink[] = [];
  let inFence = false;
  const lines = source.split('\n');

  lines.forEach((rawLine, index) => {
    if (/^\s*(?:```|~~~)/.test(rawLine)) {
      inFence = !inFence;
      return;
    }
    if (inFence) {
      return;
    }

    const line = rawLine.replaceAll(/`[^`]*`/g, '');
    const pattern = /\]\(([^)]+)\)|^\s*\[[^\]]+\]:\s*(\S+)/g;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(line)) !== null) {
      const rawTarget = (match[1] ?? match[2] ?? '').trim();
      if (rawTarget === '' || rawTarget.startsWith('#') || /^[a-z][a-z0-9+.-]*:/i.test(rawTarget)) {
        continue;
      }
      links.push({ line: index + 1, rawTarget });
    }
  });

  return links;
}

const allFiles = walk(root);
const markdownFiles = allFiles.filter((file) => file.endsWith('.md'));
const portableFiles = allFiles.filter((file) => portableExtensions.has(path.extname(file)));
const failures: string[] = [];
const markdownGraph = new Map<string, string[]>();
const lifecycleRecord = /^(?:docs\/hypotheses\/H\d+.*|docs\/investigations\/premises\/.*)\.md$/;
const formalHypothesisRecord = /^docs\/hypotheses\/H\d+.*\.md$/;
const conceptLensRecord =
  /^docs\/current-state\/(?:owa-components-concept-lenses|database-tools\/concept-lenses)\/(?!README\.md$|synthesis\.md$).+\.md$/;
let conceptLensCount = 0;

for (const file of portableFiles) {
  const source = fs.readFileSync(file, 'utf8');
  source.split('\n').forEach((line, index) => {
    if (/[ \t]+$/.test(line)) {
      failures.push(`${relative(file)}:${index + 1}: trailing whitespace`);
    }
    if (/^(?:<<<<<<<|=======|>>>>>>>)/.test(line)) {
      failures.push(`${relative(file)}:${index + 1}: merge-conflict marker`);
    }
    for (const pattern of machineLocalPatterns) {
      const match = pattern.exec(line);
      if (match) {
        failures.push(
          `${relative(file)}:${index + 1}: machine-local path ${JSON.stringify(match[0])}`,
        );
        break;
      }
    }
  });
}

for (const file of markdownFiles) {
  const source = fs.readFileSync(file, 'utf8');
  const fileName = relative(file);

  if (conceptLensRecord.test(fileName)) {
    const validation = validateConceptLensStructure(source, fileName);
    conceptLensCount += validation.lensCount;
    failures.push(...validation.failures);
  }

  if (lifecycleRecord.test(fileName)) {
    const frontMatter = source.match(/^---\n([\s\S]*?)\n---(?:\n|$)/)?.[1];
    if (!frontMatter) {
      failures.push(`${fileName}: missing lifecycle front matter`);
    } else {
      for (const field of ['status', 'evidence_snapshot', 'last_updated']) {
        if (!new RegExp(String.raw`^${field}:\s*\S.+$`, 'm').test(frontMatter)) {
          failures.push(`${fileName}: missing non-empty ${field} metadata`);
        }
      }
    }
  }

  if (!formalHypothesisRecord.test(fileName) && source.includes('**Hypothesis:**')) {
    failures.push(
      `${fileName}: formal Hypothesis label is only valid in a registered hypothesis record`,
    );
  }

  if (formalHypothesisRecord.test(fileName)) {
    for (const section of [
      'Claim',
      'Why it is plausible',
      'Predictions',
      'Invalidators and weakening evidence',
      'Most direct discriminating work',
      'Decision affected',
      'Evidence history',
    ]) {
      if (!source.includes(`## ${section}`)) {
        failures.push(`${fileName}: missing hypothesis section ${JSON.stringify(section)}`);
      }
    }
  }

  for (const match of source.matchAll(
    /https:\/\/github\.com\/[^\s)]+\/(?:blob|tree)\/([^/#?\s)]+)/g,
  )) {
    if (!/^[0-9a-f]{40}$/.test(match[1])) {
      const line = source.slice(0, match.index).split('\n').length;
      failures.push(`${fileName}:${line}: GitHub evidence link is not pinned to a full commit`);
    }
  }

  const dependencies: string[] = [];
  for (const link of extractMarkdownLinks(source)) {
    const resolved = resolveInternalLink(root, file, link.rawTarget);
    if (resolved.error) {
      failures.push(`${relative(file)}:${link.line}: ${resolved.error}`);
      continue;
    }
    const target = resolved.target;
    if (!target) {
      continue;
    }
    if (!fs.existsSync(target)) {
      failures.push(
        `${relative(file)}:${link.line}: broken internal link ${JSON.stringify(link.rawTarget)}`,
      );
      continue;
    }
    if (target.endsWith('.md')) {
      dependencies.push(target);
    }
  }
  markdownGraph.set(file, dependencies);
}

const reachable = new Set<string>();
const pending = [markdownRoot];
while (pending.length > 0) {
  const file = pending.pop();
  if (!file || reachable.has(file)) {
    continue;
  }
  reachable.add(file);
  pending.push(...(markdownGraph.get(file) ?? []));
}

for (const file of markdownFiles) {
  if (!reachable.has(file)) {
    failures.push(`${relative(file)}: not reachable from README.md`);
  }
}

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log(
    `Research checks passed: ${markdownFiles.length} Markdown files are portable, linked and indexed; ${conceptLensCount} concept lenses have the required exploration structure.`,
  );
}
