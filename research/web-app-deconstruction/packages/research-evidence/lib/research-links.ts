import fs from 'node:fs';
import path from 'node:path';

export interface ResolvedInternalLink {
  target: string | null;
  error: string | null;
}

export function isWithinRoot(root: string, target: string): boolean {
  const relation = path.relative(path.resolve(root), path.resolve(target));
  return (
    relation === '' ||
    (!relation.startsWith(`..${path.sep}`) && relation !== '..' && !path.isAbsolute(relation))
  );
}

export function resolveInternalLink(
  repositoryRoot: string,
  sourceFile: string,
  rawTarget: string,
): ResolvedInternalLink {
  // `(?<!\s)` pins the match to the start of the final whitespace run —
  // where the leftmost match always began — so scanning cannot restart
  // inside the run (S8786); the replaced text is unchanged.
  const withoutTitle = rawTarget.replace(/(?<!\s)\s+"[^"]*"$/, '').trim();
  const withoutAngles = withoutTitle.replace(/^<(.+)>$/, '$1');
  const undecorated = withoutAngles.split('#')[0].split('?')[0];
  if (undecorated === '') {
    return { target: null, error: null };
  }

  let decoded: string;
  try {
    decoded = decodeURIComponent(undecorated);
  } catch {
    return {
      target: null,
      error: `invalid percent encoding in ${JSON.stringify(rawTarget)}`,
    };
  }

  const target = decoded.startsWith('/')
    ? path.resolve(repositoryRoot, decoded.replace(/^\/+/, ''))
    : path.resolve(path.dirname(sourceFile), decoded);
  if (!isWithinRoot(repositoryRoot, target)) {
    return {
      target: null,
      error: `internal link escapes the repository: ${JSON.stringify(rawTarget)}`,
    };
  }

  if (fs.existsSync(target)) {
    const realRoot = fs.realpathSync(repositoryRoot);
    const realTarget = fs.realpathSync(target);
    if (!isWithinRoot(realRoot, realTarget)) {
      return {
        target: null,
        error: `internal link resolves outside the repository: ${JSON.stringify(rawTarget)}`,
      };
    }
  }

  return { target, error: null };
}
