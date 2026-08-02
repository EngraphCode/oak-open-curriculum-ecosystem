# WS0 recommendation — organisation of the agentic levers

Deep-reflection output of the skills-estate-organisation plan's WS0
(owner commission 2026-08-02; gate expires 2026-08-23). Authored
2026-08-02 at the Skills seat (Skylark hunts Nimbus, e856d5) from the
[WS0 working record](skills-estate-organisation-ws0-working-record.md),
which holds the full evidence trail, and REVISED the same day through
the movement-4 pre-review panel: an assumptions-expert review (initial
verdict NOT-READY, two factual defects in R1 — both confirmed
first-hand and repaired here), an Opus frame-challenger review
(HOLD-WITH-AMENDMENTS — six amendments, all absorbed or dispositioned
here), and an eight-leg cricket panel (7 ON-TRACK, 1 DRIFTING —
refuted on first-hand evidence; its redirections adopted). This
document is self-contained: the owner can rule from it alone.

**The commission (owner words, 2026-08-02; provenance: direct
in-session words inscribed in the plan at commit `8a760018d`, and the
Director-routed rulings in comms event `0875a858`):** a shared
organisation scheme across skills, rules, and subagents "only if it
adds value and makes sense... a matter for deep reflection"; simpler
"without compromising quality OR functionality"; "We should be working
towards a standardised structure"; the Parallax family serves
provision, quality demonstration, and advanced structure+metadata
"both as elements in a graph, and on the file system"; the
`cognition/` directory + family-bundle shape are the owner's
deliberate-but-challengeable prior.

## The recommendation in brief

Five elements plus three deliberate non-proposals. The evidence-derived
design law binding the scheme: **organisations decay and annotations
become theatre unless a mechanical consumer exists for them** —
first-hand instances: the hand-kept composition map went stale within
days and nothing noticed; the `classification:` frontmatter field has
zero readers in the entire pipeline. Where an element stands on other
grounds (R1's family bundles stand on your stated purpose, not on a
mechanical consumer), this document says so plainly rather than
manufacturing a consumer.

1. **R1 — The standard skills-corpus structure**: flat individual
   skills plus self-contained family bundles, both at the corpus
   root; **no category tier**. The emitted adapter tier stays flat
   and spec-conformant. Before/after trees and a convergence path for
   every current landing are below.
2. **R2 — A landing decision procedure** answering "where does a new
   capability land", built on the two questions that actually
   discriminate: payload shape and disclosure need.
3. **R3 — The relationship map, delivered as an authored report now**;
   the graph form is deliberately deferred to its second consumer.
