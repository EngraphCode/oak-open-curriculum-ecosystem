# Lockfile-Rebuild Survivability

Owner rule, verbatim (2026-07-25): **"all updates and overrides must be able
to survive having the lockfile fully deleted and rebuilt."**

`pnpm-lock.yaml` is a DERIVED artefact. A security floor, version hold, or pin
that holds only because the lockfile happens to record a good version is not a
constraint at all — it evaporates the first time anyone regenerates from
scratch, and the regression is silent, because the rebuilt tree still installs
cleanly and every gate stays green. The constraints that survive live in
declarations: `package.json` ranges and the `pnpm-workspace.yaml` `overrides:`
block.

## Trigger

Any dependency landing: a security-floor bump, a version hold, a new or raised
`overrides:` entry, a batch sweep, or a single package bump. No size threshold
— a one-line floor is exactly the case where "it resolves correctly right now"
gets mistaken for "the constraint is expressed".

## Action

Run the rebuild; do not reason about it. Reasoning cannot see an incidental
pin.

```bash
cp pnpm-lock.yaml /tmp/lock-committed.yaml   # forward-going copy, never a git removal
rm pnpm-lock.yaml
pnpm install                                  # rebuild from declarations alone
```

Then assert all four, and read each result rather than the exit code alone:

1. **Floors** — every advisory-carrying package resolves at or above its fixed
   version.
2. **Holds** — every documented major hold still holds (this repo: `typescript`
   on 6.x via manifest ranges, `@types/node` on 24.x via its override; both
   documented in
   [`docs/engineering/build-system.md`](../../docs/engineering/build-system.md)
   §Dependency updates).
3. **Audit** — `pnpm audit` is unchanged, with any deliberate deferral still
   the only residue.
4. **Frozen install** — `CI=true pnpm install --frozen-lockfile` exits 0.

Restore by copying the backup back if the rebuild is not the state you want to
commit.

**A byte-identical rebuild is the strongest pass.** A rebuild that merely
satisfies all four assertions is still a pass: newly-published in-range
versions are legitimate drift, not a violation. A rebuild that drops a floor,
crosses a hold, or fails the frozen install means the constraint was never
declared — fix the declaration, never re-pin by hand.

## The override-alignment corollary

pnpm `overrides` rewrite the **effective specifier of direct dependencies**,
not just transitive resolution. So an override left lagging behind the
manifests it governs desyncs the lockfile: the lockfile records the override's
specifier while the manifests carry their own.

**This desync is invisible to every local gate** — no local hook runs a frozen
install, so CI's `pnpm install --frozen-lockfile` is the first surface that
sees it, failing with `ERR_PNPM_OUTDATED_LOCKFILE` and taking `install`,
`secret-scan` and `run-quality-gates` down with it.

Keep override and manifest specifiers aligned whenever a sweep moves either.

## Worked instances

- **MCP-151 (2026-07-25)**: the security slice (#530, six bounded floors) and
  the estate-wide drift sweep (#531) were each tested by full delete-and-rebuild
  and came back **byte-identical** — every floor, both major holds, and the
  audit state proven declaration-derived rather than lockfile-retained.
- **The corollary, same lane**: the sweep moved `@types/node` manifests to
  `^24.13.3` while its override still read `^24.13.2`, producing exactly the
  `ERR_PNPM_OUTDATED_LOCKFILE` desync above. Cured by aligning the override —
  the same alignment `21fdff136` made for the esbuild security floor, and the
  same class `docs/operations/troubleshooting.md` records for PR #296.

## Related Surfaces

- [`docs/operations/troubleshooting.md`](../../docs/operations/troubleshooting.md)
  §"Lockfile desync via pnpm overrides" — the diagnostic entry this rule makes
  preventative.
- [ADR-174](../../docs/architecture/architectural-decisions/174-dependency-vulnerability-scanning-quality-gate.md)
  — overrides are temporary controls that must name the vulnerable dependency,
  why the override is safe, and the condition for removal. This rule adds: and
  they must survive a rebuild.
- [`docs/engineering/build-system.md`](../../docs/engineering/build-system.md)
  — security `overrides` and `peerDependencyRules` belong in
  `pnpm-workspace.yaml`; a CVE floor earns an override, a tool-version pin does
  not.
- [`validators-must-recompute-not-just-record`](validators-must-recompute-not-just-record.md)
  — the same principle one layer up: a check that reads recorded state instead
  of recomputing it cannot see the defect.
