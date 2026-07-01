# Claude Design — nature, capabilities, and integration with Claude Code / this repo

**Created**: 2026-07-01
**Context**: Owner-directed deep research (via Director Swordfish holds Shoal) to (a) understand Claude Design deeply and (b) find innovative, feasible connections/flows between Claude Design, Claude Code, and the Oak Open Curriculum ecosystem. Feeds the Ask-2 section of [`../plans/curriculum-hub-demo/future/demo-maintenance-and-structure.md`](../plans/curriculum-hub-demo/future/demo-maintenance-and-structure.md) and the reusable-demo-process codification proposal.
**Status**: 🔬 RESEARCH — Complete (validated); proposals are scoping candidates, not decisions. **Sync-mechanism decision (owner, 2026-07-01):** the Ask-2 answer is the canonical-export pull→unzip→diff-previous mechanism (see the Part 5 owner-decision banner); Proposals A + F are recorded as considered-and-rejected, and all DesignSync-based proposals are owner-flagged suspect pending independent re-verification.
**Author**: Frigate holds Estuary (data-plane Implementer, curriculum-hub-demo).

---

## Method and validation (how much to trust this)

This synthesis combines three evidence sources, and **every load-bearing claim below was re-verified first-hand** by the author before inclusion — not taken from a subagent or a search summary:

1. **A bounded ultracode workflow** (`wf_c1db144f-ee4`, 10 agents, ~546K tokens): fan-out primary-source research → adversarial per-claim re-fetch verification → grounded innovation → skeptical judge. It applied three lessons from this thread's earlier *failed* workflow (`wf_63fbe427`): flat output schemas, non-seeded questions, and "cited ≠ true" verification.
2. **First-hand re-fetch** of the primary sources for the load-bearing integration claims (support.claude.com, anthropic.com, claude.com).
3. **First-hand reading of the `/design-sync` skill source on disk** and first-hand **DesignSync tool** read-only calls against the real Oak project.

**Validation caveats (kept honest):**

- The workflow's confirmed-claim join keyed on per-facet claim IDs (`C1`, `C13`…) that were **not globally unique**, so its "65 confirmed" count is unreliable as a join; this doc relies on the per-facet claims and first-hand re-verification, not that count.
- The workflow's skeptical **judge marked only 2 of 8 proposals `grounded`**, because it scored against the workflow's own (tool-schema-heavy) confirmed set. Several capabilities it could not confirm — the design→code handoff, `/design-sync` importing a local codebase, the web-capture tool — the author **did** confirm first-hand (§2, §3). Where this doc credits a proposal the judge did not, it is on first-hand evidence, and says so.
- Third-party pages (VentureBeat, DataCamp, a Piebald-AI GitHub mirror of tool descriptions) are treated as **corroboration only**; no load-bearing claim rests on them alone.

Confidence tags: **[V]** = author verified first-hand against a primary source or on-disk file; **[W]** = workflow-confirmed against a cited primary source but not personally re-fetched; **[S-schema]** = from the in-session DesignSync tool schema; **[?]** = unverified / gap.

---

## Part 1 — What Claude Design is (findings)

- **[V]** Claude Design is an Anthropic Labs product for collaborating with Claude to produce visual work — designs, prototypes, slides, one-pagers. It launched **17 April 2026** alongside Claude Opus 4.7 (support.claude.com release notes; anthropic.com).
- **[V]** The interface is **split-screen**: chat on the left, a canvas on the right; you describe intent and Claude renders on the canvas (support.claude.com get-started).
- **[V]** Work is organised into **projects**. A new project **automatically inherits the organisation's design system**, so brand colours, fonts, and components are already in place (support.claude.com). Design systems are **organisation-scoped** and must be **published** (an explicit toggle; "Can manage" permission on Team/Enterprise) before projects use them (support.claude.com admin guide).
- **[V]** A design system can be built/imported from **a GitHub repo, design files, raw uploads, or a local codebase** (claude.com/product/design; support.claude.com). During onboarding Claude reads a team's codebase and design files to extract reusable components, colours, typography, and patterns (anthropic.com; support.claude.com set-up-your-design-system).
- **[W]** Project context can also come from a text prompt, uploaded documents (DOCX/PPTX/XLSX), or a **web-capture tool** that grabs elements from a live website (anthropic.com).
- **[V]** It is in **research preview** for Pro/Max/Team/Enterprise, **web and desktop only**.

