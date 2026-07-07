# F2 — Worker layer: zero-judgement LLM workers for the plan-corpus refounding

Facet designer output, 2026-07-06. Designs the worker layer only; interfaces
to F1/F3/F4/F5/F6 are named, not designed. Ground truth: the resonance
synthesis box file, the ARC channel (Kiln's Q1–Q5 answers + draft invariants
I1–I12), oak's durable resonance-practice copy (§3 worker doctrine, PDR-125),
and the corpus-mapper/corpus-voter least-privilege envelope precedent
(`.agent/sub-agents/templates/corpus-mapper.md`,
`.agent/sub-agents/templates/corpus-voter.md`, wrappers under
`.claude/agents/`).

## 0. Posture — the worker layer is thin by design

The single most load-bearing fact from the ground truth: resonance's worker
fan-out for mechanical extraction is on the **do-not-copy list** (Kiln Q5;
kit item 1). The extraction nets are regex classes, tiling is arithmetic,
byte-identity is `diff` — all F1 scripts, zero LLM tokens. Invariant I3:
*LLM workers appear only where reading is unavoidable*.

Applying that test to every stage of this protocol leaves exactly one class
of work that is (a) not deterministically scriptable and (b) not judgement:
**paraphrase-tolerant reading that emits verbatim-anchored candidates**.
Regex cannot recognise "we still need to wire the retry logic" as
work-bearing prose; deciding what to *do* with that line is judgement (F3).
The gap between those two is the entire legitimate worker surface.

Everything else resonance used workers for is placed elsewhere here:
mechanical extraction → F1 scripts; dispositions, adjudication, segmentation,
adversarial challenge → F3 judgement agents; reference-class classification →
F3 (applying the closed Decision Table to a reference requires reading its
context and choosing a meaning — that is interpretation, not lookup);
status-vocabulary mapping → F5's versioned table applied by script, with
unmappable values a named residue class routed to F3.

## 1. Decisions

Each decision carries its warrant and its falsifier.

**D1 — Exactly two worker roles: `refound-reader` and `refound-locator`.**
No worker role exists for counting (scripts count), transcription (`sed`
transcribes), classification (judgement), summarisation (judgement — the
33-weakens result IS summary-wording dropping spec detail), or table
application (exact matching is script work).
*Warrant:* kit item 1 + Kiln Q1.1 (script every deterministic layer; at 618
files this is feasibility, not optimisation); restraint-by-default from the
brief. *Falsifier:* the calibration batch surfaces a reading task neither
role's brief covers without judgement → design a third role under the same
doctrine (never widen an existing brief); OR the pilot set-difference
(reader-found ∖ script-found) is empty across the whole pilot area →
`refound-reader` is redundant and is dropped, leaving one role.

