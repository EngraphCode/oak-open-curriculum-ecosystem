# Slack Assistants Roadmap

**Status**: 🟢 M1 (Ask Oisín v1 + the shared libs) DECISION-COMPLETE / READY FOR EXECUTION
(2026-07-08; full-claim verification complete, telemetry topology resolved, estate
workstreams folded in). M2 (Ask Oak) strategic/future on a first-class machine identity.
**Last Updated**: 2026-07-08

---

## Purpose

Strategic sequence for user-facing agentic Slack assistants over Oak's MCP surfaces, built
on the isolated `ai-gateway` + `slack-assistant` libs. Execution detail lives in `current/`
and `future/`; this roadmap only sequences the milestones. Design source of truth:
[`../../research/outreach/oisin-oce-navigator-design.md`](../../research/outreach/oisin-oce-navigator-design.md).

Authoritative execution sources:

1. [`current/ask-oisin.plan.md`](current/ask-oisin.plan.md) — M1, executable
   (DECISION-COMPLETE; WS9+ consumes the owner-provisioned resources named in its
   §Dependencies).
2. [`future/ask-oak.plan.md`](future/ask-oak.plan.md) — M2, strategic (promotion-gated).

---

## Milestones

### M1 — Ask Oisín v1 + the shared libs

Ship the project/repo navigator — **an internal proof-of-concept** (Next.js App Router on
Vercel, live GitHub-MCP grounding, pragmatic PII egress, internal-only allow-listed access)
— building `@oaknational/ai-gateway` and `@oaknational/slack-assistant` as isolated libs,
plus the estate enhancements this work drives: the `logger` portability fix and the Sentry
vendor×runtime provider decomposition (`sentry-nextjs` over a shared redaction core). This
milestone establishes the framework/consumer seam
([ADR-154](../../../docs/architecture/architectural-decisions/154-separate-framework-from-consumer.md)),
the `apps/slack/*` surface, and the provider model (the two WS ADRs).

**Done when**: the Ask Oisín plan's proof contract is fully satisfied — the PII invariant is
compiler-enforced and payload-asserted, access control + limits + retry de-dup pass, the
provider composition proves capture/flush/metadata-only, safeguarding deflect+signpost is
verified, a live smoke returns a grounded cited answer, and the POC success bar (eval-set
pass rate on a golden question set + weekly-active-askers) is evaluated as the keep/continue
signal.

### M2 — Ask Oak (curriculum content)

The second consumer, validating the seam as thin config. Curriculum-facing, over the Oak
Curriculum MCP, authenticating with a **first-class machine identity** — Clerk M2M
verification added to our own MCP app (a deliverable we own), a plain Bearer header on the
client, no persisted refresh token, no day-one store.

**Promotion trigger** (into `current/`): the libs have shipped with Ask Oisín AND the Oak
MCP machine-identity deliverable is scoped AND an owner go for the second app.
