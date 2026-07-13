# PR #336: the review treadmill, the diff fleet, and what each taught — 2026-07-13

Session record (Monsoon herds Airstream, 8c566b; owner-directed). Two
assessment regimes ran against one artefact — PR #336's cross-estate
doctrine diff (~600 added lines over 15 files) — and this report records
the analysis results, how the fleet mechanisms and protocols performed,
and how both relate to upcoming work in this estate. Companion evidence:
the workflow journal for run `wf_508d7cac-c56` (session-local), the PR's
own review threads (every one dispositioned), and the batch commit
`SHA:5433b80ff`.

## 1. What was assessed

PR #336 lands the cross-estate window's doctrine: PDR-125 clause
amendments, PDR-063 §Retirement authority + §Deliberate succession,
PDR-064 intersection updates, the join-ceremony skill and cross-repo
rule, start-right-team mirrors, ADR-182/ADR-211 phenotype notes, the
controlling plan's clause mirror, and the practice-core changelog.

## 2. Regime one — the bot review treadmill (rounds 1–28)

Each push triggered a full re-review by three bots (Copilot, Codex,
Cursor Bugbot), ~10 minutes per round. New findings per round:
6, 12, 3, 3, 1, 5, 2, 6, 2, 3, 5, 2, 4, 4, 5, 3, 3, 1, 3, 1, 6, 5, 5,
2, 3, 4, 3, 4 (sum 106; counts are as-harvested per round — GitHub's
raw thread ledger runs higher because bots auto-outdate and supersede
threads between harvests, and a 16-thread post-merge tail wave landed
after round 28), every one
dispositioned with byte-verified replies (fixed, already-fixed-race, or
declined-with-rationale; three declines: a received exchange artefact's
wording per corrections-are-new-events, one estate-idiom flag, and the
changelog's bracketed estate name — that ledger's defined function).

The shape is NOT a clean asymptote. Substantive fixes to portable
doctrine created mirror obligations (skill, rule, adapters, changelog,
plan, host ADRs) that the next round then correctly demanded — roughly
half of all rounds were echoes of the previous round's own additions.
The detection rate approaches zero only when a push adds no new
doctrine surface. Real hardening emerged (executable bounds, observable
measurements, one boundary stated identically across five surfaces),
but at ~10 minutes and one full re-review per iteration.

## 3. Regime two — the diff fleet (owner-directed, ultracode)

One background workflow over the same diff, modelled on the sibling
estate's fleet-hardening runs (its 2026-07-12 deep review: expert
passes + a Haiku verification fleet, "every subagent claim
spot-verified or cross-converged before acceptance", with recorded
Haiku literalism overridden by first-hand reads).

Design:

- **66 Haiku finders** — one file × one lens each (contradiction,
  undefined-mechanism, counts, chronology, verified references,
  language, portability), low effort, ≤8 findings, anti-stub schema:
  every finding carries an EXACT verbatim quote (declared as
  byte-checked), and an empty result is declared a success.
- **6 Sonnet cross-surface agents** — the retirement family, the
  ceremony family, the plan mirror, provenance coherence,
  doctrine-vs-code (mechanism claims checked against
  `types.ts`, the wire schema, `derive.ts`, claims-adopt), and
  authority coherence.
- **1 Sonnet refute-first verifier per deduped finding** — fabrication
  check first (quote must exist verbatim), then adversarial
  adjudication with the literalism warning in the brief.
- **2 Sonnet completeness critics** (semantic drift; cold-executor
  walk).
- **Final layer: the primary agent's own read of ALL verdicts** —
  confirmed, refuted, and fabricated alike (assess-everything).

Run: 155 agents, 28 minutes wall-clock, ~6.6M subagent tokens,
1,276 tool uses.

## 4. Fleet results

