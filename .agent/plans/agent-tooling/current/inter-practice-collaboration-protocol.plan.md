---
name: Inter-Practice Collaboration Protocol
overview: >
  Establish a genuine protocol — not a per-session hack — for agents whose
  worktree lives in one Practice repo while their coordination home lives in
  another. Repo-reference vocabulary, declared coordination home, join
  ceremony, foreign-substrate discipline, identity display, and the first
  cross-Practice knowledge-flow probe.
lineage:
  serves_thread: agentic-engineering-enhancements
  serves_stream: agent-tooling — multi-agent collaboration substrate
  strategic_choice: >
    The Practice is an ecosystem, not a collection of clones (owner,
    2026-07-05): repos evolve independently and collaborate through a named,
    versioned protocol, never through assumed convention-identity.
  derives_from: ./multi-agent-collaboration-protocol.plan.md
related_plans:
  - ./coordination-home-cli-path-defaulting.plan.md
  - ./statusline-primary-worktree-rows.plan.md
  - ./session-and-team-state-statusline-icons.plan.md
related_doctrine:
  - docs/architecture/architectural-decisions/197-coordination-home-owns-registry-state.md
  - .agent/practice-core/decision-records/PDR-027-threads-sessions-and-agent-identity.md
  - .agent/practice-core/decision-records/PDR-076-agent-identity-tuple-and-body-file-frontmatter.md
  - .agent/rules/no-machine-local-paths.md
  - .agent/rules/practice-core-portability.md
first_instance: >
  2026-07-05 — owner designated the oak primary checkout @
  feat/corpus_research_enhancements as the worktree and the resonance
  checkout as the coordination home; Wolf rides Vigil (25ece9) ran the first
  live cross-Practice join manually and recorded the frictions this plan
  cures.
