/*
 * Reusable CSS custom-property parsing + value normalisation for the
 * token-fidelity audit — the framework half of that tool's framework/consumer
 * split (MAPPING + the demo/auth paths are the Oak-specific consumer config,
 * and stay in token-fidelity-audit.ts). Linear scans throughout, replacing
 * the Sonar-S8786-flagged whole-file declaration regex.
 */
import { readFileSync } from 'node:fs';

interface CssDeclaration {
  name: string;
  value: string;
}

function isNameChar(ch: string): boolean {
  return /[a-zA-Z0-9-]/.test(ch);
}

/** Remove every complete inline block comment from a value — linear scan, no regex. */
function stripBlockComments(value: string): string {
  let out = '';
  let idx = 0;
  while (idx < value.length) {
    const open = value.indexOf('/*', idx);
    if (open === -1) {
      out += value.slice(idx);
      break;
    }
    const close = value.indexOf('*/', open + 2);
    if (close === -1) {
      out += value.slice(idx);
      break;
    }
    out += value.slice(idx, open);
    idx = close + 2;
  }
  return out;
}

/** Parse `name<ws>:<value>` at the start of `rest` (the text just after a `--`). */
function parseDeclarationAt(rest: string): CssDeclaration | undefined {
  let nameEnd = 0;
  while (nameEnd < rest.length && isNameChar(rest.charAt(nameEnd))) {
    nameEnd += 1;
  }
  if (nameEnd === 0) {
    return undefined;
  }
  let colon = nameEnd;
  while (colon < rest.length && rest.charAt(colon).trim() === '') {
    colon += 1;
  }
  if (rest.charAt(colon) !== ':') {
    return undefined;
  }
  const rawValue = rest.slice(colon + 1);
  if (rawValue === '') {
    return undefined;
  }
  return { name: rest.slice(0, nameEnd), value: stripBlockComments(rawValue).trim() };
}

/** Find the `--name: value` declaration in one `;`-delimited chunk — linear scan, replacing the
 *  Sonar-S8786-flagged whole-file declaration regex with non-regex string parsing. */
function parseDeclaration(chunk: string): CssDeclaration | undefined {
  for (let dash = chunk.indexOf('--'); dash !== -1; dash = chunk.indexOf('--', dash + 1)) {
    const declaration = parseDeclarationAt(chunk.slice(dash + 2));
    if (declaration !== undefined) {
      return declaration;
    }
  }
  return undefined;
}

/** Parse `--name: value;` custom properties into a name-to-value map (last write wins). */
export function parseCssVars(filePath: string): Map<string, string> {
  const text = readFileSync(filePath, 'utf8');
  const vars = new Map<string, string>();
  const chunks = text.split(';');
  // The final chunk has no terminating ';', so it can never hold a complete declaration.
  chunks.pop();
  for (const chunk of chunks) {
    const declaration = parseDeclaration(chunk);
    if (declaration !== undefined) {
      vars.set(declaration.name, declaration.value);
    }
  }
  return vars;
}

/** Convert a `<number>rem` token to px (multiplied by 16, rounded); other tokens pass through. */
function remTokenToPx(token: string): string {
  if (!token.endsWith('rem')) {
    return token;
  }
  const n = Number.parseFloat(token.slice(0, -3));
  if (Number.isNaN(n)) {
    return token;
  }
  return `${Math.round(n * 16)}px`;
}

/** Normalise a shadow/length string to px: rem tokens scaled by 16, spaces collapsed. */
export function toPx(value: string): string {
  return value
    .trim()
    .split(/\s+/)
    .map((token) => remTokenToPx(token))
    .join(' ');
}

/** Numeric magnitude of a bare-number or `px`-suffixed token. */
export function numOf(value: string): number {
  return Number.parseFloat(value.endsWith('px') ? value.slice(0, -2) : value);
}
