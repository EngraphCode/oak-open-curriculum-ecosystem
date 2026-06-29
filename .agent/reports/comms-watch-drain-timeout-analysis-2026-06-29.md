# Comms-watch drain-timeout: a per-cycle full-dir read, and why this session's deaths were contention-driven (not size-driven)

*Author: Kraken spins Headland (claude / claude-opus-4-8 / 3bbe48) — 4th Director, team-tooling session 2026-06-28/29.*
*Status: analysis / friction deep-dive. Long-form companion to [F-43](../plans/agent-tooling/frictions-register.md) (Comms-watch zombie-process residuals) and [F-44](../plans/agent-tooling/frictions-register.md) (freshness≠liveness).*
*Verification: adversarially verified by a 4-dimension subagent workflow (mechanism / cure / citations / adversarial), every cited source re-checked first-hand. The first draft contained **two blocking errors** — a size→death causal attribution and an unsafe incremental-drain cure — both caught by the adversarial dimension and corrected here. The first draft is not preserved (no-tombstones); this is the corrected record.*

## Why this note exists

The all-channels comms watcher (`comms-all-channels-watcher` rule; [`start-right-team` First Moves move 1](../skills/start-right-team/SKILL-CANONICAL.md)) is the *constitutive* incoming-visibility surface of a team session. Across one long multi-agent session its `drain` step timed out and the watcher died repeatedly, going blind for minutes. This note separates two things that are easy to conflate: a **real but latent code inefficiency** (the drain re-reads the whole dir every cycle) and the **actual cause of this session's deaths** (per-file I/O contention under host load) — they are not the same, and the cure for each differs.

## The mechanism (confirmed against source, first-hand + independently)

Every drain cycle re-reads, parses, **and schema-validates every event file** in the comms dir. The watch loop ([`comms-watch-loop.ts`](../../agent-tools/src/collaboration-state/comms-watch-loop.ts)) is `drain → emit → markSeen → wait`; the injected drain is [`drainComms` (`cli-comms-watch.ts:145-160`)](../../agent-tools/src/collaboration-state/cli-comms-watch.ts), re-run each cycle (wired at `:97`):

```ts
const seenIds  = await input.io.readSeenIds(input.seenFile);
const messages = await input.io.readCommsEvents(input.commsDir);   // whole-dir read, every cycle
return drainRelevantEvents({ messages, seenIds, self, … });
```

`readCommsEvents` → `readEventDirectory` ([`state-io.ts:136-163`](../../agent-tools/src/collaboration-state/state-io.ts)) does `readdir` then, for **every** `.json` file: `readFile` + parse + `validateCollaborationJsonFileText` — no cache, no mtime/high-water filter, sequential. [`drainRelevantEvents` (`comms-relevant-events.ts:93-101`)](../../agent-tools/src/collaboration-state/comms-relevant-events.ts) then classifies the **entire** array and drops seen events **last**. So the per-cycle work is **O(total events)** — read + parse + validate of the whole corpus — to surface a handful of new events. `--seed-from-now` reseeds only the cursor; it does not change the read.

This is a genuine **latent inefficiency**: it will scale badly at large corpus sizes. But — see next — it is *not* what killed the watcher at this session's ~2600-file corpus.

## What actually caused this session's deaths — and the correction to a tempting wrong story

First-hand timeline (one session, all UTC): drain-step deadline exceeded at `--step-timeout-ms` 180000 (~22:02Z), 300000 (~22:38Z), and 600000 (~23:08Z) — **three clean deaths, all during active use before any host sleep** (see the power-state confound below), each killing the watcher and forcing a re-arm. (A fourth watcher exit around ~06:05Z is **excluded** as suspend-confounded.) The tempting story — *"the corpus grew, so the O(total) drain grew past the deadline"* — **does not survive arithmetic**, and it contradicts prior first-hand-retracted evidence:

