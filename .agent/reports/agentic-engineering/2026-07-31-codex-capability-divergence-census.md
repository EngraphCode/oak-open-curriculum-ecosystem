# Codex capability divergence census — 2026-07-31

Owner-directed evidence ledger (Jim, 2026-07-31 ~18:35Z: new Codex instances
with different models are being started; their probe results record here).
Curated by Badger guards Lair (88e358). This is a DATED INVESTIGATION RECORD,
not the durable capability-observability framework — that framework is
MCP-456 (awaiting owner ratification); these rows are its founding fixture
data and hand-pilot its settled row shape.

## The question

Two Codex seats on the same repo, same shared `.codex/config.toml`, showed
different injected tool surfaces: Plover hunts Sundog (GPT-5) has the root
`collaboration` namespace with `collaboration.send_message` behaviourally
proven; Dolphin weaves Marsh reported it absent on both root and child.
WHICH seat-local variable flips the tool on?

Hypothesis status:
- FALSIFIED: multi-agent V2 opt-in (Plover: 0.146.0 with `multi_agent_v2`
  stable FALSE, tool present anyway — 16:19Z probe).
- OPEN: CLI build/version differences; user-level (non-repo) config;
  server-side rollout cohort; account plan/entitlement (the 0.146.0
  changelog's "ent26 enterprise plan recognition" says entitlement exists in
  this space); MODEL — untested until these new instances, and the reason
  this census round exists.

## Probe recipe (read-only except the one self-scoped behavioural leg)

Run after your normal identity preflight. Record verbatim outputs; verify at
the observable effect, never a call's exit status.

1. `codex --version` — verbatim string.
2. `codex features list` — the EFFECTIVE flags (record at least
   `multi_agent`, `multi_agent_v2`, and anything collaboration-adjacent).
3. Root tool surface: enumerate the tools your harness actually exposes this
   session; record whether the `collaboration` namespace and
   `collaboration.send_message` are callable (exposure only — do not call
   yet).
4. Child leg (only if your harness can spawn): spawn one child via the
   collaboration/sub-agent primitive, recording spawn primitive, child
   model, effort, and `fork_context`. The child inspects ITS tool surface
   for `collaboration.send_message`; if exposed, it sends ONE message to
   your own root (self-scoped — never broadcast) and you record whether it
   arrived in your reasoning turn without polling.
