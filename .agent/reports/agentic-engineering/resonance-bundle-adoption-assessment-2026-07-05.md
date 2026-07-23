# Resonance teaching-bundle adoption assessment (WS6, 2026-07-05)

The knowledge-flow probe of the
[inter-Practice collaboration protocol plan](../../plans-backlog-2026-07/agent-tooling/current/inter-practice-collaboration-protocol.plan.md)
(WS6): the adoption assessment of the five-section return bundle received in
the first live bidirectional Practice exchange. Authored by Cricket lifts Echo
(`2fffa2`), successor lane holder, from a first-hand read of
the bundle (`resonance-teaching-bundle-2026-07-05.md`, integrated and cleared
from the practice box 2026-07-23 — content in git history)
(committed at `06542b84e`). The bundle is deliberately pin-free per the
exchange layering clause; every implementation named below is **re-sourced
from the sibling estate's HEAD at port time**, with pins recorded in the
porting lane's own ledger then — resonance paths in the bundle are
concept-anchors, not live dependencies.

Verdict vocabulary: **transplant** (adopt with an oak phenotype),
**fold** (substance belongs inside an existing oak lane, not a new one),
**sequenced** (adopt when a named gate clears), **decline** (with reason).

## §1 Recomputable plan state — adopt the concept into the idea-graph schema; decline the standalone prose-plan tool

The principle — recorded state is a cache; every claim binds to a
recomputation procedure; the gate goes red in **both** divergence directions —
is already oak doctrine at rule level
([`validators-must-recompute-not-just-record`](../../rules/validators-must-recompute-not-just-record.md)),
and oak plans already carry hand-checked Proof Contract tables. What oak
lacks is exactly what §1 supplies: the **closed six-kind typed-proof shape**
(`artifact` / `gate` / `probe` / `git-fact` / `ratified` / `attested`) and
mechanical recomputation over it.

A straight port of the plan-side tool is **declined**: oak's planning estate
is mid-rewrite onto the living idea-graph
([ADR-200](../../../docs/architecture/architectural-decisions/200-intent-as-a-living-idea-graph.md)),
whose WS2 (idea-node JSON Schema + id-minting) is the owner's named next
step. Tooling recomputation over prose plans now would tool the shape being
replaced. Instead the six-kind proof shape, the forcing function (an
acceptance criterion that resists proof-typing is thereby exposed as
under-specified — sharpen or mark `attested`, never silence), the
`attested`-count as a quality signal, and **both-directions redness** —
especially `recorded-pending-but-green`, the unclosed-completion direction
oak has lived (this window's drain kept finding "pending" surfaces that had
shipped) — route into the **ADR-200 WS2 schema design** as the proof-typing
of acceptance/realisation fields, with recomputation as a graph-side
validator. Mutation probes (a deliberately falsified status must go red)
belong in that validator's test contract from day one.

Downstream once proofs are typed:
[PDR-026](../../practice-core/decision-records/PDR-026-per-session-landing-commitment.md)
landing targets name proof ids and the close-of-session report recomputes
them — the ritual upgrades from self-certified to gate-checked. Sequenced on
WS2, not adoptable before it.

## §2 Recomputable team state — decision input to the claims/OQ5 lane; the join key adopts when claims integration resumes

§2 joins three substrates, each trusted only for what it can witness (plan
todos+proofs, committed; the live claims registry, never history; git
facts) with a **plan-todo pointer on every implementer claim** as join key,
plus checked drift invariants (no open claim on a recomputed-done todo; no
orphaned `in_progress` todo; lane progress = N-of-M proofs green).

Oak cannot adopt this unilaterally now: the corrected claims model's code
integration is explicitly **owner-gated on OQ5 composed-liveness**, and the
join key presupposes §1's typed proofs. But §2 is a direct answer *shape*
to oak's named live defect — **F-44 freshness ≠ liveness** — precisely
because it composes liveness from what each plane can witness instead of
trusting registry freshness. Verdict: **sequenced** — route as decision
input to the team-tooling synthesis phase's F-44 do-first item and the
[PDR-117](../../practice-core/decision-records/PDR-117-director-and-implementer-roles.md)
expansion agenda, where the worktree-per-agent verdict is being weighed.
The rendered-views-over-recomputation clause (prose team surfaces become
views; hand prose only for what no substrate witnesses, labelled asserted)
should be weighed there too — it is the structural cure for the
hand-maintained continuity-table drift class.

## §3 Zero-judgement workers + adversarial verification — transplant; the strongest immediate candidate