last_updated: 2026-07-05
todos:
  - id: ws0-protocol-pdr
    content: "WS0 — Author the inter-Practice collaboration protocol v1 as a practice-core PDR that TRAVELS ON THE PLASMID (portable, repo-neutral, placed in the propagating decision-records/ set so every transplant receives it by construction) plus the oak ADR phenotype note. Frames conjugation as the Core exchange model's second mode alongside transformation. Clauses: repo-reference vocabulary, coordination-home declaration, join ceremony, foreign-substrate discipline, identity display, adoption/versioning model, exchange handshake (concepts-vs-pointers layering)."
    status: pending
  - id: ws0b-two-exchange-modes
    content: "WS0b — Amend the Core exchange model (practice-lineage.md / practice.md portable surfaces) to name TWO modes of horizontal Practice transfer: transformation (existing dead-material uptake at a pin — the transplant/manifest machinery) and conjugation (live bidirectional negotiated exchange — this protocol). Name their shared substrate (incoming box, provenance chains) and complementary lifecycles. This is the reframe that makes inter-Practice comms an extension of an existing Core model, not a bolt-on."
    status: pending
    depends_on: [ws0-protocol-pdr]
  - id: ws0c-conformance-and-versioning
    content: "WS0c — Define the minimum conformance contract that makes a repo 'speak the protocol' (incoming box; threadable comms substrate; the two-sided concepts-vs-pointers layering guard; identity-with-prefix; a declared coordination-home mechanism) and a self-reporting conformance+version check (practice-verification.md phenotype). Each repo declares the protocol version it speaks; the join ceremony negotiates version. This is what lets the ecosystem evolve without lockstep — portable spec, local phenotype, conformance gate, exactly as PDR→ADR already works."
    status: pending
    depends_on: [ws0-protocol-pdr]
  - id: ws0e-shared-schema
    content: "WS0e — Author the SHARED SCHEMA (owner-directed 2026-07-05): a versioned machine-readable schema of the cross-estate wire shapes (exchange-relevant comms-event fields, claim repo_ref, exchange-envelope/box-file frontmatter), Core-carried so both estates validate inbound foreign material against the SAME schema. Encode the version-family compatibility contract: within one MAJOR, additive-optional only (newer parses under older by ignoring unknown-optional; older stays valid under newer); a breaking wire change is a MAJOR bump / new family; cross-family contact is a typed refusal, never best-effort parse. The schema is the artefact that makes divergence SAFE, not merely tolerated."
    status: pending
    depends_on: [ws0-protocol-pdr, ws2-cycle-1-repo-ref-schema]
  - id: ws0d-discoverability
    content: "WS0d — Make the protocol discoverable-by-construction: a portable rule that FIRES on the cross-repo condition (worktree-repo ≠ coordination-home-repo, or joining any foreign substrate) pointing at the join-ceremony skill, plus an AGENT.md/entry-point pointer — both in the propagating Core set so a fresh agent in a freshly-transplanted repo finds the ceremony without being told."
    status: pending
    depends_on: [ws0-protocol-pdr, ws4-skill]
  - id: ws1-cycle-1-env-override
    content: "WS1 cycle 1: failing unit test for PRACTICE_COORDINATION_HOME resolution order (explicit flag > env > git-native) + loud rejection of a missing/substrate-less path, then the resolveCoordinationHome product change. One commit. Tree green at end. DONE 2026-07-05 (Cricket lifts Echo, f31faec62): seam + loud validation landed incl. reviewer-raised absolute-path guard; test file re-classified integration; explicit-flag wiring test + one composition-edge wrapper routed to coordination-home-cli-path-defaulting."
    status: done
  - id: ws2-cycle-1-repo-ref-schema
    content: "WS2 cycle 1: schema-first additive repo_ref (origin + branch; checkout path stays machine-local) on claims/heartbeat surfaces + origin-normalisation helper, test+code in one commit."
    status: pending
    depends_on: [ws0-protocol-pdr]
  - id: ws3-cycle-1-statusline-prefix
    content: "WS3 cycle 1: statusline displays agent name WITH session_id_prefix — failing render test + product change in one commit. DONE 2026-07-05 (Cricket lifts Echo): identityPrefix on StatuslineParts (required — compile-forced at every composer); formatIdentity renders name (prefix) with the PDR-027 unknown fallback; raw name still feeds session-shape matching; the slice(0,6) derivation consolidated to one canonical sessionIdPrefix helper across its three literal sites; live adapter run renders Cricket lifts Echo (2fffa2)."
    status: done
  - id: ws4-skill
    content: "WS4 — Author the portable inter-practice-collaboration skill (SKILL-CANONICAL + .claude adapter): join ceremony checklist, foreign-substrate discipline, home declaration, alias mapping, worked example from the 2026-07-05 first instance."
    status: pending
    depends_on: [ws0-protocol-pdr]
  - id: ws5-resonance-proposal
    content: "WS5 — Post the protocol proposal to the resonance coordination substrate for its own ratification and phenotype implementation (never implemented unilaterally from oak)."
    status: pending
    depends_on: [ws0-protocol-pdr]
  - id: ws6-knowledge-flow-probe
    content: "WS6 — First cross-Practice knowledge-flow probe: read resonance's recomputable plan/team-state doctrine (its PDR-128/129) and its high-context-efficiency worker-agent material; produce an adoption assessment for oak routed to the owning surfaces. DONE 2026-07-05 (Cricket lifts Echo): .agent/reports/agentic-engineering/resonance-bundle-adoption-assessment-2026-07-05.md — §3 workers transplant (new sub-agent-estate lane), §1 proofs into ADR-200 WS2, §2 sequenced on OQ5/F-44, §4 folds into WS0b, §5 reconciles into WS0 (tier ladder answers owner gate b)."
    status: done
  - id: ws7-docs-and-gates
    content: "WS7 — Documentation propagation (worktree-hygiene rule cross-reference, agent-collaboration directive, frictions register) and full quality gates on the integrated delivery."
    status: pending
    depends_on: [ws1-cycle-1-env-override, ws2-cycle-1-repo-ref-schema, ws3-cycle-1-statusline-prefix, ws4-skill]
isProject: false
---

# Inter-Practice Collaboration Protocol

**Last Updated**: 2026-07-05
**Status**: 🟡 QUEUED (current/) — owner-approved direction, execution not started
**Scope**: Make cross-repo (cross-Practice) agent collaboration a named,
versioned protocol implemented by each repo on its own terms.

---

## NEXT SESSION — START HERE (self-contained pickup)

**Successor named by the owner: `Cricket lifts Echo`** — a SEPARATE Fable 5
session in this oak repo (its own session prefix `2fffa2`; the same session is
`Hushed Prowling Lantern` on the resonance side). It is NOT this session
continued: the session that ran this exchange (`Wolf rides Vigil` /
`Velvet Dimming Mist` / prefix `25ece9`) was downgraded Fable 5 → Opus and is
handing the exchange lane to the fresh Fable session. The successor already
registered a standby seat on the resonance stream (21:43:58Z) and adopts the
exchange lane at an explicit handoff acknowledgement (two-moments discipline).
Read this whole section before acting.

