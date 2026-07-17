# PR review-corpus analysis — all comments, PRs #389–#394 (2026-07-16)

Author: Vole hunts Perch (36c6ca), owner-directed fresh-eyes pass. Method: full pull of
every review thread, reply, review body, and issue comment (326 threads, 581 thread
comments, 238 reviews, 33 issue comments) via the GitHub GraphQL API (session-scoped
snapshot ~19:55Z; the corpus is fully re-derivable from GitHub — `reviewThreads`,
`reviews`, and `comments` connections on PRs #389–#394); independent analyses by
(a) this seat with full context and (b) a context-blind Opus agent reading only the
corpus; convergences and divergences adjudicated here.

## Measured facts

- **326/326 review threads were opened by `copilot-pull-request-reviewer`.** Every other
  reviewer was dark for the whole window: `claude[bot]` "overage spend limit reached"
  on 5/6 PRs, Cursor Bugbot "usage limit reached" (×8 on #390 alone), Codex "usage
  limits". No human review appears anywhere. #390/#391/#392 merged on agent
  self-attestation plus this single machine reviewer.
- **~66 review bursts across 6 PRs in ~2 days** (minute-bucketed thread-creation
  bursts: #394 19, #392 15, #393 11, #389 9, #390 9, #391 3). The dominant cost driver
  is re-review-on-every-push binding to a pre-push tree — the stale-analysis class —
  not genuine non-convergence.
- **Theme distribution** (multi-label over first comments): validation-at-boundary 68,
  test-adequacy 64, restatement/duplication 41, completeness/coverage-honesty 36,
  stale-doc/tombstone 33, silent-loss 15, chunk-boundary 15.
- **Reply dispositions**: cured-with-citation 164; routed-to-v2 37; refuted-by-design 5;
  stale-analysis 4; Director-cast 3 (rough keyword classification).
- **44/326 threads cite estate rule files by path** (sha-prefix ×23,
  no-conditional-tests ×10, no-machine-local-paths ×4, no-tombstones ×2,
  strict-validation-at-boundary ×1): the reviewer is running OUR doctrine as its
  rubric.

## The headline insight: the corpus is Job-2 evidence

~74 findings (23% of all threads) on the DOC PRs are literally the restatement-audit's
target classes: "stale governance status", "restates live PR/halt/gate values after
declaring volatile values live only in the pointed record", "coverage table contradicts
the worked correction below", "phase-local restatement drops two load-bearing parts",
"stale denominator". Two consequences:

1. **The Job-2 mission is empirically validated**: authored restatement of derivable
   state is the single most frequent disease class in the estate's own review stream.
2. **An organic ground-truth corpus exists**: ~74 reviewer-found, agent-adjudicated,
   disposition-labelled restatement instances across 6 PRs — usable as v2 key-battery /
   gazetteer validation data at zero extraction cost. Proposed for the Director's v2
   fold.

The sharpest single instance (open, #394 thread on
`restatement-remediation.plan.md`): the restatement-remediation plan itself freezes the
corpus at "~295 files" while the same PR measures 319 — the anti-drift tooling's own
plan commits the drift.

## Where the blind read corrected this seat (accepted)

1. **#393 window-membership (round-8, open)** — I had pre-classified it "borderline,
   batch-cure". The blind read ranks it the most security-relevant finding in the
   corpus: unvalidated model output (a hallucinated or prompt-injected `instance.file`)
   enters the join/voting evidence graph; meta-stage byte-verify is only a partial
   backstop. RECLASSIFIED: definite cure in #393's final batched push.
2. **#393 checkpoint cross-field strictness (raised twice, second time "Required")** —
   my "the live path recomputes, so checkpoint laxity is harmless" routing is the
   argument the reviewer keeps refusing, and it defers the only DURABLE enforcement to
   unbuilt v2. The refine is cheap (a disposition row requires ≥2 voterVerdicts for its
   clusterId). RECLASSIFIED: proposed for the final batched push, Director to ratify
   (it amends my prior v2-routing reply).

## Process findings (for the Director / owner)

1. **Single point of review failure.** One machine reviewer, no redundancy, no human —
   a spend-limit change or Copilot regression silently removes ALL independent review.
2. **Thread resolution rests on author assertion with no re-verification step.** Worked
   instance (#389): a thread marked "Fixed in 2587a8543" regressed and the identical
   defect is re-raised OPEN two rounds later. The #393 lane's pre-commit adversarial
   panels are a partial cure (each caught real defects pre-push); nothing equivalent
   guards "cured on <sha>" replies estate-wide.
3. **Stale-tree re-review economics.** A large fraction of rounds re-flag already-cured
   code because reviews bind pre-push SHAs. #392's own subject — the convergence
   machinery — took 13+ rounds to land for this reason. Candidate cure: quiet-window
   discipline (no pushes while a round is in flight) is already emerging as practice;
   codify it.
4. **Recurrence-as-escalation works but the threshold is improvised.** "Three raises ⇒
   design cast" was invented mid-PR on #393 and then applied at four raises. Codify N.
5. **The v2 spec is a debt ledger, not a resolution.** ≥8 #393 threads close by
   pointing at it; that is sound ONLY while the Job-2 halt holds (falsifier recorded in
   the chunking cast). The blind read flags #394's "sealed record" shield keeping a
   self-contradicting spec canonical (§1 text vs FOLD precedence) — Director's call,
   surfaced not judged.
6. **#389's 18 open threads are one mechanical class ×9** (conditional-assertion test
   guards vs `no-conditional-tests`) plus a glob-normalisation family and IO fail-loud
   boundary items — highly batchable ahead of its merge turn.

## Self-audit (metacognition)

The estate errs in BOTH directions around the same reviewer: over-curing (164 cures vs
5 refutations — style-level findings routinely earn pushes, each push minting a fresh
round) AND occasionally under-curing (real findings closed behind routing language —
the two reclassified items above were mine). The reliable discriminator in every case
where we were later proven right or wrong: whether a VERIFIED CONCRETE FAILURE SCENARIO
existed. Dispositions grounded in one survived; dispositions grounded in "the live path
compensates" or "style" did not. The hold-state bar ("threatens Job 2 output
integrity") is the right shape; this pass corrected its two misapplications.