**D2 — Workers may only ADD to candidate sets, never subtract, filter, rank,
or dispose (the over-inclusion doctrine).**
Every worker brief mandates over-inclusion ("when unsure, include; never
omit what you deem trivial or duplicate"). A worker's false positives cost
one cheap adjudication row; a worker's silent omission is information loss.
This makes worker error one-directional and bounded by downstream layers.
*Warrant:* the owner directive verbatim ("if they make judgements we lose
information"); Kiln's measured judgement-leakage taxonomy (workers
"correcting" numbering and normalising indentation = judgement wearing
helpfulness clothes). *Falsifier:* pilot false-positive volume makes F3
adjudication cost explode (> ~40% of reader candidates adjudicated as
non-work-bearing) → tighten the target's extensional definition in the
brief; never grant the worker a filtering clause.

**D3 — Single-turn, zero-tools dispatch wherever the input fits; Read-only
dispatch as the fallback; nothing else.**
The dominant cost lever is turns × context, not model tier (PDR-122
measured). The locator inlines its window (dispatcher-numbered lines) and
answers in one turn under the corpus-voter zero-tools envelope (`tools:`
present with NULL value — probe-verified shape; `tools: []` and omission
both fall back to inherit-all). Windows too large to inline dispatch under
the corpus-mapper Read-only envelope.
*Warrant:* measured — free-tool voters burned 350–800k input tokens
re-verifying supplied grounding vs ~14.9k zero-tools; least-privilege agent
types measured 7–17× cheaper. *Falsifier:* inlined-window fidelity decays
with length (worker fidelity is length-correlated, measured) at sizes below
the inline threshold → lower the threshold; the mechanism stands.

**D4 — Verification is the four-step protocol on 100% of replies, with
step 3 upgraded to FULL-SET byte equality. Never sampling.**
*Warrant:* measured — count-parity-plus-sampling passed work full-set
equality rejected; sampling missed a +1 line offset and a single-character
truncation on 886-char rows; the one fabricated worker entry was caught by
full-set verification. *Falsifier:* none sought — step 3 is a script over
frozen bytes; its cost is negligible, so there is no economics case to
weaken it.

**D5 — Every dispatch carries a hidden known-answer floor, so every
detector proves it can fire continuously, not only at calibration.**
Reader dispatches: K work-bearing lines already found by the F1 scripted
nets in that window (selected by deterministic rule, not told to the
worker) must appear in the reply. Locator dispatches: the scripted
exact-match hit set for the target (computed by the dispatcher, withheld
from the worker) must be a subset of the reply's candidates.
*Warrant:* invariant I4 (a zero from a detector never shown to fire is not
a finding), applied per-dispatch rather than per-run. *Falsifier:* a window
exists where no scripted-net hit is available as a floor (pure-prose file)
→ fall back to a planted synthetic canary in a staged copy of that window
(never mutate frozen originals), at a declared per-batch rate.

**D6 — A refusal is a task-design defect; the task is redesigned under a
new spec hash, never re-worded.**
Task id = hash of the task spec (role, window/target ids, brief text,
schema version). A task that terminates REFUSED puts its spec hash on a
blocklist; the dispatcher structurally cannot re-dispatch it. The cure is a
recorded redesign (split the task, move the judgement to F3, or extend an
F1 script), which produces a new spec hash plus a design-delta record.
*Warrant:* Kiln Q2, measured — the refusal clause fired as designed and
every firing meant the TASK was mis-designed; "never re-word to squeeze
judgement out of a cheap narrow context — that loses vital information
silently". *Falsifier:* the blocklist blocks a legitimately redesigned task
— it cannot: redesign produces a new hash; the friction of recording the
design delta is the intended cost.

**D7 — A dispatch ledger with typed terminal states; a batch cannot close
with a hole.**
Every task reaches exactly one of VERIFIED or PULLED. Null replies
(maxTurns cap, harness death) are typed and auto-re-dispatched; nothing is
ever silently absent. Raw replies are stored verbatim on disk so
verification is recomputable later.
*Warrant:* the D-kernel completion-tracking invariant;
`validators-must-recompute-not-just-record`; the corpus pipeline precedent
(a capped mapper returns null and the stage records the window incomplete
rather than passing silently). *Falsifier:* none — this is bookkeeping
arithmetic; if it blocks batch close on a genuinely dead task, PULLED with
the task's inputs intact is the designed escape, routing to F3.

**D8 — File-echo proof on every Read-mode reply.**
The worker must quote the byte-exact first and last line of every named
file. Verified against frozen bytes by code. Proves the worker opened the
right file at the right version at both ends, and detects mid-run drift of
a staged path for free.
*Warrant:* kit item 3's drift lesson applied at file grain; near-zero cost.
*Falsifier:* echoes pass while middle content was never read — covered by
D5's known-answer floor (floors are deliberately selected away from file
edges by the selection rule).

