# NEO Curriculum Vault: value proposition, mechanics, and intent

- **Date:** 2026-07-14
- **Public site:** [curriculum.nudgeeducation.online](https://curriculum.nudgeeducation.online/)

## Executive summary

The NEO Curriculum Vault is best understood as a public curriculum translation graph. Its
distinctive move is to give four things separate identities and then relate them: what NEO holds
is worth learning, how awarding bodies assess some of it, what evidence a learner produces, and
how the same activity is made legible to learners, practitioners, families, commissioners, and
machines.

The architecture — Curriculum × Overlay — makes canonical curriculum nodes primary and
qualification specifications secondary. Overlays link back to the canonical learning they test,
so many qualifications can point at the same learning and valuable learning can exist with no
qualification at all. This is a genuine conceptual contribution: it stops examination
specifications becoming the de facto definition of the curriculum, without denying that learners
still need qualifications and commissioners still need traceability.

The public artefact is more than a design. It is a live site with 99 canonical outcomes and 49
overlay outcomes, a densely resolved mapping between them, a KS3–KS4 precursor network, and a
small working interoperability exemplar using Oak's National Curriculum identifiers. The
learner-evidence and portfolio flow, by contrast, is defined in the schema but not built. The
proportionate verdict is a credible editorial graph and a strong prototype of a
curriculum-assessment translation layer — not yet a normalised knowledge graph or an end-to-end
evidence system.

NEO's differentiated value is not the curriculum content itself, much of which originates in
public curricula and awarding-body specifications, but the integration it performs:
relationship-first alternative provision, plural qualification routes, learning broader than any
exam, and commissioner-facing legibility, all made inspectable. For Oak, the bounded conclusion
is that NEO is already a real external consumer of Oak's curriculum identifiers — valuable to
Oak's adoption learning and to its taxonomy and cross-source demand tests — not a graph for Oak
to ingest or a source to endorse.

## 1. What the vault is, and the problem it solves

The vault is not simply a curriculum website, a qualification catalogue, or a curriculum map.
Its centre of gravity is a translation function: preserving educational meaning while letting
that meaning be read through the different vocabularies of an exam board, a teacher, a learner,
a commissioner, or a machine. The claim underneath is that assessment is a view onto learning,
not its definition, and the architecture operationalises that by making the curriculum side
canonical and the assessment side optional and many-to-one.

It addresses four problems that recur in multi-board alternative provision. Organising teaching
around separate specification documents lets what is assessable crowd out what is valuable, and
the canonical spine resists this. NEO's offer is broader than any National Curriculum or
exam-board view, so life-and-work, relational, and statutory learning are given canonical status
rather than treated as derivatives of the NC. Different audiences need different routes into the
same content, met by one connected estate rather than a separate estate for each. And evidence
loses meaning when detached from what was learned, so the intended flow lets a piece of work
carry both the learning it demonstrates and the qualification it counts toward.

## 2. How it works

The vault is an Obsidian-compatible Markdown corpus published with Quartz to GitHub Pages, which
keeps authoring cheap and the graph inspectable without a bespoke platform. Canonical nodes
carry a NEO-authored statement of the learning plus structured fields — curriculum branch,
Cornerstone, delivery mode, SEND and OEAS relevance, mastery applicability, and optional Oak
National Curriculum references. Overlay nodes keep the awarding-body identity and outcome code
and link, under "Tests canonical", to the learning they assess. The canonical node is the pivot:
two overlay outcomes need not claim exact equivalence to be navigable from the same learning,
which is more robust than flattening every board into one synthetic scheme.

The model is materially instantiated, not merely diagrammed. The corpus resolves 94 distinct
overlay-to-canonical mapping pairs, with 47 of the 49 overlay nodes mapped; 52 KS3–KS4 precursor
links; and all but one of its 253 pages fall into a single connected component. Only 41 of the
99 canonical nodes yet carry an overlay, which is consistent with a curriculum deliberately
broader than its qualification coverage. What is not built is the evidence lifecycle: the schema
defines how a planning selection would flow into an assignment, a learner artefact, a mastery
judgement, and an exported, attributable bundle, but the repository contains no evidence records,
no portfolio, and no consumer of that flow.

## 3. Built, partial, and prospective

Three altitudes should be kept apart. **Built:** the public vault and live site, the
Curriculum × Overlay model, 99 canonical and 49 overlay outcomes, the resolved mapping and
precursor network, and seven Oak identifier references across four KS3 English pages.
**Partial:** coverage is uneven — all 99 canonical nodes carry curriculum, mode, mastery-scale
and SEND metadata and 95 carry a Cornerstone, but only 59 offer suggested evidence, 32 carry
mastery descriptors, and 21 the full four-level mastery set, and some subjects are rich overview
pages rather than normalised outcomes. **Prospective:** the entire evidence-and-portfolio flow,
automated commissioner packs, and machine-readable export. Until one complete evidence path
exists, the proven value is editorial, navigational, and conceptual.

## 4. The value NEO provides

Public artefacts establish what NEO has built and offered; they cannot, without outcome or usage
data, establish whether learners benefit, whether practitioners plan from the vault, or whether
commissioners rely on it. Read against that ceiling, the value claims stand as follows.

| Value claim | Publicly observed | Evidence ceiling |
| --- | --- | --- |
| Relationship-first, trauma-informed, neurodivergent-affirming online alternative provision with a named practitioner and several modes. | Live policy and curriculum site define this operating model consistently. | Offered and documented; not independently outcome-verified. |
| Learners can follow or combine academic, Functional Skills, ASDAN, life-and-work, and NEO-original routes. | The site exposes these routes; the vault holds their curriculum and overlay branches. | Offer and content structure verified; actual uptake and switching not. |
| The curriculum is broader than examination specifications. | Life-and-work, relational, Cornerstones, RSHE, and need/pathway content exist as first-class branches. | Editorial proposition verified; curriculum impact not. |
| The same learning relates to several assessment regimes. | Resolved overlay-to-canonical links exist across IGCSE, GCSE, and Functional Skills nodes. | Mapping mechanism verified; semantic correctness only partly assured. |
| Families, practitioners, and commissioners can inspect the offer. | The public site is live, searchable, linked, and navigable by curriculum, overlay, pathway, and need. | Public legibility verified; audience comprehension and use not. |
| Learner evidence will remain portable and meaningful across pathways. | The schema defines canonical–overlay–mastery triples and export views. | Prospective architecture only; no public end-to-end consumer demonstrated. |
| NEO interoperates with Oak curriculum data. | Seven `natcurric:` references on four KS3 English pages resolve against Oak Ontology v0.1.3. | Identifier-existence proof; semantic fit and operational reuse open. |

The distinctive value is contextual integration rather than novel subject matter: a relational
wrapper around education, with safety and a named practitioner before a timetable; pathway
plurality without curricular fragmentation; legitimacy for learning broader than exams;
translation of the same learning into learner, teaching, awarding-body, and commissioner
vocabularies; and public inspectability. For commissioners specifically, overlay mappings
combined with SEND, Preparing-for-Adulthood, and OEAS metadata can show which formal outcomes a
programme covers without making the specification the only curriculum view — a strong
proposition for alternative provision, contingent on mapping coverage and provenance.

The interoperability strand is the cheapest and most concrete. Four KS3 English pages carry
seven Oak National Curriculum references, and all seven resolve against the pinned Oak release.
That proves the identifiers exist and are usable from outside Oak — an interoperability seam —
but not that each is the right phase or granularity; semantic fit remains a human judgement.

## 5. NEO and Oak: adjacent roles

The two organisations occupy adjacent, largely non-overlapping roles, and keeping them distinct
is what protects each one's authority.

| Concern | Oak's role | NEO's role | Boundary that must stay visible |
| --- | --- | --- | --- |
| NC vocabulary | Publish an open, versioned, machine-readable representation with persistent identifiers and provenance. | Reference Oak's `natcurric:` identifiers where a canonical node genuinely corresponds. | Oak's representation is not the official DfE publication; NEO's mapping is not Oak validation of NEO's curriculum. |
| Teaching programmes and resources | Model and expose Oak programmes, units, lessons, and threads. | Select or link teaching resources suited to NEO's learners and delivery model. | An NC correspondence does not create a direct edge to a particular Oak lesson. |
| Local curriculum intent | No ownership role; may offer reusable primitives. | Own meaning, granularity, pedagogy, and governance of NEO canonical nodes, including content beyond the NC. | NEO-original branches must not be forced into Oak's NC namespace. |
| Qualification assessment | Hold programme structure where relevant; does not own awarding-body specs. | Own the local canonical-to-overlay mapping and its source confidence. | NEO mappings must not silently become Oak or awarding-body authority. |
| Learner evidence | Potentially supply curriculum identifiers and open resources. | Own evidence semantics, consent, safeguarding, mastery, and reporting. | No learner-data exchange is required for ontology or mapping collaboration. |
| Graph serving | Provide deterministic, provenance-preserving, bounded graph and search surfaces. | Act as a real consumer and judge whether those surfaces answer authoring questions. | Deterministic data surfaces must not decide learner relevance; that stays with the user and NEO. |

NEO has already walked the external-adoption path. It pinned Oak ontology release v0.1.3, used
the public identifiers in a separate product, and ships a validator that resolves all seven
references cleanly — stronger evidence than a hypothetical adopter. This does not, by itself,
justify every Oak initiative: the strategic adoption brief still needs a chosen scenario and a
support boundary, and the taxonomy-traversal and cross-source-journey plans remain demand-gated
(the relevant Oak planning documents are internal context, not public evidence). The clean way
to state the relationship is a chain — DfE statutory sources feed Oak's machine-readable NC
representation, which NEO's canonical nodes reference, which NEO's overlays extend, ahead of
prospective NEO evidence — with Oak's own programmes on a separate branch, discoverable rather
than automatically equivalent. That separation lets NEO test whether Oak's identifiers work
outside Oak without either party absorbing the other's model.

## 6. Mutual-support opportunities

The tempting move — integrate the two graphs — is the wrong first step. The useful relationship
begins with consumer feedback, semantic review, and release compatibility, under NEO's own
authority, using artefacts that already exist. Several things should explicitly not happen yet:
Oak should not ingest the NEO vault as authoritative curriculum, exchange learner records
(synthetic data answers every question now visible), let reference resolution imply endorsement,
promise URI stability beyond the v0.1 release's own caveat, or build a bespoke endpoint before
testing the existing release artefacts.

Each candidate below is reversible and paired with the cheapest test that could kill it.

| Candidate | Mutual exchange | Warrant | Falsifier | Cheapest probe |
| --- | --- | --- | --- | --- |
| **1. External-adopter discovery** | NEO shares its authoring workflow, maintenance burden, and support questions; Oak explains release status and intended consumption paths. | NEO is already a public consumer with a pinned release and a working validator. | NEO does not intend to maintain the references, or has no unmet support need. | One structured conversation using the seven existing references; record needs without promising delivery. |
| **2. Seven-reference semantic review** | NEO supplies the intended meaning of its four KS3 English nodes; Oak supplies ontology structure and identifier provenance. | The validator proves existence but leaves phase and sub-strand fit open. | Review finds no ambiguity and yields no reusable fixture or guidance. | Review all seven mappings against DfE text and Oak taxonomy; publish conclusions without learner data. |
| **3. Release-upgrade rehearsal** | NEO tests its validator against the next Oak release; Oak gains concrete consumer-breakage evidence. | NEO pins v0.1.3 precisely because early-release URI change is expected. | The next release has no relevant changes, or NEO will not upgrade. | On the next release, run the validator and a URI diff before changing any NEO content. |
| **4. Taxonomy-traversal demand probe** | NEO tests whether Discipline→Strand→SubStrand navigation improves authoring; Oak gains evidence for or against promoting its parked taxonomy surface. | Oak's promotion tripwire awaits an external consumer question that Threads cannot answer. | Existing docs or local tooling already answer the authoring questions cheaply. | Answer three real NEO authoring questions from the release artefact; prototype a surface only if that path is poor. |
| **5. Bounded cross-source journey** | Oak supplies a deterministic NC neighbourhood plus separate resource search; NEO supplies one anchor, overlay links, and practitioner evaluation. | A concrete journey could test whether shared identifiers reduce movement between statutory text, curriculum, qualifications, and resources. | It is no clearer than ordinary search, or users read discovered resources as formally equivalent. | Prototype one KS3 English journey within a declared NC bound, with resource discovery as a separate ranked projection. |
| **6. Minimal evidence-reference profile** | NEO contributes the canonical–overlay–mastery use case; Oak contributes stable public identifiers and provenance practice. | Portable evidence is NEO's highest-leverage prospective value, and external use tests identifier durability. | NEO has no real evidence consumer, or governance and privacy concerns dominate first. | Model one synthetic evidence record with a NEO ID, optional `natcurric:` reference, overlay ID, mastery, and provenance — no pupil data. |
| **7. Public mapping export** | NEO exposes a tiny, provenance-rich crosswalk under its own authority; Oak tests whether external mapping examples improve adoption guidance. | The current mappings are trapped in Markdown links; others could learn from a machine-readable example. | Licensing, confidence, or granularity is too inconsistent for responsible reuse. | Export three English nodes with explicit relation type, source, confidence, and version; assess before scaling. |

Sequencing matters more than the menu. The low-cost probes — external-adopter discovery, the
seven-reference semantic review, and the next release-upgrade rehearsal — should happen now,
since they learn from existing work and create no support promise. Taxonomy traversal and one
bounded cross-source journey should be promoted only on observed need, where NEO can supply the
demand evidence Oak's parked plans currently lack. The evidence-reference profile and any mapping
export should wait until a real evidence consumer exists. Any cross-source journey must honour
Oak's graph contract: the graph portion complete within its declared bound, with ranked resource
discovery kept as a separate projection rather than a partial graph passed off as a
neighbourhood.

## 7. Tensions that bear on the proposition

Five tensions affect whether the proposition holds. First, the schema's claim that KS4 has "no
standalone published National Curriculum document" is too strong: the DfE publishes a statutory
framework for key stages 1–4 with distinct KS4 programmes of study for English, mathematics, and
science. The vault's own extension file already softens this to "KS4 NC is thin," so the
overstatement is internal and easily corrected — and the stronger formulation, with statutory
KS4 cores as canonical base and overlays as assessment, reinforces rather than undermines the
architecture. Second, the documented taxonomy is richer than the metadata actually in use: the
corpus runs on folders and scalar frontmatter, so calling it a validated semantic model would
overstate it. Third, the evidence proposition has no end-to-end consumer, which is exactly where
the model's highest value would appear. Fourth, mastery is central but thinly instantiated, and
the schema attributes its four-level scale to §5 of NEO's Teaching and Learning Policy, where no
such scale appears; the source may exist elsewhere but is not established by the public
documents. Fifth, the Oak interoperability proves identifier existence, not semantic fit.

## 8. Conditions for durability

The concept does not require completeness to be useful, but a few invariants must hold as it
grows: canonical and overlay meanings must stay distinct; source provenance across NC, statutory,
consensus, and NEO-original content must be explicit and accurate; node identity must be stable
so evidence and external references do not silently break; mappings must be governed, since a
resolved link is not proof of correspondence; coverage should be measured by capability rather
than page count; and at least one end-to-end evidence flow should be demonstrated to test the
highest-value claim.

## Conclusion

NEO's central idea is coherent, differentiated, and well aligned with its stated educational
intent: it separates learning, assessment, evidence, and accountability, which many curriculum
systems blur. The honest reading holds three altitudes apart — the educational proposition is
clear, the editorial graph is real but uneven, and the portable-evidence architecture is still
to come.

For Oak the proportionate conclusion is bounded. NEO is a small but real external consumer of
Oak's National Curriculum identifiers, which makes it valuable to Oak's adoption learning loop
and to the demand tests governing taxonomy and cross-source work — not a case for ingesting its
graph, endorsing its mappings, or committing bespoke support. The immediate opportunity is to let
one real consumer sharpen Oak's identifiers and adoption model while Oak's open, versioned
vocabulary lowers NEO's cost of maintaining external anchors. What would most change this
assessment is evidence on three questions: whether NEO practitioners plan from the vault or
mainly publish through it, whether NEO will maintain its Oak references across releases, and
whether Oak wants an alternative-provision organisation as a defined first adopter.

## Primary public sources

- [NEO Curriculum Vault README](https://github.com/nudgeeducation/neo-curriculum-vault/blob/d9786484e676b154e25a65806d70dbd385c017ad/README.md) and [tagging schema](https://github.com/nudgeeducation/neo-curriculum-vault/blob/d9786484e676b154e25a65806d70dbd385c017ad/content/_schema/tagging-schema.md) at the reviewed commit
- [`nc_ref` schema extension](https://github.com/nudgeeducation/neo-curriculum-vault/blob/d9786484e676b154e25a65806d70dbd385c017ad/content/_schema/nc-ref-extension.md)
- [NEO Teaching and Learning Policy](https://github.com/nudgeeducation/nudge-policy-vault/blob/73d59c491ee42b2e9e4794324aeb78b1e7c4f406/content/neo-only/neo-teaching-and-learning-policy.md)
- [DfE: National Curriculum framework for key stages 1–4](https://www.gov.uk/government/publications/national-curriculum-in-england-framework-for-key-stages-1-to-4)
- [Oak Curriculum Ontology v0.1.3](https://github.com/oaknational/oak-curriculum-ontology/releases/tag/v0.1.3)
