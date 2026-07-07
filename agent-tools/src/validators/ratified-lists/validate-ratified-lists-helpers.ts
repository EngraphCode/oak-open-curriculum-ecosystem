import { err, ok, type Result } from '@oaknational/result';

/**
 * Pure logic of `validate-ratified-lists`: extract a backtick-token list
 * paragraph from a packet section and compare it against the versioned
 * in-script constant. The entry does the IO; drift reporting is data.
 *
 * @packageDocumentation
 */

const BACKTICK_TOKEN_PATTERN = /^`[^`]+`$/;
const SECTION_HEADING_PATTERN = /^#{2,3} /;

/**
 * True when the line is a comma-separated run of backtick tokens. Split
 * plus a per-part anchored match keeps the check linear — a single
 * repeated-group regex over the whole line is the exponential-backtracking
 * shape CodeQL/Sonar flag (S5852).
 */
function isListLine(line: string): boolean {
  const body = line.trim().replace(/,$/, '');
  if (body === '') {
    return false;
  }
  return body.split(',').every((part) => BACKTICK_TOKEN_PATTERN.test(part.trim()));
}

/**
 * The first paragraph under `headingPrefix` whose every line is a
 * comma-separated run of backtick tokens, returned as the tokens in order.
 * A missing section or a section with no such paragraph refuses.
 */
export function extractBacktickListParagraph(
  markdown: string,
  headingPrefix: string,
): Result<readonly string[], Error> {
  const lines = markdown.split('\n');
  const start = lines.findIndex((line) => line.startsWith(headingPrefix));
  if (start === -1) {
    return err(new Error(`packet section '${headingPrefix}' not found`));
  }
  const collected: string[] = [];
  for (let index = start + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (SECTION_HEADING_PATTERN.test(line) && collected.length === 0) {
      break;
    }
    if (isListLine(line)) {
      collected.push(line);
      continue;
    }
    if (collected.length > 0) {
      break;
    }
  }
  if (collected.length === 0) {
    return err(new Error(`no backtick list paragraph under '${headingPrefix}'`));
  }
  const tokens = [...collected.join(' ').matchAll(/`([^`]+)`/g)].map((match) => match[1]);
  return ok(tokens);
}

/**
 * Compare the packet's ratified list against the in-script constant, exact
 * content in exact order. Returns drift lines (empty means in sync).
 */
export function compareRatifiedList(input: {
  readonly label: string;
  readonly packet: readonly string[];
  readonly code: readonly string[];
}): readonly string[] {
  const inSync =
    input.packet.length === input.code.length &&
    input.packet.every((token, index) => token === input.code[index]);
  if (inSync) {
    return [];
  }
  return [
    `${input.label}: the packet list and the in-script list differ`,
    `  packet (${String(input.packet.length)}): ${input.packet.join(', ')}`,
    `  code   (${String(input.code.length)}): ${input.code.join(', ')}`,
  ];
}