**UPDATE — 2026-07-06 (Cricket lifts Echo / `2fffa2`; lane adopted, ungated work
landed, gated work awaiting the two owner decisions).** The successor named
below DID adopt the lane (Moment-2 acknowledgement on the resonance stream) and
executed everything that does not need an owner decision. **Landed on
`feat/corpus_research_enhancements` (9 ahead of
`origin/feat/corpus_research_enhancements`, unpushed — owner push decision):**
`cf05fe95a` (WS6 adoption assessment), `f31faec62` (WS1
`PRACTICE_COORDINATION_HOME` override), `4b9683be1` (WS3 statusline
`name (prefix)` join key + `sessionIdPrefix` consolidation). Full estate suite
green at each landing. **Task 1 (WS6) DONE; task 3 PARTLY done (WS1, WS3
landed).** **What genuinely REMAINS — the two owner gates in task 2 are BOTH NOW ANSWERED
by the owner 2026-07-06** (gate a: where the PDR is born — **author it in BOTH
repos**, one coordinated cross-estate session; gate b: v1 conformance
strictness — **the five-item floor with the Tier-0-box / Tier-1-hosting
ladder**, and threading / repo_ref / statusline as version-advertised
extensions). With both gates cleared the WS0 family is UNBLOCKED and is the next
session's work (the owner has asked for its opening statement, pairing WS0 with
the WS4 join-ceremony skill authored alongside it): the WS0 family (WS0 / WS0b / WS0c / WS0e / WS0d), then WS2 (`repo_ref`,
depends WS0), WS4 (skill), WS5 (the resonance-side proposal — MAR awaits it in
resonance's incoming box after the owner's word), WS7 (docs + gates). **Exchange
claim `d0e453a3` (Hushed Prowling Lantern, resonance) was CLOSED at this
session's handoff; the lane resumes when the owner answers the two gates, by a
fresh session opening a new claim and posting an adoption event. MAR's claim
`44f0ea2c` stays open on the resonance side (their choice).** The watcher and
claim-heartbeat were torn down cleanly after a final-heartbeat-end +
team-member-closeout broadcast on the resonance stream.

**What this is.** On 2026-07-05 the owner ran the first-ever LIVE, BIDIRECTIONAL
Practice exchange: a single session (prefix `25ece9`) whose worktree was this
oak checkout and whose coordination home was a second Practice repo (the
resonance checkout — a sibling directory of this one; the owner names the exact
path at session open, so per the machine-local-path rule it is not written
here). Two agents on two living Practice estates — this session as
`Wolf rides Vigil` here / `Velvet Dimming Mist` there, and `Misty Anchoring
Rudder` (ab49a5) on the resonance side — exchanged capability in both
directions and receipted it in-session. The owner of BOTH estates is the same
person. This plan is the durable capture of that run and the queued work to
make the capability first-class.

**Why we are doing this (the impact).** The Practice is an ecosystem of
independently-evolving repos, not clones. Its whole value is horizontal
knowledge flow between estates. Today that flow only works when an expert agent
hand-carries it (this session hit six distinct friction classes doing it
manually). Making inter-Practice communication first-class means any future
agent, in any freshly-transplanted Practice repo, can join a foreign estate and
exchange safely with zero prior knowledge of it. The deeper frame: the Practice
Core already models ONE mode of estate-to-estate transfer — **transformation**
(dead material taken up at a pin: the transplant machinery). Today introduced
the second — **conjugation** (live, negotiated, bidirectional). This work
completes the Core's exchange model rather than bolting on a subsystem.

**What landed this session** (all on branch `feat/corpus_research_enhancements`,
NOT pushed, no PR yet): commits `6d4df9f69` (this plan), `8df0321ed` (the
concepts-vs-pointers layering clause 7), `c7cdf4a5f` (the first-class framing +
WS0b/c/d), plus the commit landing the shared-schema direction and this pickup
section. Napkin carries the live-run lessons. On the resonance side, this
session's inbound teaching bundle was delivered to their Practice Box, verified
by MAR, and COMMITTED into their tree; their return bundle (PDR-128/129
recomputable state, task-worker + PDR-125 verification doctrine, the
donor-exchange pattern) was delivered into oak's box — see task 1, it has
ALREADY ARRIVED and been receipted.

**The three things the next session must do, in order:**

