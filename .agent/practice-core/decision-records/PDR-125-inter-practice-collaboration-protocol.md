---
pdr_kind: governance
---

# PDR-125: The Inter-Practice Collaboration Protocol

**Status**: Accepted (authored 2026-07-06 in one coordinated
cross-estate session, per the owner's birthplace ruling: the same
portable text lands in both estates' propagating decision-record sets
in the same window; a cross-estate diff proving the copies identical
modulo the local phenotype note is the acceptance proof). Amended
2026-07-08 (the v1 clause-conservation batch: the six registered
founding clauses folded into clauses 3, 5, and 7; the both-estates
innovation posture added to clause 6; both estates in one window,
cross-estate diff re-proven).
**Date**: 2026-07-06
**Related**: PDR-005 (transplantation and provenance), PDR-024
(vital integration surfaces and outbound routing), PDR-027 (identity
and session prefixes), the `practice-lineage.md` §Plasmid Exchange
portable surface (the exchange model this protocol completes), and
the paired join-ceremony skill (`inter-practice-collaboration`) —
this PDR's runnable enactment. The host phenotype ADR mirrors this
record; the agent-tooling lane's controlling plan owns the HOW.

## Preamble — why this protocol exists

> Two peer Practice estates, evolving independently, converge on the
> same knowledge-maintenance mechanisms because they are two instances
> of one underlying structure: **the verification-scarce testimony
> economy** — maintaining warranted belief among many cheap, fallible,
> ephemeral producers whose failure mode is confident fabrication, over
> one external record that is their only shared memory, under one
> scarce authority. Every mature human institution for keeping
> knowledge trustworthy — double-entry bookkeeping, the scientific
> method, the database, distributed consensus, the bureaucratic office,
> the control-system observer — is a domain-specific instance of the
> solution to that problem. The inter-Practice protocol exists because
> horizontal exchange between estates is **recombination**: the
> anti-ratchet mechanism by which two error-accumulating lineages
> repair each other's drift and keep converging on truth. That is why
> the exchange is a first-class standing relationship, not a one-off
> transfer.

## Context

The Practice is an ecosystem of independently-evolving repos, not
clones. Its whole value is horizontal knowledge flow between estates,
and until 2026-07-05 that flow worked only when an expert agent
hand-carried it: the first live bidirectional exchange hit six distinct
friction classes doing it manually. The Practice Core already modelled
ONE mode of estate-to-estate transfer — **transformation** (dead
material taken up at a pin: the transplant machinery, the incoming
box, provenance chains). The live run introduced the second —
**conjugation** (two live agents on two living estates, material
negotiated and receipted in-session, both directions in one window).
The two modes are one class and share substrate; this protocol
completes the Core's exchange model rather than bolting on a
subsystem.

A cold agent can join a foreign estate safely if and only if: (a) it
DISCOVERS the ceremony without being told (the discoverability rule);
(b) the ceremony is a RUNNABLE skill (the paired join-ceremony skill);
(c) the doctrine it enacts is PORTABLE and VERSIONED so estates evolve
without lockstep (this PDR and its conformance ladder). Every clause
below serves one of those three.

## Decision — the protocol clauses

1. **Repo-reference vocabulary.** A repo reference is two coordinates:
   `origin` (normalised remote address — host/org/repo — durable,
   portable, MAY appear in tracked artefacts) and `checkout` (absolute
   local path to a specific working copy — machine-local, lives ONLY in
   session environment or untracked local state, per the
   no-machine-local-paths rule). A worktree reference adds `branch`.
   Canonical pattern-string form: `<origin-shorthand>#<branch>`.

2. **Coordination-home declaration.** One substrate owns an
   arrangement's coordination state; other checkouts point at it —
   pointer, never federation. `PRACTICE_COORDINATION_HOME` names the
   home checkout root in the session environment. Resolution order
   everywhere: explicit CLI flag, then `PRACTICE_COORDINATION_HOME`,
   then git-native primary-checkout resolution. A declared home that
   does not exist or holds no recognisable collaboration substrate is
   a loud failure, never a silent fallback.