**85 raw findings → 81 deduped (4 dedup-duplicates) → 66 verdict rows
(12 CONFIRMED / 52 substantively REFUTED / 1 verifier STUB recorded as
REFUTED / 1 FABRICATED / 0 UNCERTAIN) + 15 UNVERIFIED** — 15 VERIFIER
units died on the structured-output retry cap, so their findings carry
no verdict (a run defect, first mis-attributed to finders; see §5),
and one surviving REFUTED row's evidence field is literal
schema-padding filler (a verifier stub — see §5 and §8), so the
substantive verdict count is 65. The unverified residue's bodies are
preserved in the companion evidence file (§9), but no
verdict-to-finding linking key was captured — the linkage lived in
the verifier prompts, session-mortal — so the 15 are bounded as a
set, not individually identifiable (a second run defect; see §8). The
residue is dominated by the undefined-mechanism lens — cold-executor
definitional demands of the class the verified set already samples
heavily (that lens produced most of the refutations), so the expected
real-defect yield among the 15 is low but is NOT zero and was not
measured. The 12 confirmed were all real and all
fixed in the batch `SHA:5433b80ff`: a dangling practice-index link, a
missing amendment annotation on PDR-063's status, two grammar defects
in session-authored text ("pend authority to", "waits that window"),
a wrong ordinal citation (move 6 → move 7), a stale `last_updated`,
the QUIET classification made operational (three coordination
surfaces, all silent), estate-deictic worked examples made
role-neutral, two load-bearing clause-3 rules restored to the
ceremony's cold-read surface, an ADR list-indent defect, a missing
article, and a truings-vs-mirrors provenance split in PDR-125's
status. The critics added four design-level follow-ups (§7) and one
claim the primary refuted (a §Retirement-authority "tension" that
misread Step 1's routing sentence).

One meta-catch outranked the fleet: the pre-commit
reference-direction validator REFUSED the fleet's own link fix
(pointing portable Core at a repo-local file) and forced the correct
by-role reference per PDR-105. Deterministic gates stay above both
regimes.

## 5. Mechanism performance — what worked, what did not

Worked:

- **Quote-anchored anti-stub schema**: exactly 1 fabrication among
  the 66 verified findings — the 15 unverified were never
  fabrication-checked, so the bound over all 81 deduped is 1–16 —
  where the mandatory-verbatim-quote + declared byte-check pattern
  essentially eliminated the schema-valid-stub failure mode this
  estate recorded on 2026-07-08 (3/13 stubs without it) — for FINDER
  findings. Verifier evidence fields carried no such anchor and one
  stub survived there: a REFUTED verdict row whose evidence is
  literal schema-padding filler (see §8).
- **Sonnet verification layer**: 66 verdict rows over 81 deduped (65
  substantive after the one stub), 12
  confirmed; 53 of the 66 recorded verdicts were refutations (≈80% —
  52 substantive plus the 1 stub row recorded as REFUTED). The
  refutations were dominated by exactly the predicted Haiku failure
  modes: literalism (qualified statements read as unqualified),
  house-style flags, and already-handled-nearby claims. Without this
  layer the fleet's output would have been mostly noise.
- **Sonnet cross-surface agents**: contributed 3 of the 12 confirmed
  (the two provenance conflicts and the cold-read gap) — the lens
  Haiku structurally cannot hold.
- **Batching against the treadmill**: 7 bot findings arrived during
  the fleet run, were fixed locally and HELD, then landed with the
  fleet's 12 in ONE push — one bot round instead of up to seven.

Did not work / costs:

- **15/81 VERIFIER units (19%) died on the structured-output retry
  cap** — their findings carry no verdict and were silently dropped
  from the first draft of this ledger (caught by a post-merge
  reviewer; logged per no-silent-caps). Cure candidates: retry-cap
  raise, a fallback verifier on exhaustion, and a workflow-level
  invariant that verdict-count MUST equal deduped-count before the
  run reports.
- **Verified-subset finder precision was low** (12/66 verdicts ≈ 18%;
  the 15 unverified findings make overall precision a bound, 12/81 to
  27/81, not a point figure): acceptable only because
  verification was cheap relative to bot rounds; a standing protocol
  should tighten finder briefs with per-lens worked examples of
  NON-findings.
- **Latency**: 28 minutes end-to-end — ~3 bot rounds' worth — but it
  swept the WHOLE diff once, versus the treadmill's incremental
  drip. For a 28-round artefact the fleet is decisively cheaper in
  wall-clock; for a 2-round artefact it would not be.

## 6. Comparative verdict

The treadmill and the fleet found largely DISJOINT defect sets: the
bots excel at cross-round consistency pressure on freshly-pushed text
(they re-read the whole diff every time, mercilessly), while the
fleet's lens grid + critics found long-standing defects the bots never
raised across the treadmill (the dangling link, the stale `last_updated`, the
undefined QUIET check, the deictic examples). The right standing shape
is therefore **fleet-first, bots-after**: run the fleet BEFORE the
first push of any large doctrine diff, land one hardened batch, and
let the bots take one or two passes at the residue — inverting the
ratio that produced 28 rounds here.

## 7. Relation to upcoming OCE work

- **`effectiveness-and-impact` assessment-methodology research** (the
  `mcp-content-assessment-methodology-research` plan, owner-gated):
  this fleet is a live instance of the review-protocol shape the 697
  high-impact content items will need. Directly reusable primitives:
  the quote-anchored anti-fabrication schema (a content-eval
  primitive), the find/verify split with refute-first adjudication,
  the per-lens narrow-remit decomposition, and the measured
  finder-precision / verifier-yield figures as baseline data for the
  plan's M-family grounding (LLM-as-judge validity, statistical
  power). The 19% verifier-failure rate (15/81 schema-retry deaths) is
  a capability datum for
  runner selection (WS0 P2's MCPJam expressiveness probe should note
  model-tier floor effects).