4. **R4 — Stratum annotation** (PDR-134's four strata, verbatim),
   first pass scoped to the hybrid seams and the two known direction
   inversions, with its validator built in the same workstream.
5. **R5 — Retirements**: the dead `classification: active|passive`
   field retires; the interim landing guidance sunsets at the ruling.
   (The `--clear` data-loss hazard found during WS0 is deliberately
   NOT gated here — it is being cured immediately as independent
   work; see R5.)

**Deliberately NOT proposed**: a shared KIND vocabulary across levers;
a shared INTENT vocabulary; any new cross-lever taxonomy. Each lever's
native organisation (the skills three-layer composition vocabulary,
the rules always-on/trigger-loaded axis, the subagent format
architecture and ADR-135 roster taxonomy) stays native and untouched.
The reflection's honest headline: the estate already runs four working
per-corpus vocabularies, and the tested shared-label candidates drove
**zero** mechanical decisions at any lever — one label doing zero jobs
three times over is worse than no label. What spans the levers is a
decision procedure (R2), a delivered map (R3), and one
already-ratified axis (R4).

## Scored against "simpler" (the objective, not just the constraint)

Your commissioning sentence contains an objective (simpler) bounded by
a constraint (no loss of quality or functionality). Scored honestly,
this recommendation is **a net addition, not a net simplification**,
and it is put to you as that trade. It adds: a landing procedure, a
delivered relationship map, stratum annotation on a scoped set, one
validator check class, a three-part generator extension. It removes:
one dead frontmatter field, one hand-kept map (replaced by a derived
projection at WS4), one live data-loss hazard, and the current
unbounded landing ambiguity. Where it simplifies is the vocabulary
axis: nothing cross-lever is minted, so the estate's conceptual
surface stays at four native vocabularies instead of growing a fifth.
The justification for the net addition is your standardised-structure
direction plus the consumer-backed value in the table below — if that
trade reads wrong to you, the null-plus-retirements (R5 alone) is the
honest fallback, and the document says so rather than hiding it.

## R1 — The standard structure

**The standard**: under the canonical skills root, two shapes only —

```text
.agent/skills/
├── <skill-id>/SKILL-CANONICAL.md          # flat individual skill
└── <family-id>/                           # self-contained family bundle
    ├── skills/<skill-id>/SKILL-CANONICAL.md
    ├── reference/ ...                     # family-level siblings
    ├── evaluations/ ...
    └── tools/ ...
```

The bundle shape is the type specimen's own convention, stated as it
actually is (the pre-review caught an earlier draft omitting the
`skills/` tier): canonicals under `<family-id>/skills/<skill-id>/`,
with `reference/`, `evaluations/`, and `tools/` as named family-level
siblings. Individual skills never nest; families hold exactly this
shape — one `skills/` tier, no deeper. One level is a design choice,
argued as one: it is sufficient for the type specimen, keeps the
generator extension bounded, and deeper nesting has no candidate
content. (Spec clients scan deeper, so this is our choice, not an
external constraint.)

**The family test (mechanical, so two authors land the same way)**: a
bundle exists if and only if two or more skills share bundled files
that are not usable independently — a common reference corpus,
shared evaluations, shared tools. Parallax passes (nine skills, one
17-document reference corpus, shared graphs and evaluation suites). A
shared identity spine is supporting evidence; the `collection:`
frontmatter declaration is the required *marker* of a family, never
the test (a self-declaration cannot be its own criterion). The
borderline cases at the corpus root today all adjudicate to
individuals under this test — `start-right-quick`/`-thorough`/`-team`,
`ground-truth-design`/`-evaluation`, and the knowledge-metabolism
cluster share no bundled files — which is the test doing its job:
thematic kinship is not familyhood; it belongs to the map (R3).

**What family bundles stand on — stated honestly.** The pre-review
tested the draft's claim that family directories carry mechanical
consumers, and it did not survive: the estate's one live multi-skill
precedent (the Clerk family) vendors as eight FLAT sibling directories
with per-skill lock entries — the packaging unit is the individual
skill, and the pipeline actively flattens upstream structure; the
self-containment check could scope by the `collection:` marker; the
generator emits flat output either way, so nesting is a cost it
absorbs, not a decision it drives. Family bundles therefore stand on
**your stated purpose (c) — structure legible on the file system —
plus authoring legibility, plus the fact that the bundle is your own
landed layout**. Those are legitimate and sufficient grounds; they are
just not mechanical-consumer grounds, and this document does not
pretend otherwise. Once a bundle exists, the self-containment property
attaches to it: internal links point only downward or sideways within
the bundle, so it relocates without breakage — proven for Parallax
(144 links audited, zero up-traversal) and enforced by a new validator
check class (the audit found the link validator has no
self-containment class today).

**No category tier** (`cognition/` or any successor) — the one place
this challenges your prior, and only its first half. A category
directory drives no consumer decision anywhere in the pipeline
(verified: summon-routing reads descriptions, generation reads
name+description, validators read membership; the reviewers
independently re-verified and could not construct a counter-example).
The estate's own vendoring pipeline corroborates: the upstream Clerk
repository DOES use category directories (`skills/core/`,
`skills/frameworks/`) and our vendoring flattens them away — a
real-world instance of a category tier carrying no information across
a packaging boundary. As a filesystem taxonomy beside the ratified
concept layer it is also the parallel-taxonomy shape ADR-221 forbids.
Your own research corroborates: the Parallax meta-learning corpus,
lesson 3 — "standards-level packaging is flat... express composition
through artifacts."

The search was two-sided (the pre-review demanded this be recorded):
consumers one COULD build for a category tier were named and priced —
catalog grouping (keys on descriptions, not paths), category-scoped
eval suites (key on families/collections), loader scoping (does not
exist for skills) — none needs a directory to exist. **Human browsing
is a real consumer** and gets a named carrier: at today's scale (39
root entries) flat browsing works; the delivered map (R3) and WS4's
derived skills index (generated from name + description + collection +
stratum — fields that all exist under this recommendation) carry
thematic views. The category question legitimately re-opens if the
root grows to roughly double today's count or the derived index
demonstrably fails browsing — that condition is recorded here so the
rejection is a dated verdict, not a permanent dogma. Falsifier,
runnable today: name a mechanical consumer for a category tier and it
revives; keeping `cognition/` is also simply your call at the gate —
this is evidence against it, not a veto.

