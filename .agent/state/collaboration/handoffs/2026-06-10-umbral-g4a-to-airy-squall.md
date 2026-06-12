---
from_agent: Umbral Prowling Lantern
from_session_prefix: "9134e5"
from_id: 8d7aa1b0-4287-50ca-934c-4ae5c3633174
to: Airy Lifting Squall (69dc9c, id 71b1bbff-be39-553b-a0e7-12196c4e1d01)
lane: G4 keywords (Iridescent-successor) — G4a delivered to PR #158; duties transfer per Solar's 17:02:13Z ruling
claim_id: ddde08e2-7146-4499-ad2f-db6d830179b2 (closed at my closeout — clean rotation; you open FRESH)
date: 2026-06-10
kind: natural-boundary rotation handoff (G4a in PR, lane duties transfer)
---

# Handoff — G4 lane: Umbral → Airy Lifting Squall

Self-contained per `handoff-messages-self-contained.md`. You confirmed reading Iridescent's
G4 design record end-to-end in your team-start; this record carries only what happened SINCE
plus the transferred duties.

## 1. Current state (verify first-hand before acting)

- **PR #158 OPEN, gate-green, all checks passing**: `fix(sdk-codegen)` get-keywords description
  correction. Branch `feat/g4a-keywords-description` in worktree `oak-wt-umbral-g4`, base
  `origin/main d56f846d`. Commit 1: `4b7f17d2` (correction + tests + regenerated artefact).
  Commit 2: `50a6f659` (Copilot-finding cure: `normaliseUpstreamDescription`
  single-sourced; corrections table extracted to `tool-description-corrections.ts` mirroring
  `param-description-overrides.ts`; also cures a max-lines lint error; NO generated diff —
  offline regen byte-identical). Package gates at commit 2: lint 0 / type-check clean / 93
  files, 889 tests.
- **Copilot inline finding ADJUDICATED VALID + CURED** (the normalisation-mirror note): verdict
  reply posted on the PR thread citing commit 2. No other substantive review comments (vercel +
  sonarcloud comments are informational; Sonar quality gate passed, 0 new issues).
- **Worktree residue (do not touch)**: 12 modified generated files (schema-cache +
  get-subjects*/get-sequences + zod/path-parameter mirrors) — the upstream-sync regen noise
  from gate-time online codegen. Solar's resync PR cures it AFTER #158 merges. Never stage them.
- **MERGE IS SOLAR'S** (Director-serialised). #158 merges FIRST, resync PR follows — Solar's
  17:02Z revision; no rebase needed (verified: fresh upstream spec v6a3c1f02 still carries the
  false frequency sentence VERBATIM, so the correction + removal-condition canary survive the
  resync).

## 2. Duties transferring to you (Solar's ruling, 17:02:13Z — no separate acceptance needed)

1. **#158 watcher to merge** + first-hand adjudication of any further comments. My watcher dies
   with my session; arm your own (poll shape: state/checks/comment-count/inline-count, terminal
   exit on MERGED/CLOSED).
2. **Turbo env micro-PR** (my 16:56:53Z acceptance transfers with the lane): declare
   `SDK_CODEGEN_MODE` on the turbo `sdk-codegen` task env + settle the cache-key/output
   posture; config-expert review. Cut AFTER #158 merges, off post-#158 main; confirm ordering
   vs Solar's resync PR at cut time. Evidence base: turbo strict env-mode strips undeclared
   vars (observed: `--force` offline run still fetched online); a poisoned cache entry replayed
   online-sync outputs over a clean tree (observed twice).
3. **S3 routing re-confirmation with Solar at G1b merge** (Radiant mid-c2; their first landing
   29e3eccb is in). S3 brief = Veiled's 14:44Z broadcast; lesson-builder + curriculum-mapper;
   principles-prompt is OWNER-GATED on attribution validation; tone-of-voice excluded.
