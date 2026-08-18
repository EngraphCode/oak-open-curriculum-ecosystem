---
ddr: DDR-012
iri: urn:uuid:ee825831-feb8-4550-a8fb-e4d7d171ce99
title: Identities are self-contained; the contract is the invariant
status: ratified
date: 2026-08-18
deciders: Jim Cresswell (owner)
edges:
  depends_on:
    - 'DDR-001 — the design system is a configured framework (this decision deepens the configuration boundary)'
    - 'DDR-007 — palette values derive, never copy (construction-time derivation generalises it)'
  supersedes: []
  informed_by:
    - 'Owner ruling 2026-08-18 at the design seat — verbatim in §Provenance below; the tango-identity-pack plan carries it downstream as ruling P7'
    - 'The 2026-08-18 demo-day defect ledger: reduced-motion collapse defeated by a bare later-sheet override; a stranded server-rendered brand sheet; cascade-order and specificity fights; light-dark() resolving at the declaring root'
    - 'P6 (tango-identity-pack plan): the eventual state is all identities as canonical packs'
  related:
    - 'DDR-003 — theme state is the choice, never the applied value (theme remains the runtime axis inside each pack)'
    - 'DDR-004 — five themes; access themes are first-class (every pack carries its complete theme faces)'
---

# DDR-012: Identities are self-contained; the contract is the invariant

## Context

Identity switching was first proven with a runtime override mechanism: the
kit ships a base token surface carrying Oak's values, and an identity is a
delta stylesheet loaded after it, re-declaring ("re-pointing") the tokens
it wants to differ. The mechanism demonstrated live switching over
identity-invariant markup — and then quietly persisted as the
architecture. Under it, inheritance is invisible and order-dependent:
what an identity did NOT re-point silently tracks the base, a base edit
re-skins every identity that never pinned that token, and the full
surface of an identity exists only inside a browser cascade. The
2026-08-18 demo day produced the defect ledger that made this concrete
(see edges), and the owner named the underlying fault: an early
mechanism design to prove theme switching persisted when it should not
have.

## Decision

**Each identity is self-contained: an identity pack carries its complete
token surface, including all of its theme faces. The token CONTRACT —
the names, semantics, and obligations every pack implements — is the
shared INVARIANT: invariance of the contract is what keeps
one-markup-every-identity true and what makes new identities cheap to
create.**

Defaults exist and are welcome — **at construction time, never as
runtime values**. Creating an identity fills every contract field the
author has not yet decided from the default scaffold, records the
provenance of every value (defaulted or authored), and emits a complete
artefact the identity owns from that moment. Construction is a
first-class tooling operation (working name, owner's verbatim:
`oak-design identity create`), with an upgrade path that re-derives
against an evolved contract as an explicit, reviewable per-pack diff.

The axes separate cleanly: **identity is a build-time axis** (who the
service is — a complete, selectable artefact); **theme is the runtime
axis** (the reader's condition — light, dark, high-contrast,
colour-safe — carried in full inside every pack).

## Consequences

- **Default-as-scaffold, never default-as-lien.** A scaffold value is
  visible, provenance-recorded, and owned by the identity after
  creation; a runtime fallback is invisible, owned by nobody, and
  changes underneath its consumers. Base evolution reaches identities
  as explicit upgrade diffs, never silent re-skins.
- **The runtime-override mechanism is graded legacy-demo.** It keeps
  the showcase honest until the pack migrations land, and no new
  surface may adopt it. Identity "switching" becomes artefact
  selection: swapping complete sheets, with no overlay ordering, no
  stranded base, no adoption dance.
- **Prefixes stop encoding the base.** The Oak-named primitive palette
  becomes Oak's own construction-time resource; served token names are
  the identity-neutral contract, with any identity-specific prefix a
  pack-declared manifest field (a MAJOR: the prefix is a cross-estate
  wire field). The decision executes at the pack-manifest slice
  (tango-identity-pack T1a-ii).
- **The kit base becomes value-free.** Oak ceases to be the implicit
  base and becomes an identity like the others; the kit keeps the
  unbranded contract, the default scaffold, and the layout/behaviour
  machinery. (The tango-identity-pack node's AC3 already names the
  value-free base as the Oak-pack migration's outcome.)
- **Validation is completeness against the contract**, never
  delta-wellformedness: the pack manifest declares the full surface,
  the admission guard verifies it, and a contract-drift validator
  recomputes rather than records.
- The means live in the `tango-identity-pack` plan (its P7 row; slices
  T1a-ii, T1e, T2) and the follow-on migration nodes for the three
  existing identities — this record states the should-be, never the
  schedule, and the plan cites this record for the decision, never the
  reverse.

## Provenance

Owner ruling, 2026-08-18, design-lane session (Yarrow stirs Undergrowth,
ab1066), the post-demo feedback round — verbatim:

> On the re-pointing point. That feels fundamental. I think it is showing
> that an early mechanism design to prove theme switching has persisted
> when it shouldn't. Each identity needs to be self contained, not
> override a base. We can certainly have defaults, but the time to use
> them is during identity construction, not as runtime values… we can
> have a CLI with commands like oak-design identity create

And, ratifying the seat's self-contained-values-shared-contract clause,
same sitting:

> Absolutely yes, the contract is an invariant, that is what makes it
> cheap to create new identities.

The ruling and its session context are also recorded in the design-lane
thread record (`.agent/memory/operational/threads/design-system-integration.next-session.md`,
session close 2026-08-18). This section is the decision's durable
authority anchor; every other surface is downstream of it.
