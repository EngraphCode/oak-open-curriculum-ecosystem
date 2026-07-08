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
  (`current/`, READY FOR EXECUTION for WS0–WS8; two review rounds complete,
  corrections integrated). Design source:
  [`oisin-oce-navigator-design.md`](../../../research/outreach/oisin-oce-navigator-design.md).
- **Next safe step**: the plan is **READY FOR EXECUTION for WS0–WS8** (framework +
  app build; CI-provable; no external credentials). Start at the WS0 ADR
  (apps/slack tier + framework adapter-tier + eslint boundary config), then
  scaffold. WS9–WS11 (live preview deploy, value-proxy proofs, release review) are
  gated on owner-handled provisioning (Slack app + team id, Vercel + Gateway BYOK,
  GitHub PAT for OCE + private `oak-skills`) and a durable KV.
- **Completed prerequisites**: design verified against primary vendor docs + the
  live Oak MCP (2026-07-08); framework settled as Next.js App Router; owner
  rulings recorded (pragmatic PII egress, matcher deferred, framework-first,
  internal-only access control, per-workspace + hashed-per-user limiting).
  **Three review rounds** ran — defect review, open-question review, round-2 —
  each an expert fleet + per-finding adversarial verify, with ALL output
  critically assessed including the dropped (refuted/overstated) set; upheld
  corrections integrated. Do not re-run them blindly.
- **Owner rulings in force**: internal-use ONLY (allow-listed installations, no
  external access); framework consumes the logging adapter (configure eslint
  boundaries, do not inject-around); model slug is opaque/unvalidated. Plus the
  2026-07-08 open-question rulings: safeguarding = deflect + signpost, no record;
  PII invariant does NOT depend on ZDR (ZDR beneficial only); internal scope is
  workspace-level (guests/Slack-Connect within an allow-listed workspace accepted);
  oak-skills = scope the PAT to read the private repo.
- **Open-question dispositions (2026-07-08)**: v1 is an internal POC — DPIA not
  required (existing vendor DPAs cover it); no records-retention duty (Slack is the
  governed record); ZDR beneficial-only; success bar = light quantitative (eval-set
  pass rate + weekly-active-askers). Provisioning, ownership, billing, Slack-app
  approval, monitoring, and rollback authority are **owner-handled, out of plan
  scope**. See the plan's "Known open questions — dispositions".
- **Recent relevant commits**: PR #328 (`feat/slack-apps`, HEAD `e1a8add3c`) —
  design doc, plan collection, framework-settle (Next.js), round-2 corrections,
  open-question integration, and the roadmap/README/thread-record coherence
  reconcile. PR #328 is **open, not merged**; a Copilot autofix (`8710bb973`) and
  a `main` merge (`cee7173b7`) landed on the branch between rounds (both intact).

## For the successor — Copper (`48382d`, "Kiln wakes Copper")

You inherit an estate that is **READY FOR EXECUTION for WS0–WS8**. Orientation:

1. Read `ask-oisin.plan.md` (authoritative for scope/sequencing/acceptance) and the
   design doc (source). The four estate docs + this record were coherence-checked
   2026-07-08 and agree.
2. **First move**: the WS0 ADR (apps/slack tier + framework **adapter**-tier + the
   eslint lib-boundary config edit), then scaffold. WS0–WS8 are CI-provable with no
   external credentials.
3. **Owner-handled, not yours to chase**: provisioning + ownership + billing +
   Slack-app approval + monitoring + rollback authority (owner ruling — v1 is an
   internal POC). WS9–WS11 wait on those + a durable KV.
4. Session learnings live in `napkin.md` (2026-07-08 Gale section) and three memory
   files: `surface-user-decisions-as-questions`, `precedent-is-not-correctness`,
   `configure-checks-not-blindly-obey`. Heed them.

## Participating agent identities

| platform / model | agent_name (prefix) | role | last_session |
| --- | --- | --- | --- |
| claude-code / claude-fable-5 | Gale guards Eyrie (`33f49e`) | design-verify + plan-author + 3 review rounds + coherence | 2026-07-08 |

Successor named by the owner 2026-07-08: **Copper (`48382d`)**.
