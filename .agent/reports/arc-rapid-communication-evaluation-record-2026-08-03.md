# ARC rapid communication — evaluation record (closed at graduation, 2026-08-03)

## Provenance

ARC (ArcAngel / ARC AnGels / "the rapid channel" / "gellings") ran as an
evaluated mechanism from its founding channel (2026-05-27) until the owner
graduated it to standing infrastructure on 2026-08-03 ("it's not an experiment
any more, we use it all the time" — recorded at ws-b0 of the ARC-colour
statusline delivery plan, `.agent/plans/delivery/arc-colour-statusline.plan.md`,
authored 2026-08-03; its preserved readiness-reviewed predecessor is
[`arc-colour-statusline-infrastructure.plan.md`](../plans-backlog-2026-07/agent-tooling/active/arc-colour-statusline-infrastructure.plan.md)).
This record conserves the evaluation evidence, the observed-arc
histories, and the named mechanism-triggers as they stood in the
canonical reference doc at graduation — with one correction found at
the graduation PR's review: the cross-platform trigger's fired state
(see §Named triggers). The standing protocol, conventions,
operating constraints, and maintenance clauses now live in
[`arc-rapid-communication.md`](../reference/arc-rapid-communication.md); this
record is the closed evidence base that earned them.

Knowledge is preserved, never deleted: the sections below are the
verbatim-substance conservation of the reference doc's evaluation content
(as of `origin/main` @ `9d6e366a0`, 2026-08-03).

## Evaluation evidence (as of 2026-06-12)

Six arcs observed: a driver/reviewer commit-cycle collaboration
(2026-05-27, turns 20–43 of the founding channel), a research handover
with corrections (2026-05-28, turns 44–49), a work-split negotiation plus
recon handover (2026-06-11), the owner-directed handover coordination
that followed, the first n≥3 group channel (2026-06-11, a
three-seat reliability successor team running rendezvous, boundary
split, two PR deliveries, and a deliberate contraction entirely
on-channel — see §The first n≥3 instance below), and a dual-session-close
coordination (2026-06-12, Firefly seeks Temper × Forge turns Basalt:
two closing sessions negotiated PR routing, a bundle-carry agreement,
an owner-directed exception, and mutual sign-off in three entries —
observations below).

### From the sixth arc (2026-06-12, dual session-close)

- **Second announce-race instance, new vector**: the announce discipline
  was FOLLOWED (canonical event 22 minutes prior) and the race happened
  anyway — a peer entering on direct owner direction opened a second
  channel without checking the stream for an existing announce. The
  announce is necessary but not sufficient; the check must bind at OPEN
  time: before opening a channel, search the canonical stream for a live
  channel announce naming your intended counterpart. Cure shape, worked
  twice now: dialogue-concession in one entry (substance-holder's file
  wins regardless of broadcast order), forwarding-pointer entry on the
  conceded file, tail switch — ~2 minutes, no owner mediation.
- **Deadline+default at n=2 delivered its designed value**: the opening
  entry declared a 30-minute deadline with a complete-my-closeout
  default; the reply landed inside the window; a dark seat would have
  cost nothing. First observed n=2 firing of the dark-seat backstop
  shape (previously only retained at n≥3).
- **Directed-event announce variant**: the second channel's announce was
  a DIRECTED comms event to the counterpart rather than a broadcast —
  it reached the peer via the all-channels watcher. Valid variant for a
  known-pair channel; broadcast remains the shape when the roster may
  accrete.
- **Owner-authority relay with citation, bidirectional**: two owner
  directions (a consolidation-session sequencing fact and a
  separate-PR routing exception) were relayed on-channel with turn
  citations and acted on safely by the peer — the citation discipline
  carried both directions in one arc.
- **Five-point reply convention emerged**: the reply mirrored the
  opening entry's numbered points one-for-one, which let both sides
  verify absorption line-by-line at sign-off. Cheap, worth repeating.

### Measured benefits

- Proposal → full acceptance round-trip in under 4 minutes with the peer
  mid-gates; the same negotiation shape over canonical comms events was
  measured at 10–15 minutes the same day (Sylvan Branching Pollen's
  measurement).
- No size ceiling: a multi-section recon handover travelled whole; the
  comms CLI's 1500-character body limit cannot carry that.
- Whole-history-in-one-read suits design dialogue and review cycles; the
  founding arc ran complete commit-review rounds on-channel.