1. **Route the inbound return bundle — it has ARRIVED and been receipted.**
   `.agent/practice-core/incoming/resonance-teaching-bundle-2026-07-05.md`
   (189 lines, untracked — successor decides commit/integration timing) is on
   disk; this session verified it well-formed and posted the receipt on the
   resonance stream, so the delivery handshake is CLOSED. What remains is WS6:
   read it first-hand and route its substance as an adoption assessment. Its
   five sections: (1) recomputable plan state / PDR-128, (2) recomputable team
   state / PDR-129, (3) zero-judgement task workers + PDR-125 adversarial
   verification with live-fire lessons, (4) the exchange pattern + neutral-
   vocabulary doctrine (portable form), (5) MAR's proposal that the protocol
   ride the plasmid as a Core PDR family with tiered conformance. Route
   recomputable-state doctrine to the plan-estate / PDR-018 surfaces and
   worker-agent + verification doctrine to the sub-agent estate. **Section 5
   CONVERGES with WS0 below** — reconcile the two proposals into ONE shared
   spec + shared schema, not competing ones. This is the plan's proof-of-value:
   knowledge flowing INTO oak.
2. **Author the canonical protocol PDR (WS0)** — portable, repo-neutral, in the
   propagating `decision-records/` set so it travels on every transplant. Then
   WS0b (name conjugation as the Core's second exchange mode on the portable
   surfaces), WS0c (conformance contract + version negotiation), WS0e (the
   SHARED SCHEMA with the version-family compat contract — owner-directed), WS0d
   (discoverability rule). The owner's two open decisions gate this: (a) where
   the canonical PDR is born — recommendation is HERE at oak, then let the
   exchange itself deliver it to resonance as its first plasmid; (b) how strict
   v1's minimum conformance is — recommendation is the five-item floor, with
   threading / repo_ref / statusline as version-advertised extensions.
3. **Build the phenotype (WS1–WS5, WS7)** — the `PRACTICE_COORDINATION_HOME`
   override (WS1), additive `repo_ref` claims (WS2), statusline name+prefix
   (WS3), the portable skill (WS4), the resonance-side proposal via their
   incoming box (WS5), docs + gates (WS7). Each is TDD, each verified first-hand.

**Coordination state to inherit.** The return-bundle receipt is already posted
(21:41:57Z) — the delivery handshake is CLOSED, nothing half-open. The
successor (`Cricket lifts Echo` / `Hushed Prowling Lantern` / `2fffa2`) has
ALREADY registered a standby seat and armed its OWN all-channels watcher on the
resonance stream (self-excluding `2fffa2`) — so it does NOT need to re-arm this
session's watcher; it adopts the exchange lane by posting an explicit
pickup/adoption event. This session's watcher (self-excluding `25ece9`, NOT
supervised) must be stopped at this handoff so it does not orphan and emit
false-liveness on the resonance stream. MAR's exchange claim `44f0ea2c` stays
open pending the successor's adoption event.

---

## Context

On 2026-07-05 the owner designated the oak primary checkout (branch
`feat/corpus_research_enhancements`) as the session worktree and the
resonance checkout as the coordination home — the first cross-Practice
arrangement. The live join worked with zero code change, and surfaced
exactly three frictions:

1. **Coordination-home resolution is repo-bound.** `resolveCoordinationHome`
   (`agent-tools/src/collaboration-state/coordination-home.ts`) resolves the
   primary checkout of the *current* git repository. A home in another repo
   requires explicit `--comms-dir`/`--active` on every call, and a relative
   path silently lands worktree-local (the F-41 hazard, now live on every
   invocation).
2. **Claims and heartbeats cannot say which repo their areas live in.** Area
   patterns and `--branch` implicitly resolve against the host repo; a claim
   on an oak branch written into resonance's registry reads as a claim on
   resonance paths.
3. **Identity names diverge per repo.** The same session env seed resolves to
   `Wolf rides Vigil` under oak's derivation and `Velvet Dimming Mist` under
   resonance's. `session_id_prefix` is the only cross-repo join key, and no
   display surface shows it next to the name.

Owner direction (2026-07-05, verbatim intent): yes to the env override, but
as part of "a genuine inter-repo protocol established, not just figuring out
how to hack the current system to work"; yes to repo qualification carrying
**two coordinates** — the git origin address and the local checkout path —
because "repo" is ambiguous across local checkouts and remotes; statusline
must display names with the session id prefix; and "we'll need an inter-repo,
or inter-Practice collaboration skill."

**Why now (the impact under the mechanism).** Resonance is producing two
capabilities directly applicable to this branch's work: high-context-
efficiency worker agents for mechanical no-judgement tasks, and recomputable
plan/team state carried in YAML frontmatter (its PDR-128/129). The protocol
is the conduit that lets that knowledge flow into oak — and lets oak's
practice flow back. WS6 exercises that flow as the plan's proof of value.

### Existing capabilities this builds on

- ADR-197: one checkout owns shared registry state — the coordination-home
  concept; this plan extends *where* that home may be, not what it owns.
