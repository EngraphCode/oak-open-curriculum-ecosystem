/**
 * Pure classifier for the owner's no-hardcoded-values invariant, CSS half:
 * a declaration value in AUTHORED showcase CSS may compose kit token roles
 * (`var(--…)`) and plain CSS keywords, never literal design values. Parsed
 * with postcss — a real parser, never a brace scanner (the estate's
 * design-tokens comparand records why: nesting and quoted braces defeat
 * regexes). Zero IO: the gating script (validate-authored-css.ts) owns the
 * filesystem.
 *
 * A design value is: a hex colour, a colour function, or a number carrying
 * a length/time unit. Bare `0`, unitless numbers (line-height ratios) and
 * keywords carry no design value. Quoted strings, url() tokens and comments
 * are stripped before matching (a `content: '#'` or a hash in a comment is
 * not a colour); `var()` fallbacks stay scannable — a literal fallback is a
 * hardcoded value by another door.
 */
import { parse } from 'postcss';

export interface LiteralDesignValue {
  readonly selector: string;
  readonly prop: string;
  readonly value: string;
}

const HEX_COLOR = /#[0-9a-f]{3,8}\b/i;
const COLOR_FUNCTION = /(?:^|[\s(,])(?:rgba?|hsla?|oklch|oklab|lab|lch|color|color-mix)\(/i;
const UNIT_NUMBER =
  /(?:^|[\s(,])[+-]?\d*\.?\d+(?:px|rem|em|%|vh|vw|vmin|vmax|ch|ex|pt|ms|s)(?=[\s),]|$)/i;

function scannableValue(raw: string): string {
  let value = raw
    .replaceAll(/\/\*[\s\S]*?\*\//g, ' ')
    .replaceAll(/'[^']*'|"[^"]*"/g, ' ')
    .replaceAll(/url\([^)]*\)/gi, ' ');
  // Unwrap var() references, innermost first: a bare reference disappears;
  // a fallback form keeps its fallback text in scanning scope.
  let previous = '';
  while (previous !== value) {
    previous = value;
    value = value
      .replaceAll(/var\(\s*--[\w-]+\s*\)/g, ' ')
      .replaceAll(/var\(\s*--[\w-]+\s*,/g, '(');
  }
  return value;
}

function isLiteralDesignValue(raw: string): boolean {
  const value = scannableValue(raw);
  return HEX_COLOR.test(value) || COLOR_FUNCTION.test(value) || UNIT_NUMBER.test(value);
}

/** Every declaration in the stylesheet whose value carries a literal design
 *  value, with enough context to name the cure site. */
export function findLiteralDesignValues(css: string): readonly LiteralDesignValue[] {
  const findings: LiteralDesignValue[] = [];
  parse(css).walkDecls((decl) => {
    if (isLiteralDesignValue(decl.value)) {
      const parent = decl.parent;
      const selector =
        parent !== undefined && 'selector' in parent && typeof parent.selector === 'string'
          ? parent.selector
          : '(at-rule)';
      findings.push({ selector, prop: decl.prop, value: decl.value });
    }
  });
  return findings;
}
