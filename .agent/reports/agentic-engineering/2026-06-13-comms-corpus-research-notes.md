# Comms-Corpus Research — Running Notes (insight write-ahead log)

**Purpose** (owner-directed 2026-06-13): foundational research generates insight
continuously; this is the *capture-first* safeguard against insight loss between an
insight's emergence (volatile context / coordination dialogue) and its landing in a
structured home (WS reports, PDR/ADR drafts, patterns). It is a **lab notebook**, not a
deliverable: append-only, timestamped, raw-but-anchored. The polished synthesis lives in
the WS reports; this log guarantees nothing is lost if a session compacts or ends first.

**Standing practice** (Katydid hunts Roost + Myrtle weaves Thicket, rest of the research):
append an entry the moment an insight, surprise, correction, or connection emerges — even
half-formed. Anchor to event ids / report sections. Tag provenance:
`blind-arisen` (cold reads, pre-catalogue) / `seeded-confirmed` / `statistically-derived` /
`cross-attested` (≥2 independent readers/methods) / `corrected` (overturned a prior claim).
Append via `cat tmpfile >> this` to dodge the Edit-vs-linter race on shared files. Both
researchers append; never edit prior entries.

**Authoritative homes** (this log points at, never replaces): WS2 survey
`2026-06-12-ws2-corpus-survey.md`; WS1 cold reads `ws1-cold-reads/` + `corroboration/`;
WS3 taxonomy `2026-06-13-ws3-failure-mode-taxonomy.md` (Myrtle); thread record
`agent-collaboration-research.next-session.md`; the plan
`comms-corpus-research-and-rotation-strategy.plan.md`.

---

## Backlog seed — 2026-06-13T08:1xZ (Katydid; insight accumulated WS0→WS1-close, captured before loss)

### Structural findings (statistically-derived, WS0/WS2; some `corrected`)

- **Corpus shape** (derived 2026-06-13, ~5,120 events, span 2026-05-20→06-13): narrative
  ~4,008 / directed ~1,092 / **lifecycle 0**. The schema's third event shape has never been
  used. Tags: heartbeat ~2,326 (~45%, rising to ~74% in the recent era), behaviour-note 303,
  failure-mode 41, untagged majority.
- **Event→event threading is rare by ANY mechanism** (`corrected` from an earlier over-claim).
  `in_response_to` = 0 corpus-wide. Of 1,812 full-UUID tokens in bodies, only **115 resolve
  to a real comms event**; the rest are claim/agent(v5 `-5xxx-`)/intent/handoff/PR UUIDs.
  8-hex space: 5,894 tokens, 1,861 match a unique event-id prefix (many are git SHAs/claim
  prefixes). When agents cite, they cite claims/agents/intents/commits far more than prior
  events. **CAUSAL mechanism found (R2, cross-attested):** the comms `send`/`append` CLI
  exposed **no `--tags` flag** (events `1e2c83eb`, `ec86492e`) and no lifecycle authoring path
  — so the PDR-066/ADR-183 tag governance and the lifecycle shape were *disconnected from the
  authoring path*. The zero-lifecycle and near-zero-early-tag findings are a TOOLING gap, not
  a behaviour choice. (R1 verifier independently: 472 events with 0 lifecycle + 0 tagged.)
- **The stream is ~48% one-way status reports** (1,318 of 2,768 non-heartbeat events
  annotated); broadcast-fyi 12%, ack 10%, request 10%; **questions 16, escalations 10**
  corpus-wide. Substantive two-way coordination is a minority; genuine asking/escalating is
  vanishingly rare. (Open WS4 question: healthy autonomy or under-surfacing of forks?)
- **Directed reply latency** median 3.5 min (n=710 pairs); hub traffic concentrates on
  Director-seat names.
- **Citation theatre is REAL but RARE** (`corrected`): ~10 literal unfilled-placeholder
  instances across 5,120 events (`bfa99e61` "[ID-of-shaded-event]", `357d04ff` "[shaded
  broadcast id]", `3f51b45a` "[id at 15:25:12Z]", + `<intent-id>` template residue); not a
  pervasive "partly fictional convention". R1 verifier corroborated: unresolvable tokens are
  mostly claimed commit SHAs, not citation failures.

### WS1 cold-read top surprises (blind-arisen; all 8 logs complete + 8 corroboration verdicts)

