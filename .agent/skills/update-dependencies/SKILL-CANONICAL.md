---
name: update-dependencies
classification: active
description: >-
  Update npm dependencies deliberately — summon on "dependabot alert",
  "pnpm audit findings", "raise a security floor", "dep sweep", "bump a
  dependency", "pnpm override", or any advisory/currency/forced-bump
  trigger. Three entry doors: security-advisory response, routine
  currency sweep, upstream-forced bump. Core is the mechanism-decision
  tree (in-range lockfile refresh → package.json bump → override floor,
  in that preference order; existing floors are RAISED, never twinned)
  plus a verification tail proving floors bind and the fix survives a
  lockfile rebuild. Do NOT use for github-actions version bumps
  (Dependabot owns those), and never accept a Dependabot npm PR (its
  resolver trips minimumReleaseAge — unmergeable here).
  Failure shapes it exists to prevent: an open floor silently adopting
  an unreviewed major; loosening or removing a floor to make install
  pass; crossing a held major (live hold list in build-system.md);
  hand-editing pnpm-lock.yaml; trusting one advisory instrument's
  count as the whole picture.
---

# Update Dependencies

**Governance**: the knowledge home is
[`docs/engineering/build-system.md` §Dependency updates](../../../docs/engineering/build-system.md)
— agent-run sweeps not Dependabot-npm, the two held majors and their
lift conditions, the `minimumReleaseAge` mechanism. This skill is the
summonable routing: the decision tree, the verification tail, and the
failure shapes, applied at the moment a trigger fires. The override
comment discipline is modelled by `pnpm-workspace.yaml` itself — every
security floor there carries reachability, bound rationale, and a lift
condition. Sibling maintenance skills:
[`update-upstream-api-spec`](../update-upstream-api-spec/SKILL-CANONICAL.md),
[`update-bulk-download-schema`](../update-bulk-download-schema/SKILL-CANONICAL.md).

## Use When

- A security advisory fires (Dependabot alert, `pnpm audit` finding, a
  disclosure wave) touching any resolved package.
- A routine currency sweep is due (`pnpm -r outdated` backlog).
- A consumer forces a bump (peer conflict, needed feature, upstream
  requirement).

Not for: github-actions bumps (`.github/dependabot.yml` owns those);
the held majors' lift decisions (those are owner/ADR moments — this
skill STOPS at them and surfaces).

## Step 0 — The census (always, before any edit)

1. `pnpm audit --json` AND `pnpm audit --prod --json` — capture both to
   files on first run. `pnpm -r outdated` (exits 1 whenever anything is
   outdated — in-band signal, not failure).
2. **Instruments disagree by design**: Dependabot alerts, `pnpm audit`
   full scope, and `--prod` scope each see different sets (worked
   instance 2026-08-11: Dependabot 8 vs audit 12/11 — audit saw two
   highs Dependabot lagged on). Reconcile counts; done-when is EVERY
   FINDING RECONCILED on every instrument — cured, or documented as an
   explicitly owner-accepted residual with its lift condition (step 8).
   One instrument's zero is never done, and forcing an incompatible
   version to make a census read zero is the failure, not the cure.
3. **Diff the live advisory set against the existing override floors.**
   Floors drift silently between sweeps (worked instance 2026-08-11:
   three floors sat one micro-version below freshly-patched releases).
   This drift-check is the standing refresh loop; it fires on every
   summon, whichever door opened it.
4. Per advisory package, first-hand: `pnpm why -r <pkg>` (the real
   chains), direct-vs-transitive (`grep` the manifests), the patched
   version's PUBLISH DATE (`pnpm view <pkg> time`), and whether the
   parent's declared range admits the patch.

## The mechanism-decision tree

Work per PACKAGE (advisories group by package lineage, not alert), in
preference order — the first mechanism that cures TREE-WIDE wins:

1. **Direct dependency, declared range admits the target** →
   `pnpm update -r <pkg>` (the in-range refresh; note it SAVES manifest
   ranges by default — assert scope after). Edit the `package.json`
   range only when the range does NOT admit the target — no range churn
   for targets the manifest already allows.
2. **Transitive with a DIRECT parent whose bump re-resolves it** →
   update the parent (`pnpm update -r <parent>`). Verify the cure is
   tree-wide: a direct-parent bump creates a fresh node whose subtree
   resolves newest-in-range, but TRANSITIVE instances of the same
   parent keep their old pins and their vulnerable subtrees (worked
   instance 2026-08-11: a direct postcss bump left transitive postcss
   nodes still carrying vulnerable nanoid).
3. **Transitive, no full parent route** → `pnpm-workspace.yaml`
   override floor. There is NO name-targeted transitive refresh:
   `pnpm update -r <pkg>` and `--depth Infinity` both exit 0 and no-op
   on transitive-only packages (pnpm 11.20, verified 2026-08-11), and
   `pnpm dedupe` consolidates duplicates — it cannot move a
   single-instance pin. The floor is the sanctioned tree-wide mover;
   record the demonstrated necessity in its comment.
4. **A floor already exists for the package** → RAISE it in place,
   never add a twin entry.
5. **Bound every floor that could coerce** — an override REWRITES
   dependents' recorded ranges in the lockfile (peer ranges included),
   so an unbounded floor both adopts the next major unreviewed AND
   silences the peer conflict that should have blocked it. Bound below
   the next major when one exists; bound to the consumed line when
   consumers declare `^` ranges an open floor would drag across an
   incompatible major (worked near-miss 2026-08-11: an unbounded
   nanoid floor would have coerced postcss's `^3.x` onto ESM-only
   majors). Left unbounded ONLY with a dated no-next-major note. And
   inspect EVERY consumed line first (`pnpm why -r`): when consumers
   sit on multiple major lines, one global floor drags earlier-major
   consumers up onto the floor's major — use parent-scoped overrides
   (`parent>child`) per line instead of a single tree-wide range.
