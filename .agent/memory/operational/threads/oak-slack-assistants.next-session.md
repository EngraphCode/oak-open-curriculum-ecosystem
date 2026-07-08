# Next-Session Record — `oak-slack-assistants`

Thread identity: **`oak-slack-assistants`** — user-facing agentic Slack
assistants over Oak's MCP surfaces, built on one shared, publishable
`slack-assistant` framework. First app: **Ask Oisín** (project/repo navigator,
GitHub MCP). Second app (future): **Ask Oak** (curriculum content, Oak
Curriculum MCP). Internal-use only, allow-listed installations. Distinct from
`connecting-oak-resources` (data/knowledge-graph integration) — this thread is
the *surface*, not the resource. Governing decision record:
[PDR-027](../../../practice-core/decision-records/PDR-027-threads-sessions-and-agent-identity.md);
architectural seam:
[ADR-154](../../../../docs/architecture/architectural-decisions/154-separate-framework-from-consumer.md)
(Separate Framework from Consumer).

## Current Continuation

- **Branch**: `feat/slack-apps` (PR #328, open — design doc + planning estate).
- **Invocation pointer**: continue `oak-slack-assistants` from this record.
- **Controlling plan**:
  [`ask-oisin.plan.md`](../../../plans/slack-assistants/current/ask-oisin.plan.md)
  (`current/`, PLANNING — re-review pending after the 2026-07-08 fleet-review
  corrections). Design source:
  [`oisin-oce-navigator-design.md`](../../../research/outreach/oisin-oce-navigator-design.md).
- **Next safe step**: the plan is not yet READY FOR EXECUTION — a plan-phase
  re-review against the applied corrections is the next move, then provision the
  blocking prerequisites (Slack app registration + team id for the allow-list,
  Vercel project + AI Gateway BYOK key, GitHub PAT for OCE + private `oak-skills`
  read), then the WS0 ADR (apps/slack tier + framework tier/boundary config)
  before any scaffolding.
- **Completed prerequisites**: design verified against primary vendor docs + the
  live Oak MCP (2026-07-08); framework settled as Next.js App Router; owner
  rulings recorded (pragmatic PII egress, matcher deferred, framework-first,
  internal-only access control, per-workspace + hashed-per-user limiting); a
  12-expert fleet review + adversarial verify run and its upheld corrections
  applied to the estate.
- **Owner rulings in force**: internal-use ONLY (allow-listed installations, no
  external access); framework consumes the logging adapter (configure eslint
  boundaries, do not inject-around); model slug is opaque/unvalidated. Plus the
  2026-07-08 open-question rulings: safeguarding = deflect + signpost, no record;
  PII invariant does NOT depend on ZDR (ZDR beneficial only); internal scope is
  workspace-level (guests/Slack-Connect within an allow-listed workspace accepted);
  oak-skills = scope the PAT to read the private repo.
- **Tracked open questions (owner/legal/ops)**: DPIA/DPAs; records-retention duty;
  ZDR contract; v1 success metrics; provisioning + ownership of the 4 external
  resources; cost ceiling + budget owner; monitoring/service owner; rollback
  authority; Slack app-approval process. See the plan's "Known open questions".
- **Recent relevant commits**: PR #328 (`feat/slack-apps`) — design doc, plan
  collection, framework-settle, and the fleet-review corrections.