- `resolveCoordinationHome` + the queued
  [`coordination-home-cli-path-defaulting`](./coordination-home-cli-path-defaulting.plan.md)
  plan (the F-41 CLI tail): every command that gains a
  `resolveCoordinationHome` default automatically honours the WS1 override
  once it lands. Composition, not overlap.
- PDR-027/PDR-076 identity tuple: `session_id_prefix` already travels on
  every signed surface; the ecosystem join key exists — it is only invisible.
- The completed intra-repo
  [`multi-agent-collaboration-protocol`](./multi-agent-collaboration-protocol.plan.md)
  estate (claims, comms events, conversations, escalations).

---

## Making It First-Class Across the Ecosystem (the framing)

"First-class in all Practice repos" cannot mean identical code everywhere —
that is the clone-pressure the ecosystem principle forbids. It means the same
thing every other Core capability means: a **portable spec that propagates on
the plasmid, a local phenotype per repo, and a conformance gate that keeps the
phenotypes interoperable** — exactly how a portable PDR becomes a per-repo ADR
today. First-classness has four load-bearing properties, and today's live run
retired the expensive uncertainty behind each:

1. **It travels by construction.** The protocol is a Core PDR in the
   propagating `decision-records/` set. A freshly-transplanted repo receives
   inter-Practice capability without re-deriving it (WS0).
2. **It is discoverable.** A portable rule fires on the cross-repo condition
   and points at the join-ceremony skill; an entry-point pointer names it. A
   fresh agent finds the ceremony without being told (WS0d).
3. **It is conformance-checkable and versioned.** A minimum contract defines
   "speaks the protocol"; each repo self-reports conformance and the version
   it speaks; the join ceremony negotiates version. The ecosystem evolves
   without lockstep (WS0c).
4. **It is mechanised at recurrence, not before.** The manual handshake
   becomes a `practice-exchange` CLI once a second exchange exists — which it
   now does (the return bundle is authoring live). Each repo generates its own
   phenotype of the CLI from the portable spec.

**The deeper reframe: conjugation is the Core exchange model's missing mode.**
The Practice Core already models one kind of horizontal transfer between
instances — *transformation*: dead material taken up at a pin, one direction,
integrated later (the transplant manifest, the incoming box, provenance
chains). Today introduced the second — *conjugation*: two live agents on two
living estates, material negotiated and receipted in-session, both directions
in one window. They are the same class (Practice-to-Practice transfer) and
share substrate (the incoming box and provenance chains serve both). So this
protocol is not a new subsystem bolted onto the Core — it *completes* the
Core's exchange model. WS0b makes that explicit on the portable surfaces.

## The Protocol (v1 design — WS0 ratifies as a PDR)

1. **Repo-reference vocabulary.** A repo reference is two coordinates:
   `origin` (normalised remote address — host/org/repo, durable and
   portable, MAY appear in tracked artefacts) and `checkout` (absolute local
   path to a specific working copy — machine-local, lives ONLY in session
   env or untracked local state per `no-machine-local-paths`). A worktree
   reference adds `branch`. Canonical pattern-string form:
   `<origin-shorthand>#<branch>`.
2. **Coordination-home declaration.** `PRACTICE_COORDINATION_HOME` names the
   home checkout root in the session environment. Resolution order
   everywhere: explicit CLI flag > `PRACTICE_COORDINATION_HOME` > git-native
   primary-checkout resolution. A declared home that does not exist or holds
   no recognisable collaboration substrate is a loud failure, never a silent
   fallback.
3. **Join ceremony.** On joining a foreign substrate: FIRST read the home
   estate's write-governance — naming/vocabulary doctrine, comms conventions,
   exchange paths — because guest writes are bound by the home's rules, not
   the guest's. Then resolve identity with the HOME repo's own derivation;
   the first comms write declares the home identity name, native-repo
   alias(es), `session_id_prefix` as the join key, the worktree
   repo-reference (origin + branch), and coordination posture. Claims opened
   on the foreign substrate carry the repo-qualified area form. Worked
   violation that ratified the first-read step: the 2026-07-05 join event
   named the home estate's Practice-donor repository directly, tripping the
   home's donor-neutrality doctrine (its PDR-127); self-reported on its
   stream the same session.
4. **Foreign-substrate discipline.** Write to a substrate only with that
   substrate's own tooling, schemas, and conventions. Reads from another
   repo's tooling are permitted only behind schema validation that refuses
   loudly on mismatch. The Practice is an ecosystem: never assume a sibling
   repo's conventions, numbering, or derivations transfer.
