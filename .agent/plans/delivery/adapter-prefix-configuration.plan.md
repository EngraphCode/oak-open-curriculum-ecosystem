---
id: adapter-prefix-configuration
node_type: delivery
name: "The adapter prefix resolves from one point of configuration"
overview: "Replace the hand-pinned adapter prefix with one resolver over a tracked default and an untracked per-checkout override behind a tracked example, proven for a second prefix in isolation while the projected skill names stay exactly as they are."
status: sketch
ratified_by: null
ratified_date: null
ratified_where: null
serves: organisational-identity-below-the-tree
impact_areas:
  - practice-and-estate
tickets: []
depends_on:
  - plan: code-quality-binding-per-checkout
    kind: beneficial
owner_gates: []
last_updated: 2026-09-05
---

# The adapter prefix resolves from one point of configuration

## Goal

The generated skill adapters carry a name prefix (`oak-` today) that is pinned by hand in
four script and hook lines and in the generator's own usage text. After this lands, the
prefix is read from one tracked default file, overridable by one untracked per-checkout
file that a tracked example describes, and both the generator and its checker resolve it
the same way. The mechanism is proven for a second prefix in an isolated root. Nothing
projected changes: this checkout keeps `oak-`, every adapter directory stays committed
and byte-identical, and the switch to another prefix on any checkout is a later, separate
decision. The owner's word on 2026-09-05: build and prove the mechanism, make the names
easier to change later, do not change them yet.

## User groups and value

- **An organisation running this repository as its own**: changing the projected skill
  names becomes one untracked file copied from an example, with no tracked edit; the cost
  and the timing of actually making that change stay theirs to choose.
- **Contributors on any machine**: `pnpm skills:generate` and `pnpm skills:check` need no
  argument and cannot disagree with each other about the prefix, because both read the
  same resolver.
- **The platform's maintainers**: the second agent-tools reader of a per-checkout file
  (the merge-bot identity file is the first) lands as the shared shape the strategic node
  named — tracked default, untracked override, tracked example, strict schema, the override
  resolved at the primary checkout — and the read-parse-name-the-example helper the two
  readers share is extracted here, so every later identity pin that takes the per-checkout
  rung reuses one helper instead of a third copy.
- **The owner**: the decision that remains — whether projections stay committed when a
  checkout overrides the prefix — is taken with a working mechanism in hand rather than on
  paper.

## Mechanism

The per-checkout rung of the strategic node's ladder, applied to the generator; the
merge-bot identity file is the precedent for every shape below. The beneficial edge to
`code-quality-binding-per-checkout` is the shape of its ignore comments and examples,
which this node copies; it ships alone, carrying its own ignore line and example, whether
or not that node has landed.

1. **The resolver**, `agent-tools/src/skills-adapter-generate/prefix-config.ts`:
   `resolveAdapterPrefix({ repoRoot, primaryRoot })` returns a `Result` carrying the prefix
   and its source (`override` or `default`). The override, `.agent/skills-projection.local.json`,
   is read at the primary checkout (the first entry of `git worktree list`, the same
   resolution the merge-bot and the collaboration substrate use) because an untracked file
   does not travel to a linked worktree; the tracked default, `.agent/skills-projection.json`,
   is read at the repository root the generator writes into, because a tracked file does
   travel with the branch and a worktree must regenerate against its own branch's default,
   never another branch's. If the override exists it wins; otherwise the default applies.
   Each file is parsed as JSON and validated through the strict-schema parse with a
   `.strict()` object of one field, `prefix`, whose grammar is a lowercase name fragment,
   `^[a-z0-9][a-z0-9-]*$` — tighter than the CLI's traversal guard, which stays on the
   explicit `--prefix` flag — and that grammar has one definition, in the resolver, which
   `cli-flags.ts` imports. The example's placeholder `<prefix->` fails the grammar by
   construction, so a copied-but-unedited override refuses loudly, naming the override, the
   example it is copied from and the field to edit, rather than minting a placeholder-named
   estate; a missing or invalid default names the tracked file. The read-parse-name-the-
   example step is the same one `agent-tools/src/merge-bot/repo-config.ts` already performs
   for the merge-bot identity file, so it is extracted into one shared helper under
   `agent-tools/src/core/` (read a JSON file at a path, parse with a strict schema, and on
   failure name the file and its example), which both readers call; the merge-bot loader's
   messages and tests stay as they are.
2. **The tracked default and the example.** `.agent/skills-projection.json` holds
   `{"prefix": "oak-"}`; `.agent/skills-projection.local.json.example` holds
   `{"prefix": "<prefix->"}`. The root ignore file gains `.agent/skills-projection.local.json`
   beside a comment naming the example and the one value to enter, in the merge-bot line's
   shape. The Practice home holds only Markdown at its top level today; the two JSON files
   sit there because the projection they configure is a Practice-wide fact, not a package's.
3. **The CLI.** In `cli-flags.ts`, `--prefix=<value>` becomes an explicit override for a
   single run and is no longer required; an omitted flag means "resolve". A new
   `--print-prefix` flag prints the resolved prefix and its source on one line and exits
   without reading or writing any projection: the proof instrument for any checkout. The
   traversal guard on an explicit `--prefix` stays. `bin/skills-adapter-generate.ts`
   resolves once and passes the prefix to `checkAdapters` and `generateAdapters`, whose
   signatures do not change.
