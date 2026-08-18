# Foreign Board Write Discipline

**TRIGGER — the rule fires at the WRITE CALL to a ticket, board, or
tracker you do not own, never in the abstract:** name the field you are
about to touch and check it against the three-way split below. Links to
our own tickets and status updates are permitted; the description and
the comment thread are not; priority stays theirs. If the field is not
on the permitted list the write does not happen — the route is a message
asking the record's owner to make it.

Owner instructions (2026-08-18, minutes apart, the second narrowing the
first — names redacted): "please don't post onto [a colleague]'s board
or tickets. I see you've edited it … please undo", then "For each of
those tickets on [their] board could we link them to their related
tickets on our board please? and update the status (this we _can_ do)".

The boundary generalises beyond that one board, and the generalisation
is the point — the next foreign board will not be theirs. **Links and
status are shared bookkeeping about work we own; the description and the
comments are the record owner's own voice, and stay theirs.**

## Trigger

About to write to any ticket, board, project, or tracker owned by
someone else: a colleague's Linear project, another team's issue, a
foreign repository's GitHub issue, a Notion database that is not ours.
Reading is unceremonied; the rule fires at the write.

Ownership is a property of the RECORD, not of the work. Holding the
dependency, owning the fix, or being demonstrably right about the
ticket's content does not make the record ours.

## Action

Split every intended write three ways.

- **PERMITTED** — `relatedTo` / `blockedBy` links pointing at our own
  tickets, and status/state updates so the board reflects reality. Both
  are statements about work we own, recorded where the dependency is
  visible.
- **NOT PERMITTED** — editing the description; posting comments. A
  description is the product owner's own statement of their need; a
  comment is us speaking on their record. Neither is ours to author,
  however accurate the content. Route the substance to the owner and
  let them write it.
- **STAYS THEIRS** — priority. The owner named links and status only;
  the priority edits were the part he asked undone. Absence from the
  permitted list is a prohibition, not an open question.

**Do not read the prohibition as blanket.** Withholding the links too
would leave the two boards permanently disconnected — which is the
disconnection the owner was objecting to in the first place. Being
factually right about someone else's ticket is not authority over their
words, but it IS a reason to keep the dependency graph honest.

## Failure Mode Prevented

Silent authorship on someone else's record. Tracker writes are
attributed and permanent: a reverted description still shows as an edit
in the activity log, so our voice stays on their record after the
content is restored. The prohibition cannot be satisfied
retrospectively, which is why the check belongs before the call.

## Worked Instance

2026-08-18: a Director issued rulings requiring edits to three tickets
on the product owner's board, and the liaison seat executed them. The
ownership fact was established and stated plainly beforehand — nobody
lacked it. The generator was scope, not knowledge: "our board" was read
loosely, and a SHARED LINEAR ISSUE-NUMBER SPACE across the two projects
made adjacent tickets feel in-scope when their ownership had never
changed. The lesson: **authority to resolve a dependency is not
authority to edit its record.** Four tickets were reverted and re-read
to confirm; Linear's activity log still shows the edits happened and
cannot be erased. A first record of the correction stated the
prohibition too broadly — as a blanket no-write fence — and had to be
corrected against the owner's narrowing.

## Why a Rule, Not a PDR Clause

Classifier #1 of [`new-rule-vs-pdr-clause`](./new-rule-vs-pdr-clause.md):
an always-applied, agent-general discipline that fires at a structural
moment — the write call to a record. Every seat holding tracker
credentials can make this write, so the boundary must be baseline
session context rather than something one ceremony carries.
`linear-mcp-team-and-project-hygiene` is adjacent but governs where OUR
tickets live, not what we may do to someone else's; no existing PDR
owns the foreign-record boundary.

## Related Surfaces

- [`linear-mcp-team-and-project-hygiene`](./linear-mcp-team-and-project-hygiene.md)
  — placement of our own tickets, including "do not steal tickets that
  actually belong to other teams"; this rule governs writes to records
  that stay theirs.
- [`notion-strategy-page-fence`](./notion-strategy-page-fence.md) — the
  same shape on a Notion surface: a page agents read but never author.
- [`bot-identity-on-third-party-systems`](./bot-identity-on-third-party-systems.md)
  — whose name a permitted write displays.
- [`ticket-management` SKILL](../skills/ticket-management/SKILL-CANONICAL.md)
  — the authoring discipline for the ticket graph the permitted links
  belong to.

## Enforcement

Behavioural at the write call, and observable afterwards: every tracker
keeps an attributed activity log, so a description edit or comment
authored by one of our identities on a foreign ticket is visible to its
owner and to any later audit. Nothing mechanical can gate it — the same
credential makes permitted and forbidden writes possible — so the
field-by-field check before the call is the whole compliance mechanism.
