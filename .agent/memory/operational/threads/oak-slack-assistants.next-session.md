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
  (`current/`, now **🔵 READY FOR REVIEW** — logging/observability approach reopened,
  see below). Design source:
  [`oisin-oce-navigator-design.md`](../../../research/outreach/oisin-oce-navigator-design.md).
  Logging companion:
  [`slack-assistant-logging-observability-design.md`](../../../research/outreach/slack-assistant-logging-observability-design.md).
- **Next safe step (2026-07-08, revised by Kiln wakes Copper)**: the whole estate is
  **READY FOR REVIEW**, not execution. A review round must resolve the **reopened
  logging/observability approach** before WS0/WS8 proceed. In order: (1) run the
  **vendor-literal verification** of the four Next.js telemetry mechanisms in the
  [logging design record](../../../research/outreach/slack-assistant-logging-observability-design.md)
  §8; (2) populate that record's §6 cost/value theory against verified facts; (3) get
  the owner's **back-end-only egress** decision (§4/§7); (4) revise WS0 (framework
  imports no vendor provider) + WS8 (Next.js provider composed at the app root, NOT
  `sentry-node`) and resume. Estate prerequisite riding with it: fix
  `@oaknational/logger`'s `node:crypto` portability leak **and add its missing
  browser-safety enforcement test** (design record §2.1). WS9–WS11 remain gated on
  owner-handled provisioning (Slack app + team id, Vercel + Gateway BYOK, GitHub PAT
  for OCE + private `oak-skills`) and a durable KV.
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

## Kiln wakes Copper session (2026-07-08) — logging re-exploration + ready-for-review handoff

Owner-directed. I (Copper, `48382d`, successor to Gale) did **not** start the WS0 build.
The owner reframed the logging/observability approach and directed a full closeout with
the estate set to **ready for review**. What changed:

- **All estate docs set to `ready for review`** (design doc, ask-oisin plan, ask-oak
  plan, README, roadmap).
- **New companion design record**:
  [`slack-assistant-logging-observability-design.md`](../../../research/outreach/slack-assistant-logging-observability-design.md)
  — the grounded current-state map (three-layer model: `observability` ports →
  `logger` general adapter → providers `stdio`/`sentry-node`/future client-side), the
  cross-runtime cost/value **theory** (topologies A–D + Next built-in), the
  **assumption ledger** (Fact / Owner's-call / To-verify / Dropped), and a
  certainty-as-risk register. Values are deliberately **unpopulated** pending
  vendor-literal verification.
- **Two estate defects surfaced** (design record §2.1): (1) `@oaknational/logger`'s
  base pulls `node:crypto` (`otel-format.ts:10`) so it is not portable to edge/browser
  as advertised, and it has **no** browser-safety enforcement test (unlike
  `@oaknational/observability`); (2) `@oaknational/sentry-node` conflates vendor +
  runtime — decompose into a vendor-neutral core + per-runtime `init`.
- **WS0/WS8 corrected**: the framework imports **no** vendor provider; providers
  compose at the app composition root; the Next.js telemetry topology is an OPEN
  question, not a `sentry-node` call.
- **Owner course-corrections this session** (heed — they recur): the boundary
  contradiction was a symptom, not a plan defect (lens 4 — would it be simpler if the
  system changed); **dropped** all legal/DPIA/audit framing (no such requirement — it
  was transmitted assumption echoed as truth); **assumptions transmitted then treated
  as primary truth is the core failure** — mark every claim (Fact/Owner's-call/
  To-verify/Dropped). NB: `configure-checks-not-blindly-obey` was **already** in the
  napkin/buffer from Gale and I repeated the exact error — **read AND heed napkin.md at
  session open**, do not just read it.

### PR #328 comment disposition (harvested 2026-07-08)

8 review threads = ~5 distinct issues. **⚠️ Two reviewers were skipped** (`@claude`
code review — org spend cap; `@chatgpt-codex-connector` -— Codex limit), so only Copilot
-- Cursor Bugbot actually ran; Copilot's opening "lenses match" claim was itself wrong.
SonarCloud gate **passed**; Vercel preview **Ready**. Distinct issues: **(A, High —
the important one)** eslint adapter-tier vs `sentry-node` — NOT a plan defect, it is the
boundary working as designed (a framework must not import a vendor provider); resolved
by the WS0 correction above. **(B)** `thread_ts` bug in the design skeleton (use
`event.thread_ts ?? event.ts`). **(C)** "dot-separated" model-slug wording wrong (doc
lines 29/234/381). **(D)** `createHandler` skeleton 2-arg vs 1-arg mismatch. **(E,
resolved)** Decision Lens 3 verbatim mismatch. Broken-link threads (plan L127) are
**stale** — that link no longer exists. B–D are doc-skeleton tidy-ups for the review
round.

### Different-machine handoff note

Work continues on a **different checkout/machine**. Everything durable is in-repo and
committed: the five estate docs, this record, the napkin (`napkin.md` — carries Gale's
three lessons at ~717–725 and Copper's two at ~759/777), and the new design record.
**Per-user memory is machine-local and will NOT travel** — but its live buffer (the 5
files `surface-user-decisions-as-questions`, `precedent-is-not-correctness`,
`configure-checks-not-blindly-obey`, `capture-expensive-command-output-first-run`,
`dont-transmit-assumptions-as-truth`) is fully mirrored in `napkin.md`, and the ~225
older `feedback_*` files were drained to the repo on 2026-07-05. The napkin's own full
rotation/drain remains the separately owner-scheduled dedicated consolidation pass.

## Participating agent identities

| platform / model | agent_name (prefix) | role | last_session |
| --- | --- | --- | --- |
| claude-code / claude-fable-5 | Gale guards Eyrie (`33f49e`) | design-verify + plan-author + 3 review rounds + coherence | 2026-07-08 |
| claude / claude-opus-4-8 | Kiln wakes Copper (`48382d`) | successor — logging re-exploration + ready-for-review handoff | 2026-07-08 |

Next session picks up from the **Next safe step** above (logging review round), on a
different machine. No claims retained.
