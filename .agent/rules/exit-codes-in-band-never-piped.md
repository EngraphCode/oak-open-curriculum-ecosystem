# Exit Codes In-Band, Never Piped

A pipeline's exit status is the LAST stage's, so any command whose exit
you need must never be piped into a filter before its status is
captured. `cmd 2>&1 | tail -6; echo "EXIT:$?"` reports `tail`'s exit —
a genuinely failing gate, push, send, or test suite reads as EXIT:0.

## Trigger

Composing any shell invocation whose success you will act on: gates,
`git push`/`git commit`, comms sends, CLI ceremonies, test runs,
backgrounded or gated commands — with NO size threshold. The falsely
green outcomes recur specifically in *small ceremony commands* where the
discipline held for expensive chains gets skipped.

## Action

- Capture the command's own status in-band, bound directly to it:

  ```bash
  cmd > tmp/out 2>&1; echo "CMD_EXIT:$?"; tail -20 tmp/out
  ```

  The `echo` must bind to the COMMAND's `$?` — redirect first, filter
  after. Never `cmd | filter; echo $?` (captures the filter's exit) and
  never `cmd | filter` alone.
- For backgrounded or gated commands, print a named in-band marker
  (`PUSH_EXIT:$?`, `SEND_EXIT:$?`, `WORKFLOW_EXIT:$?`) on its own line
  and READ it before claiming the effect happened.
- For streamed-side-effect CLIs (comms sends, registry writes), also
  verify the effect landed (the event on the stream, the ref moved, the
  registry row changed) — a grep filter over a failed send returns empty
  and reads as quiet success, not as failure.
- When a command fails, capture the FULL output on that first run —
  `tail -N` on a failure swallows the reason and forces a re-run
  (sibling discipline: capture-expensive-command-output-first-run).

## Why

Six estate recurrences across five independent seats (2026-07-17 →
2026-07-20), each despite the lesson being held in per-user memory: a
backgrounded push gate, a test suite, a watcher-liveness assert, a
commit-message check, a comms send behind a grep filter, and a
`gh pr checks | tail` that hid failing rows. A false green at a landing
boundary converts silent failure into a false completion claim —
"commit landed", "pushed", "suite passed" — that peers and successors
then build on. Per-user memory does not reach other seats; this rule is
the estate-wide traction cure (PDR-098 recurrence-despite-home).

## Enforcement

Behavioural at command-composition time. The structural cure candidate —
a gate-runner helper that owns capture — is legitimate future tooling;
until it exists, the in-band capture shape above is mandatory.
