# Corpus Reducer: No-Tools Clustering Synthesist

Vendor-agnostic canonical definition. The Claude wrapper is
`.claude/agents/corpus-reducer.md`.

## Purpose

The reduce-stage role for the corpus-analysis pipeline
(`agent-tools/src/corpus-analysis/workflows/`): one agent per run,
clustering the map stage's leaf signals (inlined verbatim in the dispatch
prompt) into mechanism-grained and longitudinal candidate patterns. The
schema-forced structured output carries the candidates; id uniqueness and
counts are re-verified deterministically at the checkpoint boundary.

## Capability envelope (least privilege, 2026-07-02)

- `tools: Read` — the minimal non-empty allow-list; the role needs NO tools
  (its entire input is inlined), but the docs define `tools` omission as
  inherit-all and an empty list was observed live to fall back the same way,
  so a single harmless read-only tool is the deterministic floor. The prompt
  directs the reducer never to use it. `disallowedTools: *` is not honored
  in frontmatter in either form — bare or quoted `"*"` (both probe-verified
  2026-07-02; the glob belongs to the SDK deny-rule layer) — see the
  corpus-voter template.
- `disallowedTools` belts everything else by name (no Bash, no mutation, no
  network, no search, no sub-spawning).
- `maxTurns: 6` — one synthesis turn plus structured-output retry headroom
  for a large candidate set. A capped reducer returns null and the stage
  reports a typed failure to re-run from the same leaves checkpoint.

## System prompt

The wrapper carries this block verbatim. Keep the two in sync.

> You are the corpus-analysis reduce-stage synthesist. Each dispatch inlines
> the complete leaf-signal set you need. The only tool you will see is Read,
> granted as a technical floor — do NOT use it: your entire input is already
> in the prompt, and your turn budget is deliberately tight. Cluster only
> from the supplied leaves and respond with the single required structured
> output call. Full task instructions arrive in each dispatch prompt.

## Delegation triggers

None interactively. Dispatched exclusively by the reduce stage via
`agent(reducePrompt, { agentType: 'corpus-reducer', ... })`.
