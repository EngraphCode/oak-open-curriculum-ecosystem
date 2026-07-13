<!--
PR title: LINEAR-ID: type: concise summary
Optional scope: LINEAR-ID: type(scope): concise summary
Example: LINEAR-ID: feat(search): add programme filters

The Linear ID must be the first text in the title. See CONTRIBUTING.md for
linking, closing, and exception rules. Remove instruction comments as you fill
in the template.
-->

## Linear

<!--
Use `Fixes LINEAR-ID` when merging this PR completes the issue.
Use `References LINEAR-ID` when the issue must remain open after merge.
For intentionally untracked exceptions, write `Not applicable — <reason>`.
-->

References LINEAR-ID

## Summary

<!-- What changed? Describe the coherent outcome, not the file list. -->

## Why

<!-- What problem does this solve, who or what benefits, and why now? -->

## Review focus

<!-- Where should reviewers spend attention? Name important decisions or assumptions. -->

## Scope

<!-- State what is deliberately in and out of this PR. -->

- In scope:
- Out of scope:

## Validation

<!--
Give reproducible evidence for the final diff: commands and results, manual
checks, screenshots, or a reason a validation type is not applicable.
-->

## Risks and rollout

<!--
Describe compatibility, migration, deployment, monitoring, rollback, or
follow-up considerations. Write "None" when there are no relevant risks.
-->

## Checklist

- [ ] The title begins with the primary Linear issue ID and a conventional-commit summary, or this PR explains a documented exception
- [ ] The Linear relationship above is accurate (`Fixes`, `References`, or a justified exception)
- [ ] Validation evidence reflects the final diff and all required quality gates pass (`pnpm check` is the canonical full local gate)
- [ ] Tests cover changed behaviour, or the validation section explains why tests are not applicable
- [ ] Documentation is updated where behaviour, interfaces, or contributor workflows changed
- [ ] An ADR is added or updated for architectural decisions
- [ ] No secrets, credentials, or sensitive data are included
