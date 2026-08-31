# Claude cloud environment — the "Practice Repos" environment

How claude.ai cloud sessions (web, mobile, routines, `claude --cloud`) are
provisioned for Practice repos, and how to change that safely. The
environment is shared by every Practice repo; a session may carry one or
several repos (owner word 2026-08-24, superseding the 2026-08-23
one-repo ruling), and the environment never knows which in advance —
discovery provisions every Practice repo present. When a document
references a file in another repo, use a GitHub URL, never a local
path (owner word 2026-08-24).

## The two layers

1. **Environment setup script** — universal, repo-agnostic. Lives in the
   claude.ai environment configuration; its source of truth is the
   reference copy at
   [`cloud-environment-setup.sh`](cloud-environment-setup.sh). It discovers
   whichever Practice repo the session carries and installs the toolchain
   that repo declares — Node at the major named by its `engines` field,
   the exact pnpm its `packageManager` pin selects (via Corepack, shimmed
   into a trusted path), git ≥ 2.45, and a checksum-verified gitleaks
   (version and sha value-synced with castr's supply-chain single source,
   `.claude/hooks/_lib/gitleaks-pin.env`) — then runs `pnpm install` and
   delegates to the repo's own hook. The script itself pins no version a
   repo declares.
2. **Per-repo session hook** — the common-ability contract. A Practice repo
   that needs more than `pnpm install` commits an executable
   `.agent/setup/cloud-session-setup.sh`; the environment script invokes it
   from the repo root after install, under the same fail-fast rules. This
   repo's hook installs the pinned Playwright Chromium for the
   `test:ui`/e2e suites. A repo with no extra needs commits no hook.

## Changing the environment

1. Edit [`cloud-environment-setup.sh`](cloud-environment-setup.sh) here,
   review, and land it via a pull request.
2. Paste the whole script into claude.ai → environment selector →
   "Practice Repos" → Setup script, and save.
3. Changes apply to **new sessions only**. The environment cache (a
   filesystem snapshot, roughly 7-day expiry) rebuilds when the script or
   the allowed-domain list changes; the first session after a change runs
   the script live.

Repo-specific needs never go in the environment script — put them in the
repo's hook so other Practice repos' sessions are unaffected.

## Validating and diagnosing

The environment builder is the only true fresh-container test bench:
running the script by hand inside an existing session proves nothing about
a fresh container (different egress, different filesystem state, different
cache). The dialog is also write-only — no API reads it back, so drift
between this reference file and the pasted copy is undetectable from a
session. Four consequences, each with its instrument:

1. **The script narrates itself.** Every section opens with a
   `=== PHASE: … ===` banner and an `ERR` trap prints the failing phase,
   line, and command. A failure card therefore names its own point of
   death; a card without a phase banner means the script died before
   `set -euo pipefail` — i.e. the paste itself is damaged.
2. **The preflight returns the complete falsification list in one paste.**
   [`cloud-environment-preflight.sh`](cloud-environment-preflight.sh) is a
   read-only probe of every external assumption the setup script makes
   (repo discovery, hook contract, git origin remotes, nodejs.org, registry.npmjs.org,
   keyserver.ubuntu.com, ppa.launchpadcontent.net, the base image's own
   apt hosts, the gitleaks release-asset redirect chain). All probes run
   regardless of individual failures and the summary lists every failed
   assumption. Setup-time egress differs from in-session egress (worked
   instance 2026-08-23: Trusted preset fine in-session, 403 at setup), so
   the authoritative run mode is pasting the preflight as a **temporary**
   environment script and reading the session-start card; the in-session
   run (`bash .agent/claude-harness-integrations/cloud-environment-preflight.sh`)
   is the cheap first pass.
3. **The diagnosis loop.** When fresh sessions stop starting:
   1. Read the failure card. A phase banner localises the failure; no
      banner means paste damage — go straight to step 4.
   2. Paste the preflight as the environment script, start a session, and
      read its card: the complete list of falsified assumptions in one
      round-trip.
   3. Fix what the preflight names — usually the network allow-list (a
      redirect target like `release-assets.githubusercontent.com` never
      appears in the script text) or a vendor-side change — landing any
      script edit here first via PR.
   4. Re-paste the current reference `cloud-environment-setup.sh` in full.
      The rollback lever is the same move: any previous known-good version
      is in this file's git history, and pasting it restores that state
      exactly.
