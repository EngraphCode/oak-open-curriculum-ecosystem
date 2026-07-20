# Fresh-Checkout Experience — Concept Exploration

**Date:** 2026-07-20
**Explorers:** Deimos tracks Perigee (claude / Fable 5 / 73e4ab) and Vanilla binds
Bough (claude / Fable 5 / f3599e) — n=2 owner-directed session.
**Workflow:** `oak-concept-exploration` (four alternating metacognition/reason
movements, then synthesis with warranted, falsifiable proposals).
**Provenance:** first-hand, single-session live-fire on a fresh clone and a fresh
git worktree; every observation was lived by at least one explorer, several by
both from opposite sides.

## Movement 1 — Raw observations

1. `comms send` died with a bare `ENOENT` on the unseeded `active-claims.json` at
   the exact team-bootstrap moment (first contact with the substrate).
2. `claims close` died identically on the unseeded `closed-claims.archive.json`,
   minutes after the cure for (1) was authored; the cure's prescribed seed
   unblocked it verbatim — the same failure class surfaced twice in one session,
   and the error-as-instruction shape was proven at the failure surface.
3. A worktree-launched session posted comms into its own worktree's local
   collaboration dir — a decoy invisible to the peer. Lived from both sides: the
   poster saw success, the peer saw silence. Rendezvous succeeded only after the
   poster relocated to the canonical coordination home.
4. `comms-seen/` is not auto-created and its absence fails silently (the knowledge
   sits in a rule doc, not at the failure surface).
5. CLI flag asymmetries: `comms send` defaults `--comms-dir`, `comms inbox`
   requires it; `claims open` defaults `--now`, `claims close` requires it.
6. `PRACTICE_AGENT_SESSION_ID_CLAUDE` was present in the platform env file but
   absent from the Bash shell, so identity preflight needed a manual `--seed`.
7. An imported record's nested `pnpm-workspace.yaml` made `pnpm exec` from inside
   that subtree resolve a phantom nested workspace and fail (import-lane specific).
8. Worked without friction: `agent-tools` dist present on a fresh clone (CLI usable
   with no build step); identity preflight; `assert-watcher-live` (the F-95
   mechanical gate); the full pre-commit/pre-push hook chain; and — corroborated by
   **both** agents from **both** sides of a branch switch — the untracked substrate
   (comms events, seen-files, watcher heartbeat, claims registry) **persisting
   across a primary-checkout branch move**, untouched.

**Inherited assumption exposed:** "the substrate is always already seeded." It
holds only in long-lived checkouts. ADR-199's untrack-by-design decision (correct
for provenance) opened a day-0 gap that no owned step ever covered — the
fresh-checkout experience had no owner.

## Movement 2 — The problem space

**Kind:** a lifecycle-coverage gap, not a tooling bug. The collaboration substrate
carries an implicit precondition — seeded instance-tier state in the *canonical*
coordination home — that no owned step establishes on any of the three fresh-start
paths: fresh clone, new worktree, and the one-time post-ADR-199 transition.

**Framing insight — one property, two faces.** Observation 8 (state survives a
branch switch) and observation 3 (worktree decoy) are the *same* design: instance-
tier, untracked, home-derived state. The survival property that makes coordination
robust across branch moves is inseparable from the homing hazard that makes a
worktree's local dir a silent decoy. This is not two problems; it is one property
seen from two sides, and it constrains the cure: the fix must preserve home-derived
persistence while removing cwd-ambiguity — which excludes any branch- or
tracked-scoped remedy and points precisely at canonical-home derivation.

**Who it harms:** every agent's first session on a new machine or worktree, at
bootstrap — when the agent holds the least context; and multi-agent rendezvous,
where the failure is *silent*, which costs more than any loud failure.

**Observed failure taxonomy (cost ascending):** loud-but-cryptic (obs 1, 2) <
doc-known-but-not-at-hand (obs 4) < silent-wrong (obs 3). Flag-default asymmetry
(obs 5) sits below all three — it is a papercut, not a failure; nothing errors.

**Constraints:** no silent auto-creation *at a cwd-derived location* (it converts
loud failures into decoy states — the observed worst case); strict validation at
the boundary; portability across platforms and across Practice estates.

**Success looks like:** an agent on a day-0 checkout reaches registered + watching
+ broadcasting state without reading source code, and *cannot* be silently
invisible to peers.

## Movement 3 — Re-opening the solution space