**Seams stay revisable (meta-learning lesson 8, your own research):**
the standard ratifies with its revision mechanism attached — family
seams split or merge on *measured* trigger confusion, and the
measurement instrument is the trigger-eval decision point below. A
structure standard over never-measured seams would otherwise be a
freeze dressed as a ratchet.

**Convergence path** (every landing, per your word that coexistence is
transitional):

1. Parallax relocates one level up — `cognition/parallax/` →
   `parallax/` — at the WS6 landing leg, after the gate ruling. The
   bundle's internal shape (its `skills/` tier and siblings) is
   untouched; the move is `git mv` of an intact, proven-relocatable
   bundle. Your content is never edited.

   ```text
   BEFORE  .agent/skills/cognition/parallax/skills/parallax-frame/...
   AFTER   .agent/skills/parallax/skills/parallax-frame/...
   ```

2. The adapter generator gains family support — **three changes, not
   one** (the pre-review sized this correctly): two-level discovery
   scoped to the bundle convention (`<family-id>/skills/<skill-id>/`),
   family-aware canonical paths in emitted adapter bodies, and
   refusal on duplicate leaf ids. **Corpus-wide leaf-id uniqueness
   becomes a stated invariant of the standard** with a validator
   check — the emitted namespace is flat, so two families holding the
   same leaf id would silently last-writer-win today. The extension
   lands in the same change as the first family's adapters. As landed
   today the family is generator-invisible and cannot be summoned in
   any harness; this is the change that makes it real at runtime.
   In the same change, a skipped directory becomes a **hard failure**:
   the generator currently reports skipped ids to stderr and exits 0,
   which is the exact mechanism that would have made a mis-scoped
   probe silent (`no-warning-toleration` applies).
3. Sif's two flat skills (PR #713, open at authoring — stated as what
   it is: one convention landed in the corpus, the second authored
   concurrently in review) are conformant as flat individuals when
   they land; nothing moves.
4. The interim landing guidance sunsets at the ruling, replaced by R2.
   (Its current homes, so the sunset is inspectable:
   the skills-estate thread record and the Director handoff record,
   both under `.agent/memory/operational/`.)
5. The rules and subagent corpora keep their current structures
   unchanged — their organisations are native, live, and consumed.

**Warrant**: the standard makes every landing decidable and the family
summonable. **Falsifiers, all runnable today**: the category-tier
consumer (naming); the family test (apply it to any two skills — grep
for shared bundled files); leaf-id uniqueness (one find command).
**Conservation**: no existing skill summons, description, or adapter
changes; the generator extension is additive; the family becomes MORE
functional (summonable at all), not less.

## R2 — The landing decision procedure

A short, binding decision procedure (doctrine, not frontmatter)
answering the question the estate currently answers by tacit
knowledge: **where does a new capability land?** The harm evidence,
stated precisely: two landing conventions were *authored
concurrently* this week (one landed in the corpus, one in review),
and the estate's existing cross-lever bindings (napkin, commit,
cricket) use three different ad-hoc mechanisms to pair a skill with a
rule.

The procedure's spine — rebuilt by the pre-review, which falsified the
draft's neater story — is **two questions, asked separately**:

1. **Payload shape**: is this a standing invariant small enough to
   afford in always-loaded context, or a multi-step procedure that is
   not? (RULES_INDEX today: 101 always-on rules, 22 trigger-loaded —
   so "rules are the always-loaded tier" is false for 22 live rules;
   the tier gloss does not survive contact with the corpus.)
