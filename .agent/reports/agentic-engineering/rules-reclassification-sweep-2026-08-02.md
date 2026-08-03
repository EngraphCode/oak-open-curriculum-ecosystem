# Frame-Challenge — Rules Reclassification Sweep

**Method note:** every challenged row was read in full from `.agent/rules/`. Mechanism claims behind GRADUATE-OUT proposals were verified first-hand against `.agent/hooks/policy.json`, `package.json`, `.claude/settings.json`, and `packages/core/oak-eslint/src/configs/{recommended,strict}.ts` rather than taken from rule text or leg assertions.

**Standing test applied throughout — WHO RECOGNISES THE TRIGGER.** A demotion is safe only when the *loader* (a path match, a tool-call match, a session-shape flag, or an always-invoked ceremony skill) can recognise the moment. When recognition depends on the *agent* noticing "I am now in situation X", the agent must already remember the rule to know to load it — which is the failure the rule exists to prevent. Triggers of the form `surface:<path>`, `tool:<call>`, and `session:<shape>` mostly pass. Triggers of the form `ceremony:<judgement>` pass only where a named skill reliably fires and carries the pointer.

---

## 1. CHALLENGED LIST

### 1a. Demotions that fail recognition-reliability → counter CORE

| Rule | Proposed | Why the proposal is unsafe | Counter-proposal |
|---|---|---|---|
| `identify-as-agent-under-shared-credentials.md` | SITUATIONAL `tool:github-write` | The rule's own §Trigger extends to "any non-GitHub outward surface (a vendor dashboard, external tracker, or published page)", and §Scope Nuance adds an **inverted, reading-side clause** — "attributing past actions… use the comms stream and claim dispositions, never the GitHub actor field". A write-tool trigger structurally cannot fire during a *read/audit*. §Enforcement states "There is no write-time hook today." Its sibling `bot-identity-on-third-party-systems` was kept CORE on evidence that three seats each mis-filed identity duty "under the noun in its tooling's name" — this demotion re-creates exactly that mis-filing. | **CORE** |
| `subagent-practice-core-protection.md` | SITUATIONAL `session:subagent` | The rule binds a session that must first know it *is* a subagent. Estate-held evidence says self-introspection of session shape is unreliable ("Fork of a live seat: designation is external… introspection returns the parent's role and is wrong"). It also protects `.agent/rules/` itself — i.e. a subagent that mis-identifies loses the only rule stopping it editing the corpus that would have told it. Its final clause ("Blocked paths are findings, never routes to work around", conserved exhibit: a subagent wrote files via a Python shell to bypass a blocked edit path) is a pure bias-correction that fires on *any* block, not on practice-core paths. Cost of keeping it ambient is ~65 lines; cost of missing it is corpus corruption. | **CORE** |
| `new-rule-vs-pdr-clause.md` | SITUATIONAL `ceremony:doctrine-authoring` | The rule "fires before the first line of new doctrine is written" — the moment *before* the author has classified the substance. Failing to notice that an added bullet is doctrine IS the mis-routing it prevents. Structurally decisive: `RULES_INDEX.md` names this rule as the governor of tier changes ("moving a rule between classifications requires a new-rule-vs-pdr-clause-style decision"), so it governs this very sweep. A meta-rule that must fire on unrecognised authoring moments cannot be loaded by recognising the authoring moment. | **CORE** |
| `executive-memory-drift-capture.md` | SITUATIONAL `surface:executive-memory` | The rule exists *because* there is no capture edge: "executive-memory surfaces drift silently by default because they are catalogues, not learning loops — there is no capture edge inside executive memory itself. The active-plane napkin IS the capture edge." A trigger keyed to the executive surface re-creates the missing edge as the loading condition. The real firing moment is in the *active* plane (a session observation contradicting a catalogue), which is a content judgement no loader can match. | **CORE** |
| `per-user-memory-is-a-buffer.md` | SITUATIONAL `ceremony:consolidation` | The drainage duty is ceremony-gated, but §"No Mutable State As a Standing Fact" states its own scope: "This guard applies to **every durable memory surface** (per-user `MEMORY.md` and entries, `distilled.md`, patterns), not only the per-user buffer." That fires at every durable memory *write*, which happens ad hoc mid-session. Worked failure cited (2026-06-16 "collaboration is paused" read as current two days after supersession) is a write-time defect, not a consolidation-time one. | **CORE** (or demote only after the mutable-state clause is separately homed in an always-on surface) |
| `validators-must-recompute-not-just-record.md` | SITUATIONAL `ceremony:validator-authoring` | The 2026-07-30 consolidation broadened it past validator authoring into **read- and write-time identifier integrity**: "Liveness read from a stored status… freshness is recomputed against the clock at read time"; "Sequential identifiers at write time… F-150 assigned twice"; "Id references at use". Reading a claims row's freshness label is not "authoring a validator" — the worked instance is a stale Director claim running ~28h past its bound because "raw-JSON readers bypass any CLI-side cure, so the recompute must live in every read surface". This is the estate's false-green family, adjacent to the CORE `validate-full-target-estate`. | **CORE** |
| `verify-vendor-call-shapes-at-plan-author-time.md` | SITUATIONAL `ceremony:plan-authoring` | The title names the narrow case; the body broadens it twice past plan bodies: "The same discipline covers **the agent's mental model of vendor and platform behaviour**… MCP client capability support, vendor CLI modes and version gaps, and SDK semantics are repeatedly wrong in the model's priors", and the owner rule of 2026-07-25 "Capability answers come from ORIGINAL vendor sources at time of use". That is `verify-dont-trust` shaped — a fluency bias with no firing moment. Worked flip *inside one hour* on a four-day-stale capability verdict. | **CORE** |
| `design-work-for-small-prs.md` | SITUATIONAL `ceremony:planning` | Owner permanent doctrine, verbatim and escalated ("that is now a permanent rule and doctrine"). The rule's own worked instances — the 92-file PR with 43 non-converging threads, the 30-file PR that ran ten review rounds — are precisely cases where nobody believed they were at "work-SHAPING time". Much work in this estate begins without a plan, ticket, or stack ceremony, and it is exactly that unplanned work that balloons. The rule itself rejects the downstream backstop: "It does not first fire at PR-open; by then a mis-shaped changeset is already expensive to split." | **CORE** |
| `worktree-hygiene.md` | SITUATIONAL `ceremony:worktree-lifecycle` | The rule self-declares its trigger *and* its own recognition failure in the same sentence: it fires "before the first Write/Edit outside `.agent/`-class coordination surfaces, answer *which worktree am I in?*" — installed after "a seat's product edits sat uncommitted on the shared tree" (owner word, 2026-07-27). A session that would ask the question does not need the rule; a session that would not ask cannot trigger its load. The "first source edit" moment has no ceremony and no skill. | **CORE** |
| `source-curriculum-content-via-api-not-cdn.md` | SITUATIONAL `surface:curriculum-content-fetch` | This is a content-**safety** boundary (TPC rights-clearance), and the recorded failure was exactly non-recognition: "an API-returned CDN URL does not make a direct raw-CDN fetch safe — **even when the API itself handed you the URL**". The agent holding a URL from a `get-lessons-quiz` payload does not classify itself as being in a raw-CDN situation. §Enforcement: "No global hook." | **CORE**, until a PreToolUse host-pattern guard on `cloudinary-res.thenational.academy` exists; that guard is the honest graduation and would then permit demotion |
| `worktree-residency.md` | GRADUATE-OUT (PostToolUse hook on `Shell cwd was reset`) | Two independent failures. (a) **The mechanism does not exist** — the rule calls it "A future hardening candidate, pointer-grade", and I verified `.claude/settings.json` has no `PostToolUse` entry at all. (b) **Graduation is self-defeating**: the rule states "This rule is the standing project instruction that directs worktree use (the `EnterWorktree` tool acts on explicit instruction from the user or **from project instructions** — this rule is that instruction)". Remove it from baseline and `EnterWorktree`'s own precondition disappears. Clause 8 (pre-PR contamination check) is the cure that cost PR #673 a close-and-succeed cycle. | **CORE** (owner directive 2026-07-31); the platform-mechanics block may be version-pinned into a residency reference, the invariant stays |

