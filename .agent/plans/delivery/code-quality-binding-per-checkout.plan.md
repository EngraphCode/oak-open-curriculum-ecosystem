---
id: code-quality-binding-per-checkout
node_type: delivery
name: "The code-quality IDE binding and the studio project id are per-checkout"
overview: "Untrack the two zero-code identity files a tool reads — the SonarLint connected-mode binding and the design-studio sync config — behind tracked examples, so this checkout binds to its own projects and the rule that spelled a project key points at the binding instead."
status: sketch
ratified_by: null
ratified_date: null
ratified_where: null
serves: organisational-identity-below-the-tree
impact_areas:
  - practice-and-estate
tickets: []
depends_on: []
owner_gates: []
last_updated: 2026-09-03
---

# The code-quality IDE binding and the studio project id are per-checkout

## Goal

Two tracked files that a tool reads carry one organisation's project identity as a
literal: the SonarLint connected-mode binding (organisation, project key, region) and the
design-studio sync config (an account-bound project id). After this lands, both are
untracked per-checkout files behind tracked `.example` twins, this checkout's copies name
its own projects, the IDE's workspace settings no longer carry a duplicate binding, and the
one rule that spelled a project key points at the binding file. This is the owner-named
first slice of the strategic node and the shape every later slice reuses.

## User groups and value

- **An organisation running this repository as its own**: its IDE binds to its own
  code-quality project and its own studio project by copying two examples; no tracked edit,
  no conflict at the next upstream sync.
- **Contributors on this line**: the code-quality CLI and IDE resolve the project this
  checkout is actually bound to, so a wrong-organisation analysis cannot happen silently.
- **The platform's maintainers**: the first two members of the per-checkout file class
  land with no code, proving the tree shape before the shared resolver is built.

## Mechanism

Rung (b) of the strategic node's ladder, no code:

1. Gitignore `.sonarlint/connectedMode.json` and `.design-sync/config.json`, each beside
   a comment naming its example (the merge-bot line is the precedent).
2. Add `.sonarlint/connectedMode.json.example` (placeholder organisation, an
   `<org>_<repo>` project key, the region) and `.design-sync/config.json.example` (a
   placeholder project id, the other fields unchanged since they describe the package, not
   the account).
3. Untrack both files (`git rm --cached`); this checkout's working copies stay on disk and
   are re-pointed at its own projects.
4. Remove the duplicate `sonarlint.connectedMode.project` block from the tracked IDE
   workspace settings: the IDE extension reads the shared binding file as its suggestion and
   writes an accepted binding back into workspace settings, so a tracked copy is a pin that
   regenerates; the untracked binding file is the one home.
5. In the sonarqube-mcp rule, replace the spelled project key with the sentence that the
   key is read from this clone's binding file, and say where the example lives.
6. In the merge-bot engineering doc's per-checkout section, add the two files to the list
   of per-checkout identity files, so the adoption reader finds them in one place.

The remote code-quality MCP server needs none of this: its organisation arrives as a
request header on the user-scope server entry, already below the tree.

## Acceptance criteria (each with a proof — required)

- **Only examples are tracked.** `git ls-files .sonarlint .design-sync` lists
  `connectedMode.json.example`, `config.json.example` and the studio's notes and
  conventions files, and neither instance file. Proof: `repo-safe`, the command in the PR
  body and the pre-push gate's clean run.
- **No spelled key in mechanism or doctrine.** `git grep -n 'oaknational_' -- ':!README.md'
  ':!docs/architecture' ':!**/archive/**'` returns nothing in rules, skills, IDE settings or
  the two example files. Proof: `repo-safe`, the command in the PR body; the strategic
  node's validator later holds it.
- **This checkout binds to its own projects.** The IDE's connected-mode suggestion offers
  the organisation and project named in the untracked binding, and the studio sync tool
  reads the project id from the untracked config. Proof: `owner-held`, the owner confirms
  the IDE's bind prompt or bound status on this checkout, recorded on the PR.
- **A cold clone is told what to copy.** Both examples carry a header comment naming the
  file they become and where the value comes from; the engineering doc lists them. Proof:
  `repo-safe`, the docs validators in the aggregate gate.

## Todos

One single-story PR within the default round budget: the six mechanism steps above, with
the PR body carrying the two `git` proofs and the owner's IDE confirmation.

## Out of scope

- The shared checkout-config resolver and every agent-tools reader (the PR-throughput
  repository constant, the dependency census scope): the next slices, once this shape has
  landed.
- The harness client configs naming the error-reporting organisation, the error-reporting
  CLI files, the workflow triggers and the adapter prefix: their own slices, each with its
  rung.
- README badges and the code-quality exclusions file: canonical identity and portable
  mechanism respectively; neither is a pin.
- The validator: it lands in its own slice seeded with the census, after which this slice's
  grep proofs become census-row deletions.