- **Corpus-generalisation Phase 0** (paused; restart owner-scheduled):
  the phase-0 design's single-model-voter measurement (inter-lens
  phi ≈0.55 → ≈1.4 effective votes of 3) predicted that same-model
  voters are partially redundant; this run's cross-TIER split
  (Haiku find, Sonnet verify) is the complementary design point —
  diversity by capability tier, not just by lens — and the 80%
  refuted-verdict share (53/66 as recorded; 52 substantive after the
  stub, §4) is evidence the tiers genuinely disagree.
- **PDR-101 quorum economics**: a new data point beside the 2026-07-08
  four-seat quorum (~557k tokens, 2 convergent must-fix classes):
  155 agents / ~6.6M tokens / 12 confirmed + 4 design follow-ups on
  an already-22-rounds-reviewed artefact.
- **Acacia's draft PR #345** (concept exploration, same window):
  frames concern groupings as assurance boundaries joining
  expert-review corpora and automated eval suites — this fleet's
  lens grid is a concrete instance of such a boundary set; the two
  should meet in the content-workspace design when the owner
  schedules it.
- **Design follow-ups surfaced by the critics** (not fixed in the
  batch; they need owner/design input): (a) PDR-063 names no
  measurement procedure for its Step-1 percentages beyond the pending
  deterministic context-budget tooling — that tooling's plan should
  cite ruling 3's deadline contract as a consumer; (b) the
  effectiveness-window calibration exists for one model only, with no
  recalibration procedure for other models; (c) the
  guest-retirement intersection (PDR-063 firing while under the
  inter-practice ceremony) is unaddressed in both records; (d) the
  ceremony's adoption and closeout events carry no message_kind
  discriminator. Routed to the `agentic-engineering-enhancements`
  thread record's agenda by this report.

## 8. Failure-mode log (for the next fleet author)

- Structured-output retry deaths hit the VERIFIER path (15/81 Sonnet
  verifier units), not the Haiku finders as first assumed: add a
  fallback verifier on retry exhaustion and a workflow invariant that
  verdict-count equals deduped-count before the run reports.
- Capture a verdict-to-finding linking key IN the durable extract:
  this run's linkage lived only in the verifier prompts
  (session-mortal), so the 15 unverified findings are bounded as a
  set, not individually identifiable. One finding-key field per
  verdict row cures it.
- Anti-stub constraints must cover VERIFIER evidence fields, not only
  finder findings: one REFUTED verdict's evidence is literal
  schema-padding filler that passed schema validation — the
  quote-anchor protected findings only. The extract preserves the row
  as captured (never falsify the evidence file); the ledger counts it
  as a stub, not a substantive refutation.
- Export FULL evidence text in the durable extract — no slice caps:
  64 of the 66 captured verdict rows are clipped at exactly 500
  characters (most mid-rationale), so the extract's verdicts are
  auditable only to that depth and the full rationales died with the
  session. The extract writer, not the verifier, imposed the cap.
- Require the quoted source file in EVERY phase's finding schema: the
  run's FINDINGS_SCHEMA forbade additional properties and carried no
  file field — finder results got their file stamped by the dispatch
  wrapper, but cross-surface findings reached the deduper unstamped,
  so the file-aware dedup could not match them to file-scoped
  duplicates (the extract shows one pickup-contract defect surviving
  to two separate verdicts). A historical defect of the preserved
  script, not a fixable property of this run's data.
