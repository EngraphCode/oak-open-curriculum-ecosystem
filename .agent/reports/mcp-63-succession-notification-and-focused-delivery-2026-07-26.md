---
status: permanent-dated-record
date: 2026-07-26
capture_boundary_utc: 2026-07-26T14:44:40Z
subject: mcp-product-analytics
identity: Cutter hunts Lagoon / codex / GPT-5 / 019f9e
---

# MCP-63 succession, notification, and focused delivery — 26 July 2026

This permanent dated report records the arc through 14:44:40Z while the session
was still live. It is not a handoff, retirement, closeout, or completion claim.
It preserves causal understanding and historically bounded evidence that
should remain true after live coordination state and execution plans have
served their temporary purposes.

Tracking is not used here as a proxy for importance, authority, permanence, or
safety. The untracked coordination substrate was critically important
truth-of-now. The tracked operational thread was temporary truth-of-now. This
report is a long-term destination because of its semantic role as permanent
documentation, not because Git happens to track it.

## Review contract

- **Purpose and intended impact:** preserve a self-contained explanation of
  how MCP-63 custody transferred, why message awareness failed, how the failure
  was corrected, why the delivery shape changed, and what the dated technical
  evidence did and did not prove.
- **Questions to test:** does the chronology follow the observed evidence; are
  custody, attention, tracking, permanence, work preservation, and settled
  delivery kept distinct; are PR1, PR2, and PR3 boundaries described
  accurately; and are all uncertainties and evidence ceilings explicit?
- **Evidence and authority boundary:** the report draws on the full
  coordination messages, live claim registry, Git state, test and gate output,
  specialist reviews, and the user's corrections observed through the capture
  boundary. It does not replace current owner direction, live coordination
  state, ADR-218, or the permanent Practice doctrine it cites.
- **Non-goals:** this report does not authorise a push, PR, merge, app edit,
  platform declaration, claim change, handoff, or closeout. It is not an
  execution plan or a source of current operational truth.
- **Successful review:** a reader can recover the causal model and dated
  evidence without the session context, while identifying any unsupported
  claim as an evidence gap rather than filling it by inference.

The central finding is that this arc crossed three different continuity
problems:

1. **Custody continuity** — who is authorised and accountable for MCP-63?
2. **Attention continuity** — do new team events actually reach the active
   reasoning loop?
3. **Delivery continuity** — can one inherited multi-story worktree become
   reviewable, independently settled changes without losing intent?

The custody transfer was explicit and successful. The attention path failed
twice in different ways and required an independent foreground polling path.
The delivery shape changed from one contemplated combined commit to three
ordered, focused PRs. At the capture boundary, the first slice was a local
commit, not a remote or settled PR.

## What happened

All times below are UTC on 26 July 2026.

### Succession and custody

- At 12:51:30, Kite seeks Crosswind told the Director that Cutter was the
  owner-named eventual successor but retained custody. Naming a successor did
  not itself transfer work.
- At 13:00:53, Cutter entered warm standby with no claim or heartbeat, again
  separating succession intent from then-current authority.
- Between 13:01 and 13:06, Kite froze new app work and authored the in-flight
  handoff. The adoptable bundle contained seven live claims, 14 modified
  tracked files, 30 untracked files, no commit or PR, and a branch one commit
  behind main. Focused gates were green, but the final-wire proof remained
  structurally blocked because its test recreated composition instead of
  driving the production runtime and sink.
- At 13:15, Director Squall wakes Apex turned gradual succession into an
  immediate direction: validate the discontinuity, acknowledge it, adopt all
  seven claims, arm a heartbeat, and report the first technical action.
- At 13:26, Cutter completed the discontinuity check. The inherited branch,
  dirty files, claim pointers, and non-overlap with the separately owned
  served-surface work all matched the handoff. Cutter adopted all seven claims
  in place and armed the lane heartbeat.
- At 13:27, Kite independently verified the seven claim rows, their handoff
  pointers, and Cutter's heartbeat. Kite then notified the Director and
  retired at 13:28:57 with no retained claim.

The durable meaning is stronger than “a handoff message was sent.” Custody
changed only after the successor verified the discontinuity, adopted the
claims, emitted liveness, and the outgoing owner independently verified the
new registry state.

### The monitoring failure and its cures

The original monitoring claim was false in an important way. The canonical
watcher was running and emitted events into a detached terminal session, but
those events did not wake Cutter's reasoning loop. The user noticed that
messages were being missed. At 13:29, Cutter reported the fault to the Director
and stopped treating background delivery as awareness.

The evidence required three liveness paths to remain distinct:

- The canonical all-channel watcher provides stream consumption and cursor
  evidence. Its process or cursor can be live without proving that this
  reasoning loop was notified.
