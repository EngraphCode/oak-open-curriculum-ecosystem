# Runbook-plan template (V0 variant)

For operational promotions and migrations (e.g. a production auth
promotion): the delivery-plan form plus the runbook spine. Frontmatter
is identical to the delivery template (it must pass
`validate-plan-corpus`); the body adds the operational sections.

```markdown
---
id: <kebab-slug>
node_type: plan
name: <Human name>
overview: <One line: what this promotes/migrates and to where.>
kind: executable
serves_strategic_choice: <ID or "pending">
thread: <thread-slug>
last_updated: <YYYY-MM-DD>
todos:
  - id: <step-slug>
    content: "<Runbook stage — one sentence.>"
    status: pending
---

# <Name>

## Goal

<The operational end state.>

## Preconditions

What must already be true before step 1 — each item checkable, with the
check named.

## Steps

Numbered, each carrying WHO executes it (`agent` | `owner-held` — an
owner-held step surfaces as a visible owner card at the moment it
becomes actionable, never an ambient queue item) and the verification
that proves it happened.

## Rollback

The path back from every step that changes shared state. A step with no
rollback is named as such, with the owner's explicit acceptance dated.

## Acceptance (falsifiable)

As the delivery template: each item `repo-safe` or `owner-held`, with
the instrument or verifier named.

## Out of scope

Explicit, as the delivery template.
```
