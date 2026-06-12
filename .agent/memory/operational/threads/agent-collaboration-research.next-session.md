---
fitness_line_target: 700
fitness_line_limit: 1100
fitness_char_limit: 70000
fitness_line_length: 100
fitness_content_role: reference
overflow_disposition: 'leave-if-live; else conserve-insight-and-delete — never archive/split/rotate/shard (see continuity-practice.md §Disposition of Continuity Surfaces)'
merge_class: index-narrative-tables
---
# Next-Session Record — `agent-collaboration-research` thread

## Status

**Execution-ready; successor session executes (planning session closed 2026-06-12, Fern lifts
Mulch / 66f12b).** The owner reshaped the first dispatch into a planning session: the companion
plan
[`comms-corpus-research-and-rotation-strategy.plan.md`](../../plans/agent-tooling/current/comms-corpus-research-and-rotation-strategy.plan.md)
is now decision-complete and execution-ready — owner-amended same day to own the full arc
(WS6 comprehensive synthesis report; owner-gated WS7 executes the ratified end-state:
contract-surface relocation, experiments/ preservation, `.agent/state/` untracked-by-design,
7-day default retention purge post-absorption). Immediate preservation landed: the
experiments/ gitignore policy was flipped and five machine-local experiment records committed.
The successor research session enters via the
[opener prompt](../../prompts/agentic-engineering/comms-corpus-research-session.prompt.md) and
begins at WS0. **Blind-pass attestation**: the planning seat did NOT open this record's two
Candidate Themes sections, the fenced comms-pattern files, or prior napkin/distilled
comms-pattern commentary — the WS1 cold read remains uncontaminated for the successor. This
record remains the research-substrate home (hypothesis, themes, vectors, corpus facts).

## Origin

Created 2026-05-24 at the post-M1-Safe-Pause-merge boundary by Charcoal Brazing Kiln
(`claude / claude-opus-4-7 / 7c7327`) under owner direction. Verbatim:

> "A significant amount of work was done over the last few days to improve the agent
> collaboration capabilities of the repo and the Practice. Much of that is documented in ADRs
> and PDRs. A great deal more is not documented, but is inherent in the many, many comms logs
> we have preserved. Even deeper, there are yet to be recognised or analysed patterns that will
> emerge from the comms logs, analysed over time, subject, context, theme, connection, that
> will contribute massively to our understand of modes of agent collaboration and how to
> improve it. This is true original research. That research will require dedicated sessions by
> dedicated agents. It can't happen yet, but it must happen."

## The Research Vector

**Hypothesis**: the `.agent/state/collaboration/comms/` event archive — ~5 days of intensive
multi-agent collaboration leading into M1 Safe Pause, grown to **3,153 events (as of
2026-06-12T07:05Z; re-derive at use) spanning 2026-05-20 → live** — is **research substrate**
for understanding modes of agent collaboration. Since the original capture window the corpus
has gained whole new event classes: heartbeat-tagged liveness events (ADR-186),
`mid-cycle-handoff` directed events
(PDR-063 / ADR-182), live `failure-mode` / `behaviour-note` tag usage (ADR-183 / PDR-066),
and complete coordinated-team arcs (bootstrap → P1 diagnosis → merge sequencing → completion,
2026-06-11/12). Patterns exist in the corpus that:

- Have already been documented in ADRs / PDRs (the recorded substrate)
- Are visible to agents inside individual sessions but never extracted (operational-but-
  undocumented)
- Are **only visible across multiple events analysed together** by subject, context, theme, and
  connection (yet-to-be-recognised; true original research material)

The corpus is structured-enough to support automated pattern mining (each event has timestamp,
author tuple, recipient, kind, tags, body, optional `in_response_to`) and rich-enough that agent
qualitative analysis adds value beyond automated extraction.

## Preservation Boundary