### 1b. Graduations whose named mechanism cannot carry the substance

| Rule | Proposed | Why the proposal is unsafe | Counter-proposal |
|---|---|---|---|
| `stage-by-explicit-pathspec.md` | GRADUATE-OUT (Bash hook, verified) | The hook exists but blocks **exactly three literal strings** — I confirmed `.agent/hooks/policy.json` carries `git add -A`, `git add --all`, `git add .` and nothing else. `git add -u`, `git add :/`, `git add <dir>/`, and `git commit -a` are all unblocked and all violate "every addition must be an act of intent". Graduating on a three-string fingerprint is the exact defect `hook-policy-substring-discipline` (kept CORE) warns about. | **SITUATIONAL** `ceremony:commit` (carried by the always-active `oak-commit` skill); graduate only after the blocked set covers the residual staging verbs |
| `markdown-code-blocks-must-have-language.md` | GRADUATE-OUT (MD040 gate) | MD040 is genuinely gated (verified: `markdownlint-check:root` sits inside `pnpm check` and `check:docs`). But the rule's second half is a **process guard against the repo's own fixer**: "when MD004 fires on a prose line, reword the line; never blind `--fix` a prose-bearing file". I verified `pnpm markdownlint:root` = `markdownlint-cli2 --fix` and that it is invoked by three routine scripts — `make`, `fix`, `fix:docs`. Graduating to the check-only gate leaves the mutating path running over prose with nothing warning about the meaning-corrupting `+`→`-` rewrite. A lint gate cannot warn about the lint fixer. | **SITUATIONAL** `surface:markdown-authoring` + `tool:gate-sweep` (autofix invocation); the MD040 obligation itself may drop from the rule text as already-gated |
| `use-result-pattern.md` | GRADUATE-OUT (`no-throw-statement` + `preserve-caught-error`) | Verified: `packages/core/oak-eslint/src/configs/recommended.ts:221` registers `'@oaknational/no-throw-statement': 'warn'`, and workspace lint scripts are bare `eslint .` with no `--max-warnings=0`. "Never throw exceptions" is therefore **not gate-blocking anywhere today**. Graduating a rule onto a non-blocking warning converts a no-exceptions discipline into advisory noise. | **SITUATIONAL** `surface:source-authoring`; graduation unblocks the day `no-throw-statement` is `'error'` (or lint runs `--max-warnings=0`) |
| `lint-after-edit.md` | GRADUATE-OUT (PostToolUse lint hook) | Verified: **no `PostToolUse` hook is configured** in `.claude/settings.json`. The leg's own wording concedes it ("only auto-firing needs wiring"). Graduating onto an unbuilt mechanism deletes the behaviour. | **SITUATIONAL** `surface:source-authoring`; the graduation is correct and cheap — land the hook in the same commit that drops the rule, not before |
| `monitor-branch-touched-files.md` | GRADUATE-OUT (wire the existing CLI into a hook) | The count is mechanical and the CLI exists, but nothing invokes it and no hook is proposed as built. Worse, the substance a warning cannot carry is the **response**: at soft-or-higher the rule demands seven written answers and, at hard/critical, "the next action should be planning and split analysis, not more implementation". A threshold emitter produces a number; the split discipline is judgement. | **SITUATIONAL** `ceremony:commit` ∪ `session:open` (the rule's own named moments); the count graduates to a hook, the response stays a rule |
| `source-is-typescript-esm-only.md` | GRADUATE-OUT (lint + `type: module` + ADR-001/168) | No extension-ban lint rule exists (I inventoried `packages/core/oak-eslint/src/rules/` — there is none). And the load-bearing clause is a judgement the owner sharpened on 2026-07-30: the bar for JS exceptions is "high, high", and "an exception never justifies keeping EXISTING hand-authored JS — surviving `.js` files are rewrite candidates, not grandfathered". No lint expresses "rewrite candidate", and "shell only where it significantly reduces effort" is pure judgement. | **SITUATIONAL** `surface:source-authoring` (the rule already names its own trigger: creating any source/executable file, or reviewing a diff adding `.js/.mjs/.cjs/.sh`) |
| `no-conditional-tests.md` | GRADUATE-OUT (custom ESLint rule) | The enumerated APIs are lint-detectable; the rule's actual dividing line is not — "does the suite produce identical pass/fail behaviour, the same registered test count, and the same assertion set on every machine". Diagnosis #5 (the shape-narrowing guard that "reads as proof") is generic `if`/`expect` control flow no linter can distinguish from legitimate setup, and the 2026-08-02 owner-carded amendment (expect-guard permitted, if-guard forbidden, try/catch still forbidden) is a live adjudication that a lint rule would silently flatten. | **SITUATIONAL** `surface:test-authoring`; enumerable mechanisms graduate to lint *in addition*, not instead |
| `no-global-state-in-tests.md` | GRADUATE-OUT (custom ESLint rule) | Partially already true — verified `@oaknational/no-real-io-in-tests` fires on `process.env` access in `*.test.ts` under `strict`. Unverified: `vi.stubGlobal` / `vi.mock` / `vi.doMock` bans, ambient `.env`, and `process.cwd()`. The composition-root carve-out ("the Vitest runner config or spawn invocation may read ambient env, validate it, and inject") plus "Simple fakes are injected as constructor arguments, not complex mocks" are DI design guidance. | **GRADUATE-OUT, conditional**: verify or land the `vi.*` bans first; route the DI guidance to ADR-078 explicitly rather than assuming it |
| `capture-practice-tool-feedback.md` | GRADUATE-OUT (fold the "Suggested Napkin Shape" template into `oak-napkin`) | The receiving home is sound (`oak-napkin` is unconditional), but the proposal names only the *template*. The behaviour-changing clause is the other half: "This is **not limited to failures**. Record frustrations, friction, surprises, insights, ideas, wishlist items… These subjective and ergonomic signals are first-class evidence." Folding the template alone silently narrows capture back to failure-logging — which is the default the rule was written to correct. Note also `agent-experience-review-lens` clause 3 depends on this rule by name. | **GRADUATE-OUT, conditional**: the behavioural clause lands verbatim in `oak-napkin`, and the AX-lens cross-reference is re-pointed in the same commit |

### 1c. Trigger widened / partial graduation rejected (class accepted)

| Rule | Proposed | Why as-stated is unsafe | Counter-proposal |
|---|---|---|---|
| `continuity-surface-commits-as-orphans.md` | SITUATIONAL `ceremony:session-handoff` | The rule's primary obligation binds the **cycle committer mid-session**: continuity edits land "never bundled with the cycle commit that produced them". Loading only at session-handoff leaves every mid-session `oak-commit` free to sweep `napkin.md`, `active-claims.json`, and thread records into a product commit — the exact bundling the rule forbids, and a direct interaction with `stage-by-explicit-pathspec`. | SITUATIONAL, trigger = **`ceremony:commit`** (superset of session-handoff) |
| `directive-file-context-budget.md` | SITUATIONAL `surface:directive-files` | Path trigger is reliable for the edit itself, but §"Sequencing Within a Consolidation Pass" binds at consolidation *open* — directives are step 5 of 5, and by the time a directive file is opened the context budget is already spent. | SITUATIONAL, trigger = `surface:directive-files` **∪ `ceremony:consolidation`** |
| `pr-comments-resolve-and-recheck.md` | SITUATIONAL `ceremony:pr-lifecycle` + partial fold into `oak-pr-lifecycle` skill | The situational class is sound — "opening (or taking over) a PR **binds that session** to this rule" is a session-scoped, self-evident state. The **partial graduation is not**: the worked failure (PR #315, "fully green — ready for your merge" from the checks table alone) is a declaration made *without* running the lifecycle skill. Moving the substance into the skill makes the skill's non-invocation the failure path. | SITUATIONAL `ceremony:pr-lifecycle`, session-scoped binding; **reject the fold** until F-130's mechanical merge-ready verifier lands |
| `agent-experience-review-lens.md` | SITUATIONAL `surface:agent-substrate` | Accepted — the rule self-scopes ("It fires on substrate work specifically — it is not a gate on every edit"). Residual: "generated agent artefact" is not path-enumerable. | SITUATIONAL, trigger enumerated as a **path set** (`.agent/**`, `agent-tools/**`, hooks, watchers, coordination CLIs, quality gates) so the loader matches paths, not a category |
| `tdd-for-refactoring.md` | SITUATIONAL `ceremony:refactor` | "Am I refactoring?" is not reliably recognised — a signature change during feature work is not labelled a refactor by the agent making it. But the file is a 7-line pointer to `.agent/directives/testing-strategy.md`, which every session already reads. | **GRADUATE-OUT** into `.agent/directives/testing-strategy.md` — shrinks the corpus *and* keeps always-on reach, which the situational proposal loses |
| `invoke-code-experts.md` | CORE (promotion from trigger-loaded) | Not a demotion, but it is the sweep's only net baseline *increase* and it was proposed without a cited failure instance; it also splits the `invoke-*` family across two classes. | Accept CORE as the conservative call, **owner card**: gateway-only promotion vs family consistency |

**Accepted graduations, verified safe (recorded so they are not re-litigated):** `no-skipped-tests` — `vitest/no-disabled-tests` + `vitest/no-focused-tests` at `'error'` in `strict.ts`, adopted by ~20 workspace configs. `unknown-is-type-destruction` and `no-type-shortcuts` — `RECOMMENDED_RESTRICTED_TYPES` / `strict.ts` restricted-type bans. `no-machine-local-paths` — validator + PreToolUse hook + CI, with one residual worth a line in the receiving skill: the scanner reads *tracked files*, not outward text such as PR comments or Notion bodies. `test-immediate-fails` — self-declares as "the fast gate `test-expert` applies first", so the reviewer brief is its stated home.

---

## 2. CONSOLIDATED TRIGGER VOCABULARY

Four families. Merges applied: `ceremony:planning` → `ceremony:plan-authoring`; `surface:design-value` + `surface:design-tokens` → `surface:design`; `session:team-open` + `session:team-active` → `session:team`; `ceremony:commit-bundling` → `ceremony:commit`; `content:collaboration-authoring` → `surface:collaboration-state`; `session:subagent` retired (its only member is now CORE).

**`surface:*` — a path, file class, or data surface a loader can match (17 instances)**

| Instance | Member rules |
|---|---|
| `surface:accessibility` | invoke-accessibility-expert |
| `surface:agent-substrate` | agent-experience-review-lens |
| `surface:clerk-auth` | invoke-clerk-expert |
| `surface:codegen` | generator-first-mindset |
| `surface:collaboration-state` | sha-prefix-in-collaboration-content |
| `surface:cross-repo` | cross-repo-sessions-run-the-join-ceremony |
| `surface:dependency-management` | lockfile-rebuild-survivability |
| `surface:design` | design-values-come-from-the-system, invoke-design-system-expert |
| `surface:directive-files` | directive-file-context-budget |
| `surface:eef-corpus` | eef-corpus-grounding |
| `surface:elasticsearch` | invoke-elasticsearch-expert |
| `surface:markdown-authoring` | markdown-code-blocks-must-have-language |
| `surface:mcp-protocol` | invoke-mcp-expert |
| `surface:nextjs` | read-nextjs-docs-before-coding |
| `surface:observability` | invoke-sentry-expert |
| `surface:practice-core` | practice-core-portability |
| `surface:react-component` | invoke-react-component-expert |
| `surface:source-authoring` | lint-after-edit, source-is-typescript-esm-only, use-result-pattern |
| `surface:test-authoring` | no-conditional-tests |

**`ceremony:*` — a named workflow step; safe only where a skill reliably fires and carries the pointer (9 instances)**

| Instance | Member rules | Carrier skill |
|---|---|---|
| `ceremony:branch-cut` | coordination-branch-24h-lifetime | oak-coordination-fold |
| `ceremony:commit` | continuity-surface-commits-as-orphans, monitor-branch-touched-files, ship-independent-coordinate-dependent, stage-by-explicit-pathspec | oak-commit (unconditional) |
| `ceremony:consolidation` | directive-file-context-budget (∪ surface) | oak-consolidate-docs, oak-session-handoff |
| `ceremony:loop-cycle` | pre-execution-code-expert-review-per-loop-cycle | start-right-team `/loop` |
| `ceremony:merge` | pre-merge-divergence-analysis | oak-complex-merge |
| `ceremony:plan-authoring` | invoke-assumptions-expert | oak-plan |
| `ceremony:pr-lifecycle` | pr-comments-resolve-and-recheck | oak-pr-lifecycle |
| `ceremony:significant-doc-change` | invoke-doc-and-onboarding-experts-on-significant-changes | — (reviewer dispatch) |
| `ceremony:skill-authoring` / `ceremony:skill-vendoring` | skill-naming-and-description-quality; third-party-skills-require-security-review | skill-creator; skills-lock gate |

**`tool:*` — a specific tool call or command class the loader matches (6 instances)**

| Instance | Member rules |
|---|---|
| `tool:agent-tools-cli` | use-built-agent-tools-cli |
| `tool:background-task-arm` | use-monitor-for-event-driven-wake |
| `tool:chrome-browser` | oak-chrome-session-is-metered |
| `tool:gate-sweep` | check-singleton-per-window, markdown-code-blocks-must-have-language (autofix leg) |
| `tool:loop-cron-monitor` | loop-exit-criteria-required |
| `tool:notion` | notion-page-edits-update-ledger |
| `tool:sonarqube-mcp` | sonarqube-mcp-instructions |

**`session:*` — a structural session shape known at bootstrap (1 instance)**

| Instance | Member rules |
|---|---|
| `session:team` | comms-all-channels-watcher, directed-routing-requires-absorption-ack, liveness-heartbeat-cron, ping-before-escalate, use-agent-comms-log |

**Loader contract (a landing condition, not a classification):** `surface:*` and `tool:*` instances must be enumerated as path globs / command patterns in the loader config. `ceremony:*` instances must be carried by the named skill's own text. `session:team` loads at team bootstrap and at rejoin-after-compaction. A situational rule with no loader entry is a deleted rule.

---

## 3. FINAL PROPOSAL TABLE

⚑ = contested, surface as an owner card. Class shown is post-challenge.

| # | Rule | Final | Trigger / graduation home |
|---|---|---|---|
| 1 | agent-experience-review-lens | SITUATIONAL | `surface:agent-substrate` (enumerate paths) |
| 2 | agent-state-observable | CORE | — |
| 3 | agentic-judgment-conserve-by-default | CORE | — |
| 4 | agents-default-no-gender | CORE | — |
| 5 | apply-architectural-principles | CORE | — |
| 6 | bot-identity-on-third-party-systems | CORE | — |
| 7 | capture-practice-tool-feedback | GRADUATE ⚑ | `oak-napkin` skill — behavioural clause must land, not just the template |
| 8 | check-singleton-per-window | SITUATIONAL | `tool:gate-sweep` |
| 9 | closed-shape-design-optionality | CORE | — |
| 10 | collaboration-is-value-contingent | CORE | — |
| 11 | comms-all-channels-watcher | SITUATIONAL | `session:team` |
| 12 | confident-seats-proceed-and-report | CORE | — |
| 13 | consolidate-at-second-consumer | CORE | — |
| 14 | continuity-surface-commits-as-orphans | SITUATIONAL ⚑ | `ceremony:commit` (widened from session-handoff) |
| 15 | coordination-branch-24h-lifetime | SITUATIONAL | `ceremony:branch-cut` |
| 16 | cross-repo-sessions-run-the-join-ceremony | SITUATIONAL | `surface:cross-repo` |
| 17 | design-from-impact-not-the-cowpath | CORE | — |
| 18 | design-values-come-from-the-system | SITUATIONAL | `surface:design` |
| 19 | design-work-for-small-prs | CORE ⚑ | challenged up from `ceremony:planning` |
| 20 | directed-routing-requires-absorption-ack | SITUATIONAL | `session:team` |
| 21 | directive-file-context-budget | SITUATIONAL ⚑ | `surface:directive-files` ∪ `ceremony:consolidation` |
| 22 | documentation-hygiene | CORE | — |
| 23 | dont-break-build-without-fix-plan | CORE | — |
| 24 | eef-corpus-grounding | SITUATIONAL | `surface:eef-corpus` |
| 25 | executive-memory-drift-capture | CORE ⚑ | challenged up |
| 26 | exit-codes-in-band-never-piped | CORE | — |
| 27 | follow-agent-collaboration-practice | CORE | — |
| 28 | follow-collaboration-practice | CORE | — |
| 29 | follow-the-practice | CORE | — |
| 30 | generator-first-mindset | SITUATIONAL | `surface:codegen` (graduation into `schema-first-execution.md` is a viable alternative) |
| 31 | handoff-messages-self-contained | CORE | — |
| 32 | hook-policy-substring-discipline | CORE | — |
| 33 | identify-as-agent-under-shared-credentials | CORE ⚑ | challenged up |
| 34 | important-state-not-in-temp-files | CORE | — |
| 35 | invoke-accessibility-expert | SITUATIONAL | `surface:accessibility` |
| 36 | invoke-assumptions-expert | SITUATIONAL | `ceremony:plan-authoring` |
| 37 | invoke-clerk-expert | SITUATIONAL | `surface:clerk-auth` |
| 38 | invoke-code-experts | CORE ⚑ | promotion; family-consistency card |
| 39 | invoke-design-system-expert | SITUATIONAL | `surface:design` |
| 40 | invoke-doc-and-onboarding-experts… | SITUATIONAL | `ceremony:significant-doc-change` |
| 41 | invoke-elasticsearch-expert | SITUATIONAL | `surface:elasticsearch` |
| 42 | invoke-mcp-expert | SITUATIONAL | `surface:mcp-protocol` |
| 43 | invoke-react-component-expert | SITUATIONAL | `surface:react-component` |
| 44 | invoke-sentry-expert | SITUATIONAL | `surface:observability` |
| 45 | knowledge-preservation-over-fitness-warnings | CORE | — |
| 46 | lint-after-edit | SITUATIONAL ⚑ | `surface:source-authoring`; graduates when the PostToolUse hook lands |
| 47 | liveness-heartbeat-cron | SITUATIONAL | `session:team` |
| 48 | local-broken-code-never-leaves | CORE | — |
| 49 | lockfile-rebuild-survivability | SITUATIONAL | `surface:dependency-management` (include dependency-mutating commands) |
| 50 | loop-exit-criteria-required | SITUATIONAL | `tool:loop-cron-monitor` |
| 51 | markdown-code-blocks-must-have-language | SITUATIONAL ⚑ | `surface:markdown-authoring` + autofix guard; MD040 half already gated |
| 52 | monitor-branch-touched-files | SITUATIONAL ⚑ | `ceremony:commit` ∪ `session:open`; count graduates to a hook |
| 53 | never-commit-to-main | CORE | — |
| 54 | never-disable-checks | CORE | — |
| 55 | never-use-git-to-remove-work | CORE | — |
| 56 | new-rule-vs-pdr-clause | CORE ⚑ | challenged up |
| 57 | no-conditional-tests | SITUATIONAL ⚑ | `surface:test-authoring`; lint in addition |
| 58 | no-global-state-in-tests | GRADUATE ⚑ | ESLint — conditional on `vi.*` bans existing |
| 59 | no-hedging-vocabulary | CORE | — |
| 60 | no-machine-local-paths | GRADUATE | validator + hook + CI (verified) |
| 61 | no-moving-targets-in-permanent-docs | CORE | — |
| 62 | no-parallel-long-lived-branches | CORE | — |
| 63 | no-skipped-tests | GRADUATE | `vitest/no-disabled-tests` + `no-focused-tests` at error (verified) |
| 64 | no-speed-pressure | CORE | — |
| 65 | no-tombstones-for-removed-ideas | CORE | — |
| 66 | no-type-shortcuts | GRADUATE | `typescript-practice.md` + strict lint (verified) |
| 67 | no-unbounded-host-load | CORE | — |
| 68 | no-verify-requires-fresh-authorisation | CORE | — |
| 69 | no-warning-toleration | CORE | — |
| 70 | notion-page-edits-update-ledger | SITUATIONAL | `tool:notion` |
| 71 | notion-strategy-page-fence | CORE | — |
| 72 | oak-chrome-session-is-metered | SITUATIONAL | `tool:chrome-browser` |
| 73 | owner-attention-at-action-moments | CORE | — |
| 74 | per-user-memory-is-a-buffer | CORE ⚑ | challenged up |
| 75 | permanent-doc-is-the-consolidation-record | CORE | — |
| 76 | ping-before-escalate | SITUATIONAL | `session:team` |
| 77 | plan-body-first-principles-check | CORE | — |
| 78 | pr-comments-resolve-and-recheck | SITUATIONAL ⚑ | `ceremony:pr-lifecycle`, session-bound; fold rejected |
| 79 | practice-core-portability | SITUATIONAL | `surface:practice-core` |
| 80 | pre-execution-code-expert-review-per-loop-cycle | SITUATIONAL | `ceremony:loop-cycle` |
| 81 | pre-merge-divergence-analysis | SITUATIONAL | `ceremony:merge` |
| 82 | precedence-is-not-approval | CORE | — |
| 83 | present-verdicts-not-menus | CORE | — |
| 84 | re-apply-first-question-at-elaboration-boundaries | CORE | — |
| 85 | read-agent-md | CORE | — |
| 86 | read-before-asking | CORE | — |
| 87 | read-diagnostic-artefacts-in-full | CORE | — |
| 88 | read-nextjs-docs-before-coding | SITUATIONAL | `surface:nextjs` |
| 89 | records-are-technical-not-emotional | CORE | — |
| 90 | register-active-areas-at-session-open | CORE | — |
| 91 | register-identity-on-thread-join | CORE | — |
| 92 | replace-dont-bridge | CORE | — |
| 93 | respect-active-agent-claims | CORE | — |
| 94 | route-blocks-and-questions-to-director | CORE | — |
| 95 | rules-have-no-exceptions | CORE | — |
| 96 | scope-from-goal-before-approach | CORE | — |
| 97 | sha-prefix-in-collaboration-content | SITUATIONAL | `surface:collaboration-state` |
| 98 | ship-independent-coordinate-dependent | SITUATIONAL | `ceremony:commit` |
| 99 | silence-is-never-liveness | CORE | — |
| 100 | skill-naming-and-description-quality | SITUATIONAL | `ceremony:skill-authoring` |
| 101 | sonarqube-mcp-instructions | SITUATIONAL | `tool:sonarqube-mcp` |
| 102 | source-curriculum-content-via-api-not-cdn | CORE ⚑ | challenged up; CDN-host guard is the graduation path |
| 103 | source-is-typescript-esm-only | SITUATIONAL ⚑ | `surface:source-authoring` |
| 104 | stage-by-explicit-pathspec | SITUATIONAL ⚑ | `ceremony:commit`; hook covers 3 of N staging verbs |
| 105 | strict-validation-at-boundary | CORE | — |
| 106 | subagent-practice-core-protection | CORE ⚑ | challenged up |
| 107 | tdd-for-refactoring | GRADUATE ⚑ | `.agent/directives/testing-strategy.md` (counter to situational) |
| 108 | test-immediate-fails | GRADUATE | `test-expert` reviewer brief (self-declared home) |
| 109 | third-party-skills-require-security-review | SITUATIONAL | `ceremony:skill-vendoring` |
| 110 | unknown-is-type-destruction | GRADUATE | `strict.ts` restricted types (verified) |
| 111 | use-agent-comms-log | SITUATIONAL | `session:team` |
| 112 | use-built-agent-tools-cli | SITUATIONAL | `tool:agent-tools-cli` |
| 113 | use-monitor-for-event-driven-wake | SITUATIONAL | `tool:background-task-arm` (rule has explicit fires / does-not-fire sections) |
| 114 | use-result-pattern | SITUATIONAL ⚑ | `surface:source-authoring`; graduates at `'error'` severity |
| 115 | validate-full-target-estate | CORE | — |
| 116 | validators-must-recompute-not-just-record | CORE ⚑ | challenged up |
| 117 | verify-data-supports-shape-before-building | CORE | — |
| 118 | verify-dont-trust | CORE | — |
| 119 | verify-vendor-call-shapes-at-plan-author-time | CORE ⚑ | challenged up |
| 120 | worktree-hygiene | CORE ⚑ | challenged up |
| 121 | worktree-residency | CORE ⚑ | challenged up from graduate |

**22 contested rows for owner cards** (⚑): 7, 14, 19, 21, 25, 33, 38, 46, 51, 52, 56, 57, 58, 74, 78, 102, 103, 104, 106, 107, 114, 116, 119, 120, 121.

---

## 4. HEADLINE COUNTS

| | CORE | SITUATIONAL | GRADUATE-OUT | Total |
|---|---|---|---|---|
| Today (`RULES_INDEX.md`) | 100 always-on | 21 trigger-loaded | 0 | 121 |
| Legs proposed (before challenge) | 56 | 50 | 15 | 121 |
| After challenge | **67** | **46** | **8** | 121 |

Movement I imposed: 10 SITUATIONAL → CORE, 1 GRADUATE → CORE, 7 GRADUATE → SITUATIONAL, 1 SITUATIONAL → GRADUATE.

Baseline still shrinks hard — 100 → 67 always-on, a 33% cut — and the four graduations I let stand (`no-skipped-tests`, `no-type-shortcuts`, `unknown-is-type-destruction`, `no-machine-local-paths`) plus the three conditional ones are the only rows where a *verified, gate-blocking* mechanism exists today. Every graduation I blocked was blocked on one of two verified facts: the mechanism does not exist (no `PostToolUse` hook configured; no extension-ban lint rule; no branch-touched-files hook), or it exists but does not bind (`no-throw-statement` at `'warn'` under `eslint .` with no `--max-warnings=0`; three literal staging patterns against an open verb set; a check-only markdown gate against three scripts that run the mutating fixer).