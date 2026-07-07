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
