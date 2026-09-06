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
  cli.js) exit 0 with empty streams on the MINT path — a silent exit-0 on a
  token-minting path. The working entry is `pnpm --silent agent-tools
  merge-bot mint-token --scope <name>` (docs/engineering/merge-bot.md).
  Scoped to the mint path deliberately: since MCP-385 the direct node entry
  DOES exit 2 with a proper stderr message on a `--scope` usage failure
  (verified 2026-07-29), so the blanket "always exit 0" reading is no longer
  true of every path.
- **A failing mint inside `GH_TOKEN=$(…) gh …` runs as the HUMAN**
  (2026-07-29): the substitution yields an empty string, `gh` treats an empty
  `GH_TOKEN` as unset, and it falls back to the keyring — silently executing
  as the signed-in, possibly bypass-capable account. Assign first and stop on
  failure (`token=$(…) || exit 1`); never the prefix form. See
  `.agent/rules/bot-identity-on-third-party-systems.md`.
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

## 2026-07-30 consolidation batch (each measured first-hand in the 07-24→30 window)

- **zsh does not word-split unquoted variables** (third monitor-recipe
  instance — the row is now owed): `for c in $CLAIMS` iterates ONCE with
  the whole string; four GraphQL ids went as one malformed argument.
  Iterate literal values or `printf '%s\n' … | while read`. Sibling:
  `${PIPESTATUS[0]}` is a bashism that expands EMPTY in zsh — the piped-
  exit trap in a fourth costume.
- **pnpm re-appends the literal `--` at EACH forwarding layer**: a root
  alias forwarding through a workspace script delivers `['--', …]` to the
  leaf bin, and an arg scanner reading leading `--` as its terminator sees
  nothing. Drop the `--`; smoke the full script chain shell-level.
- **turbo parses bare `--force` as value-taking** and eats the task name
  (`turbo run --force sdk-codegen` runs nothing); use `--force=true`.
- **`spawnSync` timeout sets BOTH `error` (ETIMEDOUT) and `signal`** — an
  error-first branch swallows the captured streams the signal branch's
  diagnostics were added for; compose stream excerpts into both.
- **`join(root, dir)` silently mangles absolute dirs** (`join('/repo',
  '/abs')` → `/repo/abs`); `resolve(root, dir)` is the cure; every
  path-taking CLI option earns one absolute-input test.
- **esquery selector regexes mute on raw slashes**: `Literal[value=/a//]`
  parses and lint runs green but the selector NEVER fires (the `/`
  delimiter truncates it). Escape `/` inside `String.raw`, write
  escape-bearing config via a script, and prove it with a negative
  control (tmp file with the banned literal → expect the error).
- **A backtick in an inline `--body` is a live command substitution**:
  zsh executed a phrase out of a doctrine sentence mid-send and the event
  landed mangled at exit 0. `--body-file` is the only quoting-safe
  transport for non-trivial bodies.
- **`git add -- <deleted-path>` fatals (exit 128) when the deletion is
  already staged** — pathspec matches nothing and the whole add aborts;
  add only paths that exist on disk. And `git status --porcelain`
  collapses untracked DIRECTORIES — enumerating files needs `-uall`.
- **BSD grep -E has no `\s`** and a mis-quoted retry can still undercount
  with a clean exit — calibrate any counting instrument against a KNOWN
  count first; prefer a real parse (`matchAll`) over line-regex on
  structured sources.
- **Codex seat salvage paths**: a stopped Codex seat's opening prompt
  (including any relayed predecessor plan) survives verbatim in
  `~/.codex/history.jsonl` and `~/.codex/sessions/<date>/rollout-*.jsonl`;
  distilled tenure summaries in `~/.codex/memories/rollout_summaries/`.
  A 6-char PDR-027 prefix can span MULTIPLE relaunched platform sessions —
  prefix-identity is coarser than session-identity at the platform layer.
- **Google Docs under browser automation**: the canvas editor swallows
  synthetic input while the tool reports success — treat Docs as
  READ-ONLY (deliver content as paste-ready blocks). The `/mobilebasic`
  render is the reliable read surface, but it renders ACCEPTED text only:
  an absence verdict ("the doc lacks X") also requires the
  comment/suggestion history panel, where a full draft section can live
  invisible to mobilebasic. The write-side dual: Google Docs SYNTHETIC
  TYPING silently fails — the automation tool reports success while the
  document stays untouched — so mobilebasic is the reliable READ path and
  browser-automation writes into Docs need an independent read-back
  verification before any "written" claim.
- **An open-range dependency override (`>=X`) is a standing exposure, not
  a one-shot test subject**: its resolution is a moving target, so a
  survivability test can pass at authoring and fail a day later with zero
  repo changes (measured: froze at 4.0.40 on the 29th, floated to 5.0.14
  breaking two more packages on the 30th). The cheapest durable state is
  not having the override.
- **Grepping a shipped binary needs `LC_ALL=C`** or grep reports a false
  "binary file matches" zero-hit read; registry semantic hashes are
  computable via a temp tsx file inside the package dir importing
  `./semantic-source-sha256.js`; and a newline-joined variable passed to
  git reads as ONE pathspec — use `xargs`, and verify with a staged-count
  check.
- **Operational signatures worth knowing** (2026-07-30): a model tier can
  change WITHIN a session id, so tuple-matchers keyed on (session, model)
  mis-match across the change; a write command is never a probe (a stray
  all-zeros event id traced to an argument-validation "probe" that was
  actually a write); and the security-headers integration test's
  `Parse Error: Expected HTTP/, RTSP/ or ICE/` was ROOT-CAUSED (MCP-403,
  superseding the earlier "loaded-host flake" reading): supertest servers
  bind `::` (IPv6-any) while clients dial `127.0.0.1`, and a resident
  macOS Java listener on the colliding port answered the mismatch — the
  cure is the loopback-request test helper binding client and server to
  the same explicit loopback. A gate failure in a package the diff never
  touched is still a re-run candidate first, but this signature now has a
  named cause.