4. **G4b stays G2-gated** (build spec: Iridescent's record §4; owner-ratified two-tool shape).

## 3. Decisions made this rotation (cite, don't re-open)

- **Correction applies ONLY at the MCP tool-description layer** (our product surface, already
  transformed at codegen); generated spec mirrors stay faithful to upstream; U1 upstream
  request is the cure at source.
- **House idiom**: corrections live in their own module mirroring PARAM_DESCRIPTION_OVERRIDES,
  with BOTH a removal-condition canary (fails when upstream rewording lands via schemaBase) and
  a served-surface drift-guard. `normaliseUpstreamDescription` is the single shared transform —
  pipeline and removal test always see the same form.
- **Served-name rename OUT of G4a scope** (owner-gated vocabulary; mechanism verified viable —
  third special-case override in `name-generator.ts`, zero hand-written ripple — recorded in my
  16:49Z directed event to Veiled, 89d93227, if G4b wants it).
- **Two-tool disambiguation note lands with G4b**, not before (no present-tense claims about a
  tool that does not exist yet).

## 4. Decisions deferred / open

- **Micro-PR cache posture**: env declaration is the clear half; whether sdk-codegen should
  stay turbo-cached at all (an online fetcher whose outputs vary by external state is a
  questionable cache citizen) — settle with config-expert in the micro-PR.
- **Codegen offline-mode anomaly (UNRESOLVED, low priority)**: one direct package-level
  `SDK_CODEGEN_MODE=ci pnpm sdk-codegen` run fetched online despite the env prefix (16:58Z);
  the runs before and after honoured the cache ("Using cached original OpenAPI schema").
  Unreproduced. Treat the mode line in the codegen log as the per-run proof; if it recurs,
  capture the full log and route to the micro-PR scope.
- **G4b decoration depth** (Iridescent §5.3) — design agency at G4b execution.

## 5. Operational gotchas (cost me time; save yours)

- Worktree git ops: ALWAYS `git -C ../oak-wt-umbral-g4` (you have this).
- The full gate chain at commit time runs sdk-codegen ONLINE via turbo — expect the 12-file
  residue to refresh in the working tree on every commit until the resync lands; staged
  explicit-pathspec bundles are unaffected.
- `pnpm sdk-codegen` at REPO ROOT = turbo (env-stripped, cache-replay risk). Offline regen =
  direct package run: `cd packages/sdks/oak-sdk-codegen && SDK_CODEGEN_MODE=ci pnpm sdk-codegen`,
  then CHECK the log for "Using cached original OpenAPI schema".
- The comms `watch` CLI stalls silently — use the portable poll loop (rule §Fallback); unique
  /tmp file names per agent (the rule's example paths collide between agents).
- **Full-gate flake (team-wide, surfaced in my closeout)**: `oak-search-sdk`
  `lifecycle-lease.integration.test.ts` › "recovers from transient renewal failure when next
  renewal succeeds" failed once under full parallel turbo load (commit-2 first attempt), passes
  9/9 in isolation — a timing race under load. If it reds your gate, characterise-in-isolation
  first; if it recurs, it needs a real fix in oak-search-sdk (route to Solar), not retries.
- **Verdict coordination on the Copilot inline finding**: I adjudicated it VALID and the cure is
  commit 2 (you broadcast a held REFUTE verdict at 17:11Z — discard it; my verdict reply on the
  PR is the record. The inconsistency was real at the contract level even though the current
  single entry was unaffected: the pipeline replaces against post-`normaliseUpstreamDescription`
  text while the removal test compared raw schemaBase text).

## 6. Pointers

- PR: <https://github.com/oaknational/oak-open-curriculum-ecosystem/pull/158>
- My key comms events: team-start 15:47:13Z; G4a mechanism verdict 89d93227; yield 3cc83e7c;
  Solar acks 3cf5bf15; PR-open note efb309f9.
- Iridescent design record: `.agent/state/collaboration/handoffs/2026-06-10-iridescent-g4-keywords-graph-design.md`
- U1 evidence: `.agent/plans/upstream-feature-requests/oak-open-api/keywords-finer-grained-control.md`
