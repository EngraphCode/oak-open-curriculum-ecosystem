# Records Are Technical, Not Emotional

## Rule

Every durable record an agent writes about the owner or a session's
events — memory files, the napkin, comms events, commit and PR bodies,
thread records — states technical facts and corrections. It never records
the owner's tone, emotional state, or a characterisation of how a
correction was delivered. Describe the mistake and the cure factually
("owner corrected X; cure is Y"), never the owner's affect ("owner was
frustrated"; "owner sharply corrected").

## When an expunge request fires

If the owner asks for something to be removed from the record, the request
is never satisfied by editing the one file the owner happened to be looking
at. **Sweep every surface the content may have reached** — memory files,
napkin, comms events, commit and PR bodies — and confirm the sweep is
complete before telling the owner it is done. A single-file edit is not
"removed from the record" when the same content was mirrored into other
homes (a common shape: a napkin entry mirrored into a comms event for
untracked-tier visibility, or a lesson copied into both a pattern file and
a distilled entry).

## Scope boundary

This rule governs records **of the owner's state**. It does not reach the
agent's own voluntary `.agent/experience/` register — an agent's own felt
texture about a session is explicitly in scope for that register by design
(`experience/README.md`) and is never trimmed under this rule.

## Why this is strict

A durable record is read by future agents and (in this repo, literally) can
answer questions from PR or memory history. A technical record ages well:
the facts and the cure remain useful regardless of who reads them or when.
A record of someone's emotional state does not age well, is not the agent's
place to characterise, and is exactly the kind of content an expunge request
is likely to target — so keeping records technical from the start avoids
needing the sweep in the first place.

## Related

- [`permanent-doc-is-the-consolidation-record`](permanent-doc-is-the-consolidation-record.md)
  — the commit and the permanent home are the record; this rule constrains
  *what kind* of content that record may carry.
- `.agent/experience/README.md` — the voluntary, explicitly-out-of-scope
  register for the agent's own subjective texture.