2. **Disclosure need**: always in force / loaded on a trigger /
   consulted at dispatch?

The two questions cross: a trigger-loaded rule is invariant-shaped
content on a trigger; a skill is procedure-shaped content on a
trigger. The corpus's own hard case is the worked adjudication the
procedure ships with: `complex-merge` (skill) and
`pre-merge-divergence-analysis` (rule) fire on the SAME trigger — 100+
files changed or 10+ dry-run conflicts — and the discriminator that
decides them is payload shape: the rule carries the invariant (always
analyse before merging), the skill carries the procedure (how). The
`commit` and `napkin` skills — procedure-shaped content declaring
itself always-active — are the companion-pair pattern (skill + paired
rule), which the procedure names as a first-class landing instead of
today's three improvisations. The procedure then walks: individual or
family (R1's mechanical test)? Oak-authored or external (externals
vendor into the adapter tier under the lock, never into the canonical
corpus — the WS5(d) boundary, ADR-189's distribution axis read
inbound; worked instance: the skill-creator install landed exactly
this way at your card ruling today)?

**Warrant**: cures the named divergence with a consumer that runs at
every landing (the authoring decision itself). **Falsifier, runnable
at every landing**: divergence recurring after adoption. **What R2 no
longer claims**: that a disclosure-tier lens "dissolves" the
lever-homonymy question — the corpus falsifies the clean lever↔tier
mapping in both directions; the homonymy finding stands on its own
evidence (zero mechanical consumers for shared labels).
**Conservation**: purely additive doctrine.

## R3 — The relationship map (report now; graph at its second consumer)

**Delivered, as an authored report**
([the relationship map](skills-estate-organisation-relationship-map.md),
landed at the partial ruling 2026-08-02): the relationship map you
asked for — Parallax ↔ metacognition / reason / concept-exploration /
free-play / proportionality / plan — from the WS6(c) evidence already
gathered (headline edges: the orchestrator's depth selection ≈
proportionality's sizing gate; parallax-frame ≈ concept-exploration
movement 2 + free-play at a more formal grain; parallax-audit ≈ the
adversarial reviewer discipline; parallax-learn maps near-exactly onto
the napkin→distilled→patterns pipeline; nothing in the family is an
entered mode, so it fits the existing composition vocabulary without
strain). It is also the first thematic-browsing carrier for R1.

**The graph form is deliberately deferred** — the pre-review caught
the draft improvising it: a graph artifact needs a home, a stratum, a
persistent identifier scheme, and a W3C serialisation (PDR-134 §5,
ADR-221 §§3–4), and the estate's graph tier is ratified but unbuilt.
Minting a one-off graph now would improvise exactly the home PDR-134
names as a deferred class. So: the map report serves the first
consumer; the graph form is proposed separately, with home, stratum,
and serialisation named, when a second consumer arrives — the
estate's own consolidate-at-second-consumer rule applied to itself.
The reflection's rejection of the heavier alternative stands: per-file
concern frontmatter across ~40 skills, whose only reader would be map
generation, fails the theatre test.

**Warrant**: your standing relational query, served this week rather
than after a graph programme. **Falsifier**: if the map is never
re-queried after delivery, even the report was over-built — record
that and stop. **Conservation**: additive; the two ratified
composition rules (summon-by-reference, modes-are-doors) are preserved
as doctrine.

## R4 — Stratum annotation (scoped, consumer-first)

Adopt PDR-134's four strata verbatim — no new vocabulary. The
pre-review corrected the draft's scope and sequencing on the
document's own design law (the consumer must exist, not merely be
planned):

**First pass — scoped and consumer-paired**: annotate the HYBRID
SEAMS (the known case: pr-lifecycle's state machine is
practice-instance doctrine; its GitHub bestiary is repo-instance
craft) and the artifacts on the two known grounding-direction
inversions (verified live this session: proportionality cites
pr-lifecycle's state machine; concept-exploration cites pr-lifecycle
Phase 4), **with the direction check built in the same workstream** —
a file-reference-level check agent-tools can run today, no graph tier
required. The check proves itself on the two known positives, then
their WS5(a) cure lands, then it holds at zero.

