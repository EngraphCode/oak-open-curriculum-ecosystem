# WS0 recommendation — organisation of the agentic levers

Deep-reflection output of the skills-estate-organisation plan's WS0
(owner commission 2026-08-02; gate expires 2026-08-23). Authored
2026-08-02 at the Skills seat (Skylark hunts Nimbus, e856d5) from the
[WS0 working record](skills-estate-organisation-ws0-working-record.md),
which holds the full evidence trail. This document is self-contained:
the owner can rule from it alone.

**The commission (owner words, 2026-08-02):** a shared organisation
scheme across skills, rules, and subagents "only if it adds value and
makes sense... a matter for deep reflection"; simpler "without
compromising quality OR functionality"; "We should be working towards a
standardised structure"; the Parallax family serves provision, quality
demonstration, and advanced structure+metadata "both as elements in a
graph, and on the file system"; the `cognition/` directory +
family-bundle shape are the owner's deliberate-but-challengeable prior.

## The recommendation in brief

Five elements, each landing WITH the mechanism that reads it — plus
three deliberate non-proposals. The evidence-derived design law binding
all five: **organisations decay and annotations become theatre unless a
mechanical consumer lands in the same motion** (first-hand instances:
the hand-kept composition map went stale within days and nothing
noticed; the `classification:` frontmatter field has zero readers in
the entire pipeline).

1. **R1 — The standard skills-corpus structure**: flat individual
   skills plus self-contained family bundles, both at the corpus root;
   **no category tier**. The emitted adapter tier stays flat and
   spec-conformant. A convergence path is named for every current
   landing.
2. **R2 — A landing decision procedure** (where does a new capability
   land: rule, skill, subagent, companion pair, family, vendored
   external) — the cure for the live two-conventions divergence.
3. **R3 — One curated relations graph** with a rendered map as its
   projection; its first delivery is the relationship map the owner
   asked for (Parallax ↔ metacognition, reason, concept-exploration,
   free-play, proportionality, plan).
4. **R4 — Stratum annotation** (PDR-134's four strata, verbatim; no
   new vocabulary) on the lever corpora, consumed by the
   grounding-direction validator and portability packaging.
5. **R5 — Retirements**: the dead `classification: active|passive`
   frontmatter field retires; the `--clear` lock-blind hazard in the
   adapter generator is cured; the interim landing guidance sunsets at
   the ruling.

**Deliberately NOT proposed** (the value gate said no): a shared KIND
vocabulary across levers; a shared INTENT vocabulary; any new
cross-lever taxonomy. Each lever's native organisation (the skills
three-layer composition vocabulary, the rules always-on/trigger-loaded
axis, the subagent format architecture and ADR-135 roster taxonomy)
stays native and untouched. The reflection's honest headline: the
estate already runs four working per-corpus vocabularies, and the
tested shared-label candidates drove **zero** mechanical decisions at
any lever — one label doing zero jobs three times over is worse than
no label. What spans the levers is not a taxonomy but a decision
procedure (R2), a graph (R3), and one already-ratified axis (R4).

## R1 — The standard structure

**The standard**: under the canonical skills root, two shapes only —