- **The corpus barely moved while the deadline tripled.** The dir grew ~2575 → 2608 = **+33 files (+1.28%)** across the session, while the exceeded deadline went 180s → 600s (**+233%**). A linear O(total) drain cannot turn a 1.3% corpus increase into a 3.3× time increase. 600s for ~2600 small JSON files is ~230 ms/file — ~100× slower than a healthy local read+parse+validate. **The operative variable was per-file cost (I/O contention under host load), not corpus size.**
- **The size→death link was already retracted.** [`comms-watch-hang-hardening.plan.md` §"Routed evidence" (lines 145-157)](../plans/agent-tooling/current/comms-watch-hang-hardening.plan.md): *"the size→health link is **NOT** [confirmed]. The dramatic swap→0 evidence that once implied 'corpus size kills the watcher' was retracted (reboot-confounded, `kern.boottime`). The evidenced death mechanisms are load-starvation and an intermittent fs-contention blocking stall, not size."* This session's data agrees with that retraction; it does not reopen it.
- **My own escalation was the wrong move.** Climbing 180→300→600 ms extended the blind window without saving a wedged drain. The plan's operational lesson is the opposite: *"keep budgets SHORT (fail fast + restart) because a long budget extends blindness without saving a wedged drain. Treat this as a design constraint … not a budget raise."* I should have re-armed on a short budget, not climbed it.
- **Host power-state confound (pmset-verified — the confound I nearly repeated one layer down).** *All times in this note are UTC (`Z`); `pmset -g log` reports `+0100` (BST = UTC + 1h), converted explicitly below.* `pmset` shows the machine entered macOS *maintenance-sleep cycling* at **01:06 BST = 00:06Z** (Sleep ~16 min / DarkWake ~45 s, repeating) until the **user wake at 06:50 BST = 05:50Z** — that ~5h45m is the overnight "gap" (and it matches the comms stream falling quiet ~00:06Z), and it is **host suspend, not agents idling** (their processes were suspended; the stale heartbeat labels seen on resume are pre-suspend loops resumed on wake). Consequence: any watcher elapsed-time **spanning that window is not a reliable measure of drain work** — `runWithDeadline` is `setTimeout`-based ([`comms-watch-errors.ts:41`](../../agent-tools/src/collaboration-state/comms-watch-errors.ts)) and the `gtimeout 3600` lifetime is a separate clock; neither was verified suspend-immune. **This is the same confound class as the `kern.boottime` reboot-retraction cited above — committed one layer down.** It is bounded only because the three load-bearing deaths (22:02–23:08Z) all **predate** the 00:06Z first sleep — **verified explicitly: zero Sleep transitions in the 21:55–23:15Z death window** (the latest death, 23:08Z, leads the first sleep by ~58 min). The post-wake event is excluded, not interpreted.

So: the three pre-suspend deaths were **contention-driven** (load-starvation + intermittent fs-contention in a busy multi-agent window — *not* host sleep, which began later at 00:06Z), and the O(total) drain is a **latent inefficiency** that would compound this at much larger corpora but was not the proximate cause here. All three are real; conflating them with each other — or with the overnight host suspend — produces the wrong cure.

A compounding second-order effect (F-43): re-arming created **overlapping watcher processes** sharing one seen-file (an old `timeout 3600`-wrapped watcher still running while a new one started), which themselves add I/O load.

## The near-miss that matters

The incoming-Director **Moment-1 pre-position** (PDR-064) landed *during* a drain-death blind window. It was recovered only because the mandatory post-restart **foreground gap-sweep** caught it. The current design is **miss-safe by construction** — `markSeen` runs after `emit`, so a crash yields a duplicate (safe), never a miss ([`comms-relevant-events.ts:84-85`](../../agent-tools/src/collaboration-state/comms-relevant-events.ts)) — and the gap-sweep is the operator-side complement. Treat the sweep as non-optional after every re-arm.

## Cure landscape (corrected)

**The O(total) full-read is worth removing for large corpora — but it is not this session's cure, and the naive version is unsafe.**

