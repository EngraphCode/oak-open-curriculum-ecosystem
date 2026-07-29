# The merge bot — who needs one, and how to set one up

This repo's merges are protected by a ruleset (required checks, review-thread
resolution). Whether those protections physically bind you depends on your
credential:

- **Most contributors are not bypass-capable.** Your plain `gh pr merge` and
  the GitHub UI merge button are already blocked by red checks and open
  threads. **You do not need a merge bot.** Merge normally; arming auto-merge
  at a settled review (`gh pr merge <n> --auto --merge`) is always allowed
  and recommended.
- **Bypass-capable credentials (org admins, and any actor on the ruleset's
  bypass list) silently skip required checks on DIRECT merges** — no flag,
  no warning (a plain merge once landed behind a red Sonar gate this way).
  For these credentials the standing rules are: `--admin` is always banned;
  direct `--merge` is banned; land work by **arming auto-merge at a settled
  review** (the arm path never exercises bypass), or by **merging as the
  merge bot**, whose token has no bypass and therefore physically binds.

## How the bot works

A GitHub App (this repo's is named in [`.github/merge-bot.json`](../../.github/merge-bot.json))
is installed on the repository and is **deliberately absent from the
ruleset's bypass list**. Merging with its short-lived installation token
gives you a credential that GitHub itself stops at any unmet requirement:

```bash
token=$(pnpm --silent agent-tools merge-bot mint-token --scope pull-request-work) || exit 1
GH_TOKEN="$token" gh pr merge <n> --auto --merge
```

**Assign the token first; never use the `GH_TOKEN=$(…) gh …` prefix form.** A
prefix substitution cannot fail fast: if the mint fails for any reason — a bad
`--scope`, an unreadable key, a `422` — the substitution yields an empty
string, and `gh` treats an empty `GH_TOKEN` as _unset_ and falls back to the
keyring. The command then runs as the signed-in human, who may be
bypass-capable, which is the owner-credential fallback
[`bot-identity-on-third-party-systems`](../../.agent/rules/bot-identity-on-third-party-systems.md)
bans outright. A separate assignment with `|| exit 1` stops there instead.

Each minted token is scoped at mint time to this repository and to exactly
the permissions of the `--scope` you name — least-privilege by construction,
even if the app is ever installed more widely, and a strict subset of
whatever the installation itself grants.

`--scope` is **required and has no default**. A token carries only the
permissions its mint requests, so a default would make the most privileged
scope the silent one — which is how a read-only need came to be served by a
three-write token (MCP-385). The scopes, and the evidence for each member,
are defined in `agent-tools/src/merge-bot/token-scopes.ts`:

| scope                  | permissions                                                   | for                                                                                  |
| ---------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `pull-request-work`    | `pull_requests: write`, `contents: write`, `workflows: write` | merge, update-branch, push, PR create/edit, comment, review reply, thread resolution |
| `code-scanning-alerts` | `security_events: read`                                       | reading code-scanning alerts                                                         |

`pull-request-work` is wider than several of its listed uses need: the
conversation half (comments, review replies, PR edits) requires
`pull_requests: write` alone, while only merge, push and update-branch need
`contents`/`workflows`. Splitting it is MCP-391, gated on establishing what
the GraphQL thread-resolution mutation requires. Read the set as honest for
the span as named, not as minimal for each member.

**A `403` from a call made with a bot token is a wrong-`--scope` symptom, not
a broken bot.** An ungranted permission fails the _mint_ with `HTTP 422` and
GitHub's own naming message, so a mint that succeeded followed by a call that
403s means the token is scoped for different work.

`workflows: write` is needed only by `gh pr update-branch`, which writes the
merge commit onto the **head** branch; GitHub refuses that write when the
merge touches `.github/workflows/**` without it. Merging a pull request does
not need it — observed directly: this bot merged PR #557, which changed four
workflow files, on a token carrying only the first two permissions.

`.github/merge-bot.json` is the **single authority** for which app is this
repo's bot (`appSlug`, `appId`, `repo`); the private key lives outside every
repo at `~/.config/<appSlug>/private-key.pem`, derived from that config.
Command-line flags (`--app-id`, `--private-key-path`, `--repo`) are explicit
operator overrides for cross-repo use or testing — not a resolution tier.

## Setting up a bot (requires org-admin rights)

Creating and installing a GitHub App on an organisation repository requires
admin rights on the org — which is exactly why the bot is only _required_
for admin credentials, and optional for everyone else.

1. `https://github.com/organizations/<org>/settings/apps/new` — name it,
   untick **Webhook → Active**.
2. Repository permissions: **Pull requests: Read & write**, **Contents:
   Read & write**, **Workflows: Read & write**, **Code scanning alerts:
   Read-only**, **Checks: Read-only**, **Commit statuses: Read-only**. Grant
   nothing else.

   **Workflows** is not optional: a token mint requests it explicitly, and
   GitHub rejects a token request for any permission the app was not
   granted. An app created without it fails **every** `pull-request-work`
   mint with `HTTP 422`, not merely the `update-branch` call that needs it.

   **Code scanning alerts** is likewise not optional for the
   `code-scanning-alerts` scope — without it, every such mint fails `422`.
   Note GitHub keeps three separate alert permissions: this one governs code
   scanning; secret-scanning alerts and Dependabot alerts are distinct
   permissions and are deliberately NOT granted.

   **Adding a permission to an existing app does not reach its installations
   by itself.** GitHub marks the new permission as requested, and an org
   owner must approve it on the installation before any mint can use it. On a
   bot that already exists, expect `422` until that approval lands.

3. "Only on this account" → **Create GitHub App**; note the **App ID**.
4. **Private keys → Generate a private key** (this never happens
   automatically) — the downloaded `.pem` is the bot's whole identity:

   ```bash
   mkdir -p ~/.config/<app-slug>
   mv ~/Downloads/<app-slug>.*.private-key.pem ~/.config/<app-slug>/private-key.pem
   chmod 600 ~/.config/<app-slug>/private-key.pem
   ```

5. **Install App** → your org → **Only select repositories** → this repo.
6. Update `.github/merge-bot.json` if this bot replaces the repo's bot, and
   **never add the app to the ruleset's bypass actors** — a bypass-capable
   bot is the disease this design cures.
7. Prove it: `pnpm agent-tools merge-bot mint-token --scope pull-request-work` exits 0 and prints a
   token; a merge attempt against a PR with a red required check must be
   REFUSED — that refusal is the feature.

The client ID / client secret on the app page belong to OAuth user flows
and are **not used** by this path; you never need to generate the secret.

## Agent actions run as the bot — attribution by identity

Any PR mutation performed **by an agent** runs under the bot token, so the
platform record itself says which actions were a human's and which were an
agent's: opening PRs, editing titles/descriptions, commenting, replying to
review threads, resolving threads, requesting reviewers, arming, merging.

```bash
token=$(pnpm --silent agent-tools merge-bot mint-token --scope pull-request-work) || exit 1
GH_TOKEN="$token" gh pr edit <n> --body-file …
GH_TOKEN="$token" gh api …/comments/<id>/replies -f body=…
```

Reads may use any credential — attribution matters for writes. Agents keep
signing reply bodies with their agent tuple: the bot identity says "an
agent did this", the signature says which one. A maintainer acting from
their own hands uses their own credential — that contrast is the point.

## Key handling

The `.pem` grants the bot's full capability: keep it out of every repo,
never paste it into chat or logs, and rotate it from the app's Private-keys
section if exposure is ever suspected. The minting CLI prints the token to
stdout only (expiry to stderr) so command substitution never leaks extras.

`--json` is the exception: it bundles the token into the printed object, so
that output is as sensitive as the token itself and must not be pasted
anywhere the plain form would be safe.

Tokens belong in the environment, never in a URL. Pushes use a
credential-helper that reads `GH_TOKEN` (see
[`bot-identity-on-third-party-systems`](../../.agent/rules/bot-identity-on-third-party-systems.md)) —
a token baked into a remote URL is visible in the process list to anything
that can read it.
