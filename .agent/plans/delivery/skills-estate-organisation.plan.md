---
id: skills-estate-organisation
node_type: delivery
name: "Skills-estate organisation — one concept scheme across skills, rules, and subagents"
overview: "The owner-ratified structure for the skills estate: one concern tier over flat, namespace-unique skills (families flatten to `<family>-*` ids), with the concept graph carrying every further dimension of type; annotations, derived projections, and ratified validators instantiate PDR-134/ADR-221, never a parallel taxonomy."
status: ratified
ratified_by: "Jim Cresswell"
ratified_date: 2026-08-08
ratified_where: >-
  In-session at the Director seat, 2026-08-08: four numbered owner
  rulings ratifying the Director's structure recommendation with one
  amendment (families flatten by id namespace). Follows the 2026-08-07
  grouped-by-concern ruling (captured at the Skills seat, comms event
  0e99bc22) and the 2026-08-02 commissioning word.
serves: planning-and-intent-estate
impact_areas:
  - practice-and-estate
tickets: []
depends_on: []
owner_gates:
  - awaiting: owner-decision
    clears_when: >-
      The owner ratifies the annotated corpus after WS2 is visible for
      review (visibility-before-validation: WS4's validators land only
      after that ratification). The structure ruling itself cleared
      2026-08-08 — see §The ratified structure.
    expires: 2026-08-23
last_updated: 2026-08-08
---

# Skills-estate organisation

## Goal

