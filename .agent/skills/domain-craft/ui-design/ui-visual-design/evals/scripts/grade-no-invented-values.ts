/**
 * Script grader for the ui-visual-design eval suite — the non-render half.
 *
 *   pnpm exec tsx <this file> <artefact> [<artefact> ...]
 *
 * One assertion, applied to every case: the skill decides emphasis, grouping,
 * and affordance, and takes every VALUE from the design system. A response or
 * artefact carrying a literal design value has crossed into
 * design-system-usage's territory and invented what it should have looked up.
 *
 * Two detectors, because the artefacts differ in kind:
 *   - CSS-bearing artefacts go through the estate's own classifier
 *     (`demos/oak-design-showcase/tools/css-literal-values.ts`), so the eval
 *     and the repo gate cannot drift apart on what counts as a literal;
 *   - prose responses go through a bare-literal scan, which catches the
 *     "just give me the hex" shape the classifier never sees because it
 *     never reaches a stylesheet.
 *
 * Exits non-zero if any artefact carries an invented value.
 */
import { readFileSync } from 'node:fs';

import { findLiteralDesignValues } from '../../../../../../../demos/oak-design-showcase/tools/css-literal-values.js';

/** Literal values stated in prose — hexes, and durations outside the system's. */
function proseLiterals(text: string): readonly string[] {
  const withoutTokens = text.replace(/var\(--[a-z0-9-]+\)/gi, '');
  const hits: string[] = [];
  for (const match of withoutTokens.matchAll(/#[0-9a-f]{3,8}\b/gi)) {
    hits.push(match[0]);
  }
  for (const match of withoutTokens.matchAll(/\b(\d+)\s?ms\b/g)) {
    if (!['120', '200'].includes(match[1])) {
      hits.push(match[0]);
    }
  }
  return hits;
}

/** CSS the artefact authors itself — style blocks and style attributes. */
function authoredCss(text: string): string {
  const blocks: string[] = [];
  for (const style of text.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)) {
    blocks.push(style[1]);
  }
  for (const inline of text.matchAll(/style\s*=\s*["']([^"']*)["']/g)) {
    blocks.push(`.inline-style-attribute { ${inline[1]} }`);
  }
  for (const fence of text.matchAll(/```css\n([\s\S]*?)```/g)) {
    blocks.push(fence[1]);
  }
  return blocks.join('\n');
}

const artefacts = process.argv.slice(2);
if (artefacts.length === 0) {
  console.error('usage: grade-no-invented-values.ts <artefact> [<artefact> ...]');
  process.exit(2);
}

let anyFailed = false;
for (const artefact of artefacts) {
  const text = readFileSync(artefact, 'utf8');
  const css = authoredCss(text);
  const cssLiterals = css.trim() === '' ? [] : findLiteralDesignValues(css);
  const prose = proseLiterals(text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ''));
  const pass = cssLiterals.length === 0 && prose.length === 0;
  if (!pass) {
    anyFailed = true;
  }
  console.log(
    JSON.stringify(
      {
        artefact,
        assertions: {
          'no-invented-design-values': {
            pass,
            evidence: pass
              ? 'no literal design value in authored CSS or prose'
              : `css: ${cssLiterals.map((literal) => literal.value).slice(0, 6).join(', ') || 'none'}; prose: ${prose.slice(0, 6).join(', ') || 'none'}`,
          },
        },
      },
      null,
      2,
    ),
  );
}
process.exit(anyFailed ? 1 : 0);
