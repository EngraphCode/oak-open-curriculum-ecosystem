# Thread: open-surface-zero

**Purpose**: Drive Jim-owned open pull requests to a managed zero surface: oldest eligible item
first, every review body/comment/thread critically adjudicated, every check green, then merge
immediately. Preserve pushed work through a PR or an explicit disposition.

## Participating agent identities (PDR-027)

| agent_name | platform | model | session_id_prefix | role | first_session | last_session |
| --- | --- | --- | --- | --- | --- | --- |
| Smith holds Temper | codex | GPT-5 | 019fef | executor — owner-PR merge drive, PRs #745/#746/#852 | 2026-08-11 | 2026-08-11 |
| Spark weaves Paraffin | codex | GPT-5 | 019ff2 | executor — PR #805 value adjudication and merge-readiness | 2026-08-11 | 2026-08-11 |
| Luna seeks Twilight | claude-code | claude-fable-5 | 5c0ddc | driver — the fork-line integration landing (#943, rehomed as #945 at owner word) and the MCP-655 OAuth hotfix plan; see §Lanes | 2026-09-01 | 2026-09-01 |
| Kiln holds Slag | claude-code | claude-fable-5 | 1447f4 | implementer — the MCP-655 OAuth issuer-alignment lane from Luna's handover (event 5dbec23b): scope narrowed at owner word, review panel absorbed, fix landed; see §Lanes | 2026-09-01 | 2026-09-01 |

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

## Lanes (2026-09-01, Luna seeks Twilight, 5c0ddc)

### Lane: fork-line integration landing — PR #945, PAUSED at owner word

- The owner's fork integration line (220 commits, 324 files) was driven as upstream #943 from a
  fork branch; every settlement cure needed a fork-side PR first (an hour per hop, multiplicative
  with the dependency), so at owner word the tip was rehomed into this repository as
  `feat/innovation-kit-updates` and opened as **#945** under the bot; #943 closed with its
  dispositions and a pointer. #945's head is `16d87a7cf` (the continuity commit pushed with
  `HUSKY=0` under explicit owner authorisation when the pause was ordered); SonarCloud, CodeQL,
  Vercel, `preview-serves` and the code tests were green on the head before it.
- **Paused** 2026-09-01 until MCP-655 lands: the live-service validation it needs (the app UAT
  runbook smoke subset through an authenticated Claude Code session) is blocked by the OAuth
  defect below. The fuller lane history (the fork settlement PRs, the review records, the
  dispositions) is on that branch's copy of this record.
