# Read Next.js Docs Before Coding

Owner-directed (2026-07-02). Training-data knowledge of Next.js is stale by
construction — the framework moves faster than any model cutoff, and the
installed package ships its own documentation. The vendored docs are the
source of truth for the version actually running; where recall and the
vendored docs disagree, the docs win.

## Trigger

Any Next.js work in any workspace that depends on `next`: authoring or
modifying routes, layouts, server/client components, `proxy.ts` (the Next 16
successor to `middleware.ts`), `next.config.*`, rendering/caching behaviour,
or debugging Next-specific behaviour.

## Action

Before coding, find and read the relevant doc under the **consuming
workspace's** `node_modules/next/dist/docs/` — pnpm resolves per workspace,
so the path is the workspace's own `node_modules`, never the repo root's
(e.g. `demos/oak-curriculum-hub/node_modules/next/dist/docs/`).
Layout: `01-app/` is the App Router (this repo's default), `02-pages/` the
legacy Pages Router, `03-architecture/` the internals; start from `index.md`
when unsure.

Worked instance (this repo): Next 16 renamed `middleware.ts` to `proxy.ts`;
the in-tree Clerk research predates the rename, so a plan built on
training-data recall would wire the wrong file — caught only because the
live docs were checked (recorded in the productionisation plan's WS6 notes).

## Related Surfaces

- [`verify-vendor-call-shapes-at-plan-author-time`](verify-vendor-call-shapes-at-plan-author-time.md)
  — the plan-time sibling for all vendors; this rule is the coding-time
  discipline for Next.js specifically, with the vendored docs as the named
  source.
- Platform Next.js helpers (the `vercel:nextjs` skill, the `next-devtools`
  MCP `nextjs_docs` tool) are supplements where available — the vendored
  docs remain authoritative because they match the installed version
  exactly.

## Enforcement

Behavioural at the coding moment: the discipline is reading the vendored doc
before the first Next-touching edit, and citing it (path or section) when a
Next.js design choice is load-bearing in a review or plan.
