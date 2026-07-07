/**
 * The three overlapping extraction nets of `refound-inventory` (F1 §4) as
 * pure functions over decoded line text. The artefact shapes they feed live
 * in `refound-inventory-model.ts`.
 *
 * @remarks
 * Each net is deterministic code; the union of the nets is the anchor set
 * the residue audit clusters on. Captures are verbatim: no trimming, no
 * case-folding of the CAPTURE, no dedup of "near" duplicates (D7 —
 * case-insensitivity applies to the Net-C MATCH only).
 *
 * - **Net A — structure.** Headings (one to six `#` then whitespace), a
 *   LEADING YAML frontmatter fence pair inclusive of both `---` fences
 *   (only when line 1 opens one and a closing fence exists), and code-fence
 *   lines (optional indent then three backticks).
 * - **Net B — rows.** List items, checkbox todos, table rows, and
 *   definition-style key lines.
 * - **Net C — fixed keyword list.** Case-insensitive MATCH over
 *   {@link NET_C_KEYWORDS_V1}; the captured line stays byte-verbatim.
 *
 * **Fence blackout.** Fenced code content captures NOTHING (any net): F1 §4
 * says fences delimit content the other nets must not misparse, and the §9
 * residue definition ("fenced content clusters to its opening-fence anchor")
 * only holds mechanically when no fenced-content line can be an anchor. The
 * fence delimiter lines themselves are Net A structure. Frontmatter lines
 * are NOT blacked out: they are Net A structure AND stay eligible for Nets
 * B/C — the nets deliberately overlap, and overlap is redundancy.
 *
 * The keyword list is placed judgement, authored once and ratified at G1
 * with the freeze rule (G1 packet §2); it is a versioned constant here and
 * changes only by amendment + re-ratification + discrimination-proof
 * re-run.
 *
 * @packageDocumentation
 */

/**
 * The Net-C keyword list, v1 — the G1 packet §2 list verbatim, in packet
 * order. Case-insensitive MATCH, verbatim CAPTURE; frozen at G1.
 */
export const NET_C_KEYWORDS_V1 = [
  'status:',
  'todo',
  'next step',
  'pending',
  'blocked',
  'depends',
  'serves_',
  'supersede',
  'thread',
  'gate',
  'owner',
  'decision',
  'acceptance',
  'definition of done',
  'dod',
  'follow-up',
  'deferred',
  'promotion trigger',
] as const;

/** A net identifier; the per-net sets feed the omission detector (F1 §4). */
export type NetId = 'A' | 'B' | 'C';

const HEADING_PATTERN = /^#{1,6}\s/;
const CODE_FENCE_PATTERN = /^\s*```/;
const FRONTMATTER_FENCE_PATTERN = /^---\s*$/;
const LIST_ITEM_PATTERNS = [/^\s*[-*+]\s/, /^\s*\d+[.)]\s/];
const CHECKBOX_PATTERN = /^\s*[-*+]\s\[[ xX~-]\]/;
const TABLE_ROW_PATTERN = /^\s*\|/;
const DEFINITION_KEY_PATTERN = /^\s*[A-Za-z_-]+:\s/;

/**
 * True when one decoded line is a heading (one to six `#` then whitespace).
 * Exported for the plant-target selector: a frontmatter fence is also a
 * Net-A line-1 anchor, but only a HEADING first line keeps the F1 §9 plant
 * proofs sharp (`refound-plant-orphan-model.ts`).
 */
export function isHeadingLine(text: string): boolean {
  return HEADING_PATTERN.test(text);
}

/**
 * Match a fixed keyword list against one line, case-insensitively, returning
 * the matched keywords in list order. The line itself is untouched —
 * case-folding here is match mechanics, never capture normalisation (D7).
 */
export function matchKeywordsInsensitive<K extends string>(
  text: string,
  keywords: readonly K[],
): readonly K[] {
  const folded = text.toLowerCase();
  return keywords.filter((keyword) => folded.includes(keyword));
}