6. **The fix crosses a held major** (TS 6.x, `@types/node` 24.x — see
   build-system.md for the live list and lift conditions) → STOP and
   surface; the hold's lift condition governs, never the sweep.
7. **The target version is younger than `minimumReleaseAge` (1440
   min)** → the resolver SILENTLY excludes it and picks the newest
   version older than the floor — exit 0, no warning (verified
   first-hand 2026-08-11, pnpm 11.20; the floor downgrades, never
   refuses). Consequence: age-floored targets are INVISIBLE to
   `pnpm outdated` — its "latest" is computed under the floor too, so
   the row reads current (observed 2026-08-11). An outdated-zero
   therefore does not mean fully-current: name age-floored rows from
   publish-date reads (`pnpm view <pkg> time`), never from outdated's
   silence. Wait the floor out, or make a deliberate
   `minimumReleaseAgeExclude` entry as its own reviewed decision —
   never a workaround.
8. **The advisory's patched version does not exist for the resolved
   line** → verify before promising a cure: `pnpm audit`'s
   `patched_versions` can be a SYNTHETIC above-range rendering (the
   GitHub advisory's `first_patched_version` is NULL; worked instance:
   ">=3.0.98" printed for a line ending at 3.0.31). Do not force. Try
   the parent-bump route, else surface the residue honestly with the
   evidence and route the acceptance decision to the owner.

Traps that ride the mechanisms: `pnpm update` SAVES manifest range
changes by default — assert the intended file scope with `git status`
after every update command; any grep-based verification must use POSIX
classes (`[[:space:]]`), because BSD grep silently mismatches `\s` and
a zero-match sweep reads as a confirmed negative.

## The verification tail (per PR, before it opens)

- **Floors bind**: `pnpm why -r <pkg>` shows ≥ patched for every cured
  package — a floor the resolver never applies is a decoy.
- **Audit recomputed**: `pnpm audit` both scopes; name any deliberate
  residue in the PR body.
- **Lockfile diff read**: distinguish renormalisation noise from real
  resolution changes (a first dep-touching PR after a pnpm minor can
  carry a large no-new-versions rewrite — check for new
  `resolution: {integrity` lines; one body sentence explains the noise).
- **Rebuild survivability** (`lockfile-rebuild-survivability` rule —
  run ALL FOUR of its assertions, by result): copy the lockfile aside
  (`cp pnpm-lock.yaml <backup>` — never `git checkout` it back; with
  uncommitted work in flight that checkout DISCARDS it, the
  `never-use-git-to-remove-work` class), delete it, full
  `pnpm install`, then assert (1) every floor re-resolves at or above
  its value, (2) every documented hold still binds, (3) the audit
  outcome is unchanged, (4) after restoring the backup,
  `CI=true pnpm install --frozen-lockfile` succeeds — the check that
  exposes override/manifest desync before CI does. The regenerated
  lockfile is EVIDENCE, never committed (byte-identical regeneration is
  the strongest result).
- **PR opens as draft with the `jimbot` label** (owner ruling
  2026-08-11: every PR under the owner's or the bot's identity carries
  it at creation) and **gates green**; reachability reasoning for
  production-chain advisories recorded in the PR body (cure regardless
  — reachability prices urgency, never skips the cure).
- **Multi-PR waves may use GitHub PR stacks** (owner sanction
  2026-08-11, "where appropriate"): main's ruleset binds every stack
  member including mid-stack; merge bottom-up one-at-a-time on the
  standard path; at each merge the next PR auto-retargets via
  cascading rebase, so its tip MOVES — full re-settle and recount
  before its grant, and prefer the local `gh stack rebase` under bot
  identity over the server-side cascade (a server rebase rewrites
  committer identity). State reachability at the
  right rung: a package in a production dependency chain is a
  "production dependency"; PRODUCTION-REACHABLE additionally requires
  the RUNTIME call path (which import runs, on which route) — a
  dependency edge into code the app never executes is not runtime
  reachability (worked instance 2026-08-11: express-rate-limit lives
  only in SDK OAuth handlers the app bypasses).

## Failure shapes this skill exists to prevent

- Accepting a Dependabot npm-ecosystem PR (its resolver pulls sub-24h
  transitives and trips `minimumReleaseAge` at CI install —
  structurally unmergeable; the alerts stay on, the PRs do not).
- An unbounded floor adopting the next major unreviewed.
- Loosening, removing, or twinning a floor to make install pass.
- Crossing a held major inside a sweep.
- Hand-editing `pnpm-lock.yaml` (it is pnpm-generated, only).
- Reading one instrument's zero as done (audit-prod clean while
  Dependabot still shows open alerts, or vice versa).

## Related

- [`docs/engineering/build-system.md` §Dependency updates](../../../docs/engineering/build-system.md)
  — the knowledge home: sweeps-not-Dependabot, held majors, lift
  conditions.
- [`lockfile-rebuild-survivability`](../../rules/lockfile-rebuild-survivability.md)
  — the rebuild invariant the verification tail proves.
- [`never-disable-checks`](../../rules/never-disable-checks.md) — why a
  failing gate is never the thing to loosen.
- `pnpm-workspace.yaml` — the override comment discipline, modelled in
  place.
- Future-work pointers (deliberately NOT built here): a
  floors-vs-advisories drift validator; scheduled sweep triggering.
