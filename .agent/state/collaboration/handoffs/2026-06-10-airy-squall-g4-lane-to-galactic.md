---
from_agent: Airy Lifting Squall
from_session_prefix: "69dc9c"
from_id: 71b1bbff-be39-553b-a0e7-12196c4e1d01
to: Galactic Soaring Nebula (owner-named successor, prefix unknown at write time)
lane: G4 keywords seat (Umbral-successor) — duty list fully discharged; standing gates only
claim_id: none (350f4d73 + 2b9857c6 + 29e4fa13 all CLOSED with dispositions — clean rotation)
date: 2026-06-10
kind: natural-boundary rotation handoff (no in-flight source work)
---

# Handoff — G4 seat: Airy Lifting Squall → Galactic Soaring Nebula

Self-contained per `handoff-messages-self-contained.md`. Read this, then the two predecessor
records it builds on: `2026-06-10-iridescent-g4-keywords-graph-design.md` (the G4 design,
owner-ratified two-tool shape) and `2026-06-10-umbral-g4a-to-airy-squall.md` (G4a delivery +
lane decisions). The team opener
(`.agent/prompts/connecting-oak-resources/graph-implementation-team.prompt.md`) is the entry
ritual; Celestial Glowing Dusk (1e526e, id 516015df-a884-587f-9bdb-2b4319eff103) is Director.

## 1. Current state (verify first-hand before acting)

- **No in-flight source work; no open claims.** Three PRs went to main on this seat today:
  #158 (G4a description fix, Umbral's work, watched to merge `fa100b3a`), #159 (upstream+bulk
  resync, mine, `c60f030f`), #160 (turbo sdk-codegen env declaration, mine, `409c0999`).
- **Worktree `/Users/jim/code/oak/oak-wt-umbral-g4`** sits on merged branch
  `build/turbo-sdk-codegen-env`, clean tree. Adopt it: pull main, cut your next branch
  (`git -C` for EVERY git op — the shell cwd resets to the primary checkout between calls).
  Gitignored assets already staged in it: `apps/oak-search-cli/.env.local` and the refreshed
  `apps/oak-search-cli/bulk-downloads/` (manifest 2026-06-10T16:43:00.027Z) — neither rides a PR.
- **The tree re-dirtying defect is CLOSED** (#159 synced the schema cache; #160 made
  `SDK_CODEGEN_MODE=ci` work THROUGH turbo and mode-discriminated the cache keys). Full gate
  runs no longer dirty clean trees.

## 2. Standing duties (the seat's live obligations)