/**
 * The 1-based inclusive end line of a LEADING YAML frontmatter block, or 0
 * when the file has none. Frontmatter exists only when line 1 is a `---`
 * fence AND a closing `---` fence follows; an unclosed leading `---` is a
 * thematic break, not frontmatter.
 */
function frontmatterEndLine(lineTexts: readonly string[]): number {
  const firstLine = lineTexts[0];
  if (firstLine === undefined || !FRONTMATTER_FENCE_PATTERN.test(firstLine)) {
    return 0;
  }
  for (let index = 1; index < lineTexts.length; index += 1) {
    if (FRONTMATTER_FENCE_PATTERN.test(lineTexts[index] ?? '')) {
      return index + 1;
    }
  }
  return 0;
}

/** True when the line is a Net-B row (list, checkbox, table, definition key). */
function isRowLine(text: string): boolean {
  return (
    LIST_ITEM_PATTERNS.some((pattern) => pattern.test(text)) ||
    CHECKBOX_PATTERN.test(text) ||
    TABLE_ROW_PATTERN.test(text) ||
    DEFINITION_KEY_PATTERN.test(text)
  );
}

/** Evaluate the three nets over one non-fenced line, in A/B/C order. */
function netsForLine(text: string, inFrontmatter: boolean): NetId[] {
  const nets: NetId[] = [];
  if (inFrontmatter || HEADING_PATTERN.test(text)) {
    nets.push('A');
  }
  if (isRowLine(text)) {
    nets.push('B');
  }
  if (matchKeywordsInsensitive(text, NET_C_KEYWORDS_V1).length > 0) {
    nets.push('C');
  }
  return nets;
}

/** One captured line: its 1-based number and the nets that saw it, sorted. */
export interface LineNets {
  readonly line: number;
  readonly nets: readonly NetId[];
}

/**
 * One line the fence blackout lets a scanner see: fenced code content is
 * absent by construction, fence delimiters are surfaced flagged (they are
 * Net-A structure, never keyword-scannable content), and frontmatter lines
 * are surfaced as scannable (they carry `status:` fields and stay eligible
 * for keyword nets — see the module remarks).
 */
export interface ScannableLine {
  readonly line: number;
  readonly text: string;
  readonly inFrontmatter: boolean;
  readonly isFenceDelimiter: boolean;
}

/**
 * The ONE fence-blackout walk every line-scanner shares (the inventory nets
 * and the claim census apply different predicates over the same blackout
 * semantics — consolidated at the second consumer): leading frontmatter is
 * scannable, fence delimiters toggle the blackout and surface flagged, and
 * fenced content lines are omitted entirely.
 */
export function listScannableLines(lineTexts: readonly string[]): readonly ScannableLine[] {
  const frontmatterEnd = frontmatterEndLine(lineTexts);
  const scannable: ScannableLine[] = [];
  let inCodeFence = false;
  for (let index = 0; index < lineTexts.length; index += 1) {
    const line = index + 1;
    const text = lineTexts[index] ?? '';
    const inFrontmatter = line <= frontmatterEnd;
    if (!inFrontmatter && CODE_FENCE_PATTERN.test(text)) {
      // Fence delimiters are Net A structure; the state toggles on the line.
      inCodeFence = !inCodeFence;
      scannable.push({ line, text, inFrontmatter, isFenceDelimiter: true });
      continue;
    }
    if (!inFrontmatter && inCodeFence) {
      continue; // Fenced content is blacked out for every net (see remarks).
    }
    scannable.push({ line, text, inFrontmatter, isFenceDelimiter: false });
  }
  return scannable;
}

/**
 * Run all three nets over one file's decoded line texts, returning only the
 * captured lines (the file's anchors) with their per-net attribution.
 */
export function scanFileLines(lineTexts: readonly string[]): readonly LineNets[] {
  const captures: LineNets[] = [];
  for (const scannable of listScannableLines(lineTexts)) {
    if (scannable.isFenceDelimiter) {
      captures.push({ line: scannable.line, nets: ['A'] });
      continue;
    }
    const nets = netsForLine(scannable.text, scannable.inFrontmatter);
    if (nets.length > 0) {
      captures.push({ line: scannable.line, nets });
    }
  }
  return captures;
}
