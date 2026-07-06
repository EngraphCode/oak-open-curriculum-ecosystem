# Session opener — Author the inter-Practice collaboration protocol PDR (WS0 family) + its paired join-ceremony skill (WS4), across BOTH estates

> Pasteable opener. Authored 2026-07-06 (Cricket lifts Echo) at the owner's
> request, at the close of the first live bidirectional Practice exchange. Both
> owner gates are answered and baked in below; the WS0 family is unblocked. The
> controlling plan is
> `.agent/plans/agent-tooling/current/inter-practice-collaboration-protocol.plan.md`.

You are the authoring session for the canonical inter-Practice collaboration
protocol. Two agents on two living Practice estates ran the first live
bidirectional exchange (2026-07-05→06); the phenotype landed (coordination-home
override, statusline join key) and the inbound knowledge was assessed. Your job
is to write the DOCTRINE and its ENACTMENT so any future agent, in any freshly
transplanted Practice repo, can join a foreign estate and exchange safely with
zero prior knowledge of it.

## Hold this correctly (metacognition — generative mode)

This is not "write a PDR." It is the constitutional document of the Practice
network's communication layer — wide-impact and load-bearing. The PDR is portable
DOCTRINE; the paired skill is its ENACTMENT. Doctrine without a runnable enactment
is passive guidance that loses at the action moment — a cold agent will not
re-derive a ceremony from a decision record — so the skill is not an afterthought,
it is what makes the PDR FIRE. Author the two together, as one artefact in two
forms.

## The problem (reason — frame, not solution)

Horizontal knowledge flow between independently-evolving Practice estates is the
whole value of the network, yet today it only works when an expert agent
hand-carries it (the live run hit six friction classes doing it manually). A cold
agent can join safely IFF: (a) it DISCOVERS the ceremony without being told; (b)
the ceremony is a RUNNABLE skill; (c) the doctrine it enacts is PORTABLE and
VERSIONED so estates evolve without lockstep. The PDR + skill deliver (b) and (c);
WS0d delivers (a). Frame every design choice against those three.

## Owner decisions — SETTLED, author to them (recorded 2026-07-06)

- Birthplace: author the PDR in BOTH estates in this one coordinated cross-estate
  session — not oak-first-then-transplant. The live exchange is the proof the two
  copies agree.
- v1 minimum conformance: the five-item floor + tier ladder. Tier-0 is the
  incoming box plus the concepts-vs-pointers layering guard. Tier-1 is a threadable
  comms substrate, identity-with-prefix, and a declared coordination-home.
  Threading, `repo_ref`, and statusline are version-advertised EXTENSIONS, not
  floor.

## Read first (self-contained grounding — do not start authoring until read)

1. Controlling plan:
   `.agent/plans/agent-tooling/current/inter-practice-collaboration-protocol.plan.md`
   — the NEXT SESSION section (2026-07-06 UPDATE block), the Protocol v1 design,
   and the WS0/WS0b/WS0c/WS0e/WS0d + WS4 workstreams.
2. WS6 adoption assessment:
   `.agent/reports/agentic-engineering/resonance-bundle-adoption-assessment-2026-07-05.md`
   — §5 reconciles the two proposals into ONE shared spec; the tier ladder is the
   recorded answer to conformance strictness.
3. Inbound bundle:
   `.agent/practice-core/incoming/resonance-teaching-bundle-2026-07-05.md`
   — the return-bundle §5 (protocol rides the plasmid as a Core PDR family with
   tiered conformance) CONVERGES with oak's own design. Author ONE shared shape,
   not two competing ones.
4. The `agentic-engineering-enhancements` thread record's INTER-PRACTICE EXCHANGE
   LANE section and the exchange-lane napkin entries (identity join-key;
   watcher-is-a-writer; ARC-is-fast-not-durable).

## Deliverables (author together; TDD/reviewed where there is code)

