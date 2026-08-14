/**
 * The mechanical subject predicate — the census's source of truth for
 * WHAT gets a row. The union of:
 * (i)   every pnpm workspace member;
 * (ii)  the parent directory of every tracked `package.json` that is
 *       neither a member directory nor nested under one (surfaces the
 *       member list cannot see);
 * (iii) every top-level path segment of the tracked file list, filtered
 *       to the declared code-extension set, not already covered by (i)
 *       or (ii).
 */
import { CODE_EXTENSIONS } from './vocabulary.js';

type SubjectSource = 'pnpm-member' | 'package-json-parent' | 'code-root';

export interface CensusSubject {
  readonly dirPath: string;
  readonly publishedName: string | null;
  readonly sources: readonly SubjectSource[];
}

export interface DeriveSubjectsInput {
  readonly members: readonly { readonly name: string; readonly path: string }[];
  readonly trackedFiles: readonly string[];
  readonly codeExtensions?: readonly string[];
}

interface SubjectDraft {
  publishedName: string | null;
  readonly sources: Set<SubjectSource>;
}

type DraftMap = Map<string, SubjectDraft>;

function parentDir(filePath: string): string {
  const lastSlash = filePath.lastIndexOf('/');
  return lastSlash === -1 ? '.' : filePath.slice(0, lastSlash);
}

function topSegment(filePath: string): string {
  const firstSlash = filePath.indexOf('/');
  return firstSlash === -1 ? '.' : filePath.slice(0, firstSlash);
}

function isUnder(candidate: string, root: string): boolean {
  return candidate === root || candidate.startsWith(`${root}/`);
}

function record(
  drafts: DraftMap,
  dirPath: string,
  source: SubjectSource,
  publishedName: string | null,
): void {
  const existing = drafts.get(dirPath);
  if (existing === undefined) {
    drafts.set(dirPath, { publishedName, sources: new Set([source]) });
    return;
  }
  existing.sources.add(source);
  if (existing.publishedName === null && publishedName !== null) {
    existing.publishedName = publishedName;
  }
}

function collectPackageJsonParents(drafts: DraftMap, input: DeriveSubjectsInput): void {
  const memberPaths = input.members.map((member) => member.path);
  for (const filePath of input.trackedFiles) {
    if (filePath !== 'package.json' && !filePath.endsWith('/package.json')) {
      continue;
    }
    const dir = parentDir(filePath);
    if (memberPaths.some((memberPath) => isUnder(dir, memberPath))) {
      continue;
    }
    record(drafts, dir, 'package-json-parent', null);
  }
}

function collectCodeRoots(drafts: DraftMap, input: DeriveSubjectsInput): void {
  const extensions = input.codeExtensions ?? CODE_EXTENSIONS;
  const coveredRoots = [...drafts.keys()];
  for (const filePath of input.trackedFiles) {
    if (!extensions.some((extension) => filePath.endsWith(extension))) {
      continue;
    }
    const segment = topSegment(filePath);
    const coveredByExisting =
      segment !== '.' &&
      coveredRoots.some(
        (root) => root !== '.' && (isUnder(root, segment) || isUnder(segment, root)),
      );
    if (coveredByExisting) {
      continue;
    }
    record(drafts, segment, 'code-root', null);
  }
}

/** Derive the census subject set from the mechanical predicate above. */
export function deriveSubjects(input: DeriveSubjectsInput): CensusSubject[] {
  const drafts: DraftMap = new Map();
  for (const member of input.members) {
    record(drafts, member.path, 'pnpm-member', member.name);
  }
  collectPackageJsonParents(drafts, input);
  collectCodeRoots(drafts, input);

  return [...drafts.entries()]
    .map(([dirPath, draft]) => ({
      dirPath,
      publishedName: draft.publishedName,
      sources: [...draft.sources].sort((a, b) => a.localeCompare(b)),
    }))
    .sort((a, b) => a.dirPath.localeCompare(b.dirPath));
}