- Give completeness critics their own base prompt: this run's critics
  inherited COMMON's one-lens/one-file constraints verbatim while
  being asked for multi-file completeness reviews (the cross-surface
  phase replaced the constraint; the critic phase did not), so critic
  coverage is not reproducible as described. Also a historical defect
  of the preserved script.
- A comms watcher armed without its required `--seen-file` argument
  crash-loops silently inside a Monitor re-arm loop — assert the
  watcher live (F-95 check) after arming, not just armed.
- `gh pr update-branch` advances the remote: merge it back locally
  before the next push or the push is rejected non-fast-forward
  (bitten twice this session).
- Fleet fixes are NOT exempt from the estate's deterministic gates:
  run the full pre-commit chain before trusting any fleet fix
  (the reference-direction refusal here was correct).

## 9. Session loss review — what this context held, and where it now lives

Deep review at handoff (owner-directed). Everything below was, until this
handoff, held only in one very long session context.

**Conserved to durable homes:**

- The per-round finding data, disposition rationales, and comparative
  verdict — §2–§6 of this report + the PR's review threads (each
  reply is a byte-verified permanent record).
- The fleet's design, yields, failure modes, and reuse guidance — §3–§5,
  §8 of this report.
- The OCE-relevance bridges — §7, plus the AEE thread record's
  2026-07-13 lane update (the re-twin obligation and the four critic
  design gaps, routed as that lane's standing follow-ups).
- Session-behavioural lessons (the missed post-merge wave and its cure,
  the batching discipline, the watcher-assert lesson, the update-branch
  race, gates-outrank-fleets) — the napkin's 2026-07-13 part-2 entry.
- Live state for the next reader — repo-continuity's PR #336 bullet;
  the controlling plan's trued status and todo graph.
- The branch/worktree cleanup census and its proof criteria — the
  napkin entry (95 local + 2 remote deleted, 25 + 7 kept with reasons).
- The fleet workflow script — rescued verbatim post-close by the
  retiring seat's preservation-addendum comms event: it lives at
  [`pr336-fleet-workflow-script-2026-07-13.js.txt`](pr336-fleet-workflow-script-2026-07-13.js.txt)
  (the calibrated craft — exact lens briefs, anti-stub schemas,
  verifier procedure — beside §3's design description).

**Accepted ephemeral losses (deliberate, with reasoning):**

- The fleet's raw per-agent transcripts and the workflow journal
  (session-local): the durable extract is the companion evidence file
  [`pr336-fleet-raw-findings-2026-07-13.jsonl`](pr336-fleet-raw-findings-2026-07-13.jsonl)
  (all 85 raw finder findings — 81 deduped after the 4
  dedup-duplicates — and all 66 verdict rows; the arithmetic is
  85 − 4 = 81 and 81 − 66 = 15 unverified, whose bodies are among the
  81 but carry no verdict-to-finding linking key, so they are bounded
  as a set rather than individually recoverable — see §4 and §8).
  Verdict evidence was captured TRUNCATED: 64 of the 66 rows are
  clipped at exactly 500 characters, most mid-rationale, so the
  extract's verdicts are auditable only to that depth; the full
  rationales are session-mortal (a third run defect — see §8). The
  transcripts behind them remain session-mortal, reproducible in
  design from §3.
- The 52 substantively refuted, 1 stub-refuted, and 1 fabricated
  finding bodies, and the 15 unverified findings (see §4): their raw
  bodies survive in the companion evidence file, but the refute-rate
  and failure-mode analysis (§5) is the durable signal; the bodies
  are fleet-output residue, and the unverified 15's expected yield is
  assessed low in §4 — an accepted, NAMED de-prioritisation rather
  than a silent loss.
- Chat-only reasoning texture (round-by-round triage deliberation,
  owner exchange phrasing): the decisions all landed in commits, thread
  replies, and this report; the texture is session-mortal by design.

**Residue explicitly handed forward (not lost, owned):**

- The stale Hedgehog claim `b23a3800` in `active-claims.json`
  (warden-lane sweep).
- The 7 `remediate-main-*` remote branches (owner judgment, not proof).
- The napkin is well over its rotation threshold (~700 lines) — a
  dedicated consolidation pass is DUE (recorded here per the
  consolidation gate; not run at this handoff, which is session-scoped).
- The re-twin bundle for the sibling estate (the changelog's 2026-07-13
  per-item dispositions are the manifest).
