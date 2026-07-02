# Corpus Voter: Single-Turn No-Tools Adversary

Vendor-agnostic canonical definition. The Claude wrapper is
`.claude/agents/corpus-voter.md`.

## Purpose

The adversary voter role for the corpus-analysis validate workflow
(`agent-tools/src/corpus-analysis/workflows/`). Each dispatch supplies one
candidate pattern plus its verbatim grounding excerpts and requests four
conjunctive apophenia-test judgments via a schema-forced structured output
call. The deterministic adjudication state machine makes every routing
decision; the voter judges exactly one candidate and emits nothing else.

## Why no tools (measured, 2026-07-02)

Free-tool voters spent ~7 tool calls each re-verifying their supplied
grounding against the corpus; every call re-read ~50k of cached context,
putting a voter at 350–800k input tokens for ~3–4k of judgment output. The
verification the voters were re-doing belongs in deterministic code
(PDR-122: code verifies mechanics, agents judge semantics): survivors'
grounding quotes are machine-verified against the pinned corpus by the
post-run driver. Removing the tool surface is harness-enforced (the wrapper's
`tools` frontmatter is a deterministic allow-list, not prompt compliance) and
also shrinks the per-turn context the tool definitions would occupy.

## Capability envelope (least privilege, 2026-07-02)

- `tools: Read` — the minimal non-empty allow-list. The docs define `tools`
  omission as inherit-all, and `tools: []` was observed live to fall back the
  same way (the registry reported "All tools"), so a single harmless
  read-only tool is the deterministic floor. The prompt directs the voter
  never to use it. `disallowedTools: *` is NOT a shortcut: the SDK deny-rule
  glob (`disallowed_tools=["*"]`) lives in the SDK options layer; the
  frontmatter field parses plain tool names, and a fresh-registration probe
  (2026-07-02) confirmed a bare `*` leaves the full inherited surface.
- `disallowedTools` belts everything else by name (no Bash, no mutation, no
  network, no search, no sub-spawning).
- `maxTurns: 4` — the deterministic cap on the measured cost driver (turn
  count). The ideal voter answers in one turn; four allows a structured-output
  retry. A voter that hits the cap returns null, which the adjudication state
  machine already handles as a first-class `unadjudicated` outcome — never a
  silent drop, never a stranded candidate.

## System prompt

The wrapper carries this block verbatim — it cannot point here because a
no-tools agent cannot `Read`, and the role's economics forbid extra turns.
Keep the two in sync when editing (pairing note in both files).

> You are a corpus-analysis adversary voter. Each dispatch supplies the
> complete evidence you need: one candidate pattern and its grounding
> excerpts, extracted mechanically from a pinned corpus. The only tool you
> will see is Read, granted as a technical floor — do NOT use it: reading
> files would only duplicate verification that deterministic code performs
> after the run, and your turn budget is deliberately tight. Judge only from
> the supplied evidence and respond with the single required structured
> output call. Full task instructions arrive in each dispatch prompt.

## Delegation triggers

None interactively. This agent type is dispatched exclusively by the validate
workflow via `agent(votePrompt, { agentType: 'corpus-voter', ... })`; it is
not for main-loop delegation.
