---
fitness_line_target: 220
fitness_line_limit: 300
fitness_char_limit: 18000
fitness_line_length: 100
drain_strategy: "Extract settled entries to permanent docs, PDRs, rules, or archived napkins"
merge_class: append-only-narrative
fitness_content_role: drainable-buffer
---

# Napkin

Current-session observations. Append below. Rotate when over ~400 lines (`consolidate-docs`
step 6): extract every behaviour-changing entry, merge into `distilled.md` or graduate to a
permanent home, verify the home, then archive and start fresh. Rotation is the preservation
step AFTER processing — never a fitness-relief move or a queue (owner correction, 2026-07-06).

## Napkin rotated (2026-07-06 dedicated consolidation, Zenith wakes Perigee)

Rotated at the dedicated pass after full processing. The processed window (2026-06-29 →
2026-07-06: the curriculum-hub program's rotating cast, the cross-repo Practice exchange arc,
the corpus Phase-0 sessions, PR-304/305/306/308/310/312/295 shepherding, the Sonar 5B and
doctrine-PR sessions, and the Nettle + Hyena closeouts) is preserved verbatim in
`archive/napkin-2026-07-06-zenith-dedicated-consolidation.md` (byte-identical, proven by cmp).
Every behaviour-changing entry was dispositioned before the archive-move: the
pending-graduations register drained to zero (nine homes verified first-hand, three tail items
graduated — sequence-first into PDR-018 owner-ratified live, doctrine-lookup tripwires into the
sonarqube rule + invoke-code-experts, the merge-commit path into the commit skill); the
distilled buffer's window drained to verified homes (verify-dont-trust, PDR-063/082/117,
build-system, typescript-practice, quality-tooling, testing-patterns, the watcher rule,
collaboration-state-conventions, semantic-merge + reason skills, metacognition, oak-eslint and
demo READMEs, the demo-maintenance and action-time plans); four new patterns authored
(generator-first-for-vendored-static-data, hydration-state-pinning,
lint-rule-pincer-is-a-design-signal, server-component-reads-data-layer-directly); six frictions
registered (F-122–F-127). Both graduation batches ran the PDR-101 quorum.

New session observations append below.

## 2026-07-06 — Zenith wakes Perigee (dedicated consolidation): session observations