- At the capture boundary, a foreground, full-stream ten-minute polling worker
  was the cognition path. It reported each completed cycle into the active root
  turn, where relevance was assessed.
- The four-minute claim heartbeat loop provides outbound presence and claim
  freshness. It says nothing about incoming awareness.

The foreground cure materially changed the work:

- Its 13:52 cycle caught the owner's rule that review findings must be assessed
  on both correctness and relevance.
- The same cycle caught that MCP-187/#571 had merged and its overlapping claim
  had closed.
- Its next material cycle delivered the owner's focused-PR direction. Cutter
  cancelled the contemplated combined commit and adopted the ordered PR shape.

The monitoring system then exposed two further assumptions:

1. The canonical watcher remained attached but its heartbeat aged out after
   the 14:28:21 drain. A “running” terminal session was not fresh process or
   cursor evidence.
2. The foreground worker had an internal 60-minute assignment cap and stood
   down after its 14:33 cycle, even though the user's request was open-ended.
   A correct cadence with the wrong lifetime is still a monitoring failure.

The stale canonical arm was stopped and restarted on the same cursor with the
canonical 120-second fail-loud step budget. A full-stream gap sweep from before
the restart found no missed Cutter-directed or actionable event, and the new
arm passed `comms assert-watcher-live` under Cutter's exact identity. The
foreground worker was re-armed from its evidence cursor under an explicit
no-self-expiry contract tied to the user's stop or change signal.

This is a
[PDR-133](../practice-core/decision-records/PDR-133-liveness-classes-and-platform-declaration.md)
`NOTIFY` lesson, not merely a watcher-process incident. Process, cursor,
delivery, notification, and cognition are separate capabilities. The
[canonical watcher rule](../rules/comms-all-channels-watcher.md) already owns
the operational distinction. At the capture boundary, whether Codex 0.145.0
required a permanent platform declaration remained unresolved. Classification
depended on a deliberate external challenge: a directed event would need to
wake the reasoning loop without a user prompt or polling action.

### The final-wire cure

The first inherited technical action was to make the final-wire proof exercise
the shipped production composition.

At the capture boundary, the reviewed final-wire portion of the local adapter
had:

- one private production composition shared by the public one-argument factory
  and a test-only, non-barrel fetch seam;
- the real PostHog client, sink, MCP instrumenter, policy, batching,
  compression, retry, and shutdown paths;
- an authenticated MCP initialise event and the expected
  `$lib: posthog-node-mcp` identity;
- a retry proof of four identical request bodies with one stable UUID; and
- robust setup and teardown.

Fresh test-expert and code-expert reviews passed this final-wire boundary.
The adapter package then passed 130/130 tests, type-check, lint, build, and the
targeted formatting check. At the capture boundary, reviewers had accepted
this as local evidence for the adapter slice; the slice had not been committed
or landed.

### The focused-PR correction

At 13:54:48, the Director relayed the owner's direction that PRs stay small
and focused because larger review surfaces make convergence harder. The
inherited 44-path worktree contained at least three independent stories.
Cutter assessed the direction as both correct and relevant, cancelled the
combined commit, and adopted this order:

1. provider-neutral product-analytics port plus shared selection/locality
   axis;
2. PostHog adapter, boundary registration, workspace dependency, and lockfile;
3. application configuration and production composition.

The adopted sequence required each dependent PR to settle before the next
opened.

The main-drift audit found no exact path overlap between the nine intervening
main commits and the inherited dirty set. MCP-187 had changed the canonical
served-surface and resource-registration path, so the dated integration
reasoning used that architecture rather than selectively copying older files.

### Focused slice 1

At 14:18:25, the first focused slice became local commit
`ae25b10c95a44481de966876a64d7a0d3b66392d` (historical reference):

> `feat(observability): add product analytics port`

Its exact story is:

- a provider-neutral product-analytics event, capture context, close error,
  runtime, and inert runtime;
- a shared observability-selection axis that can select PostHog while
  preserving the diagnostic-only production-locality rule;
- env behaviour coverage;
- the observability package's dependency on the shared `Result` package; and
- deletion of an audit-shaped registry test whose contract is carried by env
  behaviour, TypeScript, and the boundary lint.

It deliberately excludes all PostHog adapter files, oak-eslint adapter
registration, adapter workspace registration, adapter lock entries, and
application source.

Fresh evidence before commit:

- observability tests: 59/59;
- env tests: 51/51;
- both packages' type-check and build: pass;
- lint: exit zero with known unrelated warnings, not warning-free;
- adapter regression: 130/130 plus type-check and lint;
- targeted formatting: pass;
- architecture specialist: pass;
- test specialist: pass; and
- commit hooks: pass.

The TDD evidence ceiling is explicit: the product and tests were green and
landed atomically in the local commit, but no historical RED run was captured.
This record therefore does not claim a witnessed Red-to-Green cycle.

