---
pdr_kind: governance
---

# PDR-124: Definition-Surface Context Economy — Session-Injected Surfaces Carry a Budget; Depth Lives at Invocation Time

**Status**: Accepted
**Date**: 2026-07-03
**Adopted**: 2026-07-03
**Related**:
[PDR-010](PDR-010-domain-specialist-capability-pattern.md)
(domain-specialist capability shape — what a specialist knows and how it
fires; this PDR governs where that knowledge *loads*, not what it is);
[PDR-015](PDR-015-reviewer-authority-and-dispatch.md)
(reviewer dispatch discipline — the invoke-time decision this PDR keeps
cheap by keeping the dispatch registry compact);
[PDR-052](PDR-052-directive-file-context-budget.md)
(directive-file context budget — the adjacent contract: PDR-052 governs
*editing* apex doctrine under context pressure; this PDR governs the
standing *injection* cost of definition surfaces at session open);
[PDR-088](PDR-088-reviewers-carry-doctrine.md)
(reviewers carry doctrine — the doctrine a reviewer carries loads at
invocation time through its template's mandatory read-path, which is
exactly the tier where this PDR routes depth);
[PDR-046](PDR-046-layered-knowledge-processing.md)
(layered knowledge processing — moving substance down a tier is a
placement move on that staircase, never a compression move).

## Context

