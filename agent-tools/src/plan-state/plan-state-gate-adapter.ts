import { err, ok, type Result } from '@oaknational/result';
import { z } from 'zod';
import { parse as parseYaml } from 'yaml';

import { parseWithSchema } from '../core/schema-parse.js';
import { proofSchema, type ClaimRow } from './plan-state-model.js';

/**
 * The PERMANENT gate adapter (F5): plan-file frontmatter in, engine claim
 * rows out — pure (the runner does IO). Rows are keyed
 * `<planPath>#<todoId>`.
 *
 * Boundary strictness is deliberately split (V0 §2.5): the plan ROOT and
 * todo-item KEY SETS are read loose — the live estate carries domain
 * extension keys the V0 contract ignores, and a strict read would refuse
 * it — while every consumed field is strictly typed and the PROOF union is
 * strict (see `todoItemSchema`). `status` is captured VERBATIM
 * as a string claim: the status vocabulary has exactly one owner (the
 * versioned mapping table, applied by the engine), so an emergent value
 * here surfaces as `unmapped-status` residue rather than a parse refusal.
 * V0 §2.4: `kind: strategic` plans forbid todos — a strategic plan with a
 * `todos` key is a refusal; a strategic plan without one contributes zero
 * rows (valid).
 *
 * @packageDocumentation
 */

const nonEmptyString = z.string().min(1);

/**
 * V0 todo item (V0.1 additive: optional `proof` + `spec_ref`). Consumed
 * fields are strictly typed and the proof union is STRICT, but unknown item
 * keys are tolerated: the live estate extends todos beyond the locked V0
 * triple (e.g. the controlling plan's own `depends_on` id-lists — found by
 * running this gate against it), and a state gate that refuses benign
 * extension keys cannot gate the corpus it exists for. Key-set conformance
 * belongs to the AUTHORING gate, not here. (Deliberate deviation from the
 * pre-execution review's strict-item letter — gateway re-judges.)
 */
const todoItemSchema = z.looseObject({
  id: nonEmptyString,
  content: z.string(),
  status: z.string(),
  proof: proofSchema.optional(),
  spec_ref: nonEmptyString.optional(),
});

/** The plan root, loose by contract: only the keys this adapter consumes. */
const planRootSchema = z.looseObject({
  kind: z.enum(['strategic', 'executable']).optional(),
  todos: z.array(todoItemSchema).optional(),
});

/** One plan file's identity and verbatim content (the runner supplies IO). */
export interface PlanFileInput {
  /** Repo-relative POSIX path — the row-key prefix. */
  readonly path: string;
  readonly content: string;
}

/** The verbatim YAML frontmatter block, or null when the file carries none. */
function frontmatterBlockOf(content: string): string | null {
  if (!content.startsWith('---\n')) {
    return null;
  }
  const close = content.indexOf('\n---\n', 4);
  if (close === -1) {
    return null;
  }
  return content.slice(4, close + 1);
}

/** Parse one frontmatter block's YAML at the library boundary (Result-translated). */
function parseYamlDocument(path: string, block: string): Result<unknown, Error> {
  try {
    return ok(parseYaml(block));
  } catch (error) {
    return err(
      new Error(
        `plan '${path}' carries unparseable frontmatter YAML: ` +
          `${error instanceof Error ? error.message : String(error)}`,
      ),
    );
  }
}

/**
 * Extract one plan file's claim rows. A file with no frontmatter, no
 * `todos` key, or an empty todo list contributes zero rows — valid; the
 * engine's vacuous class covers an entirely empty scan.
 */
export function extractGateClaims(input: PlanFileInput): Result<readonly ClaimRow[], Error> {
  const block = frontmatterBlockOf(input.content);
  if (block === null) {
    return ok([]);
  }
  const document = parseYamlDocument(input.path, block);
  if (!document.ok) {
    return document;
  }
  const root = parseWithSchema({
    label: `plan '${input.path}' frontmatter`,
    schema: planRootSchema,
    value: document.value,
  });
  if (!root.ok) {
    return root;
  }
  if (root.value.kind === 'strategic' && root.value.todos !== undefined) {
    return err(
      new Error(
        `plan '${input.path}' is kind: strategic but carries a todos key — ` +
          'V0 §2.4 forbids todos on strategic plans; refusing (nothing computed)',
      ),
    );
  }
  return ok(
    (root.value.todos ?? []).map((todo) => ({
      key: `${input.path}#${todo.id}`,
      recordedStatus: todo.status,
      proof: todo.proof ?? null,
    })),
  );
}

/** Extract and concatenate claim rows across plan files (first refusal wins). */
export function extractGateClaimsAll(
  inputs: readonly PlanFileInput[],
): Result<readonly ClaimRow[], Error> {
  const rows: ClaimRow[] = [];
  for (const input of inputs) {
    const extracted = extractGateClaims(input);
    if (!extracted.ok) {
      return extracted;
    }
    rows.push(...extracted.value);
  }
  return ok(rows);
}
