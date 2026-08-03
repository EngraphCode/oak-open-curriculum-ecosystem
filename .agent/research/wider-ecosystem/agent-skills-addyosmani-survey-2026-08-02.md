# Survey: `addyosmani/agent-skills`

**Date:** 2026-08-02
**Method:** broad and shallow — GitHub API reads, a shallow clone for frontmatter extraction, and three skill files sampled at depth out of twenty-four.

## Verdict

`addyosmani/agent-skills` is a small, flat, single-axis corpus — 24 skills, each one `skills/<kebab-name>/SKILL.md`, with a two-field frontmatter (`name`, `description`) and nothing else machine-readable about them. Its taxonomy (Meta / Define / Plan / Build / Verify / Review / Ship) lives entirely in prose: README tables, an ASCII router inside the `using-agent-skills` meta-skill, and comments in a directory tree. Nothing in the filesystem or the frontmatter encodes it. The corpus is nonetheless the most seriously **validated** public skills pack I am aware of: it ships a three-tier eval harness where tier 1 lints structure, tier 2 deterministically measures whether each description actually routes its own realistic prompts (and whether any two descriptions have collided), and tier 3 grades an agent's execution trace against per-skill `expectations[]`. Content quality in the sampled files is high — process-shaped, specific, with an "anti-rationalisation table" device that pairs each skip-excuse with a rebuttal — and the intellectual lineage is openly Google's *Software Engineering at Google*. For WS0 the repository's value is mostly **evidential rather than adoptive**: it is a natural experiment in what an unencoded taxonomy costs you, and it arrived independently at a `kind` axis (in its eval schema, not its skills) under exactly the pressure our deliberation is anticipating. For direct adoption, one skill (`doubt-driven-development`) is genuinely worth a detailed look; most of the rest collide with first-party practice we already hold at greater depth. Licence is MIT and unproblematic.

## 1. Scale and shape

**Counts.** 24 skills (23 lifecycle + 1 meta), 4 agent personas, 7 shared reference checklists, 8 slash commands replicated across four harness formats, 7 hook scripts, 5 validation/eval scripts, 12 setup and design docs. Total repo size 671 KB. Skill bodies run 178–467 lines; `docs/skill-anatomy.md` sets a 500-line ceiling.

**Organisation: flat, one level, no families.** Every skill is a sibling directory under `skills/`. There is no nesting, no family bundle, no sub-corpus. 23 of the 24 skills are a *single file* with no supporting material at all. The sole exception is `idea-refine`, which carries `examples.md`, `frameworks.md`, `refinement-criteria.md` and a `scripts/` directory in its own directory.

**Naming.** Directory name is lowercase-kebab and must equal the frontmatter `name` — the linter enforces the match. Names are descriptive noun-phrases or gerunds of the activity (`code-review-and-quality`, `spec-driven-development`, `deprecation-and-migration`), not verbs and not prefixed. The file is always `SKILL.md`, uppercase.

**Frontmatter is two fields.** `name` and `description`, both required, description capped at 1024 characters. There is no version, no licence, no kind, no stratum, no owner, no dependency list, no tool declaration, no trigger list, no `allowed-tools`. Every other property of a skill is either prose inside the body or inferred by convention.

**Body structure is a recommended pattern, not a schema.** The documented section flow is Overview → When to Use → Process → Common Rationalizations → Red Flags → Verification. `docs/skill-anatomy.md` and `CONTRIBUTING.md` both explicitly downgrade this from a template to a convention, permitting "equivalent headings" such as `Workflow` or `Core Process`. In practice adherence is near-total: I checked all 24 for four marker headings and 22 carry every one. The two that do not — `using-agent-skills` and `idea-refine` — are **hard-coded by name as exemptions inside the linter** (`scripts/lib/skill-lint.js`), because there is no field on the skill from which the validator could derive that they are a different kind of thing.

**Manifest / index mechanism: none, in the machine-readable sense.** Discovery is by directory scan. What exists instead is:

- Hand-maintained README tables (the seven-phase catalogue) — the only place the taxonomy is written down for humans.
- An ASCII decision tree plus a "Quick Reference" table inside `skills/using-agent-skills/SKILL.md` — the same taxonomy again, restated for agents, and a second hand-maintained copy that can drift from the first.
- A "Project Structure" tree in the README with the phase written as a trailing comment per directory — a third copy.
- Four plugin manifests naming the *pack*, never its members: `.claude-plugin/marketplace.json` + `.claude-plugin/plugin.json` (Claude Code), `.codex-plugin/plugin.json` (Codex), `.agents/plugins/marketplace.json` (Antigravity), root `plugin.json`.
- `.opencode/skills` — a 10-byte blob, i.e. a symlink into `skills/`.

