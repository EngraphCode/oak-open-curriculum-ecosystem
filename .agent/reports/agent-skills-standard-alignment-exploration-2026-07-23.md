# Agent Skills standard alignment — exploration report

**Date**: 2026-07-23 · **Author**: Hawthorn weaves Humus (3f310b), owner-assigned lane
· **Status**: exploration deliverable — implementation routes on its own word

## Question

How far is the `.agent/skills` estate from the [Agent Skills standard](https://agentskills.io/)
(the open format originated by Anthropic, adopted across the agent-client ecosystem), and what
would bring it inline — specifically the standard's elements we do not yet cover, such as its
named optional directories?

## Method

First-hand survey of all 33 canonical skills (frontmatter keys, description lengths, body
sizes, auxiliary files), the adapter generator
(`agent-tools/src/skills-adapter-generate/generator.ts`) and its checker, the governing
doctrine (ADR-125 as amended 2026-05-09 per PDR-051), and the full specification fetched from
agentskills.io (spec constraints quoted below are from that fetch, 2026-07-23).

## The standard, in brief

A skill is a directory whose name matches its required `SKILL.md`'s `name` field
(≤64 chars, lowercase alphanumerics and single hyphens). Frontmatter: `name` and
`description` (≤1024 chars, what + when) required; `license`, `compatibility` (≤500),
`metadata` (string→string map), `allowed-tools` (experimental) optional. Optional
conventional directories: `scripts/` (executable code), `references/` (on-demand docs),
`assets/` (static resources); arbitrary additional files are permitted. Progressive
disclosure: name+description at startup (~100 tokens), full body at activation
(<5000 tokens recommended, body <500 lines), bundled files only as needed. Reference
tooling: `skills-ref validate`.

## Findings

### Already compliant

- **All 33 skill names** are spec-valid (lowercase-hyphen, no violations) and match their
  directory names.
- **All 33 descriptions** are within the 1024-char limit (max observed: 905,
  `under-the-hood`) and largely follow the what+when guidance.
- **Adapter surfaces** (`.claude/skills/oak-*/SKILL.md`, `.agents/skills/oak-*/SKILL.md`)
  are standard-named `SKILL.md` files with valid minimal frontmatter.

### The deliberate divergence (a fence that stands)

The canonical filename `SKILL-CANONICAL.md` is **not** drift: ADR-125 §2 makes it
deliberately non-discoverable so no vendor scanner double-loads a canonical alongside its
generated adapter. The two-surface contract (canonical + exactly two adapter trees) is
ratified doctrine. Any alignment work keeps this shape; "rename canonicals to SKILL.md" is
explicitly rejected here.

### The real gaps

1. **The generator lags our own ratified contract.** ADR-125's adapter table already
   specifies spec-portable frontmatter pass-through (`license`, `compatibility`, `metadata`,
   `allowed-tools`) and a `metadata.claude-*` derivation mechanism for Claude-specific
   fields. The generator as built reads only `name` + `description` and emits bare pointer
   stubs. No canonical carries `license` or `metadata` at all. This is implementation lag
   against ADR-125, not a new decision.
2. **`classification` is a top-level non-spec key.** ADR-125 §9 documents it as
   canonical-only, so nothing breaks today — but under the spec's frontmatter table the
   conforming home is `metadata.classification`, which would let canonicals themselves pass
   spec validation unmodified.
3. **We do not use the standard's directory conventions.** Four skills keep companion
   documents in `shared/` (`complex-merge`, `go`, `start-right-quick`,
   `start-right-thorough`) where the standard's name is `references/`. Three skills carry
   `agents/openai.yaml` (permitted — the spec allows arbitrary extra directories — but
   undocumented in the skill's own frontmatter). No skill uses `scripts/` or `assets/`
   though several embed runnable command blocks that would qualify.
4. **Five bodies violate the progressive-disclosure recommendation** (<500 lines):
   `start-right-team` (971), `consolidate-docs` (893), `session-handoff` (788),
   `commit` (781), `pr-lifecycle` (678). These are loaded whole at every activation —
   the cost lands on our own context budgets today, independent of any standard. The
   spec's cure is exactly `references/`: a lean activation body plus on-demand files.
5. **No spec-rule validation.** `portability:check` verifies adapter drift but not the
   spec's numeric/format constraints (name regex, description ≤1024, dir-name match,
   body-size advisory). The `skills-ref` reference validator exists upstream.

## Proposal (phased; nothing radical)

**P1 — mechanical, generator-first (one lane):**

- Extend the canonical frontmatter contract: move `classification` under `metadata`,
  add `license` (repository licence) per skill, admit optional `compatibility` /
  `allowed-tools` / `metadata.claude-*` keys.
- Extend the generator to pass spec-portable fields through to both adapter surfaces,
  per ADR-125's existing table (closing the implementation lag).
- Rename `shared/` → `references/` in the four skills (pointer truing included).
- Extend `portability:check` with the spec's constraints (name format, description and
  compatibility limits, dir-name match; body-size as warning). Evaluate adopting
  `skills-ref validate` in CI alongside, rather than instead of, our checker.
- ADR-125 dated amendment recording the alignment.

**P2 — per-skill body splits (judgement work, one skill per PR):**

- Split the five oversized bodies into a lean `SKILL-CANONICAL.md` plus `references/`
  files, worst-first (`start-right-team` at 971 lines is loaded every team session).
  This is where most of the token saving lives; it needs care, not mechanism — each
  split must preserve trigger-time force (what must fire at activation stays in the
  body; what is consulted on demand moves out).

**P3 — packaging step (strategic; second-release hook):**

- A generator-first packaging step that emits fully self-contained, standard-compliant
  skill directories from canonicals (inlining or bundling referenced material) —
  because adapter bodies are pointer stubs, they dangle outside this repo. This is the
  direct enabler for **native agent skills**, which the owner has ruled a very high
  priority for the second release (decisions register D11). Standard-shaped skills are
  the packageable unit; P1/P2 make P3 nearly free.

## Non-goals

- Renaming canonicals to `SKILL.md` (ADR-125 fence; double-load hazard).
- Restructuring the two-surface adapter contract or the `oak-` prefix.
- Serving repository skills over MCP (governed by the served-surface lanes, not this one).

## Constraints honoured

`practice-core-portability` (no host paths enter Core; the skills estate is host-side —
untouched by Core rules but the proposal keeps references repo-relative) and
`subagent-practice-core-protection` bind P1/P2 execution. All changes are generator-first:
adapters are never hand-edited.