3. **Join ceremony.** On joining a foreign substrate: FIRST read the
   home estate's write governance — naming and vocabulary doctrine,
   comms conventions, exchange paths — because guest writes are bound
   by the home's rules, not the guest's. Then resolve identity with
   the HOME repo's own derivation; the first comms write declares the
   home identity name, native-repo alias(es), the `session_id_prefix`
   as the join key, the explicit `platform` and `model` registration
   values (clause 5 — never inferred), the worktree repo-reference
   (origin + branch), and coordination posture. Claims opened on the foreign substrate carry
   the repo-qualified area form. Worked violation that ratified the
   first-read step: the 2026-07-05 join event named the home estate's
   Practice-donor repository directly, tripping the home's
   donor-neutrality doctrine; self-reported on its stream the same
   session. **Naming constraints are asymmetric by design**: the home's
   vocabulary doctrine may forbid names the guest's own tree uses
   freely (one estate's tree may name the other while the reverse is
   forbidden); the guest learns the asymmetry from the home's rules,
   never assumes symmetry. **A session's cwd is a coordinate, not a
   boundary**: estate governance binds WRITES and MERGES to each
   estate's gates, while AUTHORSHIP is unrestricted for any session
   under this ceremony — being "based in" an estate is a working-copy
   fact, not an access boundary.

4. **Foreign-substrate discipline — a watcher is a writer.** Write to
   a substrate only with that substrate's own tooling, schemas, and
   conventions — liveness files included: a guest watcher's heartbeat
   and seen-files are writes into the home substrate (worked instance:
   a guest watcher run with the guest's own CLI emitted a heartbeat
   field the home's strict schema refused, and the home's
   claims-open backstop correctly classified the guest blind to
   comms). Reads through another repo's tooling are permitted only
   behind schema validation that refuses loudly on mismatch. The
   Practice is an ecosystem: never assume a sibling repo's
   conventions, numbering, or derivations transfer.

