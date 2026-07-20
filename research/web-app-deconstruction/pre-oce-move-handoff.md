# Pre-OCE-move handoff and working-tree scan

For the next agent moving this record into OCE. Read after the
[continuation thread](./.agent/memory/operational/threads/oak-app-foundations.next-session.md)
and the [comms log](./.agent/collaboration/comms-log.md). Verify every git fact below
against the live repo.

## 1. Current state (2026-07-20 closeout)

- Branch `docs/session-wrap-2026-07-20`, in sync with origin; **draft PR #2** open,
  mergeable, all checks green. **Merge + tag are the owner's** call.
- Gates pass: `pnpm research:check` → 90 Markdown files portable/linked/indexed, 112
  concept lenses valid. Working tree **clean** (0 modified, 0 untracked); all committed.

## 2. Corrected, evidence-based sensitivity stance (current; supersedes the archive)

The private archive at `.agent/reports/2026-07-20-tony-e8e2f4/` preserves earlier
**superseded** reasoning that inflated ordinary architecture into a "must stay private"
conclusion. That is **withdrawn**. The evidence, from a direct secret scan plus an
8-region calibrated review of the actual sources:

- **All 8 source regions safe to describe publicly. Zero real production secrets** (every
  hit is a self-labelling dev placeholder or a GitHub Actions `secrets.*` reference).
- The "bypass" was the source's own word for "skip redundant validation already done
  upstream" — ordinary architecture, not an access-control flaw.
- **Nothing is blocked on Database-Tools or oak-openapi going public.** The record needs
  no reframing or keyword-scrubbing.
- Only genuine findings: two **low**-severity non-constant-time `===` comparisons
  (`hasura-auth/.../validate-token.ts`, `oak-openapi/src/middleware.ts`) — route to Oak
  engineering; unrelated to publication.

## 3. Move principle: INCLUDE EVERYTHING by default

**Owner direction (2026-07-20): everything is included in the move unless there is a
specific piece of evidence that a particular item must not be.** Do not build a
security-driven exclude list — the source scan found nothing that warrants one.

### The only evidenced exclusions

1. **The live-system harm report** (`live-system-findings-for-triage`, incl. its snapshot
   inside the archive) — owner-directed to stay private; it is a consolidated live-system
   triage disclosure. _(evidence: explicit owner direction.)_
2. **The private session archive** `.agent/reports/2026-07-20-tony-e8e2f4/` — the owner
   marked it "not material for transfer into a public repository" (private historical and
   superseded evidence). _(evidence: its own README + the `.agent/README` note.)_
3. **Generated artifacts** — `node_modules/`, `.turbo/`, `.research-evidence/`, any
   `dist/` — build/dependency output, not source. _(evidence: not source; universal.)_

**Everything else moves**, including all of `docs/**` (with
`current-state/database-tools/**`), all tooling source (`packages/research-evidence`,
`scripts`), root config, and the `.agent/` operational surfaces (`collaboration/`,
`memory/`, this handoff). None has specific evidence against inclusion.

## 4. Move mechanics

- **Owner constraint: content only, not git history.** The OCE workspace receives current
  file content as a fresh addition; WAD's commit history does not come across.
- Copy git-tracked content (e.g. `git archive` of the tree) — this excludes the generated
  artifacts automatically — then remove the two owner-directed private paths (the harm
  report and the archive).
- Optional readability: de-link the 519 private-repo permalinks in `docs/**` (they 404
  while the repos are private) — cosmetic, **not** security. No reframing / keyword-scrub.
- Target OCE `research/web-app-deconstruction`; register in `pnpm-workspace.yaml`,
  `turbo.json`, root `tsconfig`; run OCE gates; open a **draft PR** for owner review.
- The actual publish is the **owner's** decision (outward, hard-to-reverse) — do not
  self-authorise.

## 5. Open items for the owner

- Whether and when to publish into public OCE.
- Route the two hardening nits (§2) to Oak engineering.

## 6. Durable homes

Research: [research index](./docs/README.md). Operational: the
[continuation thread](./.agent/memory/operational/threads/oak-app-foundations.next-session.md)
and the [comms log](./.agent/collaboration/comms-log.md). Historical evidence:
the private archive `.agent/reports/2026-07-20-tony-e8e2f4/`, which remains in
the private `web-app-deconstruction` repository and is not copied here.