Agent platforms inject a set of **definition surfaces** into every
session's context at open, before any work begins: the agent registry
(each subagent's `description` frontmatter), the skills list (each
skill's `description`), the rules entry stubs, MCP server instructions,
and the per-user memory index (Claude Code `MEMORY.md`). These are paid
by **every session of every agent, whether or not the defined thing is
used**. A second tier — agent bodies and templates, rule bodies, skill
bodies, per-entry memory files — loads only **at invocation**, when the
thing is actually used.

The **~80K reliably-loaded budget** this PDR measures against is the
repo's named ceiling for the *automatic + reliable* tier
(owner-proposed 2026-05-15): everything the harness injects without
agent action, plus everything the always-on rules direct a compliant
agent to read at session open (the `AGENT.md` chain, the active memory
pair, the start-right chain). Invocation-time loads are excluded. Any
proposal that grows the reliably-loaded tier — a new always-on rule,
always-active skill, `AGENT.md` addition, or session-hook output — is
measured against the ceiling first, and resolves one of three ways:
shrink something already in the tier, move the addition on-demand with
a falsifiable trigger, or surface a ceiling revision to the owner. The
corpus never accretes past the ceiling silently. (Complementary to the
30% processing-window budget in `directive-file-context-budget`, which
governs the live working window, not the static session-open surface.)

Measured in this repo's Claude Code host (2026-07-03): ~71K tokens of
session-open load against the ~80K reliably-loaded budget. The two
largest controllable contributors shared one mechanism:

- **Agent descriptions**: 28 subagent definitions totalling ~42KB, of
  which ~33KB (~8K tokens per session) was `description` frontmatter.
  The estate was bimodal — newer specialists carried ~450-byte
  compact descriptions, while 15 older definitions embedded
  multi-paragraph `<example>` dialogue blocks (1.4–2.2KB each) in the
  description field. The Cursor adapters for the *same* agents already
  carried compact, example-free descriptions: the lean shape was
  already ratified in the estate, and the verbose Claude copies were
  divergence, not design.
- **Per-user memory index**: `MEMORY.md` at 44KB / 241 entries,
  truncated by the harness at load — paying a large tax *and* silently
  dropping tail entries. Entries graduated into repo rules still held
  index lines, so their substance loaded twice per session (rule stub
  plus dead index line).

No existing authority governed the injected tier. PDR-052 governs
editing directive files under context pressure (its host-side rule
operationalises that same editing constraint); PDR-010 governs what a
specialist is. Neither names the standing cost of what the platform
injects unasked.

## Decision

**Definition surfaces are two-tier, and the session-injected tier
carries a budget.**

1. **Two tiers, named.** *Session-injected*: description fields, index
   lines, entry stubs, and any surface the platform loads at session
   open for every agent. *Invocation-time*: bodies, templates, rule
   bodies, skill bodies, per-entry files — surfaces loaded only when
   the defined thing is used.

2. **The injected tier carries identity and firing conditions only.**
   A description states what the thing is and when to invoke it, in
   compact prose — as a guide, a few sentences, on the order of 500
   bytes. Dialogue examples, worked instances, method, doctrine, and
   commentary are invocation-time substance and live in the body or
   template. XML-style `<example>` blocks in a description field are a
   defect of placement, not a style choice.

3. **Dispatch depth is not duplicated into descriptions.** Where richer
   dispatch guidance is needed, it lives in the `invoke-*` rules and
   the specialist's template — surfaces read at the decision moment —
   not restated per-agent in the injected registry.

4. **Index lines retire on graduation.** A per-user memory index line
   is injected tier. When an entry graduates to a repo home, its index
   line is retired; the per-entry file keeps the full audit trail with
   its "Graduated to" marker. A graduated line left in the index is
   the double-tax shape: the substance already loads via its repo home.
   (Operationalised host-side by the per-user-memory buffer rule's
   graduation lifecycle.)

5. **Truncation of an injected surface is a defect signal.** A
   harness-truncated index or registry is silent knowledge loss at
   session open. The cure is always to move substance down a tier or
   drain it to its durable home — never to trim the substance
   (conservation invariant; PDR-046).

## Scope

**Adopter scope**: every Practice-bearing repo on every platform that
injects definition registries at session open — Claude Code (agents,
skills, rules stubs, `MEMORY.md`), Cursor (rules, agent descriptions),
Codex and analogous hosts. The substance is agent-infrastructure
governance, portable by construction; the byte figures above are this
repo's 2026-07-03 evidence, not part of the contract.

## Rationale

The injected tier's cost multiplies: bytes × sessions × agents, paid
before any value is delivered. Invocation-time bytes are paid once, by
the consumer who needs them, at the moment they need them. Any
substance that can serve its purpose at invocation time therefore
defaults there; only what the *dispatch decision itself* needs earns
injection.

The convergence evidence makes this cheap to adopt: the compact shape
was already live and effective for the newer specialists and for the
entire Cursor estate. Dispatch does not demonstrably require embedded
examples — it requires a precise statement of firing conditions, which
the compact descriptions carry and the `invoke-*` rules reinforce at
the decision moment.

Knowledge preservation holds because this is a placement discipline,
not a trimming licence: substance moves down a tier (description →
template; index line → repo home plus per-entry audit file). Nothing
is deleted to make a number look better.

## Consequences

**Enables**:

- Session-open headroom recovered across every future session of every
  agent — the highest-leverage context saving available, because it
  compounds.
- The per-user memory index becomes a live-entries-only surface that
  fits untruncated, so tail entries stop silently vanishing.
- New agent and skill definitions have a ratified shape to follow
  instead of copying the verbose precedent.

**Costs**:

- Dispatch nuance must be maintained where it now lives (`invoke-*`
  rules, templates); a compact description that drifts stale is harder
  to notice than a verbose one.
- One-time convergence work per estate.

**Forbids**:

- Example blocks, dialogue transcripts, or method text in any
  description field or index line.
- Treating an injected surface as a knowledge home ("it must stay in
  the description or it will be lost") — the invocation-time home and
  the repo home are the homes.
- Curing injected-tier pressure by trimming or summarising substance.

## Falsifiability

- **Dispatch regression**: if a specialist demonstrably stops firing at
  its named moment after its description was compacted — where the
  verbose description previously fired — the compact form dropped a
  load-bearing trigger. Record the instance, restore the missing
  *trigger clause* (not the example block), and note it here.
- **Budget miss**: if, after an estate converges, session-open load
  still exceeds the host's reliably-loaded budget, the two-tier model
  missed a dominant surface; the tier inventory in §Decision 1 is
  wrong or incomplete and must be amended.

## Source

Owner-directed 2026-07-03 ("exploring context usage" session, Sardine
spins Estuary): a 71K-token session-open measurement prompted the
question; grounding found the lean shape already ratified in the
Cursor estate and the memory-index double-tax, and the owner directed
the PDR, the agent-definition convergence, and the lifecycle amendment
in one change set.