**Gap [?]:** No primary source documents the *internal* file/versioning structure of a project (preview-card schema, `_ds_manifest.json` format) — but the author observed these directly via DesignSync (§3) and the on-disk skill (§4), which is stronger than the docs.

## Part 2 — The Claude Code ↔ Claude Design integration surface (findings)

This is the half the first research pass missed. All four items below were **[V]** re-verified first-hand against support.claude.com/get-started-with-claude-design:

- **MCP server.** Claude Design connects to Claude Code as an MCP server, added with the exact command:

  ```bash
  claude mcp add --scope user --transport http claude-design https://api.anthropic.com/v1/design/mcp
  ```

  followed by `/design-login` to sign in. (This matches the auth model the author hit first-hand: a read call auto-upgraded the claude.ai login to `user:design:read` + `user:design:write` scopes.)
- **`/design-sync` (Claude Code → Claude Design).** Brings a design system into Claude Design "from a GitHub repo, design files, raw uploads, or your local codebase using the `/design-sync` command in Claude Code," so Claude "builds with your real design system components, checks its own output against your design system, and makes corrections before you see them."
- **Design → Claude Code handoff.** "When a design is ready to become software, you can hand it off to Claude Code, which continues from your existing work instead of starting over from a screenshot." Export options include **"Send to local coding agent"** and **"Send to Claude Code Web."**
- **Shared usage pool (the token-burning fix).** "Design activity draws from the shared pool you use for chat, Claude Code, and Cowork, so there's no separate Claude Design allowance to track."
- **[V]** A second, third-party bridge exists in-session: the Vercel MCP tool **`import-claude-design-from-url`** imports a finished Claude Design (a self-contained HTML bundle) from a public HTTPS URL.

The integration is therefore **genuinely two-way**: code/design systems flow *into* Claude Design (`/design-sync`, imports), and finished designs flow *out to* Claude Code (handoff), over a shared MCP server and a shared usage pool.

## Part 3 — DesignSync tool + the `/design-sync` skill mechanics (findings)

**First-hand DesignSync read-only probe of the real Oak project** (author ran these):

- Two Oak design-system projects exist: **"Oak National Academy Design System"** (`3ddccf31-…`, owner Simon, `PROJECT_TYPE_DESIGN_SYSTEM`, updated 2026-07-01) and **"Oak National Academy Design System (Remix)"** (`785cc381-…`, owner **Jim**, `isOwned: true`). **[V]**
- `list_files` on the canonical project returned its real structure **[V]**: a `_ds_manifest.json` card index + `_ds_bundle.js`, `README.md`, `SKILL.md`; the full **~140-icon** `assets/icons/` set (incl. `subject-*`); brand logos + `oak-icons.css`; `fonts/Lexend-VariableFont_wght.ttf`; **~50 `preview/*.html` component specs** (buttons, card, quiz-*, inputs, signature-interaction, …); `src/styles/theme/*.ts`; `tokens/fig-*.css`; `ui_kits/oak/*.jsx`; `colors_and_type.css`; `brand_voice.txt`; `uploads/` (brand-voice PDF, logos).

**Tool surface [S-schema], corroborated first-hand:** read methods `list_projects` / `get_project` / `list_files` / `get_file` (`get_file` = **one file, ≤256 KiB** → per-file serialisation, the ~140-icon pull bottleneck); a plan-gated write half (`finalize_plan` locks writes/deletes + `localDir` → `planId`, then `write_files` ≤256/call / `delete_files`). **Owner policy = read-only** (never write to the remote); the read/write split is a *policy*, not a tool limit.

**The `/design-sync` skill (read first-hand on disk):** its primary direction is **code → design** — it publishes a *local React component library* into a Claude Design project so Claude builds with the real components. Key mechanics:

- Builds an importable `_ds_bundle.js` (IIFE of the package's `dist/` exports) + per-component preview cards (`<Name>.html` with a first-line `<!-- @dsCard group="…" -->` comment the app's self-check registers).
- **Change-detection** is sourceHash-based via a remote `_ds_sync.json` anchor: re-sync fetches it and diffs into verification (`unchanged`/`changed`/`added`) and upload (`components`/`deletePaths`) partitions.
- Two upload paths: **incremental** (first sync into an empty project) vs **atomic** (re-sync / non-empty target — one pass after everything is verified), fenced by a `_ds_needs_recompile` sentinel; `_ds_sync.json` is written last.
- `.design-sync/config.json` (committed) records `projectId`, `buildCmd`, etc. **Scope: React design systems only.**