After the commit, the adapter workspace entry was restored and pnpm regenerated
the adapter lock entries. At the capture boundary, the worktree was one commit
ahead and nine behind the locally recorded `origin/main`, with an empty index.
PR1 had not been pushed and had no PR, so it was neither remotely recoverable
under the terminal work-preservation contract nor settled.

## Technical state at the capture boundary

### PR1 — local, focused, not yet published

- Commit: `ae25b10c95a44481de966876a64d7a0d3b66392d`
  (historical reference).
- State at this report's capture boundary: local only; ahead 1, behind 9;
  no PR.
- The next action preserved at the capture boundary was to reconcile main
  without widening the story, then publish and shepherd PR1 before opening
  PR2. Live coordination state, not this report, governs whether that action
  remains current.

### PR2 — local adapter residue at the capture boundary

At the capture boundary, the dirty implementation was confined to:

- `packages/libs/posthog-node/**`;
- three `packages/core/oak-eslint` boundary and boundary-test files;
- `pnpm-workspace.yaml`; and
- pnpm-generated adapter entries in `pnpm-lock.yaml`.

No adapter commit or PR existed. The unresolved work and missing evidence were:

- a fresh whole-file test-expert cure for
  `mcp-server-instrumenter.integration.test.ts`, whose recording fake, branchy
  transport, incidental pseudonym factory, and microtask/assertion loops were
  open review findings;
- removal of the dead `isNonEmptyString` helper in
  `event-policy-helpers.ts`;
- fresh security, MCP-protocol, and configuration specialist reviews;
- adapter and boundary gates after the final edits; and
- pnpm regeneration of the lockfile rather than manual editing or merging.

The final-wire cure belonged to this slice and remained uncommitted.

### PR3 — unstarted at the capture boundary

No application source had been edited. Existing claims reserved a narrow
config and manifest/docs boundary; a claim was not implementation.

Read-only exploration found a broader architectural obstruction:

- the handler-facing `RuntimeConfig` received the full parsed env,
  so naïvely adding PostHog variables could expose the project key, keyring,
  active key ID, host, and capture mode beyond the composition boundary; and
- the legacy sentry-node configuration shape could not express simultaneous
  Sentry plus fixture-tee behaviour on the one shared selection axis at the
  capture boundary.

Production wiring remained blocked on expansion of the app claim to the actual
composition and lifecycle files plus an explicit architecture disposition for
one-axis/Sentry coexistence. The accepted constraint was not to introduce a
second axis or silently discard fixture behaviour.

## Concept exploration synthesis

### Problem frame

This is not chiefly a “watcher bug” or a “large PR” problem. It is a complex
coordination system in which state, attention, and reviewability travel on
different paths. The gap harms the owner and team when an apparently live seat
misses a direction, continues an invalid work shape, or reports a local proof
as delivered work.

The causal model is:

- registry and heartbeat state can prove custody without proving attention;
- stream consumption can prove cursor movement without proving reasoning-loop
  notification;
- a coherent dirty worktree can preserve implementation intent while still
  containing several independently reviewable stories; and
- green focused tests can prove a slice while leaving the production path or
  remote landing unproved.

Success therefore means:

- every material team event reaches Cutter's reasoning within the requested
  ten-minute bound;
- only relevant changes generate team traffic;
- ownership, local implementation evidence, external recoverability, and
  settled delivery are reported as separate states; and
- each PR has one reviewable story and reaches settled before a dependent story
  opens.

### Assumptions that changed

- **“Watcher live” meant “messages seen.”** It does not. The user correction
  and repeated stale heartbeat made notification a separate proof obligation.
- **“A monitoring task can have a reasonable default duration.”** It cannot
  when the user supplied an open-ended terminal condition.
- **“One inherited worktree implies one implementation PR.”** It does not.
  The worktree was a preservation unit, not a review unit.
- **“A green final-wire test proves production composition.”** It did not until
  the test and public factory shared the real private production constructor.
- **“Claims describe implemented scope.”** Claims described custody and
  collision protection; no application source had been edited at the capture
  boundary.
- **“Tracked means important, permanent, or safe.”** It does not. Tracking
  answers checkout portability. Critically important live comms, claims, and
  handoffs are untracked by policy; tracked plans and continuity are temporary.
- **“A local commit is delivered work.”** It is an in-flight code state. Push,
  PR publication, review convergence, and merge remain separate observations.

### Propositions preserved at the capture boundary

These propositions preserve the reasoning at the capture boundary. Live owner
direction and coordination state, not this report, govern subsequent
execution.

1. **The team retained an independent ten-minute foreground monitor under the
   user's open-ended stop condition.**
   - Warrant: it delivered two owner directions that changed the work, while
     detached watcher output did not wake reasoning.
   - Falsifier: a full cycle passes without a timestamped result, its evidence
     cursor stops moving against new stream events, or the root turn completes.
