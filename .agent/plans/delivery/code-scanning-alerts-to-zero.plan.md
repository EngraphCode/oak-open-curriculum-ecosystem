---
id: code-scanning-alerts-to-zero
node_type: delivery
name: "Code-scanning alerts to zero on the resting branch, and held there"
overview: "Every open code-scanning alert on the resting branch resolves under the Sonar disposition policy — fixed in code, or a site-rationalised false-positive or safe disposition recorded in the tree — never an accepted risk or a hand dismissal, and the pull-request gate keeps the count at zero."
status: sketch
ratified_by: null
ratified_date: null
ratified_where: null
serves: reliable-atoms-programme
impact_areas:
  - practice-and-estate
  - analytics-and-observability
  - served-surface
tickets: []
depends_on: []
owner_gates: []
last_updated: 2026-09-06
---

# Code-scanning alerts to zero on the resting branch, and held there

## Goal

The repository's code-scanning surface reads zero open alerts on the resting branch, and
stays there: each alert resolves under the estate's Sonar disposition policy
(`docs/governance/sonar-disposition-policy.md`) — fixed in code with a test that pins the
cure, or, only where that policy's class criteria hold, a false-positive or safe
disposition carrying the policy's canonical rationale plus the site path and line, recorded
in the tree. Accepted-risk dispositions and hand dismissals in the hosting service are
excluded by that policy and by this node. A reader of
the security tab, an auditor of the release, or an agent picking up a lane sees a surface
whose every line is a fact about the code, not an unread signal.

## User groups and value

- **The owner and release readiness.** A zero surface is a release property that can be
  read at a glance; a non-zero surface with unreviewed findings cannot be told apart from a
  real vulnerability. Value: one number that means what it says.
- **Agents working the estate.** Every seat that opens the security tab today meets twenty
  findings it cannot tell from the last seat's backlog; each re-reads them. Value: the
  backlog is gone and the gate keeps it gone, so the next seat reads only what its own change
  introduced.
- **Consumers of the atoms the findings sit in** — the agent-tools runtime, the logger's
  trace derivation, the server's correlation id, the schema cache and the drift check. Value:
  primitives whose security-sensitive behaviour is deliberate and tested rather than
  incidental.

## Problem

Twenty alerts are open on the resting branch from two analysers whose findings both land in
the hosting service's code-scanning surface: two from CodeQL and eighteen from the
code-quality analyser's security rules, uploaded alongside its own quality gate. They fall
into six classes:

| Class | Rule | Sites | What the rule sees |
| --- | --- | --- | --- |
| Network data written to a file | `js/http-to-file-access` | 2 | a fetched document, or text derived from it, reaches a file write |
| Executable searched on PATH | `S4036` | 8 | `spawn`/`exec` of `git`, `pnpm`, `node` and others by bare name |
| Pseudo-random number generator | `S2245` | 3 | `Math.random` in a correlation id, a retry backoff, a chunking helper |
| Weak hash | `S4790` | 1 | MD5 deriving a trace id from a correlation id |
| Clear-text protocol literal | `S5332` | 4 | `http://` literals in test configuration and helpers |
| Polynomial regular expression | `js/polynomial-redos` | 1 | a lazy match inside a bracketed quantifier over untrusted HTML |

The two analysers are independent instruments over the same tree; both keep reporting on
every pull request, so the surface only reads zero if the resting branch is cleared and the
gate refuses new findings.

## Mechanism

One disposition per class, taken from the Sonar disposition policy's two-outcome rule: a
finding is FIXED in code, or it is a FALSE_POSITIVE or SAFE only where the policy's
documented class criteria hold at that site, with the canonical rationale plus path and
line recorded in the tree. Nothing is excluded by path, no rule is narrowed, and no
accepted-risk state exists. Where a fix is cheap it is taken even when the policy would
allow a safe disposition, because a fix clears both analysers' surfaces without any
server-side action.

