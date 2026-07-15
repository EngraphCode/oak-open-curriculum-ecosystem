/**
 * Classify extracted Markdown path dependencies and assemble the link report.
 *
 * @packageDocumentation
 */

import {
  extractMarkdownLinks,
  resolveLinkTarget,
  suggestFix,
} from './validate-markdown-links-helpers.js';
import type {
  BrokenLink,
  BrokenLinksByFile,
  ExtractedLink,
  MarkdownLinkReport,
  ScanFile,
} from './validate-markdown-links-types.js';

interface FileLinkReport {
  readonly broken: readonly BrokenLink[];
  readonly linksChecked: number;
}

/** Classify one resolved dependency against existence and availability. */
function classifyResolvedLink(
  sourcePath: string,
  link: ExtractedLink,
  resolvedTarget: string,
  repoPaths: readonly string[],
  repoPathSet: ReadonlySet<string>,
  trackedPaths: ReadonlySet<string>,
): BrokenLink | null {
  const targetExists = repoPathSet.has(resolvedTarget);
  const crossesAvailabilityBoundary =
    trackedPaths.has(sourcePath) && !trackedPaths.has(resolvedTarget);
  if (targetExists && !crossesAvailabilityBoundary) {
    return null;
  }
  return {
    writtenTarget: link.rawTarget,
    resolvedTarget,
    line: link.line,
    reason: targetExists ? 'tracked-source-to-untracked-target' : 'missing-target',
    suggestedFix: targetExists ? null : suggestFix(sourcePath, resolvedTarget, repoPaths),
  };
}

/** Classify every extracted dependency in one Markdown source. */
function findBrokenLinksForFile(
  file: ScanFile,
  repoPaths: readonly string[],
  repoPathSet: ReadonlySet<string>,
  trackedPaths: ReadonlySet<string>,
): FileLinkReport {
  const broken: BrokenLink[] = [];
  let linksChecked = 0;
  for (const link of extractMarkdownLinks(file.path, file.content)) {
    const resolvedTarget = resolveLinkTarget(file.path, link.rawTarget);
    if (resolvedTarget === null) {
      continue;
    }
    linksChecked++;
    const finding = classifyResolvedLink(
      file.path,
      link,
      resolvedTarget,
      repoPaths,
      repoPathSet,
      trackedPaths,
    );
    if (finding !== null) {
      broken.push(finding);
    }
  }
  return { broken, linksChecked };
}

/**
 * Find every broken internal link across the supplied source files.
 *
 * A link is broken when its target is missing, or when a tracked source points
 * to an untracked target that does not travel with it (PDR-105).
 */
export function findBrokenLinks(
  files: readonly ScanFile[],
  repoPaths: readonly string[],
  trackedPaths: ReadonlySet<string> = new Set(repoPaths),
): MarkdownLinkReport {
  const repoPathSet = new Set(repoPaths);
  const broken: BrokenLink[] = [];
  const byFile: BrokenLinksByFile[] = [];
  let linksChecked = 0;
  for (const file of files) {
    const fileReport = findBrokenLinksForFile(file, repoPaths, repoPathSet, trackedPaths);
    linksChecked += fileReport.linksChecked;
    broken.push(...fileReport.broken);
    if (fileReport.broken.length > 0) {
      byFile.push({ sourcePath: file.path, links: fileReport.broken });
    }
  }
  const autoFixable = broken.filter((link) => link.suggestedFix !== null).length;
  return {
    broken,
    byFile,
    totals: {
      filesScanned: files.length,
      linksChecked,
      brokenLinks: broken.length,
      autoFixable,
      manual: broken.length - autoFixable,
    },
  };
}