The preserved `.agent/state/collaboration/` corpus is a bounded research
exception, not a declaration that state files are long-term storage. Owner
clarification on 2026-05-27: state files should generally be processed as
potential knowledge source files, useful substance routed to durable
memory/docs/plans, and the state files then deleted. While this thread remains
owner-gated, keep the corpus intact for the future comms/coordination research
plan. When the owner opens cleanup or research processing, use item-level
disposition evidence rather than archive-only movement.

Two facts sharpen the boundary as of 2026-06-12:

- **The hold now has an operational cost.** The 3,109-file flat directory degrades the live
  comms watcher: drain steps exceeded their 60 s (and later 300 s) deadlines twice on
  2026-06-11/12, killing the Director's watcher mid-session. Preservation-without-rotation is
  itself a recorded substrate-failure-mode instance (see new theme 13). The research unlock is
  therefore operationally urgent, not only intellectually valuable.
- **The corpus is git-heterogeneous.** Older events are committed; recent events (including the
  entire 2026-06-11/12 handover arc) are untracked working-tree files. Deleting an untracked
  event is unrecoverable loss. Any rotation mechanism must treat commit-or-absorb as the
  precondition for deletion of untracked events. **Corrected 2026-06-12 (Fern lifts Mulch,
  verified first-hand)**: commit `567bf0f1a` tracked the full corpus — all 4,978 events are
  now committed, zero untracked. The held corpus is git-recoverable; the commit-or-absorb
  invariant remains live for future events written after any untracking lands.

## Research Lenses (owner-named, 2026-06-12)

The research is explicitly not a find-and-fix-problems pass. Three lenses, with the third
weighted highest:

1. **Failure modes** — what went wrong, clustered with cure-shapes.
2. **What worked well** — successful practices and substrate behaviours, named so they can be
   protected and propagated rather than accidentally regressed.
3. **Surprising emergent behaviour** — behaviours nobody designed that the corpus reveals.
   These are steerable: the cure-shape vocabulary is **activation-enthalpy tuning** — nudges
   in comms tool design, defaults, affordances, and ceremony cost that make a desired emergent
   behaviour cheaper to do and an undesired one costlier, in preference to mandates or
   prohibitions. Encouraging, discouraging, or simply observing are all legitimate verdicts.

## Analysis Vectors (owner-named)

1. **Subject**: what was being discussed (marshal cycles, reviewer dispatch, owner direction,
   claim coordination, watcher behaviour, …)
2. **Context**: when in the session arc the event lands (session-open, mid-cycle, pre-pause,
   pre-compaction, post-merge, …)
3. **Theme**: recurring concerns across events (failure modes, behaviour notes, heartbeat
   cadence, coordination protocol, substrate writes, …)
4. **Connection**: cross-event linkages — citation references in bodies (the practical
   linkage substrate: the structured `in_response_to` field is unpopulated corpus-wide as of
   2026-06-12, so chains are reconstructed from body-text event-id citations, subject
   threading, and temporal adjacency), identity tuples appearing across multiple lanes,
   conceptual adjacency

## Candidate Themes (catalogue seeded from one session — 2026-05-24 Charcoal lens)

Not exhaustive; intended to give a future research-mode agent worked examples of what the
corpus contains and what counts as a pattern.

### 1. Substrate-pointer-pattern v2 (terminal-state vs running-state)

- **Shape**: agent A reads agent B's state from a SNAPSHOT (closeout broadcast, thread record,
  team-shape enumeration) and treats it as current truth. Agent B has since resumed; A acts on
  stale assumptions.
- **Worked instances**: ≥20 captured in one session window (Director Seaworthy's `f6eb4f51`
  team-shape broadcast listing two agents as closed-out 64s after both had resumed; Mistbound
  presume-ended broadcasts; multiple post-compaction misreads).
- **Existing substrate**: `.agent/memory/active/patterns/substrate-pointer-read-as-current-state.md`
- **Research angles**: when does snapshot-vs-stream distinction matter most? Cure-shape across
  roles (Director, Marshal, Implementer, Curator). Failure-mode taxonomy. Near
  doctrine-graduation.

### 2. Marshal-seat watcher silent-failure mode

- **Shape**: watcher silently drops events; the affected agent doesn't surface the loss; only
  detected via cross-substrate analysis (napkin captures from peers).
