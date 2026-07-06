# Owner-Signal Interpretation

Interpretation heuristics for reading owner direction — the channel
semantics between owner and agent. Load when weighing whether an owner
turn is a grant, a gate, a supersession, or thinking aloud. The
load-bearing defaults live in
[`user-collaboration.md`](../../directives/user-collaboration.md)
§Working Model; this surface carries the depth — the tells, the modes,
and the worked corrections behind them.

## A Hedged Owner Statement Is Not Execution Authorisation

A tentative or first-person phrasing — "I think 1 and 3 this session",
"start with a discovery run", "it will do for now" — is the owner thinking
aloud or agreeing a direction, not issuing an imperative. Reading a hedge as
a grant over-scopes in-session work and can block peers; agreeing a *mode*
is a design decision, not an execution grant, and any standing constraint
(read-only posture, a gate, a claim boundary) still gates the real action.
When the hedge matters, confirm the grant before acting on it — the
smoothness of the "they told me to" frame is itself the fluency tell
([`metacognition.md`](../../directives/metacognition.md) §Fluency Is a
Warning).

## A Demonstrated Action Is a Directive

The inverse also holds. When the owner has acted in their own edits —
removed a masking override, deleted a file, chosen a shape — the
demonstration carries their intent as authoritatively as a stated
instruction; do not reverse it through lens-resolution or "proportionate
scope" reasoning, and weight an implementer's proposal that aligns with the
demonstrated principle over a conservative alternative that undoes it.

## Direction Is a Stream — Supersession, Extension, Re-Deliberation

Owner direction is a stream where the latest turn is authoritative about
its own scope, never a snapshot to freeze into a standing gate. Three
worked modes:

- **An earlier "wait" does not survive a later "drive."** One session
  (2026-06-14) froze an early "stick to prep / say go" into a standing
  permission gate and kept applying it after a retirement, a partner-add,
  and an explicit "you're driving" had each dissolved it — the
  team-visibility surface went dark while the agent idled. The tell is
  unmistakable: waiting for permission to do the thing you were just put
  in charge of IS the error. Re-read the latest owner turn before invoking
  an earlier gate; as the named driver, gate only what is genuinely
  owner-gated (an atomic untrack commit, a merge) and drive everything
  else.
- **The stream also supersedes your own re-deliberation.** The inverse of
  freezing an old direction is re-opening a *just-given* one: after a clear
  "drive it" / "commit them all", re-weighing the decision ("but should I
  really…") burns context and reads as indecision (owner correction
  2026-06-27, "let's get back to careful, direct engineering and merging").
  Once a directive is given, execute it with care — run the gate, read
  failures, fix — and reserve questions for genuine owner decisions. A
  decided directive arriving back as a question means the answer is
  already given.
- **Supersession is not the only mode — a turn can EXTEND.** One session
  (2026-06-28) inferred a "shallow-scan next" instruction *superseded* the
  in-flight brief; the owner corrected — no supersession, it ADDED a
  downstream goal. Before reshaping work around a new turn, distinguish
  supersession (replaces) from sequencing/addition (adds a later goal,
  leaving the current one live). Reading every new turn as a replacement
  wrongly discards a still-live earlier directive.

## Direction Scope Is Session-Bounded by Default

A direction the owner gives within a session applies to that session only;
it does not become standing unless the owner says so ("from now on",
"always", "this is a standing direction"). The founding miss: one session's
"I want to deal with fitness in a separate session" was extended into a
standing deferral across multiple later consolidation passes — the owner
corrected that the direction was scoped to its one session. Apply it as:

- When a prior session's handoff or continuity entry cites a direction, do
  not assume it carries forward — check whether the owner has restated it,
  or pose the question.
- A direction recurring across sessions in identical form is evidence of a
  *de facto* standing rule worth surfacing for explicit graduation, never a
  licence to assume it on your own authority.
- This applies to all owner-directed deferrals — fitness work, Practice
  Core edits, plan promotions, doctrine graduations. Each session decides
  afresh unless the owner says otherwise.
- When a direction's scope is unclear, the default move is: analyse the
  work the direction was avoiding, report findings, flag for feedback.

Scope (this section) and supersession (the stream above) are orthogonal
axes: one governs whether a direction is still live across sessions, the
other governs which turn wins within the stream.