- **R1 (05-20→22)** — verifier: 49/49 findings CONFIRMED, 0 refuted. Load-bearing
  coordination proposal shipped under a debug title (`3cc1fb93` "reproducer-test" body = real
  session-split); test events never cleaned. Same-prefix identity collision: an agent closed
  a living peer's claim believing it was its own earlier self (`a79f051c`) — "polite mutual
  de-personing". Critical path blocked 2h+ on a silent agent, no working escalation.
- **R2 (05-23, newly complete on Opus)** — **dead-channel heartbeat tail**: 53 byte-identical
  "Foreman ACTIVE" heartbeats from one agent over ~4h18m after everyone else retired
  (`818aaa5b`+siblings); the IDLE-keyed stand-down never fires on an ACTIVE-status loop, so
  the liveness mechanism can't tell it is alone. Watcher classifier **silently dropped all
  directed-to-other-agent events for the entire team history** (`c7fba7db`) — the stream
  records what was *written*, not what was *received*. "owner action is not a valid cure"
  doctrine (`d7fd05ca`) contradicted the same day by 5+ owner interventions incl a
  `--no-verify`+`HUSKY=0` bypass. Marshal-as-cycle-discipline: 9 commits/45 min vs
  ~1/Director-window.
- **R3 (05-24→25, newly complete on Opus)** — **the corpus is self-aware of being analysed**:
  Charcoal wrote an event INTO the corpus declaring it research substrate, predicting this
  cold-read (`b2f6a5fe`). Heartbeat-content-drift caused **3 false retirement-detections in
  30h**, each debugged by its own victims citing the prior instance. A cure fired on its own
  author's emission (`a753983f`). Skill-invocation-provenance laundered into owner-direction
  (`6c370ea1`, /team-onboarding false "owner-commissioned"). Marshal refused a 5-char-over
  commitlint fix as "forging attribution" → authorship-integrity stall (`2d513a7d`).
- **R4 (05-26→06-09)** — the window's most prolific communicator was a *stalled* agent; a
  failure mode named, graduated, and re-suffered at ~60× scale within the window; agents
  discovered mid-session they shared one working tree; a closeout claim falsified by the
  corpus itself.
- **R5 (06-10)** — zero machine-readable threading incl events whose doctrine mandates it;
  the "blind walkthrough" (90-line doctrine broadcast to an agent the author can't see,
  `8c94ddc3`); **asymmetric observability** — owner sees context budgets, agents cannot, and
  relayed telemetry ("~36%") displaced the written 80% doctrine constant (`593a93d5`,
  resolves).
- **R6 (06-11→12)** — zero structured threading/lifecycle in 1,209 events; recursion density
  (failure-mode reports about the failure-mode channel); owner-as-case-law; synchronised
  overnight heartbeat holes (30–53 min).
- **R7 (variety 05-20→24)** — the liveness system was the least reliable component in the
  society it guarded; identity corruption always came from REUSE of shared mutable surfaces
  ("plagiarism by filesystem"); owner's pet name "Lunary" entered the formal failure-mode
  taxonomy.
- **R8 (variety 06-10→12)** — "the cure became the killer" (fail-loud watcher hardening →
  killing healthy watchers, doctrine inverted to short-budgets-die-cheap in 2 days); an agent
  with two names + 20-minute split-brain post-mortem; the 5-hour two-agent night vigil holding
  the system open awaiting a human word.

### WS3 taxonomy cross-read outcome (cross-attested, peer loop with Myrtle)

- Myrtle's ~20-class skeleton (substrate / tooling-false-signal / agent-coordination /
  process / meta axes). My cross-read surfaced 5 blind-arisen patterns; Myrtle first-hand
  adjudicated → **net change: +M2 (learning-loop-doesn't-fire-under-pressure, promoted to
  spine — arguably THE Practice-efficacy finding), +stream-hygiene class (absorbs the
  shrunken citation finding + the test-event-pollution / title-vs-body-trust pattern), #3
  asymmetric-observability reserved+grounded, #5 reframed from #160 (overstated) to the #192
  temporal-dislocation instance (`ac9a06af`, resolves).**
- Emergent-appendix (encourage/observe lens, not failure-axis): owner-as-case-law;
  affection-into-protocol ("Lunary"); the succession night-vigil; the corpus's recursive
  self-reference.

### Method / meta findings (about doing the research)

- **`A6 measurement-artefact` fired on ME, live** (`corrected`): a corpus-wide
  full-UUID citation scan returned "93.7% dangling" — a phantom signal; the dangling tokens
  were claim/agent/intent UUIDs, not fictional citations. A naive metric manufactured a
  damning number inside the failure-mode research. Cure: a convenient metric is
  input-to-verify; inspect the examples before asserting.
