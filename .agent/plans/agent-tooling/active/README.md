# Active Plans — Agent Tooling

In-progress execution plans for the agent tooling substrate.

When a plan is being actively executed in a session, move it from
[`../current/`](../current/) to this directory. Move it back to
[`../current/`](../current/) when it pauses, or to [`../archive/`](../archive/)
when it completes.

## Plans

| Plan | Scope | Status |
| --- | --- | --- |
| [agent-naming-schema-v2.plan.md](agent-naming-schema-v2.plan.md) | Versioned naming-schema registry in `core/agent-identity`: noun-verb-noun lowercase-middle v2 display names, digest-pinned wordlist eras (current scheme preserved as v1), `naming_schema_version` on the collaboration identity tuple. UUID v5 derivation and `session_id_prefix` untouched. Owner wordlist taste review is a blocking pre-activation gate. | ACTIVE |

## Related

- Collection root: [../README.md](../README.md)
- Queued: [../current/README.md](../current/README.md)
- Future backlog: [../future/README.md](../future/README.md)
- Frictions register: [../frictions-register.md](../frictions-register.md)