- **Worked instances**: Mistbound missed Twilit's `ef315373` for 95m, Charcoal's `625fb072`
  for 75m, Director's `b2258cf5` for 85m on 2026-05-24. Discovered when Mistbound's
  compaction-4 brief read the prior session's napkin entries.
- **Cure candidates** (proposed in real-time, not yet structurally landed): watcher self-test
  loop, periodic comms-dir count audit, durable `last_heartbeat_at` field on active-claims with
  auto-rebalance.
- **Research angles**: this is a SUBSTRATE-FAILURE-MODE not an agent-failure-mode. How do we
  build observability INTO substrate primitives so they self-report failure? What's the
  taxonomy of substrate-failure-modes vs agent-failure-modes?

### 3. Owner-direction supremacy on OUTCOME not LITERAL form

- **Shape**: owner says "commit everything" / "push" / "pause". Different team-states demand
  different shapes of execution. The right interpretation honors the OUTCOME the owner wants
  (durable substrate in repo) not the LITERAL form (one commit).
- **Worked instances** (one session, same verb, different shapes): "commit everything" →
  3-commit-split for heterogeneous-tree state with in-flight peer cycles, AND single-bundle
  commit-all for cleared-queue state.
- **Research angles**: how do agents distinguish outcome from literal? Failure mode where
  literal-form interpretation forecloses better shapes. Owner-direction-verb taxonomy with
  shape-variation analysis.

### 4. Mid-cycle pause preserving reviewer convergence

- **Shape**: implementer pauses mid-claim after reviewer convergence is captured in
  transcripts. Substrate may be discarded during downstream branch-shift; convergence is
  preserved in transcript IDs cited in closeout broadcasts.
- **Worked instances**: Charcoal Cycle Beta on 2026-05-24 — reviewer convergence (code-expert
  `af7b0338079198b3e` + security-expert `ac025ad946e546bee`) preserved across pause +
  branch-shift + substrate-discard.
- **Research angles**: what's the value-preservation contract across forced-discard boundaries?
  What survives, what doesn't, what should?

### 5. Cross-platform marshal cycle protocol parity

- **Shape**: collaboration substrate (comms events + claims + marshal-request shape) is
  platform-agnostic. Codex peer runs identical DM-ACK-stage-husky-commit cycle as Claude peers.
- **Worked instances**: Estuarine codex marshal-cycle landed at `c697d18b` on 2026-05-24 with
  zero protocol modification.
- **Research angles**: what other protocols exhibit this property? Where would platform-specific
  divergence be inevitable vs avoidable?

### 6. Owner-authz exception architectural-honesty

- **Shape**: when an owner-authorized exception is technically redundant with existing
  structure, the right cure is to action the directed cure AND name the
  redundancy/architectural-truth inline at the change-site — not just in the routing event.
- **Worked instances**: Charcoal's sonar.cpd.exclusions edit on 2026-05-24 (`79c148e4`) — added
  entry that the existing `**/src/types/generated/**` glob already matched; preserved
  architectural truth in the inline policy comment.
- **Research angles**: where does architectural truth live? Change-site as canonical home vs
  distributed across routing events.

### 7. Watcher-as-team-state-shared-memory

- **Shape**: all-channels comms watcher gives post-compaction agents the substrate to
  reconstruct team state without explicit coordination. Watcher-stop happens at session-end;
  new session restarts watcher and replays via seen-file delta.
- **Research angles**: this is "substrate-as-shared-memory with replay semantics". Consistency
  model? When do compaction boundaries break observability? How does it compare to other
  shared-memory primitives in multi-process systems?

### 8. Heartbeat cron + cron-redundancy rule

- **Shape**: 4-min liveness cadence with skip-if-substantive-activity-within-window rule.
  Low-coordination + self-organizing.
- **Research angles**: false-positive/false-negative ratio of the cron-redundancy rule. When
  does it misfire? Is 4 min the right cadence?

### 9. PDR-064 Coordinator Handoff two-moments worked corpus

