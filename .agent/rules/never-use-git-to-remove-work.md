# Never Use Git to Remove Work

**TRIGGER — the rule fires on TREE STATE plus COMMAND, never on intent:**
if the working tree holds uncommitted work, `git stash`, `git checkout
--`/`git restore`, and `git reset` are risk-class NO regardless of what you
are using them for — including "just a measurement", "making the tree
temporarily clean", or any framing of the operation as a read. Worked
instance (2026-07-26): a seat stashed an hour of uncommitted cures to
observe a baseline warning count that one grep of an existing log would
have answered; the rule never fired because the seat had filed it under
"destructive operations" and framed the stash as measurement. When a clean
tree is genuinely required: commit first, or run the comparison in a
separate clean checkout — the tree is never the instrument.

We never use git to remove work. We move forward via filesystem changes
— Edit, Write, and explicit `rm` of files. Git is for committed history;
working-tree edits live in the working tree until explicitly staged and
committed.

## The Rule

When the impulse arises to "undo what I just did," "revert that change,"
"go back to before I touched this," "restore the previous state," or
"throw out my draft," **do not reach for git**. Reach for Edit, Write,
or Bash `rm`.

Specifically, the following commands are forbidden in any context where
the working tree contains unstaged or in-flight edits — yours OR a peer
agent's:

```text
git checkout HEAD -- <path>
git checkout -- <path>
git checkout -- .
git restore <path>
git restore --worktree <path>
git restore --staged <path>
git stash drop
git stash clear
```

These commands overwrite the working tree silently. They cannot be
undone. `git fsck --lost-found` cannot recover working-tree-only edits
because they were never written to the object database.

The repo enforces this via the PreToolUse Bash blocked-patterns hook
(`.agent/hooks/policy.json`); attempts to run any of the above are
halted before execution.

## Why

Three reasons, in increasing order of consequence:

1. **You lose your own draft work.** A working-tree edit is the
   crystallised form of a chain of reasoning. The chain is in your
   conversation memory; the crystal is on disk. `git checkout` shatters
   the crystal but leaves the conversation. The conversation eventually
   ends; the crystal was the durable artefact.

2. **You lose peer-agent work.** Parallel sessions touch shared files
   (thread records, napkin, plans, comms log render). A `git checkout`
   on a "modified" file does not distinguish your edits from your peer's
   edits. Both are wiped. `git fsck` cannot recover them. There is no
   audit trail of what you destroyed.

3. **You lose the realisation that drove the deletion.** When the owner
   says "delete the needless complexity," the realisation that the
   complexity is needless is the durable artefact — the code is just the
   instrument. Forward removal via Edit/Write captures both the action
   and the reasoning. Rollback via git captures neither: the code is
   gone, and the realisation is fragile (it lives only in the conversation
   that prompted the rollback). The next agent re-creates the same
   needless complexity because the realisation never landed in the
   napkin or in a rule.

## What to Do Instead

| Impulse | Wrong move | Right move |
|---|---|---|
| "Throw out my draft cycle-1 code" | `git checkout HEAD -- <files>` | `rm <new files>`, then `Edit` the modified files to remove the changes you no longer want, leaving the *kept* parts |
| "Revert this file to before I touched it" | `git checkout HEAD -- <file>` | `Read` the HEAD version (`git show HEAD:<file>` to a buffer; do not run `git checkout`); `Edit` your version line-by-line to match what you want to keep |
| "Delete the needless complexity" | `git checkout HEAD -- .` | `rm` the files that should not exist; `Edit` the files that should exist but in simpler form; capture the realisation in the napkin |
| "I went down a wrong path; reset" | `git reset --hard HEAD` | `Edit` the files back toward where you want them; this is slower and that is the point — slow is the rate at which the realisation travels with the action |

## A Block Is a Question, Never a Detour

When the hook blocks — or would block — one of these commands, do NOT
achieve the blocked effect by equivalent means — wholesale forward-writing
of `git show HEAD:<file>` content, a sibling command, manual file surgery —
even when a prior general owner direction appears to authorise the outcome.
Wholesale restoration of a working tree's prior state is never a self-serve
move, whether or not the blocked command was actually attempted. The block's
purpose is to force the stop-and-surface moment; a workaround deletes that
moment and with it the owner's chance to catch a wrong premise (worked
instance 2026-06-12: a blocked `git restore` on generated drift was
recreated by forward-writing the HEAD content; owner: "never do that
without my express permission"). General intent is not permission for a
specific blocked operation: stop, surface the block and the intended
effect, and proceed only on express per-instance instruction (the owner
may run the command themselves via `!`). The table's "read HEAD, then
Edit what you want to keep" row is selective forward judgment, not this —
the line is wholesale restoration of the blocked effect.

## Read the Target Immediately Before Any Overwrite

Even on the permitted forward path (Edit/Write toward committed content),
**read the target's live diff at the moment of acting** — overwriting
destroys exactly the evidence needed to answer "were my changes the only
changes in that file?" afterwards (owner catch 2026-07-25: a forward
overwrite of two shared-checkout files was answerable only from a stale
`git status` that happened to survive in context; the safe-looking method
had made the safety question archaeological). Ten seconds of `git diff --
<file>` before the write makes the question answerable instead; certainty
is the thing that removes the check, so the check is unconditional.

## A Safety Proof Never Licenses the Class

No local proof of safety — a byte-identical duplicate elsewhere, a clean
`diff`, a verified ancestor relationship — licenses a risk-of-loss
operation (`stash`, `checkout`, `reset`, or kin). The owner ruled this
against a PROVEN-duplicate `git stash push` proposal (2026-07-15):
*"no operations that might risk a loss of work; relaxing that discipline
is what caused these problems in the first place."* The doctrine point is
that the discipline's value IS its absoluteness: every relaxation
argument arrives with a locally-sound proof, and the class of losses this
rule prevents was caused by exactly such proofs being wrong in ways their
authors could not see (a peer's unseen edit, a stale comparison, a moving
tree). Leave-and-surface, or an owner-run command, are the only paths —
never a self-served exception. This coheres with the no-escape-hatches
principle (`principles.md` §First Principle): the impulse to construct a
sanctioned bypass is itself the signal to examine.

## Exceptions

There are none for working-tree edits. Once a change is committed, the
normal git tools (revert, reset on a private branch you own) become
available as forward-going operations because they create new commits
that record the change. Those are not in scope of this rule.

## Capture, Always

When you remove work — yours or anyone's — the realisation that drove
the removal must land somewhere durable. The minimum is one entry in
`.agent/memory/active/napkin.md` naming what was removed and why, in
the same session as the removal. Without that entry the next agent will
re-create the work you removed, because the artefact gravity of plans,
prior commits, and ADR text will pull them back toward it.

## Source Incident

The rule was authored 2026-05-03 after Salty Navigating Jetty (`900b17`)
ran `git checkout HEAD -- <files>` to revert in-flight cycle-1 code,
silently wiping (a) Salty's own napkin and thread-record edits and (b)
possibly Tidal Flowing Reef's (`f879e0`) parallel-session edits to the
same files. Owner correction: *"we don't throw away work, we remove it,
we go forward not backwards, change the files, don't use git."*

The destructive command was permitted by the policy because the
blocked-patterns list named history-rewriting commands (`reset --hard`,
`rebase -i`, `push --force`, `clean -fd`) but not working-tree-overwrite
commands. The list is now extended; the rule is explicit; the failure
is named in the napkin.
