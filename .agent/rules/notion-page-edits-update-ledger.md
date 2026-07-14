# Notion Page Edits Update the Page Ledger

**Operationalises:**
[ADR-212](../../docs/architecture/architectural-decisions/212-federated-visibility-authority-and-evidence-boundaries.md)
(federated audience and authority boundary) and
[PDR-113](../practice-core/decision-records/PDR-113-source-intent-from-the-principal-not-the-records.md)
(records project intent rather than originating it).

For every agent-authored Notion page edit, the agent must leave a concise, page-local audit entry.
Its visible line identifies the originating repository; a collapsed traceability toggle directly
beneath it records the full agent and credential chain. This lets a stakeholder distinguish
deliberate repository-driven updates from unexplained page drift without putting operational
identity detail into the main narrative.

## Trigger

An agent is about to create or change content on a Notion page while working from a repository.

## Allowed edit boundary

The owner-authorised edit boundary is the Notion subtree rooted at `Live Vision, Strategy, and
Planning` (page ID `39d26cc4e1b1803bb6ead6ff2c109ae3`): the root page and every page currently
beneath it. Resolve ancestry from live Notion state before writing. Do not maintain a second list of
page IDs; the owner extends or contracts the boundary by moving pages into or out of this subtree.

Refuse edits outside the subtree and surface the request to the Director. Subtree membership makes
a page eligible for editing, but does not independently authorise creating a new child page or
choosing between a new page and an inline affordance; route that content-architecture choice to the
Director first.

## Action

For each agent-authored change set on a page, the agent MUST append exactly one list item to that
same page's `Change ledger` section and one collapsed traceability toggle directly beneath that
item. If the section does not exist, create it. Multiple API calls that implement one coherent page
update are one change set and receive one ledger entry; edits to multiple pages receive one entry
on each page.

Use a single physical line in this form:

```text
- DD Month YYYY — `<repository-name>` — <concise change summary>.
```

The actor is the repository name, not the agent identity. Resolve the basename of the active
repository rather than copying a machine-local path.

Directly beneath the visible line, add a collapsed toggle titled `Agent traceability` containing:

```text
Agent: <agent-name> (<session-id-prefix>)
Operating credentials: <human-account-or-integration-account>
Date: DD Month YYYY
```

The toggle belongs to the same ledger entry; it is not a second visible ledger item. Do not report
the Notion edit complete until the content change, its repository line, and the collapsed identity
toggle are all visible on the page.

## Why

Notion is an audience-shaped projection rather than the durable source of intent. A page-local
ledger supplies provenance and freshness without making Notion authoritative. Repository-name
attribution keeps the visible narrative audience-appropriate, while the collapsed toggle preserves
the complete authorship and credential chain for audit and source-level queries.

## Failure mode prevented

Without the ledger entry, agent-authored stakeholder pages change under shared credentials with no
reliable provenance. A repository-only line cannot answer which agent acted through which account;
an identity-only line clutters the stakeholder narrative and hides the delivery estate. Without
exactly-one-per-change-set discipline, retries and multi-call edits produce either missing history
or noisy implementation-call logs rather than a human audit trail.
