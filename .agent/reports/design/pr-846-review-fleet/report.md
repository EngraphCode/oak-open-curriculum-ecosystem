# PR #846 review fleet — W1/W2 report

Status: T3 pre-flight complete; W1 executing. This header is written at
launch so the pins survive any session boundary; findings, verdicts,
the knowns table, and the cross-check output land at T4.

## Header (T3 pre-flight record, 2026-08-12 evening)

- Plan: `.agent/plans/delivery/pr-846-review-fleet.plan.md`, ratified
  revision 2 (owner card "Sanction W1 now", 2026-08-12; coordination
  commit `3b1e5fcce`). Visibility ticket: MCP-591.
- Object: PR #846, `BASE=d105b4ab207bf8c800f80460983aef3f5a0940a3`
  (merge-base with `origin/main`),
  `HEAD=5243224f9091b1afcf5b96fa0f0a6a1ca0d40e44`.
- changedFiles assertion: range file count 99 == PR `changedFiles` 99 —
  PASS.
- Session model: the claim-registry binding for claim `645b9e0b`
  (platform `claude`, registry model string `Opus-5`, session `d0274e`)
  is unchanged since claim open — F-159 check reconciled; every leg
  inherits the session model.
- Server mode: production (`next start`, port 3020), fresh `next build`
  at launch.
- Export reference: two-root overlay server via its module contract
  (`resolveExportRoots`/`serveRoots` — EPHEMERAL port by contract; the
  plan's "fixed port 3030" was authoring drift against the module's
  `listen(0)` and is recorded as such). Styled-sentinel: PASS at T3 on
  BOTH pages (`whitelabel/specimen.html`, `Identity Switchboard.html`)
  — kit CSS resolved 200 with byte counts 39516/41399/2054/5856. The
  fidelity pipeline (L11) self-manages its export arm.
- Fresh suite counts at T3 (forced, uncached): showcase Playwright
  70/70 (27 UI + 43 a11y); unit/integration tasks across the five lane
  workspaces 22/22 green (fidelity-review 205 cells; showcase 116).
- Reviewed-object note: revision 2 adds P7 (fidelity instrumentation —
  the S2a/S2b landings) to the manifest; leg assignments L1/L5/L6/L9
  (+L8 capture tooling) per the revision note.

## Findings, verdicts, knowns, cross-check

(Lands at T4 adjudication.)
