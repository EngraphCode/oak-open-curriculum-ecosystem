/**
 * CSS-side comparand extraction for the dtcg↔CSS consistency check.
 *
 * @remarks
 * Parses the canonical CSS with postcss — a real parser, never a brace
 * scanner (unsafe against CSS nesting and quoted braces) — and keys the
 * comparand on top-level `:root` scope: page- and class-scoped
 * re-declarations are cascade refinements, not the token source.
 * `light-dark()` values split into the two theme arms; the explicit
 * dark-theme block overrides dark arms (values `filter` cannot express
 * through `light-dark()`).
 *
 * @packageDocumentation
 */
import postcss, { CssSyntaxError, type Declaration, type Root, type Rule } from 'postcss';
import { type Result, err, ok } from '@oaknational/result';
import { normaliseValue, splitTopLevelComma } from './consistency-values.js';

/** The two per-theme `:root` comparand maps extracted from the CSS. */
export interface CssComparand {
  readonly light: ReadonlyMap<string, string>;
  readonly dark: ReadonlyMap<string, string>;
}

/** Failure shape of the CSS-side extraction. */
export interface CssParseError {
  readonly kind: 'css_parse_error';
  readonly message: string;
}

const LIGHT_DARK_PATTERN = /^light-dark\((?<arms>.*)\)$/su;

function normaliseSelector(selector: string): string {
  return selector.replaceAll('"', "'").replaceAll(/\s+/gu, ' ').trim();
}

function isTopLevelRootRule(rule: Rule): boolean {
  return (
    rule.parent?.type === 'root' &&
    rule.selectors.some((selector) => normaliseSelector(selector) === ':root')
  );
}

function isDarkThemeRule(rule: Rule): boolean {
  return (
    rule.parent?.type === 'root' &&
    rule.selectors.some((selector) => {
      const normalised = normaliseSelector(selector);
      return normalised === "[data-theme='dark']" || normalised === ":root[data-theme='dark']";
    })
  );
}

function directCustomProperties(rule: Rule): readonly Declaration[] {
  return rule.nodes.filter(
    (node): node is Declaration => node.type === 'decl' && node.prop.startsWith('--'),
  );
}

function collectRootDeclarations(
  root: Root,
  light: Map<string, string>,
  dark: Map<string, string>,
): void {
  root.each((node) => {
    if (node.type !== 'rule' || !isTopLevelRootRule(node)) {
      return;
    }

    for (const declaration of directCustomProperties(node)) {
      const value = normaliseValue(declaration.value);
      const lightDarkMatch = LIGHT_DARK_PATTERN.exec(value);
      const arms = lightDarkMatch?.groups
        ? splitTopLevelComma(lightDarkMatch.groups.arms)
        : undefined;

      if (arms) {
        light.set(declaration.prop, normaliseValue(arms[0]));
        dark.set(declaration.prop, normaliseValue(arms[1]));
      } else {
        light.set(declaration.prop, value);
        dark.set(declaration.prop, value);
      }
    }
  });
}

function collectDarkOverrides(root: Root, dark: Map<string, string>): void {
  root.each((node) => {
    if (node.type !== 'rule' || !isDarkThemeRule(node)) {
      return;
    }

    for (const declaration of directCustomProperties(node)) {
      dark.set(declaration.prop, normaliseValue(declaration.value));
    }
  });
}

/** Extract the per-theme comparand from the canonical CSS. */
export function extractCssComparand(css: string): Result<CssComparand, CssParseError> {
  let root: Root;

  try {
    root = postcss.parse(css);
  } catch (error) {
    const message = error instanceof CssSyntaxError ? error.message : String(error);
    return err({ kind: 'css_parse_error', message });
  }

  const light = new Map<string, string>();
  const dark = new Map<string, string>();

  collectRootDeclarations(root, light, dark);
  collectDarkOverrides(root, dark);

  return ok({ light, dark });
}