- **Shape**: pre-positioning (information transfer only) → active-acknowledgement (authority
  transfer). Conflating creates a coordinator-less window.
- **Worked instances**: multiple Director / Marshal transitions across the corpus.
- **Research angles**: how often does Moment 2 NOT happen after Moment 1? Coordinator-less-window
  cost analysis. Variations of the protocol that have emerged across the team.

### 10. 3-commit-split vs single-bundle commit-all

- **Shape**: both are valid responses to "commit everything"; the choice depends on tree-state
  heterogeneity vs owner-direction priority.
- **Research angles**: when does each shape work? Failure mode of choosing wrong? Decision-tree
  codification candidate.

### Meta-theme: the corpus as research substrate

- Each comms event carries structured metadata; aggregate has temporal patterns (silence
  windows, burst patterns, heartbeat cadence), subject clustering (lanes), theme clustering
  (tags).
- Structured-enough for automated pattern mining; rich-enough for qualitative analysis.

## Candidate Themes — second seeding (2026-06-12, Firefly seeks Temper / Director lens)

Captured from the 2026-06-11/12 handover-team arc, which the corpus now holds end to end
(two PDR-063 mid-cycle handovers, a P1 defect arc, Director merge sequencing, completion).
As with the first seeding: these are worked examples of what counts as a pattern, a floor and
never a fence — the owner's standing direction is that the corpus holds surprises not yet
recognised, and the research must protect open discovery from these priors (see the companion
plan's blind cold-read workstream and this record's Resume Contract exception).

### 11. Resumed-session temporal dislocation

- **Shape**: a session frozen mid-action resumes, completes the action on wake, and reports it
  as a past action at the remembered (pre-freeze) timestamp — directing peers to verify against
  an account that authoritative surfaces contradict.
- **Worked instance**: PR #192 "merged ~22:33Z" claim vs GitHub `mergedAt 06:24:45Z`; Director
  behaviour-note event `ac9a06af` carries the four-section capture and cure.
- **Research angles**: temporal sibling of theme 1 (snapshot-vs-stream). What session-state
  classes invalidate at freeze/resume boundaries (clock, branch, cwd, in-flight ledger)? Can
  the cure (re-derive + re-verify on resumed turns) be made structural rather than behavioural?

### 12. Identity era-provenance erasure (the split-brain arc)

- **Shape**: a cache channel records a *derived rendering* (the name) instead of the
  *derivation input* (the schema era); any later schema activation makes one seed render two
  live names, fracturing claim ownership, watcher self-exclusion, and roster-to-registry maps.
- **Worked instances**: Zephyr/Harrier dual rendering 2026-06-11; five tuples stamping
  `naming_schema_version: "override"`; diagnosis + ruling events `10cb3a10`, `46db87d0`;
  cure direction = era pinning (post-ADR-198 follow-on plan).
- **Research angles**: which other substrate fields cache derived values where inputs should be
  pinned? A general derive-at-use-time vs cache-at-mint-time taxonomy for identity-adjacent
  state.

### 13. Corpus growth degrades the live mechanism (reflexive substrate finding)

- **Shape**: the preservation hold that protects the research substrate grows the flat event
  directory until the watcher that depends on it starts dying (drain-step timeouts) — the
  corpus's value-preservation mechanism erodes the team's awareness mechanism.
- **Worked instances**: EIGHT watcher deaths across THREE sessions in one team window —
  Director (60 s + 300 s budgets), Cosmos turns Equinox (3 deaths across 60/180/300 s;
  failure-mode event 06:42:11Z: "raising budgets is not the cure"; deaths correlate with
  heavy parallel gate load), Moss weaves Blossom (2 deaths, corroboration event 06:42:42Z;
  then a third at 06:54:04Z). Between deaths the same directory drained in seconds.
