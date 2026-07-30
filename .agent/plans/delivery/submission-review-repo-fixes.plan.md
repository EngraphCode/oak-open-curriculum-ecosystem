---
id: submission-review-repo-fixes
node_type: delivery
name: "Submission-review repo fixes: served-description hygiene, generated tool table, plugin licence"
overview: "Land the repo-side cures from the 2026-07-30 submission-copy review: strip the embedded model directive from the download-asset description with a regression guard, generate the reviewer-facing tool table from the served surface so it cannot drift again, declare the plugin's code licence in its manifest, record the tool-result-size posture, and verify the already-landed inventory truing."
status: sketch
serves: first-major-release
impact_areas:
  - served-surface
  - packaging-and-distribution
tickets:
  - MCP-437
  - MCP-438
  - MCP-439
  - MCP-440
  - MCP-441
  - MCP-442
depends_on: []
owner_gates:
  - awaiting: owner-decision
    clears_when: "The result-size posture (MCP-441): the owner confirms disclose-in-form (this plan's recorded verdict) or names bound-at-source, which then becomes its own follow-on lane with its own tests"
    expires: 2026-08-11
last_updated: 2026-07-30
---

# Submission-review repo fixes

**Status**: sketch. Execution of the underlying fixes proceeds on the owner's direct word
(2026-07-30, "please move on to the fixes"); this node records the shape and slicing and awaits
the owner's ratification stamp at his next glance. Parent ticket: MCP-437.

## Goal

The Anthropic directory submission can be completed honestly: every attestation the form asks for
is true of the served surface, and the reviewer-facing artefacts (tool table, manifest) match what
the server and plugin actually ship — now and at every future re-capture.

## Mechanism

Three of the five findings are drift between hand-maintained artefacts and the served truth; the
cures therefore prefer generators and guards over spot edits (fix the generator, not the instance).
The remaining two are a one-line manifest gap and a posture decision.

## Slices (each a single-story PR within the PDR-132 round budget)

1. **MCP-438 — served-description hygiene** (class: code; ~2 files). Remove the embedded
   model directive (the fonts tip) from `DOWNLOAD_ASSET_TOOL_DEF.description` in
   `packages/sdks/oak-curriculum-sdk/src/mcp/aggregated-asset-download/definition.ts`. Add a
   regression test describing the system state: no served tool description instructs the model
   (no `IMPORTANT:` directive block; no presentation instructions). Sweep the repo for the
   `kalan` misspelling wherever the tip's URL survives. If the fonts tip has a data-shaped home
   in the download-asset RESULT payload, it may move there as content; otherwise plain removal —
   the support site already carries the guidance.
2. **MCP-440 — plugin licence field** (class: config; 1 file). Add `"license": "MIT"` to
   `plugins/oak-open-curriculum/.claude-plugin/plugin.json`; prove with `claude plugin validate`.
3. **MCP-439 — generated tool table** (class: code; ~3 files). A script in the MCP server app
   workspace that emits the reviewer-facing table (name, title, description, annotations) from
   the same registry the server registers from, excluding dormant tools. Test: the emitted table
   contains every live tool (40 today, including oak-under-the-hood) and no dormant tool, and
   each row's fields equal the registered definition's. The submission doc's table is regenerated
   from its output.
4. **MCP-441 — result-size posture** (class: decision; no code in this plan). Recorded verdict:
   **disclose, don't bound**. Rationale: bounding changes served behaviour for every existing
   consumer (an assistant that receives the full keyword set today would start receiving a page)
   — a capability subtraction that must not ride a submission-week hygiene lane; disclosure makes
   the form honest immediately (the Connection requirements field exists for exactly these
   notes, and the host enforces its own per-surface limits regardless). Bound-at-source remains
   available as its own deliberate lane if the owner wants the behaviour; the graph tools'
   bounded-with-honest-totals pattern is the template. The owner gate above holds this verdict.
5. **MCP-442 — inventory truing** (class: record; no new work). Landed by a peer as
   `SHA:34f24834d` before this plan was authored; this plan's step is verification against the
   ticket's definition of done, then closing the ticket with the evidence.

## Acceptance criteria

1. A live `tools/list` read of the deployed surface shows a download-asset description with no
   model-behaviour instructions — proof: repo-safe (the regression test) plus a recorded live
   read on MCP-438.
2. `claude plugin validate` passes with the licence field present — proof: repo-safe.
3. The table generator's output matches the served surface exactly (count, names, titles,
   descriptions, annotations) — proof: repo-safe (the test).
4. MCP-441 carries the recorded decision and rationale; the disclosure text is owner-approved —
   proof: owner-held.
5. MCP-442 closed with verification evidence — proof: repo-safe (the landed commit + DoD check).

## Out of scope

- Any change to the submission document itself (MCP-444 carries those suggestions; humans own
  the fields).
- Bounding tool results at source (only enters scope if the owner overturns the slice-4 verdict).
- The attribution-string convergence and the instructions-field rationale note (conserved on
  MCP-437 as noted-not-ticketed).
- Any change to MCP resources or the widget (the served surface is declared, not altered).

*Authored by Inferno weaves Kindling (3d8c87, agent) at owner word, 2026-07-30.*
