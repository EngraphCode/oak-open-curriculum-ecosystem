---
id: eef-corpus-markdown-projection
node_type: delivery
name: "EEF corpus markdown projection — strand reference files rendered from the corpus"
overview: "Render the fixed EEF Teaching and Learning Toolkit corpus into prettier-normal markdown — one reference file per strand plus one corpus-reference file carrying source, methodology, caveats and the strand index — from a pure projection in the corpus package with a thin writer script, so any downstream artefact that needs the evidence carries the corpus's own facts and attribution with no hand copy and no server."
status: ratified
ratified_by: "Jim Cresswell"
ratified_date: 2026-09-06
ratified_where: "Owner decision card at the lane seat (Finch binds Sundog, 47f9d2), 2026-09-06 ~10:3xZ, answer 'Ratify: build it next' to the card describing the per-strand and corpus-reference renderers, nothing committed here, one PR within the two-round budget"
serves: toolkit-re-architecture
impact_areas:
  - packaging-and-distribution
tickets: []
depends_on: []
owner_gates: []
last_updated: 2026-09-06
---

# EEF corpus markdown projection

## Goal

When this lands, the corpus package can render its EEF corpus as markdown on demand: one
file per strand carrying that strand's headline metrics, definition, key findings,
effectiveness, behind-the-average detail, disadvantage-gap note, implementation
considerations, related strands, tags and EEF page; and one corpus-reference file carrying
the source and attribution block, the methodology, every caveat and the complete strand
index. Every line is a cite by construction (the `eef-corpus-grounding` rule), the output is
already in the formatter's normal form, and nothing is committed in this tree: a consumer
commits the rendered files with a provenance pin naming the corpus data version and the
commit that rendered them. Today the same facts reach a reader only through the served MCP
tool and the interpretation resource, both of which need a deployed server, and the
interpretation guide's later layers name the served tool, so neither can be shipped as a
no-server reference.

## User groups and value

- **Authors of skills and documents that cite the evidence** — in any repository, including
  a satellite repository worked alongside this one and the canonical organisation's own skills
  library, whose evidence-informed guidance today points at the dormant tool. They get the
  corpus's facts as files they can commit, cite by path and re-render at a corpus refresh.
- **Teachers, through whatever carries those files.** Impact, cost, evidence strength and
  every caveat, attributed to EEF and linked to the strand page. Offered value; the claim
  boundary sits with each consumer's own evaluation.
- **The platform's maintainers.** One projection family beside the existing headline view,
  in the package that owns the data; the interpretation resource can adopt the
  corpus-reference renderer later as its second consumer without this lane touching it.

## Mechanism

- **Two pure renderers** in `packages/sdks/graph-corpus-sdk/src/eef-strands/`, beside the
  headline view: one takes a strand id and returns that strand's markdown; one takes no
  arguments and returns the corpus-reference markdown (source and attribution verbatim from
  `corpusMeta`, methodology from `corpusMethodology`, caveats from `corpusCaveats`, the index
  over `EEF_STRAND_IDS` with each strand's headline summary and EEF page). Both read only
  the package's own exports. Lists are bullets, never pipe tables: the formatter pads tables,
  and a byte pin over padded tables fights it forever.
- **A version stamp.** Each rendered file opens with the corpus data version from
  `corpusMeta.data_version`, so a consumer's provenance pin has a value to name.
- **A thin writer** at `scripts/render-eef-markdown.ts` taking `--out <dir>`: it writes one
  file per strand under `strands/` and the corpus-reference file beside them, and nothing
  else. It is the corpus package's twin of the MCP app's served-tool-table generator. The
  package's knip map gains `scripts/**/*.ts` as an entry, the shape the app already uses.
- **Tests, in the shared vitest include.** The strand-file set equals `EEF_STRAND_IDS`, with
  no orphan and no gap. Each strand's rendering carries its headline impact or the
  null-impact wording, cost label, evidence-strength label, every key finding and its EEF
  page. The corpus-reference rendering carries every caveat and the attribution note
  verbatim. Every rendered text equals its own formatter-normalised form.

### Where the first-principles check fires

- **Shape.** The tests prove authored behaviour: set completeness, fact presence and
  normal-form output. No vendor assertion.
- **Landing path.** Renderers and tests sit under `src/**`, inside the shared include
  pattern; the writer sits under `scripts/`, outside it by design, and enters knip's map.
- **Vendor literal and locus.** The exports named (`strandById`, `EEF_STRAND_IDS`,
  `corpusMeta`, `corpusMethodology`, `corpusCaveats`) were read from the package's index on
  2026-09-06; the corpus constant itself is not a public export and is not needed.
- **Optionality.** One output shape; no consumer built here; no "either" left open.
- **Record consumer.** No register is added. The provenance pin lives in each consumer and is
  read by that consumer's own drift check.
- **Rules tier.** `eef-corpus-grounding` (every claim a cite), `consolidate-at-second-
  consumer` (the resource's adoption is routed as a named follow-up, not absorbed here),
  `never-disable-checks` (no ignore entries), `no-tombstones-for-removed-ideas`.

## Acceptance criteria (each with a proof — required)

- **Complete and faithful.** The set test and the fact-presence test pass for every strand
  and for the corpus reference. Proof: `repo-safe` — the tests, in `pnpm test` and the
  pre-push suite.
- **Normal form by construction.** Each rendered text equals its formatter-normalised form.
  Proof: `repo-safe` — the test.
- **Writable to any directory.** The writer script renders into a scratch directory and the
  file set there equals the expected set. Proof: `repo-safe` — an integration test over a
  temporary directory.
- **Nothing committed here.** The pull request adds no rendered output to this tree. Proof:
  `repo-safe` — the diff scope stated in the PR body.

## Todos

One single-story pull request within the default round budget (PDR-132): the two renderers
with their tests, the writer script, the knip entry.

## Out of scope

- Any consumer of the rendering: a plugin skill, a skills library entry, a document. Each is
  its own artefact in its own home and commits the rendered files with a provenance pin.
- The interpretation resource adopting the corpus-reference renderer: a follow-up
  consolidation at the second consumer, its own small change.
- The served surface, the served tool and the resource rows: unchanged.
- The corpus data, its provenance and its refresh: the corpus remains a hand-refreshed
  snapshot; the position stays "provenance pending clarification" in the data itself.
- A strategic home for open-evidence work: the strategy choice this projection serves has no
  strategic node; this node serves the seam node and re-parents in one line if one is minted.
