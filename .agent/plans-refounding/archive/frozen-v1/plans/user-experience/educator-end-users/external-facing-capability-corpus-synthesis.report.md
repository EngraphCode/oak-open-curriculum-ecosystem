---
title: "External-facing capability distribution — corpus synthesis, workflows deprecation, and metacognition record"
collection: user-experience
audience: educator-end-users
type: report
status: synthesis-record
last_updated: 2026-06-08
---

# External-facing capability distribution — corpus synthesis & workflows deprecation

> **Synthesis record (point-in-time).** This report is the *rationale and analysis*
> behind the external-facing-capability plan corpus. The **live** corpus map is
> in the synthesis hub
> [`current/external-facing-capability-distribution.plan.md`](current/external-facing-capability-distribution.plan.md)
> — this report explains how that shape was reached, records the `workflows`
> resource analysis, and names the decisions left for the owner. It does not
> duplicate the live map; it grounds it. Authored as the owner-requested
> review (placed in the plan directory per direction).
>
> **Disposition completed 2026-06-08.** The gathered synthesis inputs have been
> fully dispositioned: the four live-intent plans were restored to their home
> collections (`discovery/future/`, `developer-experience/future/`,
> `exploring-open-education-resources/external-knowledge-sources/future/`); the
> compliance plan was promoted and renamed to
> `current/app-submission-standards.plan.md`; and the discovery Agent Skills lane's
> two companion reports (research + channels) were restored to `discovery/future/`
> alongside its plans. No useful material was dropped. The temporary holding
> directory no longer exists. Git history is the record.

## 1. What this records

A reflective review of the external-facing curriculum-assistance distribution plan
estate was run, fanning out readers across the estate and critically re-verifying
every load-bearing finding first-hand. The estate proved **rigorously grounded**;
the real work was not error-correction but **corpus synthesis** — shaping the
minimal coherent set of plans that lands the owner-decided distribution work while
conserving every useful prior intent — plus deprecating a legacy `workflows`
surface that is an early precursor of the skill-surfacing the corpus now does
properly.

## 2. Metacognition

### 2.1 Generative — the frame that mattered

The surface ask ("reflect on the synthesis plan") sat over a wider one: *what plan
corpus does Oak actually need to land the decided distribution work and preserve
the useful intent in the prior materials?* The synthesis hub had drifted — authored
to "frame open decisions" while the owner had since **decided** the shape (both
directions; cross-vendor bundle; Claude + Codex). The high-value move was to
re-scope the hub from "frame undecided things" to **the corpus map + a value-first
disposition ledger**, and to keep the corpus minimal: two executable code plans
(Direction A; the plugin-package-creation plan), one strategic rationale brief, one
cross-repo plan, and the hub itself. The disposition-ledger discipline (PDR-018)
sized each gathered synthesis input to *one recorded decision each*, not a plan each.

### 2.2 Retrospective — the precedence-as-proof correction

A correction landed mid-session and is recorded here because the cure is
structural, not a one-off. The reflex error: treating a relocated plan's **stale
frontmatter** (`collection: developer-experience`) as *proof* it should be re-homed
to that collection. But the gathered synthesis inputs were held in a temporary
directory **deliberately, to be synthesised** — their frontmatter disagreeing with
the temporary location is the expected consequence of that move, not a routing signal.

- **Cure target (doctrine-by-analogy):** "an artefact's self-description /
  origin declares where it belongs" is a precedence-as-proof analogy that does not
  fit synthesis inputs.
- **Structural fix:** in a synthesis, all gathered-material metadata (frontmatter,
  original location, self-description) is **stale by design** and is *input to
  re-decide*, never authority for placement. Disposition is decided by the **useful
  intent** a document carries and where that intent serves the forward corpus.
- This retracts the earlier "the Cursor plan is wrongly homed (HIGH)" finding — it
  was the same error — and reshaped the whole ledger to value-first.

### 2.3 Bridge from action to impact

Each action bridges to *a future executor inheriting a complete, coherent, honest
corpus*: the link and coherence corrections restore navigation; the
plugin-package-creation plan lands the decided packaging; the `workflows` fold
removes a drift-prone precursor by generating its replacement; the hub re-scope +
ledger make the synthesis a real synthesis; this report records the why.

## 3. Critically-assessed findings (estate health)

Fan-out readers gathered citation-rich evidence; every load-bearing claim was
re-verified first-hand. Net: **the estate is well-grounded.** What I confirmed, and
where I corrected a reader:

- **Authority citations are accurate.** ADR-189 (audience-led taxonomy), ADR-191
  (deterministic data; agent reasons), ADR-125 (artefact portability) all match
  their citations. A reader flagged the hub's ADR-125 "drift discipline" gloss as a
  *misattribution (medium)*; I **downgraded it** — ADR-125 line 48 verbatim says
  "counts in this ADR drift; the directory and `pnpm portability:check` are
  authoritative," so the citation points at the correct ADR and a real clause; only
  the label is the plan's coinage. Not a misattribution.
- **Code-grounded facts hold.** The generator emits two adapter surfaces and no MCP
  surface; `LockedSkillEntry` carries the unused-discriminator `sourceType`;
  `skills-lock.json` skills map is empty; the EEF c4/c5 surfaces exist; commit
  `d3109d7c` flips the EEF default OFF→ON.
- **Direction B is real**, not vapourware — a 333-line authored plan in the
  `oak-skills` repo, cross-referencing this repo's Direction A.
- **The MCP is deployed and EEF is live** — `get-eef-evidence` is a production tool
  on `oak-prod` (API 0.7.0). This is higher readiness than the plans assumed and
  satisfies the plugin-package plan's "MCP deployed" + "EEF live" dependencies.
- **The "7 vs 6" skill count is a clean delta, not rot** — the seed report's seven
  adds `oak-accessibility` to the prior six (both count the MCP-grounded principles
  variant); resolution defers to the live directory (hub t1), per ADR-125.
- **Reader reliability:** one reader made an arithmetic slip ("four distinct names"
  where the quote showed five) but its conclusion held; the apparent contradiction
  on `current/README.md`'s filename was **my own stale read** (the file was edited
  mid-session), not a reader error — verify-don't-trust cut toward me.

### 3.1 Defects found — and their disposition

| Defect | Severity | Status |
|---|---|---|
| Two committed dangling links to the renamed Direction-A file (hub + bundle) | High (latent navigation trap) | **Corrected** this session |
| Bundle brief's deps mislabelled `blocking` on a `future/` brief | Medium (vocabulary misuse) | **Corrected** — retagged to promotion-gates; deployed-MCP marked already-satisfied |
| Persona README: four `ooc-api-wishlist` links missing the `archive/` segment | High (dead links) | **Corrected** |
| Cross-repo `oak-skills` Direction-B plan references the old Direction-A filename | Medium | **Upstream** — out of this repo; recorded for an upstream request |

## 4. The `workflows` MCP resource — analysis and deprecation

**What it is.** `toolGuidanceWorkflows`
(`packages/sdks/oak-curriculum-sdk/src/mcp/tool-guidance-workflows.ts`) is a static,
hand-authored set of **seven tool-orchestration recipes** — `userInteractions`,
`findLessons`, `lessonPlanning`, `browseSubject`, `trackProgression`,
`exploreTopic`, `discoverCurriculum` — each a "to do task X, call tool A → B → C"
sequence for a common teacher task.

**Why it is superseded.** A curated tool-orchestration sequence toward a teacher
task **is** a skill workflow-spine — the seed report's own mapping
(`SKILL.md workflow spine ↔ c5 adapt-lesson prompt`). It is an early, primitive
form of exactly what Direction A's skill-surfacing does properly and dynamically.
Keeping it as static hand-authored data alongside generated skill surfaces is the
duplication/drift the discovery doctrine exists to prevent.

**Deprecation surface (three sites).** The content flows into more than the named
resource:

1. The `docs://oak/workflows.md` documentation resource (served via
   `DOCUMENTATION_RESOURCES` and `getWorkflowsMarkdown`) in the MCP app's
   `register-resources.ts`.
2. The `workflows` key in `tool-guidance-data.ts`, which propagates into
   `get-curriculum-model` output and tool `structuredContent`.
3. The `tool-guidance-workflows.ts` module itself.