**D9 — Workers are deliberately blind: no doctrine, no lane taxonomy, no
disposition vocabulary, no V0 schema.**
Dispatches are decision-complete; wrappers carry the system prompt verbatim
and load no estate directives (mapper precedent: turns are spent on corpus
reads, not grounding reads). Workers never learn what the destination lanes
are, so their candidate selection cannot bend toward lane-shaped outcomes.
*Warrant:* minimum context is the point (worker-class doctrine, §3 of the
resonance copy); blindness prevents selection bias the same way the
D-kernel's blindness probe does. *Falsifier:* a task provably needs
doctrine context to be judgement-free — no such task is a worker task
(route to F3).

## 2. The two roles

### 2.1 `refound-reader` — semantic recall net over one frozen window

**Purpose.** The reading half of the overlapping-blind-nets omission
detector. F1's scripted nets (structure, list/table rows, fixed keyword
patterns) form one net; this role is the second, semantic net over the same
window. Neither net knows the other's output; deterministic code computes
the set differences. (reader ∖ script) is the value — prose-embedded
work-bearing content regex cannot see — and routes to F3 adjudication.
(script ∖ reader) costs nothing; the script already captured it.

**Where it runs.** Every window of the frozen live-plans denominator
(F1-supplied window manifests). For `.agent/plans-old-archive/**` (Wave-0
sweep input, not a freeze source): only windows containing at least one
scripted-sweep hit enter reader scope — the archive gets grep-first,
read-second treatment to bound cost.

**Envelope** (wrapper at `.claude/agents/refound-reader.md`, canonical
template at `.agent/sub-agents/templates/refound-reader.md`, same pairing
convention as corpus-mapper):

```yaml
name: refound-reader
description: Zero-judgement verbatim-anchoring recall net for the plan-corpus
  refounding. Dispatched exclusively by the refounding dispatcher; never
  invoke interactively. Reads one frozen window's named files in full and
  answers only through the schema-forced structured output call.
tools: Read
disallowedTools: Bash, Write, Edit, NotebookEdit, WebFetch, WebSearch, Agent,
  Skill, ToolSearch, Glob, Grep, ReportFindings
maxTurns: 16
```

`maxTurns: 16` = 10-file window ceiling (one Read per file) + structured
output + retry headroom, the probed mapper arithmetic. A capped reader
returns null → ledger types it, re-dispatch fires (D7).

**Context supplied per dispatch (decision-complete, nothing else):** the
window manifest (repo-root-relative frozen paths + per-file line counts),
the extensional target definition, the rules block, the output schema, the
refusal clause. Total dispatch prompt ≈ 1.5–2k tokens.

**Model tier:** cheapest tier that passes the calibration batch (cost is
orthogonal to rigour; rigour lives in verification, not the model).

### 2.2 `refound-locator` — paraphrase-tolerant find for one named target

**Purpose.** Given ONE target quoted verbatim from the frozen corpus (a
prose completion claim needing an artefact anchor for F5's two-verdict
audit; a concept whose consumers/references must be found for the F3
repoint map; a frozen concept F3 wants candidate anchors for), return every
candidate span in the supplied window that plausibly refers to it —
verbatim quotes with dispatcher-issued line numbers. The locator finds;
it never decides whether a candidate *satisfies* the target — satisfaction
is adjudication (F3) or a mechanical probe (F5).

**Envelope, inline mode (the default):** wrapper at
`.claude/agents/refound-locator.md`, template at
`.agent/sub-agents/templates/refound-locator.md`:

```yaml
name: refound-locator
description: Single-turn zero-judgement paraphrase locator for the plan-corpus
  refounding. Dispatched exclusively by the refounding dispatcher with the
  complete target and dispatcher-numbered window content inlined; judges
  nothing; answers only through the schema-forced structured output call.
tools:
maxTurns: 4
```

The `tools:` null-value field is the probe-verified zero-tools shape — do
not "tidy" it (`tools: []` and omission both inherit-all; the finding is
recorded in the corpus-voter template). `maxTurns: 4` = one answer turn +
structured-output retry, the voter arithmetic.

