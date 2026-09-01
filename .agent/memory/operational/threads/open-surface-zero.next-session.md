# Thread: open-surface-zero

**Purpose**: Drive Jim-owned open pull requests to a managed zero surface: oldest eligible item
first, every review body/comment/thread critically adjudicated, every check green, then merge
immediately. Preserve pushed work through a PR or an explicit disposition.

## Participating agent identities (PDR-027)

| agent_name | platform | model | session_id_prefix | role | first_session | last_session |
| --- | --- | --- | --- | --- | --- | --- |
| Smith holds Temper | codex | GPT-5 | 019fef | executor — owner-PR merge drive, PRs #745/#746/#852 | 2026-08-11 | 2026-08-11 |
| Spark weaves Paraffin | codex | GPT-5 | 019ff2 | executor — PR #805 value adjudication and merge-readiness | 2026-08-11 | 2026-08-11 |
| Luna seeks Twilight | claude-code | claude-fable-5 | 5c0ddc | driver — PR #943 (EngraphCode fork `engraph` → `main`): full drive taken at owner word 2026-09-01 by handoff from Genet mends Lamplight (cloud seat); Sonar-gate cure parcel + review truings via fork PR, then settlement and bot merge | 2026-09-01 | 2026-09-01 |

## Lane state

- **Owning plan**: [`open-surface-zero.plan.md`](../../../plans/delivery/open-surface-zero.plan.md).
- **Current objective**: finish the owner-routed remainder without adding approval gates or
  ceremony. Green CI plus every comment properly addressed is the merge condition.
- **Landed state**:
  - PR #745 merged from reviewed head `99a98d6aab38882934682bb7c7954ed7431a7c80` as merge commit
    `236a8e34374a964783062eac40e9153e1bdd9ca3`. The claim-freshness pilot now uses the strict
    `pinned | not-tracked` union and keeps enforcement truthfully in its later SessionStart slice.
  - PR #746 merged from reviewed head `83fe7845c5c42ed3c35c5310e70bc9a05c9828b9` as merge commit
    `9dbf78328cd2fcb53a3d0ef5718267f493aeef81`. Final harvest: every reported check green,
    14 issue comments, 25 review submissions, 15/15 threads resolved, zero late threads.
  - PRs #839 and #840 were correctly diagnosed by the owner as one indivisible CodeQL config
    change. They were closed in favour of combined PR #852. Its clean local/remote head is
    `68fd50402b556d05708c2b466566ae05fa0be839`; both CodeQL action references resolve to v4.37.6
    together, and the misleading deviation annotations are removed.
- **Current state** (corrected at the 2026-08-11 fold): PR #852 **merged at 13:10:40Z as
  `52bfdfb4d`** — owner-merged before this record was written, so nothing this session changed
  remains open. PR #746's amendment plan has a stale unchecked
  T5 box because its final remote harvest and merge necessarily occurred after the last branch
  commit; close/archive that record on the next appropriate plan-truing pass, not by reopening the
  merged delivery PR.
- **Terminal validation**: the enhanced-permission whole-repo `pnpm check` ran every turbo task and
  browser/UI leg successfully, then exited 1 on three links from tracked continuity files to this
  untracked machine-local record. Those links were converted to honest machine-local path text and
  the enhanced `pnpm docs-validators:check` rerun passed. The whole-repo run was not warning-free:
  it emitted substantial lint warnings, including 171 in
  `@oaknational/oak-curriculum-mcp-streamable-http`; that remains real red quality debt, not an
  expected-failure category or a carve-out.
- **Blockers / low-confidence areas**: no known content blocker. The sanctioned merge wrapper
  currently requires an expected reviewer to bind the exact tip and refused #746 as
  `SILENT-WAIT-RUN-DEAD` even though the owner's standing condition was satisfied. The merge used
  the same bot identity, exact-SHA pin and merge-commit method through GitHub's underlying endpoint.
  MCP-508 is the natural home for reconciling wrapper policy with the owner policy; do not let the
  mismatch recreate an approval wait meanwhile.