- WS0 — the portable PDR. Repo-neutral, in the propagating decision-records set of
  BOTH estates so every future transplant receives it by construction. Frames
  conjugation as the Core exchange model's SECOND mode alongside transformation.
  Clauses: repo-reference vocabulary (origin + checkout coordinates);
  coordination-home declaration (explicit flag, then declared home, then
  git-native; loud failure, never silent fallback); join ceremony;
  foreign-substrate discipline (home tooling for ALL writes, liveness files
  included — "a watcher is a writer"); identity display `<name> (<prefix>)`;
  adoption/versioning; the exchange handshake (concepts-vs-pointers layering). Plus
  the oak ADR phenotype note and the resonance phenotype note (local, one per
  estate).
- WS4 — the join-ceremony SKILL, paired with the PDR. The runnable enactment: what
  an agent DOES on joining a foreign estate — read the host's write governance
  FIRST, declare the coordination home, register identity with prefix, arm a
  `[HEARTBEAT]`-filtered watcher (now the default — see below), post an adoption
  event, use home tooling for every write. Portable; rides the plasmid alongside
  the PDR. It is the firing mechanism for WS0's doctrine — a cold read of it must
  be enough to run the ceremony without the PDR open.
- WS0b — amend the Core exchange model (`practice-lineage.md` / `practice.md`
  portable surfaces) to name the two modes (transformation + conjugation), their
  shared substrate, and complementary lifecycles.
- WS0c — the conformance contract (the five-item floor + Tier-0/Tier-1 ladder,
  decided) plus a self-reporting conformance/version check; each repo declares the
  protocol version it speaks; the join ceremony negotiates version.
- WS0e — the SHARED SCHEMA: versioned machine-readable wire shapes
  (exchange-relevant comms-event fields, claim `repo_ref`, exchange-envelope /
  box-file frontmatter), Core-carried; version-family compat (within one MAJOR,
  additive-optional only; cross-family contact is a typed refusal, never
  best-effort parse). The live run produced a worked instance: a strict validator
  refused an unknown field rather than ignoring it — that IS the compat contract
  firing; cite it.
- WS0d — discoverability: a portable rule that FIRES on the cross-repo condition
  (worktree-repo != coordination-home-repo, or joining any foreign substrate)
  pointing at the WS4 skill, plus an entry-point pointer, both in the propagating
  Core set.

## Cross-estate authoring model + coordination

- This session works across BOTH checkouts. The owner names the resonance path at
  session open — do NOT write any machine-local path into a tracked file (the
  no-machine-local-paths rule + write-hook are absolute).
- Register on the `agentic-engineering-enhancements` thread, open a fresh claim on
  the inter-practice-exchange lane, and arm a `[HEARTBEAT]`-FILTERED watcher — the
  resonance owner canonicalised filtered-by-default on 2026-07-06 (resonance commit
  `021fe93` in the shared rule `comms-all-channels-watcher.md`). Oak's copy of that
  portable rule should reconcile to it, and that reconciliation is itself a
  WS0b/WS0d conjugation item (doctrine flowing INTO oak — the protocol's own proof
  of value). Coordinate with the resonance seat the owner names (a standby seat is
  holding there).
- Everything you author into resonance's tracked / travelling content stays
  DONOR-NEUTRAL (their PDR-127 — never name the donor repo/org/product; use "the
  Practice donor"). The PDR is repo-neutral by construction, which is what makes it
  portable.

## Acceptance (prove the warrant's falsifier — don't assert it)

- The PDR exists in BOTH estates' propagating decision-record sets, and a
  cross-estate diff shows the two copies are the SAME portable artefact modulo the
  local phenotype notes. If they diverge, "portable spec" is false — this is the
  load-bearing proof, not a formality.
- The WS4 skill exists in both estates; a cold read of it runs the join ceremony
  without the PDR open.
- WS0c's conformance check self-reports each estate at its tier and version.
- WS5 (the resonance-side proposal into their incoming box) is delivered last, as
  the receipt that the loop closed both ways; the resonance successor seat awaits
  it.
- Reviewer scheduling per the plan §Reviewer Scheduling; TDD where there is code
  (WS0c check, WS0e schema); WS7 docs + quality gates green.

## Guards (absolute)

No `--no-verify` without fresh per-invocation owner authorisation. Home tooling for
every write into a foreign substrate. PDR→ADR: the portable PDR travels, a local
phenotype per estate. No machine-local paths in tracked content. Treat the felt
urge to wrap up as the tripwire to slow the last moves — the completion-drive
window is exactly where the fluent-but-wrong move fires.