**Inline threshold:** windows ≤ 1,500 source lines are inlined with
dispatcher-injected line numbers (the worker never computes line numbers —
the measured +1 offset class is eliminated by construction). Larger windows
dispatch the same locator brief through the `refound-reader` envelope
(Read mode); no third agent type exists (D1 restraint).

**Batching:** one target per dispatch. Multiple targets per dispatch was
rejected — it invites cross-target ranking (implicit judgement) and makes
per-target absence re-derivation ambiguous.

## 3. Brief templates

Templates are held as code constants in the dispatcher (schema-versioned),
not prose files workers read. Rendered verbatim here.

### 3.1 `refound-reader` brief

```text
TASK <task-id> (attempt <n>) — role: refound-reader — schema v<S>

You are a zero-judgement reading worker. You extract; you never assess.

INPUT FILES — read every one, in full, in this order:
<repo-root-relative frozen paths, one per line, with declared line counts>

TARGET — a candidate is any line, or minimal contiguous block of lines,
that states or implies any of:
  - work to be done, continued, or finished (in any wording, any tense);
  - a decision made, pending, or reversed;
  - an open question, risk, blocker, or dependency;
  - a commitment, deadline, gate, or acceptance condition;
  - a reference to another plan, thread, tool, or artefact as something
    to act on.

RULES:
- Quote every candidate VERBATIM, byte-for-byte, including typos, wrong
  numbering, odd whitespace, and formatting errors. Never correct anything.
- Over-include: when unsure whether a span matches the target, include it.
- Never omit a candidate because it seems trivial, duplicated, obvious,
  already done, or out of date.
- Never summarise, paraphrase, normalise, reorder, merge, or de-duplicate.
- Cite lines by their position in the file exactly as read.
- Also record, for every input file, its byte-exact first and last line.

OUTPUT: exactly one structured output call matching schema v<S>.
No prose, no commentary, nothing else.

REFUSAL CLAUSE: if completing this task would require you to assess,
decide, interpret, rank, classify, filter, summarise, or choose, make the
structured output call with the refusal object naming the judgement
required — and nothing else. Refusing is a correct outcome.
```

### 3.2 `refound-locator` brief (inline mode)

```text
TASK <task-id> (attempt <n>) — role: refound-locator — schema v<S>

You are a zero-judgement locating worker. You find; you never evaluate.

TARGET <target-id> — locate references to the following, quoted verbatim
from the frozen corpus (source: <frozen-path>:<lines>):
<<<TARGET
<verbatim target text>
TARGET>>>

WINDOW — the complete content you may cite, with line numbers already
assigned. Cite ONLY these numbers; never renumber.
<<<WINDOW <frozen-path>
<n>: <line>
...
WINDOW>>>

RULES:
- A candidate is any span that mentions, restates, paraphrases, partially
  quotes, or depends on the target — in any wording.
- Over-include: when unsure, include. Never rank or prefer candidates.
- Quote every candidate VERBATIM from the window, byte-for-byte.
- Do NOT decide whether any candidate satisfies, completes, contradicts,
  or supersedes the target. That is not your task.
- If you find no candidates, return an empty findings list with
  "notFound": true. An empty result is a valid result.

OUTPUT: exactly one structured output call matching schema v<S>.
No prose, no commentary, nothing else.

REFUSAL CLAUSE: if completing this task would require you to assess,
decide, interpret, rank, classify, filter, summarise, or choose, make the
structured output call with the refusal object naming the judgement
required — and nothing else. Refusing is a correct outcome.
```

## 4. Output schemas (verbatim-anchored)

Strict schemas (Zod at the boundary, `strict()` — unknown keys reject, per
`strict-validation-at-boundary`). Schema-forced structured output, the
corpus-pipeline mechanism. Version pinned per run; a schema change mid-run
is forbidden (it would break count parity across the ledger).

### 4.1 Reader reply