## Part 4 — Where Oak actually stands (findings, grounded in this repo)

- **This repo has no reusable *web* component library.** **[V]** `packages/design/` **does exist** and ships `@oaknational/design-tokens-core` (DTCG token helpers), `@oaknational/oak-design-tokens` (token source + generated CSS custom properties), and `@oaknational/oak-design-ink` ("Reusable Oak Ink primitives for **terminal** user interfaces" — React-for-Ink, peer-deps `ink`+`react`, **not** browser DOM). There is **no `@oaknational/oak-components`** web/browser component library in-tree. The demo's UI is hand-built and styled with **vendored** Oak tokens/assets; Oak's real **web** design system lives **externally** (the claude.ai/design project + Oak's own web component repo). *(Correction: an earlier draft claimed "no `packages/design`, verified first-hand" — that was a false negative from an inadequate search (`find -maxdepth 2` missed the depth-3 sub-packages; a group-dir `package.json` doesn't exist). The Director's spot-check caught it; re-verified at correct depth. A negative from a search incapable of finding the thing is not evidence of absence — the `[V]` tag was mis-applied there.)*
- **Oak's demo used DesignSync "backwards" relative to the skill.** The demo **pulled** assets *from* the design project via manual `get_file` reads (design → code), whereas the tooled `/design-sync` flow **pushes** a component library *into* a project (code → design). Oak's pull was a hand-rolled use of the read methods, not the skill.

## Part 5 — Proposals (candidates, not decisions)

> **Owner decision on the SYNC mechanism (2026-07-01, recorded by Polaris mends Perigee, Frigate's
> data-plane successor).** The upstream-reconcile mechanism is **pull a fresh Claude Design
> canonical export → unzip → diff against the previous committed export snapshot → classify +
> reconcile** (the export is one self-contained artefact carrying pages, data, assets, and the
> `_ds/` design system). **Proposal A (DesignSync top-up) and Proposal F (Vercel import) are NOT
> adopted as the sync mechanism** — the owner directed that prior-team DesignSync mechanisms be
> treated as suspect, and that the Vercel import-assist (which yields no versioned, diffable
> snapshot) is not the sync path. They remain below as *considered-and-rejected* decision records,
> re-headed accordingly. **Proposals B and C also rest on DesignSync / `/design-sync`** and inherit
> the same suspect flag — not rejected here (they are not the sync mechanism), but requiring
> independent re-verification and an explicit owner/Director decision before any adoption. The
> Part 1–4 findings are Frigate's first-hand research, carrying their own `[V]`/`[W]` tags; they are
> not re-verified here and should be treated as claims-to-verify.

Each proposal is labelled with feasibility and what it stands on. "Grounded first-hand" means the author verified the load-bearing capability in §2–§4; where the workflow judge disagreed, that is noted.

### A. Incremental DesignSync top-up of the vendored kit — *CONSIDERED AND REJECTED (owner, 2026-07-01)*

**Not adopted as the sync mechanism.** The owner directed that prior-team DesignSync mechanisms be treated as suspect; this per-file top-up is read-only + chat-scoped to `/design-login`, per-file only (the ~140-icon bottleneck), and has no independent byte-diff source. The adopted Ask-2 answer is the **canonical-export pull → unzip → diff-previous → reconcile** mechanism (see the owner-decision banner above and `../plans/curriculum-hub-demo/future/demo-maintenance-and-structure.md` Asks 1 & 2).

_Recorded for provenance — the rejected shape was:_ in the `/design-login` session, `get_project` (check `updatedAt` moved) → `list_files` (structural diff vs the vendored path set) → `get_file` only the consumed subset that changed → transcribe → re-derive dependents → update provenance. Read methods + `updatedAt` were confirmed first-hand; the rejection is on the mechanism's suitability, not on whether the tool works.

### B. Agent-discoverable Oak asset/component index — *feasible now, grounded first-hand + judge-confirmed*

Build a local index of what the Oak DS offers by reading the project's `preview/*.html` `@dsCard` markers + `_ds_manifest.json` (both observed first-hand in §3), so an agent building/reviewing a demo knows which components exist and how they group. **Warrant:** `@dsCard`/manifest confirmed. **Falsifier:** the index drifts if not refreshed against the remote. **Trigger:** any demo/review needing "what Oak components exist".

### C. `/design-sync` Oak's real *web* component library into Claude Design — *feasible-constrained, grounded first-hand (judge lacked the capability)*