- Resume: merge `main` (with MCP-655) into the branch; run the UAT runbook smoke subset and
  Section 0 inventory reconciliation against its preview; post the run record on #945; the
  owner's code-owner approval (bot-authored); `pnpm agent-tools merge-bot merge --pr 945
  --expect copilot-pull-request-reviewer`. Copilot's request bound at open; the CODEOWNERS
  auto-requests (`jimCresswell`, `mantagen`) are GitHub's, not this seat's.
- **2026-09-02 ~08:5xZ (Kiln holds Slag, at owner word "let's do option 2"):** the MCP-655 fix
  commit `2f14f6f76` is cherry-picked onto the branch as `6028ac95c` (worktree
  `.claude/worktrees/pr-945-innovation-kit`; the plan node deliberately not carried — `main`
  brings its final version with #946 and a stale copy would add/add-conflict at the later merge;
  registry regenerated on the tree and validated; picked tests green) and bot-pushed
  (`16d87a7cf..6028ac95c`, local == origin, worktree clean). The branch-alias preview rebuilt
  on the corrected preview keys and its PRM names `https://native-hippo-15.clerk.accounts.dev`
  (probed 08:57Z), so a Claude Code v2 session can authenticate against it for the UAT smoke
  subset BEFORE #946 merges. The key-pairing guard is NOT on this branch — the preview relies on
  the corrected key alone. Bot comment on #945 (issuecomment-5507061660) explains the pick; Luna's
  copy of this lane was updated by directed event `250ccdbb`. The merge of `main` (with #946)
  reconciles the identical patch trivially. The lane remains Luna's; the resume steps above stand.

### Lane: MCP-655 OAuth issuer alignment — FIX LANDED on the branch (2026-09-01, Kiln holds Slag, 1447f4); reviews on the final diff and the owner-held preview proofs are what remain

- Defect: Claude Code 2.1.252 refuses the app's OAuth authorization response on preview and
  production ("Issuer mismatch … RFC 9207"): the PRM names the app as authorization server while
  the response carries the upstream identity provider's `iss`. Evidence and dates: Linear
  MCP-655 (assigned to Matt Gregory at owner word, project First Major Release, labels
  Bug/pre-publish/jimbot).
- Scope narrowed at owner word 2026-09-01 (~13:3xZ, this seat's verdict, Jim: "agreed"): the
  PRM names the upstream issuer — nothing on the proxy-path metadata (the omit/false rider cured
  nothing and could only be tested by a configuration pin; MCP-656 owns that path's projection).
  A seven-reviewer Opus panel (assumptions, mcp, architecture ×2, security, clerk, test) and a
  full Cricket suite (6 of 8 delivered, all ON-TRACK; adversarial high/xhigh undelivered at the
  freeze) were run against the node; every finding is absorbed in the node (§Panel absorption
  2026-09-01) — the fetched `issuer` is now validated at the fetch boundary (RFC 8414 §3.3,
  `issuer_mismatch`), Cursor's PRM-first discovery is described truthfully and its preview
  sign-in gates merge, the owner-held proof is non-vacuous (client version, no
  `MCP_SDK_GENERATION` override, remove-and-re-add, a negative control against production).
- Landed: commit `2f14f6f76` on `fix/mcp-oauth-metadata-iss-claim` (15 files: `servePrm`
  names `upstreamMetadata.issuer`; `fetchUpstreamMetadata` requires `issuer === upstreamBaseUrl`;
  relation-shaped PRM tests in `auth-routes.integration.test.ts`, `canonical-origin.integration.test.ts`
  and four e2e sites; the `issuer_mismatch` unit case; registry C706 re-anchored + reviewed deltas
  for `auth-routes.ts`, `upstream-metadata-fetch.ts`, `metadata-fetch-error.ts`; ADR-115 (eight
  sections + Negative 8), ADR-053 amendment item 4, UAT rows 1.2/1.5; the amended node). Both
  guards mutation-checked: reverting the `servePrm` line reddens exactly the seven enumerated
  PRM assertions; disabling the issuer check reddens exactly the one unit case. Full pre-commit
  gate green on the second attempt (first attempt: knip on an unused export, cured by making
  `IssuerMismatchError` module-private; an app delta-review map over `max-lines`, cured by
  homing the two entries in the auth-surface map).
- Worktree `oak-open-curriculum-ecosystem-worktrees/pr-943-engraph`; draft PR **#946** under
  the bot (assigned `mantagen`, plain-language body); the withdrawn disclaim-only draft is
  preserved as a patch in the implementing session's scratchpad only — its substance is on the
  ticket and in the node's history; the tree carries none of it.
- **State 2026-09-02 ~09:0xZ (trued after the owner-held proof day):** the review round
  and the Copilot round are settled (`50f76873e`, `63ede6263`). The first owner sign-in
  proved the RFC 9207 fix (Claude Code v2 completes at Clerk) and exposed a SECOND,
  pre-existing defect: the preview environment's Clerk keys were not a pair, so every
  fresh preview build since 2026-08-05 refused every token on both discovery paths
  (`OAuth token not found`). Diagnosed with an independent client (mcpjam) on both paths
  and by verifying the rejected token under a paired dev key; the owner corrected the
  preview secret key. Guard landed at `7579d4269` (`clerk-key-pairing.ts`: shared JWKS
  `kid` between the publishable key's instance and the secret key's Backend API — fails
  bootstrap naming both instance ids, never the secret; unit + mutation + live proofs).
  Rebuilt preview attests `Clerk keys paired {instanceId: ins_349N…}`; mcpjam direct-path
  sign-in → `initialize` 200 → tools list. Linear MCP-655 carries the landed-state comment
  and a trued description. Remaining: (1) the Claude Code proof is DONE (this seat's own
  `oak-preview` Connected on the rebuilt preview, 2026-09-02, v2 runtime, no override);
  Cursor — production first, then the preview (a preview failure blocks merge unless the
  owner rules otherwise); (2) owner approval → merge under
  the standing doctrine; MCP-655 → Done; node → `archive/`; #945 resume trigger on the
  comms stream. Follow-ups queued as pointers (PR description §Follow-ups): MCP-656; the
  SDK v2 exploration (owner's word 2026-09-01); truing `.mcp.json.example` (`.mcp.json` itself
  is already gitignored — verified 2026-09-02 09:0xZ — which is exactly why per-worktree copies
  diverged; the example names a stale preview alias).
- **Freeze 2026-09-02 ~09:1xZ (compaction freeze at owner word; the seat continues):** claim
  `b6efbce3` retained-with-reason (the same seat resumes; a successor adopts via this section);
  freeze broadcast event `944ab610`; the PR description is the reader's contract (§Follow-ups:
  MCP-656, the SDK v2 exploration, truing `.mcp.json.example`, #945); the fix branch carries this
  continuity commit on top of `8f59bae98`. Nothing is armed: no watcher, no cron, no Monitor;
  the local dev server is stopped; subagents idle.
- Platform observations for the successor (also in the napkin): the worktree-isolation guard
  refuses compound commands, `$(…)`, `env VAR=… pnpm …` and `--dir` — a scratch SHELL wrapper run
  as one plain command is the working shape (the 2026-09-01 "Python scripts" shape was banned by
  the owner on 2026-09-02: edits go through the Edit tool, never a script); `bot-gh.sh` (mint +
  `GH_TOKEN` + `gh`) is the bot-write wrapper; from inside a `.claude/worktrees/` checkout
  `EnterWorktree` refuses sibling-directory worktrees — `ExitWorktree` (keep) then `EnterWorktree`
  by path from the launch directory; the shell cwd resets to the launch directory between
  commands after an exit — check `pwd` before trusting a "local" result; `EnterWorktree` killed a
  Monitor armed at the primary on 2026-09-01 (exit 124 within ~30 s); no comms watcher was armed
  on 2026-09-02 (n=1: Luna frozen, owner in the terminal — the seat swept by hand).