5. **Identity display and the join key.** Names are repo-local derivations and
   stay so (converging them is clone-pressure). Every rendered identity surface
   — statusline, comms headings, claim listings — shows
   `<name> (<session_id_prefix>)`. The **session_id_prefix is the join key**,
   and it identifies a SESSION: one session presents different names across
   estates (proven live 2026-07-05: one session was `Velvet Dimming Mist` at
   this estate and `Wolf rides Vigil` at the donor, both `25ece9`; the standby
   successor was `Hushed Prowling Lantern` / `Cricket lifts Echo`, both
   `2fffa2`). A SUCCESSOR is a NEW session — new prefix, therefore a new name in
   every estate; it is not the same prefix re-derived. (An earlier hypothesis
   that the name derives from the model was tested against the successor's
   arrival and WITHDRAWN — a new session simply has a new seed.) The anomaly
   rule: *same name + different prefix* = anomaly (surface, do not accept). A
   pre-positioning handoff event from the outgoing session authorises the
   successor; the peer verifies the successor's OWN identity tuple (its own
   prefix + cross-estate alias) at the successor's team-start, never assuming
   the outgoing prefix carries over.
6. **Adoption and versioning — shared spec AND shared schema, not shared
   code** (owner-sharpened 2026-07-05). Three distinct layers travel on the
   plasmid, each repo phenotypes only the last:
   - **Shared spec** — the portable PDR (prose contract: the clauses here).
   - **Shared schema** — a versioned, machine-readable schema of some kind for
     the cross-estate wire shapes (the comms-event fields exchange relies on,
     the claim `repo_ref`, the box-file/exchange-envelope frontmatter). It is a
     Core-carried artefact, not a per-repo re-derivation, so two estates
     validate inbound foreign material against the SAME schema and a mismatch
     is a typed refusal, not a silent misread. This is what makes the
     divergence safe rather than merely tolerated.
   - **Local code** — each repo implements its own CLI/validators against the
     shared schema. No repo implements another repo's phenotype.

   **Version-family compatibility contract.** Each repo declares the protocol
   version it speaks. Within one version family (same MAJOR), the schema
   honours **backward and forward compatibility**: additive-optional evolution
   only (a newer minor MUST parse under an older minor's validator by ignoring
   unknown-optional fields; an older minor MUST remain valid under a newer
   minor). A breaking wire change is a MAJOR bump and a new family — never a
   silent field-meaning change within a family. The join ceremony negotiates
   the family; cross-family contact is a typed refusal with an explicit
   version-mismatch message, never a best-effort parse.
7. **Exchange handshake — concepts and pointers are distinct layers**
   (owner-ratified 2026-07-05, from two live guard catches). A box file
   carries a SELF-CONTAINED concept payload: substance that needs no
   dereference, no commit pins, no moving targets — a SHA appearing in
   exchange material is the symptom of a pointer masquerading as a concept
   (material not yet re-interpreted for the receiver). The paired comms
   event carries the TIME-BOUND layer: provenance pins, sender identity,
   approval references, sequencing, the box path. The exchange lifecycle
   (delivered → acknowledged → integrated or rejected) threads on the comms
   stream via `in_response_to`; the receiver's integration ledger joins
   file ↔ event ↔ execution-time pin. The two host rule families
   (SHA-required in collaboration content; SHA-forbidden in permanent docs)
   are this one layering rule seen from its two sides.

---

## Design Principles

1. **Protocol over hack** — every mechanism here must work for the *next*
   pair of Practice repos, not just oak↔resonance.
2. **Single home per arrangement, pointer not federation** — one substrate
   owns the arrangement's coordination state; other checkouts point at it.
   No sync, no mirroring, no merge of substrates.
3. **Additive and strict** — schema changes are additive with loud
   validation at every boundary; no compatibility shims for disproven
   shapes.

**Non-Goals** (YAGNI):

- Federating or synchronising collaboration substrates across repos.
- Converging identity-name derivations across the ecosystem.
- Implementing resonance-side changes from oak (WS5 proposes; resonance
  disposes).
- Cross-machine coordination (unchanged: the substrate is per-machine).

---

## Lifecycle Triggers

> See [Lifecycle Triggers component](../../templates/components/lifecycle-triggers.md)

Executable repo plan. At execution start: open a claim on the arrangement's
coordination home (repo-qualified per protocol clause 3), update the
`agentic-engineering-enhancements` thread record, and close with
session-handoff + consolidation. The 2026-07-05 session's join event on the
resonance substrate is the standing first instance.

---

## Reviewer Scheduling

- **Pre-execution**: `assumptions-expert` (proportionality; the
  blocking/beneficial classification below), per
  `pre-execution-code-expert-review-per-loop-cycle` a `code-expert` pass on
  each WS1–WS3 diff before landing.