- Zero per-message ceremony — no schema, no identity preflight per entry.
  This property is plausibly load-bearing for the latency benefit;
  protect it when extending the mechanism.
- Owner-authority relay works when cited: an owner direction relayed
  on-channel reached the peer in ~15 seconds with zero coordinator
  round-trip, and was safe to act on because the entry cited the owner
  turn it relayed. The citation discipline (`gates must be citable`) is
  what makes authority-bearing content legitimate on a peer channel.
- The latency benefit holds at n=3: a three-seat boundary-split
  negotiation went proposal → 3/3 confirmed in ~4 minutes; seat handover
  → both inherited PRs merged in ~15 minutes, with zero owner mediation
  and zero Director round-trips spent on team-internal coordination.
- Owner-direction triangulation is an n≥3-only benefit: the same owner
  direction landed independently in three seats' chats and each relayed
  it on-channel with a citation — three independent citations made the
  direction self-confirming, where the n=2 protocol leaned on the
  citation discipline alone.
- Handoff quality converts directly into successor velocity (a
  post-handover execution measurement, distinct from the negotiation
  latency above): a per-item state table with an evidence column let
  one seat go from claim → both-loops-verified → merge ask in ~4
  minutes, and run a full reviewed follow-on cycle (pre-review,
  implement, gates, post-review, commit, push, PR, merge) in ~45
  minutes.

### Known-limitation worked instances (histories behind the standing constraints)

- **Split append observed** (2026-06-11, n=3): a heredoc `cat >>` entry
  landed across two `write()` calls mid-signature, delivering a stray
  fragment line to followers' tails (benign — detected by header
  enumeration; no concurrent writer hit the window), but one concurrent
  writer away from a real interleave. This is the near-miss that keeps
  the atomic-append trigger armed (see §Named triggers below).
- **Non-append writes reset every follower** (observed live 2026-06-11
  ~08:16Z, both participants' tails flooded; content intact): `tail -F`
  treats an inode swap or truncate-and-rewrite as rotation and replays
  the entire file into every follower's context. Three vectors observed:
  a conservation-pass rewrite; a placeholder-then-substitute fix-up (an
  in-place edit even when the change is one token); and external
  lint/format passes (`--fix` gates run from the repo root reached
  channel files and rewrote them in place — an MD004 marker flip was
  observed in a seat buffer). **Cure landed 2026-06-13**: the dated
  `rapid-comms/*.md` channel files (tracked, no longer gitignored) were
  excluded from the mutating format/lint passes — markdownlint via the
  `2026-*.md` scope and prettier via the `.agent/` ignore — so a `--fix`
  gate no longer rewrites a live dated channel mid-tail.
- **Durability state at the time**: cross-machine durability was nil for
  the then-gitignored channel files and waypoint-grained at best for the
  tracked founding channel; conserve-at-close was named as the cure — a
  discipline, not a mechanism. (Channel files have been tracked in
  `.agent/collaboration/rapid-comms/` since 2026-06-13; the
  waypoint-grained tracking constraint and the conserve-at-close
  discipline are now standing doctrine in the reference doc.)
- **Path-and-append discipline failed twice in ten minutes across two
  well-grounded agents** (2026-06-11): one appender derived the channel
  path from the announce TITLE instead of copying it verbatim from the
  body and appended one directory up (the stray-path vector). This
  instance-pair is why the reference doc prefers a mechanical helper
  over more vigilance when the atomic-append trigger fires.

## Named triggers — state at graduation (2026-08-03)

The reference doc carried named triggers for mechanism-level work with the
instruction "do not build ahead of these; the zero-ceremony property is the
thing to protect". Their state at graduation, with one review-found
correction:

- **First n≥3 group channel ("gellings")** — FIRED 2026-06-11; the
  observations were folded into the reference doc's n≥3 section (the
  observational record is §The first n≥3 instance below).
- **First observed interleaved/corrupted append under real contention** —
  NOT fired at graduation; one near-miss recorded (the split append
  above). The consolidated cure candidate: a tiny atomic-append helper
  (compose-then-single-`O_APPEND`-write) closing the split-append,
  placeholder-rewrite, and stray-path classes at once. **Graduation
  decision (recorded in the ARC-colour plan, ws-b0)**: standing
  infrastructure does not suspend YAGNI — building the helper still
  gates on first observed corruption or owner word. The trigger is
  re-expressed as a standing maintenance clause in the reference doc.
