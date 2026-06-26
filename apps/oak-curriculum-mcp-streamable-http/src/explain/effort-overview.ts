/**
 * Curated effort-overview projection for a remote MCP client.
 *
 * Mechanical extraction of the README/VISION effort sections is unusable on a remote
 * surface: the README's "What This Repo Provides" is a capability table plus
 * curriculum-structure subsections, which after firewalling leaves dangling connective
 * fragments; and the README hard-wraps an "as of <month>" dateline a line-based filter
 * slips. So this is hand-authored: a curated constant pulls no datelines and no curriculum
 * structure from the README at all.
 *
 * EFFORT-DOMAIN ONLY (owner separation principle): this describes how Oak builds and
 * delivers its curriculum — purpose, value-streams, the machinery at executive altitude,
 * how to engage. It NAMES curriculum as what the effort serves (permitted) but never
 * DESCRIBES curriculum structure or content (no subjects / units / lessons / key stages /
 * sequencing), and never routes to curriculum surfaces. Curriculum content is a separate
 * concern served by the curriculum tools.
 *
 * NO point-in-time status: no alpha-phase banner, "as of <month>" dateline, live tool
 * count, or deployment URL — these age. "Exists vs planned" is marked inline ("Python to
 * follow") rather than dated. Freshness is carried by the body's `lastModified` header.
 *
 * These domain and volatility properties are held BY CONSTRUCTION and kept correct by
 * authoring and review (PDR-112 / ADR-202) — not by an automated content or source
 * fingerprint check. When you revise the README/VISION effort prose, re-curate this to match.
 *
 * @see README.md / VISION.md — the effort-content SSOT this projects
 * @see src/explain/behaviour-shell.ts — the sibling curated projection (behaviour half)
 */

export const EXPLAIN_EFFORT_OVERVIEW = `## What the Oak effort is

Oak's mission is to improve pupil outcomes and close the disadvantage gap by supporting
teachers to teach, and enabling pupils to access, a high-quality curriculum. Oak has built
a high-quality, open, fully sequenced, fully resourced curriculum. This repository turns
that curriculum into AI-native infrastructure — for the teachers and the wider ecosystem
who use it — and it is where Oak is learning to build and curate everything it makes,
agent-first.

It comes down to one challenge: deliver Oak's rigour at reach and at pace — keep what makes
the curriculum trustworthy intact (rigour), bring it to where teachers and the ecosystem now
work (reach), fast enough to matter (pace). Two things change here to meet that challenge,
and they hold each other up: bringing Oak's curriculum to where teachers and the ecosystem
can use it through AI, and transforming how Oak builds and curates digital products —
agent-first, with people firmly in the lead.

This is one of Oak's AI efforts, not the whole of how Oak does AI: Oak builds other
user-facing AI products too. What is distinctive here is putting Oak's curriculum *into* the
third-party AI assistants teachers already use, and giving the wider ecosystem open tools to
build with — complementary to Oak's other AI work, not a replacement for it.

## What this repository provides

Three capabilities, drawing on open education data, at executive altitude (the live
inventory of products and components is in the repository's README):

- **A typed TypeScript SDK** (with Python to follow) for building against Oak's open
  curriculum data — types and validators generated from the published API schema.
- **MCP servers** that put Oak inside the AI assistants teachers already use — ChatGPT,
  Claude, Gemini and others — and give developer tools the same access, through the Model
  Context Protocol and MCP Apps.
- **A semantic search service** — hybrid lexical-and-semantic retrieval across Oak's
  curriculum, for the assistants and tools that build on it.

Alongside Oak's own data the effort brings in openly licensed evidence from other
organisations in the sector — such as the Education Endowment Foundation's Teaching and
Learning Toolkit — so what is surfaced is grounded in the wider evidence base, not Oak
alone. The code is open; each data source stays under its own upstream open licence,
attributed to whoever created it.

For data analysts and scientists, the data architecture is an access layer over Oak's
open curriculum *data* — a typed SDK, curriculum graph tools, and semantic search, all
generated from and flowing through the published Open Curriculum API. That access layer
is deliberately distinct from the curriculum *content* itself: this orientation names the
separation and never describes curriculum structure — content questions are served by the
curriculum tools, not here.

## Part one — Oak's curriculum, AI-native

The web and AI assistants are two complementary ways teachers reach Oak; they reinforce each
other. This repository delivers the AI-assistant side: Oak inside the assistants teachers
already choose, bringing Oak's standards into the tools they already use to plan lessons and
prepare. Which assistant is the teacher's choice, not Oak's. What comes back is grounded in
Oak's evidence-informed curriculum, not ungrounded invention — it informs the teacher's
expert judgement; it never replaces it. The curriculum is optional and fully adaptable, and
the teacher decides what is right for their context.

For the wider ecosystem, the effort provides open tools for open educational data — the SDK,
the search service, and curriculum graph tools — so anyone building with open educational
data can do it well.

## Part two — agent-first product creation and curation

Building AI-native infrastructure to Oak's standard, at pace, takes a different way of
working. Oak builds and curates its products agent-first, across the whole product lifecycle
and not just the code, with people leading throughout. This amplifies teams; it does not
replace them — agents take on the toil and the scale, while people bring the judgement,
expertise, taste, and accountability that decide whether the work is any good. It is the
same principle Oak holds for teachers, turned on itself: the human expert leads, and what is
built amplifies them.

This way of working is itself a transferable system — the Practice: a self-improving loop
that captures lessons from every session, refines and graduates them into permanent
guidance, and enforces them in the next session's work, strengthening its own governance
over time rather than eroding. The framework is openly documented and freely available, so
other teams — inside Oak and beyond — can adopt it. Oak aims to be a useful exemplar for
agent-first delivery with excellence at its centre.

## How to engage

- **Strategy** — the diagnosis, the choices per value stream, and how Oak will know it is
  working.
- **What is built, and the order it is built in** — the high-level plan and the plans it
  indexes; the live inventory is in the README.
- **How it is built safely and fast** — the agentic engineering Practice, openly documented.
- **Openness and licensing** — the code is openly licensed; Oak's curriculum stays under its
  upstream open licence.
- **Impact and the evidence base** — the intended impact for teachers and pupils, and the
  open data sources the effort draws on, each under its own open licence and attributed to
  its creator.

## The boundaries held

One principle runs through everything, at every level: the human expert leads, and what is
built amplifies them rather than deciding for them. For teachers — the teacher is the expert;
the effort informs, it never decides. For Oak's own teams — agent-first work amplifies
people; it does not replace them.`;