**Disposition (in Direction A, t5).** Migrate the useful content — the curated
sequences — into the generated skill/prompt surfaces (the t0 #1 "workflow spine ↔
prompt" mapping), then remove all three static sites. **Replace-don't-bridge:** the
static surface is deleted only once the generated surfaces carry the equivalent
guidance, so no orchestration guidance is lost. This is the same structural cure
(generator is the source of truth) the metacognition directive prefers over keeping
a hand-maintained copy.

## 5. The target plan corpus

The minimal coherent set is mapped live in the hub (§ *The plan corpus*). In brief:

- **Synthesis hub** (`current/`) — the corpus map, the value-first disposition
  ledger, and index routing. Re-scoped this session from its stale "frame
  undecided decisions" identity.
- **Direction A** — `oak-skills-ingest-and-resurfacing.plan.md` (`current/`) — the
  generator path from `SKILL.md` into MCP-native surfaces; folds EEF c4/c5 (t4) and
  migrates+deprecates the `workflows` surface (t5).
- **Plugin package creation** — `plugin-package-creation.plan.md` (`current/`, new)
  — emit Claude + Codex manifests from one source, reference the deployed MCP +
  agreed skills, clear directory-policy, prove install. Consumes Directions A and B.
- **Bundle brief** (`future/`) — the benefits-led rationale; promoted into the
  creation plan.
- **Direction B** (cross-repo `oak-skills`) — the public skills-CLI source.

## 6. Value-first disposition of the synthesis inputs (completed)

The disposition of all gathered synthesis inputs is now complete. The principle:
each input's disposition is decided by the **useful intent it carries**, never by
its origin.

**Outcome (completed 2026-06-08):**

- **Restored to home collections:** `agent-skills-discovery.plan.md` and
  `skills-classification-taxonomy.plan.md` → `discovery/future/`;
  `cursor-plugins-practice-and-oak-developer.plan.md` →
  `developer-experience/future/`; `education-skills-mcp-surface.plan.md` →
  `exploring-open-education-resources/external-knowledge-sources/future/`.
- **Promoted:** `claude-and-chatgpt-app-submission-compliance.plan.md` renamed
  and promoted to `current/app-submission-standards.plan.md`.
- **Restored intact:** the discovery Agent Skills lane's two companion reports
  (`agent-skills-discovery-research.report.md`,
  `skills-distribution-channels-suggestions.report.md`) returned to
  `discovery/future/` alongside its plans; their taxonomy and vocabulary
  conclusions are also ratified in ADR-189.
- **Carried into plans:** the discovery / taxonomy / channels material is
  **carried** into ADR-189, Direction B's discovery index, and the bundle/creation
  plans; the compliance plan's directory-policy architecture is **carried** into
  the creation plan's `w3`.

The full ledger was live in the hub (§ *Synthesis ledger*) during the synthesis
session and is now superseded by the completed outcome above.

## 7. Decisions left for the owner

1. **Source-of-truth topology (open decision #4)** — canonical `oak-skills`, a
   curated public mirror, or a manifest layer. The one genuinely cross-cutting open
   gate; shared by Direction A's t0, Direction B's WS1, and the creation plan's w0.
2. **First-tranche capability scope (open decision #5)** — lesson adaptation +
   evidence framing are the strongest candidates given the live EEF surface.
3. **`education-skills-mcp-surface` shaping** — the 108 third-party pedagogical
   skills (GarethManning, distinct source/licence) are a deferred exploration
   outside the decided oak-first scope. The plan now lives in
   `exploring-open-education-resources/external-knowledge-sources/future/`; whether
   it advances and how is your shaping call.
4. **`cursor-plugins-practice-and-oak-developer` shaping** — a developer-facing
   plugin-distribution intent the educator corpus does not serve. The plan now lives
   in `developer-experience/future/`; its forward priority is your shaping call.

## 8. Changes made this session

- **Coherence corrections:** repointed the two dangling Direction-A links (hub +
  bundle); retagged the bundle's `blocking` deps to promotion-gates; corrected the
  four persona-README `ooc-api-wishlist` links.
- **New plan:** authored `plugin-package-creation.plan.md` (executable, `current/`).
- **Direction A:** added t5 — migrate + deprecate the `workflows` surface — and
  recorded the surface in its verified-facts and acceptance contract.
- **Hub:** re-scoped to the corpus map + value-first disposition ledger; fixed the
  identity drift; dropped the UK/EEA reference (a non-issue); recorded the EEF
  surface as deployed-and-live.
- **Indexes:** updated `current/` and `future/` READMEs; added the value-first
  supersession pointer.
- **Synthesis inputs dispositioned (completed 2026-06-08):** four live-intent plans
  restored to home collections; compliance plan promoted to
  `current/app-submission-standards.plan.md`; the discovery Agent Skills lane
  (incl. its two companion reports) restored intact to `discovery/future/`. The
  temporary holding directory has been removed entirely.
- **Not done (deliberately):** no product code (planning session); the cross-repo
  Direction-A filename reference is left for an upstream request.