```json
{
  "taskId": "string — echoed from the brief",
  "schemaVersion": "string",
  "fileEchoes": [
    { "path": "string", "firstLine": "string — byte-exact",
      "lastLine": "string — byte-exact" }
  ],
  "findings": [
    { "path": "string", "startLine": 1, "endLine": 3,
      "quote": "string — byte-exact bytes of lines startLine..endLine" }
  ],
  "refusal": null
}
```

### 4.2 Locator reply

```json
{
  "taskId": "string",
  "targetId": "string — echoed",
  "schemaVersion": "string",
  "findings": [
    { "path": "string", "startLine": 12, "endLine": 12,
      "quote": "string — byte-exact" }
  ],
  "notFound": false,
  "refusal": null
}
```

### 4.3 Refusal variant (both roles)

```json
{
  "taskId": "string",
  "schemaVersion": "string",
  "fileEchoes": [],
  "findings": [],
  "refusal": { "requiredJudgement": "string — what choice the task demanded" }
}
```

No classification field exists anywhere. `anchorType: exact-vs-paraphrase`
was rejected: exactness is recomputable by code (byte-compare quote vs
target), so asking the worker is asking for a redundant judgement. No
free-text `notes` field exists: every observed worker micro-judgement leak
(corrected numbering, normalised indentation) is a write into unstructured
space; the schema leaves no unstructured space.

## 5. The four-step verification protocol

Run by deterministic code (TypeScript in `agent-tools`, ESM — placement
coordinated with F1; proposed home `agent-tools/src/refounding/`) on 100%
of replies. Never sampling, never dispatcher eyeballing. Each step emits a
typed reject code into the ledger.

```text
STEP 1 — FORMAT CONFORMANCE
  Parse against the pinned strict schema. taskId/targetId must echo the
  dispatch. Reject code FMT.
  On FMT: one re-dispatch with the deviation named verbatim in the brief
  header; a second FMT pulls the task (PULLED-FORMAT).

STEP 2 — COUNT PARITY (recomputable expectations only)
  - fileEchoes count == manifest file count (reader).
  - For every finding: startLine <= endLine <= manifest line count for
    that path; quote line count == endLine - startLine + 1.
  - Known-answer floor: reader reply covers all K floor lines for the
    window; locator reply's candidate set ⊇ the withheld scripted
    exact-match set for the target.
  Reject codes CNT / FLOOR.

STEP 3 — FULL-SET BYTE EQUALITY
  Every quote in every finding, and every file echo, recomputed
  byte-for-byte against the FROZEN corpus at the cited path:lines
  (frozen bytes are F1's ground truth; the dispatcher verifies manifest
  hashes before dispatch). ONE mismatch rejects the WHOLE reply — a
  single fabricated or drifted quote poisons trust in the reply's
  omissions too. Reject code BYTE.
  Two BYTE rejections from the same role within a batch trip the abort
  breaker (§6).

STEP 4 — ABSENCE RE-DERIVATION
  A worker's "not found" / empty findings is a claim about its search,
  never about the world.
  - Locator notFound: the dispatcher re-derives mechanically — exact,
    case-folded, and token-shingle matches of the target over the window.
    Any mechanical hit refutes the notFound (reject code ABS; re-dispatch
    fresh). If mechanics also find nothing, the absence stands as
    "mechanically negative + one blind reading pass negative" and is
    ledgered with exactly that epistemic label. For loss-bearing targets
    (F3 declares which target classes are loss-bearing), a standing
    negative additionally requires a second blind locator dispatch to
    concur before it may feed any disposition (quorum-of-absence).
  - Reader empty window: if the scripted net found content in the same
    window, an empty reader reply is rejected (ABS) and re-dispatched;
    twice-empty routes the window to F3 as a typed anomaly, never
    accepted silently.
```

Steps 2–4 are pure functions over (reply, manifest, frozen bytes, scripted
hit sets) — re-runnable at any later time against the stored raw replies
(`validators-must-recompute-not-just-record`).