- **Home already exists — do not treat incremental drain as novel.** [`comms-watch-storage-redesign.plan.md`](../plans/agent-tooling/current/comms-watch-storage-redesign.plan.md) WS2 replaces the unbounded seen-state with an **O(1) mtime watermark** + a `last_seen_filenames` tie-breaker array, *with* falsifiability tests for same-mtime ties and ordering. That plan is the correct substrate. A drain-**read** that filters to files newer than the watermark is a related follow-on to WS2's seen-**state** watermark — flag it there, not as a standalone novelty.
- **The naive "files newer than created_at X" filter is a silent-miss hazard — do NOT do it.** The seen-set does **not** backstop this: `!seenIds.has(...)` only de-dupes files that were *read* this cycle ([`comms-relevant-events.ts:99`](../../agent-tools/src/collaboration-state/comms-relevant-events.ts)); it has no power over a file the filter never reads. A naive cursor trades the current loud, recoverable drain-timeout for a **silent miss with no error and no sweep trigger** — the exact silent-blindness the watcher exists to prevent. The storage-redesign plan keys on **FS mtime** (monotonic on the writing host's clock, unlike self-reported `created_at`) precisely to avoid this; any incremental-read change must inherit that design and its tests, not hand-wave a "seen-set backstop."
- **`O(new)` is not free.** Even a watermark scheme still `readdir`s the whole dir each cycle ([`state-io.ts:140`](../../agent-tools/src/collaboration-state/state-io.ts)) — O(total) cheap syscalls; only the read+parse+validate drops to O(new). The honest framing is "O(total) enumerate + O(new) parse," not "independent of corpus size."
- **Complementary load-reducer (owner-gated):** comms-dir archival/retention shrinks the live dir, but is blocked by the 2026-05-25 owner preservation pause (per F-43 and the storage-redesign plan's WS3) — cannot be assumed.

**Distinct from the in-flight cures (confirmed):**
- **Lane-C Goal-1 reserve-seat `--exclude-tag heartbeat`** reduces what is *emitted to the consumer*; the drain still reads + classifies every file *before* any tag filter, so it does **not** reduce drain cost. (It remains valuable for standby/Director context economy — a different problem.)
- **F-101 / `--supervisor-pid`** cures *orphan* watchers (agent gone), not the drain-timeout of a live agent's watcher. The F-101 register entry itself records the drain step-timeout as live residual friction after its cure.

## Interim operator guidance

1. **Keep `--step-timeout-ms` SHORT; do not climb it.** A wedged drain is not saved by a longer budget — climbing it only extends the blind window (the hang-hardening plan's explicit lesson; my 180→600 escalation was the wrong move).
2. **Always run the foreground gap-sweep after every re-arm** (`comms list --tail` / inbox read over the down window). This recovered the Moment-1 pre-position here. Non-optional.
3. **Avoid overlapping re-arms** — let the prior process exit first; overlapping `timeout`-wrapped watchers become zombie co-writers (F-43) that add I/O load.

## Relationships

- **[F-43](../plans/agent-tooling/frictions-register.md)** — the register entry this note expands. Its cure (c) "dir-size-scaled drain budget" is palliative *and* aimed at the wrong variable for this session's deaths (contention, not size); its (a)/(b) zombie kill-tree + stale-process census remain genuinely unhomed (the hang-hardening plan's §Non-goals scopes them out). Note F-43's own phrasing pairs "growing comms dir" **with** "concurrent load" — the load half is the operative one.
- **[`comms-watch-storage-redesign.plan.md`](../plans/agent-tooling/current/comms-watch-storage-redesign.plan.md)** — WS2 mtime-watermark; the correct home for any incremental-drain follow-on.
- **[`comms-watch-hang-hardening.plan.md`](../plans/agent-tooling/current/comms-watch-hang-hardening.plan.md)** — c1 (fail-loud per-step deadline) + the keep-budgets-short design constraint + the routed-evidence size→death retraction.
- **F-44** (freshness≠liveness) — adjacent: a drain-dead watcher leaves claim `freshness_status` as the only signal, and it reads "stale" for live agents, compounding blindness.
- **F-95** (watcher-presence gate) — a drain-dead watcher can fail `assert-watcher-live` and (correctly) block `claims open`, so the death has coordination blast-radius beyond missed events.
- **Self-similar observation**: the team was building liveness tooling (F-101, reserve-seat filter, the storage redesign) while the watcher's own drain-deaths throttled the Director coordinating that work — evidence the backlog is aimed right (FRAME-1).

## Provenance of the corrections (for the record)

The first draft asserted (a) "dir-size × per-cycle-full-read, not host starvation" as the cause and (b) a naive incremental-cursor drain "backstopped by the seen-set" that would "eliminate the timeout class entirely." Both were wrong: (a) is arithmetically impossible (+1.28% corpus vs +233% deadline) and contradicts the FH-retracted size→death link; (b) reintroduces a silent-miss the seen-set cannot prevent. A 4-dimension verification workflow (run-id `wf_24a99130-926`) surfaced both; every cited source was re-checked first-hand before this rewrite.

A **third** error was then surfaced by an owner question — *did the analysis account for the machine's overnight standby?* It had not. `pmset -g log` showed the ~5h45m overnight "gap" was macOS maintenance-sleep cycling (01:06–06:50 BST = **00:06–05:50Z**); the timeline had reasoned from wall-clock durations across it. Corrected by excluding the one suspend-bracketed event and bounding the contention claim to the three pre-suspend deaths (verified: zero sleeps in the 21:55–23:15Z death window). A first attempt at this correction itself misstated the first-sleep time as 00:51Z — a `tail`-truncated pmset read; re-checking the full log without truncation gave 00:06Z, a reminder that the timestamp discipline applies to the correction as much as the original. The recurring lesson across all three corrections: **wall-clock-duration evidence cannot carry a causal claim about work done without first ruling out clock-jumps — reboot, sleep/standby, NTP — over the measurement window** (this is the `kern.boottime` confound class, hit three times in one analysis chain). This note is the corrected record.