Publish Oak's **external web** component library into the Oak DS project via `/design-sync`, so Claude Design builds Oak work with genuine components and hands off to Claude Code. **Not a this-repo action** — this repo has no *web* component library (§4); `@oaknational/oak-design-ink` is React-for-**Ink/terminal**, and `/design-sync` renders preview cards in headless chromium (web DOM), so terminal/Ink primitives are **not** a valid `/design-sync` source. It is a cross-repo/owner move on Oak's external web component repo. **Warrant:** `/design-sync` local-codebase import + self-check verified first-hand (§2) and in the on-disk skill (§4); the skill states "React design systems only" and builds a browser bundle + chromium-rendered previews. **Falsifier:** requires a **web-rendering** React component library with a buildable `dist/` + the owner running it in a login session; the owner's read-only-remote policy would need an explicit exception (this writes to the remote). **Trigger:** Oak wants Claude Design to design with real web components rather than a vendored snapshot.

### D. Design → Claude Code handoff for a new Oak demo page — *feasible-constrained, grounded first-hand (judge marked not-grounded on incomplete evidence)*

Build a new brand-consistent page in Claude Design against the published Oak DS, then "Send to local coding agent" / "Send to Claude Code Web" so Claude Code continues from the design (no rebuild-from-screenshot). **Warrant:** handoff + export targets verified first-hand from the support article (§2) — the judge could not confirm these; the author did. **Falsifier:** depends on the org DS being published and the page being wanted brand-first rather than data-first. **Trigger:** a new demo page (e.g. a Threads explorer) wanted brand-consistent from the start.

### E. Curriculum-content-driven design — *feasible-constrained, partially grounded*

Pull a real sequenced structure from the **Oak Curriculum MCP** (`get-curriculum-model`, `get-thread-progressions`, confirmed in-session), feed it as project context, and design a data-shaped page against the Oak DS. **Warrant:** the MCP graph tools are confirmed; project-context-from-prompt/upload is confirmed. **Falsifier:** the "feed structured data as design context" step is product-UI behaviour not verified end-to-end. **Trigger:** a demo whose layout is dictated by curriculum structure.

### F. Vercel URL import — *NOT adopted as the sync mechanism (owner, 2026-07-01); review-handoff use unratified*

**Not the sync mechanism.** `import-claude-design-from-url` is an import-*assist* into a hosting target and yields no versioned, diffable snapshot, so it cannot serve the pull→diff-previous sync the owner directed. The idea of exporting a finished page as a self-contained HTML bundle, hosting it at a public HTTPS URL, and importing it for a non-technical reviewer (e.g. Heather W) who cannot run the app remains a *separate, unratified* review-handoff proposal — not part of the sync mechanism. The Vercel tool itself was confirmed in-session as described; the rejection is about fitness for sync, and the review-handoff use is un-decided.

**Deliberately not credited:** proposals leaning on a "Remix button" UI flow or an internal brand-compliance self-check as a *gate* remain **[?]** — the Remix *project* exists (§3) but the product-UI flow that produces it is unverified, and the self-check is documented as a build-time correction, not an exposed audit gate.

## Related documents

- [`../plans/curriculum-hub-demo/future/demo-maintenance-and-structure.md`](../plans/curriculum-hub-demo/future/demo-maintenance-and-structure.md) — the forward brief this completes (Ask 2).
- [`../plans/curriculum-hub-demo/active/port-prototype-to-live-demo.md`](../plans/curriculum-hub-demo/active/port-prototype-to-live-demo.md) — the demo this arose from.
- [`../../demos/curriculum-hub-hw/oak-design-kit/PROVENANCE-designsync.md`](../../demos/curriculum-hub-hw/oak-design-kit/PROVENANCE-designsync.md) — how the kit was pulled.

## Sources (primary, author-verified first-hand unless noted)

- Anthropic — Introducing Claude Design: <https://www.anthropic.com/news/claude-design-anthropic-labs>
- Claude Help Center — Get started with Claude Design: <https://support.claude.com/en/articles/14604416-get-started-with-claude-design>
- Claude Help Center — Set up your design system / Admin guide (workflow-cited [W]).
- Claude product — Design: <https://claude.com/product/design>
- The `/design-sync` skill source, read on disk (bundled skill, non-storybook variant).
- The in-session DesignSync tool schema + first-hand read-only calls against Oak project `3ddccf31-…`.