- **Hypothesis revision in-flight (worth studying as a live falsification arc)**: the first
  diagnosis was load-starvation (slow-but-healthy drain killed by a fixed budget). Moss's
  eighth death falsified load-starvation-only: a 540 s budget died at MODERATE load on a
  stable 3,143-event dir — an intermittent BLOCKING wedge in the drain path. Operational
  inversion follows: keep budgets SHORT (fail fast + restart) because a long budget extends
  blindness without saving a wedged drain (behaviour-note event 06:54:04Z).
- **Research angles**: substrate scalability envelopes; what directory/storage shape decouples
  preservation volume from watch latency (joins `comms-watch-storage-redesign`); rotation as
  the structural cure (see §Non-Held Rotation Strategy below).

### 14. Heartbeat cadence under turn starvation

- **Shape**: heartbeat loops emit only when their session is scheduled; overnight turn
  starvation stretched a 4-minute cadence to 20–40+ minutes while sessions remained healthy.
  Observe-side thresholds (10-minute retirement) misread starved-but-fine sessions; the
  heartbeat measures *scheduling*, not *agent intent or health*.
- **Worked instances**: both implementer lanes overnight 2026-06-11→12; Director correctly
  withheld retirement-detection by cross-checking ground truth (PR/git state) first.
- **Research angles**: false-positive analysis for PDR-078 thresholds across operating modes
  (owner-attended vs unattended); should cadence contracts be scheduling-aware?

### 15. PDR-063 mid-cycle handover — first by-the-book worked pair

- **Shape**: freeze record → claim pointer → directed `mid-cycle-handoff` event → heartbeat-end
  → successor reads record end-to-end → pickup broadcast with first-hand state re-verification.
- **Worked instances**: Dusky→Cosmos (record `7fb69812-…`, pickup caught a push that never
  completed) and Zephyr→Moss (record `2a080642-…`, six sections) on 2026-06-11; zero work loss
  across both.
- **Research angles**: which record sections did successors actually consume? Cost of the
  protocol vs the loss it prevented; what the pickup re-verification catches in practice
  (stale push state, stale claims) as a class.

### 16. Cross-lane file collisions cured by merge sequencing

- **Shape**: an accidental broad-add sweep put one lane's artefacts on another lane's branch;
  the cure was Director-serialised merge ordering plus a named per-path resolution rule —
  coordination-by-ordering instead of conflict-resolution-by-reviewer.
