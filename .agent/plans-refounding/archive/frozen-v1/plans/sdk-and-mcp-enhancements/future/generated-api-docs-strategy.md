---
status: future
owner: unassigned
created: 2026-07-03
---

# Generated API docs — investigate whether and how to use them

## Why this plan exists

The repo carried typedoc-generated API documentation (curriculum-sdk
`docs/api-md`, ~150 committed markdown pages; search-cli `docs/api` generated
per-check and self-verified) with **no consumer**. Nothing linked to the pages,
no gate kept them fresh, and the committed set had drifted a full repo-rename
and ~50 versions behind the code (stale repo name, `v0.8.0` headers, dead
pages for removed APIs, missing pages for new ones). The drift surfaced only
when a prettier 3.9 idempotence bug corrupted the files during a formatting
pass (2026-07-03).

Owner direction (2026-07-03): the generated docs are not used — disable
generation, remove the artefacts from the repo, and record the future
investigation here. The removal landed on `feat/curriculum-hub-demo`:
outputs, typedoc configs, generation scripts, the `doc-gen` turbo task, the
typedoc devDependencies, and all doc references. Git history retains every
generated page.

## The question to answer

Is generated API documentation worth having in this repo — and if so, for
whom, generated when, and enforced how?

## Lines of enquiry

1. **Consumers first.** Who would read SDK API docs — human contributors,
   AI agents grounding on the SDK surface, external API users? The TSDoc
   source comments already serve IDE users and agents reading source; what
   does a rendered artefact add, and where should it live (in-repo, docs
   site, package registry page)?
2. **Freshness enforcement.** The prior failure mode was
   generated-then-committed with no gate: drift accumulated silently. Any
   revival must wire generation into the check chain (regenerate + fail on
   dirty tree, the `sdk-codegen` pattern) or generate at publish/deploy time
   and commit nothing.
3. **Toolchain constraints.** Record from the removal: prettier 3.9.x was
   non-idempotent on typedoc's escaped-generic markdown (`\<...\>` grows a
   `>` per format pass) — any revival must either exclude generated docs
   from format gates or prove `format(format(x)) == format(x)` first.
   `openapi-zod-client` (sdk-codegen) requires prettier `^2.7.1` internally —
   never force a repo-wide prettier override (2026-07-03 estate breakage).
4. **Scope.** Whether search-cli's docs (previously generated per-check and
   verified for existence only) need reviving at all, or whether the SDK is
   the only surface worth documenting.

## Acceptance for reviving (if the answer is yes)

- A named consumer with a linked entry point.
- Generation wired so drift is structurally impossible (gate or
  publish-time).
- Format-gate interaction proven stable.

## Acceptance for not reviving

- A recorded decision naming TSDoc-in-source as the sole API documentation
  surface, with this plan closed against it.
