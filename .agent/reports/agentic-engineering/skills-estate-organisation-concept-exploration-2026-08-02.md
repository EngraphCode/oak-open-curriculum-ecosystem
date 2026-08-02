# Skills-estate organisation — concept exploration

**Date**: 2026-08-02. **Seat**: Falcon hunts Flight (52841f), Director.
**Commission**: the owner, in-session — "we need to organise the skills,
possibly by type … possibly by intent, possibly by how many layers deep
they depend on other skills … some are purely practical, some are
workflows, quite a few are about structuring thought and approach and
epistemics … I would not be surprised if rules and subagents followed a
related structure." Priced as foundational work with long-term returns.
**Grounding**: two full first-hand corpus reads this morning — all 38
canonical skills (~9,800 lines) with every skill→skill edge extracted,
plus the rules corpus (119 canonicals), the subagent estate (5
families), and exact-quote extraction from the ratified strata doctrine
(PDR-134, ADR-221, PDR-046, PDR-009/051, the
`planning-and-intent-estate` strategic node). Related incoming research:
the owner's Parallax framework (a new cognitive-structure skill family)
— used below as the scheme's extensibility test, not designed here.

## Verdict first

**This is a crosswalk, not an invention.** The estate has already
ratified where a taxonomy lives (ADR-221's concept layer: concepts as
front-matter annotations on the artifacts themselves, one referent one
home, indexes derived never hand-kept), what it stratifies against
(PDR-134's four strata and the direction law), and which axis is
content versus activation (PDR-009/051: kind is a canonical-artifact
property; loading/trigger is an adapter property). The skills corpus
already half-organises itself — the work is to mint the shared
vocabulary as concepts, annotate three corpora, derive the projections,
and only then guard with validators. A delivery plan under
`planning-and-intent-estate` (whose own ratified ordering is
concepts-first) carries it; the born-sketch plan accompanies this
report.

## The scheme: three declared axes plus one measured instrument

### Axis 1 — KIND (what the artifact is)

Content-derived from all three corpora, which exhibit the same natural
kinds. Six values, with a primary/secondary convention for genuine
hybrids:

| Kind | Skills examples | Rules examples | Subagent examples |
| --- | --- | --- | --- |
| `instrument-of-thought` | metacognition, reason, concept-exploration, proportionality, free-play, retrospective, cricket (panel half) | verify-dont-trust, present-verdicts-not-menus, read-before-asking, no-hedging-vocabulary | cricket family, architecture quartet, expert reviewer lenses |
| `ceremony` (workflow) | start-right-\*, wrap, session-handoff, consolidate-docs, coordination-fold, pr-lifecycle (spine), complex-merge, plan, curator-pass, inter-practice-collaboration | invoke-code-experts, worktree-residency, silence-is-never-liveness, new-rule-vs-pdr-clause | ground-truth-designer, subagent-architect |
| `standing-invariant` | napkin, commit (tripwire half), undo-change, working-with-graphs | never-commit-to-main, exit-codes-in-band-never-piped, stage-by-explicit-pathspec, use-result-pattern | — |
| `procedure` | gates, semantic-merge (mechanics), chatgpt-report-normalisation | markdown-code-blocks-must-have-language | corpus-\* workflow stages |
| `craft-reference` | design-system-usage, ground-truth-design/-evaluation, fidelity-review | code-shape doctrine (strict-validation-at-boundary) | domain experts (clerk, elasticsearch, sentry, mcp) |
| `teaching-surface` | working-with-agentic-ai, under-the-hood | plain-language rules | — |

Two kinds discovered rather than assumed. First, the **latent fourth
layer**: the existing composition reference
(`.agent/reference/skill-composition.md`) names modes / workflows /
programmes, but the corpus contains a kind it doesn't name — standing
invariant-carriers, always in force, neither entered nor looped (the
napkin, commit's pre-draft tripwire, undo-change). The frontmatter
`classification: passive` field gestures at this while colliding with
`commit`'s own body, which argues at length that it is "active, not
passive" in a *different* sense of the word — two vocabularies in one
file. The taxonomy retires that word entirely. Second, rules exhibit a
kind skills lack — **collaboration-protocol** (route-blocks-to-director,
respect-active-agent-claims, absorption acks): social contracts between
agents. It enters the vocabulary from the rules corpus; skills may
grow into it (start-right-team's choreography half already leans there).

`platform-binding` is deliberately NOT a kind: bindings are what
PDR-009/051 call the adapter/activation layer, and where binding
content lives inside a canonical (cricket's model tables, codex-helper,
pr-lifecycle's GitHub bestiary) the taxonomy marks it via the stratum
axis instead — which is where portability truthfully lives.

### Axis 2 — STRATUM (PDR-134's, adopted verbatim, zero new vocabulary)

`ontology` / `practice-instance` / `repo-instance` /
`operator-overlay`, with the homing question as the truth test ("true
in another Practice-bearing repository?"). Examples: reason and
metacognition are practice-instance; gates and design-system-usage are
repo-instance; oak-chrome-session-is-metered is operator-overlay.
Hybrids are marked at the section seam, not averaged: pr-lifecycle's
state machine is practice-instance doctrine; its GitHub API bestiary is
repo-instance craft. The stratum axis IS the portability answer the
commission asked for — no separate portability flag.

### Axis 3 — INTENT (what it serves)

The eight content-derived families the corpus read surfaced, lightly
consolidated to seven: `thinking`, `knowledge-metabolism` (capture →
distil → graduate → enforce), `session-and-team-choreography`,
`change-custody` (the git/CI trust boundary), `coordination-artefacts`
(plans, tickets), `orientation` (teaching surfaces), `domain-craft`.
Intent cross-cuts kind: a procedure can serve knowledge-metabolism; an
instrument-of-thought can serve change-custody.

### The measured instrument — dependency topology (computed, never declared)

The full skill→skill graph was extracted. **The headline finding
corrects this exploration's own opening hypothesis.** The a-priori bet
was "dependencies point down a layer gradient only; inversions are
defects." The corpus falsifies that for *summons* edges: the core of
the estate is one mutually-referential organism of ~12 skills — the
closeout family (wrap ↔ session-handoff ↔ consolidate-docs ↔ napkin)
and the thinking family (reason ↔ concept-exploration ↔ proportionality
↔ pr-lifecycle) joined into a grand cycle via retrospective → free-play
→ concept-exploration and pr-lifecycle → semantic-merge →
consolidate-docs. This is not debt: `skill-composition.md`'s
"summon by reference, never inline" rule is precisely what makes the
cycles safe, and the organism shape is why the Practice coheres.

The corrected invariant — better than the original: **there are two
graphs.** The *summons* graph (what invokes what at judgement moments)
is free to cycle. The *grounding* graph (what an artifact's doctrine
depends on to be read to completion) must obey PDR-134's strata
direction law: practice-stratum doctrine must never require
repo-stratum or operator-stratum content to be intelligible. That
invariant is checkable, and the corpus already carries its clearest
violation as a worked instance: **proportionality (an abstract
practice-stratum sizing gate) cannot be read to completion without
pr-lifecycle's GitHub-bound review-round state machine** ("build the
tally, or the trigger cannot fire"), and concept-exploration's Loop
Dynamics has the same shape. The cure is not to unwind the citations —
worked instruments are the estate's way — but to lift the state
machine's portable core to a practice-stratum pattern both cite, with
the repo-bound bestiary remaining the worked instance. Dependency
DEPTH remains worth computing (13 genuine leaves at depth 0; the
organism; a thin middle) as a health projection, not a gate.

### Rules and subagents follow — by projection, not by parallel taxonomy

The owner's closing hunch is confirmed with a mechanism. Rules already
carry one true axis (RULES_INDEX's always-on / trigger-loaded), which
is PDR-009's *activation* property and stays exactly where it is; the
KIND/STRATUM/INTENT concepts annotate rule canonicals the same way
(ADR-221 already names "the rules' names" as seed concepts). The
subagent estate's three-layer README (components / templates /
consumers) is a *format* architecture like PDR-051's and also stays;
families (cricket, quartet, experts, corpus stages) get the same
concept annotations. One concept scheme, three carrier corpora,
projections derived per corpus. RULES_INDEX and the composition map
become generated views — which also cures the composition map's
staleness (it currently omits proportionality, cricket,
coordination-fold, ticket-management, inter-practice-collaboration).

## Tensions the read surfaced (each becomes a plan work item)

1. `classification: active|passive` vocabulary collision — retire the
   field in favour of KIND; `commit`'s in-body sense is preserved by
   `standing-invariant`.
2. The stale composition map — regenerate as a derived projection;
   keep its two composition rules (summon-by-reference; modes are
   doors) as ratified doctrine, which the cycle analysis vindicated.
3. The proportionality/concept-exploration grounding inversions — lift
   the portable core of pr-lifecycle's state machine to a
   practice-stratum pattern; mark the seam in pr-lifecycle.
4. Cricket carries an experiment record (model-binding tally authority)
   inside a skill — re-home the experiment record beside the tally,
   leaving the skill the method + a pointer.
5. `under-the-hood` is sui generis (conversation-design/persona
   contract) — classify honestly as teaching-surface +
   instrument-of-thought hybrid rather than forcing it.
6. `chatgpt-report-normalisation` is vendor-bound, not repo-bound — a
   stratum test case: practice-instance procedure, vendor-scoped.

## Falsifiers for the scheme itself

- **Extensibility (the Parallax test)**: the owner's incoming
  cognitive-structure family must land as
  `instrument-of-thought` / `practice-instance` / `thinking` (or a
  clean hybrid) WITHOUT minting a new kind. A new top-level category
  needed for the first incoming family falsifies the kind axis.
- **Granularity**: if annotation finds more than ~20% of artifacts
  needing three or more kinds, the axis is wrong-grained — stop and
  re-cut rather than pile on hybrids.
- **Projection honesty**: if a derived index is hand-edited within a
  month of landing, the projection mechanism failed its purpose;
  the validator must reject hand edits, or the derived claim is
  theatre.
- **The two-graph invariant**: if a legitimate practice-stratum
  artifact is found that CANNOT state its doctrine without repo-bound
  grounding even after the pattern-lift cure is applied to it, the
  grounding direction law is too strong for skills and the finding
  routes back to PDR-134's falsifiability surface, not around it.

## Recommendation

Proceed as a delivery plan `serves: planning-and-intent-estate`
(concepts-first, per that node's own ratified ordering), owner-gated at
the vocabulary: mint KIND/INTENT as candidate concepts, adopt STRATUM
verbatim, annotate the skills corpus first (38 artifacts, this report's
per-skill classifications as the draft), then rules, then subagent
templates; derive the projections; land the ADR-221-seeded validators
only after the owner ratifies the annotated scheme
(visibility-before-validation). The pre-warmed Skills seat (Skylark
hunts Nimbus, registered and cold-paused 2026-08-02 for exactly this
lane) executes at the owner's word; the born-sketch plan is the lane
brief. The full per-skill inventory, the dependency graph with its SCC
analysis, and the doctrine quotes live in this session's two grounding
reads; the plan names what must be re-derived mechanically rather than
copied.

## Addendum — the owner's word demotes the verdict to a candidate (2026-08-02, same morning)

Owner, verbatim intent, on reading the direction of this work: a shared
scheme across all agentic levers is wanted "only if it adds value and
makes sense, and what that scheme should be is a matter for deep
reflection." Applied here, honestly: the Recommendation above
crystallised too early. What stands from this exploration is the
evidence (the corpus reads, the dependency graph, the two-graph
finding, the ratified machinery) — what demotes to CANDIDATE status is
the KIND/STRATUM/INTENT scheme itself and the assumption that one
scheme should span skills, rules, and subagents at all.

The reflection this word prompted has already moved the ground, and the
deep-reflection phase should start from these three tensions rather
than from the scheme above:

1. **The homonymy risk.** The levers differ in mode of action — a
   skill is SUMMONED (a method you enter), a rule BINDS (a stance
   always in force), a subagent is CONSULTED (a perspective you
   dispatch). "Instrument-of-thought" may name three different things
   at the three levers; a shared enum that ignores mode-of-action
   would be a category error wearing unification's clothes. The
   surveys' observation that "the same kinds recur" is evidence of a
   real underlying structure OR of one vocabulary stretched over three
   — the reflection must decide which.
2. **The concern-centric alternative.** The deeper candidate that
   emerged: perhaps the unifying object is not KIND but the CONCERN —
   one concept node whose manifestations across levers are edges.
   Worked trio: the verification concern manifests as
   `verify-dont-trust` (rule — the standing stance), `reason`'s
   warrant discipline (skill — the deliberate method), and the
   adversarial reviewers (subagents — the externalised perspective).
   Metacognition likewise: no-hedging/records-technical (stance),
   `metacognition` (method), cricket (perspective). Under this shape,
   kind vocabulary stays NATIVE per lever, stratum and intent remain
   shared (both already lever-independent, one already ratified), and
   the concept layer names each concern once and links its three
   manifestations. Navigability of concerns, not symmetry of labels.
3. **The metadata-theatre test.** A classification that drives no
   decision (routing, loading, portability packaging, discovery) is
   the theatre hypothesis applied to taxonomy. The value gate for ANY
   scheme: name the decisions the annotations will change, before
   annotating. The null hypothesis is three light per-corpus
   organisations (fix the composition map; RULES_INDEX and the
   subagent README already exist) — the shared scheme must beat that
   on named decisions, not on elegance.

The companion plan is re-shaped reflection-first accordingly; the
per-skill classifications above remain useful as EVIDENCE for the
reflection, whatever scheme survives it.