4. **The pinned sites.** The root `skills:check` and `skills:generate` scripts, the
   `agent-tools` `skills-adapter-generate` script, the pre-push hook's regenerate hint, the
   generator's header comment and the flag parser's own usage and error text drop the
   literal `--prefix=oak-`; the hint says `pnpm skills:generate`. The commit skill's
   canonical, which tells agents the root script pins the required prefix, says instead
   that the prefix is read from the tracked default and the per-checkout override.
5. **The permanent record.** ADR-125 names the pin at three sites — the skill-adapter
   paragraph ("pinned by the root scripts"), the configurable-prefix paragraph ("the source
   default is empty; the effective prefix is passed explicitly via `--prefix=oak-`"), and
   the later restatement of the same — each corrected to say the prefix is read from the
   tracked default and overridable per checkout, with one dated change-log entry; its
   committed-adapters decision is untouched. The agent-tools README's skills section and the engineering doc's
   per-checkout file list say the same in one sentence each.
6. **Tests.** Unit tests on the shared helper (a readable valid file parses; a missing file
   names the file and its example; invalid JSON and a schema breach each name the file) and
   on the resolver: default only; override wins; an invalid override refuses naming the
   file and the example; the placeholder refuses; a missing default names the tracked
   file; the merge-bot loader's existing tests stay green through the extraction. The flag-parser tests cover the optional flag and
   `--print-prefix`. One integration test generates into a temporary repository root
   whose override says `e-`, asserts every projection lands under `e-*` with the class
   marker, and asserts the checker is green against that root. The real tree's checker
   stays green with no override present, which CI proves on the landing PR.

What this slice deliberately does not decide: whether projections remain committed when a
checkout overrides the prefix. With committed projections, an override checkout would
either list both the tracked `oak-*` set and its generated set, or clear the tracked set
and leave the tree permanently dirty; the coherent shape is untracked, install-generated
projections, an amendment to ADR-125. The owner deferred that on 2026-09-05; this slice
makes it a decision about a working mechanism, and the isolated-root proof is the evidence
it will rest on.

## Acceptance criteria (each with a proof — required)

- **One point of configuration.** `git grep -n -- '--prefix=oak-' -- package.json
  agent-tools/package.json .husky agent-tools/src agent-tools/README.md docs/architecture
  .agent/skills .agent/rules .agent/directives` returns nothing, and on this checkout
  `skills-adapter-generate --print-prefix` reports `oak-` with source `default`. The named
  residue outside that scope: the flag parser's unit test keeps explicit `--prefix` values
  because it exercises the surviving override, and the dated records under `.agent/reports`
  and `.agent/plans-old-archive` stay as written. Proof: `repo-safe`, the command and the
  output in the PR body.
- **Resolution order holds.** The resolver's unit tests prove: default alone resolves
  `oak-` with source `default`; an override resolves its value with source `override`;
  an invalid override, the unedited example placeholder, and a missing default each
  refuse with a message naming the file to fix. Proof: `repo-safe`, the agent-tools unit
  suite.
- **The mechanism works for a second prefix without touching this tree.** The
  integration test generates into a temporary root overridden to `e-` and finds every
  projection under `e-*`, checker green; on this checkout
  `skills-adapter-generate --print-prefix` prints `oak-` with source `default`. Proof:
  `repo-safe`, the integration test and the command's output quoted in the PR body.
- **No projected name changes.** The landing PR's diff touches no file under
  `.claude/skills/` or `.agents/skills/`, and the pull-request workflow's `skills:check`
  passes on the head. Proof: `repo-safe`, `git diff --stat` on the PR and the check by
  name.
- **The example is a template, not a home.** `.agent/skills-projection.local.json.example`
  parses as JSON, and copying it unedited to the override name makes `--print-prefix`
  refuse, because `<prefix->` fails the lowercase name-fragment grammar, with the message
  that names the override, the example and the field to edit. Proof: `repo-safe`, the resolver's placeholder
  test and the command in the PR body.
- **A cold clone is told what to copy.** The ignore comment names the example and the
  value; ADR-125, the agent-tools README and the engineering doc's per-checkout list say
  where the default and the override live. Proof: `repo-safe`, the docs validators in the
  aggregate gate and the ignore lines quoted in the PR body.

## Todos

One single-story PR within the default round budget: the six mechanism steps above, with
the PR body carrying the two `git grep` proofs, the `--print-prefix` output on this
checkout, the placeholder refusal, and the diff-stat proof that no projection moved.

## Out of scope

- Switching this checkout, or any checkout, to another prefix: the owner's deferral; the
  override file is not created here, and the isolated-root test is the only place `e-`
  appears.
- Untracking the projections and amending ADR-125's committed-adapters decision: the
  decision this slice informs, taken separately.
- The `Skill(oak-*)` pre-approval entries in the tracked harness settings, the prose that
  names projected skills, and the four runtime strings that name `/oak-start-right-team`
  and `oak-consolidate-docs`: none is wrong while the names stand; they belong to the
  name-change slice, which the strategic node treats as prose migrating once to canonical
  ids plus a generated index.
- The identity-literal census validator: its own slice; this slice reduces the
  hand-pinned count it will be seeded with.

## Review dispositions

- 2026-09-05 — assumptions-expert readiness review of the sketch (READY-WITH-CHANGES),
  all seven findings applied in place before ratification: the tracked default resolves at
  the generator's own root and only the override at the primary; the placeholder fails a
  tightened lowercase grammar rather than the CLI's traversal guard; the one-point-of-
  configuration proof is scoped to live mechanism surfaces with the residue named; the
  commit skill's canonical joins the pinned sites; ADR-125's three sites are named; the
  merge-bot loader is the first per-checkout reader, so the shared helper is extracted at
  this second consumer; the beneficial dependency is stated in the body.