So the pack is addressable as a unit by five different harnesses, and individual skills are addressable only by path or by the `npx skills add … --skill <name>` CLI. **Cross-skill references are by bare name** in prose ("Follow the `test-driven-development` skill"), with no path, no version, and no resolution mechanism — the linter validates that the named skill exists.

**Shared material is hoisted out of the bundles, and they document the cost.** The seven checklists in root `references/` (definition-of-done, testing-patterns, security-checklist, performance-checklist, accessibility-checklist, observability-checklist, orchestration-patterns) are referenced by 18 links across the skills — `security-checklist.md` from five skills, `definition-of-done.md` from four. `skill-anatomy.md` calls this "a pack-level design choice" made against the Agent Skills spec's self-contained-directory model, names the two rejected alternatives (copy into every consumer; nominate one owner skill and have others reach in), and then states the price honestly: a per-skill install that copies only `skills/<name>/` leaves the sibling `references/` behind and every link resolves to nothing. That gap is a tracked open issue (#361).

## 2. Content character

**Kind.** Overwhelmingly *workflow* skills — process discipline for phases of software delivery. The stated first writing principle is "Process over knowledge. Skills are workflows, not reference docs. Steps, not facts." A minority are cognitive or epistemic in shape: `doubt-driven-development`, `interview-me`, `idea-refine`, `source-driven-development`, `context-engineering`. Exactly one is tooling-specific (`browser-testing-with-devtools`, bound to Chrome DevTools MCP). One is meta (`using-agent-skills`). There are no domain skills — nothing about a product, a data model, or a business.

**Quality signals from the sample.** `doubt-driven-development`, read in full, is strong work. It defines "non-trivial" by five falsifiable tests rather than by feel; it names a five-step protocol (CLAIM → EXTRACT → DOUBT → RECONCILE → STOP) with a copyable checklist; it insists the reviewer receive the artefact and contract but **not** the claim, on the stated ground that handing over a conclusion buys you agreement; it classifies findings under an explicit precedence order where "contract misread" outranks "actionable"; it bounds the loop at three cycles and treats a fourth as information about the artefact rather than a reason to grind; and it defines a checkable anti-signal it calls "doubt theatre" — two or more cycles with substantive findings and zero classified actionable. It also carries a genuine safety property: cross-model escalation to an external CLI requires per-invocation user authorisation, mandates a read-only sandbox because the artefact under review may itself carry injected instructions, and forbids interpolating the artefact into a shell-quoted argument.