The fluent first answers were "auto-seed on first use" and "add an init command."
Both fail interrogation. An init command only helps if discovered, and *discovery
at the failure moment* is the actual gap — the estate already documented most of
these classes in rules and the docs did not fire (the estate's own
`passive-guidance-loses-to-artefact-gravity` pattern, re-confirmed live).

"Auto-seed" needs a sharper cut than the draft's blanket rejection. Seed-at-a-**cwd-
derived** location recreates the decoy class (a wrong path silently becomes a
live-looking empty substrate — obs 3's mechanism generalised). Seeding at an
install-time-**resolved root** is safe only under one further check: root
resolution alone does NOT verify the location, because the bootstrap
(`root package.json` wires `postinstall` → `tsx
agent-tools/src/bootstrap/bootstrap.ts`) runs on every `pnpm install` — a *new
worktree's* install included, where `resolveRepoRoot` yields the worktree's own
root, not the canonical home. The verified form is *resolved root that IS the
canonical primary home* (proposal 6's interlock). With that check, the day-0
clone-seed gap has a natural, already-wired owner the first pass left unnamed.

What demonstrably worked was **the cure at the failure surface** (obs 2 — proven by
test and by live fire) and the estate's existing **mechanical gates** (F-95
`assert-watcher-live` outperformed every doc). The surviving solution space is
therefore *active surfaces* — error messages that carry their own fix, mechanical
checks, self-suppressing session-open advisories — with docs as the secondary
layer and cwd-derived silent magic excluded.

The reflection also relocated the decoy-dir "new idea" into existing work:
`coordination-home.ts` and `resolveCoordinationHome` **already exist** (with
integration tests), and
`.agent/plans/agent-tooling/current/coordination-home-cli-path-defaulting.plan.md`
already owns CLI-side home derivation. Today's cross-agent rendezvous failure is
corroborating evidence for that plan's priority — and evidence that the cure is a
*wiring* slice (route the read-path CLIs through the existing primitive), not a new
build.

## Movement 4 — Synthesis and proposals

The fresh-checkout experience is a **day-0 lifecycle surface that needs named owners
and an active-surface discipline.** The ownership splits cleanly three ways:
**bootstrap owns clone-seed** (verified root, install time); **home-derivation owns
worktree-homing** (the silent-wrong tier); **actionable errors are the safety net**
for the paths the first two cannot reach. No surface may silently manufacture
substrate at an unverified, cwd-derived location.

Each proposal carries a warrant and a falsifier.

1. **Realised in PR #436 (open at report time; review rounds ongoing; merge
   owner-gated):** seed-bearing errors for the registry + archive readers on both
   the plain-read and claims-lifecycle paths, with a verify-then-seed instruction
   (an unconditional "seed it" at a mistyped path would itself create the decoy);
   exactly ONE enriched failure case — ENOENT — while every other failure
   propagates as its original self, unwrapped (owner ruling, 2026-07-20: never
   replace information with a summary); an injectable read seam so the contract
   is proven without real IO; and a race-safe, home-rooted start-right seeding
   step. *Warrant:* two live-fires in one session; the tests prove the embedded
   seed is sufficient and that non-ENOENT failures surface unmodified.
   *Falsifier:* a future day-0 session still unable to self-serve past first
   contact on these surfaces.
2. **Follow-on:** the same actionable-error treatment for the remaining
   first-contact failure surfaces — `comms-seen/` parent creation (obs 4) and any
   other instance-tier reader that ENOENTs on a fresh checkout. *Warrant:* same
   failure class, same-session evidence. *Falsifier:* an audit showing those paths
   already fail actionably.
2b. **DX polish (lower severity):** flag-default consistency (obs 5) — align the
   `--comms-dir` / `--now` defaults across `send`/`inbox` and `open`/`close`.
   *Warrant:* avoidable papercut. *Falsifier:* a deliberate reason the defaults must
   differ. (Kept distinct from proposal 2: obs 5 does not fail, so the
   actionable-error framing and its falsifier do not apply.)
3. **Stop defeating the existing home derivation.** The wiring largely exists:
   `comms send` already defaults `--comms-dir` through `resolveCoordinationHome`
   (`cli-comms-send.ts`), and the claims commands default their state paths the
   same way. The observed decoys arose through the defeat paths: (a) doctrine
   text — the canonical watcher/inbox invocations instruct agents to pass
   explicit *relative* `--comms-dir`, overriding the safe default (both
   explorers did exactly this all session); (b) entry points that *require* an
   explicit dir (`comms inbox`, `comms watch`) instead of defaulting; (c) no
   verification when an explicit path is given — a wrong explicit path is
   accepted silently. The slice: sweep the doctrine's canonical invocations to
   drop the explicit flags, align `inbox`/`watch` defaulting with `send`, and
   verify-or-refuse explicit overrides that do not resolve to the canonical
   home. *Warrant:* silent invisibility was the session's costliest failure,
   lived by both agents — and every observed instance came through a defeat
   path, not through the default. *Falsifier:* a decoy event produced through
   the DEFAULT path (which would indicate the primitive itself mis-resolves,
   a different defect).