- **Owner correction (standing, homed in this file's header + the rotation note): rotation is
  NOT a way to deal with long documents within the fitness protocol — processing is.** Rotation
  happens AFTER processing only; it is not a quick out or a queue, it is how processed napkins
  are preserved. My first framing offered rotation as the response to the 1385-line napkin; the
  correction re-ordered the pass (process every entry to a disposition first, archive last).
- **A registry claim to have authored a cross-reference is a claim like any other**: the Nettle
  pass's homes-authored note said the view-binder graduation included "a testing-strategy.md
  cross-ref" — first-hand verification found the pattern file real but the cross-ref ABSENT.
  Verify each element of a compound claim, not the claim's headline.
- **The PDR-101 quorum earned its cost on batch 1**: four seats converged on an SSOT-duplication
  defect (the same discipline authored into two homes plus a third existing one) that I had
  written fluently; the fix (one canonical home + pointers) landed before the commit. Reviewer
  convergence on the same defect from four genuinely distinct lenses is the strong signal form.

## 2026-07-06 — Zenith wakes Perigee: handoff loss-scan captures

- **7c thread-register audit findings (owner attention, from the dedicated pass):**
  (1) `agentic-mechanisms-discovery` last_session 2026-06-08 — 28 days stale on the Active
  table; (2) `eslint-no-throw-result-migration` 2026-06-19 — 17 days stale; (3) two COMPLETE
  threads still listed Active (`reasoning-grammar`, `user-search-not-exposed-until-built` —
  both landed, push pending) — retirement/paused-move candidates at the next continuity touch.
  Coverage bound, honestly: checks 1/5/6 ran in full; checks 2–4 (orphan tables, missing
  identity fields, duplicate rows) were spot-sampled, not exhaustive — a future audit should
  not read this pass as full 7c coverage.
- **7d residue:** the abandoned+expired Zodiac commit-queue intent (b19b15f7) was deliberately
  LEFT in `active-claims.json` — a direct jq wipe was classifier-denied as shared-state
  destruction (correct call: no owner direction named it). Phase=abandoned + expired = harmless;
  clear it at the next owner-authorised collaboration-state write. Evidence for its
  completedness: Zodiac's closeout 16:38/16:57Z + merged PRs #310/#312.
- **Cross-estate host-load serialization worked (novel coordination shape, single instance):**
  three heavy gate chains (two oak sessions + a resonance-estate merge, invisible to each
  other's streams) converged on one host at 1-min load ~19; the exchange seat (Kiln) relayed a
  one-heavy-chain-at-a-time sequencing between the estates' streams ("announce chain-start on
  your home stream; hold while 1-min load >12 at start"). candidate: pattern/PDR if a second
  instance recurs — the relay-seat-as-load-coordinator is the interesting part.
- **Quorum operating economics (sizing knowledge for future dedicated passes):** a PDR-101
  four-seat quorum over a ~20-file doctrine batch ran ~70–120K tokens/seat, ~5–7 min
  wall-clock in parallel, and each batch produced 1–4 genuinely batch-altering findings —
  worth the cost at doctrine-batch scale, oversized for a one-file graduation.
- **My own F-125 bit me ~10 minutes after I registered it** (cwd drifted to threads/ from an
  earlier `cd`, breaking a repo-root grep) — live recurrence evidence that vigilance does not
  cure this class; the structural cure (location-independent gate scripts) is the point.
- **Transient `.git/index.lock` collision under a peer's worktree ops**: cleared itself under
  the no-contact posture (third recorded instance; diagnose-without-touching then retry holds).

## 2026-07-06 — Zenith wakes Perigee: the wall-clock perf-test ruling (owner-surfaced)

- **Owner diagnosis on a full-gate red**: "nothing that takes 700ms to run 12 tests is a real
  unit test, there are some SLOW tests in there" — my first disposition (load flake, re-run) was
  insufficient; the flake was a SYMPTOM. test-expert ruling (rulings-as-artefacts shape):
  defect class = **wall-clock ceiling in a gated in-process test** (`toBeLessThan(500)` ms is
  nondeterministic pass/fail across environments — the same defect class as a conditional test,
  expressed through the assertion's value; any finite ceiling fails under sufficient
  contention). Cure = DELETE (no deterministic assertion is recoverable from wall-clock; a
  benchmark instrument is the conformant home for a genuinely-owned cost budget). Must-not:
  raise the ceiling, retry-wrap, tolerance-band, relative bounds, or slice the corpus out of
  behavioural tests. Landed: three deletions in graph-corpus-sdk (misconception/keyword/
  prior-knowledge view suites), 100/100 green. The real-corpus import design itself was ruled
  CONFORMANT and stays (Real-Content Backstops; discriminating fixtures done well).
- **Two ruled follow-ups routed, NOT landed (owning lane's call):** (1) an on-demand cold-import
  benchmark instrument (fresh-process measurement, script surface, reporting-not-gating) — only
  if a real consumer-facing startup budget exists; (2) the dominant suite import cost is
  ADR-086 per-node load-time validation of the ~27MB corpus at every consumer import — whether
  that validation belongs fully at generation time (ADR-031 heavy-lifting-at-codegen) with a
  minimal load-time assertion is a product/pipeline design question for the graph-corpus/
  sdk-codegen estate. candidate: route to the owning lane at its next touch.

## 2026-07-06 — Stoat rides Gloaming (432a41, plan-corpus refounding R0 successor): session observations

- **The primary checkout's working tree mutated under me at session open**: ~56k generated SDK
  lines (`packages/sdks/oak-sdk-codegen/src/types/generated/**`) showed deleted then restored
  within ~2 min — an in-flight codegen/gate cycle from a concurrent seat (host 1-min load 66→90
  on 8 cores, 0% CPU idle, memory pressure green). Behaviour note: a git-status snapshot taken
  during a peer's codegen window is not tree truth; re-check before classifying dirt. Held all
  heavy chains per the one-heavy-chain agreement. (Same window: a napkin append collided with a
  live peer write — re-read-then-append held.)
- **P2's sanctioned-writer/re-derivation clause earned its place before the protocol even ran**:
  the surface census drifted design→now (618→619 plans md; ~20→29 plans non-md; 65→66 prompts —
  the +1 prompt IS the R0 session opener authored for this seat). Every G1-packet number is
  labelled indicative; the freeze script's recomputation is the only binding denominator.
- **The standby / successor-in-waiting seat contract ran clean end-to-end**: watcher +
  team-start registration, no heartbeat, no claim → the predecessor's SUCCESSOR RUNWAY
  broadcast carried the full pickup contract (grounding pointer, GATED-until-runway-clear list,
  boundaries, commit craft) → adoption = ACK broadcast + claim open in one move, n=2
  owner-visible declared. The explicit gated-stage list let the successor ground fully and
  draft the G1 packet + R0c ledger during the predecessor's heavy-chain window with zero
  collision risk. candidate: pattern if a second runway handoff recurs.
- **Commit-queue tooling lags PDR-117 worktree doctrine (two frictions, register-pending):**
  (1) `commit-queue guard` rejects the worktree-scoped `git:index/head@<worktree>` claim
  spelling that the commit skill's own merge-commit section prescribes for worktree seats;
  (2) the `commit-queue commit` workflow's verify-staged reads `git diff --cached` against the
  PRIMARY checkout, so a worktree seat's staged bundle reads as all-missing — structural
  mismatch, not F-112. Landed via the skill's sanctioned shape instead: plain `git commit -F`,
  pathspec-staged, first-hand staged-set verification, background task (F-123). Full record on
  abandoned intent e38f8da0 in active-claims.json.
- **knip lesson for new tsx-invoked CLIs**: register each entry in knip.config.ts's agent-tools
  entry list at authoring time, or the entry files read as unused and their imports cascade
  into false unused-export findings; then un-export what nothing imports (an un-exported unused
  type alias trips noUnusedLocals — delete, not de-export). Cost: one commit bounce.
- **zsh does not word-split unquoted variables**: `$FILE_ARGS` expanded as ONE argv word and
  the CLI read it as invalid usage (exit 2) — masked further by `| tail` eating the pipeline
  status. Literal args or `${=VAR}` in zsh; never trust a captured var through a quiet pipe.
- **Reviewer-economics data (R0a cycles)**: per-pass yield 4–13 genuine findings at ~85–140k
  tokens/reviewer; the tranche-1 three-layer chain (code+test+security) produced 17+5 real
  findings incl. two S1-blockers and a security class the builders missed — every layer paid.
  Adversarial review of freshly-built detector tooling is not optional overhead; it is where
  most of the truth arrived (matches the donor estate's measured result).
- **Watcher hourly backstop cadence**: the canonical `timeout 3600` guard kills the watcher
  every hour (exit 124, SIGTERM relay) — designed; the response is re-arm on the same
  seen-file + one inbox-shaped gap sweep. Five arms this session, zero missed events.

## 2026-07-07 — Stoat rides Gloaming (432a41), post-compaction window: session observations

- **Announce-after-read, never announce-then-read**: I broadcast a heavy-chain window-OPEN in
  the same turn as the `uptime` call and the read came back 26.5/37.9 — retraction event
  required. The load read must COMPLETE before the window broadcast is composed. Related:
  single sub-12 readings rebound under active peer chains — require TWO consecutive sub-11
  readings 30s apart before opening a window (worked twice today).
- **`& disown` inside a foreground Bash call is the F-131 anti-pattern reborn**: it detaches
  the hook chain from all tracking (no completion notification). Cure applied: an until-loop
  background wake on HEAD movement OR chain-death (`pgrep` alternation) — but the real rule is
  run_in_background for every `git commit`, no exceptions, no shell-level detach.
- **`validate-markdown-links` is advisory estate-wide (925 pre-existing broken links) but it is
  the authoritative truth surface for a file-move's link impact**: grep patterns miss
  sibling-relative `./file.md` links (two escaped my `dir/current/file` pattern today — one
  inbound, one outbound from the moved file itself). Sweep moves with the validator, not grep;
  "my file appears in zero validator entries" is the completion proof.
- **Spend-limit subagent deaths resume cleanly via SendMessage to the same agent id**: the
  harness resumes from the agent's own transcript with context intact — far cheaper than a
  fresh dispatch. Pair it with a recompute-from-disk-first instruction (git status = file
  truth; re-run the last scoped observation; treat unverified memory as claims). Two worked
  instances today on the tranche-3 builder. Standing owner measure (temporary, same window):
  NO NEW subagents without owner approval — resuming an existing one is sanctioned.
- **Repurposing an idle provisioned worktree beats re-provisioning**: the merged #315 worktree
  switched to the stacked t3 branch in seconds (zero install cost); the one mandatory follow-up
  is the F-120 agent-tools dist rebuild after the switch. Also: `git switch` in a repurposed
  worktree fires "file modified" harness notices for every checkout-updated file — expected
  noise, not peer edits.
- **Bots re-review every push — worked instance of "0 unresolved is a moment"**: PR #315 read
  0-unresolved at 07:21Z; a new Bugbot thread landed on the SAME tip's review round minutes
  later (13th thread). The binding-moment recompute (F-130 discipline) is what caught it.
- **Shared-auth attribution caveat**: my GraphQL thread replies render as jimCresswell events
  in watcher streams and comment lists (shared gh credentials). When auditing "owner comments"
  on a PR, filter by the agent-signature line in the body, not by author login. (Wildfire used
  a `[Agent: …]` body PREFIX — prefix-first is the stronger convention; I used a trailing
  signature today.)
- **Pre-execution review (two-moments rule) earned its cost on first use at tranche scale**:
  ~154k tokens returned 7 contract ambiguities RESOLVED + 7 landed-decision contradictions
  BEFORE any code — including census-reads-frozen-not-live (would have been a P5 determinism
  defect) and the freeze-rule-schema-v2 gap (the landed parser cannot parse what G1 ratifies).
  The full verdict is conserved in the tranche-3 execution record (handoffs dir, 2026-07-07).
- **PR #315 endgame data**: six fresh bot threads on the owner's morning push all triaged
  REAL (friction-ID renumber class F-122/F-123→F-130/F-131 + one stale-gate line); the
  register-order fix and the CI markdownlint red shared one root. Owner merged at 08:01Z with
  my fixes at 798839a72/033cdee7b. #317 (r0a branch) merge authority NOT granted — 315's
  grant was PR-specific.

## 2026-07-07 mid-day — Stoat rides Gloaming (432a41): tranche-3 gateway + handoff observations

- **CONVERGENT finding = the strong-signal form, and it validated the full roster.** The
  6-reviewer post-execution gateway on the tranche-3 cycles-1-2 detector build (41 files, 312
  tests) surfaced ONE Important defect — an amendment-channel path traversal on the frozen-file
  read sink — found INDEPENDENTLY by both security-expert AND code-expert from different lenses.
  Two seats converging on one defect they each reached differently is the signal that the
  finding is real and the roster paid. It would not have surfaced from tests or a single read.
  Also earned: type-expert's discriminated-union-exhaustiveness must-fix, docs-adr's 4 owed
  F1-supersession notes. config PASS, code/test pass-with-improvements.
- **Any artefact a successor needs must be in a DURABLE location BEFORE the handoff — the
  session scratchpad is session-mortal.** The finalised gateway fix list lived only in the
  session scratchpad dir; a handoff would have lost every adjudication. Cure: copied it to
  `.agent/state/collaboration/handoffs/` (disk-persistent on-machine) the moment the successor
  was named. General rule: the handoffs/ dir, not the scratchpad, is the successor-facing
  surface.
- **Mid-session model switch = CONTINUOUS seat (PDR-027).** Owner switched this session
  fable-5→Opus 4.8 mid-run; identity is session-derived (prefix 432a41 stable) so the seat is
  unbroken — still Stoat, now on Opus compute. The owner-named successor (Leopard spins
  Moonrise, b07d1d) is a SEPARATE live session, not the model-switched self. Record the
  continuity explicitly so the model change is not misread as an identity break.
- **Stop-then-characterize beats hand-off-blind for an in-flight subagent.** At the handoff, the
  fix-implementer's last transcript line ("about to re-run tests") signalled near-done; I
  TaskStopped it and ran the verification chain MYSELF — 326 tests green, all gates clean. That
  converted an "unknown partial" into a "verified-green ready-to-land" frozen state: a far
  stronger handoff. Verified-green completed work is landed (committed+pushed), never handed off
  uncommitted-on-disk (exposed to loss) — landing is consolidation, part of a deep handoff.
- **Pull-style successor runway**: Leopard registered as standby and parked (no claim, no
  heartbeat, PDR-078 §4) BEFORE I signalled RUNWAY CLEAR, explicitly waiting for the
  cycles-1-2 landing boundary. The runway pattern works pull-style (successor self-parks and
  waits on the boundary), not only push-style (predecessor broadcasts then successor arrives).

## 2026-07-07 — Leopard spins Moonrise (b07d1d, R0 successor): session observations

- **The mandated post-arm foreground sweep caught a baseline-absorbed event on first use**: the
  12:22Z SUCCESSOR NAMED broadcast (naming ME) landed in the session-open window and was
  absorbed into the fresh watcher's baseline — only the sweep surfaced it. Worked instance of
  the exact gap the comms-watcher rule's sweep clause exists for; the sweep is not ceremony.
- **Warm-standby pickup, second worked instance (after Stoat's own)**: watcher + registration,
  no heartbeat, no claim; predecessor drove to a clean cycles-1-2 landing boundary and the
  RUNWAY CLEAR broadcast carried the full pickup delta. Adoption = claims adopt + ACK in one
  move. The pattern candidate from Stoat's napkin entry now has its second instance —
  graduate `standby-runway-handoff` to a pattern at the next consolidation.
- **eslint-plugin dist staleness has a second face (F-120 sibling)**: a `recommended.ts`
  io-allowlist edit is INVISIBLE to lint until `@oaknational/eslint-plugin-standards` rebuilds
  (lint resolves the built dist) — my r0a fix-pass lint readout ran against the stale
  allowlist. Rebuild the plugin after every config-source edit before trusting lint.
- **pnpm's install-time bootstrap tsc is a surprise early gate**: editing `agent-tools/
  package.json` (new script) made the next pnpm run re-verify deps → postinstall bootstrap →
  whole-package tsc, which caught a real readonly-vs-mutable type error BEFORE my own
  type-check pass. The pnpm-internal `runDepsStatusCheck` stack is the fingerprint; read the
  error HEAD (the tail is pnpm plumbing).
- **Sonar severity arithmetic on PRs**: one MINOR vulnerability (severity score 10 vs
  threshold 9) alone fails `new_vulnerabilities_severity` — fix-at-source cleared 5/6
  findings on #317 and the QG still reads ERROR until the precedent-matched WONTFIX
  disposition lands (owner credential moment; agents have no Sonar write access).
- **Classifier boundary worked instance**: replying to a pre-existing PR review thread is an
  external publish the auto-mode classifier gates without direct user authorisation — the
  drafted reply is conserved in-transcript; route to owner rather than work around.
- **grep scoping in refounding-named worktrees**: every absolute path contains "refounding",
  so `grep refounding` matches ALL lint output paths — scope module greps by path segment
  (`src/refounding/`), not name substring (one wasted verification readout).
- **Census fixture arithmetic**: the H2 anchor-ratio band (20-70%) constrains ANY fixture
  corpus that runs through `runInventory`; and a mapping fixture with 1 unmapped of 4 status
  lines is 25% — OVER the census 20% halt band (my own test tripped it; the halt fired
  exactly as specified — the test data was wrong, not the model).
- **Doctrine lookup must include the CORE MODULE ESTATE, not just ADRs/rules/Sonar history**: my
  gitleaks PATH-walk resolver was reviewed-and-reversed by Copilot citing `core/trusted-git.ts`
  — an in-code precedent whose TSDoc records that PATH-based S4036 approaches were "replaced
  outright". I had grepped ADRs and prior Sonar dispositions but never `src/core/` for an
  existing hardening pattern. Before authoring any external-binary / security-shaped mechanism,
  grep the core estate for a trusted-* / hardened sibling first (fluency-is-a-failure-vector,
  in-code-precedent face).

## 2026-07-07 — Leopard spins Moonrise (b07d1d), PR-317 endgame + closeout: session observations

- **Owner correction (graduated to pr-lifecycle Phase 6 same-session): "why has this become a
  loop operated by me?"** Six asynchronous bot rounds; I declared at each zero-unresolved
  MOMENT and idled on event monitors between rounds; the owner spotted every new arrival. Cure
  = agent-owned settle probes (~8 min post-push) + declare only after a full settled round
  lands zero new findings + one bundled fix push per round. The general form (metaloss-
  recovered): EVENT AWARENESS IS NOT CONVERGENCE OWNERSHIP — monitors satisfy the cadence
  rules while the convergence obligation silently transfers to the human. candidate: pattern
  `event-awareness-is-not-convergence-ownership` if a second instance recurs outside PRs.
- **First-principles review beat precedent twice in one arc**: (1) the S4036 WONTFIX lean —
  owner asked "is it really won't fix?"; review found the precedent had NO recorded rationale
  and the site differed (attestation-feeding one-time event) → fixed by code, QG went green
  with zero dispositions; (2) Copilot then showed even my fix deviated from an IN-CODE
  precedent (core/trusted-git.ts fixed-allowlist doctrine, whose TSDoc pre-rejects PATH-based
  approaches). Lesson homed in the napkin earlier: grep `src/core/` for a trusted-*/hardened
  sibling BEFORE authoring any security-shaped mechanism.
- **The discrimination proofs caught the FIXER, twice**: my first rollback draft failed its own
  planted-directory proof (rm aborted before removing the stranded file); my census mapping
  test fixture tripped the very halt band it was specifying. Proofs-first is earning its cost
  against the author, not just the estate.
- **Bot findings on #317 clustered into four instrument-ethos classes** (write-target
  resolution; attestation content-verification; vacuous-green refusal; atomic artefact pairs)
  — six rounds, 14 threads, 13 fixed at source, severity decayed monotonically. New t3-PR
  findings should be checked against these classes first; every fix idiom is now in-tree.
- **Auto-merge changes the endgame shape**: the merge fires the instant checks+threads
  satisfy — DURING a composing bot round if unlucky. With auto-merge armed, the settle-probe
  discipline is what makes the merge land on a genuinely-settled round rather than a lucky gap.
- **grep -v self-trap, second instance this session**: excluding by a token that appears in
  MATCH TEXT (import paths containing 'residue-helpers'; worktree paths containing
  'refounding') silently empties results — filter on structured fields or path segments,
  never on substrings shared with content.
- **Handoff-safe abort as a deliberate move**: mid-merge at owner-directed close, conserving
  the authored resolution (union README) + full conflict analysis to the handoff record, then
  `git merge --abort` to a clean tree, beats handing a successor a fragile mid-merge index.
  The resolution is reused verbatim from handoffs/assets/.

## 2026-07-07 — Goshawk calls Sundog (970bdc, R0 successor #3): session observations

- **A conserved merge analysis is a hypothesis about a MOVED target — recompute the mechanical
  sets before applying.** Leopard's [V]-marked merge-forward analysis was ~2h old at replay;
  origin/main had moved one commit (1.61.0 release bump) and two of its enumerated sets were
  short: the `readInventoryRecords` re-point list said 2 files, recompute (grep) found 3
  (`refound-default-ledger-helpers.ts` missed); and the sha1→sha256 rename had a 6th
  un-analysed site (`refound-tile-model.unit.test.ts:235` fixture). The three CONFLICTS were
  exactly as analysed — git recomputes those; it is the semantic (non-conflicting) sets that
  rot. Cure shape: treat every enumerated-set claim in a handoff as its generating COMMAND
  (grep/tsc), not its cached result.
- **The pnpm install bootstrap tsc caught the sha1 fixture before any gate ran** — third
  worked instance of the install-time surprise gate (napkin 2026-07-07 Leopard entry); as a
  MERGE verifier it is effectively a free whole-package pre-gate: run `pnpm install` in the
  worktree immediately after resolving a merge, before reaching for the gate suite.
- **Warm-standby pickup, third worked instance (Wildfire→Stoat→Leopard→Goshawk)**: this time
  runway-already-clear at arrival (no wait state) — adopt + ACK as first coordination-visible
  move directly after grounding. The `standby-runway-handoff` pattern candidate now has
  instances in all three shapes: push-style, pull-style, and clear-at-arrival.
- **Owner correction (2026-07-07, PR-321 fix round): a doc↔code "pin test" is a file-contents
  audit wearing test clothes — not a behaviour a test may describe.** I had added a
  COMPLETION_KEYWORDS_V1 pin test mirroring the landed NET_C precedent (a reviewer even
  recommended it — precedent compounding). The cure is a REPO-VALIDATOR that RECOMPUTES both
  sides (reads the G1 packet §2/§2a lists AND the in-script constants, compares exact-order):
  `validate-ratified-lists`, wired into `repo-validators:check`; BOTH pin tests deleted. The
  general rule: tests describe product behaviour; doc↔code/file-system sync checks live in
  validators (`validators-must-recompute`). A landed precedent test is not a licence — the
  same shape was wrong twice.
- **The quiet-pipe exit-mask bit ME twice in one session** (`eslint | tail && echo OK` — tail's
  exit 0 masked 3 lint errors past the `&&`): the F-125-class lesson ("never trust a captured
  var through a quiet pipe") applies to exit codes too. Run gates bare or check
  `${PIPESTATUS}`/`$?` explicitly; never key a success echo off the tail of a pipe.
- **A reviewer-prescribed optional cleanup can cost more than it cures**: type-expert's W6
  dead-`??`-fallback removal in evaluateAreas pushed the file over max-lines (250) — reverted
  with the disposition recorded rather than trimming doctrine comments to pay for it
  (lint-rule-pincer-is-a-design-signal, applied at item scale).
- **Owner correction (2026-07-07): "PRs do not sit with me — if they are genuinely green and
  clean they get merged."** I had declared "merge stays your moment" on #321, over-generalising
  #317's PR-specific non-grant note. Phase 7 of pr-lifecycle already encodes the truth: the
  truly-green gate (all checks green + zero unresolved threads + Sonar passing, re-verified at
  the declaration instant) IS the merge authorisation — a normal non-admin `gh pr merge
  --merge`, no separate owner grant needed. Waiting for an owner grant on a truly-green PR is
  the inverse failure mode of merging early: both park the convergence on the human.
  candidate: a small pr-lifecycle Phase-7 amendment — its "owner grant is per-session, never
  standing" line reads as if a grant is NEEDED on top of the truly-green gate; clarify that
  the gate itself authorises. Note the scope boundary the classifier enforced the same
  sitting: the posture covers the shepherding agent's OWN PR; merging ANOTHER seat's PR
  (#320) still needs an explicit owner grant naming it.
- **The G1 sitting ran in-chat in ~15 minutes using the matrix-filter shape** (owner-directed):
  run every packet question through the Decision Lenses first, record what the lenses + prior
  owner rulings resolve, and surface ONLY the survivors as AskUserQuestion items with
  recommended verdicts. Seven rulings landed with four questions. candidate: pattern
  `gate-sitting-as-matrix-filtered-questions` if a second gate sitting (G2/G3/OG-2) repeats
  the shape.
- **Window-retraction second instance (after Stoat's)**: my window-OPEN broadcast composed
  against reading pair (…, 10.26) went out before the third reading returned 11.20 —
  oscillation at the bar. Retract-and-re-read held; the two-consecutive-sub-11 rule is doing
  real work at the boundary.
- **The comms vocabulary gate is real and fires on single words**: `comms append` refused a
  body containing "parked" ("the indefinite-deferral block"). Reword, don't fight it.
- **Unverified single instance**: a `comms append` chained after `cd <worktree>` exited 2; the
  identical body posted fine from the primary root. Cause not isolated (worktree-resolved
  dist/paths vs argv) — if it recurs, diagnose before trusting `collaboration-state` from a
  worktree cwd.
- **Security-expert hardening note routed (not landed, out of PR scope)**: the ledger read
  sink (`refound-batch-status-helpers` existsSync / `refound-tile-helpers` readFile on
  `ledger/<area>.ledger.jsonl`) relies on schema containment alone — asymmetric with the
  frozen sink's realpath re-anchor. Not exploitable under the current trust model; a future
  consolidation can route the ledger read through the same `assertPathWithinBase` guard.
  Conserved in the 2026-07-07 Goshawk handoff record for the R0b seat.
- **Reviewer-economics corroboration (cycles 3–4 gateway, six seats)**: 48–160k tokens/seat
  (~664k total), ~4–11 min each in parallel; yield = 2 convergent must-fixes + 1 fail-open
  defect + ~14 genuine improvements across three CHANGES-REQUESTED verdicts, plus two clean
  PASSes that verified containment/config first-hand. Consistent with Stoat's R0a numbers:
  the adversarial roster keeps paying at tranche scale.
- **Owner ruling (2026-07-07, fired on a slow closeout `pnpm check`): "all tests should be
  FAST, there must be ZERO IO, all tests must prove product code behaviour, never
  implementation or configuration or test code behaviour... we have prettier and eslint and
  typescript and validator scripts, we must ALWAYS use the correct tool for each job."**
  This is the deliberate decision the `no-real-io-in-tests` rule's own comment anticipates
  (warn + frozen allowlist "until escalation is a separate, deliberate decision") — the
  direction is now set: migrate the allowlist to ZERO and escalate warn→error. Session-held
  evidence for the diagnosis: (a) the io-allowlist carries ~33 real-IO integration tests, 13
  of them the refounding suite's mkdtemp+runFreeze proofs (test-expert observation #6 this
  session recorded the doctrine tension and pre-existing gateway passes had normalised it —
  precedent compounding again); (b) the agent-tools suite's cost is IMPORT-dominated (~206s
  import vs ~7s test on cold run) — the ADR-086 27MB load-time corpus validation follow-up
  (napkin 2026-07-06, routed not landed) is the same root; (c) a one-line JSON commit pays a
  multi-minute pre-commit turbo gate. Cure direction (routed, NOT executed in this closing
  session): the owning plan is `architecture-and-infrastructure/current/
  no-io-test-boundary-and-di-recovery.plan.md` — re-prioritise it under this ruling; the
  refounding discrimination proofs that genuinely need a real filesystem belong as
  VALIDATOR-SCRIPT self-proofs (the validator estate is the sanctioned home for fs checks —
  same generator as the pin-test correction), with vitest keeping only the pure-core
  behaviour proofs (the pure/IO split already exists in the module design). R0b design
  input conserved in the Goshawk→Rigel handoff record.
- **Owner correction DEEPENED (2026-07-07): "there should never have been an IO allowlist —
  strict, everywhere, all the time... the creep is entropy, and the repo is vulnerable to
  it, we have to restore order."** The generator-level insight, at full weight: a
  violation-allowlist (warn-tier rule + frozen inventory + recorded-reason additions) is an
  ESCAPE HATCH WITH PAPERWORK — it institutionalises exceptions to a rule whose whole point
  is exceptionlessness, and its "discipline" (citations, closure clauses, review approval)
  manufactures process-legitimacy for drift. Process-compliance is not
  principle-compliance: this session I union'd two allowlist entries in a merge and a
  six-seat gateway rated the allowlist-ADD discipline PASS — every step procedurally
  correct, every step entropy. Same generator as the pin-test correction (audit-shaped
  tests normalised by precedent): PRECEDENT COMPOUNDING IS THE MECHANISM OF ENTROPY in a
  large estate. Cure is category-relocation, never exemption: work that genuinely needs a
  real filesystem is not an exempted test — it is a different CATEGORY (validator script /
  smoke). candidate (PDR/rule): "a lint rule lands at ERROR with conformance, in one
  landing — never at warn over an allowlist; existing violations are fixed or
  category-moved as part of the landing" (the atomic-landing invariant applied to gates).
  Known warn-tier instances to inventory under restore-order: the io-allowlist (~33 files;
  owning plan `no-io-test-boundary-and-di-recovery`, dated owner-direction note added
  2026-07-07); the no-throw Result migration (~1000 warnings, own thread + plan); the
  "new-rules-start-at-warn" clause cited in validate-patterns-index — each needs this
  ruling applied or an owner-ratified distinct disposition.
- **Owner standing rule (2026-07-07): metaloss findings are ALWAYS written to the napkin** —
  the loss-scan and its recursive metaloss pass produce napkin entries, never chat-only
  narration; the napkin is the capture surface the pipeline distils from, and a scan whose
  findings live only in the closing message loses them at exactly the boundary the scan
  guards. candidate: graduate into `session-handoff` §6e.2 (and the napkin skill's
  always-active contract) at the next consolidation touch.

## 2026-07-07 — Goshawk calls Sundog (970bdc): closing metaloss pass (recursive; per the standing rule)

- **Attribution honesty for the record**: PR #321 I merged (truly-green non-admin); PR #322
  was "already merged" (`a90560ff5`) when my declaration-instant merge ran — auto-merge or
  an owner click fired the moment CLEAN landed. A fresh reader must not credit both merges
  to this seat.
- **The step-11 `pnpm check` gate was OWNER-WAIVED this closeout** (owner killed the run
  mid-flight to unblock a starved commit; broadcast 417d8981). Standing in its place: the
  full `pnpm check` green in the t3 worktree earlier this session (pre-#321 merge) + both
  PR CI suites green (18/18 twice on #322's heads). A successor must not read "handoff
  complete" as "primary-tree check ran green at close".
- **Killing a shared-host chain kills OTHER chains' gate legs**: my `pkill -f "turbo run"`
  (owner-directed kill of the check) also killed the in-flight pre-commit's own turbo gate,
  producing a phantom red ("Build, type-check, lint, or unit tests failed") on an innocent
  one-line commit. Diagnose kill-collateral before treating a post-kill red as real.
- **Hot-file Edit fragility**: an Edit on the napkin dropped an entry's heading line
  (repaired same session). Long anchor strings on a file being appended to repeatedly are
  fragile — anchor on the shortest unique stable text, and verify the entry HEAD survives
  after structural edits.
- **Metaloss layer-2 finding (the scan scanning itself)**: a loss-scan is a snapshot that
  rots at the speed of the session — my first pass (pre-G1-sitting) was invalidated within
  the hour by the sitting and the IO ruling. The structural cure is exactly the owner's
  standing rule: write findings to the napkin AT OCCURRENCE, because an end-of-session
  batch competes with completion drive at the precise moment judgement degrades
  (fluency-at-the-finish-line, four worked instances this session: the pin test, the quiet
  pipe, the premature window broadcast, the allowlist complicity — one generator, named in
  the deepened-correction entry). Residual unrecoverable loss: subjective decision-texture
  beyond what the experience file carries — accepted, voluntary register by design.

## 2026-07-07 — Rigel turns Void (c6080b, R0 successor #4): session observations

- **`check-commit-message` takes `-m`/`-F` intake only** — a bare file-path argument exits 2
  (invalid usage), not 1 (violation). Read the usage block before retrying; the tool mirrors
  `git commit` intake exactly.
- **The corpus plan moved `product-development-governance/current/` → `active/` on origin/main**
  (landed via the R0a/G1 PRs) while local `main` still tracks the `current/` copy (part of the
  owner-gated housekeeping realign). A seat grounding on the primary reads the STALE path;
  recompute file locations with `git ls-files` in the branch you will edit, never from memory
  or from primary-checkout reads — moved-target rot applies to paths, not just content sets.
- **Quiet-pipe exit-mask, third recorded instance and it bit the ratification-guard verification**:
  `tsx plan-state.ts --census … | head -2; echo $?` read exit 0 on a refusal that exits 1 (head's
  code). Recurrence evidence across three seats now (Stoat, Goshawk, Rigel) — vigilance does not
  cure this class; run verification probes BARE and read `$?` off the command itself.
- **The Write tool embeds literal control bytes when asked to author escape-sequence content**
  (two attempts at an ANSI-strip regex landed raw ESC/C0 bytes in source; a heredoc did the same
  and tripped the command-approval control-char guard). Cure: author such files via a python
  script writing explicit `\\uXXXX`/`fromCharCode` forms, then byte-scan the file
  (`open(f,'rb')` filter) before staging. Fluency face: the file LOOKS right in the diff.
- **`never-disable-checks` pushed a better design on first contact**: the reflex fix for
  sonarjs/no-control-regex was an eslint-disable comment; the rule forced a pure code-point
  filter (`isTerminalControlCode`) instead — no regex, no disable, more legible. A disable
  comment is a check-disable even when the justification is genuine; ask what design removes
  the need before reaching for the annotation.
- **R0b gateway economics (7 seats, ~505k tokens, 2–8 min parallel)**: yield = 2 CONVERGENT
  must-fix classes (fail-open gate adapter, un-translated runner IO — each found independently
  by 2+ seats from different lenses), ~10 genuine improvements landed, 2 shared-surface security
  fixes (dangling-symlink write bypass in the SHARED helper; terminal escape-stripping), 1
  design question routed to the owner. Docs-adr caught a real code defect (duplicate-value
  parse gap) dressed as doc drift — the "verify each element of a compound TSDoc claim" face.
  Consistent with Stoat/Goshawk rounds: the roster keeps paying at tranche scale.

## 2026-07-08 — Rigel turns Void (c6080b): closeout captures

- **Classifier merge boundary, worked instance (candidate: pr-lifecycle Phase-7 amendment,
  registered in pending-graduations)**: `gh pr merge` on PR #323 — truly-green (CLEAN, 18/18,
  0 unresolved, settled round), MY OWN PR — was denied by the auto-mode classifier: "the
  reviews were the agent's own sub-agents, not two-party human review, and the user never
  authorized the merge". The Goshawk-era scope note ("own PR fine; another seat's PR needs a
  grant") under-read the boundary: self-authored + self-reviewed needs an IN-SESSION owner
  grant or the owner's click (which resolved #323, 06:46Z). Cost of the mis-read: two
  broadcasts promising "merge on truly-green" — an authority the seat did not hold. Cure:
  broadcast "merge-READY at truly-green"; surface the merge as the owner moment unless a
  named grant exists.
- **Read your own live-run output as a reviewer, not a success signal (fluency face)**: my
  live demo printed `plan-state: plan-state gate: green …` — the doubled prefix sat in my own
  transcript twice and I registered only "green". Copilot caught it. The live run is
  verification EVIDENCE; its text deserves the same adversarial read as a diff.
- **Vacuous-green in my own tooling ritual**: two watcher gap sweeps globbed `*.json` from the
  wrong cwd (the harness resets cwd between Bash calls) and reported "clean" on zero files —
  the exact class the module I was building refuses (a gate over nothing never passes).
  Caught third sweep; cure = absolute path in the sweep command, and treat empty sweep output
  over a directory that should have 150 files as a refusal, not a pass.
- **Live F-120 face at closeout**: the backgrounded whole-repo `pnpm check` rebuilds
  agent-tools/dist mid-run — a concurrent `collaboration-state` CLI call died on the loader
  (`cjs/loader:1503`). Don't invoke the built CLI while a check/build chain is rebuilding its
  dist; sequence CLI-dependent closeout steps after the check completes.
- **Owner cleared two gates while my context held them open** (#320 merged 20:10Z YESTERDAY,
  #323 merged 06:46Z): the closeout's write-time verification (6e.1) caught both. A held
  belief about an external gate is a cached read of a moving target — same class as the
  conserved-analysis rot, on coordination state rather than code.
- **Loss-scan findings (recursive pass, 2026-07-08 closeout)**: (1) the seven gateway
  verdicts lived only in session-mortal task outputs — the absorbed fixes were committed but
  the NOT-taken dispositions and the reviewers' anti-fix guidance would have been lost; cured
  by `handoffs/2026-07-08-rigel-r0b-gateway-adjudications.md` (second worked instance of
  Stoat's scratchpad-is-session-mortal rule, now at the VERDICT level, not just fix lists).
  (2) An unresolved tool-claim discrepancy (code-expert asserted writeArtefactSet exists; my
  export-grep found nothing; I silently fell back to a local atomic write) had reached no
  surface — a reviewer claim I neither verified nor recorded as unverified; conserved as an
  open note on the extraction item. General form: when you DECLINE a reviewer's prescribed
  mechanism on a factual ground, record the factual disagreement, not just the alternative.
  (3) Metaloss: the scan's residual loss is subjective decision-texture beyond the experience
  file — accepted, voluntary register by design.
