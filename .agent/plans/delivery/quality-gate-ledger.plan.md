---
id: quality-gate-ledger
node_type: delivery
name: "Quality-gate ledger — a register that recomputes"
overview: "Replace hand-maintained quality-gate lists with a schema-validated ledger whose derived half is recomputed from the invocation surfaces and whose authored half carries the judgement a machine cannot hold: why each gate exists, what its failure means, and the cure. Establishes quality gates as the fourth lever corpus under the one descriptive framework, and supersedes ADR-121's coverage matrix with a generated view."
status: sketch
serves: planning-and-intent-estate
impact_areas:
  - practice-and-estate
tickets:
  - MCP-491
depends_on: []
owner_gates: []
last_updated: 2026-08-04
---

# Quality-gate ledger — a register that recomputes

## Goal

A session, a reviewer, or the owner can answer four questions about any quality
gate from one place — **what gates exist, where each runs, why it exists, and what
to do when it fails** — and the answer cannot silently go stale, because the
machine-knowable half is recomputed from the invocation sites on every run.

The harm this removes is observed, not hypothetical: on 2026-08-04 the repository
owner had to ask an agent whether skill validation ran in the hooks, and the agent
could answer only by grepping four separate surfaces.

## Mechanism

### Why a ledger works where the matrix did not

ADR-121 already holds a coverage matrix whose stated purpose is *"makes gaps
visible and auditable"*. Its own change log records a manual repair —
*"Reconciled matrix with actual gate implementations"* (2026-04-11) — and it is
stale again today: five surfaces claimed against six live, two standing CI-only
exceptions named against three. Diligence was applied and the artefact decayed
anyway, twice. **The mechanism is the defect, not the care.**

The ledger differs in one property that does the whole job: it is split by who
can know the fact.

- **Derived** — which gates exist, where each is invoked, whether failure blocks.
  These are facts the repository already contains. The validator recomputes them
  from the invocation surfaces and fails on drift in **both** directions: a gate
  with no entry, and an entry naming no live invocation site. This is
  `validators-must-recompute-not-just-record` applied to the gate corpus; a
  validator that only checked the ledger's own schema would reproduce exactly the
  failure it replaces.
- **Authored** — why the gate exists, what a failure actually means, how to tell a
  genuine finding from a crashed checker, and the cure. A machine cannot derive
  these, and they are the fields a reader needs most at the moment of failure.

Duplication is the decay mechanism, so the human-readable cross-surface view is
**generated from the ledger**, never authored beside it. ADR-121 keeps what only it
holds — the surface definitions and the pre-push ≡ CI principle — and its matrix
becomes that generated view rather than a second authority.

### Gates as the fourth lever corpus

The owner ruled on 2026-08-02 that skills, rules, and subagents "are all aspects of
an underlying descriptive framework", each exposing a name and description to the
one constant consumer: the what-applies-now routing decision. Quality gates are a
fourth corpus of exactly that kind, and the moment of need is sharper than for the
other three — a session meets a gate when it has just failed one. Each entry
therefore carries a description meeting the same three targets (discovery,
applicability, best-practice/bad-practice), and gate failure output points **into**
the ledger so the routing works from the failure moment outward.

Two worked examples are already in hand and belong in the corpus as the calibration
pair:

- **Best practice** — the portability validator refuses a push naming the exact
  missing entry and the cure, so the reader needs nothing else.
- **Bad practice** — the staged-prettier gate reported "formatting issues found"
  when the checker itself had crashed and never ran, sending its reader to
  re-format an already-formatted file.

### The self-test

The ledger's validator is a quality gate, so it carries an entry in the ledger. If
it does not, the ledger is provably incomplete at birth. This is cheap and it is a
real completeness probe rather than a joke.

## Acceptance criteria

| # | Criterion | Proof |
| - | --------- | ----- |
| 1 | Every gate discoverable at an invocation surface has a ledger entry, and every entry names a live invocation site. | `repo-safe` — the validator fails a deliberately introduced gate with no entry, and a deliberately orphaned entry. Both directions proven by test. |
| 2 | The ledger's schema is enforced, and a malformed entry fails the gate. | `repo-safe` — schema-violation fixture rejected. |
| 3 | The ledger's own validator appears in the ledger. | `repo-safe` — asserted by test. |
| 4 | ADR-121's coverage matrix is generated from the ledger, not authored. | `repo-safe` — regenerating produces the committed matrix byte-for-byte; drift fails the gate. |
| 5 | Every disagreement between ADR-121's current claims and recomputed reality is recorded with a disposition, none silently absorbed. | `owner-held` — the owner reads the disagreement list and confirms nothing was quietly dropped. |
| 6 | A reader meeting a gate failure can reach its ledger entry from the failure output. | `owner-held` — the owner's judgement on one worked failure. |

## Out of scope

- **Changing what any gate does.** This work registers and describes gates; it does
  not add, remove, retune, or re-sequence one. The owner's constraint on 2026-08-04
  was explicit — prefer the change that cannot break the working system.
- **Fixing the gate defects the inventory surfaces.** Holes found (for instance a
  checker that prints `ERROR` and exits 0) are recorded as ledger entries with
  their real failure semantics and routed to their own tickets. Curing them here
  would make this an unbounded lane.
- **Eval suites for gate descriptions.** The description contract is adopted; its
  measurement rides the commissioned evals pilot that already owns that question.
- **Any hook or CI reordering.**

## Todos

Sliced so each is a single-story PR.

1. **Inventory, recomputed.** Enumerate every gate across hooks, CI workflows, root
   and workspace scripts, turbo tasks, and custom validators, plus the reconciliation
   against what documentation currently claims. Deliverable is the evidence table and
   the disagreement list. **ADR-121 is not an input to this step** — the owner's
   direction on 2026-08-04 is to assume it is badly out of date, so it is a test case
   for the finished validator, never a seed for the ledger.
2. **The PDR** — the practice decision: gates are a registered lever corpus, an
   unregistered gate is a defect, the description contract binds, and each gate names
   an owner.
3. **The ADR** — the architecture: the ledger artefact and its schema, the
   recomputing validator, the generated-view relationship, and the supersession of
   ADR-121's matrix. States the should-be; the means stay here.
4. **Schema and ledger, seeded from the inventory** — the data artefact with its
   schema, populated from step 1's recomputed reality.
5. **The validator** — schema conformance plus bidirectional parity, with the
   red-first tests acceptance criteria 1–3 name, wired into the gate surfaces it
   itself describes.
6. **The generated view** — ADR-121's matrix rendered from the ledger, its authored
   copy retired, and the disagreement dispositions from step 1 landed.

## Where the first-principles check fires

Per `plan-body-first-principles-check`: at step 4, on the question *could this be
simpler* — specifically whether the ledger needs its own schema file at all, or
whether the validator's types are the schema. And at step 5, on the friction
ratchet: if recomputation proves impossible for a meaningful share of gates (dynamic
dispatch, gates expressed only in vendor config), that is the shape-reconsideration
signal, and the honest fallback is a smaller ledger covering only what can be
recomputed rather than a large one that quietly returns to being a list.

## Falsifiers held open

- If the inventory finds most gates are **not** mechanically discoverable, the
  recompute half is unbuildable and this plan's core claim fails. The fallback is
  narrower coverage, never a hand-maintained ledger wearing a schema.
- If no gate failure output ever routes a reader into the ledger, the description
  contract is overhead here and should be dropped to a bare register.
