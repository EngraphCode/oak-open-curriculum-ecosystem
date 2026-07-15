# Future Plans — Discovery

Strategic briefs and spec-tracking documents for later work. These are not
executable yet; promote to `current/` before writing execution tasks.

| Plan | Scope | Status | Blocked By |
|------|-------|--------|------------|
| [agentic-mechanisms-discovery.plan.md](agentic-mechanisms-discovery.plan.md) | Parent thread for web-based agentic discovery mechanisms across skills, MCP server cards, A2A, registry metadata, and adjacent proposals | Strategic parent | Child lanes reaching implementation readiness or a cross-surface publication decision |
| [agent-skills-discovery.plan.md](agent-skills-discovery.plan.md) | Discovery brief for surfacing and cataloguing agent skills across Oak tooling | Strategic | Taxonomy ratified in [ADR-189](../../../../docs/architecture/architectural-decisions/189-audience-led-agent-capability-taxonomy.md); promote when implementation is ready |
| [skills-classification-taxonomy.plan.md](skills-classification-taxonomy.plan.md) | Classification and taxonomy scheme for agent skills, grounded in audience-led capability vocabulary | Strategic | Same as above — ADR-189 is the ratified vocabulary home |
| [mcp-server-cards.plan.md](mcp-server-cards.plan.md) | Track the draft MCP Server Cards spec (SEP-2127) and prepare a discoverable `.well-known` server card for Oak's public remote MCP server | Strategic / tracking | Spec acceptance + a public remote Oak MCP server worth advertising |
| [dns-aid-discovery.plan.md](dns-aid-discovery.plan.md) | Track optional DNS-layer agent discovery records and keep them subordinate to the apex catalog | Strategic / tracking | DNS-AID scope decision + draft stability + DNS ownership |
| [aila-a2a-agent-card.plan.md](aila-a2a-agent-card.plan.md) | Conditional Aila Agent Card if Oak exposes Aila as an A2A server | Strategic / tracking | Product decision that Aila should answer third-party agents |
| [webmcp-human-site-operability.plan.md](webmcp-human-site-operability.plan.md) | Optional WebMCP/browser-native actions for the human web app | Strategic / tracking | Product decision that in-page agent operability is wanted |
| [web-bot-auth-agent-verification.plan.md](web-bot-auth-agent-verification.plan.md) | First-class Web Bot Auth / signed-agent verification posture for official Oak web apps | Strategic / tracking | Oak decision on signed-agent verification + security evidence path |

Collection hub: [../README.md](../README.md)

Current promoted slice:
[../current/agent-readiness-discovery-hub.plan.md](../current/agent-readiness-discovery-hub.plan.md)