- **Worked instance**: snagging plan + cursor-visibility write-up on both branches; ruling
  event `a774bacd` (#190 → #191 → #189, main-authoritative on the two paths).
- **Research angles**: when is ordering cheaper than ownership enforcement? Interaction with
  the pure-diff convention (registry state out of feature branches).

### 17. Declared-vs-actual drift in liveness substrate (stale heartbeat typed-args)

- **Shape**: heartbeat loops armed once at bootstrap keep broadcasting stale claim/cycle state
  after the lane moves on; the liveness stream silently diverges from registry truth.
- **Worked instances**: two stale-args windows on one lane 2026-06-11 (cured in under a minute
  per nudge, events `269714aa` + re-arms); contrast with the same lane's accurate substantive
  reporting.
- **Research angles**: should heartbeat args derive from the registry at emit time instead of
  being baked into the loop? Cheap consistency checks between heartbeat claims and
  `active-claims.json`.

## Dedicated-Session Profile (research-mode agent)

What kind of agent should do this research?

- **Reflective profile, not execution profile** — disposition to step back, not push forward
- **Pattern-mining capability** — holds many events in working memory; finds connections
- **Boundary-aware** — knows when a pattern is doctrine-grade vs note-grade
- **Substrate-fluent** — understands PDR / ADR / napkin / pending-graduations / thread-record
  taxonomy
- **Capable of producing research outputs** — ADR-class artefacts, PDR-class artefacts, possibly
  new doctrine-class artefacts

## Possible Session Shapes

1. **Corpus survey session** — comprehensive read of comms archive across N days; emit a
   structured pattern taxonomy
2. **Theme-deep-dive session** — take one candidate theme; produce a research artefact with N
   worked instances + cure-shape recommendations
3. **Cross-PDR analysis session** — read all PDRs + comms events that informed each; identify
   which PDRs missed candidate patterns visible in retrospect
4. **Failure-mode taxonomy session** — read all `failure-mode`-tagged events; cluster by class;
   identify cure-shape patterns
5. **Owner-direction interpretation session** — read all owner-direction verbatim quotes in
   comms; analyze how each was interpreted vs how it could have been

## First-Move Discipline (when owner opens this thread for dispatch)

1. Read `.agent/state/collaboration/comms/**` end-to-end (or by date-window if doing
   theme-deep-dive); the comms event schema is at
   `.agent/state/collaboration/comms-event.schema.json` (a three-way `oneOf`:
   `narrative` / `directed` / `lifecycle` — partition by shape before aggregating). An agent
   executing the companion plan defers the Candidate Themes sections per the Resume Contract
   exception and the plan's WS1.
2. Cross-reference against existing PDRs / ADRs in `.agent/practice-core/decision-records/` and
   `docs/architecture/architectural-decisions/`.
3. Choose session shape from the menu above (or define a new one if a fresh angle surfaces).
4. Produce research output as PDR-class or ADR-class artefact (NOT a napkin note — research
   warrants permanent substrate).
5. Update this thread record with what was processed + what remains.

## Non-Held Rotation Strategy (to determine)

The current corpus state is **held**: the Preservation Boundary keeps every event intact for
research. That hold is bounded — once the research processing the companion plan defines has
absorbed the corpus's signal, the steady state needs a **non-held rotation strategy**: the
standing mechanism by which comms events flow from the live directory into durable homes and
out of existence, so the live directory stays small enough for the watcher while no
unprocessed signal is ever lost. This section frames the determination; the companion plan's
rotation workstream produces the ratification-ready proposal; **the owner ratifies the
strategy before any deletion executes**.

Invariants any candidate strategy must satisfy:

1. **No unprocessed signal is deleted.** Absorption (consolidation into napkin / distilled /
   patterns / PDR / ADR homes, or recorded item-level disposition) precedes removal — the
   owner's 2026-05-27 clarification, mechanised.
2. **Untracked events are committed or absorbed before deletion** (git-heterogeneity fact
   above; deletion of an untracked event is unrecoverable).
3. **Provenance survives rotation.** Identity tuples, `in_response_to` chains, and event ids
   cited in permanent docs must remain resolvable (or the citations updated) after rotation.
4. **The live directory has a bounded working set** sized to watcher drain health, not to a
   round number.
5. **Heartbeat events are a distinct class.** Highest volume, lowest per-event research value
   once aggregate cadence statistics are extracted; candidate for the shortest retention.

Candidate shapes to evaluate (not mutually exclusive; evidence from the research pass decides):

- **Absorb-then-delete on consolidation cadence** — comms-log-care (PDR-080 signal-driven
  absorption) extended with a deletion step after recorded disposition.
- **Date-window archival** — rotate events older than N days into a committed archive
  directory outside the watcher's drain path; delete only after research processing.
- **Class-tiered retention** — heartbeats aggregated-then-deleted on a short window;
  `failure-mode` / `behaviour-note` events retained until graduated; coordination narrative
  retained until thread closure.
- **Storage-shape change** — if `comms-watch-storage-redesign` lands a watermark/segment-store
  shape, rotation may become a storage concern rather than a directory-hygiene concern.

Open questions the determination must answer: who runs rotation (curator lane vs Director vs
hook); on what trigger (size, age, session close, consolidation); where archives live; how
PDR-080's bin-counter interacts; and what the ratified artefact is (PDR for the portable
contract + ADR for the repo phenotype is the default shape).

## Related Plans and Decision Records