4. **The probe invariant.** Every external host the setup script contacts
   has a probe in the preflight; a change adding a host lands the probe in
   the same commit. Redirect chains count — probe the effective URL, not
   just the named host. Hook-contacted hosts count too, via the
   **hook-preflight contract**: a repo whose session hook contacts extra
   hosts commits the read-only twin
   `.agent/setup/cloud-session-preflight.sh` beside the hook, and the
   universal preflight runs it as a probe — the same
   delegation shape as setup itself. Absence is the only benign skip;
   exists-but-not-executable fails the probe.

## Suspected-fragile hosts register

Empty. A setup-time preflight paste on 2026-08-24 ran 12/12 from a true
fresh builder, positively confirming every previously registered host —
`nodejs.org`, `registry.npmjs.org`, `keyserver.ubuntu.com`, and the
gitleaks release-asset redirect target (measured as
`release-assets.githubusercontent.com`, not `objects.githubusercontent.com`
as once assumed; the preflight's failure branch now prints the last
attempted URL so a future redirect-host change names itself on the card).
Re-add an entry only when a setup-time card implicates a host.

## Environment settings that pair with the script

- **Network access**: Custom, with "Also include default list of common
  package managers" ticked, plus:

  ```text
  ppa.launchpadcontent.net
  cdn.playwright.dev
  playwright.download.prss.microsoft.com
  ```

  The Trusted preset is not sufficient: it 403s `ppa.launchpadcontent.net`,
  which breaks any `apt-get update` because the base image itself ships PPA
  sources on that host (worked instance 2026-08-23: castr routine sessions
  failed to start).

- **Environment variables**: the Slack Watcher configuration lives here —
  in the environment, never in a repo — so every Practice repo's sessions
  share it and changing channel or workspace is an environment edit, not a
  commit:

  ```text
  SLACK_WATCHER_CHANNEL_ID=<channel id, e.g. C0XXXXXXXXX>
  SLACK_WATCHER_WORKSPACE=<workspace name>
  ```

  Consumed by the `slack-watcher` and `talk-to-slack-watcher` skills
  (canonical under `.agent/skills/`). These values are visible to anyone
  using the environment; channel ids are not secrets, and no secret may be
  added here.

## Git-hook policy for cloud agent sessions (HUSKY=0)

Owner ruling, 2026-08-31 (trialled the same session, then adopted with a
companion profiling commission): **cloud agent sessions commit and push with
`HUSKY=0`**, relying on GitHub CI as the quality gate. This relocates the
checks, it does not remove them — the adoption was conditional on CI being
comprehensive, and that premise was verified first-hand against `ci.yml`
(secret-scan; format, markdownlint, runtime and shell lint, subagents,
portability, repo-validators, skills, encoding; build with schema-drift
check; type-check, lint, test; knip and dependency-cruiser; browser suites;
a `run-quality-gates` rollup). That comprehensiveness covers **tree-state**
gates only — CI runs no commit-message-class checks, which is why the
in-session validation below is non-optional. Measured effect at adoption:
seconds per commit-push cycle against ~15 minutes with local hooks.

Conditions that keep the policy honest:

- Scope is **agent cloud sessions**; local human development keeps hooks. The
  canonical [`no-verify-requires-fresh-authorisation`](../rules/no-verify-requires-fresh-authorisation.md)
  rule carries this standing ruling as its one scoped narrowing — outside this
  scope its per-invocation requirement is unchanged.