- **Next safe step**:
  1. #852 is already merged (`52bfdfb4d` at 13:10:40Z, owner-merged — fold correction
     2026-08-11); no re-harvest is owed on it.
  2. Resume the routed owner-author slice oldest-first: #805, then the custodial pair #818/#819.
     Re-fetch owner-authored tips immediately before edits. #841 merged 2026-08-11 06:53Z, owner-merged
     (corrected at the fold); #816 was not added to this owner-author slice. #774 remains on its dated hold and #846 remains
     with the design lane.
- **Promotion watchlist**:
  - merge-bot settlement semantics versus the owner's green-plus-comments-clear terminal rule;
  - publish-coherent-checkpoints as the structural cure for long invisible local review cycles;
  - split dependency/config bumps must be evaluated in their combined target state before either
    half is diagnosed.

## Standing owner directions carried by this thread

- Always run Git commands and quality gates with increased permissions.
- In a dedicated worktree, do not use the shared-checkout commit queue.
- Tools exist for efficiency and capability, not ceremony.
- A non-zero or failed check is a real failure; there is no "expected failure" workflow category.
- Use bot identity for GitHub writes, merge commits only, and freshly SHA-pinned merge calls.
- Fetch ALL comment surfaces and judge them critically; reviewer output is evidence, not authority.
- Linear updates are authorised when needed to keep the execution record true.
- Run a basic Cricket suite every 20 minutes during an active execution session.

## Worktree custody at the 2026-08-11 terminal handoff

- Primary checkout `coordination/2026-08-11-7b3df0` moved during terminal close from the
  pre-handoff parity point `31c28f28c` to peer-owned local HEAD `7586950e7`, one commit ahead of
  upstream. Do not attribute, amend, stage or push that peer commit as Smith's work.
- `.claude/worktrees/pr745-reconcile`: clean; local head equals the locally recorded remote tip
  `99a98d6aab38882934682bb7c7954ed7431a7c80`; PR merged.
- `.claude/worktrees/agent-ae83805b5d032d770`: clean; local head equals locally recorded remote
  `origin/jimcresswell/deploy-reliability-plan-node` at
  `83fe7845c5c42ed3c35c5310e70bc9a05c9828b9`; PR merged.
- `.claude/worktrees/codeql-action-4.37.6-atomic`: clean; its configured upstream is incorrectly
  `origin/main`, but the locally recorded PR remote ref equals local head
  `68fd50402b556d05708c2b466566ae05fa0be839`. Never use bare `git push` from this worktree; use the
  repository merge-bot push front door with the explicit branch.
- Claims `9b5ef380-af81-4bbc-9fdc-898c73d770f8` and
  `2f503217-50a7-4837-918f-ad6feb2620d4` were explicitly closed at 2026-08-11T13:36:45Z;
  `claims mine` returned `[]`. No claim or monitor is retained.

## Lanes

### Lane: upstream PR #943 drive — active (owner word 2026-09-01, "yes, we execute the plan")

- Branch: `fix/pr-943-sonar-gate-and-review-truings` in worktree
  `oak-open-curriculum-ecosystem-worktrees/pr-943-engraph` (sibling of the primary), cut from
  the fork's `engraph` tip `cb8315ecc` with the predecessor's four continuity commits merged in
  (`2c1da2ae6`); remote `engraph` = `https://github.com/EngraphCode/oak-open-curriculum-ecosystem.git`.
- Invocation pointer: this section plus the napkin entry "compaction-freeze harvest" of
  2026-09-01 ~13:0xZ (Luna seeks Twilight, 5c0ddc).