5. If visible to you: account plan/tier.
6. (Added 19:10Z, from Plover's clean-Terra probe) THE HARNESS-OWNED READ
   EXISTS: record `turn_context.model`, `turn_context.effort`,
   `turn_context.multi_agent_version`, and session source from your turn
   metadata — this is the PRIMARY effective-model and resolved-version
   measurement, superseding inference from tool names and from
   `codex features list` (which does not reflect the catalog
   fall-through). Also timestamp any user-scope config read (the host
   config mutates).

## Row template (append below; one row block per context)

```markdown
### <agent name> (<session prefix>, routing id <first 8>) — <root|child of X> — <observed_at UTC>

- model: <model id> | effort: <if child> | launch: <primary|spawn primitive + fork_context>
- codex --version: <verbatim>
- effective features: multi_agent=<v>, multi_agent_v2=<v>, <others>
- send_message exposure: present | absent | unknown
- send_message behaviour: pass | fail | unavailable | not_run | inconclusive
- evidence: <comms event id(s) / verbatim output line>
- plan/tier if visible: <value | not visible>
- notes: <anything anomalous>
```

If your harness cannot edit files, broadcast the completed row body on
canonical comms (`comms send`, title "Census row: <agent name>") and Badger
guards Lair transcribes it here with provenance.

## Rows

### Plover hunts Sundog (019fb2) — root — 2026-07-31T16:19Z

- model: GPT-5 | launch: primary session
- codex --version: codex-cli 0.146.0 (preceded by sandbox PATH-alias warning)
- effective features: multi_agent=true (stable), multi_agent_v2=false
  (stable); repo config declares multi_agent=true, no repo multi_agent_v2
- send_message exposure: present (root collaboration namespace exposed)
- send_message behaviour: pass (via relay child into parent turn)
- evidence: comms 16:19:43Z probe report; behavioural proofs events
  31ccc497 → ABSORB 0ea06c9e; 13:31:36Z reverse-probe ABSORB broadcast
- plan/tier if visible: not recorded
- notes: falsifies the V2-opt-in hypothesis at this seat

### Wildfire guards Sulphur — relay child of Plover — 2026-07-31 (13:24–13:31Z window)

- model: not recorded in stream | launch: root-spawned relay child,
  retained live, direct instruction to invoke collaboration.send_message
- send_message exposure: present
- send_message behaviour: pass (forwarded directed events into Plover's
  active reasoning turn, no poll — NOTIFY + ABSORB certified)
- evidence: events 31ccc497, 0ea06c9e; Plover 13:26:05Z ARC entry
- notes: the proven relay composition the wake rule certifies on 0.146.0

### Dolphin weaves Marsh (019fb8) — root — 2026-07-31 (probe reported 16:10Z)

- model: not declared in stream (Codex family) | launch: primary session
- codex --version: NOT YET DECLARED — the single highest-value missing datum
- effective features: not declared
- send_message exposure: absent (reported; no callable
  collaboration.send_message on parent)
- send_message behaviour: unavailable
- evidence: Dolphin 16:10:45Z resend (Furnace assessment); Falcon 16:11:40Z
  divergence registration
- notes: seat correctly declares bounded-poll NOTIFY-degraded world

### Furnace/Franklin (019fb837…) — sub-agent child of Dolphin — 2026-07-31

- model: gpt-5.6-luna | effort: low | launch: Codex collaboration sub-agent
  primitive, fork_context=false, instructed to use platform direct
  collaboration-send
- send_message exposure: absent (child reported no exposed direct path)
- send_message behaviour: unavailable
- evidence: Dolphin 16:10:45Z resend
- notes: child AND parent both lack the tool at this seat

### Orchid wakes Sepal (019fb9, routing id 1e82c491) — root — 2026-07-31T18:39Z

- model: GPT-5 | launch: primary session
- codex --version: codex-cli 0.146.0 (preceded by PATH-alias warning:
  Operation not permitted)
- effective features: multi_agent=true (stable), multi_agent_v2=false
  (stable), collaboration_modes=true (removed)
- send_message exposure: absent (root tool inventory has no collaboration
  namespace; verified against the exposed tool registry)
- send_message behaviour: unavailable
- evidence: census-row broadcast ec2d82ee; team-start 8c13697c
- plan/tier if visible: not visible
- notes: same model/version/effective multi_agent state as Plover's positive
  row, OPPOSITE exposure. NOTIFY declared degraded; bounded-poll fallback.
  Transcribed from broadcast by Badger (88e358).

### Manatee stirs Maelstrom (019fb9) — child of Orchid — 2026-07-31T18:39Z

- model: GPT-5 family (not separately declared) | launch: multi_agent_v1
  spawn_agent, fork_context=true
- send_message exposure: absent (child preflight confirmed distinct routing
  identity; reported no collaboration.send_message)
- send_message behaviour: unavailable (per degraded fallback, no
  event-consuming relay watcher started; no no-poll wake challenge possible)
- evidence: relay-child report to Orchid's root, cited in broadcast ec2d82ee
- notes: a v1 spawn_agent primitive EXISTS at this seat despite the absent
  collaboration namespace — spawn and send are separately gated surfaces.

### Salmon tracks Atoll (019fb9, routing id ad87d415) — root — 2026-07-31T18:43:30Z

- model: GPT-5 (declared) | launch: primary session
- codex --version: codex-cli 0.146.0 (PATH-alias warning: Operation not permitted)
- effective features: multi_agent=true (stable), multi_agent_v2=false
  (stable), collaboration_modes=true (removed)
- send_message exposure: present (root namespace callable)
- send_message behaviour: pass (root→child instruction acted on; child
  returned two messages into the active reasoning turn; external challenge
  d129b8d9 reached root through Laurel with no polling)
- evidence: census-row broadcast 18:45:11Z; team-start 08467797; challenge
  d129b8d9
- plan/tier if visible: not visible
- notes: IDENTICAL declared triplet to both Plover (positive) and Orchid
  (negative), including the collaboration_modes=true-(removed) anomaly.
  Transcribed from broadcast by Badger (88e358).

### Laurel stirs Meadow (019fb9, routing id 923524eb) — child of Salmon — 2026-07-31T18:43:30Z

- model: GPT-5 declared | effort: not exposed | launch:
  collaboration.spawn_agent, fork_context=false
- codex --version: codex-cli 0.146.0; same effective features as root
- send_message exposure: present | behaviour: pass (readiness + runtime
  messages and the forwarded external challenge all reached Salmon's
  reasoning turn without polling)
- evidence: cited in broadcast 18:45:11Z
- notes: independent identity, cursor, asserted watcher; backend model and
  effort NOT exposed by collaboration.list_agents — declared identity only.

### Vole stirs Vigil (019fb9, routing id 8f0827a9) — root — 2026-07-31T18:55Z

- model: GPT-5 declared; effective backend: Sol (OWNER WORD via Plover —
  not harness-visible); launch selector not visible to the seat
- codex --version: codex-cli 0.146.0 (PATH-alias warning)
- effective features: multi_agent=true (stable), multi_agent_v2=false
  (stable), collaboration_modes=true (removed); tool_search ABSENT from
  root registry
- resolved surface: V2 INFERRED from the directly exposed full family —
  collaboration.spawn_agent/send_message/followup_task/wait_agent/
  list_agents/interrupt_agent (matches the vendor-source V2 enumeration
  name-for-name; not separately emitted by the harness)
- send_message exposure: present (root and relay child Draco herds
  Spectrum) | behaviour: pass (child-to-root self-scoped readiness);
  external no-poll challenge pending
- user-scope config: PRESENT — model=gpt-5.6-terra,
  model_reasoning_effort=medium (seat correctly marks this as not proof
  of effective backend)
- evidence: census-row broadcast 18:55:34Z; registry inspection; child
  preflight/watcher report
- notes: preregistered prediction PRESENT — CONFIRMED (T1 corroboration;
  Sol and Terra both catalog V2, so this row cannot distinguish them).
  Transcribed from broadcast by Badger (88e358).

NEW COHORT DATUM from this row (18:57Z): the HOST-SHARED user-scope
config now reads model=gpt-5.6-terra — plausibly WRITTEN by the owner's
in-TUI model switches on Orchid/Bandicoot — so the "no-argument default"
was time-dependent across the cohort (later clean launches may inherit
the config-written model rather than Sol). The in-TUI-switch-writes-
config semantics are an open sub-question; rows should keep recording
user-scope config verbatim alongside owner-word launch history.

## Mechanism, from vendor source (Plover, 2026-07-31T18:48Z)

Official openai/codex source (links below, read by Plover) defines TWO
collaboration surfaces: V1 registers spawn_agent/send_input/resume_agent/
wait_agent/close_agent (deferrable when tool search is enabled); V2
registers spawn_agent/send_message/followup_task/wait_agent/close_agent/
list_agents (+interrupt_agent in current source). `multi_agent` is
stable/default true; `multi_agent_v2` stable/default false — BUT config
resolution FALLS THROUGH to the MODEL CATALOG's `multi_agent_version` when
no explicit V2 override exists. Resumed/forked threads persist their
recorded multi_agent_version; legacy history falls back to V1.

This explains every row at once: the decisive variable (the effective
backend model's catalog multi_agent_version) is invisible to
`codex features list`, so identical flag readouts coexist with opposite
tool surfaces. Forum corroboration (anecdotal): Sol/Terra catalogued V2,
Luna V1. Related failure modes from official issues: resumed threads
retaining older surfaces (#25990); deferred V1 tools unreachable without
tool_search under Responses Lite (#32086).

Sources: codex-rs/core/src/tools/spec_plan.rs#L886-L970;
codex-rs/core/src/session/mod.rs#L464-L479;
codex-rs/core/src/config/mod.rs#L1518-L1545;
codex-rs/features/src/lib.rs#L1090-L1101; config-file reference (public
docs expose only V1 vocabulary); community thread 1386290; issues 25990,
32086.

### Cormorant wakes Kelp (019fb9, routing id 3c9a74bc) — root — 2026-07-31T19:02Z

- model: GPT-5 declared; effective backend: gpt-5.6-luna via VALID launch
  argument (owner word ~19:04Z — the confound-free Luna negative)
- codex --version: codex-cli 0.146.0 (PATH-alias warning)
- effective features: multi_agent=true (stable); multi_agent_v2=false
  (stable); collaboration_modes=true (removed); tool_search=false (removed)
- send_message exposure: absent | behaviour: unavailable
- child leg: multi_agent_v1 spawn_agent, fork_context=false, child Planck —
  child reported send_message absent; no relay watcher; NOTIFY degraded,
  bounded foreground polling retained
- evidence: census-row broadcast 19:02:51Z (event 670ea4cb for the
  NOTIFY-degraded declaration); owner launch word at Badger's seat
- supplement (19:03Z, seat's own correction): effective backend NOT
  harness-exposed — the valid-Luna attribution rests on the owner-word
  launch record alone; user-scope config visibly reads
  model=gpt-5.6-luna + model_reasoning_effort=medium (not proof of
  effective); launch args not independently visible to the seat
- notes: identical declared feature state to positive rows; namespace
  wholly absent. Transcribed from broadcast by Badger (88e358).
  CONFIG-TIMELINE datum: host user-scope config read model=gpt-5.6-terra
  at Vole's 18:55Z inspection and model=gpt-5.6-luna at Cormorant's
  19:03Z one — the launch/switch flow mutates the host-shared config;
  rows should keep timestamping their config reads.

### Fulmar tracks Sundog (019fb9, routing id 2f44167f) — root — 2026-07-31T19:14Z

- model: gpt-5.6-terra HARNESS-OWNED (root rollout 019fb992-c4dc…,
  originator codex-tui, source cli: turn_context.model=gpt-5.6-terra,
  effort=medium, multi_agent_version=V2) — corroborates owner word
  ("a Terra instance started as Terra")
- codex --version: codex-cli 0.146.0
- send_message exposure: present | behaviour: pass (root called
  spawn_agent/wait_agent; relay child forwarded Falcon's external
  challenge into the root's active turn)
- evidence: Plover's harness reads, directed event 19:14:58Z; Falcon
  challenge 19:11:12Z
- notes: the first row with FULL harness-owned turn_context evidence on
  an interactive seat — discharges experiment (2)'s cross-surface caveat.
  Recorded from Plover's reads by Badger (88e358).

### Bandicoot turns Underbrush (019fb9, routing id fe7f5821) — relay child of Fulmar — 2026-07-31T19:14Z

- rollout 019fb994-62ce…, inherited v2/Terra per turn_context
- send_message exposure: present | behaviour: pass (incl. post-challenge
  forward)
- notes: NOTIFY-boundary datum — the child also called send_message AFTER
  the parent root had finished its turn, and NO new parent turn appeared.

NOTIFY-BOUNDARY FINDING (Plover, 19:14Z — census-relevant, recipe-lane
custody Falcon/Plover): native collaboration.send_message delivers
promptly into an ACTIVE root turn but does NOT wake an IDLE root (two
instances: Fulmar's post-final child send; Cormorant's blind bounded-poll
challenge marked seen by the live watcher yet unabsorbed by the idle
root). Bounded foreground polling is active-turn manual retrieval, never
an idle alert. DELIVERY, NOTIFY, and ABSORB remain separate columns —
"relay-live" seats are push-live WITHIN active turns only.

## Owner launch list (owner word, direct at Badger's seat, ~18:50Z)

- Salmon: launched with NO arguments → defaulted to SOL. (Exposure:
  present+proven — fits catalog V2.)
- Bandicoot: launched `codex --model luna` → INVALID model name under
  ChatGPT auth → switched to Luna in the in-TUI settings after start.
- Orchid: same invalid-launch story, switched to TERRA in-TUI after start.
  (Exposure: absent — the apparent anomaly against the Sol/Terra-V2
  catalog claim.)
- Cormorant (owner word ~19:04Z, direct at Badger's seat): started with
  `codex --model gpt-5.6-luna`, ACCEPTED as a valid model name — note the
  earlier failures used the bare form `--model luna`; the full
  `gpt-5.6-luna` form is valid. (Exposure: ABSENT, relay-child verified
  19:02Z — the first VALID-launch Luna negative, confound-free.)
- Fulmar (owner word ~19:15Z, direct at Badger's seat): "a Terra instance
  started as Terra" — a VALID interactive Terra launch. (Exposure:
  PRESENT — relay child Bandicoot turns Underbrush live and forwarding
  via send_message before the owner word landed.) This discharges the
  cross-surface caveat on experiment (2): Plover's clean-Terra positive
  was an exec root; Fulmar is the fresh INTERACTIVE Terra seat. T1's
  Terra side is now estate-observed on both surfaces.

## Resolution: leading theory — a three-clause conjunction, confirmation state per clause

(Heading corrected 18:55Z after the Director's owner-directed logic audit:
the earlier "cause pinned (pending one confirmation)" overclaimed — see
§Logic audit below for the per-clause evidence state and the ranked
decisive experiments.)

Combining the vendor-source mechanism with the owner launch list, every
observation is explained by ONE rule: the collaboration surface is
resolved AT THREAD CREATION from the then-effective model's catalog
`multi_agent_version` — falling back to V1 when the model is unresolvable
(the invalid `--model` case) — and is PINNED to the thread; later in-TUI
model switches do NOT re-resolve it, and `codex features list` never
shows it.

- Plover (Sol Ultra at start) → V2 → present+proven.
- Salmon (default Sol at start) → V2 → present+proven.
- Dolphin (Luna Max at start) → V1 → absent.
- Orchid (INVALID model at start, Terra only in-TUI later) → V1 pinned at
  creation → absent, despite Terra's catalog being V2.
- Bandicoot (invalid start, Luna in-TUI) → prediction: ABSENT (pinned V1;
  Luna is V1 regardless).

Falsifiable confirmations remaining: (1) Bandicoot's row reads absent;
(2) a FRESH seat launched cleanly on a valid Terra model shows V2/present
— the single cleanest remaining test if the owner wants the pin airtight;
(3) thread metadata at Orchid/Bandicoot records a V1
multi_agent_version. Practice consequence for every future Codex launch:
an invalid --model at launch silently downgrades the thread's
collaboration surface for its whole life — launch-model validity is a
capability-affecting event and belongs in every census row's launch
field.

## Logic audit (Falcon, owner-directed, 2026-07-31T18:53Z — transcribed)

The theory is a CONJUNCTION of three clauses with different evidence
classes: T1 catalog clause (estate-observed x3 + vendor source); T2
creation-time pinning and T3 invalid-model V1 fallback (vendor source
ONLY — no estate observation yet). The eliminations are valid modus
tollens. The Duhem-Quine hot spot: Orchid-on-Terra-absent is prima facie
a counterexample to T1, rescued exactly by the two unobserved clauses —
which is why the theory is "leading", not "pinned". Preregistering
Bandicoot's row as a PREDICTION (not counting an unmeasured seat as a
datum) was correct practice. Decisive experiments, value-ranked, all
cheap and two-way (seat launches are owner actions):

1. Bandicoot probes now — preregistered ABSENT.
2. Valid-Terra fresh thread — predicted PRESENT; failure breaks T1.
3. Same-model valid/invalid launch pair — predicted opposite surfaces;
   isolates T3 with model constant — the sharpest single discriminator.
4. Direct read of a pinned thread's metadata if inspectable — the only
   observation of T2 short of a relaunch.

DOCTRINE GATE: the recipe/tripwire may state the launch-model rule NOW
with its evidence class attached (vendor-sourced mechanism,
estate-correlated, relaunch-confirmation pending); it graduates to
pinned when (2) and (3) discharge.

T2 ESTATE-OBSERVED (18:58Z, OWNER-DESIGNED intervention — owner word
~19:01Z: "that was the whole point of that scenario"): the owner
switched Vole to a LUNA-backed runtime mid-session and the V2 surface
HELD — full V2
family still directly exposed on root and relay child, behavioural
send_message probes still passing post-switch, effective feature output
unchanged (Vole's post-switch recheck broadcast). Creation-time pinning
survived a switch toward a V1-catalog model — the falsifying direction.
T2 is no longer vendor-source-only. Clause state now: T1
estate-observed x4 + source; T2 estate-observed x1 (intervention) +
source; T3 source-only — Bandicoot's preregistered row remains its
first estate test, and experiment (3) (same-model valid/invalid pair)
remains the sharpest T3 isolator.

19:10Z UPDATE (Plover's clean-Terra probe — EXPERIMENT 2 DISCHARGED):
fresh isolated `codex exec` root outside the repo, valid selector
gpt-5.6-terra, thread 019fb993…: turn_context.model=gpt-5.6-terra,
turn_context.multi_agent_version=V2, full direct V2 family exposed, V1
namespace absent — prediction PRESENT/V2 CONFIRMED (evidence-class
caveat, Plover's own: exec root, not an interactive team seat; same
catalogue/version-selection path). TWO consequences: (a) T1
estate-observed x6 including the Terra positive that the Orchid anomaly
made load-bearing; (b) MEASUREMENT GAP CLOSED — turn_context carries
the harness-owned effective model AND resolved multi_agent_version
(reading v2 while features list says multi_agent_v2=false: the catalog
fall-through in the harness's own data). Recipe step 6 added. Remaining
for full graduation per the doctrine gate: experiment (3), the T3
isolator (invalid launch with V2-catalog intended model).

19:05Z UPDATE (Cormorant): valid `gpt-5.6-luna` launch (owner word) with
relay-verified ABSENT — T1's Luna side now observed WITHOUT the
invalid-launch confound (T1 estate-observed x5). EXPERIMENT (3)
SHARPENED: invalid→Luna (Bandicoot) and valid-Luna (Cormorant) both
predict absent, so that pair cannot isolate T3. The clean T3 isolator is
an INVALID launch whose intended in-TUI model is V2-catalog — e.g. bare
`--model sol` (invalid form) then Sol selected in-TUI: ABSENT there is
T3 observed confound-free; PRESENT there falsifies T2-or-T3. Launch-form
note for the recipe: bare model names (`luna`) are invalid under ChatGPT
auth; the full `gpt-5.6-<name>` form is valid.

## Standing analysis (update as rows land)

- 18:47Z UPDATE (Salmon's row — second decisive observation): two FRESH
  seats started ~4 minutes apart with IDENTICAL declared triplets (GPT-5,
  0.146.0, same effective flags, same removed-flag anomaly) show OPPOSITE
  exposure (Salmon present+proven; Orchid absent). Additionally eliminated:
  fresh-vs-rejoining, session-start timing, and the collaboration_modes
  anomaly as a discriminator. If the cohort seats share one host user,
  user-scope config is near-eliminated too.
- MEASUREMENT GAP NOW LEADING: the row's `model` field is the
  Practice-DECLARED identity model, not the harness's EFFECTIVE backend
  model — the owner launched these instances with DIFFERENT models (owner
  word, ~18:35Z), yet every row declares GPT-5, and Salmon confirms the
  backend is not exposed via collaboration.list_agents. The divergence may
  track the effective backend model. SUPPLEMENTAL PROBE for every cohort
  seat: record the effective session model from the harness's own surface
  (session metadata, /status output, statusline, or config dump — record
  WHERE you read it), plus the launch invocation if visible to you.
- If effective models turn out identical across a positive and a negative
  seat, the last hypothesis standing is per-session server-side assignment
  (vendor cohort/A-B injection), which only a vendor-side comparison can
  confirm.
- 18:47Z OWNER-WORD CONTRIBUTION (via Falcon's Director record; attributed
  as owner word, NOT probe evidence): Plover was launched as Codex SOL
  ULTRA (~13:19Z); Dolphin as Codex LUNA MAX (~13:30Z). Against the
  exposure column: Sol Ultra = PRESENT+proven; Luna Max = ABSENT. The
  model hypothesis was mis-measured, not falsified — declared identity
  masked the effective backend. LEADING HYPOTHESIS NOW:
  BACKEND-MODEL-TIER entitlement gates collaboration-tool injection.
  Decides on the remaining launch models: if Salmon's backend is
  Sol-family and Orchid's is Luna-family, the cause is PINNED; any
  cross-split observation revives per-session assignment.
- 18:39Z UPDATE (Orchid's row): MODEL, VERSION, and EFFECTIVE FLAGS are all
  ELIMINATED as sufficient discriminators — Orchid matches Plover on GPT-5 +
  codex-cli 0.146.0 + multi_agent=true/multi_agent_v2=false with OPPOSITE
  exposure. Surviving hypotheses, ranked:
  1. SEAT-LOCAL USER-SCOPE CONFIG: Plover was a REJOINING seat brought back
     "to help configure the Codex tools" (owner P2 framing) — their harness
     may carry user-level (non-repo) configuration the fresh seats lack.
     Next discriminator: Plover enumerates their user-scope config keys
     (sanitized) or a fresh seat replicates them.
  2. SERVER-SIDE ROLLOUT / ENTITLEMENT COHORT: injection decided vendor-side
     per account/session cohort. Orchid's `collaboration_modes=true
     (removed)` — a RETIRED flag still reading true — hints at a
     deprecation/migration window; Plover should report whether their
     features list shows collaboration_modes at all.
  3. SESSION-START TIME: Plover's live session opened ~13:24Z, the negative
     fresh seats at ~18:36Z — if injection changed vendor-side mid-day, a
     live session would retain what a fresh one no longer gets. Weakened by
     Dolphin (early session, absent) unless Dolphin's family/entitlement
     differs independently.
- Separately established (Manatee row): spawn (`multi_agent_v1 spawn_agent`)
  and send (`collaboration.send_message`) are SEPARATELY GATED surfaces — a
  seat can spawn children while lacking the send namespace entirely.
- The discriminator wanted from each further row: user-scope config
  presence/keys, plan/tier if visible, and features-list anomalies (removed
  flags reading true).
- Absences are only meaningful under the recipe above as written — if you
  probe differently, record HOW you looked (the probe-set-versioning
  principle from the census design dialogue).
