# ADR-225: Adopt provider-independent capability composition for runtime services

**Status**: Proposed  
**Date**: 2026-08-13  
**Related**:
[ADR-024](024-dependency-injection-pattern.md) — injected I/O;
[ADR-042](042-runtime-adapters-folder.md) — runtime adapter boundary;
[ADR-154](154-separate-framework-from-consumer.md) — framework and consumer
separation;
[ADR-155](155-decompose-at-the-tension.md) — responsibilities that change for
different reasons remain separate;
[ADR-212](212-federated-visibility-authority-and-evidence-boundaries.md) —
authority and external projection boundaries;
[PDR-139](../../../.agent/practice-core/decision-records/PDR-139-provider-independent-capability-composition.md)
— portable semantic authority;
[research](../../../.agent/research/provider-independent-capability-architecture.md)
— storage and provider analysis.

## Context

The repository increasingly composes capabilities supplied by runtimes,
protocols, and managed services. PostgreSQL support, with Neon as one candidate
provider, makes the unresolved repository boundary visible: a managed provider
can offer valuable operation without becoming the semantic owner of persistence
or a requirement for every supported composition.

Dependency injection and the runtime-adapter package provide the implementation
seams. They do not yet record how this repository adopts the portable
provider-independent capability pattern, how PostgreSQL and Neon divide across
those seams, or what evidence makes a provider-independent host profile real.

The required property is structural substitutability. It is distinct from
automatic failover, simultaneous multi-provider operation, and zero-downtime
migration.

## Decision

This repository adopts PDR-139 as the semantic authority for every capability
that crosses a replaceable runtime or external-service boundary. This ADR
records the repository phenotype; it does not restate the portable contract.

### Repository placement

- Domain and application consumers receive semantically named capability
  contracts through the dependency-injection boundary established by ADR-024.
- Technology adapters and provider bindings belong at the runtime-adapter
  boundary established by ADR-042. Provider-specific SDK types, identifiers,
  configuration, lifecycle, and error translation do not cross into consumers
  or canonical domain records.
- Each runnable host selects its capabilities and bindings at its composition
  root. Composition and the selected provider binding are the only layers that
  know provider identity or configuration.
- Each supported host profile records its required capabilities, optional
  capabilities, declared reduced modes, and independent composition for every
  named external provider it selects.

### PostgreSQL and Neon interpretation

PostgreSQL data access is a technology adapter for a semantically named
transactional capability. The adapter can target Neon, another compatible
managed provider, or a self-hosted PostgreSQL deployment without a provider
branch in consumers. Neon does not receive a brand-specific data adapter solely
because it is the selected service.

Neon project administration, database branching, and provider metrics are
control-plane concerns. If a concrete repository consumer adopts them, each is
represented by a separate optional management capability with a Neon provider
binding. Those capabilities do not expand the transactional contract.

Provider development tooling can create or inspect resources for operators. It
is not an application persistence dependency and is absent from runtime
composition.

This ADR does not select Neon, mandate PostgreSQL for every state shape, or
introduce a runtime implementation. A later implementation must choose a
semantically named transactional capability before choosing its driver,
connection method, schema, or provider configuration.

### Supported independent compositions

For every external provider selected by a supported host profile, the
repository MUST document and exercise a supported composition without that
provider. The independent composition may select a compatible provider, select
a local or self-hosted binding, or omit a capability that is non-constitutive
for that profile.

A capability is non-constitutive for a host profile only when omitting it
preserves that profile's declared purpose and guarantees. Declaring a capability
optional does not weaken this test. The requirement applies per provider; it
does not make every capability optional and does not require one composition
that omits every external service simultaneously.

For a Neon PostgreSQL integration, the minimum independent composition is the
same transactional capability served through PostgreSQL without Neon. It is
supported only when unchanged consumers pass the same capability-conformance
checks. When canonical state is involved, a repository-owned schema and
migration path plus an exercised export and restore against the independent
target are also required.

An interface or configuration flag without this evidence is a proposed seam,
not established provider independence.

## Rationale

PDR-139 owns the general pattern; this ADR keeps only the repository-specific
placement and PostgreSQL/Neon interpretation. That direction prevents the two
decision records from becoming competing normative copies.

Using PostgreSQL as the data-plane seam avoids adapters that differ only by
provider name. Splitting the Neon control plane preserves access to useful
managed features without allowing them to define transactional storage.

A supported independent composition makes the founding constraint observable.
It proves more than interface shape: the host can serve its declared purpose
without the named provider, and state can move when state is authoritative.

## Alternatives rejected

### Repeat the portable capability rules in this ADR

This would create two normative copies. PDR-139 remains the portable authority;
this ADR records only this repository's adoption and phenotype.

### Make Neon the persistence contract

This would distribute Neon concepts through consumers and make project
administration or branching part of ordinary transactional state.

### Create a Neon data adapter beside a PostgreSQL data adapter

When both expose conforming PostgreSQL behaviour, the brand-specific adapter
duplicates the technology seam. Neon-only control-plane behaviour remains a
separate provider binding.

### Accept an interface without an independent composition

This would establish source-code indirection while leaving the running host or
its canonical state dependent on one provider.

### Use provider development tooling at runtime

Operator convenience would become application availability. Development tools
remain outside runtime composition.

## Consequences

- A PostgreSQL/Neon implementation starts from a domain capability and a shared
  PostgreSQL technology adapter, not from Neon SDK calls in consumers.
- Runtime composition and provider bindings contain provider knowledge;
  consumers remain provider-independent.
- Supported host profiles expose their actual capability set and identify an
  exercised independent composition for each selected provider.
- Provider-specific extensions require separate contracts and remain
  independently removable.
- Stateful integrations carry repository-owned schema, migration, export, and
  restore obligations in addition to method conformance.
- A provider seam can remain Proposed while its independent composition is not
  yet exercised. It cannot be described as supported provider independence.
- Storage technologies remain capability-specific. Files, PostgreSQL, SQLite,
  object storage, RDF stores, search indexes, analytical snapshots, caches, and
  event infrastructure do not become interchangeable.

## Compliance questions

A provider-backed repository change complies when reviewers can answer yes to
each applicable question:

- Does it identify PDR-139 as the semantic authority rather than copy its
  portable rules?
- Do consumers depend on a capability contract while runtime adapters and
  composition contain provider knowledge?
- For PostgreSQL, does one technology adapter serve conforming providers, with
  Neon-only control-plane behaviour separated?
- Does the owning host profile state its actual required, optional, and reduced
  capabilities?
- For each named external provider selected by that profile, is a supported
  composition without it documented and exercised?
- If omission supplies that composition, does the host preserve its declared
  purpose and guarantees?
- For canonical state, are repository-owned schema, migration, export, and
  independent-target restore exercised?