5. **Identity display and the join key.** Identity names are
   repo-local derivations and stay so (converging them is
   clone-pressure); **each estate derives its name from the session
   SEED alone** — never from model, platform, or any other session
   property — which is exactly why one seed yields sovereign
   per-estate names joined by the prefix. An owner-assigned or
   operator-overridden `agent_name` outranks derivation (as in each
   estate's own identity contract); the override is declared as an
   override at registration, and the prefix join key binds unchanged. Every rendered identity
   surface — statusline, comms headings, claim listings — shows
   `<name> (<session_id_prefix>)`. The **session_id_prefix is the join
   key**, and it identifies a SESSION: one session presents different
   names across estates. A SUCCESSOR is a NEW session — new prefix,
   therefore a new name in every estate. The anomaly rule: same name
   with a different prefix is an anomaly — surface it, do not accept
   it. A pre-positioning handoff event from an outgoing session
   authorises a successor, but **ALL pre-positioned successor details
   are hypotheses** — the identity tuple, the seating, the timing, the
   commissioned scope: the peer verifies the successor's OWN
   registration at the successor's team-start, never assuming any
   pre-positioned detail carries over. Platform vocabulary diverges on
   one stream (three spellings of one platform observed live); the
   identity layer pins one canonical value with normalising reads, and
   **`platform` and `model` are explicit registration fields, never
   inferred** — a registration that omits them is incomplete, and a
   reader that guesses them from context re-introduces the divergence
   the pinning exists to cure.

6. **Adoption and versioning — shared spec AND shared schema, never
   shared code.** Three layers travel on the plasmid; each repo
   phenotypes only the last:
   - **Shared spec** — this portable PDR (the prose contract).
   - **Shared schema** — a versioned, machine-readable schema for the
     cross-estate wire shapes: the comms-event fields exchange relies
     on, the claim `repo_ref`, the box-file / exchange-envelope
     frontmatter, AND the watcher heartbeat/seen files (the live run
     proved liveness files are wire surfaces too). Core-carried, so
     two estates validate inbound foreign material against the SAME
     schema and a mismatch is a typed refusal, never a silent misread.
   - **Local code** — each repo implements its own CLI and validators
     against the shared schema. No repo implements another repo's
     phenotype.

   **Version-family compatibility contract.** Each repo declares the
   protocol version it speaks. Within one version family (same MAJOR),
   the schema honours backward and forward compatibility:
   additive-optional evolution only — a newer minor MUST parse under
   an older minor's validator by ignoring unknown-optional fields; an
   older minor MUST remain valid under a newer minor. A breaking wire
   change is a MAJOR bump and a new family — never a silent
   field-meaning change within a family. The join ceremony negotiates
   the family; cross-family contact is a typed refusal with an
   explicit version-mismatch message, never a best-effort parse. The
   founding worked instance is the live 2026-07-05 heartbeat refusal
   named in clause 4: a strict validator refusing an unknown field IS
   this contract firing.

   **Both-estates innovation posture (owner ruling 2026-07-07).**
   Wherever possible, innovations and improvements to the shared
   machinery apply to BOTH estates. Every innovation carries a
   per-item twin disposition, recorded where the innovation lands:
   `twinned-in-window` (both estates in one window, diff-proven),
   `already-present-verify-parity`, `their-lane-owns-coordinate`
   (the peer's own lane lands it; coordinate, don't duplicate), or
   `impossible-with-named-reason`. The falsifier for the posture is
   drift observed at the next exchange turn: three documented drift
   instances (a detector below its resolver, a quote-style anchor, a
   citation-port miss) are the reconverge cost this posture removes.

7. **Exchange handshake — concepts and pointers are distinct layers.**
   A box file carries a SELF-CONTAINED concept payload: substance that
   needs no dereference, no commit pins, no moving targets — a SHA
   appearing in exchange material is the symptom of a pointer
   masquerading as a concept (material not yet re-interpreted for the
   receiver). The paired comms event carries the TIME-BOUND layer:
   provenance pins, sender identity, approval references, sequencing,
   the box path. The exchange lifecycle (delivered → acknowledged →
   integrated or rejected) threads on the comms stream; the receiver's
   integration ledger joins file ↔ event ↔ execution-time pin. The two
   host rule families (SHA-required in collaboration content;
   SHA-forbidden in permanent docs) are this one layering rule seen
   from its two sides. **Format-normalise on receipt**: inbound
   material is normalised to the RECEIVING repo's format — markdown
   conventions, heading shapes, gate-satisfying style — with the
   normalisation declared in the integrating commit body; concepts
   travel, never bytes, and a receipt that preserves foreign
   formatting verbatim is an integration not yet finished.
   **Corrections are new events**: an exchange artefact or lifecycle
   event is never rewritten in place — a correction is a NEW event (or
   a new box delivery) threading to its antecedent, so both estates'
   records stay append-honest and a correction survives archive
   rotation exactly like the material it corrects.

## Conformance — the v1 floor and tier ladder (owner-ratified 2026-07-06)

"Speaks the protocol" is recomputable, never asserted — conformance
items are proof-typed (an artefact that exists, a gate that runs), not
claims in prose.

- **Tier 0 — material exchange** (every Practice repo qualifies with
  zero tooling): the incoming box exists at its canonical path, and
  the concepts-vs-pointers layering guard (clause 7) governs every
  exchange payload. Proof type: `artifact` (box path present),
  `artifact` (protocol record present in the decision-record set).
- **Tier 1 — session hosting** (can host visiting sessions): a
  threadable comms substrate, identity-with-prefix on every rendered
  surface (clause 5), and a declared coordination home (clause 2).
  Proof type: `gate` (watcher liveness assertion), `artifact`
  (identity + home declarations).
- **Extensions — version-advertised, never floor**: comms threading,
  claim `repo_ref`, statusline join-key rendering. An estate
  advertises these with its protocol version; peers negotiate at the
  join ceremony.

## Validation experiment — the third-estate falsifier

The protocol's own test: a THIRD estate, freshly transplanted,
joins an existing arrangement using only what the plasmid carries —
this PDR, the join-ceremony skill, the discoverability rule, and the
shared schema. If the cold join needs hand-carried knowledge beyond
those artefacts, the protocol has failed its purpose; the gap is
named and cured rather than papered with expertise.

## Non-Goals (the second-consumer boundary)

Two estates is exactly the second-consumer moment that justifies
canonicalising now; everything below waits for a third estate to
demand it:

- Federating or synchronising collaboration substrates across repos.
- Converging identity-name derivations across the ecosystem.
- Discovery services, estate directories, or N-party topology.
- Cross-machine coordination (the substrate stays per-machine).
- Either estate implementing the other's phenotype.

## Phenotype note (this estate)

This estate's local phenotype: the `PRACTICE_COORDINATION_HOME`
declared-home override implemented in `resolveCoordinationHome`
(landed 2026-07-06), the statusline rendering the `name (prefix)` join
key beside the identity (landed 2026-07-06), the
`@oaknational/agent-tools` collaboration-state CLI as the home tooling
for all writes, and the collaboration plane at
`.agent/state/collaboration/`. The host phenotype ADR in
`docs/architecture/architectural-decisions/` records the WHAT of these
mechanics; the controlling plan owns the HOW. The peer estate's copy
of this PDR carries its own number and phenotype note; the portable
body is identical by construction and proven by cross-estate diff at
each amendment.
