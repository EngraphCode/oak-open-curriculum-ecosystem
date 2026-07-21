/**
 * Zod transcription of the V0 `plan` node-schema frontmatter contract.
 *
 * @remarks
 * Transcribes `.agent/plans/plan-node-schema.v0.md` §2 (frontmatter
 * contract) and §3 (orthogonal state axes) for the release-planning
 * corpus validator. Design bindings, all from the owner-signed spec:
 *
 * - Closed enums for `kind`, `disposition`, todo `status`, and
 *   `depends_on[].kind`; additive V0.1 fields stay optional.
 * - Unknown keys are tolerated (§2.5: "A plan MAY carry domain extension
 *   keys outside this contract; the validator ignores them in V0") —
 *   EXCEPT the explicitly dropped emergent keys, which are refused so
 *   the old `status:`-style drift cannot re-enter the corpus.
 * - Execution status is deliberately NOT a field (§3.2 — Linear-owned,
 *   projected); a frontmatter `status:` key is therefore in the dropped
 *   set, not the contract.
 * - One documented tolerance beyond §2.4's todo shape: a todo MAY carry
 *   `depends_on` (intra-plan todo ordering, ids resolved within the same
 *   plan). The founding corpus uses it and it invents no cross-plan edge.
 *
 * @packageDocumentation
 */

import { z } from 'zod';

/** Stable kebab-case slug (V0 §2.1 `id`; also todo ids and thread slugs). */
const KEBAB_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** ISO calendar date, the only date form the contract admits (§2.4). */
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** V0 §2.5: emergent keys the contract explicitly drops — refused, never ignored. */
const DROPPED_KEYS = [
  'status',
  'lifecycle',
  'isProject',
  'type',
  'collection',
  'lane',
  'foundational_adr',
  'foundation_alignment',
] as const;

const kebabSlug = z.string().regex(KEBAB_SLUG, 'expected a kebab-case slug');
const isoDate = z.string().regex(ISO_DATE, 'expected an ISO date (YYYY-MM-DD)');
const nonEmpty = z.string().min(1);

/**
 * §2.4 todo item, plus the documented intra-plan `depends_on` tolerance
 * and the V0.1 additive fields (`proof`, `spec_ref`). Key-set strict —
 * this IS the authoring gate the plan-state adapter defers key
 * conformance to — but `proof`'s internal union is validated by that
 * adapter (one owner per concern), so here it is presence-only.
 */
const todoSchema = z
  .object({
    id: kebabSlug,
    content: nonEmpty,
    status: z.enum(['pending', 'completed']),
    depends_on: z.array(kebabSlug).optional(),
    proof: z.unknown().optional(),
    spec_ref: nonEmpty.optional(),
  })
  .strict();

/** §3.4 gate — an expiring block, never an open holding state. */
const gateSchema = z
  .object({
    awaiting: nonEmpty,
    clears_when: nonEmpty,
    expires: isoDate,
  })
  .strict();

/** §2.3 `depends_on` edge entry. */
const dependsOnSchema = z
  .object({
    plan: nonEmpty,
    kind: z.enum(['blocking', 'beneficial']),
  })
  .strict();

/** Accepts a single ref or a list of refs (V0 §2.3 "plan ref(s)"). */
const refOrRefs = z.union([nonEmpty, z.array(nonEmpty).min(1)]);

/** The field contract before cross-field refinement. */
const basePlanNodeSchema = z.looseObject({
  id: kebabSlug,
  node_type: z.literal('plan'),
  name: nonEmpty,
  overview: nonEmpty,
  kind: z.enum(['strategic', 'executable']),
  disposition: z.enum(['done', 'superseded', 'extracted-and-archived', 'cancelled']).optional(),
  gate: gateSchema.optional(),
  serves_strategic_choice: nonEmpty.optional(),
  derives_from: z.array(nonEmpty).optional(),
  supersedes: refOrRefs.optional(),
  superseded_by: refOrRefs.optional(),
  depends_on: z.array(dependsOnSchema).optional(),
  thread: kebabSlug.optional(),
  projects_to: nonEmpty.optional(),
  todos: z.array(todoSchema).min(1).optional(),
  promotion_trigger: nonEmpty.optional(),
  last_updated: isoDate,
  related: z.array(nonEmpty).optional(),
});

/** The parsed base shape the cross-field refinements operate on. */
type BasePlanNode = z.output<typeof basePlanNodeSchema>;

/** Refuse the V0 §2.5 dropped emergent keys (extension keys otherwise pass). */
function refuseDroppedKeys(value: BasePlanNode, ctx: z.RefinementCtx): void {
  for (const dropped of DROPPED_KEYS) {
    if (dropped in value) {
      ctx.addIssue({
        code: 'custom',
        path: [dropped],
        message: `dropped emergent key (V0 §2.5): '${dropped}' must not appear in frontmatter`,
      });
    }
  }
}

/** The §2.4 requirement matrix per kind: [field, mustBePresent, message]. */
const KIND_RULES: Record<
  BasePlanNode['kind'],
  readonly [
    field: 'todos' | 'serves_strategic_choice' | 'promotion_trigger',
    present: boolean,
    message: string,
  ][]
> = {
  executable: [
    ['todos', true, 'executable plans require todos (V0 §2.4)'],
    [
      'serves_strategic_choice',
      true,
      "executable plans require serves_strategic_choice (an ID or 'pending', V0 §2.3)",
    ],
    ['promotion_trigger', false, 'promotion_trigger is forbidden on executable plans (V0 §2.4)'],
  ],
  strategic: [
    ['promotion_trigger', true, 'strategic plans require promotion_trigger (V0 §2.4)'],
    ['todos', false, 'todos are forbidden on strategic plans (V0 §2.4)'],
  ],
};

/** §2.4 kind dispatch plus the §3.3 superseded coupling. */
function refineKindDispatch(value: BasePlanNode, ctx: z.RefinementCtx): void {
  for (const [field, mustBePresent, message] of KIND_RULES[value.kind]) {
    const present = value[field] !== undefined;
    if (present !== mustBePresent) {
      ctx.addIssue({ code: 'custom', path: [field], message });
    }
  }
  if (value.disposition === 'superseded' && value.superseded_by === undefined) {
    ctx.addIssue({
      code: 'custom',
      path: ['superseded_by'],
      message: "disposition 'superseded' requires a superseded_by edge (V0 §3.3)",
    });
  }
}

/** Intra-plan todo `depends_on` ids must name todo ids in the same plan. */
function refineTodoDependencies(value: BasePlanNode, ctx: z.RefinementCtx): void {
  const todos = value.todos ?? [];
  const ids = new Set(todos.map((todo) => todo.id));
  todos.forEach((todo, index) => {
    for (const dep of todo.depends_on ?? []) {
      if (!ids.has(dep)) {
        ctx.addIssue({
          code: 'custom',
          path: ['todos', index, 'depends_on'],
          message: `todo depends_on '${dep}' does not name a todo id in this plan`,
        });
      }
    }
  });
}

/**
 * The V0 `plan` node frontmatter contract: the base field contract plus
 * the cross-field rules (dropped-key refusal, kind dispatch, superseded
 * coupling, intra-plan todo-dependency resolution).
 */
export const planNodeSchema = basePlanNodeSchema.superRefine((value, ctx) => {
  refuseDroppedKeys(value, ctx);
  refineKindDispatch(value, ctx);
  refineTodoDependencies(value, ctx);
});

/** The parsed, validated V0 plan-node frontmatter. */
export type PlanNode = z.infer<typeof planNodeSchema>;
