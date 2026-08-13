/**
 * Derivation of the three closed client-category axes.
 *
 * @remarks Each axis answers a different question and none substitutes for
 * another: `OakClientFamily` names the vendor (handshake-only, so ADR-112's
 * per-request transport cannot carry it onto a later call), `OakClientSurface`
 * the form factor, and `OakClientProduct` the vendor product. All three are
 * derived here, inside the policy boundary, from a self-declaring client string
 * that never itself leaves the process — ADR-218 §3 excludes raw headers and
 * raw client strings from the event envelope.
 */

import type {
  OakClientFamily,
  OakClientProduct,
  OakClientSurface,
} from './event-policy-contract.js';

function asciiLower(value: string): string {
  return value.replaceAll(/[A-Z]/gu, (character) => character.toLowerCase());
}

function hasClientFamilyPrefix(value: string, prefix: 'chatgpt' | 'claude'): boolean {
  if (!value.startsWith(prefix)) {
    return false;
  }

  const boundary = value.at(prefix.length);
  return boundary === undefined || boundary === ' ' || boundary === '/' || boundary === '-';
}

export function normaliseOakClientFamily(value: unknown): OakClientFamily {
  if (typeof value !== 'string') {
    return 'other';
  }

  const normalised = asciiLower(value.trim());
  if (hasClientFamilyPrefix(normalised, 'chatgpt')) {
    return 'chatgpt';
  }
  if (hasClientFamilyPrefix(normalised, 'claude')) {
    return 'claude';
  }
  return 'other';
}

// Tokens must stay evidence-backed: self-declaring client strings, or values
// verified first-hand in live traffic. Unmatched traffic lands in 'other';
// the correction path is a token row plus its derivation-table test row.
const CLIENT_SURFACE_TOKEN_RULES: readonly (readonly [string, OakClientSurface])[] = [
  ['sdk', 'sdk'],
  ['vscode', 'vscode'],
  ['claude-code', 'cli'],
  ['mozilla', 'web'],
];

function isAsciiAlphanumeric(character: string | undefined): boolean {
  return character !== undefined && /[a-z0-9]/u.test(character);
}

function hasTokenSegment(value: string, token: string): boolean {
  let index = value.indexOf(token);
  while (index !== -1) {
    const before = index === 0 ? undefined : value.at(index - 1);
    const after = value.at(index + token.length);
    if (!isAsciiAlphanumeric(before) && !isAsciiAlphanumeric(after)) {
      return true;
    }
    index = value.indexOf(token, index + 1);
  }
  return false;
}

function readClientSurfaceToken(value: unknown): OakClientSurface | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const normalised = asciiLower(value);
  for (const [token, surface] of CLIENT_SURFACE_TOKEN_RULES) {
    if (hasTokenSegment(normalised, token)) {
      return surface;
    }
  }
  return undefined;
}

export function normaliseOakClientSurface(headerValues: readonly unknown[]): OakClientSurface {
  for (const value of headerValues) {
    const surface = readClientSurfaceToken(value);
    if (surface !== undefined) {
      return surface;
    }
  }
  return 'other';
}

export function isOakClientSurface(value: unknown): value is OakClientSurface {
  return (
    value === 'cli' || value === 'sdk' || value === 'vscode' || value === 'web' || value === 'other'
  );
}

// Product tokens must stay evidence-backed, and every row here was verified
// first-hand in Oak's own inbound traffic over the 7 days to 2026-08-13:
// `Claude-User` (10,045 requests), `claude-code/2.1.x (cli)` (~3,100) and
// `codex-mcp-client/0.14x (…)` (~230). The correction path for a new client is
// a token row plus its derivation-table test row — never a widening of the
// match rule, and never forwarding the raw header value (see OakClientProduct).
//
// The residual is deliberately unclaimed rather than guessed: `curl` (291),
// `node` (249), `python-httpx` (87), browser `Mozilla/*` (74), `Bun` (39) and
// `directory-admin-dashboard-inspection` (11) are Oak's own probes, smoke tests
// and the browser widget, not named MCP client products. They belong in
// 'other', which therefore means genuinely unidentifiable, not merely unread.
//
// Longest token, used to bound the compared prefix. Matching is anchored at
// index 0, so no more of the value can affect the outcome; slicing keeps the
// cost independent of an attacker-controlled header length.
const LONGEST_PRODUCT_TOKEN = 32;
const CLIENT_PRODUCT_TOKEN_RULES: readonly (readonly [string, OakClientProduct])[] = [
  ['claude-user', 'claude_ai'],
  ['claude-code', 'claude_code'],
  ['codex-mcp-client', 'codex'],
];

