/**
 * Script grader for the design-system-usage eval suite.
 *
 * Grades one composed HTML page against the assertion families that can be
 * decided mechanically — the halves of cases (a) and (c) that do not need a
 * judge. Usage:
 *
 *   pnpm exec tsx <this file> <page.html> [<page.html> ...]
 *
 * Prints one JSON object per page on stdout and exits non-zero if any
 * assertion fails, so the same invocation serves both a human run and a
 * future automated runner.
 *
 * The literal-design-value classifier is the estate's own
 * (`demos/oak-design-showcase/tools/css-literal-values.ts`) — the grader
 * reuses it rather than re-deciding what counts as a raw value, so the eval
 * and the repo gate can never drift apart on that question.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { findLiteralDesignValues } from '../../../../../../../demos/oak-design-showcase/tools/css-literal-values.js';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '..', '..', '..', '..', '..', '..', '..');
const trunkDir = join(repoRoot, 'packages', 'design', 'oak-design-system');

/** The class trunk: every `.oak-*` class the design system actually defines. */
function trunkClasses(): ReadonlySet<string> {
  const found = new Set<string>();
  for (const file of ['components.css', 'colors_and_type.css', 'print.css', 'oak-icons.css']) {
    const css = readFileSync(join(trunkDir, file), 'utf8');
    for (const match of css.matchAll(/\.(oak-[a-z0-9-]+)/g)) {
      found.add(match[1]);
    }
  }
  if (found.size === 0) {
    throw new Error('trunk scan found zero oak-* classes — the grader is scanning nothing');
  }
  return found;
}

/** Every `.oak-*` class the page references in a class attribute. */
function referencedClasses(html: string): ReadonlySet<string> {
  const found = new Set<string>();
  for (const attr of html.matchAll(/class\s*=\s*["']([^"']*)["']/g)) {
    for (const token of attr[1].split(/\s+/)) {
      if (token.startsWith('oak-')) {
        found.add(token);
      }
    }
  }
  return found;
}

/** Author-written CSS: the page's own `<style>` blocks and style attributes. */
function authoredCss(html: string): string {
  const blocks: string[] = [];
  for (const style of html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)) {
    blocks.push(style[1]);
  }
  for (const inline of html.matchAll(/style\s*=\s*["']([^"']*)["']/g)) {
    blocks.push(`.inline-style-attribute { ${inline[1]} }`);
  }
  return blocks.join('\n');
}

/** Declaration count in the page's own CSS — the ad-hoc-CSS measure for case (c). */
function adHocRuleCount(css: string): number {
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
  return withoutComments.split(';').filter((part) => /[a-z-]+\s*:/i.test(part)).length;
}

interface Grade {
  readonly page: string;
  readonly assertions: Record<string, { readonly pass: boolean; readonly evidence: string }>;
}

function gradePage(path: string, trunk: ReadonlySet<string>): Grade {
  const html = readFileSync(path, 'utf8');
  const referenced = [...referencedClasses(html)];
  const unknown = referenced.filter((name) => !trunk.has(name));
  const css = authoredCss(html);
  const literals = findLiteralDesignValues(css);
  const adHoc = adHocRuleCount(css);

  return {
    page: path,
    assertions: {
      'referenced-oak-classes-exist': {
        pass: referenced.length > 0 && unknown.length === 0,
        evidence:
          referenced.length === 0
            ? 'page references no oak-* classes at all'
            : `${referenced.length} referenced, ${unknown.length} not in the trunk` +
              (unknown.length > 0 ? `: ${unknown.slice(0, 10).join(', ')}` : ''),
      },
      'no-literal-design-values': {
        pass: literals.length === 0,
        evidence:
          literals.length === 0
            ? 'authored CSS carries no literal design values'
            : `${literals.length} literal(s): ` +
              literals
                .slice(0, 8)
                .map((literal) => literal.value)
                .join(', '),
      },
      'zero-ad-hoc-css': {
        pass: adHoc === 0,
        evidence: `${adHoc} authored declaration(s) in page <style>/style= — the design system's classes should carry all of it`,
      },
    },
  };
}

const pages = process.argv.slice(2);
if (pages.length === 0) {
  console.error('usage: grade-page.ts <page.html> [<page.html> ...]');
  process.exit(2);
}

const trunk = trunkClasses();
let anyFailed = false;
for (const page of pages) {
  const grade = gradePage(page, trunk);
  if (Object.values(grade.assertions).some((assertion) => !assertion.pass)) {
    anyFailed = true;
  }
  console.log(JSON.stringify(grade, null, 2));
}
process.exit(anyFailed ? 1 : 0);