4. **Self-suppressing session-open substrate advisory:** an explicitly-run,
   `collaboration-state check`-shaped step that reports substrate state — and fires
   *only* when the substrate is unseeded OR the cwd's collaboration dir is not the
   derived canonical home. *Warrant:* the F-95 mechanical-gate pattern demonstrably
   fires where docs do not; self-suppression keeps its cost contingent on catching
   something (per `collaboration-is-value-contingent`) and makes it the surface that
   would have caught obs 3 at session-open rather than at silent rendezvous failure.
   *Falsifier:* the advisory fires on a checkout that was not actually at risk (a
   false positive — e.g. a legitimately-seeded non-default home it fails to
   recognise), adding friction without averting a real failure; OR it fires
   correctly yet the agent proceeds to the silent failure anyway (it did not change
   the outcome). Either shows the self-suppressing fire-condition is mis-drawn. (A
   count of quiet healthy sessions is not a valid falsifier for this form: once
   self-suppression holds, a healthy checkout produces no firing at all, so
   "fires and catches nothing on healthy checkouts" cannot occur by
   construction.)
5. **Route, do not solve, the adjacent finds:** env-var shell propagation (obs 6)
   to the agent-identity tooling docs/hook; the nested-workspace phantom (obs 7) to
   the import record's own README. *Warrant:* both were lived this session, but
   neither shares the substrate's seeding/homing mechanism — obs 6 is
   identity-tooling environment propagation, obs 7 is the imported record's
   packaging — and routing them to their owning surfaces preserves this
   exploration's mechanism boundary instead of widening it. *Falsifier:* either
   find recurring through a seeding/homing path (which would pull it back into
   scope as a substrate concern).
6. **Bootstrap seeds the canonical home at install, interlocked with
   home-derivation** (new): extend the existing `postinstall` bootstrap to seed the
   substrate's registry/archive — but *only when the resolved root IS the canonical
   primary home*, using proposal 3's `resolveCoordinationHome` primitive. This
   interlock is load-bearing, not decoration: `postinstall` also runs on a *new
   worktree's* install, where a naive "seed my own root" would plant a
   worktree-local decoy at install time — reintroducing the silent-wrong failure
   the exploration exists to close. Seed-if-primary makes bootstrap deterministic
   for the fresh-clone path while deferring worktrees to home-derivation; so
   proposal 6 *depends on* proposal 3. *Warrant:* the clone path has an
   already-wired install-time owner — the same bootstrap that makes `agent-tools`
   dist present on a fresh clone (obs 8), so extending it to seed is a natural
   increment at a verified location. *Falsifier:* a fresh clone whose `postinstall`
   ran yet whose canonical substrate is still unseeded ⇒ bootstrap is not the owner
   or the interlock mis-resolved the home.

**Unresolved evidence that could change the synthesis:** whether sibling Practice
estates share the day-0 gap (a portability question for the inter-Practice
lineage); a complete audit of CLI entry points that read instance-tier state — the
set treated here is the observed set, not a proven-complete one; and an observed
silent comms-*broadcast* failure (a broadcast that surfaced no error yet did not
land for the peer) whose mechanism was not isolated this session — if the write
path can fail silently, the active-surface discipline must extend to it, not only
to the read/seed paths.

---

*Method note: this report is the four-movement `oak-concept-exploration` output.
Movement 1 was gathered in parallel by both explorers; Deimos authored the first
synthesis; Vanilla ran the adversarial challenge pass — five sharpenings: the
one-property-two-faces framing, the install-time bootstrap owner with its
seed-if-primary interlock, the existing-primitive rescope of proposal 3, the
self-suppression scoping of proposal 4, and the papercut/failure severity
split — each concurred by Deimos and verified first-hand; Deimos ran the
reciprocal review of the fold. Vanilla held the pen for the landing; Deimos
carried the post-handoff review rounds. Proposal 1 is realised in PR #436 (open
at report time); proposals 2–6 are candidates, not accepted architecture.*