- `<skill-id>/SKILL-CANONICAL.md` — a flat individual skill (today's
  dominant convention; Sif's two new skills landed this way);
- `<family-id>/<skill-id>/SKILL-CANONICAL.md` — a self-contained
  family bundle, for genuine families only: skills sharing an identity
  spine, a common reference corpus, and a `collection:` declaration
  (Parallax is the type specimen: nine skills, one identity spine, a
  17-document reference corpus, 8 relation graphs).

Family bundles are **self-contained**: internal links point only
downward or sideways within the bundle (no `../` escapes), so the
bundle relocates without breakage — a property Parallax already has
(proven: 144 links audited, zero up-traversal) and a new validator
check class enforces (the audit found the link validator has no
self-containment class today).

**No category tier** (`cognition/` or any successor). This is the one
place the recommendation challenges the owner's prior, and only its
first half. The test that every candidate faced: what mechanical
decision does it drive? A family directory drives three — the
packaging/vendoring unit, the self-containment validator's scope, and
the generator's family grouping — and gives the owner's "structure on
the file system" purpose a real carrier. A category directory drives
none: summon-routing reads descriptions, generation reads
name+description, validators read membership, and no consumer anywhere
reads a category path. It would be classification-as-directory — the
same shape as the dead `classification:` field — and a second, rival
taxonomy beside the ratified concept layer (the exact move ADR-221
forbids). Thematic views belong to the graph and the generated
indexes, where they can be derived, regenerated, and never go stale.
The owner's own research corroborates: the Parallax meta-learning
corpus, lesson 3 — "standards-level packaging is flat... package a
flat federation; express composition through artifacts."

**Why family bundles survive that same test** (and the lesson-3
tension dissolves): lesson 3 binds the *packaged* form, and the
packaged form stays flat — the adapter generator already emits flat
`oak-<id>` directories, and vendored externals land flat in the
adapter tier. The canonical tier is an authoring surface, not a
package; bundling genuine families there costs the packaged form
nothing and keeps the family legible where the owner asked for it.

**Convergence path** (every landing, per the owner's word that
coexistence is transitional):

1. Parallax relocates one level up — from `cognition/parallax/` to
   `parallax/` — at the WS6 landing leg, after the gate ruling. The
   move is mechanically safe (the bundle is self-contained; nothing
   external links into it; adapters do not exist yet). Owner content
   is never edited — the move is `git mv` of an intact bundle.
2. The adapter generator gains family support (one bounded extension:
   a directory without a root canonical is probed one level deeper),
   landing in the same change as the first family's adapters — the
   consumer arriving with the structure. As landed today the family is
   generator-invisible and cannot be summoned in any harness; this is
   the change that makes the family real at runtime.
3. Sif's two flat skills are already conformant; nothing moves.
4. Individual skills never nest; families never nest deeper than one
   level (spec clients bound scan depth; one level is sufficient for
   the type specimen and keeps the generator extension bounded).
5. The interim landing guidance (flat individuals; families hold)
   sunsets at the ruling, replaced by R2.
6. The rules and subagent corpora keep their current structures
   unchanged — their organisations are native, live, and consumed;
   restructuring them has no consumer and fails the value gate.

**Warrant**: every structural element carries a named consumer.
**Falsifier**: a mechanical consumer for a category tier, named before
the gate, revives it — and the prior is the owner's to keep
regardless; this is evidence against `cognition/`, not a veto.
**Conservation**: no existing skill summons, description, or adapter
changes; the generator extension is additive; the family becomes MORE
functional (summonable at all), not less.

## R2 — The landing decision procedure

A short, binding decision procedure (doctrine, not frontmatter)
answering the question the estate currently answers by tacit
knowledge: **where does a new capability land?** The week's live
evidence: two landing conventions ran concurrently; the estate's
existing cross-lever bindings (napkin, commit, cricket) use three
different ad-hoc mechanisms to pair a skill with an always-on rule.

The procedure's spine is the disclosure-tier observation from the
reflection: the three levers are one capability corpus at three
disclosure tiers — a rule is the always-loaded tier, a skill is the
loaded-on-match tier, a subagent is the consulted-at-dispatch tier.
Choosing a lever IS choosing a disclosure tier, which is why a shared
kind vocabulary kept answering no real question. The procedure walks:
which tier does the capability need (always / on-match / at-dispatch)?
Does it need a companion at another tier (the skill+rule pairs, named
as a first-class pattern instead of three improvisations)? Individual
or family (the family test above)? Oak-authored or external (externals
vendor into the adapter tier under the lock, never into the canonical
corpus — the WS5(d) boundary, which is ADR-189's distribution axis
read inbound)?

**Warrant**: cures the named divergence harm with a consumer that runs
at every landing (the authoring decision itself). **Falsifier**:
landing divergence recurring after adoption. **Conservation**: purely
additive doctrine; no existing artifact moves or changes meaning.

## R3 — The relations graph and the relationship map

One curated relations-graph artifact (stack-neutral serialisation, per
PDR-134's carrier rules) holding typed edges between capabilities —
overlap, summons, companion-pairing, grounding direction — with a
rendered map generated from it. The graph is the authored source; the
map is a derived projection that cannot go stale independently (the
fate of the hand-kept composition map, whose staleness nobody noticed,
is the design input here).

The reflection deliberately REJECTED the heavier alternative:
per-file concern frontmatter across ~40 skills, whose only reader
would be the same map generator. One authored graph serves the same
consumers at a fraction of the maintenance surface, and matches both
the owner's "elements in a graph" purpose and the Parallax family's
own demonstrated pattern (8 relation graphs as first-class reference
artifacts).

**First delivery**: the relationship map the owner asked for —
Parallax ↔ metacognition / reason / concept-exploration / free-play /
proportionality / plan — seeded from the WS6(c) evidence already in
the working record (headline edges: the orchestrator's depth selection
≈ proportionality's sizing gate; parallax-frame ≈ concept-exploration
movement 2 + free-play at a more formal grain; parallax-audit ≈ the
adversarial reviewer discipline; parallax-learn maps near-exactly onto
the napkin→distilled→patterns pipeline; nothing in the family is an
entered mode, so it fits the existing composition vocabulary without
strain).

**Warrant**: a standing owner query plus the naming of live but
improvised cross-lever bindings. **Falsifier**: if the map is never
re-queried or regenerated after first delivery, the maintained-graph
form was over-built — fold it to a static report section and record
that. **Conservation**: additive; the two ratified composition rules
(summon-by-reference, modes-are-doors) are preserved as doctrine and
cited by the graph, not replaced by it.

## R4 — Stratum annotation (the one shared axis, already ratified)

Adopt PDR-134's four strata verbatim — ontology / practice-instance /
repo-instance / operator-overlay — as authored frontmatter on lever
canonicals, with section-seam marks where one artifact genuinely
splits (the known case: pr-lifecycle's state machine is
practice-instance doctrine; its GitHub bestiary is repo-instance
craft). No new vocabulary is minted; this is annotation with an
already-ratified scheme.

The reflection tested the cheaper alternative — derive stratum from
location instead of annotating — and it fails in principle: the
corpora are deliberately single-rooted for the adapter and loader
pipelines, hybrids split strata at section grain (a path cannot carry
a section seam), and the homing question is an authored judgement
(PDR-134 forbids authoring derivable values; stratum is not
derivable). Adjacent evidence that location does not carry stratum
today: an operator-overlay rule (`oak-chrome-session-is-metered`)
lives in the public rules corpus beside practice-instance rules.

**Consumers, both named in the plan**: the grounding-direction
validator (WS4), which must find the two known direction inversions
before their cures land and zero after — the validator proving itself
on known positives; and portability packaging (practice-core export),
which becomes legible without a separate portability flag. Per
PDR-134: integrity checks may gate; coverage is never quota'd.

**Warrant**: two consumers, one of them self-proving. **Falsifier**:
if the direction check can be built without reading the annotations
(deriving everything it needs), the annotation pass shrinks to the
hybrid seams only. **Conservation**: frontmatter keys are invisible to
the generator (verified first-hand: only name+description cross into
adapters) — zero runtime effect.

## R5 — Retirements and cures

1. **`classification: active|passive` retires** across the skills
   corpus, on three independent grounds: zero mechanical consumers
   (verified against the whole pipeline); vocabulary collision (the
   commit skill's body argues it is "active, not passive" in a
   different sense — two vocabularies in one file); and the open Agent
   Skills specification homes custom fields under `metadata:`, where
   Parallax already correctly puts its own. Its honest content is
   carried by the levers themselves (an always-on rule IS the standing
   invariant).
2. **The `--clear` lock-blind hazard is cured**: the adapter
   generator's `--clear` currently removes every directory under both
   adapter roots including the nine lock-pinned vendored externals
   (79 tracked files) — generation and vendoring are separate
   pipelines meeting in one directory, and only a manual invocation
   stands between them today. Cure: clear honours the lock (skip
   locked ids or refuse while locked entries exist). This is the
   owner's conservation word made mechanical at the exact seam where
   the reflection found it latent.
3. **The interim landing guidance sunsets** at the gate ruling,
   superseded by R2 — it was always transitional and says so.

## Scored against the null (the value gate)

The null hypothesis — keep the (repaired) per-corpus organisations and
add nothing — was the benchmark throughout, and half of it stands: the
recommendation IS the null on the vocabulary axis (native vocabularies
kept, nothing cross-lever minted). The owner's standardised-structure
word retired the null's structure half. What the recommendation adds
beyond the null, decision by decision:

| Decision | Today | Under this recommendation |
| --- | --- | --- |
| Where does a new capability land? | Tacit knowledge; two conventions ran concurrently this week | R2 procedure, checked at every landing |
| Can a family be summoned? | No — nested families are generator-invisible | R1 step 2: generator family support, adapters emitted |
| Is a bundle relocatable? | Unchecked (validator has no such class) | R1 self-containment check class |
| How do new skills relate to old? | Whole-corpus reads; the owner's question is unanswerable mechanically | R3 graph + rendered map |
| Does a reference cross strata legally? | Unchecked; two known inversions | R4 + WS4 direction validator |
| Skill summon-routing | Description-driven | Unchanged (conserved) |
| Rule loading | always-on / trigger-loaded axis | Unchanged (conserved) |
| Subagent dispatch | Work-substance matrices | Unchanged (conserved) |
| Vendored externals | Lock-pinned but `--clear`-vulnerable | Conserved AND the hazard cured (R5) |

## Relations to adjacent ratified ground

- **ADR-221 (concept scheme)**: instantiated, not rivalled — R3 and
  R4 are concept-layer moves (annotations and authored relations with
  derived projections); no parallel taxonomy is created, and the one
  candidate parallel taxonomy in the space (category directories) is
  explicitly rejected.
- **ADR-189 (audience-led capability taxonomy)**: orthogonal-compose.
  ADR-189 partitions the outer capability estate by audience ×
  distribution; everything here organises the interior of its
  repo-working partition. No WS0 vocabulary crosses the audience seam
  (teacher-facing surfaces never see any of this), and the WS5(d)
  external-skill boundary cites ADR-189's distribution axis rather
  than standing alone.
- **PDR-009/051 (canonical-first, kind vs activation)**: honoured —
  the canonical/emitted distinction is load-bearing in R1, and no
  activation concern enters any canonical-layer vocabulary.
- **PDR-134 (strata and concept layer)**: R4 adopts it verbatim; R3
  obeys its carrier split (authored graph, derived projections,
  direction law on edges).

**Adjacent plan surfaces, dispositioned** (all three read first-hand;
none is superseded, each keeps its ground with a named boundary):

1. `skills-classification-taxonomy.plan.md` (discovery/future) — owns
   the audience-led NAMING work across ADR-189's outer partitions
   (noun discipline, terminology audit). Boundary: it names categories
   for audiences; WS0 organises artifacts within the repo-working
   partition. No overlap once stated; both cite ADR-189.
2. `agent-skills-discovery.plan.md` (discovery/future) — owns outward
   publication of teacher/partner-facing skills and a discovery
   index. Boundary: distributable locus only. One pointer worth
   recording there at its promotion: the four-source pass confirmed
   the Agent Skills standard now has ~40 adopting clients and a live
   registry ecosystem — its promotion-trigger evidence is
   strengthening.
3. `agent-classification-taxonomy.plan.md` (agent-tooling/future,
   ADR-135) — owns the subagent roster's own native taxonomy.
   Boundary: exactly the "native kinds stay native" verdict; that
   plan is where subagent vocabulary evolves.

## What would change this verdict

- A named mechanical consumer for a category tier → revives the
  category directory (R1).
- A homonymy-free cross-lever navigation consumer, actually built →
  revives shared KIND/INTENT as derived-navigation inputs (the drop
  is recorded with this exact revival condition).
- The direction validator proving derivable without annotations →
  shrinks R4 to hybrid seams only.
- The relations map going unqueried after delivery → folds R3 to a
  static section.
- Landing divergence recurring under R2 → the procedure is wrong or
  under-specified; re-open with the divergence as evidence.

**Unresolved evidence, named**: (a) the skills corpus has no
collection-level trigger-evaluation suite (the description corpus is
the live routing surface and is unmeasured; Parallax ships per-skill
evals, the oak-* corpus ships none — the queued skill-evals-pilot plan
now has its instrument, and the 37-description backfill remains
routing engineering, unstaffed); (b) the F01–F21 coverage-scan gap
found by the WS6(b) review is family content — the owner's to take or
leave; (c) corpus counts are derivation-anchored (the corpus moved
twice during WS0) — every executing workstream re-derives at execution
time.

## The owner's decision points

1. **Rule on the standard structure** (R1) — including the one
   challenged half of the prior: family bundles yes (evidence
   supports), category tier no (evidence against). Keeping
   `cognition/` is a legitimate owner ruling; the recommendation then
   asks only that a consumer for it be named or its decorative status
   recorded.
2. **Rule on the scheme elements** R2–R4 (procedure, graph, stratum
   annotation) — each independently acceptable or rejectable; none
   depends on another, though R3 and R4 share the concept-layer
   machinery.
3. **Confirm the retirements** (R5) — the classification field, the
   `--clear` cure's shape, the guidance sunset.
4. **Sequencing after the ruling** stays as planned: WS6 landing legs
   (Parallax move + generator family support + validator class),
   then WS2/WS3 annotation (WS2's PR is the visible-surface owner
   gate), then WS4 validators — visibility before validation
   throughout.