**Verification-code self-proof.** Before the calibration batch, each reject
code is proven able to fire against synthetic bad replies (a wrong-schema
reply, an off-by-one citation, a single-char-corrupted quote, a false
notFound). A verifier that has never gone red is theatre (invariant I4
applied to the verifier itself).

## 6. Known-answer floors, calibration, and the abort breaker

**Per-dispatch floors (D5):** the continuous prove-it-fires mechanism.
Floor selection rules are deterministic: for readers, K = min(3, scripted
hits in window) work-bearing lines chosen by fixed rule (e.g. checkbox todo
lines nearest window midpoint — away from file edges so floors and echoes
cover different failure modes); for locators, the exact-match set. Floors
are never disclosed to workers, so they cannot bias behaviour.

**Calibration batch (pilot-first, D-kernel):** ~1/10th of the pilot area's
windows run first, augmented with planted synthetic canaries in staged
window copies (a fabricated work-bearing line inserted by script; the
frozen corpus is never mutated). Calibration passes when: zero BYTE
rejects, zero FLOOR misses, refusal rate observed and every refusal traced
to a task-design defect (not model incapacity), and the reader
set-difference yield is non-empty (else D1's falsifier fires and the reader
role is dropped). Model tier is fixed at calibration: cheapest tier passing.