Every skill, rule, and subagent template carries its classification as
concept annotations on the canonical artifact itself — KIND (what it
is), STRATUM (PDR-134's four, verbatim — the portability truth), and
INTENT (what it serves) — with every index a derived projection and
the two-graph invariant (summons edges free; grounding references obey
the strata direction law) mechanically checkable. The skills corpus
additionally carries the owner-ratified FILESYSTEM STRUCTURE below.
Evidence base:
[the concept-exploration report](../../reports/agentic-engineering/skills-estate-organisation-concept-exploration-2026-08-02.md)
(2026-08-02, including the dependency-topology study and the two-graph
finding) and
[the WS0 working record](../../reports/agentic-engineering/skills-estate-organisation-ws0-working-record.md).

## The ratified structure (owner rulings 2026-08-07 and 2026-08-08)

Two owner moments settled what WS0's deep reflection carried as its
filesystem question. 2026-08-07 (no debate; captured at the Skills
seat, comms event 0e99bc22): canonical skill definitions GROUP BY
CONCERN; vendor projections STAY FLAT; PR #731 reconciles with the
ruling before it merges. 2026-08-08 (in-session at the Director seat):
the concrete shape, ratified as four numbered rulings on the
Director's recommendation:

1. **One tier, families flatten by namespace.** Canonical depth is
   `<concern>/<skill>/`, never deeper. A skill family is a NAMING
   convention plus a graph relation, not a tree shape: members are
   ordinary namespaced skills (`parallax-audit`, `parallax-frame`, …)
   sitting directly under their concern. The family-bundle directory
   shape (`<family>/skills/<skill>/`) is retired before it ever
   reaches main.
2. **The graph carries the overlap, not the tree.** The tree is a tree
   containing graph nodes; the graph expresses every further dimension
   of type. Because the tree is the LEAST FLEXIBLE expression of
   structure, its constraint on the graph is kept at a minimum by
   keeping the set of tree concerns to the SMALLEST USEFUL NUMBER
   (owner's words, 2026-08-08). Primary concern is declared in
   frontmatter and the tree position must agree — the twin-surface
   consistency that WS4 makes checkable; secondary concerns, family
   membership, kind, stratum, and intent are graph annotations only.
3. **The landing rule.** Every new skill names its concern at landing.
   "No obvious home" challenges the concern vocabulary rather than
   minting a group ad hoc; minting or merging a concern is a
   deliberate, recorded act tested against the smallest-useful-number
   principle.
4. **Rules and subagents share the vocabulary, not the shape.** They
   take concern annotations only; no filesystem regrouping. Their flat
   filenames are load-bearing identifiers (projections, hooks, policy
   matchers), and they are single files with no substructure — the
   skills corpus is the lever where directory geography pays.

### The working concern set

Eight concerns, adopting the exploration report's content-derived
intent families (adopt-don't-invent per ADR-221; `cognition` keeps the
owner's existing directory name). This table is the WORKING CUT:
placements marked † are judgment calls re-judged at each migration
PR, and the ≤20%-debate falsifier governs the vocabulary itself.

| Concern | Members (current corpus) |
| --- | --- |
| `cognition/` | metacognition, reason, concept-exploration, free-play, proportionality, cricket, retrospective, go†, and the nine `parallax-*` members |
| `knowledge/` | napkin, consolidate-docs, consolidate-until-done, curator-pass, knowledge-safety-sweep |
| `choreography/` | start-right-quick, start-right-team, start-right-thorough, session-handoff, wrap, coordination-fold, inter-practice-collaboration, set-up-worktree-lane, sif† |
| `change-custody/` | commit, gates, pr-lifecycle, complex-merge, semantic-merge, undo-change |
| `planning/` | plan, ticket-management |
| `orientation/` | under-the-hood, working-with-agentic-ai |
| `domain-craft/` | design-system-usage, fidelity-review, ground-truth-design, ground-truth-evaluation, update-bulk-download-schema, update-upstream-api-spec, working-with-graphs†, tsdoc† |
| `interop/` | codex-helper, chatgpt-report-normalisation†, the-codex-dialogues† |

Thin groups (`planning`, `orientation`, `interop`) are merge
candidates the first time a landing tests them against the
smallest-useful-number principle; the tree is cheap to re-cut
precisely because projections are flat.

Two annotation-time edges named by the design seat (2026-08-08, ARC
pairing) for WS2/WS3 to carry: fidelity-review ↔ the W0.7
design-review instrument (shared judge-against-reference shape; the
calibration record cites the skill's vocabulary), and
design-system-usage → the design-values-come-from-the-system rule's
concern (the skill operationalises that rule; the edge makes the
pairing discoverable).

### Family mechanics

- Member ids are globally unique in the flat namespace
  (`parallax-*`); the generator's duplicate-refusal stands.
- Family membership is a frontmatter concept (graph relation), never
  a directory.
- Family-SHARED assets (Parallax's family-level `reference/` corpus,
  its family eval suites, `manifest.json`) re-home to the estate's
  standing surfaces — default: reference material under
  `.agent/reference/parallax/`, eval suites under
  `.agent/evaluations/parallax/` — with member skills linking them.
  The implementer verifies the default against those surfaces'
  conventions at pickup.
- Vendor projections stay flat and byte-stable: canonical moves must
  leave regenerated adapters byte-identical — the conservation
  instrument #731 proved.

## Why this shape (first principles, not cowpath)

The estate ratified the machinery already: ADR-221 §6 (concepts as
front-matter annotations, one referent one home, seed vocabulary
adopted not invented), PDR-134 (strata + direction law + concept
lifecycle), PDR-009/051 (kind is a Layer-1 canonical property;
activation is a Layer-2 adapter property). A standalone skills
taxonomy beside that machinery would be the invented parallel scheme
ADR-221 forbids. The tree is GEOGRAPHY, not anatomy: the dependency
study found the estate's core is a mutually-referential organism of
~12 skills spanning several concerns — summons edges are free to
cross groups, so no grouping can or should mirror the runtime graph.
Flat projections decouple runtime naming from canonical geography,
keeping the cost of re-cutting the tree near zero (cost of change is
a core owner value).

## Workstreams

0. **WS0 — deep reflection: RESOLVED.** The structure question is
   owner-ruled (§The ratified structure). The exploration report and
   working record remain the evidence base; the annotation-scheme
   residue (kind/intent vocabulary, homonymy handling) is exactly
   WS1–WS3's content and continues there. No further WS0 sittings.
1. **WS1 — Vocabulary mint (concepts-first).** KIND (six values +
   collaboration-protocol from the rules corpus; primary/secondary
   hybrid convention; `platform-binding` deliberately excluded — the
   stratum axis carries portability) and INTENT (seven families)
   enter the concept scheme as `candidate` concepts with authored
   definitions; the EIGHT CONCERN NAMES above enter the same way;
   STRATUM adopts PDR-134 verbatim, no new nodes. The
   `classification: active|passive` frontmatter field is retired in
   the same change (its honest content becomes the
   `standing-invariant` kind).
2. **WS2 — Skills corpus annotation.** Front-matter concept keys on
   each SKILL-CANONICAL.md — including `concern` (primary, must agree
   with tree position) — seeded from the report's per-skill table,
   each classification re-judged against the body at annotation time
   (the report is a draft, not an oracle). Hybrid seams marked at the
   section level where a canonical genuinely splits strata
   (pr-lifecycle). THE REMAINING OWNER GATE fires here: the annotated
   corpus is the visible surface the owner ratifies.
3. **WS3 — Rules and subagents annotation.** Concern/kind/stratum/
   intent keys on the 119 rule canonicals (always-on/trigger-loaded
   stays untouched as the activation axis) and the subagent
   templates/components (the three-layer format README stays
   untouched as format architecture). Annotations only, per ruling 4.
4. **WS4 — Derived projections + validators (post-gate only).** The
   skills index, RULES_INDEX's classification columns, and the
   composition map regenerate from annotations; ADR-221's seeded
   checks extend to: every concept key resolves; grounding references
   obey the strata direction law; derived indexes reject hand edits;
   NO canonical deeper than `<concern>/<skill>/`; tree position
   agrees with the declared primary concern. Summons cycles are
   exempt by design — the two-graph invariant is the check's core.
5. **WS5 — Named cures from the exploration's tension list.** (a)
   Lift the portable core of pr-lifecycle's review-round state
   machine to a practice-stratum pattern cited by proportionality and
   concept-exploration (cures the grounding inversion); (b) re-home
   cricket's experiment-record (binding-tally authority) beside the
   tally with the skill keeping method + pointer; (c) regenerate and
   re-scope skill-composition.md as a derived view, its two
   composition rules preserved as ratified doctrine; (d) the
   Oak-vs-external boundary (owner aside, 2026-08-02): no third-party
   skills in `.agent/skills` — externals enter only via the
   external-skill class in `.agents/skills` (lock-pinned, vendored)
   so upstream keeps the maintenance burden; the cure is a rule
   naming the boundary plus a validator refusing third-party landings
   in core.
6. **WS6 — #731 reconciliation (determinate target).** Keep #731's
   valuable substance: family-aware discovery's tests, the duplicate
   refusal, the flat adapter projections (which already match ruling
   1's projection half), and the nine Parallax adapters. Retire the
   family-bundle walker shape in favour of the single
   `<concern>/<skill>/` shape with one optional concern tier
   (replace-don't-bridge; flat/nested coexistence is transitional
   only). Parallax lands as `cognition/parallax-*` namespaced
   members; shared assets re-home per §Family mechanics. The four
   original review legs continue inside this workstream: link audit,
   RPIF consistency review, relationship map to the cognitive skills,
   and mechanics (frontmatter reconciliation; the Python-tools
   scoping ruling vs source-is-typescript-esm-only; the family
   eval-suite convention as a candidate general mechanism). Whether
   #731 is re-cut or superseded by a fresh PR is the seat's call at
   pickup; either way #731 closes-or-merges with its machinery
   preserved and its branch state reconciled against a main that has
   moved ~477 commits.
7. **WS7 — Estate migration.** One PR per concern group moving the
   flat canonicals into their concern, each proven
   conservation-clean: regenerated adapters byte-identical,
   `portability:check` green, full gates green. Placement judgment
   calls (†) are re-judged in each group's PR. The transitional
   flat/nested coexistence ends when the last flat canonical moves.

## Acceptance (falsifiable)

- Depth: no canonical path deeper than `<concern>/<skill>/` —
  mechanical check, green after WS7 (and enforced from WS4 on).
- Twin-surface agreement: declared primary concern and tree position
  never disagree once WS4's validator lands; the validator proves
  itself by catching a deliberately mis-homed fixture.
- The Parallax family lands as namespaced flat members with NO new
  tree shape — the extensibility proof under the ratified rules.
- Fewer than ~20% of skills provoke placement debate; breach re-cuts
  the concern vocabulary rather than accumulating exceptions.
- Every canonical move leaves regenerated adapters byte-identical —
  runtime summons names never change.
- Every index consumer-visible after WS4 is generated; a hand edit to
  a derived index fails a check.
- The grounding-direction check finds the two known inversions
  (proportionality, concept-exploration) before WS5 cures them, and
  zero after.
- Functional conservation (owner word 2026-08-02): every current
  lever behaviour — skill summons, always-applied rule loading,
  subagent dispatch, adapter generation, vendored-external operation
  — is preserved, or its change is owner-ruled; simplification never
  subtracts capability silently.

## Delivery

Structure ratified 2026-08-08 (frontmatter); the WS2 annotated-corpus
gate remains the plan's one owner gate. Execution seat: OPEN — the
owner declined resuming the previously pre-warmed Skills seat
(2026-08-08 word); a fresh owner-launched seat picks up the standing
reconcile route (comms event 1ce7086b, as amended by this
ratification). Sequencing: WS6 first (it unblocks the ledgered #731
disposition and lands the walker), WS7 groups in any order after,
WS1–WS4 as their own single-story PRs with WS2 carrying the owner
gate, WS5 cures independently schedulable. Single-story PRs
throughout at PDR-132 budgets. No ticket while the Linear embargo
stands (to 2026-08-10 08:00 London; mint-at-pickup owner-waived per
the standing ruling, recorded here as the affected artifact's stamp).

## Out of scope

- Designing the Parallax family's content (owner research; it is this
  plan's extensibility TEST, not its content).
- Any change to rule substance, skill substance, or subagent
  behaviour beyond the named WS5 cures — classification annotates,
  never rewrites.
- Any runtime naming change: vendor projections stay flat and leaf
  ids stable; a summons that works today works identically after
  every workstream.
- Cross-estate portability packaging (practice-core export) — the
  stratum annotations make that legible later; packaging is its own
  plan. (The apparent rhyme between concern groups and export
  boundaries is a noted association, not a design input — portability
  is the stratum axis's job.)
