# PR comment triage and fresh-eyes reassessment — 2026-08-04

Owner instruction (verbatim): _"after compaction please pull down all comments
on all PRs and triage and categorise them"_, extended mid-session to _"triage
and analyse and understand them, and reassess them and our understanding of the
current state with fresh eyes"_.

**Method.** All comment surfaces pulled for every PR in the current window
(#729–#756: 15 open + 12 recently closed/merged): GraphQL `reviewThreads`
(resolved-state per thread), review bodies, and issue comments — read per-item,
never from aggregates. Every load-bearing claim below was re-verified against
live state (per-PR `gh pr view`, `origin/main` file content, the Linear ticket
list) before being written down. Author: Galaxy weaves Latitude (5baf4e),
successor seat to Birch holds Seedling (e48fe2).

**Scope note.** "All PRs" is read as the current board (#729–#756). Older
closed PRs carry no unresolved substance reachable from this window's records;
widening the sweep further is a named option, not done silently.

---

## 1. Triage — every PR, its comment state, and who holds the next move

### Open PRs

| PR | What it is | Comment/thread state | Next move is with |
| --- | --- | --- | --- |
| #756 | Sanction per-person ambient bot identities (Matt's agents) | 0 threads; both code owners approved; CLEAN, auto-merge off | **Jim** — one word merges it. Note: the review suggests recording your PR-approval grant in the rule; unrecorded it dies at every context boundary |
| #754 | pnpm launcher `$PNPM_HOME/bin` probe | 2 Copilot threads outdated + substantively cured; Matt-automation approved at head | **Merge-ready** — threads need mechanical resolution, then merge |
| #751 | Production redeploy of the deployed commit (MCP-479) | Both threads resolved; round 5 left exactly 2 TSDoc wording items (docs-only) | **Agent seat** — two small wording cures, then re-request; rounds are converging (5 findings → 2) |
| #748 | posthog requires sentry alongside (MCP-361) | Both threads resolved. **The DoD ruling landed: owner ruled "strengthen"; Matt implemented `refineSentryLiveForPostHog` (c6aefcad)** | **One pre-merge check** (§3.1), then code-owner approval |
| #749 | pnpm version guard (MCP-478, Matt's) | Main thread resolved via scope-and-rebut; Birch's ADR-168 convergence proposal awaits Matt's answer; 4 rounds of Copilot suppressed comments carry one unanswered recurring finding (§3.3) | **Matt** (ADR-168 answer) + the suppressed-finding disposition |
| #746 | Deployment-reliability plan nodes ×4 | 0 threads; findings 1/2/5 cured; 3 (bootstrap-reporter proof) and 4 (build-vs-buy) open and declared, next fresh-context engineering at this lane | **Agent seat** — already scoped in the handoff |
| #752 | String-encoded numbers at MCP boundary (MCP-487) | 2 threads open; Birch measured the cost live (preview loses `examples`) and the benefit gone (client fixed in 2.1.221); recommends CLOSE | **Jim** — close or keep; MCP-487's title already points at the request-boundary cure |
| #755 | PDR-135 gate-ledger register (Wyvern's lane) | 0 threads; §§5–6 ratified; step 3 (ADR) is Wyvern's named next | Wyvern's lane — no action from others |
| #750 | Matt's draft lane-opener (MCP-483 docs) | 0 threads, CLEAN draft | Matt's lane |
| #742 | Coordination-branch records carrier | 0 threads, perpetual draft by design | Nobody — carrier PR |
| #729 / #731 / #734 / #745 | Draft lanes held at the clear-run owner gate (identity census; Parallax family; Lichen's frozen corpus; claim-freshness pilot) | Each holds a documented continuation contract (#729: regenerate the census against merge-time main, then un-draft; #731: 3 adjudicated blockers await its lane owner; #745: an owner-ratification gate a bot merge cannot clear) | **Gated on the owner's declared trigger** — he closes the first-submission window / reopens each lane; nothing here is deferred without a named gate |

### Recently closed/merged with comment substance

| PR | Residue worth carrying |
| --- | --- |
| #735 (merged, 1.147.0) | Clean close; spawned MCP-486 (oakUrl over-advertising, 15/30 schemas + singular/plural bug) — ticketed, Backlog/High |
| #741 (merged, 1.148.0) | Clean close; the standing CHANGES_REQUESTED was ruled non-blocking by the owner (agent-automation review, answered-with-fixes) |
| #743 (merged, 1.148.1) | `preview-serves` live as an **informational** status; the trusted-publisher precondition is named for Phase E (publication must move behind a boundary a PR branch cannot rewrite before the status becomes REQUIRED) |
| #747 (merged, 1.148.2) | **One un-dispositioned residual** — §3.2 below. Also the worked instance of the approval grant (merged one second after it) |
| #753 (merged) | Server-side integration vehicle for #747's fix; no residue |
| #744, #738, #740, #736, #733 (merged) | Clean; #738 carries the worked instance of the bot-can't-discharge-code-owner-gate defect (MCP-474 tracks the ruleset bypass fix) |
| #739, #732 (closed) | Superseded by bot-identity re-creations (#740, #733); #732's cured threads carried the derive-don't-snapshot lesson now in the skill |

## 2. Categorisation — what the ~180 substantive comments actually are

By disposition:

- **Cured and verified** (the large majority): review findings answered with
  red-first fixes and per-finding disposition tables. The round dynamics are
  *converging* on every live PR (#751: 5→2 docs-only; #746: 5→2
  declared-open; #754: 2→0).
- **Waiting on a human decision** (small, enumerated): #756 word, #752
  close/keep, #748 merge timing, ADR-168 answer (Matt), Matt-PR standing merge
  ruling (Birch's owner-card item 5).
- **Open and declared, with a named next actor**: #746 findings 3+4 (this
  lane, fresh context); #743's trusted-publisher precondition (sequenced to
  Phase E by name).
- **Un-dispositioned residue** (new findings, §3): #747's dir-read TOCTOU;
  #749's pre-push parity; the `examples`-survival assertion gap.
- **Noise** (excluded mechanically): Vercel deployment tables, Sonar badges,
  Claude/Codex overage notices, linear-linkbacks — no decisions live there.

By substance class — and this is the striking one — nearly every substantive
finding this window is the **same defect class: a declared surface detached
from its execution path**:

| Instance | Declared | Actually executed |
| --- | --- | --- |
| #735 `oakUrl` / MCP-486 | schema advertises the field | runtime never fills it (15/30 schemas) |
| #735 numeric bounds | spec declares `maximum: 300` | MCP path never consulted the validator that carried it |
| #752 `examples` | PR body claimed "costs nothing" | live `tools/list` lost them (measured on preview) |
| #748 sink marker | `"sentry"` selected in config | delivery keyed on `SENTRY_MODE`, which the library declares retired |
| #751 dead tests | ADR-168 depicted the test home | no vitest glob reached it — 663 lines never ran |
| #751 ADR-163 comparator | ADR specified npm `semver` | a pre-install script has no `node_modules` |
| MCP-499 plan bodies | skill states 5 required sections | validator reads frontmatter only; "OK (43 conformant)" |
| Birch's CI red | local gate green | local read the working tree; CI read the commit |
| #737 provenance rounds | PR body asserted blob SHA / file count / "current main" | the tree had moved; three rounds to make the record self-verifying |
| UAT §10 PASS | run record claimed the read contract | only the inventory listing was exercised |

This is one defect class wearing ten costumes: **records that assert what they
do not derive**. The estate's live response — PDR-135's gate ledger with
STATED vs CHECKED as separate fields, plus the owner's repo-vs-instance strata
question — is aimed at exactly this class. The comment corpus independently
confirms that programme is the right one.

## 3. Fresh-eyes corrections and new findings

Things the inherited (frozen) record says that are no longer true, or that
thread-based triage cannot see:

### 3.1 The #748 DoD ruling is DISCHARGED — the inherited owner-card item 2 is stale

The frozen handoff lists "the #748 DoD ruling Matt escalated" as an open owner
decision. It is not: the owner ruled **"strengthen"**, Matt implemented
`refineSentryLiveForPostHog` (SENTRY_MODE=sentry + DSN required whenever
posthog is selected, every environment) and resolved the thread at 11:11Z.

Two consequences the record does not yet carry:

- **The one live pre-merge check**: Birch's sequencing constraint stands —
  preview and development `SENTRY_MODE` values are unverified (encrypted; CLI
  read-only). If either lacks `SENTRY_MODE=sentry`, the first deploy after
  #748 merges is boot-dead in that environment. Mitigation exists now:
  `preview-serves` (merged, live) would catch it visibly — but informational,
  not blocking. The check costs one look at the Vercel env panel (Jim or
  Matt).
- **MCP-495 sharpens**: the strengthen ruling makes the app *mandate* the
  variable the library *rejects* (`refineLegacySentryMode`). The two-switch
  contradiction is now load-bearing in a merged direction; the ADR-171
  bridge deviation should be reconciled with the ruling before anyone
  "completes the migration" by retiring SENTRY_MODE — the accident MCP-495
  documents.

### 3.2 Merged #747 carries an un-dispositioned correctness residual

Copilot's post-fix reviews (09:08Z, 09:43Z, suppressed-comments channel)
flagged that the cured `statMtimeMs` still has an uncured sibling: `dirExists:
existsSync` followed by an unguarded `readdirSync`. Verified on `origin/main`
just now — the window is real: a `src/` directory removed/replaced by a
concurrent checkout between the two calls throws and crashes `postinstall`,
the exact class the PR cured for `stat`. Small, real, on merged code, and
**nobody has answered it** because it lives in the suppressed-comments channel
no thread-based sweep reads. Unticketed.

### 3.3 The suppressed-comments channel is a systematic blind spot

The #747 residual is not an isolated miss. #749 has had the **same finding
suppressed in four consecutive Copilot reviews**: its CI adds
`lint:runtime-only` with no pre-push counterpart, violating ADR-121's
pre-push === CI parity (verified: `.husky/pre-push` runs `lint:shell` only).
Also in #749's suppressed set: a missing knip entry-point registration and a
`process.exit(1)`-skips-`finally` fixture-cleanup defect. None answered.
GraphQL `reviewThreads` + review bodies both miss these — they render only
inside `<details>` blocks in review summaries. Anyone triaging by unresolved
threads reads "#749: 1 thread, resolved" and sees a clean PR.

This is itself an instance of the §2 defect class: the review surface we
*read* is not the surface the findings *land on*. The gate-ledger lane
(reachability and scope, not existence) is the right home for the general
cure; the immediate cure is cheap — sweep suppressed comments once per PR at
disposition time.

### 3.4 The "review bottleneck" framing needs re-pricing

Birch's 08:10Z board read — "every PR queued on one human's attention" — was
true at the time but is not the current mechanism. The corpus shows
`mantagen`'s verdicts are agent-automation re-reviews that arrive
mechanically on head change (four PRs re-reviewed within seconds of each
other at 08:32Z). What is *actually* human-gated now is narrower: code-owner
approvals (dischargeable under the standing grant), auto-merge-off merge
words, and Matt's two personal answers (ADR-168; #756 was his own). The
review economy is largely agents-reviewing-agents with humans at the
decision points — which is working, and means "make each re-review cheap"
(crisp what-changed disposition comments) is the right optimisation, and
"wait for Matt's attention" is mostly not the constraint the frozen record
priced it as.

### 3.5 One residual is valuable and unticketed

From #752's arc: **nothing in any suite asserts that `examples` survive onto
the advertised `tools/list` schema.** A generator change silently stripped
agent-facing guidance from two parameters; every gate stayed green; it took a
reviewer challenge plus a live two-server comparison to see it. MCP-486/487/
488/489 are all filed; this assertion gap is not. It is the served-surface
twin of the §2 class and cheap to close (a test importing the served schema
asserting `examples`/`maximum`/`default` presence per parameter).

## 4. Where this leaves the board (the reassessed state)

1. **The owner's named priorities are genuinely discharged**: spec PRs live
   (1.147/1.148, UAT GO WITH CONDITIONS), testing done both sides, Sentry
   proven working behaviourally in production. The corpus supports the frozen
   record here.
2. **The deployment-reliability programme is converging, not sprawling**:
   #743 merged; #751 two wording items from settled; #748 cured pending one
   env check; #746 is honest about its two open findings; MCP-480/481/493
   (Urgent) are the unstarted engineering tail.
3. **The open human decisions are few and cheap**: #756 (one word), #752
   (close, recommended), #748 timing (after the env look), ADR-168 (Matt's
   one answer), the standing Matt-PR merge ruling. Everything else routes
   through agent seats.
4. **The estate's meta-programme is validated by its own week**: the gate
   ledger (PDR-135/MCP-491) and the strata split are aimed at the single
   defect class that ~ten independent findings this window instantiate.
   The comment corpus is the evidence base that programme was missing.

## 5. Proposals (pointers, not specs — each with warrant and falsifier)

1. **Sweep suppressed comments at every PR disposition** (immediate practice;
   candidate clause for `pr-lifecycle`'s harvesting step, which already says
   "all comments" — the corpus shows the letter was honoured and this channel
   still leaked). *Warrant*: §3.2/§3.3 — real findings on merged code went
   unanswered. *Falsifier*: if the GraphQL/REST surfaces do expose these and
   the misses were seat-specific process slips, the cure is seat habit, not
   the skill.
2. **Ticket the #747 dir-read TOCTOU** (small fix, same shape as the cured
   stat). *Warrant*: verified live on main; crashes postinstall in the race
   the module documents itself as tolerating. *Falsifier*: if the walk never
   races a checkout in practice (no observed instance), priority is Low —
   but the cure is ~5 lines, cheaper than the argument.