- **First cross-platform pairing (Codex or Cursor seat)** — recorded as
  NOT fired in the reference doc at graduation, but repository evidence
  shows it HAD fired: a Codex seat (Zephyr turns Crosswind, Codex /
  GPT-5) joined and tailed a live channel on 2026-07-16
  (`.agent/collaboration/rapid-comms/2026-07-16-codex-hook-experiment-lupin-herds-bark-and-zephyr-turns-crosswind.md`
  — the 12:35:28Z join entry names the live primary-checkout ARC tail).
  The stale not-fired claim was caught at this record's PR review
  (PR 730, round 1). The tail/append ergonomics review the trigger
  promised was never recorded and remains outstanding — carried forward
  as the reference doc's cross-platform maintenance clause.

## The first n≥3 instance (observed 2026-06-11)

First observed instance: a three-seat team ("gellings") ran a full seat
lifecycle on one channel — rendezvous, boundary split, parallel PR
delivery, and a deliberate contraction. The open questions from the
first edition of the reference doc received observed answers in this arc;
the doc's standing n≥3 conventions (roster accretion, addressing,
read-cursor, quorum shapes, compose-race discipline, declared-idle,
contraction choreography, watcher-noise scaling) derive from it:

- **Roster accretion replaces roster declaration.** "The announce event
  lists every participant tuple" proved unsatisfiable when a team
  assembles asynchronously. Observed cure, worked first time: open with
  a partial roster, the canonical announce carries only the absolute
  path, and each seat appends an identity entry on arrival. The
  canonical heartbeat surface did real rendezvous work — seats
  discovered each other there before the channel existed.
- **Addressing**: a named-addressee prefix ("Name —") for seat-specific
  asks, unaddressed entries read as to-all. All three seats converged
  on this independently without negotiation — a shared doctrine corpus
  produces convention convergence cheaply.
- **Read-cursor**: every seat tailed everything and triaged in
  reasoning; no per-seat cursor mechanism was needed at this scale.
- **Quorum, two observed shapes**: (a) live-seats — explicit one-line
  confirms closed a three-way boundary split in ~4 minutes, with
  "preference-inside-confirmation" emerging as a third signal type
  between confirm and objection (the mapping-holder absorbs it with
  stated grounds and an explicit swap-offer); (b) deadline+default —
  never fired in this arc, retained as the dark-seat backstop.
  Contraction consensus proved lighter than formation consensus:
  verdict from the affected seat + custodian concurrence +
  unaffected-seat carve-out, with only an objection window as mechanism.
- **Compose-races are the norm, not the exception** (four instances in
  one session): entries cross mid-air, and "awaiting your line"
  assertions must be re-checked against the file before acting on an
  absence. File position arbitrates.
- **Gated seats declare their idleness.** The convention held end-to-end
  in its first full test: the declared-idle seat's gate fired ~85
  minutes after declaration, the coordinator's go-ahead was routed to
  that seat by name (the declaration had made the seat's readiness
  legible in the coordination handover package), and claim → delivery
  followed with no liveness query ever raised against the waiting seat.
- **Disassembly is choreographed, not attritional.** The observed
  contraction shape: the closing seat posts a team-member closeout plus
  heartbeat-end on the canonical stream and a sign-off entry
  on-channel; the synthesis custodian logs the contraction; unaffected
  lanes carry on. The same session later ran an owner-directed n=2→n=1
  contraction mid-monitor with an identical choreography (record →
  directed event → closeout → heartbeat-end, loop stopped first) —
  the shape is trigger-independent. At n=1 the channel becomes a
  journal; its residual value is the closeout-synthesis record, which
  is exactly the conserve-at-close claim.
- **Watcher noise scales with team size**: at 5–6 live agents the
  all-channels watcher woke each seat every ~30–60s, dominated by
  heartbeats; gate-watch seats paid the most. (The heartbeat-suppressed
  watcher view this arc posed as an open question has since landed as
  the sanctioned `--exclude-tag heartbeat` + peer-liveness-poll pairing
  — see `comms-all-channels-watcher` §Sanctioned tag exclusion.)

## Historical alias note

The alias line in the reference doc was added 2026-06-12 after an
owner-directed search for "ArcAngel" found zero hits — the protocol was
live but the name was not discoverable. The alias line stays in the
standing doc because it cures real search misses; the debt framing that
accompanied it closes with this record (the graduation resolves it: the
canonical home is discoverable under every known alias).
