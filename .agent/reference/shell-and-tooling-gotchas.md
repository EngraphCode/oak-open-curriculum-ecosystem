# Shell and tooling gotchas (worked, dated, first-hand)

Small operational facts with real bite, each observed live in this
repository. Host-local reference (PDR-007 home class). Add entries with
a date and the observed mechanism; remove entries when the underlying
tool retires them.

## zsh

- **Unquoted leading-`=` words abort compound commands** (3 instances,
  2026-07-20). `echo ===X===` in a chained command errors and kills the
  REMAINING chained commands invisibly: zsh's default `EQUALS` option
  performs command-path expansion on an unquoted word beginning with
  `=` (the `=cmd` form). Quote the separator or emit it with `printf`.
- **`GID` is a READONLY integer parameter in zsh** (2026-07-20).
  Assigning a uuid to it fails as "bad math expression"; never use it
  as a variable name (same family: `UID`, `EUID`, `EGID`).

## Repo tooling

- **Filesystem probes use absolute paths — a persistent shell cwd fakes
  vanished files** (2026-07-26): after a `cd` into a workspace, a
  root-relative `ls .agent/experience/` reports "no such directory" while
  the file exists, and a `find` from the same cwd "confirms" the vanish. A
  vanished-file conclusion needs a root-anchored (absolute-path) check
  before it is a conclusion.
- **Prettier must run with the target worktree as cwd** (2026-07-20): a
  root-anchored relative path from a reset shell cwd silently formats
  the wrong checkout (one pre-commit red before diagnosis).
- **`node_modules/.pnpm/<pkg>@*` listings read store RESIDUE** (2026-07-25):
  the pnpm store keeps prior installs' versions, so a glob listing after a
  bump can read back the OLD version while the bump worked perfectly.
  Verify a resolved version with `pnpm why <pkg>` or the lockfile, never a
  store-directory listing.
- **Branch-switch stale-dist brick** (2026-07-20): after switching a
  checkout between branches whose `@oaknational/result` dist differs,
  `pnpm install`'s bootstrap fails on the stale dist and every filtered
  build recurses into the same failing install. Escape:
  `OAK_SKIP_AGENT_TOOLS_BOOTSTRAP=1 pnpm install`, then the filtered
  package build, then plain install.
- **pnpm-wrapped CLI invocations die at postinstall during source
  breakage** (2026-07-21): while the tree is broken, `pnpm <script>`
  forms of the agent-tools CLI fail at bootstrap; direct
  `node agent-tools/dist/...` (or `pnpm exec tsx` on source) is the
  resilient path — valid only while dist+deps stay coherent.

## Repo CLI (agent-tools)

- **`comms send` takes NO `--kind` flag** (2026-07-21): event kind is
  not caller-settable; the usage line is truth, not the event schema's
  kind vocabulary.
- **`claims adopt` requires the FULL claim UUID** (2026-07-21): the
  8-char prefix used throughout records and doctrine is rejected with
  "no active claim matches".
- **`claims heartbeat` and `claims close` require explicit `--now`**
  while `claims open` defaults it (three instances, 2026-07-20..23) —
  the per-command now-defaulting inconsistency, F-89 family.

- **`merge-bot mint-token` has no direct-run bootstrap** (2026-07-25, two
  seats): BOTH direct node entries (tsx on source and node on the built
  cli.js) exit 0 with empty streams — a silent exit-0 on a token-minting
  path. The working entry is `pnpm --silent agent-tools merge-bot
  mint-token` (docs/engineering/merge-bot.md).
- **Workflow-resume caches can serve degenerate results** (2026-07-25): a
  quota-wall degradation produced literal placeholder schema-fills
  ("test") that a later resume would have cache-served as valid — inspect
  the journal's actual return values for degenerate output before
  trusting a workflow resume cache.

## GitHub Actions

- **A workflow existing only on a non-default branch is not dispatchable**
  (2026-07-23, single instance, mechanism inferred): no registration
  appeared after ~15 min. Working cure: `on: push` scoped to its own
  scratch ref — the push event runs the file at that ref immediately.
  Scaffold → evidence → delete-ref, proven on the Slack alert test.

## GitHub credential

- **gh-token invalidation masquerades as rate-limiting** (3+ instances,
  2026-07-13..20): anonymous-tier limits (`limit: 60`) after a 401 are
  the signature; `gh auth status` is the discriminator. Never diagnose
  "quota exhausted" from 403s alone; empty/failing gh reads are
  transport-down, not no-news. Fleet cure: stop polling, keep
  SSH-git/local work, one owner card for the interactive re-auth.

## Git craft

- **Cut-branch roll-ups from the primary use the UNBUNDLED form**
  (2026-07-21, owned violation): `git branch <name>` (pointer only, no
  switch) + `git push origin <name>` + `gh pr create --head <name>`.
  The muscle-memory `checkout -b` bundles create+switch and moves the
  shared primary; `git branch --show-current` after every
  branch-affecting command is the cheap tripwire.

## Markdown

- **A wrapped prose line starting with `+ ` reads as a list marker**
  (markdownlint MD004/MD032, 2026-07-23): reflowing prose so a
  continuation line begins with `+` (e.g. "…inputs X\n+ the report…")
  turns it into an unordered-list item in the wrong style. Reword to
  "and"/"plus" or rewrap.

## Git hooks

- **husky names the failing STAGE only in its last line** (2 misreads,
  2026-07-21): a commit-msg failure (e.g. a >100-char subject) reads
  like a gate failure until the final `husky - <hook> script failed`
  line is read literally. Read that line before diagnosing; the
  pre-draft `check-commit-message` step in the commit skill collapses
  the whole layer.
