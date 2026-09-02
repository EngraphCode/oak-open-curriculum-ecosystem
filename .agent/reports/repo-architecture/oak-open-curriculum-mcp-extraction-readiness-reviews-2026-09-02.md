# Readiness reviews — `oak-open-curriculum-mcp-extraction` (2026-09-02)

The pre-ratification review record for the delivery plan node
`.agent/plans/delivery/oak-open-curriculum-mcp-extraction.plan.md` (MCP-661), authored at the
seat Finch calls Pinnacle (`c91bd4`) on 2026-09-02 after the #915 landing. Three reviews ran on
the node's second draft (the one that moved the two apps and their thin layers) before its pull
request left draft; the owner's words of the same hour (rulings 10–12 in the node's decision
log) then reframed the node from a move of workspaces to a cut of every box along the Oak line,
and every finding below is dispositioned against that third draft. Evidence class for every
finding: READ unless the row says RUN. Dispositions: **cured** (the third draft carries the
cure at the named section), **overtaken** (the reframe removed the passage the finding was
about, and the record says what replaced it), **rejected** (with rationale).

## Rendered proof — the Atlas seam diagram (routed off PR #915)

The Oak Toolkit Atlas's seam diagram (`.agent/reports/repo-architecture/oak-toolkit-atlas.html`,
Change 3) named three `oak/` pack classes while the prose above it names four. The diagram line
now reads `packs — identity · content · config · experience-tuning`. Rendered proof: the Atlas
was rendered on 2026-09-02 (Playwright, Chromium, 1400px viewport, mermaid 11 loaded onto a
scratch copy of the canonical file; the repository file carries no loader and renders its
diagrams on the artifact platform, which was republished from the same file the same hour) and
the diagram cropped to
[`oak-toolkit-atlas-seam-diagram-render-2026-09-02.png`](oak-toolkit-atlas-seam-diagram-render-2026-09-02.png):
the packs box shows all four classes; the three gate boxes and the two family boxes are
unchanged.

## Review 1 — assumptions-expert (proportionality, assumption validity, blocking legitimacy)

Verdict on the second draft: NOT READY. Fifteen findings.

| ID | Severity | Finding (one line) | Disposition |
| --- | --- | --- | --- |
| A-1 | blocking | The MCP server carries generic MCP/OAuth and index-lifecycle machinery the census and the Atlas place on the toolkit side; the draft moved the app whole | **cured** — the apps are now cut, not moved: §The decision per box; E1 (server framework), E2 (OAuth-for-MCP), E5 (index lifecycle) |
| A-2 | blocking | The ordering thesis's falsifier tested publishing automation, not the ordering | **cured** — §Decision log names two falsifiers of the ordering itself, each at a named slice (M1's extraction test; P4's gates) |
| A-3 | serious | Owner gate 2 (the ordering word at ratification) was auto-satisfied by ratification | **cured** — removed; gate 1 is now the design record's ratification (D0), a real mid-plan decision |
| A-4 | serious | The deploy word had no `owner_gates` row | **cured** — gate 3 (deploy project and DNS), expiring 2026-09-23 |
| A-5 | serious | The stated partition rules did not generate the table | **cured** — §The decision per box states the operative rule (three dispositions, the per-box measurement); census and co-change are evidence columns |
| A-6 | serious | "Eight members outside the closure" contradicted the hub's move | **cured** — six named; the demos take their dispositions in the table (ruling 9) |
| A-7 | serious | The 90% claim boundary excluded the class that decides it; the replay script did not exist | **overtaken** — the claim boundary is now the thinness ceiling (AC3); the co-change stays as evidence with the retirement mechanism named; V1 lands the script |
| A-8 | serious | P2 published mixed rows unsplit, which the lexeme gate then fails | **cured** — P2 publishes only the libs and core that stay whole; the SDK cuts (K1–K4) precede their publishes |
| A-9 | serious | S1 and M3 were several stories under one name; no split had a slice | **cured** — S1a–S1d; R1–R4; K1–K4; E1–E6, each sliced further at authoring |
| A-10 | serious | AC1 typed repo-safe but runs in the new repository | **cured** — AC1 is owner-held with the CI run recorded on the ticket |
| A-11 | minor | The hub demo's fate was a conditional trigger | **cured** — decided: the hub stays (ruling 9) |
| A-12 | minor | AC6 conflated a CI-provable arm with a rehearsal | **cured** — AC7a and AC7b |
| A-13 | minor | The readiness record did not exist | **cured** — this file |
| A-14 | minor | No first-principles-check statement; counts inconsistent | **cured** — §Where the first-principles check fires; §Evidence reconciles 25 against the thread record's 22 and enumerates the six dev-time members |
| A-15 | minor | Root-surface removals appeared in both the moves and C2 | **cured** — the retirement PR carries them; C2 is residue only |

## Review 2 — architecture-expert-wilma (failure modes, hidden coupling, cut-over safety)

Verdict on the second draft: NOT READY. Thirteen findings; RUN evidence from a manifest walk
over all 33 workspaces and import-specifier counts.

