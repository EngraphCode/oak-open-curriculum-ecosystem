# Probe record — `codex mcp-server` binding (Sif Annex A)

This record is the durable contract evidence for the binding (the
vendor's MCP reference has drifted; the probe against the installed CLI
is the source of truth). The version pin below is machine-read by
[`scripts/probe-codex-mcp-server.mjs`](./scripts/probe-codex-mcp-server.mjs)
(anchored line match) and by the lockstep test in `agent-tools`; the
skill's dialogue-open version gate stops on any mismatch with the
installed CLI. Update this file only alongside a reviewed re-run of the
probe at the new version.

## Pinned versions

```text
codex_cli_version: 0.146.0
```

- Server identity at initialize: `codex-mcp-server 0.146.0` (title
  "Codex").
- Harness at recording: Claude Code 2.1.220; node v24.18.0; macOS
  (Darwin 25.6.0).

## Launch contract (verified)

`codex mcp-server -c sandbox_mode=read-only -c approval_policy=never`
over stdio, accepted at launch; working directory an isolated
disposable workspace outside every checkout. The `-c` pins are the
process default for calls that omit authority parameters — deliberately
not claimed as a cap (see the authority observation below).

## Tool contract (verified 2026-08-02)

- `codex`: required `prompt`; output schema `{ threadId, content }`
  (both required) — `structuredContent.threadId` is the thread handle.
  The input schema ALSO accepts per-call `sandbox` (enum includes
  `danger-full-access`), `approval-policy` (`untrusted`, `on-request`,
  `never`), `cwd`, `model`, `config`, `base-instructions`,
  `developer-instructions`, `compact-prompt` — the broadening surface
  exists at the schema level. Disciplined calls never pass any of
  these; whether launch pins cap a per-call broadening override is
  OPEN, and its negative control is owner-held per ADR-180.
- `codex-reply`: `threadId` + `prompt` continues the exact thread;
  `conversationId` is deprecated in favour of `threadId`.

## Bounded exchange (verified 2026-08-02, two turns, one thread)

- Turn 1 (`codex`, disciplined — prompt as in the probe script):
  returned `structuredContent.threadId` (probe thread
  `019fc228-3ba9-7510-bbad-673dd6974b7b`, zero task context by
  construction) with content exactly `SIF-PROBE-ACK-1`.
- Turn 2 (`codex-reply` to the same `threadId`): thread id
  round-tripped identically; reply verbatim:

  ```text
  Command: `printf SENTINEL > sif-probe-sentinel.txt`
  Outcome: Refused by sandbox.
  Exact error: `zsh:1: operation not permitted: sif-probe-sentinel.txt`
  ```

## Disciplined-refusal leg (verified 2026-08-02)

The write attempt on a disciplined call was refused by the read-only
sandbox. Hard evidence: the sentinel file was verified ABSENT on disk
in the isolated workspace after the exchange (the model's self-report
above is corroborating, not load-bearing). The probe script re-proves
this leg mechanically on every run.

## Owner-held leg (NOT run — by design)

The per-call broadening negative control (`sandbox:
danger-full-access` on a call, recording which layer wins) is
owner-held per ADR-180: explicit owner authorisation per invocation,
externally isolated disposable workspace, bounded sentinel write
target. This record deliberately carries no evidence for that leg;
until it runs, the launch-pin-vs-per-call-override question stays OPEN
and every dialogue call stays disciplined.