0. **G2 MINT-RULE DESIGN PULL-FORWARD — routed to this seat 19:07:52Z, UNSTARTED, transfers
   to you whole.** The Director's directed event (19:07:52Z) carries the full brief; in short:
   read-only analysis settling content-hash vs ordinal identity for misconception nodes, with a
   stability-across-regenerations contract. Ground against the FRESH bulk (2026-06-10T16:43Z,
   post-#159): duplication rates, ordinal stability under re-mine, the G1a kind-qualified id
   contract as constraint frame; recommend a mint rule + the contract-test shape. Adversarial
   review (architecture + assumptions minimum) BEFORE handing the Director the verdict; the
   deliverable shape is the Iridescent/G4-Gate-1 pattern (directed verdict event + foldable
   design note). The routing landed seconds before my owner-directed rotation — I did not start
   it; announce your pickup of it (or your decline) to the Director in your team-start.
1. **S3 routing re-confirmation with the Director at G1b merge.** S3 PRE-EMPTS the G2 design
   work if G1b lands first (Director's explicit sequencing; park design state in a note if so). G1b c2 is active on Seat B
   (Celestial Twinkling Orbit, 78c851, claim 3df980b5; c2-2 count-guard fix in progress as of
   19:02Z). The Director offered MY warm seat preferential S3 routing — that offer transfers to
   Director discretion at rotation; re-confirm with them. S3 context: Veiled's 14:44Z broadcast
   is the brief; c0 ratified in part — lesson-builder (reconciled) + curriculum-mapper cleared;
   principles-prompt OWNER-GATED on attribution validation; tone-of-voice excluded.
2. **G4b — bulk-derived keyword graph tool — stays G2-GATED.** Build spec: Iridescent record §4
   (folded into the plan's g4 todo). Do not start before G2 lands.
3. **Awareness**: `test:e2e` turbo env exposure (same class #160 cured) sits in the Director's
   queue as a follow-on micro-PR candidate — theirs to route, not yours to take unprompted.

## 3. Decisions made this rotation (cite, don't re-open)

- **Resync diff verification**: 16-file set matched the Director's reference exactly;
  generation-timestamp-only deltas ruled benign by Director first-hand diff (PROCEED, 17:39Z).
- **Turbo fix shape**: `env: ["SDK_CODEGEN_MODE", "CI", "VERCEL"]` on the `sdk-codegen` task
  (option A; config-expert approved against live official docs; `cache: false` rejected as
  costing every local gate run for no added soundness). `OAK_API_KEY` stays `passThroughEnv`.

## 4. Operational gotchas (cost this seat time; save yours)

- **Pin the SHA when pre-grounding a peer-owned PR**: I graded a held verdict against Umbral's
  LIVE worktree, which already carried their uncommitted fix — verdict was wrong (graded the
  cure, not the head). Ground against `git show <head-sha>:<path>`, never a live peer tree;
  cite the SHA in any held verdict. (Behaviour-note on the stream, 17:18:29Z.)
- **Shared gh auth hides the actor**: `mergedBy: jimCresswell` is true for EVERY agent and the
  owner alike. Actor provenance comes from the comms stream, never the GitHub login. (I
  mis-attributed #160's merge to the owner; the Director corrected on-stream 19:02Z.)
- **Honest wait-state heartbeat labels** (Director's failure-mode capture, 19:00Z): entering a
  potentially-long wait (owner ask, gate run), restart the heartbeat with a cycle label naming
  the wait (`blocked-on-owner-ask`, `idle-awaiting-owner-direction`) — heartbeat-only with a
  stale active label reads as stalled and draws pings.
- **Stall protocol works as written**: heartbeat-only 2-3 windows against a pending ask →
  bounded ping (one-cadence window, named default, never seize the merge) → owner surface.
  Applied to the Director today; verdict "your protocol was exactly right".
- **Comms watcher**: use the portable poll loop (rule §Fallback) with UNIQUE /tmp filenames
  (a predecessor's stale `/tmp/airy-team-start.md` collided with mine). The hardened CLI
  (#157) is in main but unverified by this seat.
- **`comms direct` argv hazards**: long bodies with parens/dashes break parsing — always
  `--body-file`. Empty body files are rejected.
- **Heartbeat CLI**: `--tag heartbeat` requires `--claim-id --intent-id --branch
  --current-cycle-label` and rejects `--body`. Free-string claim-id (e.g.
  `none-lane-discharged`) is accepted for idle states.
- **lifecycle-lease flake** (team-wide, from Umbral's closeout): `oak-search-sdk`
  `lifecycle-lease.integration.test.ts` can red a full parallel gate run; passes isolated.
  Characterise-in-isolation before treating the gate as truly red; recurrence = real fix, route
  to the Director.

## 5. Pointers

- PRs: #158 `fa100b3a`, #159 `c60f030f`, #160 `409c0999` (all in main).
- My key comms events: team-start 17:01:04Z; activation pickup 17:18:01Z; behaviour-note
  17:18:29Z; #159 delivery ca042ff6; #160 delivery 33ec94f4; bounded ping 960c44e8;
  lane-complete 19:00:40Z.
- Closed claims with dispositions: 350f4d73 (lane), 2b9857c6 (resync), 29e4fa13 (turbo) in
  `closed-claims.archive.json`. Note: 29e4fa13's summary says "owner-merged" — superseded by
  the Director's on-stream correction (Director-merged; the archive is append-only).
- Design lineage: Iridescent record → Umbral record → this record; plan g4 todo carries the
  folded design; `graph-tools-value-redesign.plan.md` is execution authority.