3. **Ticket the `examples`-survival assertion** (served-surface contract
   test). *Warrant*: §3.5 — a silent contract regression class with a
   measured instance and no guard. *Falsifier*: if MCP-487's request-boundary
   redesign lands a served-schema snapshot test anyway, fold it there.
4. **Reconcile MCP-495 with the #748 "strengthen" ruling** before any
   SENTRY_MODE migration work. *Warrant*: §3.1 — the ruling changed which
   switch is load-bearing; MCP-495's proposed rule placement predates it.
   *Falsifier*: if the owner intends the library schema to be retired rather
   than bridged, MCP-495's shape changes entirely — his call, one question.
5. **Answer #749's parity finding explicitly** (add `lint:runtime-only` to
   pre-push, or record why not). *Warrant*: ADR-121's invariant, flagged 4×.
   *Falsifier*: if pre-push runtime cost is the deliberate trade, say so on
   the PR — the defect is the silence, not necessarily the gap.

## 6. Unresolved evidence that could change this synthesis

- Preview/development `SENTRY_MODE` values (encrypted; needs Jim or Matt) —
  decides #748's merge timing.
- Matt's ADR-168 answer — decides #751's final shape (withdraw-mine
  convergence already proposed and sized: 1 hunk, 12 lines).
- Whether the owner wants the "all PRs" sweep widened beyond #729–#756.

*Report by Galaxy weaves Latitude (5baf4e), claude-code / claude-fable-5,
2026-08-04. Corpus: 27 PRs, 40 review threads, 121 reviews, 138 issue
comments; boilerplate excluded mechanically; every state claim re-verified
per-item at ~13:15Z.*
