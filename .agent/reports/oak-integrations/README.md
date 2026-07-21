# Oak Integrations Reports

This report family examines how separately governed Oak and adjacent source
repositories can be made locally available to this monorepo without collapsing
their authority, toolchains, deployment responsibilities, or release histories
into it.

## Reports

- [Submodule-wrapped Oak source integrations](./submodule-wrapped-oak-source-integrations-report-2026-07-15.md)
  — concept exploration and architecture synthesis for wrapping Oak OpenAPI,
  Oak Curriculum Ontology, and Oak Database-Tools behind role-specific pnpm
  workspace interfaces, including the value and safety boundary for tailored
  materialised-view work.
- [Castr source integration](./castr-source-integration-report-2026-07-15.md)
  — concept exploration for using an optional, locally editable Castr submodule
  as OCE's rapid capability-development loop while keeping the wrapper command
  and generated-artefact contract stable, then publishing Castr for the ordinary
  public-root path and deleting OCE's legacy direct OpenAPI dependency stack.

## Implementation

- [Oak source integration workspaces implementation plan](../../plans-backlog-2026-07/architecture-and-infrastructure/current/oak-source-integration-workspaces.plan.md)
  — ready executable plan for the shared provenance substrate, four
  role-specific wrappers, Castr/OpenAPI-stack convergence, safe branch
  synchronisation, CI isolation, and a cross-repository contract proof.

## Database-Tools Safety at a Glance

Database-Tools is evaluated only as a quarantined synthetic design laboratory,
not as a normal dependency or a route to Oak data. Its wrapper must construct
and own the Compose project, DSN, database name, and synthetic-fixture marker;
it rejects every caller-supplied database URL, including loopback URLs, and
every pre-existing database. Staging restore, credentials, deploy, production
refresh, destructive clear, and arbitrary child scripts are outside the
interface. See [the full safety boundary](./submodule-wrapped-oak-source-integrations-report-2026-07-15.md#the-safety-boundary).

Oak OpenAPI and Database-Tools are currently private repositories. Their local
checkouts are always opt-in. Castr and Oak Curriculum Ontology are public, but
their nested toolchains are optional too. The default public clone, root
install, root gates, and ordinary contributor CI must remain complete without
Oak credentials or any initialised source submodule.

## Authority Boundary

The reports in this family analyse local integration mechanics and their
trade-offs. The linked implementation plan owns the selected mechanics and
schedule. Neither surface transfers authority for API runtime behaviour,
ontology semantics, database schema, materialised views, deployment
configuration, or production state into this repository. Those remain owned by
their source repositories.