2. **The team treated the canonical watcher as PROCESS/CURSOR evidence only
   and re-armed it fail-loud on staleness.**
   - Warrant: it aged out while its terminal session still appeared attached.
   - Falsifier: a deliberate directed challenge wakes Cutter without polling
     or owner intervention and repeats reliably.
3. **The team adopted the owner-directed PR1 → PR2 → PR3 order.**
   - Warrant: the stories have real dependency boundaries and smaller review
     surfaces are more likely to converge.
   - Falsifier: a demonstrated atomic dependency makes a slice independently
     uncompilable or semantically false; no such dependency was known for PR1
     at the capture boundary.
4. **PR2 remained local pending its whole-file test cure and specialist
   reviews.**
   - Warrant: final-wire fidelity had been accepted, but separate test-quality,
     dead-code, security, protocol, and configuration evidence was open.
   - Falsifier: fresh full-file and specialist reviews show those findings are
     incorrect or irrelevant to the adapter story.
5. **PR3 remained blocked pending config-secrecy and one-axis-coexistence
   evidence.**
   - Warrant: the audited handler config shape would widen secret visibility,
     and the Sentry config could not represent the required combined behaviour.
   - Falsifier: a concrete composition proves both secret containment and
     Sentry/fixture coexistence without a second selection axis.

## Permanence, live state, and evidence limits

### The axes are independent

| Axis | Question | Reading in this arc |
| --- | --- | --- |
| Importance | Is the information load-bearing? | Live comms, claims, and handoffs were critically important. |
| Authority | What governs the next move? | Owner direction and live coordination state governed execution. |
| Lifecycle | Is this truth-of-now or truth-across-time? | Comms, claims, handoffs, plans, and continuity were temporary working surfaces. |
| Tracking | Does Git carry it between checkouts? | Tracking expressed portability only; it conferred no importance, authority, permanence, or safety. |
| Permanence | Is this a legitimate long-term knowledge destination? | Permanent documentation is the destination. |
| Work preservation | Can in-flight code be recovered and reviewed elsewhere? | Local commit, push, PR, review, and merge were separate evidence states. |

The untracked coordination substrate was not lesser because it was untracked.
It was the critical live authority for custody, collision protection,
direction, and liveness. Its lifecycle is deliberately ephemeral because it
carries truth-of-now, not because its information is unimportant.

Likewise, the tracked plans and operational continuity files were not permanent
destinations merely because Git carried them. They were temporary execution and
resumption surfaces.

### Permanent destinations

This report is a permanent, self-contained historical record of the arc through
the capture boundary, its causal analysis, and its dated implementation
evidence. It does not depend on comms IDs, handoff paths, claims, plans, or
operational-memory pointers for its meaning.

The stable product-analytics architecture belongs in
[ADR-218](../../docs/architecture/architectural-decisions/218-posthog-mcp-analytics-identity-session-and-privacy.md).
The general liveness-class lesson already belongs in PDR-133 and the canonical
watcher rule linked above. When the implementation settles, stable package and
application usage belongs in their READMEs, operational documentation, and
TSDoc. This report does not substitute for those product-facing permanent
documents.

Comms, claims, handoffs, plans, thread records, and repo continuity remain
essential sources and routing surfaces according to their own lifecycles. They
are not long-term destinations. An operational thread may point into this
report for discovery; this report deliberately does not point back to an
ephemeral item as authority.

The local PR1 commit is in-flight code, not permanent documentation. Its
publication and review state are delivery facts, not measures of the
importance or safety of the knowledge recorded here.

### What this report deliberately does not replicate

This report does not copy no-change poll ticks, volatile process identifiers,
temporary compose buffers, full reviewer transcripts after their findings are
absorbed, or an exhaustive event-ID ledger. That is not a judgement that their
source surfaces are unimportant. Live coordination state remains critical and
authoritative while live, and its preservation, extraction, and archive
lifecycle remains governed by the collaboration-state policy.

### Evidence limits and corrections

The user caught the original notification failure. A self-scan cannot certify
its own `NOTIFY` completeness, so this report preserves that external error
signature instead of claiming the monitor is infallible.

Evidence review found dependence on temporary coordination sources, stale
operational continuity, the canonical watcher's stale recurrence, and the
foreground worker's hidden duration cap.

The user's correction then exposed a deeper preservation failure in the report
itself: the draft had called tracked operational surfaces “durable homes” and
had described untracked coordination as insufficiently durable. Both
statements collapsed tracking, importance, lifecycle, permanence, authority,
and safety into one false hierarchy. The axis separation above is the
correction. This report does not claim that its own review proved completeness.