- **Under an inherited `COREPACK_ROOT` the resolved standalone pnpm refuses
  the `packageManager` self-switch** (observed on an 11.9.0-resolved pnpm
  against an 11.8.0 pin): strip the corepack env (`env -u COREPACK_ROOT …`
  or a clean shell) so the pin resolves its own binary.
- **Analytics/event-store retention config is free to fix only BEFORE first
  collection**: before any event lands it is a settings change; after, it
  is a deletion exercise with data-governance weight. The free-to-fix
  window closes at the first event — configure retention in the same
  change that enables collection.
- **Two whole-repo gate suites racing on one checkout can strand a Next
  build lock**: `next build` refuses with "Another next build process is
  already running" even after the racing process is gone (observed when a
  peer's pre-commit gate overlapped a merge-commit gate on the shared
  primary, 2026-07-31). Check `pgrep -fl "next build"` — if nothing is
  live, the lock is stale residue and ONE retry succeeds; the singleton
  gate-runner discipline is the prevention.
- **A Vercel function boot-throw serves 500 `FUNCTION_INVOCATION_FAILED`
  with ZERO runtime logs** — the throw happens before the logger exists,
  so "no logs" is itself the signature: check module-load/boot-path code
  (top-level awaits, config reads, imports) before instrumenting the
  handler.

## 2026-09-02 fold-carry batch (2026-08-19 instances carried at the fold merge)

- **zsh arrays are 1-indexed.** A `for i in 0 1 …` over `declare -a`
  silently dropped element 0 (one review thread unreplied, caught by the
  in-band NOT_FOUND error). Iterate the array itself, never numeric
  indices, in this shell.
- **zsh no-word-split, census edition** (recurrence of the row above,
  2026-09-02): a grep census over a space-joined path list in `$H`
  returned NONE for every probe because grep searched one nonexistent
  path and `2>/dev/null` hid the error. An all-NONE census is a probe
  failure until one known-positive probe in the set reads a hit — carry
  a positive control in every census.
- **JSX attribute strings decode HTML entities.** Both SWC and esbuild
  turn `"&mdash;"` into an em dash in attribute literals — a reviewer
  finding built on "string props render literally" was premise-false.
  Verify transform-level claims AT the transform, not from the JSX
  mental model.

## 2026-09-06 consolidation batch (2026-09-02→06 instances, each measured first-hand by the seat named in the napkin)

- **pnpm forwards a literal `--` to some scripts as an unknown flag.**
  `pnpm agent-tools:check-commit-message -- -F <file>` exits 2; feed the
  message on stdin (`< "$MSGFILE"`) or pass `-F` without the `--`
  (2026-09-03).
- **A rename through the version-control CLI stages both endpoints.** A
  later staging call naming the deleted path refuses ("did not match any
  files") and aborts the WHOLE pathspec add; after a move, stage the live
  paths only (2026-09-03).
- **A stale commit-queue intent blocks the next guard.** An intent that was
  enqueued and never committed (a failed guard, an abandoned ceremony)
  makes every later guard on overlapping files refuse with "multiple fresh
  matching commit-queue intents" until `phase --intent-id … --phase
  abandoned` (2026-09-03; 2026-09-06, frictions F-172).
- **commitlint `subject-case` rejects an uppercase token right after the
  type**: a subject beginning "ADR-227 …" fails; lead with a lowercase word
  (2026-09-03).
- **A markdown line opening with `#959's` is an ATX heading** to
  markdownlint (MD018); write `PR #959's` (2026-09-03).
- **zsh globs an unquoted `--include=*.md`** before grep sees it and fails
  with "no matches found"; quote the pattern (2026-09-05).
- **`claude mcp logout <name>` cannot see a server disabled in settings or
  whose plugin is off**: it answers "No MCP server named" for every disabled
  server. Order a disconnect clear-tokens-then-disable (2026-09-03, Claude
  Code 2.1.25x).
- **`vercel whoami` after `vercel logout` blocks on an interactive login
  prompt**: a batched logout chain timed out on it and the later commands
  never ran. CLI logouts run one per call, stdin closed, under `timeout`
  (2026-09-03).
- **The harness re-injects a nested checkout's rule pointers on every read
  under it.** One 2026-08 transcript holds 1,056 nested-memory attachments
  across eight worktrees under the repository's own platform worktree
  directory, 121 rule names each — the measured mechanism behind "the
  rules load twice" (2026-09-05).
- **The bot merge token expires hourly**; a 401 mid-batch is the tell —
  mint, then repeat the batch (2026-09-05).
- **`ls -1` hides dotfiles**, so it reports a just-copied dotfile as absent.
  **The ignore-check verb prints the matching pattern for a NEGATED path
  too**, so its output cannot say whether a file is ignored — ask the
  status command what the tree actually sees. **A background task's "exit
  code 0" is the wrapper's status**, not the command's. **A validator's
  file flag was `-F`, not `--file`** — read the tool's help before guessing
  the flag (experience letter, the MCP submission drive, 2026-08).
- **`cd` inside one Bash call persists into the next call.** The identity
  preflight and the bot token mint both resolve the repository from the
  working directory and fail outside the worktree ("not a git repository"
  → IDENTITY PREFLIGHT FAILED / TOKEN MINT FAILED); use absolute paths and
  never change directory (2026-09-06, twice in one window).