`using-agent-skills` is thinner but load-bearing: six numbered "core operating behaviours" (surface assumptions, manage confusion, push back, enforce simplicity, scope discipline, verify-don't-assume), a ten-item failure-mode list, and the router.

`git-workflow-and-versioning` (sampled to line 140 of 355) is competent and generic — trunk-based development, atomic commits, conventional-commit types, ~100-line change sizing with a 1000-line split threshold. It hedges appropriately ("teams using gitflow can adapt the principles").

**Specificity** is a stated bar and is largely met — "Run `npm test` and verify all tests pass" beats "make sure the tests work" is the worked example in the anatomy doc. **Testability** is the strongest dimension: every skill ends in a Verification checklist of evidence-bearing checkboxes, and `doubt-driven-development`'s nine-item list is auditable line by line.

**Provenance is the weakest dimension.** The README credits *Software Engineering at Google* and Google's engineering-practices guide as the source of Hyrum's Law, the Beyoncé Rule, the test pyramid, change sizing, Chesterton's Fence, trunk-based development and Shift Left. That is honest at pack level. But no individual claim inside a skill carries a citation, no guidance is dated or version-pinned, and "battle-tested" is asserted in the contribution bar rather than evidenced per skill. A skill can therefore go stale silently; the `skill-gap.yml` issue template exists precisely to catch that from users after the fact.

**Target harnesses.** Deliberately many. Native install paths documented for Claude Code (plugin marketplace), Codex (v0.122+ plugin), Gemini CLI, Antigravity CLI, Cursor, Windsurf, OpenCode, GitHub Copilot and Kiro; plus `npx skills add addyosmani/agent-skills` via the open `vercel-labs/skills` CLI, which the README claims reaches 70+ agents. Slash commands are maintained in four parallel formats (`.claude/commands/*.md`, `.gemini/commands/*.toml`, `commands/*.toml`, and the Codex plugin's read of `skills/`), with a `scripts/validate-commands.js` enforcing parity between them. There is an active workstream (#404) removing npm-specific assumptions from skills so guidance holds in non-JavaScript ecosystems.

**Validation and evals — the notable part.** `evals/README.md` states three tiers:

| Tier | Checks | Where | Cost |
|---|---|---|---|
| 1 Structural | frontmatter, naming, required sections, command parity | CI | free |
| 2 Trigger & routing | positive prompts rank their own skill top-k; negative prompts route elsewhere; no two descriptions collide | CI | free |
| 3 Behavioural | an agent following the skill satisfies `expectations[]` | on demand | tokens |

Tier 2 is the part with no prior art and it is the part most worth stealing. It is a stemmed TF-IDF approximation over the descriptions alone. It reports a **rank-1 rate** (share of realistic positive prompts for which the right skill ranks first, not merely top-k), CI enforces a floor of 80% against a checked-in 86% baseline, and the documentation says explicitly: never lower the floor to make a regression pass; a falling number means descriptions are drifting toward each other. A separate pairwise description-similarity check **errors at ≥75% and warns at ≥50%**. Negative trigger cases may declare an `owner` skill, which turns "this skill must not rank first" into the sharper "the owner must outrank this skill" — closing the vacuous pass where the prompt simply matched nothing.

Tier 3 adopts Anthropic's skill-creator `evals.json` schema and adds **one field: `kind`, either `execution` or `dialogue`** — because the harness could not otherwise tell whether to grade a file-and-command trace or a conversation. `dialogue` is described as "a human-reviewed exemption, not a general escape hatch". Execution evals run in a throwaway git repository seeded from `evals/fixtures/`, and traces are fenced as untrusted data in the grader prompt and piped over stdin. Discipline skills additionally carry **pressure fixtures** — time pressure, sunk cost, authority pressure — that verify the workflow still holds when the prompt argues for skipping it.

Coverage is 1:1 and CI-enforced: 24 skills, 24 files in `evals/cases/`, each requiring ≥3 positive triggers, ≥2 negative triggers and ≥1 behavioural eval. Missing case files, wrong counts, unknown kinds and absent fixtures are all CI errors.

## 3. Governance

**Licence.** MIT, clean, single `LICENSE` file, restated in the plugin manifest and in `CONTRIBUTING.md` ("by contributing, you agree that your contributions will be licensed under the MIT License"). No CLA. Vendoring is unencumbered beyond retaining the copyright notice.

**Ownership and activity.** Created 2026-02-15. 81,306 stars, 8,766 forks, 144 open issues. Three named maintainers (Addy Osmani as creator, Federico Bartoli and Joan León as collaborators); Osmani holds 218 of roughly 300 attributed commits, so this is a benevolent-dictator repository with a growing contributor tail. 79 commits in the 30 days to 2026-08-02, last push 2026-07-26 — actively maintained, with community PRs being merged by all three maintainers.

**Contribution model.** Notably anti-entropy for a repo of this popularity. `CONTRIBUTING.md` opens the new-skill path with a four-step pre-flight — search the catalogue, check open PRs for near-duplicates, confirm the idea fits the anatomy, and *justify the gap explicitly in the PR description* — and states that a refinement of an existing skill must be a focused edit rather than a new directory. The same guardrail is duplicated as a path-scoped agent rule at `.claude/rules/skills-contributing.md` (scoped to `skills/**`) which points at CONTRIBUTING rather than restating it. Structure requirements (frontmatter, eval case with minimum counts, backing fixtures) are CI-enforced, not merely documented. Translations are refused outright, with drift-cost as the stated reason. A `skill-gap.yml` issue form collects the affected skill, the offending excerpt, the reporter's project context and what they did instead.

**Versioning and update story.** Tags `0.6.1` … `0.6.5` version the *pack*, not skills; individual skills carry no version, no changelog and no deprecation marker. Consumers who install by marketplace or `npx skills add` take whatever `main` holds; there is no per-skill pin. For a lock-pinned external-skill class this means the pinnable unit is a commit or tag of the whole repository, and a pin bump is an all-or-nothing re-read of everything vendored.

## 4. Relevance to our estate

### (a) Evidence for the WS0 structure deliberation

Five findings bear on the live deliberation. The first two are the strongest.

**1. They arrived at a `kind` axis independently, under validation pressure — twice.** Their skills carry no kind field. The moment they wrote a structural linter, they had to hard-code two skill names as section-check exemptions, because a meta-skill and a conversation-shaped skill do not have the same obligatory sections as a workflow skill and there was no field to key that off. The moment they wrote a behavioural eval harness, they had to *add* a field to Anthropic's schema — `kind: execution | dialogue` — because the grader could not otherwise know what artefact to grade. That is two independent arrivals at the same axis, both forced by validation rather than by taste, in a corpus one-third smaller than ours. It is the strongest single piece of evidence in this repository that an encoded kind axis is load-bearing rather than decorative, and that leaving it implicit relocates the cost into the validator as a hard-coded exemption list.

**2. Nested family bundles: they went flat, hoisted the shared material, and published the bill.** 23 of 24 skills are one file. Material shared between skills was moved *up* to a repo-root `references/`, and `skill-anatomy.md` documents both the alternatives rejected and the price paid: the pack is no longer per-skill installable, because a copy of `skills/<name>/` leaves its references behind and the links resolve to nothing (issue #361). The general principle this evidences is sharper than "flat vs nested": **the distribution unit must be the thing that carries what the skill needs.** If our external-skill class vendors at per-skill granularity, hoisted shared material breaks; if it vendors whole packs, it does not. Their answer to the family-bundle question is therefore contingent on their distribution model, and ours should be too.

**3. An unencoded taxonomy has to be written down three times.** Their seven-phase classification exists in the README catalogue tables, again in the README project-structure comments, and again in `using-agent-skills`'s router and quick-reference table. All three are hand-maintained and nothing checks them against each other or against the filesystem. At 24 skills this is survivable. It is a clean demonstration of what "held in prose" costs at the point where a fourth surface wants the same fact.

**4. Descriptions as the sole routing surface degrade measurably — and they measure it.** Because intent is expressed only in the description, they built a deterministic check for the two failure modes that follow: a description lacking the vocabulary users actually say, and an over-broad description that outranks the right skill. Rank-1 rate with a CI floor, plus pairwise similarity erroring at 75%. Whatever WS0 concludes about an intent axis, **this measurement is adoptable independently of the conclusion** and would tell us something true about our own corpus within a day. It is also a falsifiable-structure-at-the-surface instrument of exactly the kind the estate prefers.

**5. Stratum: no analogue, and the omission shows.** The repository has five layers in practice — skills, personas (`agents/`), shared checklists (`references/`), commands, hooks — but they are directories, not a declared classification, and there is no ordering or precedence between them. The meta-skill `using-agent-skills` sits as a peer of its own subjects in the same directory; only prose and a linter exemption mark it as different. Their one explicit precedence rule — "personas do not invoke personas", in `references/orchestration-patterns.md` — is stated as prose and enforced by a paragraph in `doubt-driven-development`'s "Loading Constraints" section warning contributors not to add that skill to a persona's frontmatter. That is a stratum constraint enforced by asking people to remember it.

### (b) Adoption candidates worth a detailed look

- **`doubt-driven-development`** — the one clear candidate. It occupies adjacent ground to our Cricket practice and our reviewer-dispatch discipline, but the specific mechanisms are ones I did not find equivalents for: withholding the claim from the reviewer, the four-class finding precedence with "contract misread" first, the three-cycle bound with decomposition rather than bound-lifting as the escape, and the "doubt theatre" checkable anti-signal. Read it against our existing practice before adopting; the value may be in harvesting mechanisms rather than vendoring the file.
- **`interview-me`** — requirements interrogation at one question per turn to ~95% confidence. Adjacent to `concept-exploration` but a different shape (extraction from a person, not exploration of material).
- **`deprecation-and-migration`** and **`performance-optimization`** — no first-party equivalents I can name in our corpus; worth a look purely as coverage.
- **The tier-2 eval harness** (`scripts/run-evals.js`, `scripts/lib/skill-lint.js`) — higher expected value than any single skill, but it is tooling, not a skill, so it will not arrive through the external-skill class. Flagging it as a separate adoption question.

### (c) Overlap and conflict with what we plausibly already hold

Flagged by name only, no assessment of which is better.

| Their skill | Our nearest first-party surface |
|---|---|
| `git-workflow-and-versioning` | `oak-commit`; rules `never-commit-to-main`, `no-parallel-long-lived-branches`, `stage-by-explicit-pathspec`, `coordination-branch-24h-lifetime` |
| `code-review-and-quality` | `oak-pr-lifecycle`; `code-expert` and the reviewer fleet; `review-ratchet` |
| `test-driven-development` | `test-expert` doctrine |
| `documentation-and-adrs` | `oak-tsdoc`; `docs-adr-expert`; `adrs-state-should-be-means-live-in-plans` |
| `planning-and-task-breakdown`, `spec-driven-development` | `oak-plan`; `oak-ticket-management` |
| `shipping-and-launch`, `ci-cd-and-automation` | `oak-pr-lifecycle`; `oak-gates`; `release-readiness-expert` |
| `security-and-hardening` | `security-expert` |
| `frontend-ui-engineering` | `oak-design-system-usage`; `design-system-expert`; `accessibility-expert` |
| `code-simplification` | the `simplify` command |
| `idea-refine` | `oak-concept-exploration`; `oak-free-play` |
| `context-engineering` | the `oak-start-right-*` family |
| `browser-testing-with-devtools` | `claude-in-chrome`; rule `oak-chrome-session-is-metered` |
| `using-agent-skills` | `AGENT.md` and the directive layer |
| `observability-and-instrumentation` | `sentry-expert` (an agent, not a skill) |
| `debugging-and-error-recovery` | no first-party equivalent named |

Two live conflicts to note rather than assume away. `git-workflow-and-versioning` prescribes a generic conventional-commit format and trunk-based branching; our estate has live commitlint constraints enumerated at draft time and a coordination-branch lifetime rule, so its guidance is not merely redundant but locally wrong in places. `browser-testing-with-devtools` assumes free browser interaction; our Chrome session is metered by standing rule.

One incidental namespace note: their repository uses `.agents/plugins/` for an Antigravity plugin manifest. Our estate uses `.agents/skills/` for vendored third-party skills. Same top-level directory, unrelated meanings — worth knowing before any vendoring lands.

## Sampled files

Read in full:

- `README.md`
- `CONTRIBUTING.md`
- `docs/skill-anatomy.md`
- `evals/README.md`
- `scripts/validate-skills.js`
- `.claude/rules/skills-contributing.md`
- `.claude-plugin/marketplace.json`
- `skills/using-agent-skills/SKILL.md`
- `skills/doubt-driven-development/SKILL.md`

Read in part:

- `skills/git-workflow-and-versioning/SKILL.md` (lines 1–140 of 355)
- `scripts/lib/skill-lint.js` (grep for rule strings only)

Read at frontmatter level only (all 24):

- `skills/*/SKILL.md` — `name`, `description`, line count, presence of supporting files, and presence of the four marker section headings

Metadata queried via API: repository record, full recursive tree (253 entries), the last 15 commits, top-10 contributors, tags, and the 30-day commit count.

## What this survey did NOT look at

This was breadth over depth by design. Specifically not examined:

- **21 of the 24 skill bodies.** Any statement above about "content quality" generalises from two files read in full plus 40% of a third. The frontmatter sweep tells us descriptions are consistently shaped; it tells us nothing about whether the 21 unread bodies are as good as `doubt-driven-development`.
- **Factual correctness of any technical claim inside any skill.** Whether the OWASP guidance, the Core Web Vitals targets, the WCAG references or the CI patterns are current was not checked at all. This matters more than usual because no claim in the corpus is dated or version-pinned.
- **All seven root `references/` checklists** — 60 KB of the material that five skills depend on.
- **The four `agents/` personas** and `references/orchestration-patterns.md`, despite orchestration precedence being directly relevant to the stratum question.
- **All eight slash commands** in any of their four formats.
- **The hooks and scripts as executable artefacts.** `hooks/` ships seven shell scripts including a session-start hook that injects the meta-skill into every Claude Code session, plus `sdd-cache-pre.sh`, `sdd-cache-post.sh` and `simplify-ignore.sh`. These run on the user's machine on plugin install. **No security or supply-chain review of them was performed.** No adoption decision should proceed without one.
- **`scripts/run-evals.js`** (22 KB) beyond its README description, and `scripts/lib/skill-lint.js` beyond a grep. The three-tier eval account above is what the documentation claims, not what I verified the code does.
- **No validator or eval was executed.** The 86% rank-1 baseline and the 80% CI floor are reported figures, unverified.
- **The 144 open issues and all pull requests**, including #361 (the per-skill-install references gap) and #351 (known description-vocabulary gaps) which are cited above from prose references only.
- **`docs/comparison.md`** (15 KB), their own side-by-side against Superpowers and `mattpocock/skills` — the obvious next read for anyone weighing this pack against alternatives.
- **Any dynamic behaviour.** Nothing was installed, invoked, or observed running.
- **Licence provenance of material quoted inside skills** from *Software Engineering at Google* and Google's engineering-practices guide. MIT covers their prose; it does not by itself settle the status of substantial quoted third-party material, and I did not look for any.