- **Mid-cycle**: `test-expert` and `type-expert` after each RED/GREEN pair;
  `architecture-expert-fred` on the WS2 schema additions (boundary
  discipline); `security-expert` if the env-declared home is judged a trust
  boundary during WS1.
- **Close**: `docs-adr-expert` on the PDR/ADR/skill set; `onboarding-expert`
  on the skill (it is an onboarding path for future cross-Practice agents).

---

## WS0 — Protocol PDR + oak phenotype ADR

Author the six-clause protocol above as a portable practice-core PDR (next
free number — 125 at plan-author time; re-derive at execution) and a short
oak ADR recording the host phenotype (env var name, `resolveCoordinationHome`
as the resolution point, statusline surface). ADR states WHAT; the plan owns
HOW. Acceptance: PDR + ADR land together, cross-referenced from
`agent-collaboration.md` and the `worktree-hygiene` rule; `docs-adr-expert`
review recorded.

## WS1 — Coordination-home env override (TDD)

### Cycle 1.1: `PRACTICE_COORDINATION_HOME` resolution

**Parallel-safety**: parallel-safe (file scope disjoint from WS2/WS3).

**File scope**: `agent-tools/src/collaboration-state/coordination-home.ts`,
`agent-tools/src/collaboration-state/coordination-home.unit.test.ts`.

**Test (Red)**: resolution order — explicit option wins over env; env wins
over git-native; env pointing at a missing path or a directory without a
recognisable substrate throws loudly (message names the env var); env unset
preserves current behaviour byte-for-byte. Env value is injected as a
parameter (no `process.env` reads in product code or tests — ADR-078; the
composition edge reads the environment).

**Product (Green)**: extend `resolveCoordinationHome` options with an
injected environment seam; implement the order + loud validation.

**Acceptance**: new tests pass; full agent-tools suite green; no behaviour
change when the variable is absent.

**Deterministic validation**:

```bash
pnpm --filter @oaknational/agent-tools test -- coordination-home
pnpm test
```

## WS2 — Repo-qualified claims and heartbeats (schema-first, TDD)

### Cycle 2.1: additive `repo_ref` + origin normalisation

**Parallel-safety**: sequenced after WS0 (the PDR fixes the vocabulary).

**File scope**: collaboration-state schema files + their validators,
`claims open`/`heartbeat` option wiring, new
`repo-ref.ts` + unit tests alongside.

**Test (Red)**: origin normalisation (ssh/https/`.git`-suffix forms of the
same remote normalise to one `host/org/repo` shorthand); claims accept an
optional `repo_ref` (`origin`, `branch`) and serialise it; heartbeat branch
accepts the repo-qualified form; `checkout` paths are REJECTED in tracked/
archivable payloads (the `no-machine-local-paths` boundary enforced by the
validator, not by convention).

**Product (Green)**: additive schema bump + validators that recompute (never
just record) the normalised origin.

**Acceptance**: schema validation suite green; a claim written with
`repo_ref` round-trips through `claims list/show`; full suite green.

## WS3 — Statusline shows the join key (TDD)

### Cycle 3.1: `<name> (<prefix>)` render

**Parallel-safety**: parallel-safe.

**File scope**: `agent-tools/src/claude/statusline-identity.ts` (+ its
test); coordinate with the queued statusline plans at execution — if either
has landed first, this cycle lands as an amendment inside their shape, not a
competing one.

**Test (Red)**: identity segment renders name + prefix; missing prefix
renders `unknown` per PDR-027.

**Acceptance**: render test green; visual check in a live session recorded
in the PR; full suite green.

## WS4 — The inter-practice-collaboration skill

Portable `SKILL-CANONICAL.md` (+ `.claude` adapter via the adapter
generator): when to fire (any session whose worktree and coordination home
are in different repos), the join ceremony checklist, foreign-substrate
discipline, home declaration mechanics, alias declaration, and the worked
2026-07-05 first instance. Acceptance: skill validates under
`validate-subagents`/adapter checks; `onboarding-expert` review recorded;
resonance can transplant it unchanged except for host-phenotype notes.

## WS5 — Resonance-side proposal

Route the proposal per resonance's OWN inbound-exchange path (its session
plan Part A.5, read first-hand 2026-07-05): the protocol material lands in
its `.agent/practice-core/incoming/` donor-exchange box, with a comms event
as the pointer — never writes into its live plan/memory surfaces. Signed
with its identity derivation, donor-neutral vocabulary throughout (its
PDR-127). Content: the PDR text, the env-var contract, the statusline
clause, and the ask that resonance ratify its own phenotype. Acceptance:
material in the incoming box + rendered pointer event; disposition is
resonance's (its team treats inbound integration as consolidation work, not
an interrupt).