- **Network data written to a file.** The drift check writes a status description derived
  from the upstream document to the workflow's output file; the schema cache writes the
  validated document itself. The drift check's cure makes the written bytes independent of
  upstream text: the description becomes a closed enumeration plus counts computed from the
  validated parse. The schema cache already writes the structural validator's re-serialised
  output (`packages/sdks/oak-sdk-codegen/code-generation/schema-cache.ts`, whose comment
  names these alerts), and its alert stands because validation returns the fetched document,
  so the analyser's taint path runs through the validator to the write; no rewrite of that
  write which keeps the cache's contract can end the path. Its cure is the analyser's
  documented barrier model (its JavaScript library-model guide, read 2026-09-06): a tracked
  data extension naming the validator's return value as a barrier for this rule's taint
  kind, with the rationale at the site (a constant path, and the written value is the
  validated document, which is the cache's contract). The alert closes on the next analysis
  of the resting branch or the model is wrong; if the rule's own configuration consults no
  barrier kind, the unit records that finding on this node rather than dismissing the alert
  in the hosting service.
- **Executable searched on PATH.** Fix-only under the policy, tooling included: every site
  resolves its executable to an absolute path from a fixed allowlist of well-known
  directories without consulting PATH — the existing trusted-git atom for `git`, and the
  same shape extended to the other binaries — unit-tested for the refusal of an unresolved
  name.
- **Pseudo-random number generator.** The correlation id takes its random part from the
  platform's cryptographic generator; the backoff jitter and the chunking helper take a
  cryptographic integer where the analyser requires it, since the cost is nil and the cure
  is smaller than the argument.
- **Weak hash.** The trace-id derivation states its purpose — a stable sixteen-byte
  identifier, not a secret — and moves to a current hash truncated to the identifier's width,
  with a test that pins the width and the stability of the mapping.
- **Clear-text protocol literal.** Fixtures that never dial their host take an `https`
  literal, a fix. A localhost loopback in a test helper or test-runner configuration meets
  the policy's SAFE criteria for this class and takes its canonical rationale, recorded per
  site.
- **Polynomial regular expression.** The script body is located by an index scan for the
  opening tag and the closing tag, or by a linear-time expression, with a test over a long
  pathological input.
- **The gate.** The pull-request workflow already runs both analysers as required checks;
  this node adds the proof that a new alert of any of the six classes blocks a merge, and
  the reading command that shows the resting branch at zero.

Why this produces the outcome: each class is cured at its root (the atom, the fixture, the
regex) rather than at its symptom, so the same site cannot re-trip a sibling rule; each
configured answer is a tracked change with its rationale, so a reviewer can refute it; and
the gate turns "zero" from a snapshot into an invariant.

## Acceptance criteria (each with a proof — required)

1. The resting branch's open code-scanning alert list is empty for both analysers. Proof:
   `repo-safe` — the hosting service's alerts query for the resting branch, run by the
   landing seat and recorded on the lane's closing event.
2. Every cured site has a test that fails on the previous behaviour: the refusal of a
   non-absolute executable, the cryptographic source of the random part, the trace-id width
   and stability, the linear-time extraction over a pathological input, the output
   description's closed vocabulary. Proof: `repo-safe` — the tests, named in each unit.
3. Every non-fix disposition is one the policy's class criteria permit, carries the
   canonical rationale with the site path and line in the tree, and no alert on the resting
   branch carries an accepted-risk or hand-dismissal state. Proof: `repo-safe` — the
   recorded rationales and the alerts query's dismissal field.
4. A pull request introducing one new instance of each class is blocked by a required check.
   Proof: `repo-safe` — one probe pull request per analyser, closed unmerged, cited by number
   on the lane's closing event.

## Out of scope

- Hand-dismissing, snoozing or marking "won't fix" in the hosting service or the analyser's
  own console: no state lives there that the tree cannot explain.
- The code-quality analyser's non-security quality backlog (its own quality profile), which
  has its own tracking thread and plan lineage; this node touches only findings that reach
  the code-scanning surface.
- Rewriting the drift check's or the schema cache's purpose; both keep their contracts.
- Raising or lowering the analysers' rule sets, or excluding any path from them; this node
  clears what they report today.

## Todos

Six PR-shaped units, each a single story inside the small-PR bands and its round budget,
independent unless stated:

1. **Random and hash primitives.** The correlation id, the backoff jitter, the chunking
   helper and the trace-id derivation, with their tests: about eight files, no
   configuration.
2. **The regular expression.** The script-body extraction rewritten linear-time with the
   pathological-input test: two files.
3. **Network data written to a file.** The drift check's closed-vocabulary description with
   its test, and the schema cache's tracked barrier model with its site rationale; the
   cache's validated write already exists and does not change. The drift check takes the
   same model only if the closed vocabulary leaves its alert standing, with its reason:
   about five files.
4. **Executables on PATH — the runtime and server sites.** The trusted-executable atom
   generalised from the trusted-git shape, with its refusal test, adopted at the runtime
   sites: about six files.
5. **Executables on PATH — the tooling sites, and clear-text literals.** The remaining
   spawn sites take the same atom (fix-only, no exception for tooling); fixture literals
   switch to `https` where the host is never dialled; the localhost helper sites take the
   policy's SAFE disposition with its canonical rationale recorded per site: about seven
   files.
6. **The gate proof.** The two probe pull requests and the reading command, recorded on the
   lane's closing event; no tree change unless a required check turns out to be missing,
   in which case that change is this unit.

## First-principles check

The six clauses of the plan-body first-principles check, applied at authoring:

- **Shape.** The tests prove behaviour the estate owns — a refusal, a source of randomness,
  a width, a linear bound, a closed vocabulary — never that an analyser's rule fires.
- **Landing path.** Tests take the estate's existing tier names so the existing runners
  include them; configuration changes live in the analysers' tracked configuration files,
  never in service-side state.
- **Vendor literal.** No rule id or analyser name in this body is a mechanism; each names a
  finding class to disposition. The capability locus for the gate is the hosting service's
  required-check setting, already in force, so the gate unit proves rather than builds.
- **Optionality surface.** No open choice is left to the implementer beyond the one class
  test the Mechanism states; each unit names its cure shape and its fallback.
- **Record consumer.** The lane's closing event is the only accounting surface added, and
  the alerts query is its consumer.
- **Rules tier.** The node presupposes only standing doctrine — the Sonar disposition
  policy's two-outcome rule; checks are never disabled; validation is strict at the
  boundary; no escape hatches in enforcement — and adds none.

## Review dispositions

One row per finding; "applied" means folded into this node before ratification.

| Date | Source | Finding | Disposition |
| --- | --- | --- | --- |
| 2026-09-06 | PR #56 round one (Codex) | The executable-on-PATH arm proposed a tooling exception and an accepted-risk state that the Sonar disposition policy excludes. | Applied: the mechanism follows the policy's two-outcome rule — fix-only for that class through the trusted-git shape, site-rationalised SAFE only where the policy's class criteria hold, no path exclusions. |
| 2026-09-06 | PR #56 round two (Codex) | Unit 3's cache arm proposed the validated write that `schema-cache.ts` already performs, so the arm could not clear the alert. | Applied: the mechanism and unit 3 state the fact and take the analyser's documented barrier model, with the no-model outcome recorded on the node rather than a dismissal. |
