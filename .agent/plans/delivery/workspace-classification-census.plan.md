---
id: workspace-classification-census
node_type: delivery
name: "Workspace classification census — re-ground the surface-isolation matrix from the live estate"
overview: "Classify every workspace and tracked non-member code surface on the Oak-specificity axis from live dependency-graph and metadata evidence, superseding the 2026-04-28 matrix, with leakage types, target states, tranche ownership, and licence mapping — evidence and classification only, no moves."
status: sketch
serves: outcome-informed-practice-learning
impact_areas:
  - practice-and-estate
tickets: []
depends_on:
  - plan: survey-machinery-deconstruction
    kind: beneficial
owner_gates: []
last_updated: 2026-08-12
---

# Workspace classification census

## Why this node exists

The owner ruled (decision cards, 2026-08-12) that the survey programme's
first concrete move is this census. The authoritative workspace
classification matrix — the first todo of the oak-surface-isolation
programme brief — has not moved since 2026-04-28, while the estate has
(two of the brief's matrix rows name workspaces that are no longer pnpm
members). Three consumers wait on the boundary answer the matrix carries:

1. the estate-boundary decision the owner holds (what belongs inside this
   repository as a workspace);
2. the lesson-retrieval backlog explicitly compiling items "for when the API
   code moves into the repo" (`lesson-retrieval-boundary-differentiation`);
3. the thinnest-Oak-slice separation path with its licence mapping (code
   MIT, content OGL, brand reserved).

The census is also the survey programme's workspace-scale opener: its
classification spine — the Oak-specificity axis — is the second axis the
foundational-building-blocks frame already names, measured here at the
workspace scale.

The `depends_on` edge to `survey-machinery-deconstruction` is beneficial,
not blocking: the census ships fully without it. The edge matters only if
the falsifier below fires — the flipped sequencing then consumes that
node's extractor contract-coverage map.

## Goal

Every census subject has a current, evidence-backed classification:
**generic foundation / mixed / Oak leaf**, with the named leakage types
where Oak identity has leaked into foundational surfaces (names, defaults,
emitted surfaces, telemetry namespaces, ownership metadata, domain
assumptions — the surface-isolation brief's own taxonomy), a target state,
tranche ownership (the brief's todo requires it), and a licence-mapping
column. For subjects classified `mixed` only, a thinnest-Oak-slice
disposition (what would move, stay, or split) — restricted to `mixed`
because generic and Oak-leaf rows need no split judgement; the full split
design remains tranche work. The 2026-04-28 matrix is explicitly superseded
with a delta section, so its consumers stop reading a stale map.

**Census subjects, defined:** every pnpm workspace member (per
`pnpm-workspace.yaml`), PLUS every tracked non-member code surface — any
tracked `package.json` outside the member set and any tracked top-level
code/distribution directory (e.g. `plugins/oak-open-curriculum/`,
`runtime-only-scripts/`, the deliberately-unregistered research roots).
The boundary decision this census serves is precisely about surfaces the
member list cannot see; each non-member surface gets a matrix row or a
recorded exclusion, never silence.

## Mechanism

Evidence-first classification, judged readings corroborated:

- **Detector facts**: the dependency graph (the estate's depcruise
  instrument and turbo task graph), workspace metadata (package.json name,
  exports, dependencies, ownership strings), emitted surfaces (generated
  CSS variables, span names, env schemas), and direct greps for the leakage
  instances the surface-isolation brief already names — re-verified live,
  not inherited.
- **Judged readings** (the classification, target-state, and
  thinnest-slice calls): each carries at least two independent evidence
  kinds (static structure, emitted-surface content, consumer topology,
  doctrine/ADR record), with detector facts and judged readings separated
  in the matrix. At this scale the two-independent-kinds discipline is the
  corroboration mechanism; the WS9 stratified-quartet pattern (the owner's
  co-design ruling) binds at the survey's later judged scales, where
  candidate-level judgement warrants milestone-scale corroboration — it
  would be disproportionate on ~35 workspace rows. The ruling is disposed
  of here visibly, not dropped.
- **The artefact and its home**: the matrix lands at
  `.agent/reports/workspace-classification-census/matrix.md` (a new report
  home in the current estate — not inside the superseded July backlog
  directory), with a supersession pointer edited into the
  oak-surface-isolation brief's matrix section and todo.
- **Adjacent matrix, disposed**: the July backlog's
  `workspace-layer-separation-audit` phase-1 matrix classifies on a
  DIFFERENT axis (layer placement, not Oak-specificity). The census names
  it and cross-references rather than duplicating; reconciling the two
  axes into one surface is future work for the survey design, not this
  node.

**Recorded falsifier:** if honest leakage claims turn out to need
construct-level evidence underneath — claims this census cannot corroborate
from graph, metadata, and emitted surfaces — the census stops at the
affected rows, records them as `needs-construct-evidence`, and the
programme's sequencing question routes back to the Director; the code-scale
instrument decision then comes first. If it fires, this node acquires an
`owner_gates` entry (`awaiting: owner-decision`, absolute expiry inheriting
the strategic parent's `gate_expiry_default`) so the wait is
schema-visible, never an open holding state.

## Acceptance criteria

1. Every census subject has a matrix row or a recorded exclusion. Proof:
   repo-safe — a committed enumeration script beside the report
   (`derive-census-subjects.sh`: `pnpm ls -r --depth -1` UNION tracked
   non-member `package.json` files and tracked top-level code surfaces)
   recomputes the subject list and diffs it against the matrix rows plus
   exclusions; a reviewer runs one command for pass/fail.
2. Every judged row carries at least two independent evidence pointers of
   distinct kinds, and detector facts are separated from judged readings.
   Proof: repo-safe — the matrix carries explicit `evidence` and `kind`
   columns; the same committed script validates every judged row has ≥2
   distinct kinds.
3. The 2026-04-28 matrix is superseded explicitly: a delta section names
   every subject whose classification changed, appeared, or disappeared.
   Proof: repo-safe — the committed script derives the delta from the two
   documents' row sets and diffs it against the banked delta section.
4. The owner confirms, at this matrix's own review card, that it answers
   the boundary question at the level his decision needs (the census does
   not make the decision). Proof: owner-held — the card answer recorded in
   this plan's amendment trail.

## Out of scope

- Any workspace move, rename, split, or tranche execution — evidence and
  classification only. Tranche OWNERSHIP is a matrix column; tranche
  SEQUENCING is an owner decision and stays out.
- Any licence change (the licence column maps the ratified model; it does
  not re-open it).
- Thinnest-slice dispositions for `generic` and `oak-leaf` rows (no split
  judgement exists to record).
- Reconciling this matrix with the layer-separation audit's matrix (named
  and cross-referenced only).
- The reference pattern corpus and the fresh survey design (their own
  nodes).
- Construct-level (code-scale) evidence — a genuine need for it triggers
  the recorded falsifier, never silent scope growth.

## Todos

1. Commit the enumeration script; derive the subject list (members +
   non-member surfaces); skeleton the matrix with the column contract
   (classification, leakage types, evidence + kind, target state, tranche
   ownership, licence mapping, thinnest-slice for `mixed` rows).
2. Detector-fact sweep: dependency graph, metadata, emitted surfaces,
   leakage greps — banked per subject.
3. Judged-reading pass with two-kind corroboration per row.
4. Delta section against the 2026-04-28 matrix; supersession pointers
   edited into the surface-isolation brief.
5. Report assembly; enumeration script green; validator and gate green; PR.
