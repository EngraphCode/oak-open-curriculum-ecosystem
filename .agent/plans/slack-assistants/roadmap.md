# Slack Assistants Roadmap

**Status**: M1 (Ask Oisín v1 + framework) in PLANNING; M2 (Ask Oak) strategic/future.
**Last Updated**: 2026-07-08

---

## Purpose

Strategic sequence for user-facing agentic Slack assistants over Oak's MCP surfaces, built on one shared `slack-assistant` framework. Execution detail lives in `current/` and `future/`; this roadmap only sequences the milestones. Design source of truth: [`../../research/outreach/oisin-oce-navigator-design.md`](../../research/outreach/oisin-oce-navigator-design.md).

Authoritative execution sources:

1. [`current/ask-oisin.plan.md`](current/ask-oisin.plan.md) — M1, executable (queued).
2. [`future/ask-oak.plan.md`](future/ask-oak.plan.md) — M2, strategic (promotion-gated).

---

## Milestones

### M1 — Ask Oisín v1 + the `slack-assistant` framework

Ship the project/repo navigator (Next.js App Router on Vercel, live GitHub-MCP grounding, pragmatic PII egress, internal-only allow-listed access) and extract the reusable framework as it is built. This milestone establishes the framework/consumer seam ([ADR-154](../../../docs/architecture/architectural-decisions/154-separate-framework-from-consumer.md)) and the `apps/slack/*` surface (WS0 ADR).

**Done when**: the Ask Oisín plan's proof contract is fully satisfied — the PII invariant is compiler-enforced and payload-asserted, access control + limits pass, and a live smoke returns a grounded, cited answer.

### M2 — Ask Oak (curriculum content)

The second consumer, validating the seam as thin config. Curriculum-facing, over the Oak Curriculum MCP, with the OAuth-client acquisition/refresh + durable token store its OAuth alpha requires.

**Promotion trigger** (into `current/`): the framework has shipped with Ask Oisín AND obtainable Oak MCP alpha OAuth credentials for a headless client.