- Controlling plan: stated in-session and owner-approved 2026-09-01 (no plan node; the drive is
  one PR). Goal — #943 merges to `main` as the integration of the owner's `engraph` line: gate
  green, every finding dispositioned with evidence. The decisions the PR carries are the owner's
  (the fork's 30 PRs, all his; commit history is the record) and are not re-opened by this lane.
- Completed prerequisites: handoff from Genet mends Lamplight absorbed and acked on the #943
  record (comments 5492784311 / 5492821280); `jimbot` label on #943; identity row above; claim
  on this thread (areas `engraph`, `pr:943`); Sonar set enumerated (100 findings, two
  cloud-environment scripts) and cured at source with the local preflight run byte-identical
  before/after; the two suppressed Copilot findings verified real and cured; commit messages
  drafted and commitlint-clean in the session scratchpad; full agent-tools suite, repo
  validators, Prettier, markdownlint green; ESLint 0 errors once `identity.ts` is split.
- Landed on the branch (2026-09-01, hooks green each time): `ddd5fae5a` the shell cure;
  `c93ac7be0` the seed-definition truings with `identity.ts` split at its seed-resolution
  seam into `collaboration-seed.ts` (public exports unchanged); `867d2c644` the plan evidence,
  this record, and the napkin; `717ccc4cf` the https-only curl options written literally at
  every call site (the code-expert's blocking finding: an array expansion hides `--proto`
  from a text-matching analyser — the ten literal-URL sites were flagged, the six
  variable-URL sites were not) with the preflight's gitleaks probe carrying the same
  constraint as setup's fetch; `aac6a00fb` the `fail()`-routed presence checks in setup (a
  bare `[[ ]]` leaves `PIPESTATUS` stale on the ERR-trap failure card — RUN-proven both
  ways), `phase()`'s local/return, and PDR-076/076a on the one prefix definition. The
  code-expert review dispatched pre-compaction reported after all (its mailbox delivered
  post-compaction): the split APPROVED at line granularity, seven findings, all dispositioned
  on the fork PR record; a second bounded dispatch ran on the pushed parcel.
- Pushed to the fork under the owner's credential with the canonical shared-credential marker
  (owner ruling 2026-09-01: the bot app has no access to EngraphCode). Fork PR
  **EngraphCode#36** → `engraph` (base explicit) open 2026-09-01 with the PDR-140 intake
  contract — #943's second and LAST settlement push; Copilot requested via the GitHub MCP at
  open (the ruleset's `copilot_code_review` rule did not auto-request); watch armed with
  `pnpm agent-tools:pr-watch 36 --repo EngraphCode/oak-open-curriculum-ecosystem --watch`.
- Next safe step: (1) #36 to green-and-clean under the fork ruleset (`run-quality-gates` +
  `CodeQL` strict, every thread resolved, zero approvals required; commits attributed — the
  bot app, and `noreply@anthropic.com` maps to login `claude`) and merge with a merge commit
  under the owner's credential as #35 was; Copilot findings triaged under the intake
  contract; (2) #943 settlement: Sonar rescans the new head, full-surface harvest, reviewer
  legs SATISFIED/SKIPPED (mantagen requested at PR-open by the cloud seat — a colleague on
  trust, never chased), code-owner leg (auto-satisfied: the author is the owner), bot REST
  merge at settled-READY, Phase-8 harvest; watch with `pnpm agent-tools:pr-watch`, never a
  hand-rolled script. Not this parcel, homed here as a pointer: `lint:shell:syntax` covers
  neither cloud-environment script, so CI has no syntax gate on them — a package.json gate
  change for its own small PR.
- Acceptance bar: SonarCloud passes on #943's new head; zero undispositioned findings across
  threads and review bodies at the merge instant; the shell change proven behaviour-identical;
  no file in the parcel loses documentation to a limit.
- Team expectation: solo lane. Peer Rowan calls Dewfall (39eb53) holds #944 (MCP-122) in its own
  worktree; the Director seat (Avocet guards Updraft, claim f04cd57b) is frozen from the
  2026-08-19 week-sleep; the cloud seat stood down its automation. The primary checkout is on
  `main` (not the coordination branch) with two uncommitted MCP-122 edits and an untracked
  `sonar-943.json` that pre-date every live seat — left alone.
- Known facts for the successor: `sonar verify --file` is unavailable to this org (403 "Vortex
  Analysis"); the gate proof is the PR scan; `lint:shell` does not cover
  `.agent/claude-harness-integrations/*.sh`, so shellcheck is run by hand; fork PRs get a
  base-repo `startup_failure` run on `deployment_status` (fork-only head; not a required check,
  recorded on the PR); the fork's `engraph` ruleset requires `run-quality-gates` + CodeQL
  (strict up-to-date) and thread resolution, no auto Copilot.