The comms/coordination plan cluster is indexed at
[`agent-tooling/future/README.md` §Comms / coordination cluster](../../plans/agent-tooling/future/README.md#comms--coordination-cluster);
disposition of overlapping plans routes through the rightsizing keystone's M4, not per-plan.
Relevance to this research thread:

- [`comms-corpus-research-and-rotation-strategy.plan.md`](../../plans/agent-tooling/current/comms-corpus-research-and-rotation-strategy.plan.md)
  — **the companion executable plan** (created 2026-06-12 under owner direction); dispatch
  vehicle for this record's research vector.
- [`collaboration-substrate-coordination-rightsizing.plan.md`](../../plans/agent-tooling/future/collaboration-substrate-coordination-rightsizing.plan.md)
  — cluster keystone; this research's mechanism findings feed its M4 cull/fold list, and its
  minimal-substrate re-derivation consumes the failure-mode taxonomy.
- [`cost-of-collaboration.plan.md`](../../plans/agent-tooling/current/cost-of-collaboration.plan.md)
  — owns cost-per-coordination-event; corpus-derived overhead/substance ratios are direct
  evidence for its P-ordered workstreams.
- [`comms-watch-storage-redesign.plan.md`](../../plans/agent-tooling/current/comms-watch-storage-redesign.plan.md)
  — watcher storage shape; theme 13 (corpus growth degrades drain) is its motivating evidence
  and the rotation strategy must compose with whatever it lands.
- [`pdr-080-comms-log-care-phenotype.plan.md`](../../plans/agent-tooling/current/pdr-080-comms-log-care-phenotype.plan.md)
  — signal-driven absorption phenotype; the rotation strategy's absorption precondition builds
  on it.
- [`n-agent-collaboration-experiments.plan.md`](../../plans/agent-tooling/current/n-agent-collaboration-experiments.plan.md)
  — hypothesis-validation during real work; corpus analysis can confirm/refute the same
  primitives retrospectively at scale.
- [`comms-event-write-integrity.plan.md`](../../plans/agent-tooling/current/comms-event-write-integrity.plan.md)
  — write-path integrity; rotation must not introduce new partial-write windows.
- [`comms-watch-liveness-floor.plan.md`](../../plans/agent-tooling/future/comms-watch-liveness-floor.plan.md)
  and
  [`claim-liveness-crash-reconciliation-and-session-forensics.plan.md`](../../plans/agent-tooling/future/claim-liveness-crash-reconciliation-and-session-forensics.plan.md)
  — liveness/forensics consumers of themes 14 and 17.
- Decision records: PDR-066 (comms events as failure-mode channel), PDR-078 (liveness
  contract), PDR-063 / ADR-182 (mid-cycle handoff), PDR-064 (coordinator two moments),
  PDR-080 (signal-driven absorption), ADR-183 (tag namespace), ADR-186 (heartbeat substrate).

## Opportunities Surfaced (2026-06-12 deep-dive)

- **Automated pre-pass before agent reading.** Event metadata supports cheap scripted
  clustering (counts by kind/tag/author/day; burst and silence windows; `in_response_to`
  chain extraction) so expensive qualitative reading is targeted, not exhaustive. No new
  machinery needed — `jq`/`node` one-liners recorded in the companion plan suffice.
- **Tag-adoption analytics.** Measure how often `failure-mode` / `behaviour-note` tags are
  used vs prose-only captures — direct falsifiability evidence for PDR-066's channel design.
- **Cross-substrate provenance joins.** Comms events ↔ napkin archive windows ↔
  closed-claims archive ↔ git commits (SHA-prefix discipline) form a joinable provenance
  graph; several themes (2, 13, 15) are only visible across the join.
- **Arc-level analysis.** The corpus now contains complete team arcs with known outcomes;
  analysing arcs (not just events) lets cure-shapes be scored against what actually happened
  next — e.g. the 2026-06-11/12 handover arc validates PDR-063 end to end.
- **Research-feeds-mechanism loop.** Each taxonomy output has a named consumer plan (cluster
  table above), so findings land as routed recommendations rather than orphaned reports.

## What this thread is NOT

- Not a plan (no implementation roadmap — that is the companion plan's job)
- Not a decision (no architectural commitment)
- Not autonomously dispatchable (dispatch routes through the companion plan once
  owner-ratified)
- Not source of doctrine until research outputs ratify (the corpus is signal, not yet
  pattern-extracted at scale)

## Participating Agent Identities

| Agent Name | Platform | Model | session_id_prefix | first_session | last_session | role |
|---|---|---|---|---|---|---|
| Charcoal Brazing Kiln | claude | claude-opus-4-7 | 7c7327 | 2026-05-24 | 2026-05-24 | thread-record-author-post-m1-merge |
| Solar Illuminating Dawn | codex | GPT-5 | 019e6a | 2026-05-27 | 2026-05-27 | state-file-lifecycle-boundary-clarification |
| Twilit Orbiting Satellite | claude | claude-opus-4-8 | 263042 | 2026-05-29 | 2026-05-29 | routing-legacy-fallback-sunset execution (Leafy claim `14b484d6` pickup) |
| Firefly seeks Temper | claude | Fable 5 | ce44ae | 2026-06-12 | 2026-06-12 | record deep-dive + second theme seeding + rotation-strategy framing + companion-plan creation (owner-directed, Director seat) |
| Fern lifts Mulch | claude-code | Fable 5 | 66f12b | 2026-06-12 | 2026-06-12 | planning session (owner-reshaped from research dispatch; claim 63d80264): WS6 synthesis-report + owner-gated WS7 end-state amendments, experiments/ preservation commit, continuation surfaces made execution-ready; blind-pass discipline honoured — Candidate Themes sections unread |

## 2026-05-29 — execution work touched this thread via a claim (not research)

The owner-gated research vector above remains untouched and undispatched. This
thread was *touched* only because Leafy Regrowing Petal filed the
routing-legacy-fallback-sunset claim (`14b484d6`) against it, and Twilit
Orbiting Satellite picked that claim up and completed the sunset on 2026-05-29
(commits `d9225d5b` + `d1525f55`; claim closed in the archive). That work is
**collaboration-substrate implementation**, not comms-corpus research — its
home is the agent-tooling plan cluster
([`future/README.md` §Comms / coordination cluster](../../plans/agent-tooling/future/README.md#comms--coordination-cluster)),
keystoned by the
[`collaboration-substrate-coordination-rightsizing`](../../plans/agent-tooling/future/collaboration-substrate-coordination-rightsizing.plan.md)
brief. Recorded here only for identity-row honesty; the research buffer's
dispatch contract is unchanged.

## Cross-References

- Comms archive: `.agent/state/collaboration/comms/` (5+ days of accumulated multi-agent events)
- ADR archive: `docs/architecture/architectural-decisions/` (substrate-phenotype decisions)
- PDR archive: `.agent/practice-core/decision-records/` (practice-doctrine decisions)
- Napkin captures: `.agent/memory/active/napkin.md` + archived windows under `archive/`
- Existing pattern files: `.agent/memory/active/patterns/`
- Pending-graduations register: `.agent/memory/operational/pending-graduations.md` (research-
  vector entry buffer)
- Heartbeat contract: `.agent/skills/start-right-team/SKILL-CANONICAL.md` §0.5
- Comms-event tag namespace (ADR-183): includes `failure-mode`, `behaviour-note`, `heartbeat`
  for filterable corpus access

## Resume Contract

Owner directs resume. No autonomous dispatch. When dispatched, the receiving agent reads this
record end-to-end before any analysis pass — **with one deliberate exception**: an agent
executing the companion plan's open-discovery cold read (WS1) defers BOTH Candidate Themes
sections until its surprises log is recorded, so the seeded catalogue cannot anchor the cold
read. The catalogue is a floor for what counts as a pattern, never a fence around what may be
found; surprises outrank seeded-theme confirmation.

## Dispatch refinement (owner, 2026-06-12 evening)

The session runs as one half of a two-member team (the other lane: enhanced
statusline work). Scope re-affirmed as research and reporting only — zero or
minimal implementation. The goal is understanding and discovery, and
explicitly: **to make it safe to remove, and stop git-tracking, the
`.agent/state/` files.** The individual-scoped precedent landed 2026-06-12:
`.agent/state/onboarding/` is already gitignored (uniform classification —
individual-scoped state is untracked by design); this research owns the
repo-scoped remainder.
