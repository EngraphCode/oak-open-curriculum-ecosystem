# Notion Page Edits Update the Page Ledger

**Operationalises:**
[ADR-212](../../docs/architecture/architectural-decisions/212-federated-visibility-authority-and-evidence-boundaries.md)
(federated audience and authority boundary) and
[PDR-113](../practice-core/decision-records/PDR-113-source-intent-from-the-principal-not-the-records.md)
(records project intent rather than originating it).

For every agent-authored Notion page edit, the agent must leave a concise, page-local audit line.
The visible ledger lets a stakeholder distinguish deliberate repository-driven updates from
unexplained page drift, even when the Notion credential identifies a shared human account.

## Trigger

An agent is about to create or change content on a Notion page while working from a repository.

## Action

For each agent-authored change set on a page, the agent MUST append exactly one list item to that
same page's `Change ledger` section. If the section does not exist, create it. Multiple API calls
that implement one coherent page update are one change set and receive one ledger item; edits to
multiple pages receive one item on each page.

Use a single physical line in this form:

```text
- DD Month YYYY — `<repository-name>` — <concise change summary>.
```

The actor is the repository name, not the agent identity. Resolve the basename of the active
repository rather than copying a machine-local path. Do not report the Notion edit complete until
the content change and its ledger item are both visible on the page.

## Why

Notion is an audience-shaped projection rather than the durable source of intent. A page-local
ledger supplies provenance and freshness without making Notion authoritative, and repository-name
attribution tells readers which delivery estate caused the change without exposing machine-local
or ephemeral agent identity.

## Failure mode prevented

Without the ledger line, agent-authored stakeholder pages change under shared credentials with no
reliable provenance. Without exactly-one-per-change-set discipline, retries and multi-call edits
produce either missing history or noisy implementation-call logs rather than a human audit trail.
