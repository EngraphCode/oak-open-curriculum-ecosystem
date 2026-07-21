# Update the Direction A plan reference in `oak-skills`

**Upstream**: `oak-skills` (Oak Agent Skills library). **Do not edit `oak-skills`
from this repo** — hand this over to the skills maintainers.
**Status**: open
**Priority**: low (repairs a stale cross-repo planning link)
**Affected**: `oak-skills/.agent/plans/public-distribution.plan.md`

## Problem

The `oak-skills` public-distribution plan still references this repo's old
Direction A filename:

```text
mcp-skill-surfacing-and-ingest.plan.md
```

The current Direction A plan is:

```text
.agent/plans/user-experience/educator-end-users/current/oak-skills-ingest-and-resurfacing.plan.md
```

The filename changed during the educator-end-users synthesis so the external-facing
capability corpus reads as a coherent Direction A / Direction B pair.

## Suggested approach

Update the `oak-skills` plan reference to the current filename and path above.
No content change is implied beyond repairing the stale link target.
