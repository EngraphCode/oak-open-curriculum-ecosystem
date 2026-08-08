/*
 * The wow-verdict register: every owner verdict on a rendered page, and the
 * design-review instrument's three-leg results beside it, so the
 * instrument's miss-rate against the owner's actual verdicts is measurable
 * (completion plan W0.7 — blocking authority is earned). Named distinctly
 * from the hub's fidelity register, whose module
 * (demos/oak-curriculum-hub/tools/fidelity-register.ts) is this schema's
 * precedent: zod at the boundary, owner-editable JSON data in
 * wow-verdict-register.json, a result out, never a throw.
 *
 * Row classes: `checkpoint` rows (W1.3, W1.5, W2.9, the Quality-bar
 * checkpoints) REQUIRE the instrument-leg results; `pre-read` rows (the
 * W0.9/W0.10 pre-reads, which run before the instrument exists) carry them
 * optionally. The refine below enforces the split.
 */
import { z } from 'zod';

/** Local result shape mirroring the hub precedent's contract (Result out,
 *  never a throw) WITHOUT the monorepo dependency: the kit is the neutral
 *  trunk (ADR-213 §4) and imports nothing from the monorepo — the
 *  design-boundary lint enforces it, including here. */
export type ParseResult<T> = { ok: true; value: T } | { ok: false; error: string };

const ok = <T>(value: T): ParseResult<T> => ({ ok: true, value });
const err = <T>(error: string): ParseResult<T> => ({ ok: false, error });

const VerdictSchema = z.enum(['PASS', 'FAIL', 'ITERATE']);

const LegResultSchema = z.object({
  verdict: VerdictSchema,
  notes: z.string().min(1).optional(),
});

const InstrumentLegResultsSchema = z.object({
  seat: LegResultSchema,
  accessibilityExpert: LegResultSchema,
  designSystemExpert: LegResultSchema,
});

/** identity/theme stay open strings at v0: the identity roster is live
 *  (PDS renaming; W0.10 mints counter-identity anchors) and a wrong closed
 *  enum would reject true rows. Tightening to the settled rosters is a
 *  recorded follow-on once W0.10 lands. */
const CellSchema = z.object({
  identity: z.string().min(1),
  theme: z.string().min(1),
});

const RowClassSchema = z.enum(['checkpoint', 'pre-read']);

const RegisterRowSchema = z
  .object({
    page: z.string().min(1),
    demo: z.string().min(1),
    verdict: VerdictSchema,
    qualitiesJudged: z.array(z.string().min(1)).min(1),
    cellsCovered: z.array(CellSchema).min(1),
    ownerStatementDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    rowClass: RowClassSchema,
    instrumentLegResults: InstrumentLegResultsSchema.optional(),
    /** Provenance pointer: the record and event the owner's words live in. */
    source: z.string().min(1),
  })
  .refine((row) => row.rowClass !== 'checkpoint' || row.instrumentLegResults !== undefined, {
    message:
      'checkpoint-class rows require instrumentLegResults (plan W0.7: required at checkpoint-class rows)',
  });

const RegisterSchema = z.object({
  version: z.literal(1),
  entries: z.array(RegisterRowSchema),
});

export type RegisterRow = z.infer<typeof RegisterRowSchema>;
export type WowVerdictRegister = z.infer<typeof RegisterSchema>;

function describeThrown(thrown: unknown): string {
  return thrown instanceof Error ? thrown.message : String(thrown);
}

/** Parse the raw register JSON at the boundary. Failure carries a readable
 *  line naming the register so a consumer's stderr is actionable. */
export function parseWowVerdictRegister(json: string): ParseResult<WowVerdictRegister> {
  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch (error: unknown) {
    return err(`wow-verdict-register: invalid JSON — ${describeThrown(error)}`);
  }
  const parsed = RegisterSchema.safeParse(raw);
  if (!parsed.success) {
    return err(`wow-verdict-register: schema violation — ${parsed.error.message}`);
  }
  return ok(parsed.data);
}

/** The register rows recorded against one demo. */
export function rowsForDemo(register: WowVerdictRegister, demo: string): readonly RegisterRow[] {
  return register.entries.filter((row) => row.demo === demo);
}