**Abort breaker (deterministic, feeds F3's halt conditions):** within any
batch — ≥2 BYTE rejects from one role, OR ≥2 FLOOR misses across the
batch, OR any refusal recurring on a redesigned task → halt the batch,
no further dispatches, escalate to the dispatcher lane with the ledger
slice. Halting is cheap; silent degradation is not.

## 7. Dispatch and completion tracking

**Task identity.** `taskId = hash(role, schemaVersion, briefTemplateVersion,
windowId | targetId, inputManifestHash)` — the spec hash. Attempts are
`(taskId, n)`.

**Ledger** (append-only JSONL under the run directory, committed at every
F1 stable point; raw replies stored verbatim alongside):

```text
states: DISPATCHED → REPLIED | REPLY-NULL
        REPLIED   → VERIFIED | REJECTED(FMT|CNT|FLOOR|BYTE|ABS) | REFUSED
        REJECTED  → REDISPATCHED(n+1)            [max 2 attempts]
        REPLY-NULL→ REDISPATCHED(n+1)            [max 2 attempts]
        exhausted → PULLED(reason)               [inputs intact, routed F3]
        REFUSED   → PULLED-REFUSED + spec-hash blocklist entry
terminal: VERIFIED | PULLED(*)
```

**Completion is arithmetic:** the batch closes only when every windowId /
targetId in the batch manifest has exactly one terminal row. A dead worker
(REPLY-NULL: maxTurns cap, harness failure, empty return) is re-dispatched
automatically — never a silent hole. PULLED tasks are first-class batch
outputs handed to F3 with full inputs; a batch with PULLED rows can close,
but its loss check (F1/F3 interface) counts them explicitly.

**Concurrency:** dispatch in bounded parallel groups of ≤10
(`no-unbounded-host-load`); batch-sequential validation between groups
(D-kernel), so a breaker trip stops spend within one group's lookahead.

## 8. The task-design rule

A refusal firing means the TASK was mis-designed — it asked a worker to
assess, choose, or interpret. The response is structural, never verbal:

1. The task terminates PULLED-REFUSED; its spec hash enters the blocklist.
   The dispatcher is mechanically unable to re-dispatch it.
2. A task-design defect record is written (task spec, the worker's
   `requiredJudgement` string verbatim, the redesign decision).
3. The redesign takes one of exactly three shapes: **split** (separate the
   mechanical part into a new worker task; the judgement part routes to
   F3), **promote** (the whole task was judgement; it moves to F3
   wholesale), or **script** (the task was deterministic all along; it
   becomes an F1 script). The redesigned task has a new spec hash by
   construction.
4. Re-wording the same demand to make a worker comply is forbidden — that
   squeezes the judgement into a minimal context where its information
   loss is invisible (Kiln Q2, measured).
5. The defect records are reviewed at the batched mid-flight owner rulings
   (F3/F4 interface): a recurring defect shape is protocol feedback, not
   worker noise.

## 9. Cost model sketch

Grounded in: oak denominator 618 files / 165,066 lines; resonance priors
(74 dispatches / 45 tasks / ~26 first-round rejections when workers did
mechanical extraction — which this design scripts away); measured
zero-tools voter ≈ 14.9k tokens; mapper-class Read dispatch ≈ window bytes
+ ~2k brief + ~2–4k output.

| Item | Estimate | Basis |
| --- | --- | --- |
| Reader windows (live corpus) | ~110–130 | 165k lines / ~1.5k-line windows, ≤10 files each |
| Reader re-dispatch allowance | +15% | below resonance's 35% (their rejects were extraction-fidelity; byte-anchoring + schema forcing + floors bite earlier) |
| Tokens per reader dispatch | ~25–35k | window read ~20–25k + brief + structured output |
| Reader subtotal | ~3.5–5M tokens | ~140 dispatches × ~30k |
| Locator targets | ~300–700 (F3/F5-driven) | prose completion claims + repoint paraphrase targets; unknown until the two-verdict claim census (open question OQ2) |
| Tokens per inline locator | ~8–15k | ≤1.5k-line window inlined + target + output, voter-shaped |
| Locator subtotal | ~3–9M tokens | midpoint ~6M |
| Archive sweep readers | ~1–2M tokens | grep-hit windows only, from 571 files |
| Verification | ~0 LLM tokens | all deterministic scripts |
| **Worker layer total** | **~8–16M cheap-tier tokens** | declared pre-run per D-kernel, in every billing denomination, before scale-up |
| Wall-clock | ~3–6h dispatch time | groups of 10, batch-sequential validate; fits F6's stable-point structure |

The pre-run cost declaration (per batch, per role, per denomination) is a
dispatcher output computed from these formulas and the batch manifest — an
owner-visible artefact before any scale-up beyond calibration.

## 10. Interfaces to other facets

- **F1 (consumes):** window manifests (frozen paths, line counts, file
  hashes), scripted-net hit sets per window (floors + set-difference
  baseline), frozen corpus bytes as verification ground truth, batch/
  stable-point boundaries the ledger checkpoints into. **F1 (provides
  nothing to workers directly** — the dispatcher mediates everything).
  Placement of dispatcher + verification code inside `agent-tools`
  coordinated with F1's build-vs-extend verdict.
- **F3 (produces for):** the (reader ∖ script) candidate difference —
  the semantic net's yield — as adjudication input; PULLED and
  PULLED-REFUSED tasks with inputs intact; task-design defect records;
  breaker trips as halt-condition inputs. **F3 (consumes from):** the
  loss-bearing target-class declaration (drives quorum-of-absence);
  locator target lists for repoint/challenge preparation. The adversarial
  challenge layer is NOT worker work — challengers judge, so they live in
  F3 with their own (richer) envelopes.
- **F4:** no interface at worker level by design (D9 blindness). Lane
  taxonomy, holding-lane routing, and coexistence policy never appear in
  a worker dispatch.
- **F5 (produces for):** candidate artefact anchors for prose completion
  claims in the two-verdict audit (the claim census defines locator
  targets); the `attested`-adjacent epistemic labels on standing absences.
  **F5 (consumes from):** nothing at worker level — mechanical probes
  (gates, git-facts) are F5 scripts, not workers.
- **F6:** calibration batch = pilot-area first tranche; ledger stable
  points align with F6's session boundaries; per-batch cost declarations
  feed F6's run economics.

## 11. Owner-gate items

1. **Worker-layer boundary ratification** (at protocol commissioning, with
   the other facets' gates): the one-sentence contract — *workers read and
   anchor verbatim; they never classify, filter, rank, summarise, or
   dispose; a refusal is a protocol success* — ratified so mid-run pressure
   cannot erode it.
2. **Post-calibration cost declaration sign-off** before scale-up beyond
   the pilot area (D-kernel pre-run declaration doctrine).
3. **Two new agent types** (`refound-reader`, `refound-locator`) landing in
   the sub-agent estate via the standing subagent-architect path
   (`subagent-practice-core-protection` applies; template + wrapper pairing
   per the corpus-* convention).

No other owner moments: the worker layer is deliberately below the owner's
attention line — its guarantees are mechanical.

## 12. Rejected alternatives

- **Worker fan-out for mechanical extraction** — resonance's own
  do-not-copy item 1; the dispatcher's recomputation was always the binding
  proof; at 618 files, scripting is feasibility.
- **A summarising/atlas reader** ("describe each file's contents") —
  summary wording is judgement; the 33-weakens result is precisely
  summary-grade concept-kept/detail-dropped loss.
- **Workers applying the status-mapping table or the reference-class
  Decision Table** — table application over messy real context is
  interpretation; judgement is placed at the table (F5) and at adjudication
  (F3), zero judgement per item only when matching is exact (script).
- **Category fields in the reader schema** — classification smuggled into
  extraction; the closed target definition bounds recall without asking
  the worker to type anything.
- **Sampled byte-fidelity** (resonance's original step iii) — measured to
  miss a +1 offset and a single-char truncation; full-set equality is a
  trivial script.
- **Count-parity-only acceptance** — measured theatre-adjacent: passed
  work full-set equality rejected.
- **Free-tool or default-tool workers** — omitted `tools` inherits ALL
  tools (probed); free-tool voters measured at 350–800k tokens each; a
  shell is a universal capability, never "read-only".
- **One mega-worker per area** (fewer, bigger dispatches) — worker
  fidelity is length-correlated (measured); windows are sized to keep
  replies short and verification sharp.
- **Multi-target locator dispatches** — invites implicit cross-target
  ranking and muddies per-target absence re-derivation.
- **Worker-computed line numbers on inlined content** — the measured +1
  offset class; dispatcher-injected numbering eliminates it by
  construction.
- **Re-wording refused tasks** — Kiln Q2 verbatim; the blocklist makes
  this structurally impossible rather than exhortation.
- **A third agent type for Read-mode location** — envelope reuse
  (`refound-reader` + locator brief) does the job; restraint by default.

## 13. Open questions

- **OQ1 — Does the reader earn its keep?** The pilot set-difference yield
  is the measurement. If scripted nets + residue clustering already reach
  the recall floor over the pilot area (empty reader yield), D1's falsifier
  drops the reader and the worker layer is locators only. Priced in; the
  calibration batch answers it before scale spend.
- **OQ2 — Locator target volume.** Unknown until F5's claim census (how
  many of the ~30-status-value corpus's completion claims are prose-only)
  and F3's repoint target derivation. The cost model carries a 2× band;
  the pre-run declaration closes it per batch.
- **OQ3 — Quorum-of-absence pricing.** Second blind locator on every
  loss-bearing negative vs routing all standing negatives straight to F3
  adjudication: decide at calibration from the observed negative rate
  (F3 owns the loss-bearing class list; F2 owns the mechanism either way).
- **OQ4 — Intent-leak surfaces** (`.agent/prompts/`, thread records): if
  F1's freeze-rule verdict includes them in the denominator, reader windows
  extend mechanically; no design change, but window count (and the cost
  declaration) grows — flagged so F1's surface verdict is taken with the
  worker cost visible.
- **OQ5 — Staged-copy canary hygiene:** planted canaries live in staged
  window copies under the run directory, never the frozen tree; the exact
  staging path scheme is F1's to fix (it owns freeze hygiene); F2 needs
  only "manifest paths are what workers read".