| ID | Severity | Finding (one line) | Disposition |
| --- | --- | --- | --- |
| W-1 | blocking | `env` reads the repository root's `package.json` four levels up at import; a registry install throws or lies | **cured** — R1 injects the version (ADR-024); §Publish first requires the packed-form smoke under a real pnpm store layout |
| W-2 | blocking | The hub demo depends on `oak-design-react` and `fidelity-review`, neither in the publish set | **overtaken** — the hub stays (ruling 9); the closure arithmetic (25 of 33) is the two apps' and unchanged |
| W-3 | blocking | The MCP conformance harness is agent tooling and stays; AC1 and the rails needed it there | **cured** — T1 re-provides the check (the harness's generic core published, or a plain check written there), decided at T1 |
| W-4 | blocking | `.releaserc.mjs` names the curriculum SDK's path; the first release after the move fails; stamping absent | **cured** — the retirement PR removes the entries (§Thin in place); P2 carries the stamping step; the version discontinuity is recorded (§Decision log) |
| W-5 | serious | The 24-hour release-age floor blocks same-day installs of toolkit releases | **cured** — the new repository excludes the `@oaknational` scope from the floor (§Publish first) |
| W-6 | serious | `pnpm -r publish` is not atomic; provenance needs `id-token: write` | **cured** — topological publish, clean-store resolve check, re-run to completion; the permission or no provenance claim (P2) |
| W-7 | serious | Pinning the release checkout would break the release plugin's push | **cured** — P1 asserts the tip equals the validated SHA and exits cleanly; proof includes a run where main advanced |
| W-8 | serious | The codegen chain is consumed through nineteen subpaths; one sentence assigned sides | **cured** — K1's first artefact is the per-subpath table; P4's import gate runs at subpath granularity |
| W-9 | serious | A split `graph-corpus-sdk` would export a departed subpath with no test pressure | **cured** — K4 rewrites the barrel in the same slice and names the test pressure; D0 may keep the box whole |
| W-10 | serious | `oak-eslint`'s preset names this repository's own files | **cured** — R4 makes the exception list consumer-supplied |
| W-11 | serious | The widget build copies fonts and icons by path from the design system's package root; a `files` allow-list could omit them | **cured** — P3's proof asserts the copied files resolve from the packed tarball |
| W-12 | minor | The widget's cross-workspace token watcher misses silently in the new repository | **cured** — E3 removes the watcher; the registry bump is the token path |
| W-13 | minor | Two packages carry their own version lines; ruling 3 restarts them | **cured** — recorded as a decision (§Publish first, §Decision log) |

## Review 3 — docs-adr-expert (accuracy, ADR consistency, schema)

Verdict on the second draft: READY WITH CURES. Thirteen findings.

| ID | Severity | Finding (one line) | Disposition |
| --- | --- | --- | --- |
| D-1 | blocking | The readiness record did not exist | **cured** — this file, committed with the node |
| D-2 | blocking | Two landed edits cited the node by id while it was untracked | **cured** — the node is committed in the same PR |
| D-3 | serious | The search stack could not move before the curriculum SDK and the Oak codegen half | **overtaken** — the SDK boxes are cut in place (K1–K3) before anything moves; the thin slices move together (M1) |
| D-4 | serious | No slice performed a mixed-row split | **cured** — R1–R4, K1–K4 |
| D-5 | serious | The "eight outside the closure" sentence contradicted the hub's row | **cured** — as A-6 |
| D-6 | serious | ADR-041's named occupants void at the move; a status note does not cure it; A1 ran after the structure changed | **cured** — A1 rides M1's retirement PR with ADR-041's amendment content named |
| D-7 | minor | `public-packages-release` has no relationship row | **cured** — §Alignment and §Delivery named (A2) |
| D-8 | minor | The patterns README clause required a ruler the two precedents do not name; "decision-move" was not a category | **cured** — the clause now describes the precedents as they are and binds the three-part requirement to admissions from the amendment date |
| D-9 | minor | The sweep addendum derived a discrepancy the rows do not support | **cured** — the addendum states the per-class figures as recorded and that the total cannot be re-derived |
| D-10 | minor | The census artefact was not cited by path; class names differed | **cured** — path cited; `generic-foundation` used |
| D-11 | minor | `guidance-content` missing from `impact_areas` | **cured** — added |
| D-12 | minor | "Published from the new repository at its version" was ambiguous | **overtaken** — the curriculum SDK is now cut in place; the version discontinuity is recorded |
| D-13 | minor | Two owner quotes repeated three times each | **cured** — the decision log is the verbatim home; other sections refer by ruling number |

## The fourth draft and the second review suite

After the third draft, the owner's design thought experiment (three apps; dips into this
repository rare by construction; search on the same data without a shared service or index —
rulings 13 in the node's decision log) produced a fourth draft: the five-class test, the search
infrastructure/corpus/instance model, the finish-before-extract precondition, the upstream
contract, the app template, the clock trigger and the dip rate (AC8). The dispositions above
stand against the fourth draft (each cured section survives the reframe). A second review
suite runs on the fourth draft — assumptions, adversarial architecture, cohesion and coupling,
documentation and ADR consistency, and the Elasticsearch expert on the search model — and its
findings are appended below as they are dispositioned.

## Review suite 2 (fourth draft)

Pending.

## Readiness verdict

Provisional: the fourth draft is presented for the owner's ratification once the second suite's
findings are dispositioned. Two things remain the owner's beyond that: the design record D0 will
produce (gate 1), and the two org-level prerequisites (gate 2).
