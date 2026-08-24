# Next-Session Record - `cloud-environment-bootstrap` thread

Provisioning the shared claude.ai "Practice Repos" cloud environment
(one environment, every Practice repo; one repo per session — owner
ruling 2026-08-23). Canonical artefacts live in BOTH repos, identical:
`.agent/claude-harness-integrations/cloud-environment-setup.sh` (the
pasted setup script's reference copy), `cloud-environment-preflight.sh`
(the read-only probe harness), and `cloud-environment.md` (operating
doc, incl. § Validating and diagnosing — the edit→preflight→paste loop).
castr carries the twin copies; this record is the thread's single home.

## Current Continuation — ENVIRONMENT BROKEN, DIAGNOSIS IN FLIGHT

- **Live problem (owner report 2026-08-24): fresh sessions are NOT
  starting.** The failure-card text has not yet been seen by any agent;
  the dialog paste has not been verified against the merged reference
  (the dialog is write-only — drift is undetectable from a session).
  Diagnosis continues IN the 2026-08-24 session (Buzzard weaves
  Airstream) because no fresh session can start while the environment
  is down.
- **Prime suspect (grounded 2026-08-24, in-session preflight run):**
  gitleaks release assets redirect to
  `release-assets.githubusercontent.com` — a host that appears nowhere
  in the script text and was previously assumed to be
  `objects.githubusercontent.com`. If the setup-time egress allow-list
  lacks it, the setup dies in the gitleaks phase. Unconfirmed until a
  setup-time preflight card or failure card is read.
- **Next safe step**: run the diagnosis loop in
  `cloud-environment.md § Validating and diagnosing` — (1) owner
  supplies the failure-card text (phase banners now localise it);
  (2) if inconclusive, owner pastes `cloud-environment-preflight.sh`
  as a temporary environment script and reads the card (complete
  falsification list in one round-trip); (3) fix what it names
  (allow-list first); (4) re-paste the reference setup script.
- **Setup-time-unconfirmed hosts register** lives in
  `cloud-environment.md § Suspected-fragile hosts register`; retire
  entries as setup-time cards confirm them.
- Standing owner rulings the thread carries: fail-fast ("we WANT it to
  fail if it fails"); no version hard-coding (Node major floats from
  the carried repo's engines; pnpm from packageManager via Corepack);
  SHASUMS transfer-integrity only, no keyring/pinned-digest trust
  level ("we don't need keyring levels of trust, at least not yet");
  OCE PRs target `engraph`, never main.
- Landing target for the next session on this thread: a fresh session
  starts cleanly on the current environment (positive confirmation),
  and the suspected-fragile register is emptied or shortened by
  evidence from real setup-time cards.

## History

- 2026-08-23: script rebuilt fail-fast + discovery-driven; merged via
  OCE #9/#10/#11 and castr #42–#45 arcs (see those PRs). Network moved
  Trusted → Custom (+ ppa.launchpadcontent.net, cdn.playwright.dev,
  playwright.download.prss.microsoft.com) after the Trusted preset
  403'd the PPA at setup time only.
- 2026-08-24: environment reported broken (fresh sessions not
  starting). Validation-harness arc: metacognition verdict — the
  2026-08-23 "verified live" claim rested on hand-running the script
  in a dirty persisted container, which proves nothing about fresh
  containers; the cure is structural instrumentation, not doc-patching.
  Landed: phase banners + ERR trap in the setup script (the failure
  card now names its phase, line, and command), the preflight probe
  harness, the § Validating and diagnosing protocol, and the
  suspected-fragile register.

## Participating agent identities

| platform | model | agent_name (seed) | role | last_session |
| --- | --- | --- | --- | --- |
| claude-code (cloud) | claude-fable-5 | Buzzard weaves Airstream (01e90b) | environment repair + harness author; merged the 2026-08-23/24 PR arcs | 2026-08-24 |
