# Handoff — Riverine (Seat A) → next Seat A seat — S1 done/merged, S2 next

**Date**: 2026-06-10
**Outgoing agent**: Riverine Swimming Sail · claude · Opus 4.8 · session_id_prefix `5cc20f` · id `ce2996db-7810-54f5-9cb3-dcee397dd256`
**Seat / lane**: Seat A / Track S — **S1 → S2 → U1** of `graph-tools-value-redesign.plan.md` (thread `eef`).
**Mode**: natural-boundary closeout (per Veiled's session-end directive, event `8b3dc940-d4f0-4412-8baf-31e2d1bbd462`).
**Worktree**: `/Users/jim/code/oak/oak-wt-seat-a` — branch `feat/s1-doc-resources-single-source` at `89536435` (merged via #152). Clean tree. A gitignored `apps/oak-curriculum-mcp-streamable-http/.env.local` is present (copied from the primary for the live MCP exercise; intentionally NOT committed — never rides a PR).
**Coordination home**: `/Users/jim/code/oak/oak-open-curriculum-ecosystem` (primary checkout; Veiled is Director and owns all `.agent/state`/`.agent/memory`/continuity writes + merge sequencing). Implementers point all comms/claims at this path by absolute path; implementer PRs are pure diffs.

---

## 1. Current edit state

- **S1 (doc-resources single-sourcing) is COMPLETE and MERGED to `main`** via PR **#152** (merge commit `c2aa4791`).
  - `529786df` `refactor(mcp): single-source doc resources via curriculum://model` (10 files, +51/−409). **This commit has NO `Co-Authored-By` trailer** — it was pushed before the trailer was added; amending to add it needs a force-push, which the owner's deny rule (`Bash(git push --force-with-lease:*)`) blocks. Left as-is pending the owner's decision (leave vs authorise a one-time force-push). The owner was informed in chat.
  - `89536435` `test(mcp): harden doc-resources resources/list e2e against a vacuous pass` (2 files; Copilot review fixes). **Carries the `Co-Authored-By: Claude Opus 4.8 (1M context)` trailer.**
- **No uncommitted product work.** Worktree sits on the merged `feat/s1` branch. Successor: `git -C /Users/jim/code/oak/oak-wt-seat-a fetch origin && git -C … checkout -b feat/s2-prompt-language-pass origin/main` (S1 is already in `origin/main` → `c2aa4791`).
- **S2 was NOT started** (per directive). S2 and U1 are the successor's work.

## 2. In-flight reasoning — S2 pre-scoping (read-only work product; this is the context to preserve)

**S2 = `s2-prompt-language-pass`**: one fixed-language pass over the served prompts. One small pure-diff PR. Independent of Track G; **lands before the G-unit prompt repoints where scheduling allows** (shared files, no hard dependency). **G1b's hard gate is now S2-only** (S1 merged).

**Surfaces (all in `packages/sdks/oak-curriculum-sdk/src/mcp/`):**

- `mcp-prompts.ts` — the 5 `McpPrompt` definitions (names + args) + `getPromptMessages` dispatcher.
- `mcp-prompt-messages.ts` — the 5 message generators (the prose/workflow text).
- `mcp-prompt-types.ts` — `PromptMessage` type (leaf; breaks the prompts↔messages cycle).
- `mcp-prompts.unit.test.ts` — **the describing surface** for the S2 cycle.

**The 5 prompts and their current args:**

| Prompt name | Args (req/opt) |
| --- | --- |
| `find-lessons` | `topic` (req), `keyStage` (opt) |
| `lesson-planning` | `topic` (req), `yearGroup` (req) |
| `explore-curriculum` | `topic` (req), `subject` (opt) |
| `learning-progression` | `concept` (req), `subject` (req) |
| `adapt-lesson` | `topic` (req), `yearGroup` (req) |

**B3 — canonical domain vocabulary (GROUNDED).** Source of truth = `ontology-data.ts` (surfaced via `curriculum://model` through `composeCurriculumModelData()` → `composeToolGuidance()`; same data the model resource serves). Canonical terms: `keyStage` = `ks1`/`ks2`/`ks3`/`ks4` (names "Key Stage 1".."Key Stage 4"); `subject` = slugs (`maths`, `english`, `science`, `history`, `geography`, `art`, `music`, `computing`, …) each carrying a `keyStages` array; `yearGroup` (e.g. "Year 4") is deliberately **finer-grained and DISTINCT from `keyStage`** — the plan is explicit: **`keyStage` ≠ `yearGroup`** (do not conflate them). Official glossary: <https://open-api.thenational.academy/docs/about-oaks-data/glossary>. The prompt args are already largely canonical → B3 is a light consistency pass (ensure arg names/descriptions use the canonical terms; keep keyStage vs yearGroup distinct).

**B2 — `adapt-lesson` arg-mapping (NEEDS FIRST-HAND CONFIRMATION).** `adapt-lesson` takes `topic` + `yearGroup`; `getAdaptLessonMessages` step 1 instructs "search (scope 'lessons') … for '${topic}' at ${yearGroup}". But the `search` tool filters by `keyStage`, not `yearGroup` (cf. `find-lessons`, which uses `keyStage` directly and builds a `keyStageParam`). **My hypothesis (not nailed):** the arg-mapping repair is about correctly mapping `yearGroup`→`keyStage` for the search step (the agent maps via `get-curriculum-model`'s ukEducationContext), or otherwise aligning adapt-lesson's arg flow. **The seam-analysis report did NOT elaborate B2 beyond the phrase "adapt-lesson arg-mapping"** (report §3 row S2). SUCCESSOR: confirm the precise B2 defect first-hand by reading `getAdaptLessonMessages` against the search tool's accepted params before fixing — do not assume my hypothesis.

**B4 — distinguishable prompt names.** The 5 names are mostly distinct; the closest pair is `find-lessons` vs `explore-curriculum` (both discovery, distinct purposes: specific lessons vs broad exploration). Any **outward-facing rename needs owner sign-off AT the PR** (brief + plan); renames go THROUGH the B3 fixed vocabulary. Assess distinctness first-hand; propose renames (if any) for the owner at the PR.

**S2 cycle shape (plan §Cycles & proof contract):** describing surface = "the served prompt definitions (`prompts/get` output)"; **c1**: prompt-surface tests describe canonical arg names + distinguishable prompt names → apply the fixed-language pass. Atomic test+code landing. Proof: integration prompt tests + `pnpm test`; **owner sign-off on names recorded in the PR**. Live-exercise via `prompts/get` over the noauth MCP server (port 3333; needs the `.env.local` — see Lessons).

## 3. Decisions made (who + when + refs)

- **Seat A assignment + coordination home = primary checkout**: owner (AskUserQuestion, this session) + Veiled team-start broadcast `22c9c487`.
- **Copilot adjudication on #152 (3 comments, all first-hand):**
  1. "Removing published SDK exports is breaking; add deprecation stubs" → **deprecation-stub cure REFUTED** (repo `replace-dont-bridge` rule; `getToolsReferenceMarkdown`/`getWorkflowsMarkdown` have NO monorepo consumer — verified + code-expert pass; the redesign removes surface deliberately, no aliasing). PR reply id `3388509438`.
  2. Stale `DOCUMENTATION_RESOURCES` JSDoc → **APPLIED** in `89536435`. Reply `3388509566`.
  3. Vacuous-pass risk in the new e2e exclusion test → **APPLIED** in `89536435` (now asserts HTTP 200 + `parsed.success` + getting-started present before the negatives). Reply `3388509784`.
- **Reviews**: `code-expert` APPROVED, `mcp-expert` APPROVE (both adjudicated first-hand; transcripts were sonnet sub-agents).
- **`-32602` finding**: a `resources/read` on a removed resource URI returns JSON-RPC **`-32602` (InvalidParams)** from `@modelcontextprotocol/sdk` `McpServer` (verified first-hand against `@modelcontextprotocol/sdk@1.29.0`), NOT the prior plan-note `-32002`. **Veiled has already corrected this in the plan** — cite the corrected plan **§Protocol notes**, not this record. The G-units' removed-URI assertions should expect `-32602`.

## 4. Decisions deferred (with my view)

- **`Co-Authored-By` trailer on `529786df`** (missing). My view: **leave as-is** — the force-push deny rule is the owner's explicit boundary and the trailer is minor; every commit from here carries it pre-push. Owner may authorise a one-time force-push if they want it on S1. **OWNER-PENDING.**
- **Arc-level versioning strategy** (should published-SDK surface removals during the redesign be non-major, as now, or breaking/major?). Flagged to Veiled (event `515b7ac7`). My recommended default: **keep non-major through the alpha redesign** (consistent with the `prevent-accidental-major-version` guard + `replace-dont-bridge` + alpha surface). Owner/Director-owned; not S1-blocking. Affects all G-units.

## 5. Next safe action (successor)

1. Pull `main`, cut `feat/s2-prompt-language-pass` off `origin/main` in the worktree (precondition met: S1 merged → `c2aa4791`).
2. Re-read the 4 prompt files on the fresh tree (re-verify; S1 did not touch them).
3. **Confirm B2 first-hand** (the precise adapt-lesson arg-mapping defect) before fixing.
4. Light B3 consistency pass (canonical terms; keyStage ≠ yearGroup).
5. Assess B4 name distinctness; propose any outward rename for **owner sign-off at the PR**.
6. Prompt-surface tests describe the canonical args + distinguishable names → apply the pass; land atomically; full gate green; `Co-Authored-By` trailer pre-push; pure-diff PR.
7. Then **U1** (absorbed into Seat A — no Seat C): upstream `/keywords` finer-grained-control feature request doc, grounded read-only in the LATEST upstream API source; the doc lives in THIS repo's upstream-feature-requests lane (NEVER write the sibling repo).

## 6. Obligation transfer

- Any NEW PR comment on **#152** after this closeout routes to the successor or Veiled (per directive). My three Copilot adjudications are already replied + recorded.

## 7. LESSONS (for Veiled to consolidate into napkin / thread record — I must NOT write `.agent/memory`)

- **Worktree cwd gotcha (high value):** in this Claude Code session the Bash shell cwd RESET to the **primary** checkout between calls. ALL git ops in a worktree MUST use `git -C <worktree>` (or an explicit `cd` inside the command) — otherwise they hit the primary (the Director's tree). A worktree-based team must internalise this.
- **`Co-Authored-By` trailer vs force-push deny rule:** add the trailer BEFORE the first push. Amending a pushed commit to add it needs a force-push, which the owner's deny rule blocks → the trailer can't land without owner authorisation. Recurring lesson for worktree implementers (repo convention uses the trailer; 118 recent uses).
- **Live-MCP exercise in a fresh worktree:** `pnpm --filter @oaknational/oak-curriculum-mcp-streamable-http dev:observe:noauth` (port 3333) fails env validation (3 required vars) unless `apps/oak-curriculum-mcp-streamable-http/.env.local` is present — it's gitignored, so a fresh worktree lacks it; copy it from the primary. The copy is gitignored and never rides a PR.
- **Extensive/real-time reviewers paid off:** Copilot caught the stale JSDoc + the vacuous-pass e2e that both code-expert and mcp-expert missed. Adjudicate bot comments first-hand in real time (no backfill).
- **Gate layering:** pre-commit hook runs build/type-check/lint/test (+ knip + depcruise); pre-push adds e2e/doc-gen/playwright ui+a11y. `doc-gen` produced NO drift from the JSDoc change. `refactor`/`test` pass `prevent-accidental-major-version` cleanly.
- **Stale-corpus fork (for the record, one line):** Airy's G1a execution-start grounding surfaced a sourceVersion gap (2026-03-07 vs 2026-05-21); owner chose option (a) (quantify first); the diagnostic showed committed corpus content ≡ current bulk content (pinned facts hold exactly), so the fork DISSOLVED and G1a resumed unchanged (events ~`12:20`–`12:31`). Do not re-open.