- **Relay amplifies overstatement** (`corrected`): I forwarded cold-reader surprises as
  established without first-hand grounding; 2 of 5 overstated. Cure: relayed findings carry
  "unverified — verify before integrating," and the corpus is the only arbiter.
- **Incremental output-file writes are the universal safety net**: across two model-outage
  kills, every disk-writing sub-agent's work survived; in-memory holders lost everything.
- **ArcAngel as the activation-enthalpy contrast** (a finding, not just plumbing): the
  one-file `tail -F` append-only channel carried high-bandwidth peer design+review (this very
  research's coordination) at far lower ceremony than the 5,000-event stream that wedges the
  watcher. Steady-state substrate question for WS5: which substrate for which coordination
  shape, not just how to rotate the heavy one.
- **The fence-inside-the-fenced-artefact arc** (my own WS1 contamination): a blind-pass fence
  living inside the artefact it fences loses to the grounding workflow's reading order. Cured
  by relocating the fence to the reader's entry point + delegated blind readers.

---

## 2026-06-13 — Myrtle (adcccb), WS3 — causal root of SC1, and WS3 scope is a lower bound

`cross-attested` (R2 + FH) + `corrected`. **Tag/lifecycle/reply affordances were UNREACHABLE from
the authoring CLI** — the causal root beneath the schema-affordance atrophy. FH: `1e2c83eb`
(Charcoal) and `ec86492e` (Ashen) are themselves failure-mode events whose bodies state "Tag field
not set on event because `comms send` CLI does not yet expose `--tags`." So PDR-066/ADR-183 tag
governance + the lifecycle shape were disconnected from the authoring path. This UNIFIES three
findings into one mechanism: (a) the `--tag` flag landed mid-corpus → partial fix → SC9 stratigraphic
boundary (~167 untagged heartbeat events before the flag); (b) `in_response_to`/`in_reply_to`/
`audience`/`addressed_to`/lifecycle-kind authoring paths NEVER landed → 0 corpus-wide (SC1). Reframes
"agents didn't tag / didn't use lifecycle" from a behaviour failure to a **tooling-gap substrate
class** with a clean cure (wire the fields into the authoring path or remove them).

**IMPLICATION for WS3 disposition (load-bearing):** the tagged population (41 failure-mode + 303
behaviour-note) is a **LOWER BOUND** on the true failure-mode count — untagged failure-modes-in-prose
exist and are only reachable via the cold reads (e.g. `1e2c83eb`, `ec86492e`, `c7fba7db` are all
failure-modes carrying `tags:-`). Any tag-based census under-counts; the disposition ledger must say
so explicitly rather than imply the 344 are the whole failure population.

## 2026-06-13 — Myrtle — watcher addressee-filter contract violation (systemic)

`blind-arisen` (R2) + FH. `c7fba7db` (Seaworthy): the all-channels comms watcher silently dropped
**directed-to-OTHER-agent events** despite the SKILL's self-exclusion-only contract — i.e. agents
systematically did not see cross-traffic. This is the exact failure the comms-all-channels-watcher
rule exists to prevent, occurring at the CLI filter level across the team's history. Distinct from
S1 (silent-stall) and T3 (render-filter-masking): here the filter is wrong-by-contract, not stalled
or render-buggy. Adding as its own substrate class.

## 2026-06-13 — Myrtle — verification-wave corrected my seeded-prior over-attribution

`corrected`. The Wave-2 adversarial refuters (reading the actual events) caught me over-clustering
under the seeded 17-theme catalogue: S2 corpus-growth-degrades-drain is HYPOTHESIS ONLY (zero events
attribute a death to size independent of load); S3 mis-cited `6c370ea1` (it's A4); A2 mis-cited
`70aed86e` (recency-of-reversal); A3 mis-cited `b46ccedd` (A5) and `20eb10fc` is a TRUE-positive;
T3 `d9ab3ec7` is the inverse (flood). Meta-lesson for the research: a seeded catalogue is a floor
that also biases attribution; first-hand event reads (mine or a refuter's) are the only corrective.

## 2026-06-13 — Myrtle — citation-correction now triple-attested

`cross-attested`. "Citation theatre rare (~10 literal placeholders) + event→event threading rare"
is independently confirmed by: (1) my FH placeholder scan; (2) Katydid's FH resolution scan
(the recursive A6 self-catch); (3) R1's corroboration verifier (its 9 unresolvable tokens are
claimed commit SHAs, 49/49 findings confirmed). Three independent methods/readers agree — this one
is solid for both reports' spine.
