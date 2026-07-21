# Research practice

## Status

This is the enforceable working practice for the deconstruction repository. It adapts only the OCE practices that directly protect durable, inspectable research; it does not import OCE's wider agent, workspace or governance machinery.

## Principles

1. **Documentation is infrastructure.** A stale index, broken evidence link, ambiguous canonical record or machine-local command is a functional defect in the research system.
2. **One canonical home per claim.** Current-state evidence, premise records, hypotheses, decisions and synthesis have distinct responsibilities. Higher-level documents link to evidence rather than silently restating or strengthening it.
3. **References point toward durable evidence.** A governing or synthesis document must not depend on session-only output. Transient results become evidence only after their revision, method, inputs, output and limits are recorded in the repository.
4. **Evidence states its measurement scope.** A proxy proves only what it measures. Tool conformance, bundle size, source structure and expected-result fixtures do not establish user value or product excellence by themselves.
5. **Negative and ambiguous results persist.** Failed reproductions and weakened hypotheses are research outcomes, not material to discard.
6. **Portable commands and fixtures are part of the finding.** Durable instructions use repository-relative paths and declared prerequisites. Temporary harnesses must be checked in when their exact behaviour supports a claim.
7. **Checks are not waived.** A failing research check is corrected or the governing rule is explicitly reconsidered; it is not bypassed for convenience.
8. **Concept exploration precedes solution selection.** A named framework is not a new lens unless it changes the protected subject, unit, decision authority, failure signal, time horizon or falsifying evidence. A retained lens follows all four OCE Concept Explorer movements: literal observation and inherited assumptions; mechanism-neutral problem framing; reopened explanations and solution shapes; then warranted synthesis with invalidators and unresolved evidence.
9. **Reference integrity is not claim validity.** Link, structure and inventory checks establish reachability and shape. Independent semantic review must also verify polarity, denominator, scope, qualification, evidence label and whether the cited source entails the claim.
10. **Owner decisions remain explicit.** Genuine scope, identity and value forks are surfaced to Oak immediately as explicit questions or action cards. Routine reversible execution choices remain with the researcher; neither class is buried in a long report or silently deferred.

These principles adapt the useful parts of OCE's [documentation infrastructure decision](https://github.com/oaknational/oak-open-curriculum-ecosystem/blob/bd878a3a550c8e5e5d21163a6d0962cebdaf43fa/docs/architecture/architectural-decisions/127-documentation-as-foundational-infrastructure.md), [ground-truth validation discipline](https://github.com/oaknational/oak-open-curriculum-ecosystem/blob/bd878a3a550c8e5e5d21163a6d0962cebdaf43fa/docs/architecture/architectural-decisions/085-ground-truth-validation-discipline.md), [Concept Explorer workflow](https://github.com/oaknational/oak-open-curriculum-ecosystem/blob/bd878a3a550c8e5e5d21163a6d0962cebdaf43fa/.agent/skills/concept-exploration/SKILL-CANONICAL.md) and documentation validators. OCE rules based on mandatory workspace separation, genericity tiers or a second consumer are deliberately not inherited; this repository's [research charter](./research-charter.md) governs those questions.

## Required checks

Run `pnpm check` after changing the research record and before committing. Its
`research:check` stage verifies:

- internal Markdown links resolve;
- every Markdown research artifact is reachable from the root README;
- durable research and tooling contain no user-home or machine-temporary paths;
- trailing whitespace and merge-conflict markers are absent.

The aggregate also runs `pnpm format:check` and
`pnpm research:evidence:test`. CI enforces the same three checks.
Source-measurement experiments remain separate because they require the pinned
sibling repositories and their installed dependencies.

Run `pnpm research:concept-links` whenever either Concept Explorer portfolio or
the Database/API/OCE authority-chain corpus changes. In this public projection
the command validates the OWA/Components portfolio anchors and the retained
OCE anchors of the database authority-chain tree; it requires the sibling OWA,
Components and OCE checkouts whose HEADs are the revisions named by the
records. Pinned links into the private Database-Tools and oak-openapi
repositories were reduced to plain-text citations here (ADR-215 Decision 4),
so the full private-anchor validation runs in the private master — those
checkouts are validated only when supplied explicitly. It reads the committed
Git blobs, reports working-tree cleanliness, and verifies every pinned source
path and line range it validates. It does not validate claim meaning. It is a
local evidence check rather than a CI requirement because the sibling source
repositories are not part of this repository checkout.
