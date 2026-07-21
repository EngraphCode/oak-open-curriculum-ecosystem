import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const oakBlobCandidate = /^https:\/\/github\.com\/oaknational\/[^/\s]+\/blob\//;
const pinnedSourceLink =
  /^https:\/\/github\.com\/oaknational\/(Database-Tools|Oak-Web-Application|oak-components|oak-openapi|oak-open-curriculum-ecosystem)\/blob\/([0-9a-f]{40})\/([^#?\s]+)(?:#L(\d+)(?:-L(\d+))?)?$/;

export interface PinnedSourceLink {
  document: string;
  repository: string;
  revision: string;
  file: string;
  startLine: number | null;
  endLine: number | null;
}

export interface RepositoryCheckout {
  revision: string;
  root?: string;
  readSource?: (file: string) => Promise<string>;
}

interface SourceLinksResult {
  links: PinnedSourceLink[];
  failures: string[];
}

export interface ValidatePinnedSourceLinksResult {
  markdownRoot: string;
  documentCount: number;
  sourceLinkCount: number;
  lineAnchorCount: number;
  byRepository: Record<string, number>;
  failures: string[];
}

function markdownTargets(source: string): string[] {
  const targets: string[] = [];
  let fence: string | null = null;

  source.split('\n').forEach((rawLine) => {
    const marker = rawLine.match(/^\s*(`{3,}|~{3,})/)?.[1];
    if (marker) {
      if (!fence) {
        fence = marker[0];
      } else if (marker[0] === fence) {
        fence = null;
      }
      return;
    }
    if (fence) {
      return;
    }

    const line = rawLine.replaceAll(/`[^`]*`/g, '');
    const pattern = /\]\(([^)]+)\)|^\s*\[[^\]]+\]:\s*(\S+)/g;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(line)) !== null) {
      const rawTarget = (match[1] ?? match[2] ?? '').trim();
      const withoutTitle = rawTarget.replace(/\s+"[^"]*"$/, '').trim();
      targets.push(withoutTitle.replace(/^<(.+)>$/, '$1'));
    }
  });

  return targets;
}

function sourceLinks(source: string, document: string): SourceLinksResult {
  const links: PinnedSourceLink[] = [];
  const failures: string[] = [];

  for (const target of markdownTargets(source)) {
    const match = target.match(pinnedSourceLink);
    if (!match) {
      if (oakBlobCandidate.test(target)) {
        failures.push(`${document}: malformed or unsupported Oak GitHub blob link: ${target}`);
      }
      continue;
    }

    let file: string;
    try {
      file = decodeURIComponent(match[3]);
    } catch {
      failures.push(`${document}: invalid source-path encoding: ${target}`);
      continue;
    }

    links.push({
      document,
      repository: match[1],
      revision: match[2],
      file,
      startLine: match[4] ? Number(match[4]) : null,
      endLine: match[4] ? Number(match[5] ?? match[4]) : null,
    });
  }

  return { links, failures };
}

export function extractPinnedSourceAnchors(source: string, document: string): PinnedSourceLink[] {
  return sourceLinks(source, document).links;
}

async function markdownFiles(root: string): Promise<string[]> {
  const entries = await readdir(root, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const absolute = path.join(root, entry.name);
      if (entry.isDirectory()) {
        return markdownFiles(absolute);
      }
      return entry.isFile() && entry.name.endsWith('.md') ? [absolute] : [];
    }),
  );
  return nested.flat().sort();
}

function isSafeRepositoryPath(file: string): boolean {
  // Both separator families: on Windows an encoded `..\` segment would pass
  // a POSIX-only split and let path.resolve escape the checkout root.
  return (
    file !== '' &&
    !path.posix.isAbsolute(file) &&
    !path.win32.isAbsolute(file) &&
    !file.split(/[\\/]/u).includes('..')
  );
}

async function readRepositorySource(repository: RepositoryCheckout, file: string): Promise<string> {
  if (repository.readSource) {
    return repository.readSource(file);
  }
  if (!isSafeRepositoryPath(file)) {
    throw new Error('source path escapes repository');
  }
  const root = repository.root;
  if (root === undefined) {
    throw new Error('source path escapes repository');
  }
  return readFile(path.resolve(root, file), 'utf8');
}

export async function validatePinnedSourceLinks(
  markdownRoot: string,
  repositories: Record<string, RepositoryCheckout>,
  requiredRepositories: string[] = Object.keys(repositories),
): Promise<ValidatePinnedSourceLinksResult> {
  const documents = await markdownFiles(markdownRoot);
  const parsedDocuments = await Promise.all(
    documents.map(async (document) =>
      sourceLinks(await readFile(document, 'utf8'), path.relative(markdownRoot, document)),
    ),
  );
  const links = parsedDocuments.flatMap((parsed) => parsed.links);
  const failures = parsedDocuments.flatMap((parsed) => parsed.failures);
  const byRepository: Record<string, number> = {};
  let lineAnchorCount = 0;

  if (links.length === 0) {
    failures.push('concept-lens portfolio contains no pinned source links');
  }

  for (const link of links) {
    const repository = repositories[link.repository];
    if (!repository) {
      failures.push(`${link.document}: no checkout configured for ${link.repository}`);
      continue;
    }

    byRepository[link.repository] = (byRepository[link.repository] ?? 0) + 1;
    if (link.revision !== repository.revision) {
      failures.push(
        `${link.document}: ${link.repository} link uses ${link.revision}; checkout is ${repository.revision}`,
      );
      continue;
    }
    if (!isSafeRepositoryPath(link.file)) {
      failures.push(`${link.document}: source path escapes ${link.repository}: ${link.file}`);
      continue;
    }

    let source: string;
    try {
      source = await readRepositorySource(repository, link.file);
    } catch {
      failures.push(`${link.document}: missing ${link.repository}/${link.file}`);
      continue;
    }

    if (link.startLine === null || link.endLine === null) {
      continue;
    }
    lineAnchorCount += 1;
    const newlineCount = source.match(/\n/g)?.length ?? 0;
    const lineCount = source.length === 0 ? 0 : newlineCount + (source.endsWith('\n') ? 0 : 1);
    if (link.startLine < 1 || link.endLine < link.startLine || link.endLine > lineCount) {
      failures.push(
        `${link.document}: invalid ${link.repository}/${link.file}#L${link.startLine}-L${link.endLine}; file has ${lineCount} lines`,
      );
    }
  }

  for (const repository of requiredRepositories) {
    if (!byRepository[repository]) {
      failures.push(`concept-lens portfolio has no source links for ${repository}`);
    }
  }

  return {
    markdownRoot,
    documentCount: documents.length,
    sourceLinkCount: links.length,
    lineAnchorCount,
    byRepository,
    failures,
  };
}