Oak already runs narrow schema-forced workflow agents (the corpus-analysis
mapper/voter/reducer family) but has **no `agent_class` discriminator, no
generator-enforced tools allowlist, no refusal-clause brief convention, and
no standing verification protocol for delegated replies**. §3 supplies all
four, and it composes with — rather than colliding with — existing oak
doctrine:
[PDR-122](../../practice-core/decision-records/PDR-122-agentic-judgment-pipelines.md)
(atomic judgment, deterministic aggregation),
[`agentic-judgment-conserve-by-default`](../../rules/agentic-judgment-conserve-by-default.md)
(workers are the conserve-by-default cheap route made *safe*), and
[`verify-dont-trust`](../../rules/verify-dont-trust.md) (the four-step
reply verification — format conformance, count parity, sampled
byte-fidelity, absence re-derivation — is that rule applied to delegated
work; "a worker's *not found* is a claim about its search, never about the
world" belongs beside it verbatim).

Concrete lane (a sub-agent-estate plan, TDD, re-sourced from the sibling
estate at port time):

1. `agent_class` discriminator on the sub-agent source of truth +
   generator: default `reviewer`, **byte-identical regeneration of every
   existing definition as the landing proof** (default-inert — exactly
   oak's additive-strict style); `worker` renders a cheap-model agent with
   an explicit tools allowlist.
2. Class-aware validation in `subagents:check`: tool-name membership;
   forbid a lean worker loading full estate doctrine. Safety facts carried
   verbatim: an omitted tools list inherits ALL tools; a shell is a
   universal capability, never "read-only"; zero-tools is valid.
3. The brief discipline (decision-complete: one mechanical verb, named
   file scope, exact output format, completeness and verbatim-fidelity
   clauses, and the REFUSAL clause — `JUDGEMENT-REQUIRED` means the task
   was mis-designed; pull it back, never re-word) as the worker-brief
   reference/skill.
4. The two doctrine clauses (*acceptance means verified, never reported*;
   *verification authority follows what the verifier can see* — plus the
   clean-bill corollary: adversarially challenge the negatives, not only
   verify the positives) as a PDR-122 amendment or sibling portable PDR —
   the docs-adr pass at that lane decides which.

## §4 Exchange pattern + neutral vocabulary — fold into WS0/WS0b

Oak already runs the Box and the transformation machinery; §4's operational
detail — receipt discipline (verify well-formedness + vocabulary + layering
first-hand; receipt on the shared stream; **declared normalisation** when
receiving gates require reformatting — concepts travel, not bytes), the
two-moment checks (session start alerts; consolidation integrates;
clear-only-after-integration), and concept-level bidirectional comparison
(Practice evolution is not linear) — is WS0b's conjugation-mode substance,
not a separate adoption. The neutral-vocabulary doctrine in portable form
joins the propagating Core set so every future transplant carries it from
day one; oak itself carries no reciprocal donor constraint (the asymmetry
is explicit and correct, per §5's vocabulary layer). The join-ceremony
first-read rule this exchange taught is already ratified as protocol
clause 3.

## §5 Protocol proposal — reconcile into WS0: one shared spec + schema

Convergence confirmed; §5 changes two things in the plan's current draft:

1. **Tiered participation answers owner gate (b).** The five-item
   conformance floor and §5's tiers reconcile cleanly: **Tier 0** = the Box
   + the concepts-vs-pointers layering guard (material exchange; every
   Practice repo qualifies with zero tooling); **Tier 1** = comms substrate
   + identity-with-prefix + declared coordination home (can host visiting
   sessions); threading / `repo_ref` / statusline stay version-advertised
   extensions above the tiers. Recommendation to the owner: adopt the tier
   ladder as v1 conformance.
2. **Adoption support is proof-typed** (§1 applied to WS0c): box path =
   `artifact`, watcher assertion = `gate`, protocol record present =
   `artifact` — "speaks the protocol" becomes recomputable, never asserted.
   WS0c's conformance self-report upgrades accordingly.

§5's proportionality guard — two estates is exactly the second-consumer
moment that justifies canonicalising NOW; discovery, directories, and
N-party topology wait for a third estate — matches oak's
consolidate-at-second-consumer rule and enters the protocol record as a
named non-goal boundary.

## Evidence appendix — live join-ceremony instances from this session (for WS0/WS0e)

Durable home for what today's join added to the evidence set, so the
protocol-record work reads it here rather than from the stream:

- **Pre-positioning asserts future facts.** The handoff pre-positioning
  told the host the successor arrives as "Cricket lifts Echo (Opus) under
  the 25ece9 prefix"; the truth (new session: prefix `2fffa2`, Fable) was
  only provable at the successor's own team-start. Join ceremony: successor
  details in pre-positioning are hypotheses; names AND prefixes both change
  across succession; the durable join is the handoff record, not any
  identity-tuple field.
- **Platform vocabulary diverges on one stream** (`claude` /
  `claude_code` / `claude-code` all observed): the identity layer pins one
  canonical value with normalising reads.
- **A watcher is a writer.** A guest watcher's heartbeat/seen files are
  writes into the home substrate: my donor-CLI watcher's heartbeat carried
  `watcher_identity.naming_schema_version`, the host's strict schema
  refused it, and the host's claims-open backstop correctly classified me
  blind-to-comms. Cure: home tooling for ALL writes, liveness files
  included. Twice-corroborated (the predecessor's watcher used the host
  binary and never tripped).
- **Live version-family instance.** The refusal was a strict validator
  rejecting an unknown field rather than ignoring additive-optional — the
  exact backward/forward-compat contract the shared schema (WS0e) must
  encode, observed in production on day one. The wire-shape inventory must
  include comms events, claims, box-file/envelope frontmatter, AND the
  watcher heartbeat/seen files.

## Routing summary

| Bundle § | Verdict | Owning oak surface / next lane |
| --- | --- | --- |
| §1 plan proofs | Adopt concept; decline prose-plan tool | ADR-200 WS2 idea-node schema (proof-typing + recomputation validator); PDR-026 upgrade sequenced after |
| §2 team state | Sequenced (OQ5 + §1 gate) | Team-tooling synthesis phase F-44 do-first item; PDR-117 expansion agenda |
| §3 workers + verification | Transplant | New sub-agent-estate lane (agent_class, allowlists, brief discipline, verification doctrine) |
| §4 exchange + vocabulary | Fold | Protocol plan WS0/WS0b; portable neutral-vocabulary record into the Core set |
| §5 protocol proposal | Reconcile | Protocol plan WS0/WS0c/WS0e — one shared spec + schema; tiers answer owner gate (b) |

Acceptance (plan §Proof Contract, `ws6-knowledge-flow-probe`): this
assessment exists, names a concrete next lane or a reasoned decline per
capability, and cites the sibling-estate sources by the bundle's
concept-anchor paths (its PDR-125/127/128/129 and worker material, §§1–5
above).
