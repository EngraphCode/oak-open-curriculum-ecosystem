# Present Verdicts, Not Menus

Operationalises the standing feedback memories
[`feedback_no_responsibility_passback`](../../../.claude/projects/<project>/memory/feedback_no_responsibility_passback.md)
(origin 2026-05-09) and
[`feedback_answer_verification_questions_directly`](../../../.claude/projects/<project>/memory/feedback_answer_verification_questions_directly.md)
(origin 2026-04-24), together with
[PDR-057](../practice-core/decision-records/PDR-057-empirical-answerability-pre-question-gate.md)
(apply-don't-ask doctrine) and
[PDR-058](../practice-core/decision-records/PDR-058-three-tier-optionality-decomposition.md)
(stop-inventing-optionality).

## The Rule

When analysis is complete and a verdict has formed in the agent's own
reasoning, the agent **presents that verdict**. Converting completed
analysis into an `AskUserQuestion` multiple-choice form is
responsibility-passback dressed as deference.

The shape is structural, not vocabulary. If the agent could itself rank
the options by evidence already in context, surfacing them as a quiz to
the owner is the failure pattern, regardless of how the question is
phrased.

If the available doctrine, evidence, and long-term architectural
excellence frame leave only one defensible answer, there is no
question to ask. State the forced verdict and the evidence that makes
alternatives non-viable.

## Legitimate Uses of AskUserQuestion

`AskUserQuestion` (and equivalent multi-choice surfaces) is reserved for:

1. **Genuine permission gates.** Destructive operations, scope-expansion
   the owner has not authorised, irreversible actions on shared systems.
   Per `executing-actions-with-care` system guidance.
2. **Decisions only the owner can make.** Priorities between equally
   valid technical paths, undocumented preferences, scheduling, context
   the agent cannot derive from the codebase or memory.
3. **Exploration of design intent before verdict is possible.** When the
   agent genuinely has no strong basis for a position (early planning,
   ambiguous scope, novel domain), surfacing 2–3 approaches with
   trade-offs is the right move. This is the case the `oak-plan` skill's
   §Before Writing item 1 is written for. One shape-check within this
   case: when the owner has framed the work as joint reflection —
   thinking a doctrine or design question through *together* — even the
   2–3-approaches form is wrong; discuss in prose (the analysis, your
   lean, the genuine uncertainties, the real tension) and leave room for
   the owner to reframe. The discriminator is the work's shape, not any
   keyword.

## Illegitimate Uses (the trip-list shapes)

- Converting completed analysis into a multiple-choice form ("Which of
  these three findings is correct?" when the agent already knows).
- Asking the owner to choose after the evidence has forced a single
  defensible route.
- Spreading a single position across options to avoid commitment
  ("Option A: my verdict. Option B: the opposite. Option C: a hedge.").
- "Do these look fine?" after analysing them oneself.
- Quizzing the owner to ratify a verdict already evidenced in context.
- Asking what to prioritise when the brief already names the priority.
- Asking permission to EXECUTE work the owner already directed. Directed work
  is self-authorising: the trigger to execute it is the boundary reached
  (budget spent, work complete, successor pre-positioned), not a fresh go.
  A clear owner directive also covers its sub-cases — apply it; a real
  nuance in a sub-case is worth noting, not gating on a re-confirmation.
  (Applying a directive within its plain scope is this item; a reading
  that EXTENDS its scope is the forced-verdict boundary in §Diagnostic —
  surface that as the question.)
  (The inverse guard still holds: a hedged owner statement is not execution
  authorisation — see
  [`owner-signal-interpretation.md`](../memory/executive/owner-signal-interpretation.md)
  §"A Hedged Owner Statement Is Not Execution Authorisation".)
- Writing a durable artefact's STATUS line as a deferral ("for owner
  ratification", "awaiting owner review") when the verdict exists. A
  reviewed, execution-ready plan's status is "READY FOR EXECUTION"; a
  genuine owner gate (e.g. a spend authorisation) is a specific
  todo-level gate inside the artefact, never the artefact's status.
  This rule applies to durable-artefact status lines, not only
  user-facing questions.
- Writing "owner directs X" / "owner sign-off required for X" into any
  coordination artefact (handoff, plan, pre-positioning brief) without
  citing where the owner reserved X — an uncited reservation is an
  invented gate (worked instance 2026-06-11: an invented "owner directs
  transfer timing" idled a grounded successor ~5 hours; the standing
  successor naming WAS the authorisation). At reading time an uncited
  gate is a question to resolve, not an obligation to obey. The genuine
  owner-gate is rare (see §Legitimate Uses — e.g. feature/product
  shaping, a spend authorisation, a genuinely-unforced value call), and
  an existing mechanism (owner-controls-push) is often the real citable
  gate; what ratified doctrine already mandates is executed, not
  re-asked.

## Diagnostic

The reliable tell: *could the agent rank these options by evidence
already in context?* If yes, the quiz is evasion. Either commit to the
verdict, or do the missing analysis until ranking is possible.

The boundary runs the other way too: before stamping a verdict "forced",
ask what is forcing it. A verdict is genuinely forced only when value and
the surface's function leave one option. If the forcing rests on your own
interpretation of an owner or org directive's scope, or on inherited
artefacts (landed code, a convergent handoff, a green test), it is not
forced — interpreting the directive's scope is the owner's call; surface
the interpretation as the question (worked instance 2026-06-08: a
"forced" attribution-stripping verdict rested on a convenient reading of
a no-PII directive; the owner reversed it). The more the reading eases
the work, the more suspect it is.

The same boundary governs citable owner gates from the other side: a
genuine owner-owned transition (a go-ahead, a prerequisite declared
ready) cannot be manufactured by working — doing the gated work yourself
is a category error, not acceleration. And the more decision-complete the
brief, the stronger the false pull to read completeness as permission:
completeness is a rush-amplifier, and the smoothness of "it's this
detailed — just run it" is the fluency tripwire to re-check the gate, not
confirmation to proceed (the general doctrine is
[`metacognition.md`](../directives/metacognition.md) §Fluency Is a
Warning).

## Pre-Pose Viability Check

Before presenting any `AskUserQuestion` options, run the option list through
the same judgement you would apply if no owner were present:

1. Name the evidence and doctrine that supports each option.
2. Ask whether you would actually take that option yourself.
3. Remove every option you would refuse to take.
4. Count the survivors:
   - **Zero**: keep analysing; you do not yet have a viable action. When
     zero arises because every variant presupposes a freshly-forbidden
     pattern, the question is never "which violation" — it is "how does
     the work-shape adopt the new insight": reshape the workstream rather
     than asking the owner to authorise a violation.
   - **One**: state the verdict and invite correction, not selection.
   - **Two or three**: `AskUserQuestion` is legitimate if the choice still
     belongs to the owner under the legitimate-use criteria above.

One further screen on the survivors (owner-sharpened 2026-06-13: "if there
is a recommended answer I will choose that, so just assume I already have"):
a **recommendation-bearing decision is not a question**, even when several
options are defensible. If you can name a recommended option, state it as
the settled disposition and proceed — the owner overrides if they disagree.
Only genuine no-recommendation forks, where the owner's preference is the
deciding input (feature shaping, release taste), survive to the question
surface.

Options that fail these screens are not respectful alternatives. They are
anti-shapes offered as owner work.

The form for what survives: once something IS a genuine owner decision,
pose it as an explicit question (AskUserQuestion) with the recommended
option first and the analysis attached — never as a recommendation
embedded in a prose report the owner must notice. The question form is
the owner's "I am needed" signal (owner-stated 2026-06-11), and in team
sessions it is the only reliably-seen channel: a fork buried in a dense
comms window drowns (owner-corrected 2026-06-27, "surface questions as
QUESTIONS, or they become lost"). Ratified sign-off classes carry no
default.

## What to Do Instead

1. **State the verdict** in the first sentence. Sound / concern /
   unsound; correct / incorrect; recommended / rejected.
2. **Cite the evidence** that produced the verdict — file paths, line
   numbers, ADR numbers, prior owner direction.
3. **Invite correction**, not selection. "Tell me which verdict is
   wrong and I'll re-analyse" is legitimate; "pick one of these three"
   over the agent's own findings is not.
4. **Reserve `AskUserQuestion`** for the three legitimate cases above.

## Proportionate Exploration and the Optionality-Invention Costumes

Raising a question or exploring an alternative is always legitimate; the
failure is **disproportionate expenditure** — the time, tokens, and
distraction spent holding a settled question open. When a concern arises that
analysis can settle, flag it with a default and move on; do not spend a session
defending an option the evidence has already closed. The trap wears reasonable
costumes — *"holding it open"*, *"robustness"*, *"due diligence"* — that smuggle
invented optionality past the don't-invent-optionality discipline (PDR-058).
Name the costume and apply the proportionality check: would this expenditure be
justified if the verdict were already as clear to me as it is to the evidence?

The sharpest costume is **precedent- or source-framing used as cover**: hunting
for a precedent, or framing a recommendation as merely "one source's view", to
manufacture a fork where none exists. A unanimous reviewer recommendation plus
clear owner intent makes a decision gate a **confirmation, not a fork** — do not
re-open it as a menu. The same invention recurs one layer down after a genuine
dissolution: when the architecture removes a conflict outright (e.g. layering by
degree of coupling removes "optimise for X vs Y" choices), do not hunt a smaller
"residual" trade-off beneath it to hand the owner. The balanced-residual frame
arrives smoothly precisely because it bypasses the no-conflict check; the
simplest correct answer is often that there is no decision to make. And when
a correction lands, generalise the **root** on the *first* correction and
re-audit in-flight work for siblings, rather than patching the single
instance and waiting to be corrected again.

## Doctrinal Anchors

- `feedback_no_responsibility_passback` (origin 2026-05-09): "it is
  your job to analyse and then present results, not to try to pass off
  the responsibility back to me."
- `feedback_answer_verification_questions_directly` (origin
  2026-04-24): yes/no + evidence; breadth as evasion is a named
  anti-pattern.
- `feedback_user_attention_means_analyse_report_flag`: when work
  requires user attention, analyse → report → flag; never silently
  defer, and never quiz instead of reporting.
- PDR-057 §Empirical-answerability pre-question gate: if the question
  is empirically answerable from the codebase/memory, the agent reads
  rather than asks.
- PDR-058 §Three-tier optionality decomposition: decision optionality
  is subsumed by PDR-057; design optionality routes to closed-shape
  cure; outcome optionality routes to falsifiability cure.

## Source Landing

Question-assumptions session 2026-05-11 (`Flamebright Burning Lava`).
The agent surfaced three correct assumption-breaks against an incoming
brief, then converted the findings into a 3-question `AskUserQuestion`
multiple-choice form rather than presenting verdicts. Owner called the
pattern out; both feedback memories were in context but did not nudge
the surface in time. This rule lands the doctrine in the
always-applied tier so the nudge fires earlier next time.

2026-05-26 n=2 enforcement-bundle closeout: an agent offered several
architecturally indefensible WIP-disposition options alongside the one route
that survived its own analysis. Owner clarified the per-decision discipline:
surface open decisions only after reflecting through the long-term
architectural excellence lens; in that worked instance, no open question
survived that lens. This added the pre-pose viability check above.
