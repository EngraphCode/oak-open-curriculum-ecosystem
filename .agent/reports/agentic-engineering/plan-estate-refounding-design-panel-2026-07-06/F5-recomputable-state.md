# F5 — Recomputable state

Facet design for the Oak plan-corpus refounding protocol (six-facet panel,
brief `tmp/refounding-designs/brief.md`). This facet owns: the plan-state
recomputation tool (whether it is built FIRST, and its build shape), the
proof-typed todo extension to V0, the six-kind proof taxonomy mapped to oak
probes, the versioned status-mapping table, the attested-count quality
signal, and the team-state join. Everything else is an interface.

Grounding read first-hand this session: the resonance synthesis + kit
(`.agent/practice-core/incoming/resonance-plan-estate-refounding-synthesis-2026-07-06.md`),
the ARC channel invariants I1–I12 and Q1–Q5 answers
(`.agent/collaboration/rapid-comms/wildfire-herds-sulphur-and-kiln-tracks-basalt.md`),
oak's durable doctrine copy §2/§4
(`.agent/reference/resonance-practice-knowledge.md`), the V0 schema
(`.agent/plans/product-development-governance/plan-node-schema.v0.md`), the
regenerate-and-compare precedent
(`agent-tools/src/validators/patterns-index/validate-patterns-index.ts`), the
`repo-validators:check` chain (root `package.json`), and the live claims
registry shape (`.agent/state/collaboration/active-claims.json`,
`schema_version` 1.3.0).

---

## 1. Decisions

Each decision carries its warrant and a falsifier. D1 is the facet's spine.

### D1 — Build the plan-state recomputation tool FIRST, as one engine with two adapters

**Decision.** The refounding's first executable workstream (before any
freeze-audit batch runs) builds `agent-tools/src/plan-state/`: a
deterministic recompute **engine** (typed claims in → probed verdicts out,
two divergence directions, mutation-probed) behind two thin adapters:

- **gate adapter** (permanent): reads V0.1 proof-typed frontmatter from
  `.agent/plans/**` and recomputes every todo's state — this is the standing
  gate the refounded corpus is born under;