**Corpus-wide annotation is explicitly gated** on that check existing
and on ADR-221 §7's composition ruling (the full graph-edge direction
law belongs to the graph tier, which is ratified but unbuilt — the
agent-tools check covers file references only, and says so). Cost,
stated so you can price it: full scope would be 38 flat + 9 family
skill canonicals, 119 rule canonicals, plus the subagent templates;
the first pass touches under a dozen files. Location cannot carry
stratum (hybrids split at section grain; the corpora are single-rooted
for the pipelines; the homing question is an authored judgement), so
authored frontmatter is the honest form — and PDR-134's no-quota rule
applies: integrity checks may gate, coverage never does.

**Warrant**: a self-proving consumer, built with its first
annotations. **Falsifier, runnable at WS4**: if the check derives
everything it needs without reading annotations, the pass stays at
the hybrid seams and goes no further. **Conservation**: frontmatter
keys are invisible to the generator (verified: only name+description
cross into adapters) — zero runtime effect.

## R5 — Retirements (and one hazard cured without waiting)

1. **`classification: active|passive` retires** across the skills
   corpus, on three independent grounds: zero mechanical consumers
   (verified against the whole pipeline); vocabulary collision (the
   commit skill's body argues it is "active, not passive" in a
   different sense — two vocabularies in one file); and the open
   Agent Skills specification homes custom fields under `metadata:`,
   where Parallax already correctly puts its own. Falsifier, runnable
   today: a grep for any reader of the field.
2. **The `--clear` lock-blind hazard is cured as INDEPENDENT work,
   not gated here.** The finding: the adapter generator's `--clear`
   removes every directory under both adapter roots including the
   ten lock-pinned vendored externals; generation never re-creates
   them, so loss is git-only recoverable; and the generator reports
   skipped directories to stderr while exiting 0 (a false-green at
   the same seam). A live data-loss path in committed code has no
   dependency on an organisation ruling — holding it behind the
   2026-08-23 gate would leave it armed for three weeks for no
   reason. It is routed as an immediate cure PR from this lane
   (ship-independent, coordinate-dependent); this document records
   it so the ruling context is complete, not to ask permission.
3. **The interim landing guidance sunsets** at the gate ruling,
   superseded by R2.

## Scored against the null (the value gate)

The null hypothesis — keep the (repaired) per-corpus organisations and
add nothing — was the benchmark throughout, and half of it stands: the
recommendation IS the null on the vocabulary axis. Your
standardised-structure word retired the null's structure half. What
the recommendation adds beyond the null, decision by decision (every
count in this table re-derived at revision time, 2026-08-02):

| Decision | Today | Under this recommendation |
| --- | --- | --- |
| Where does a new capability land? | Tacit knowledge; two conventions authored concurrently this week | R2 procedure, checked at every landing |
| Can a family be summoned? | No — nested families are generator-invisible; skipped dirs exit 0 | R1 step 2: three-part generator extension + hard-fail, adapters emitted |
| Is a bundle relocatable? | Unchecked (validator has no such class) | R1 self-containment check class |
| Can two families collide? | Silently (flat emitted namespace, no uniqueness check) | Leaf-id uniqueness invariant + check |
| How do new skills relate to old? | Whole-corpus reads; your question is unanswerable mechanically | R3 map, delivered now |
| Does a reference cross strata legally? | Unchecked; two known inversions | R4 scoped check, self-proving, built with its annotations |
| Skill summon-routing | Description-driven — and UNMEASURED (see decision point 5) | Conserved; the measurement question is put to you, not buried |
| Rule loading | always-on / trigger-loaded axis (101/22 today) | Unchanged (conserved) |
| Subagent dispatch | Work-substance matrices | Unchanged (conserved) |
| Vendored externals | Lock-pinned (ten today, skill-creator landed at your card) but `--clear`-vulnerable | Conserved AND the hazard cured independently (R5) |

## Relations to adjacent ratified ground

