/**
 * Cast-free contrast-manifest parsing at the JSON import boundary.
 *
 * @remarks
 * ADR-213 §2 boundary condition: the contrast manifest is schema-validated
 * at the boundary, never cast. The schema is strict — unknown keys are
 * rejected — and the first violation is reported with a dot/index path
 * naming the offending node. Error messages are owned by this module (a
 * stable contract for callers and CI output), not by the underlying
 * schema library.
 *
 * @packageDocumentation
 */
import { type Result, err, ok } from '@oaknational/result';
import { z } from 'zod';
import { type ContrastManifest, FG_MID_CONTEXTS, PAIR_CONTEXTS } from './contrast-types.js';

/** Error returned when manifest JSON does not match the expected shape. */
export interface ManifestShapeError {
  /** Discriminant for error routing. */
  readonly kind: 'manifest_shape';
  /** Dot/index path to the offending node (empty string for the root). */
  readonly path: string;
  /** What the parser expected at that path. */
  readonly message: string;
}

const contrastPairSchema = z.strictObject({
  foreground: z.string(),
  background: z.string(),
  context: z.enum(PAIR_CONTEXTS),
});

const contrastTriadSchema = z.strictObject({
  foreground: z.string(),
  middle: z.string(),
  background: z.string(),
  contexts: z.strictObject({
    fgMid: z.enum(FG_MID_CONTEXTS),
    midBg: z.literal('non-text'),
    fgBg: z.enum(PAIR_CONTEXTS),
  }),
});

const contrastManifestSchema = z.strictObject({
  pairs: z.array(contrastPairSchema),
  triads: z.array(contrastTriadSchema),
});

type SchemaOutput = z.infer<typeof contrastManifestSchema>;

type Mutual<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;

/**
 * Compile-time drift anchor: the schema and the hand-authored
 * {@link ContrastManifest} must describe the same shape in both directions —
 * an enum narrowed or a key added on either side becomes a type error here.
 */
export const SCHEMA_MATCHES_MANIFEST: [
  Mutual<SchemaOutput['pairs'][number], ContrastManifest['pairs'][number]>,
  Mutual<SchemaOutput['triads'][number], ContrastManifest['triads'][number]>,
  Mutual<keyof SchemaOutput, keyof ContrastManifest>,
] = [true, true, true];

/** Render a zod issue path as the module's dot/index path convention. */
function formatIssuePath(segments: readonly PropertyKey[]): string {
  let path = '';

  for (const segment of segments) {
    if (typeof segment === 'number') {
      path += `[${String(segment)}]`;
    } else {
      path += path === '' ? String(segment) : `.${String(segment)}`;
    }
  }

  return path;
}

type ManifestIssue = z.ZodError['issues'][number];

/** Translate the first zod issue into the module's stable error contract. */
function toShapeError(issue: ManifestIssue): ManifestShapeError {
  const path = formatIssuePath(issue.path);

  if (issue.code === 'unrecognized_keys') {
    const [firstKey] = issue.keys;
    const keyPath = path === '' ? firstKey : `${path}.${firstKey}`;

    return { kind: 'manifest_shape', path: keyPath, message: 'unexpected key' };
  }

  if (issue.code === 'invalid_type') {
    const expected =
      issue.expected === 'array' || issue.expected === 'object'
        ? `an ${issue.expected}`
        : `a ${issue.expected}`;

    return { kind: 'manifest_shape', path, message: `expected ${expected}` };
  }

  if (issue.code === 'invalid_value') {
    const values = issue.values.map((value) => String(value));
    const message =
      values.length === 1 ? `expected ${values[0]}` : `expected one of ${values.join(' | ')}`;

    return { kind: 'manifest_shape', path, message };
  }

  return { kind: 'manifest_shape', path, message: issue.message };
}

/**
 * Parse unknown JSON into a {@link ContrastManifest} without casting.
 *
 * @param data - Parsed JSON of unknown shape (e.g. from a manifest file)
 * @returns Ok with the typed manifest, or Err naming the first shape violation
 */
export function parseContrastManifest(data: unknown): Result<ContrastManifest, ManifestShapeError> {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return err({ kind: 'manifest_shape', path: '', message: 'expected an object' });
  }

  const parsed = contrastManifestSchema.safeParse(data);

  if (!parsed.success) {
    return err(toShapeError(parsed.error.issues[0]));
  }

  return ok(parsed.data);
}