## WS6 — Knowledge-flow probe (the proof of value)

Read resonance's recomputable plan/team-state doctrine (its PDR-128/129 and
the plan-estate re-founding work) and its high-context-efficiency
worker-agent material — its `task-worker` subagent class (Sonnet-5,
Read/Grep/Glob only, zero-judgement briefs with refusal clauses), its
PDR-125 (adversarial verification of delegated work: format conformance →
count parity → sampled byte-fidelity → absence re-derivation), and the
live-fire record at its `.agent/memory/operational/task-worker-feedback.md`
— first-hand from its checkout. Produce an adoption assessment for oak —
what transplants, what needs an oak phenotype, what we decline and why —
routed to the surfaces that own those concerns (plan templates/PDR-018
estate for recomputable state; sub-agent estate for worker agents).
Acceptance: assessment exists, names concrete next lanes or a reasoned
decline per capability, and cites the resonance sources by path.

## WS7 — Documentation propagation + quality gates

Cross-reference sweep (`agent-collaboration.md`, `worktree-hygiene`,
frictions register entry for the cross-repo class), then the canonical
aggregate gate:

```bash
pnpm clean && pnpm build && pnpm type-check && pnpm format:root && \
pnpm markdownlint:root && pnpm lint:fix && pnpm test
```

---

## Proof Contract

| Acceptance id | Level | Proof |
|---|---|---|
| ws0-protocol-pdr | non-code | PDR + ADR files exist, cross-referenced; docs-adr-expert verdict recorded |
| ws1-cycle-1-env-override | unit | named vitest file green + full suite green |
| ws2-cycle-1-repo-ref-schema | unit | schema/validator tests green + round-trip via CLI |
| ws3-cycle-1-statusline-prefix | unit + value-proxy | render test green + live-session screenshot in PR |
| ws4-skill | non-code | adapter/validator gates green; onboarding-expert verdict |
| ws5-resonance-proposal | non-code | rendered event in resonance's shared log |
| ws6-knowledge-flow-probe | non-code | assessment doc landed, sources cited by path |
| ws7-docs-and-gates | integration | aggregate gate exit 0 |

Completion language (`READY`, `COMPLETE`) is valid only when every id above
is proven.

---

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Env-declared home points somewhere stale/wrong and coordination silently fragments | WS1 loud validation (existence + substrate shape); never a silent fallback |
| Machine-local checkout paths leak into tracked/archived artefacts | WS2 validator rejects `checkout` in persistable payloads; origin-only in tracked forms |
| Schema drift between repos breaks cross-reads | Clause 4: reads validate and refuse loudly; writes always via home tooling |
| Statusline WS collides with the two queued statusline plans | WS3 coordination note: land inside whichever shape is live at execution |
| Unilateral resonance changes violate its team's conventions | WS5 is proposal-only, routed via its incoming box; disposition is resonance's |
| Guest writes trip home-estate governance the guest has not read (live instance: donor-naming in the 2026-07-05 join event vs resonance's PDR-127) | Join-ceremony first-read step (clause 3); self-report on the home stream when tripped |
| Plan-body drift from live CLI shapes | Re-derive exact option names against the live CLI at each cycle start (plan-body first-principles check) |

## Plan-body first-principles check

Fires at WS2 (do not trust the option/flag names written here — re-derive
against the live CLI) and WS3 (re-derive the statusline file layout against
the landed state of the queued statusline plans).

## Foundation Alignment

> See [Foundation Alignment component](../../templates/components/foundation-alignment.md)

Strict-and-complete: loud validation at every new boundary (WS1, WS2).
First question applied: the zero-code alternative (always run the home
repo's CLI from its checkout) was weighed and kept as the WRITE-side
discipline (clause 4); the env override exists for the session-native
read/watch/statusline surfaces that cannot cd elsewhere. Schema-first:
WS2 changes begin at the schema and flow outward.

## Dependencies

**Blocking**: none — first cycle can start immediately.

**Beneficial**:

- [`coordination-home-cli-path-defaulting`](./coordination-home-cli-path-defaulting.plan.md)
  — every command it defaults inherits the WS1 override. Minimum shippable
  shape without it: explicit flags keep working; the override reaches only
  the commands already routed through `resolveCoordinationHome`.
- Resonance ratification (WS5) — beneficial for the *ecosystem*; oak's
  phenotype ships regardless (ship-independent, coordinate-dependent).

## Consolidation

On completion run `/oak-consolidate-docs`; the napkin already carries the
2026-07-05 first-instance lessons for graduation.