- **The blocking in-session substitute set** — the skipped hooks' checks are
  enumerated here once, each mapped to its substitute; skipping any of the
  in-session three recreates the gap `HUSKY=0` opens:

  1. **Branch guard** (`.husky/pre-commit` sources
     `refuse-commit-on-main.sh`): run the same guard before every commit —
     `bash -c 'GUARD_BRANCH="" GUARD_HINT="…" . .husky/refuse-commit-on-main.sh'`
     — because CI cannot prevent a local-`main` commit after the ref has
     advanced.
  2. **Commitlint** (`.husky/commit-msg`):
     `pnpm agent-tools:check-commit-message -F <draft>`.
  3. **Accidental-major-release guard** (`.husky/commit-msg`):
     `pnpm exec tsx agent-tools/src/version-guard/prevent-accidental-major-version.ts <draft>`.
     Its path-safety contract only accepts files under the real git
     directory: resolve with `git rev-parse --absolute-git-dir` (in a linked
     worktree `.git` is a file) and make the draft **intent-scoped** — a
     shared fixed name races between agents on one worktree (the commit
     skill's proven concurrency class) — e.g.
     `"$(git rev-parse --absolute-git-dir)/COMMIT_MSG_<intent-id>"`.

  4. **Pre-push secret scan** (`.husky/pre-push` runs gitleaks before
     transfer): run `pnpm secrets:scan` in-session **before every push** —
     CI's secret-scan job starts only after GitHub has received the commits,
     so it can block the PR but cannot stop a credential leaving the
     machine; only the pre-transfer scan can. gitleaks is installed by the
     cloud environment setup.

  Everything else the hooks ran maps to CI: staged prettier/markdownlint →
  the static-checks job; the turbo suites → the build/test/browser jobs.
  History-rewriting guards (`.husky/pre-rebase`'s main-in-range check and
  kin) are not substituted because history rewriting stays governed by the
  estate's never-rewrite doctrine; the rare session that must rebase runs
  the applicable `.husky` guard explicitly first.
- Every push lands on a CI-gated PR; an un-PR'd branch push has no gate, so
  cloud work stays on PR branches (standing practice anyway).
- If CI's coverage narrows relative to the local suite, the premise fails
  and the policy is re-decided — the comprehensiveness check above is the
  revalidation instrument.
- `HUSKY=0` is the mechanism; `--no-verify` remains blocked and separately
  governed by `no-verify-requires-fresh-authorisation`.

**Companion commission (same ruling): the check-performance profiling
lane.** The owner also commissioned profiling and improving full-check
performance so local (hooked) cycles get faster too. The lane awaits
pickup; its delivery plan is authored by its implementer at pickup per the
plan estate's own doctrine. First measurements to beat: ~15 minutes for a
cold full suite, minutes warm, dominated by the turbo build/test legs.

## Fail-fast contract

The script exits non-zero on any failure and session creation then fails
with the script output in the session-start card — deliberately. A session
on a half-built environment is worse than no session.

One tracked vendor warning (per no-warning-toleration's third-party
clause): `apt-get update` reports the git-core PPA's InRelease signature
uses a weak algorithm (`rsa1024`). The key is Launchpad's, not this
repo's, so the warning cannot be fixed at source; the signature still
verifies and provisioning proceeds. Triage disposition: if apt escalates
this to a rejected signature, provisioning hard-fails loudly at `apt-get
update` — that failure is the designed signal, and the remedy is moving
git to a source with a modern key.

## Provenance (worked instances, 2026-08-23/24)

- `add-apt-repository` crashes on this image (`apt_pkg` missing) — PPAs are
  added by writing sources and key files directly.
- The image's `/opt/nodeXX/bin` precedes `/usr/local/bin` in `PATH`, so the
  toolchain install repoints those entries; nothing else can change a
  session's `PATH`.
- Hard-coding a repo path broke castr sessions (the environment previously
  assumed this repo); discovery-and-delegation replaced it.
- The 2026-08-23/24 outage (every fresh session failing for ~24h): the
  discovery pipeline's `find /home /workspace` exits non-zero because the
  builder ships no `/workspace` — while still printing every match — and
  `set -euo pipefail` turned that into instant death at the discovery
  line, from the discovery script's very first paste. Two traps hid it:
  hand-validation ran script chunks in an interactive shell (no strict
  mode, so the pipeline "worked" on the bench), and the preflight runs
  without `-e`/`pipefail` by design, so it cannot catch strict-mode
  shell-semantics deaths — that class belongs to the setup script's own
  phase banners and ERR trap, which named the dying line on the first
  instrumented run. When validating a strict-mode script, run the WHOLE
  file under its own strict mode, never chunks in an interactive shell.