/**
 * Matches a product token only as the header's *leading* token.
 *
 * @remarks Deliberately stricter than {@link hasTokenSegment}, which the surface
 * axis uses. A User-Agent names its product first (`claude-code/2.1.226 (cli)`),
 * and a client-controlled string that merely *contains* a product name somewhere
 * is not that product self-declaring — it may be an unrelated client, or a
 * deliberate impersonation. Substring matching also makes the outcome depend on
 * rule order for a value carrying two product names; anchoring removes that
 * ambiguity, so the table's row order carries no meaning.
 *
 * The boundary set omits `-`, which {@link hasClientFamilyPrefix} allows: at
 * product granularity `claude-user` must not claim a hypothetical
 * `claude-user-agent/1.0`, whereas at family granularity `claude` legitimately
 * claims both. `/` and ` ` are the only real delimiters after a UA product token.
 */
function hasLeadingProductToken(value: string, token: string): boolean {
  if (!value.startsWith(token)) {
    return false;
  }

  const boundary = value.at(token.length);
  return boundary === undefined || boundary === ' ' || boundary === '/';
}

function readClientProductToken(value: string): OakClientProduct | undefined {
  // `asciiLower` folds only [A-Z], so it is length-preserving and the index
  // arithmetic below cannot be shifted by a case-expanding character. Slicing to
  // the longest token is behaviour-preserving under leading-token anchoring.
  const normalised = asciiLower(value.trim().slice(0, LONGEST_PRODUCT_TOKEN + 1));
  for (const [token, product] of CLIENT_PRODUCT_TOKEN_RULES) {
    if (hasLeadingProductToken(normalised, token)) {
      return product;
    }
  }
  return undefined;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== '';
}

/**
 * Projects the ordered client-identity header values onto the closed product
 * category. The first header value that names a known product wins; a value that
 * names none does not participate, so an unrecognised vendor header falls through
 * to the User-Agent rather than forcing a verdict.
 *
 * @remarks The two negative outcomes are deliberately DISTINCT values, because
 * they mean opposite things operationally and MCP-594 is the story of what
 * happens when they are conflated:
 *
 * - `other` — a client string was present and named no product we recognise.
 *   Expected, and its share is a measurement (Oak's own probes and the browser
 *   widget live here).
 * - `unavailable` — no client string reached this derivation at all, so it never
 *   ran. That is a defect signal, not a measurement: it means the transport
 *   stopped supplying request headers (an SDK release that no longer populates
 *   `requestInfo`, or a move to a Fetch-native adapter whose `Headers` instance
 *   this reader cannot see). Collapsing it into `other` would make a total
 *   attribution regression look exactly like healthy traffic — the same
 *   false-green that made `harness = other` unreadable in the first place.
 *
 * A sudden `unavailable` share is therefore the alarm on this cure's own health.
 */
export function normaliseOakClientProduct(headerValues: readonly unknown[]): OakClientProduct {
  let sawClientString = false;
  for (const value of headerValues) {
    if (!isNonEmptyString(value)) {
      continue;
    }
    sawClientString = true;
    const product = readClientProductToken(value);
    if (product !== undefined) {
      return product;
    }
  }
  return sawClientString ? 'other' : 'unavailable';
}

export function isOakClientFamily(value: unknown): value is OakClientFamily {
  return value === 'chatgpt' || value === 'claude' || value === 'other';
}

export function isOakClientProduct(value: unknown): value is OakClientProduct {
  return (
    value === 'claude_ai' ||
    value === 'claude_code' ||
    value === 'codex' ||
    value === 'other' ||
    value === 'unavailable'
  );
}