- **ADR-221**: instantiated, not rivalled — R4 is a concept-layer
  move; the one candidate parallel taxonomy (category directories) is
  rejected; R3's graph form explicitly waits for the graph tier
  rather than improvising beside it.
- **ADR-189**: orthogonal-compose — everything here organises the
  interior of its repo-working partition; no WS0 vocabulary crosses
  the audience seam; WS5(d)'s external boundary cites ADR-189's
  distribution axis.
- **PDR-009/051**: honoured — the canonical/emitted distinction is
  load-bearing in R1; no activation concern enters canonical-layer
  vocabulary.
- **PDR-134**: R4 adopts it verbatim; R3 obeys its deferred-home-class
  discipline.

**Adjacent plan surfaces, dispositioned** (all read first-hand; each
keeps its ground with a named boundary): `skills-classification-
taxonomy` (audience-led naming across ADR-189's outer partitions —
no interior overlap); `agent-skills-discovery` (outward publication;
promotion evidence strengthening: ~40 adopting clients, live registry
— recorded there at promotion); `agent-classification-taxonomy`
(ADR-135 — the subagent lever's native vocabulary home, exactly where
"native kinds stay native" points); `agent-skills-detailed-scan`
(landed today at your card — external-ecosystem scanning, feeds
WS5(d)/discovery, no structural overlap with this ruling).

**Harvest carried forward, not dropped** (the pre-review caught these
missing): the WS6(b) reverse-direction finds — the Parallax audit's
independence classes (sharper than our reviewer-independence
vocabulary) and parallax-learn's dispositions (near-exact match to
the PDR-014 pipeline) — are named WS6(d) integration candidates;
`skills-ref validate` (the ecosystem's reference validator) is the
wrap-candidate for frontmatter conformance checks, while the
self-containment class stays hand-authored (no ecosystem tool checks
relocatability).

## What would change this verdict

- A named mechanical consumer for a category tier → revives it (R1);
  so does the corpus roughly doubling or the derived index failing
  browsing (recorded re-open conditions).
- A homonymy-free cross-lever navigation consumer, actually built →
  revives shared KIND/INTENT as derived-navigation inputs.
- The direction check deriving everything without annotations → R4
  stays at the hybrid seams.
- The map going unqueried after delivery → R3 stops at the report.
- Landing divergence recurring under R2 → the procedure is wrong;
  re-open with the divergence as evidence.

## The owner's decision points

1. **Rule on the standard structure** (R1) — family bundles yes
   (grounded in your purpose and layout, stated honestly), category
   tier no (evidence against, with recorded re-open conditions).
   Keeping `cognition/` is a legitimate ruling; the recommendation
   then asks only that its status be recorded.
2. **Rule on R2–R4** — each independently acceptable or rejectable.
   R3 and R4 no longer share unbuilt machinery: R3 delivers a
   report; R4 builds its own scoped check.
3. **Confirm the retirements** (R5.1, R5.3) — the `--clear` cure
   proceeds independently regardless.
4. **The description corpus and trigger evaluation — a real decision,
   not a footnote.** Your stated purpose (b) is skill QUALITY, and
   the estate's highest-traffic organisation consumer is the
   description corpus: it alone decides which skill fires, it is
   entirely unmeasured (zero evals across oak-*; Parallax ships
   per-skill evals plus seven collection suites; 37 oak-* skills
   lack use_this_when-grade descriptions), and it is a priced context
   surface (~100 tokens × ~240 loaded adapter descriptions ≈ 24k
   tokens across surfaces). This recommendation deliberately does not
   absorb that work — it is quality engineering, not organisation —
   but it must not pass unseen: the named carrier is the queued
   skill-evals-pilot plan, which now has its instrument (the
   installed skill-creator eval loop + the ecosystem's eval
   methodology), and the natural trigger is this same gate ruling.
   R1's seam-revision clause and the summon-routing conservation row
   both depend on this measurement existing eventually; until it
   does, "the skills got better" cannot be answered mechanically.
5. **Sequencing after the ruling** stays as planned — WS6 landing
   legs, then the scoped R4 pass (annotation + check in one
   workstream, the WS2 PR as the visible-surface gate), then the
   remaining WS4 projections — visibility before validation
   throughout.