- **audit adapter** (disposable, retired with the old estate): reads the
  frozen old-estate inventory (F1's scripted extraction output) plus the
  versioned status-mapping table (§4) and feeds the same engine — this makes
  the r2-equivalent two-verdict audit a *recomputation*, not a bespoke
  manual pass.

**Warrant.** Kit item 9 names tool-first "the single largest structural
saving available to a second runner": the state audit becomes a
recomputation, the ratification walk consumes tool output, and the estate is
born gated instead of born audited. The claim survives serious evaluation at
oak scale, with one correction. The objection is real: the old estate is not
V0-shaped (~30 emergent `status:` values, two vocabularies, todos without
proofs), so a tool built only against V0.1 frontmatter cannot audit it, and
a tool built only against the old chaos is waste the refounding retires.
The engine/adapter split dissolves the objection instead of picking a side:
the expensive, permanent parts (probe executors for the six proof kinds, the
two-direction comparator, the verdict schema, the mutation-probe harness)
are shared and survive; only the audit adapter is disposable, and it is thin
(mapping-table application is O(n) string lookup over F1's inventory).
Second warrant, independent of resonance: at 618 files / ~750 census todos,
a hand-run or LLM-run two-verdict audit is exactly the deterministic work
PDR-122 and ARC I1/I3 say must be scripted — "at 618 files this is not an
optimisation, it is feasibility" (Kiln Q1.1). Third: oak already has the
pattern — `validate-patterns-index.ts` derives truth from files and compares
against the committed record; this tool is the same regenerate-and-compare
shape with probes instead of rendering.

**Falsifier.** If a timeboxed build (one implementer session, ~1 day wall)
cannot produce an engine that goes green on a 10-plan fixture estate AND
goes red on every mutation in the mutation set (§3.5), fall back to F1-style
one-off audit scripts for the refounding and defer the permanent tool to a
post-refounding lane — recording the kit-item-9 saving as forfeited, with
this decision as the tombstone-free record of why.

### D2 — Proof-typed todos land as an additive V0.1 extension, owner-gated

**Decision.** Extend the V0 todo shape additively:
`{ id, content, status }` → `{ id, content, status, proof?, spec_ref? }`.
`proof` is a discriminated union over the closed six-kind taxonomy (§3.2).
`spec_ref` is the frozen-spec binding clause (kit item 2) as a field: a
stable anchor into the frozen original that remains the authoritative detail
contract. Both fields are **optional in the schema** (existing V0 plans stay
valid — strictly additive) and **required by protocol rule for every todo
authored into the refounded corpus** (the authoring gate, not the schema,
enforces presence there). This requires owner re-ratification: V0 tags
`todos` LOCKED, and the documented change path for LOCKED is owner
re-ratification (V0 §0 exposure table). Owner gate OG-1 (§8) carries the
sign-off packet.

**Warrant.** Recorded state is a cache, never the truth
(`resonance-practice-knowledge.md` §2 — the decisive rejected alternative:
the drifted surfaces *had been handoff-updated* and drifted anyway, so
discipline is demonstrably insufficient and recomputation is the cure; oak's
own memory-drain finding one layer down). Without a proof field the gate
adapter has nothing to recompute and the refounded corpus is born exactly as
auditable-by-prose as the old one. `spec_ref` at authoring is the
33-weakens cure applied from draft one (kit item 2; Kiln Q1.3 — it also
narrows every F3 challenge brief from "is all detail conserved" to "does the
named home + binding clause reach this content"). Optionality preserves
additivity (no big-bang migration of existing V0 plans); the
required-at-authoring protocol rule prevents the option from becoming a
loophole in the new corpus.

**Falsifier.** If the owner declines OG-1, the refounding still runs: proofs
live only as a column in F1's conservation ledger, the audit adapter still
probes the old estate, but the gate adapter is not wired and the corpus is
born un-gated. That outcome forfeits the kit-item-9 saving for all future
state audits — the sign-off packet quantifies this so the decision is made
with the cost visible.

### D3 — Adopt the six-kind proof taxonomy closed, with oak-registry-backed `gate` and `probe`

**Decision.** The `proof.kind` enum is exactly
`artifact | gate | probe | git-fact | ratified | attested` (code literals
keep the delivered US spelling; prose uses "artefact"). No oak-specific
seventh kind. `gate` and `probe` do not carry free-text shell: they name
entries in two small committed registries (§3.3), per oak's governing
invariant "every organising axis needs a registry + validation (no free-text
axes)" (ADR-200, restated in the brief) and strict-validation-at-boundary.

**Warrant.** The taxonomy is closed and already ratified doctrine in oak's
durable copy (§2 table); a closed enum is what makes the forcing function
bite — a criterion that resists proof-typing is thereby exposed as
under-specified: sharpen it or mark it `attested`; silence is forbidden.
Registry-backing for executable kinds is oak doctrine (no free-text axes)
plus the resonance worker lesson that a shell is a universal capability:
letting plan frontmatter smuggle arbitrary commands into a tool that CI runs
is an injection surface and an audit hole.

**Falsifier.** If pilot-area authoring (F6's pilot) leaves >50% of todos
`attested` after genuine sharpening effort, the taxonomy misfits oak's work
shapes; reopen the enum additively at an owner gate rather than squeezing.

### D4 — The status-mapping table is a versioned, owner-ratified TypeScript artefact; unmappable values are a named residue class

**Decision.** V0 §3.5's migration map is promoted from prose to a
machine-applied, versioned table (§4). Judgement is placed at the table,
once, owner-ratified; zero judgement per item (Kiln Q4 move 2). Any status
value the table does not map is classified `UNMAPPED` — a named residue
class routed to F3 adjudication with its `file:line` occurrences — never
squeezed into the nearest type.

**Warrant.** Kiln Q4 verbatim: "Make the vocabulary mapping a declared,
versioned TABLE … Unmappable values are a NAMED residue class routed to
adjudication — never squeezed into the nearest type." The collapse is
already specified in V0 §3.5 (owner-signed values), so v1 of the table is a
transcription plus completion, not new design — which de-risks the Q4
typing concern.

**Falsifier.** If applying table v1 to the full frozen inventory yields
>20% `UNMAPPED` status *instances*, the table was mis-derived from a
partial census; halt the batch run (I5 halt condition), author v2 from the
full residue list, owner-re-ratify, re-run. The table version is recorded
in every run output, so a v1→v2 re-run is provably a re-run.

### D5 — Attested-count is a reported signal, never a gate threshold

**Decision.** The tool reports `attested` counts per plan and corpus-wide
(`attested_ratio` in the run summary). Expectation stated up front: high on
first typing of a messy corpus; driven down in the destination estate by
sharpening criteria, never by silent conversion to a fake recomputable
kind. No gate, no CI threshold, no fitness score consumes it as a pass/fail
input. The owner ratification walk (F4) consumes it as a quality read-out.

**Warrant.** The Goodhart guard is explicit doctrine: proofs check landing,
reviews check worth; the recompute layer must never be asked to certify
quality (`resonance-practice-knowledge.md` §2). Kiln Q4 move 3 names the
attested count "the honest quality signal, driven down by sharpening … never
by silent conversion". Oak's knowledge-preservation-over-fitness rule says
the same thing one layer up: fitness routes work, never gates it.

**Falsifier.** If in practice the count is ever wired as a threshold and
authors respond by mis-typing proofs (an `artifact` pointing at a trivially
pre-existing file is the tell — detectable by sampling proofs whose target
predates the todo), the signal has been Goodharted; unwire it and record
the incident.

### D6 — Team-state join: report-only heuristics now, exact join later on a claims-schema addition

**Decision.** What lands **now** (inside the refounding): the tool emits a
machine-readable recomputed-state artefact, and a report-only join over the
claims registry as it exists today (schema 1.3.0: claims carry `thread` +
`areas` glob patterns, no todo pointer). Two heuristic signals, warn-only:
(a) a live claim whose `areas` patterns match a plan whose todos are all
recomputed-done → possible wasted seat; (b) a plan carrying an unexpired
`gate` or non-terminal work with zero overlapping live claim and recent
git activity on its area → possible orphaned lane. What lands **later**
(the team-tooling / OQ5 lane, per the integration map — NOT on the
refounding critical path): an additive claims-schema bump (1.4.0) adding an
optional `plan_todo` pointer to each claim, enabling the exact PDR-130
drift invariants — no open claim on a recomputed-done todo; no
`in_progress`-shaped todo without a live claim; lane progress as N-of-M
proofs green.

**Warrant.** PDR-130's join key is "every implementer claim carries a
plan-todo pointer at open" — oak's claim shape does not carry one today
(verified first-hand), and adding it touches the live collaboration
substrate (validators, claim-open flows, running sessions), which is
exactly the surface the refounding must not destabilise mid-arc
(live-lane coordination, brief seam 4). The refounding needs plan-side
recomputation only; team joins are a consumer of its output, not a
precondition. The heuristic signals cost one function over data the tool
already loads and answer oak's recorded F-44 freshness≠liveness defect in
warn form immediately.

**Falsifier.** If the heuristic signals fire mostly-false (>50% false
positives over the first two weeks of the coexistence window), silence them
and wait for the exact join rather than tuning heuristics — a noisy warning
is worse than none (no-warning-toleration cuts both ways).

---

## 2. The tool — placement, invocation, staging

- **Module**: `agent-tools/src/plan-state/` (engine, probe executors,
  adapters, registries, fixtures, tests). It follows the validator
  conventions (repo-root resolution, portability-fs, terminal-output) but
  gets its own module because it *executes* probes — a capability class
  above the read-and-compare validators in `agent-tools/src/validators/`.
- **Entry points** (pnpm scripts on `@oaknational/agent-tools`):
  - `plan-state:recompute` — gate adapter, cheap tier (see §3.4), JSON +
    human summary to stdout;
  - `plan-state:recompute -- --full` — includes the gate/slow tier, with a
    pre-run cost declaration (which registered gates will run, expected
    runtime class) before executing — the D5-doctrine pre-declaration
    applied locally;
  - `plan-state:audit -- --inventory <path> --mapping v1` — audit adapter
    over an F1 inventory artefact;
  - `plan-state:selftest` — runs the mutation-probe set (§3.5) and fails
    unless every planted mutation goes red.
- **Wiring**: added to the root `repo-validators:check` chain at **warn**
  (report, exit 0) for one stable window, then escalated to **enforce**
  (two-direction divergence fails the gate) — the same
  new-rules-start-at-warn staging the patterns-index validator records.
  Escalation is gated on a recorded deliberate-break transcript (I4): the
  gate is not accepted as enforcing until it has been shown to fail on a
  real falsified estate state, not only on fixtures.
- **Output artefact**: recomputed state is derived, so it is NOT committed
  as a living cache (recorded state is a cache — do not mint a second
  cache). It is committed only as frozen audit artefacts at F1's stable
  points (per-batch loss-check evidence), under the refounding run
  directory F1 owns.

## 3. Mechanism specification

### 3.1 Engine input schema

The engine is adapter-agnostic: both adapters emit `StateClaim[]`.

```ts
// agent-tools/src/plan-state/schema.ts — illustrative; binding form authored at build
import { z } from "zod";

const RepoRelPath = z.string().regex(/^(?!\/|[A-Za-z]:)[^\0]+$/); // repo-root-relative only

export const Proof = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("artifact"), path: RepoRelPath, anchor: z.string().optional() }),
  z.object({ kind: z.literal("gate"), gate: z.string() }),          // id in gate registry
  z.object({
    kind: z.literal("probe"),
    template: z.string(),                                            // id in probe registry
    params: z.record(z.string(), z.string()).default({}),
    survivors: z.array(z.string()).default([]),                      // closed sanctioned-survivor set
  }),
  z.object({
    kind: z.literal("git-fact"),
    fact: z.enum(["merged-to-main", "tag-exists", "pr-merged", "path-in-history"]),
    ref: z.string(),
  }),
  z.object({ kind: z.literal("ratified"), record: RepoRelPath, anchor: z.string().optional() }),
  z.object({
    kind: z.literal("attested"),
    by: z.string(),                                                  // agent/owner identity
    on: z.string(),                                                  // ISO date
    reason: z.string(),                                              // why non-recomputable
  }),
]);

export const StateClaim = z.object({
  source: RepoRelPath,             // the plan file (or frozen inventory line ref in audit mode)
  todo_id: z.string(),             // stable id — all citations by id, never line number (kit item 6)
  recorded: z.enum(["pending", "completed"]),
  proof: Proof.optional(),         // absent in audit mode when only status mapped; absent = attested-shaped
  spec_ref: z.string().optional(), // frozen-spec binding anchor (stable heading/id in the frozen copy)
});
```

The V0.1 frontmatter todo shape is the same `proof` / `spec_ref` pair
embedded in the existing todo object — the gate adapter is a parse, not a
transformation.

### 3.2 The six proof kinds mapped to oak recomputers (with concrete examples)

| Kind | Recomputes by | Oak-concrete examples | Cost tier |
| --- | --- | --- | --- |
| `artifact` | path exists (plus optional `anchor`: a named heading/`id` present in the file) | `path: docs/architecture/architectural-decisions/200-intent-as-a-living-idea-graph.md`; `path: agent-tools/src/plan-state/engine.ts`; `path: .agent/reference/resonance-practice-knowledge.md, anchor: "## 2."` | cheap (ms) |
| `gate` | the named registry gate's command exits 0 | `gate: repo-validators-check` (→ `pnpm repo-validators:check`); `gate: agent-tools-test` (→ `pnpm --filter @oaknational/agent-tools test`); `gate: markdownlint-root`; `gate: full-check` (→ `pnpm check`, runtime class `slow`, discouraged — prefer the narrowest green) | slow (`--full` only; deduped per run) |
| `probe` | registry template + params runs; ALL survivors must be in the declared `survivors` set — never "returns nothing" (kit item 4) | template `no-matches-outside-exceptions` with `params: { pattern: "status:", scope: ".agent/plans" }`, `survivors: [<the sanctioned files>]`; template `frontmatter-field-absent` (`isProject` gone from live plans) | cheap–medium |
| `git-fact` | querying git (local-first) or gh (network-backed, cached) | `merged-to-main` + commit ref via `git merge-base --is-ancestor`; `tag-exists` via `git rev-parse --verify refs/tags/<tag>`; `pr-merged` + PR number via `gh pr view --json state,mergedAt`; `path-in-history` via `git log --oneline -- <path>` non-empty | cheap; `pr-merged` network |
| `ratified` | the owner-decision **record** exists (record recomputes, never the decision) | `record: .agent/practice-core/decision-records/PDR-049-….md`; a design-record section by `anchor`; the OG-1 sign-off record itself | cheap |
| `attested` | not recomputable; visible, counted, never silent | "owner confirmed the lane taxonomy reads correctly, 2026-07-XX"; "external partner acknowledged receipt (no repo artefact)" | free; counted (D5) |

Probe-error discipline: a probe that cannot run (missing gate script,
network down for `pr-merged`, malformed params) yields `UNPROBEABLE`,
distinct from red — tool-rot must never masquerade as state divergence, and
vice versa. `UNPROBEABLE` warns during the warn stage and fails under
enforce (a proof that cannot recompute is a rotted proof — cure it or
re-type it).

### 3.3 The two registries

Committed TypeScript modules in `agent-tools/src/plan-state/registries/`
(source-is-typescript-esm; a registry in code gets type-checking, tests,
and review for free — no parallel YAML to drift):

- **Gate registry**: `{ id, command, workspace, runtime_class: "fast" | "slow" }`.
  Seeded from the existing `repo-validators:check` members plus the
  per-workspace test/build gates. Additive-only; removing an entry requires
  proving no live proof references it (the tool itself checks this —
  regenerate-and-compare over its own registry).
- **Probe registry**: `{ id, description, command_template, param_schema, verdict_rule }`
  where `verdict_rule` is one of `exit-zero`, `survivors-subset` (the
  closed-survivor rule), `stdout-equals`. Seeded minimally (3–5 templates);
  grown additively as authoring demands, each addition reviewed.

Instruction artefacts exclude themselves from their own probes by
construction (kit item 4): the registry executor always excludes the plan
file declaring the proof, the registries, and the tool's own source from
grep-class scopes.

### 3.4 The two-direction gate

Per `StateClaim`, the comparator produces one verdict:

| Recorded | Recomputed | Verdict | Warn stage | Enforce stage |
| --- | --- | --- | --- | --- |
| `completed` | green | `CONFIRMED_DONE` | pass | pass |
| `completed` | red | `DONE_BUT_RED` | warn | **fail** (regression / false completion) |
| `pending` | red | `CONFIRMED_PENDING` | pass | pass |
| `pending` | green | `PENDING_BUT_GREEN` | warn | **fail** (unclosed completion — the direction nobody guards) |
| any | `attested` | `ATTESTED` | pass, counted | pass, counted |
| any | error | `UNPROBEABLE` | warn | **fail** (proof rot) |

Resonance's measured asymmetry (7 pending-but-done, 0 done-but-pending)
predicts oak's audit-mode findings will concentrate in `PENDING_BUT_GREEN`;
the audit report groups by verdict so that prediction is itself checkable.
No auto-flip: `--fix` may flip `pending → completed` ONLY with the probe
transcript embedded in the change (mirroring `validate-patterns-index
--fix`: mechanical, evidenced, reviewable); `DONE_BUT_RED` is never
auto-fixed — it routes to F3 adjudication (it means either regression or a
false record, and telling those apart is judgement).

Run summary shape:

```json
{
  "tool_version": "0.1.0",
  "mode": "gate",
  "mapping_table_version": null,
  "run_at": "2026-07-06T00:00:00Z",
  "tiers_run": ["cheap"],
  "counts": {
    "claims": 750,
    "CONFIRMED_DONE": 0, "CONFIRMED_PENDING": 0,
    "DONE_BUT_RED": 0, "PENDING_BUT_GREEN": 0,
    "ATTESTED": 0, "UNPROBEABLE": 0
  },
  "attested_ratio": 0.0,
  "divergences": [{ "source": "…", "todo_id": "…", "verdict": "…", "evidence": "…" }]
}
```

### 3.5 The mutation-probe test (the gate proves it can fail)

`plan-state:selftest` runs a planted-defect suite over a fixture estate
(≥10 fixture plans covering every proof kind), asserting RED on each of:

1. `artifact` proof pointing at a deleted path;
2. `artifact` anchor removed from an existing file;
3. `gate` proof whose registered command is forced to exit 1
   (a fixture-only registry entry wrapping `exit 1`);
4. `probe` with a survivor outside the declared set;
5. `git-fact` `tag-exists` for a nonexistent tag;
6. `ratified` record path deleted;
7. recorded `completed` over each of 1–6 (must yield `DONE_BUT_RED`);
8. recorded `pending` over a green proof (must yield `PENDING_BUT_GREEN`);
9. an unknown `proof.kind` literal (must be a schema reject, not a skip);
10. a registry id that does not resolve (must yield `UNPROBEABLE`, not green).

The suite runs in the module's tests (CI) AND as the acceptance condition
for the warn→enforce escalation, with the transcript committed. A zero from
a detector never shown to fire is not a finding (design property 2; I4).

### 3.6 The V0.1 extension text (what OG-1 ratifies)

The amendment to `plan-node-schema.v0.md` §2.4, verbatim candidate:

> `todos` — list of `{ id, content, status: pending | completed, proof?, spec_ref? }`.
> `proof` is a closed discriminated union over
> `artifact | gate | probe | git-fact | ratified | attested`
> (LOCKED model; `gate`/`probe` values resolve against the committed
> registries — registry membership is additive). `spec_ref` is a stable
> anchor into a frozen source whose section remains the authoritative
> detail contract for the todo. Both OPTIONAL on the schema (existing
> plans remain valid); both REQUIRED by the refounding authoring gate for
> todos in the refounded corpus. Exposure: model LOCKED on ratification;
> registries additive.

Forward-compatibility note carried in the amendment: a todo `proof` is a
recomputable **edge** in ADR-200 §4 terms (state claim → ground facts +
recompute procedure). WS2's idea-node schema defines the content-addressed
recomputable-edge primitive; when it lands, todo proofs are re-expressible
as instances of that primitive without semantic change. V0.1 deliberately
embeds rather than waits — the refounding cannot block on WS2, and the
mapping is mechanical (interface, not dependency; the owner ratifies this
sequencing explicitly in OG-1).

## 4. The versioned status-mapping table

- **Home**: `agent-tools/src/plan-state/status-mapping/v1.ts` — a typed
  const, TSDoc'd, exported with its version literal; the audit adapter
  takes `--mapping v1`. Human ratification happens on the PR that lands it
  (owner gate OG-2); the table cites V0 §3.5 as its derivation source.
  One source of truth in code — no parallel prose copy to drift; V0 §3.5
  gains a one-line pointer to the table as its machine form.
- **Row shape**: `{ recorded_value, axes: { kind?, disposition?, gate_shape?, execution? }, todo_claim?: "pending" | "completed", note }`.
  It maps BOTH vocabularies: plan-level `status:` values (all ~30 emergent
  values, transcribed from V0 §3.5 and completed against F1's full census)
  and todo-level status variants F1's extraction surfaces verbatim.
- **Residue**: any value not matched exactly (after nothing more than
  whitespace trimming — no fuzzy matching, no case-folding: Kiln Q2 records
  case-folding as a real mis-designed-probe bug class) is emitted as
  `{ value, occurrences: [{file, line}...], class: "UNMAPPED" }` into the
  F3 adjudication queue. Adjudicated values come back as table v2 rows
  (additive), owner-ratified, and the affected batch re-runs under v2.
- **Versioning**: versions are additive files (`v1.ts`, `v2.ts` re-exporting
  v1 + deltas); every audit output records the version applied; a
  stable-point artefact produced under v1 is never silently reinterpreted
  under v2 — re-running is explicit and cheap (the run is deterministic).
- **Never normalise at extraction** (Kiln Q4 move 1): the table is applied
  by the audit adapter AFTER F1's workers/scripts have carried values
  verbatim into the inventory. The inventory conserves lines; the table
  conserves the interpretation as a separate, versioned, ratified layer.

## 5. Attested-count reporting (D5 operationalised)

- Per-plan: `attested: n / todos: m` in the human summary.
- Corpus: `attested_ratio` in the JSON summary; the F4 ratification walk
  receives the number with its doctrine sentence attached ("expected high
  on first typing; driven down by sharpening in the destination estate,
  never by silent conversion").
- Trend: each stable-point artefact carries the ratio, so the refounding
  itself produces the first trend line (audit-mode ratio over the old
  estate vs gate-mode ratio over each authored batch) — the honest measure
  of how much more recomputable the new corpus actually is.
- Anti-Goodhart tripwire: `plan-state:recompute` samples k proofs per run
  whose target artefact predates the todo's introduction (a cheap git-fact
  lookup) and lists them as `pre-existing-target` informational notes —
  the tell for proof-washing, surfaced without being a gate.

## 6. Team-state join (D6 operationalised)

**Now (lands with the tool, report-only):**

```text
inputs:  plan-state JSON (gate mode)
         .agent/state/collaboration/active-claims.json  (read-only)
         git facts (last-commit-touching per area glob)
signals: WASTED_SEAT?   claim.areas ∩ plan(area) where all todos CONFIRMED_DONE
         ORPHANED_LANE? plan not terminal, no overlapping live claim,
                        area has commits newer than plan.last_updated
output:  warn-only section in the run summary; never a gate
```

The claims registry is live and untracked-plane-adjacent: the join trusts
it only for "who holds what right now", never history (PDR-130's
trust-scoping). The tool never writes to it.

**Later (team-tooling / OQ5 lane, after the refounding's coexistence
window closes):** additive claims schema 1.4.0 — optional
`plan_todo: { plan_id, todo_id }` on claim open — then the exact PDR-130
invariants as a `validate-team-state` check: no open claim on a
recomputed-done todo; no in-progress todo without a live claim; lane
progress rendered as N-of-M proofs green. Prose team surfaces over this
substrate become rendered views over the recomputation (the structural cure
for continuity-table drift). This is deliberately OFF the refounding
critical path; the refounding only guarantees its output artefact is the
join-ready substrate (stable todo ids + verdicts + timestamps).

## 7. Interfaces to other facets

- **F1 (mechanical substrate)**: F1's scripted inventory is the audit
  adapter's input (verbatim lines, `file:line`-anchored, status values
  unnormalised); F1's frozen denominator is what audit-mode counts divide
  by; the tool's stable-point JSON artefacts are committed under F1's run
  directory; the warn→enforce wiring rides F1's extension of
  `repo-validators:check`. The tool build is ALSO the first consumer of
  F1's freeze — its fixture estate should include a copy of one real frozen
  plan to keep fixtures honest.
- **F2 (worker layer)**: no worker ever produces a state verdict — workers
  carry recorded values verbatim; the tool produces verdicts
  deterministically. If a worker brief would require deciding a status
  meaning, that is a mis-designed task (refusal clause), and the mapping
  table is where that meaning-decision actually lives.
- **F3 (judgement + error-correction)**: receives two queues from this
  facet — `UNMAPPED` residue rows and `DONE_BUT_RED` divergences (both
  judgement by design); shares the I4 prove-it-fires discipline (this
  facet's mutation suite is the state-gate instance of F3's
  planted-defect doctrine); `PENDING_BUT_GREEN` rows go to F3 only when
  `--fix`'s mechanical flip is contested.
- **F4 (intent layer + lanes)**: the ratification walk consumes recomputed
  state, never remembered state (I11) — concretely, the walk's briefing
  pack is a fresh `plan-state:recompute` run plus the attested ratio;
  lane assignment is orthogonal to this facet (a todo's proof does not
  change when its plan moves lanes, because proofs cite repo facts and
  frozen-spec anchors, not lane paths).
- **F6 (sequencing)**: D1 makes the tool build workstream #1; the
  warn→enforce escalation and the audit-adapter retirement are F6 stable
  points; the OQ5 team-join lane is F6 roadmap material after the
  coexistence window.

## 8. Owner gates

- **OG-1 — V0.1 proof-typed todo ratification** (blocking for the gate
  adapter; the audit adapter does not need it). Packet: the §3.6 amendment
  text; the six-kind taxonomy table with oak examples (§3.2); the
  optional-on-schema / required-at-refounding-authoring rule; the
  attested-count semantics (signal, never gate — D5); the ADR-200 §4
  forward-compatibility note; the D2 falsifier (cost of declining, stated).
- **OG-2 — Status-mapping table v1 ratification** (blocking for audit
  mode). Packet: the v1 table PR (transcribed V0 §3.5 + full-census
  completion); the UNMAPPED residue routing rule; the >20% halt condition.
- **OG-3 — warn→enforce escalation** (after the deliberate-break
  transcript exists and the warn window has produced a divergence report
  the owner has seen). Batched into an existing mid-flight ruling slot
  (I8: owner-gate count stays scale-independent) rather than a standalone
  ceremony.

Adjudicated `UNMAPPED` values and contested `DONE_BUT_RED` rows ride F3/F4's
batched mid-flight rulings; they are not separate F5 gates.

## 9. Open questions

1. **Plan-level disposition recomputation**: should `disposition: done`
   require plan-level acceptance proofs (beyond all-todos-green)? Deferred
   to V0.2 — the todo layer is the refounding's need; naming it now avoids
   pretending it is solved.
2. **`pr-merged` offline behaviour**: `UNPROBEABLE` on network failure is
   designed, but should gh-backed facts carry a local cache with TTL so CI
   is deterministic? Lean yes; decide at build against CI's actual network
   posture.
3. **WS2 convergence**: when the content-addressed recomputable-edge
   primitive lands, is the todo-embedded proof re-expressed mechanically or
   do both forms coexist behind one parser? Interface named in OG-1; answer
   owned by WS2.
4. **Probe registry growth governance**: additions are reviewed PRs, but is
   there a size ceiling before templates need their own taxonomy? Watch at
   pilot; no mechanism until the second consumer demands it
   (consolidate-at-second-consumer).

## 10. Rejected alternatives

- **Build the tool after the refounding** (resonance's actual order) —
  rejected: kit item 9 names tool-first the largest structural saving; at
  ~37× resonance's line count, an un-tooled two-verdict audit is
  infeasible as diligence and expensive as LLM work that I1 forbids anyway.
- **Build only against V0.1 (no audit adapter)** — rejected: leaves the
  old-estate audit bespoke, forfeiting the r2-equivalent-as-recomputation
  saving; the adapter is thin because the mapping table carries the
  judgement.
- **Free-text shell in `gate`/`probe` proofs** — rejected: violates the
  no-free-text-axes invariant and strict-validation-at-boundary; a shell is
  a universal capability; frontmatter-supplied commands executed by a CI
  tool is an injection surface.
- **Auto-flipping `pending → completed` on green** — rejected as default:
  report-first per warn-stage discipline; `--fix` with embedded transcript
  is the evidenced mechanical path; `DONE_BUT_RED` is never auto-anything.
- **Committing recomputed state as a living frontmatter cache** — rejected:
  recorded state is a cache, never truth; minting a second committed cache
  reintroduces the drift the tool exists to kill. Only frozen stable-point
  artefacts are committed.
- **Squeezing unmappable status values to the nearest type** — rejected
  verbatim per Kiln Q4; the residue class + adjudication route is the
  design.
- **Fuzzy/case-folded status matching** — rejected: Kiln Q2 records
  case-folding as a real probe-mis-design bug; exact match + residue is
  cheaper and honest.
- **Blocking the refounding on the exact team-state join** — rejected: the
  join needs a live-substrate schema change mid-arc; the refounding needs
  plan-side state only.
- **A seventh oak-specific proof kind** (e.g. `linear-fact` for projected
  execution status) — rejected for V0.1: execution status is deliberately
  not stored (V0 §3.2), so there is no repo claim for it to recompute;
  revisit only when `projects_to` is built.

## 11. Cost model sketch

Grounded in: patterns-index validator ≈ 250 LOC incl. helpers/tests
(precedent unit); resonance priors (their ~1.3M subagent tokens were
verification waves the scripted design eliminates); oak census (335 plan
files, ~750 todos).

- **Build (one-off)**: engine + 6 probe executors + 2 adapters + registries
  + fixtures + mutation suite ≈ 1,200–2,000 LOC — one implementer session,
  ~0.5–1 day wall; agent authoring spend ~200–500k tokens (single seat,
  ordinary implementer cadence; zero worker fan-out). This is the whole
  point: the spend is one-off code, replacing per-audit LLM spend forever.
- **Gate-mode run, cheap tier**: ~750 claims × (artifact/git-fact/ratified
  ≈ 5–20ms each) + parse ≈ **well under 60s** on the estate; zero LLM
  tokens.
- **Gate-mode `--full`**: bounded by the gate registry — each unique
  referenced gate runs once per run (deduped); dominated by whatever the
  heaviest referenced gate costs (`repo-validators:check` ≈ 1–3 min;
  `full-check` ≈ CI-scale minutes, hence its `slow` class and the pre-run
  declaration). Zero LLM tokens.
- **Audit-mode run**: mapping application is O(n) lookup over F1's
  inventory (165k source lines → the work-bearing subset); probing as
  above; **zero LLM tokens** — the entire r2-equivalent state audit costs
  minutes of compute. Divergence adjudication (F3) is where tokens go, and
  its volume is the audit's finding count, not the estate size.
- **Mutation selftest**: seconds; runs in CI on every change to the module.
- **Owner time**: OG-1 + OG-2 are one sitting each (packets are short and
  decision-complete); OG-3 rides an existing ruling slot. Scale-independent
  per I8/I11.
