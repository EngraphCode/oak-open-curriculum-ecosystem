---
fitness_line_target: 200
fitness_line_limit: 320
fitness_char_limit: 20000
fitness_line_length: 115
fitness_line_length_rationale: >-
  Raised 100 → 115 (owner-authorised 2026-06-29) for this append-heavy
  narrative/continuity surface. Marginal prose-width drift on appended prose is
  chronic-cosmetic (99% of breaches were ≤120; median 104) and manual reflow is a
  transient non-cure on a file that grows by append each session; 115 clears the
  noise while still flagging genuine over-runs.
fitness_content_role: reference
merge_class: index-narrative
---

# Director Handoff — Central Pick-Up Point

The single in-repo file an agent reads to **become the Director** of a
multi-session, multi-agent effort, and the one place the current Director
**hands off** from. It has two layers held apart by their change-rate:

- a durable **Director Brief** (sections below up to `CURRENT HANDOFF STATE`) —
  plan-agnostic, the operational instance of the role doctrine: how to take the
  seat, the readiness gate, the standing lessons, the routing contract. It does
  not change between handoffs.
- a volatile **`CURRENT HANDOFF STATE`** section that the sitting Director
  refreshes at every handoff — who is live, what is open, what is owner-gated.

The role doctrine itself is
[PDR-117](../../practice-core/decision-records/PDR-117-director-and-implementer-roles.md);
this file is its operational entry point — read PDR-117 alongside, do not
duplicate it here. The **work** the Director directs lives in a guiding plan
(see _The work you direct_ below); this file carries the role, never the
work-TODO.

This file exists because succession kept relying on a scattered, half-uncommitted
rehydration path (a thread-specific plan seed plus a per-user memory plus a comms
snapshot). On 2026-06-25 a successor broadcast a Moment-2 acknowledgement,
immediately retracted it as "premature/erroneous", and stood down — the takeover
had nothing solid to land on. This file is that solid thing: the brief is what a
successor lands on; the readiness gate is what the failed takeover lacked.

## The work you direct

The Director directs a **guiding plan**, not this file. The current effort's plan
is named in `CURRENT HANDOFF STATE`. The strategic root is the
worktree-per-agent transition (move from one-dev-many-agents on a single shared
checkout to many-checkouts / variable-agent-density with an author-agnostic
substrate); the operating model under trial is the Director + ephemeral-Implementer
contract itself. The current effort's **adjudication obligation, if any** — for
example whether this arc's acceptance must test the operating model rather than
merely whether the lanes shipped — is stated in the guiding plan named in
`CURRENT HANDOFF STATE`, not here; this brief stays plan-agnostic so it sticks to
the seat, not to any one pilot.

## How to take the Director seat

1. **Read this brief end to end**, then PDR-117 (minimum-action; route, do not
   execute; single owner-interface; the Implementer→Director→owner routing
   contract) and the Standing Lessons below.
2. **Rehydrate the live state** from the `CURRENT HANDOFF STATE` section and the
   surfaces it names — the guiding plan (work detail), the comms stream (recent
   events), `active-claims.json`, `repo-continuity.md`, and the napkin's recent
   entries.
3. **Readiness gate — BEFORE you claim authority** (the gate the failed takeover
   lacked). The five questions below are the context you must be able to answer
   from rehydration, not assumption — but **answering them in prose is not the
   gate; the mechanical liveness check is.** You may only broadcast a Moment-2
   acknowledgement after BOTH (a) you can answer all five and (b) you have run the
   mechanical liveness check and pasted its output.
   - Who are the live implementers, what lane is each on, and which claims do
     they hold? (If the team is dissolved, who — if anyone — is operating, and
     under what direction?)
   - What open verdicts do you own, and what is each one's pre-merge / acceptance
     condition?
   - What is owner-gated versus team-doable right now?
   - What is the single next safe step?
   - **Is the outgoing Director actually standing down** — heartbeat stopped, or
     it pre-positioned you?

   **Mechanical liveness check (MANDATORY — paste its output before Moment-2).**
   Do NOT compute the outgoing Director's last-event age by hand and do NOT read
   any local clock. Run the tool and let it compute the age in UTC against a UTC
   `--now`:

   ```bash
   # The tool parses claimed_at (bumped on every heartbeat) and --now as UTC
   # epoch-ms and emits age_seconds + freshness_status itself — no local clock,
   # no mental arithmetic. Source: claim-reports.ts age_seconds = nowMs −
   # Date.parse(claimed_at), both UTC.
   pnpm agent-tools:collaboration-state -- claims active-agents \
     --active .agent/state/collaboration/active-claims.json \
     --now "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
   ```

   Read the outgoing Director's `freshness_status` and `fresh_until` from the
   tool's output. A `stale` Director (or one whose heartbeat you have confirmed
   stopped) is genuinely standing down; a `fresh` one is still live — do not take
   the seat over it without a pre-position. If you ever need a single claim's age,
   `claims status --active <path> --now <utc-iso>` prints the same UTC-computed
   `age_seconds` / `fresh_until` per claim. **Never** compare a `…Z` timestamp
   against a local wall-clock: on 2026-06-25 a successor read a `07:52Z`
   pre-position against an `~08:50` local-BST clock, computed a false 58-minute
   coordinator-less gap, and broadcast a premature Moment-2 — yet `07:52Z` _is_
   `08:52` BST. The tool's UTC-to-UTC computation makes that error structurally
   impossible; mental arithmetic does not.

   If you cannot answer all five questions, or the check is not pasted, you are
   **not ready** — keep rehydrating; do not acknowledge. A premature
   acknowledgement is worse than a slow one, and an authority/coordination action
   gets the **highest** verification bar: ground the load-bearing fact first-hand
   before acting, most strictly when the premise conveniently licenses the action.
4. **Take authority (PDR-064 Moment 2).** Open your own Director claim (replacing
   the retained one named in `CURRENT HANDOFF STATE`), broadcast the
   active-acknowledgement, and re-arm awareness: the all-channels comms watcher
   as **move 1, before any coordination** (it is constitutive team-membership,
   not discretionary — it recurs on a drain-timeout, so keep a foreground-sweep
   fallback), and a heartbeat loop **with an exit criterion**. The outgoing
   Director's heartbeat legitimately runs until this moment (PDR-064: the seat
   never goes dark between the two moments) and the outgoing Director stops it
   after transfer (step 7); stop it yourself only as a backstop if it is still
   emitting well after authority has transferred.
5. **Operate the seat.** Live routing is the seat's first duty: a monitor
   event carrying an implementer team-start, routing request, or decision is a
   **pre-emption signal, not background** — pause the current process-task and
   route (or at least acknowledge with a next step) before continuing.
   Continuity paperwork (seeds, task lists, consolidation) happens in the gaps
   between live coordination, never ahead of it; if you cannot keep up, that
   is the hand-off-to-a-fresh-Director signal, not a push-through. Route
   durable **lanes**; do not choreograph individual pickups (implementers
   self-organise faster than fine-grained routing — and that routing races
   them). Before routing to a specific agent, **verify its current
   state right then** (its claim freshness via the same mechanical check above),
   not the state from minutes prior. Route **nothing** to an agent that has been
   told to close out or is high-context — route to its successor; check "has this
   agent been told to close out / is it high-context?" before routing anything to
   it. Own verdicts and verify them first-hand — including a PR's **inline review
   comments**, not just `gh pr checks`. Lens-resolve Implementer questions;
   escalate to the owner only when the lenses genuinely fail or the call is
   constitutively the owner's.
6. **Owner-away: keep going until ALL work is complete, then pause** — not a
   stand-down at the first stable point. "Complete" = every lane landed or cleanly
   parked with a durable handoff, every team-doable item done, only owner-gated
   items remaining. At completion, pause and **wind down your own heartbeat
   explicitly** — its exit is COMPLETION, not N-idle.
7. **Hand off when your context deepens — and hand off BEFORE your own
   closeout, never after** (owner direction 2026-06-28: optimise for team
   continuity and health, not any one session's tidiness — a sequencing and
   altitude instruction, not a speed one). When the PDR-063 80% /
   post-commit re-evaluation fires, the FIRST wind-down move is to start the
   handover: refresh `CURRENT HANDOFF STATE` below; pre-position your
   successor (PDR-064 Moment 1); require the successor's readiness gate
   (step 3, including the pasted mechanical check) before its Moment-2; and
   keep your own heartbeat running until the successor's Moment-2 lands —
   the seat never goes dark between the two moments (PDR-064; the liveness
   rule) — stopping it only once authority has transferred. **Handover
   artefacts on tracked surfaces (this brief's refresh, napkin entries,
   continuity rows) are written locally and land BATCHED into the next
   substantive or consolidation PR — NEVER a dedicated handover branch or
   PR (owner ruling 2026-07-15). The handoff record itself is instance-tier
   coordination state, untracked-by-design (ADR-199/PDR-094): it is
   preserved on the primary checkout's disk and never lands in git at
   all.** The handoff is complete when the record is written, the comms
   events are posted, and the successor acknowledges; the successor reads
   the record from the filesystem, not from a merge. (The comms stream
   carries the pointers, so nothing load-bearing rides on the landing
   latency.) Only AFTER the successor holds authority
   do you run your own team-member closeout; do not begin closeout
   housekeeping (consolidation, final summary) while still holding the live
   seat with no successor landed. At a genuine arc-end where the whole cast
   dissolves there is no successor — closeout is the terminal act.

## Standing lessons (this Director lineage)

Each lesson is the cure for a churn cause observed in the pilot.

**The durable role doctrine has graduated to
[PDR-117](../../practice-core/decision-records/PDR-117-director-and-implementer-roles.md)
§The Director role** — minimum-action / context-economy (stay silent on routine
signals), routing craft (verify-state-before-routing, durable-lanes-not-pickups,
never route to a closing-out agent), and takeover verification (registry-freshness
≠ comms-liveness; the highest verification bar for authority actions). Read PDR-117
for those; the lessons below are the **operational craft** of running the seat in
this repo that PDR-117 does not carry.

- **Arm the comms watcher as move 1, before any coordination** — it is
  constitutive team-visibility, not discretionary infrastructure; an
  un-armed watcher went blind to a simultaneous identical-branch claim. n=2
  retains it; only the heartbeat is in the drop-set.
- **Stop your own heartbeat at stand-down** or it asserts false "active" liveness
  — a heartbeat loop with no exit ran ~8h of false liveness across an outage.
- **Verify a PR's inline review comments first-hand**, not just `gh pr checks` —
  inline bot findings are invisible to the check-status view (the PR #220 / #222
  Proto-finding blind spot).
- **Re-spinning a deep-context session does not reset its budget** — security- or
  quality-critical work wants a genuinely fresh seat, not a re-spin of a spent one.
- **For an artefact open weeks+, "what has been decided since this was written?"
  is the first-order question** before its internal merits — check the decision
  timeline for superseding decisions.
- **Curate, don't mechanically slice, prose-not-written-to-be-sliced**, and
  drift-guard the projection against source.
- **Ground in the homed plan before designing — most "design" is crosswalk +
  activation, not greenfield.** Read the plan estate first; launching a design
  workflow over an already-homed plan risks forking an SSOT.
- **Director-run workflows (ultracode): flat output schemas** (a nested matrix
  schema hit the StructuredOutput retry-cap and failed silently), **never seed a
  contested call as "settled" in a brief** (the agents reflect it and the
  adversarial verifier cannot catch what you marked settled), and **critically
  assess every result AND its cited sources first-hand** (a cited SHA was not in
  main; an "unmeasured 10:1" was a measured 1.59:1).
- **Reject either/or — climb to the third option / the both.** A binary handed to
  the Director is the signal to climb (filter-vs-derive dissolved into one object
  that was both relief and structural cure). Run the five decision lenses before
  surfacing ANY question; surface only the constitutively-owner one.
- **Closeout is serial mutation, verified first-hand at the instant.** Re-verify a
  worktree clean immediately before `git worktree remove` (never `--force`);
  archive-not-delete (move, count-conserved); patch-id-verify a squash-merged branch
  before pruning (branch-existence is not preservation); never line-merge
  memory/state files.
- **A reserve/standby seat burns the very freshness it exists to preserve** if it
  cannot filter the heartbeat firehose — reserve-seat watcher filtering (the Lane-C
  `--exclude-tag heartbeat` work) is load-bearing economics, not a nicety; standby
  burn shortens the Director tenure the bench exists to extend.
- **The auto-update-branch babysitter** (reusable release-churn cure): a Monitor
  that `gh pr update-branch`es any OPEN+BEHIND auto-merge-enabled PR and emits only
  on a conflict. Safe because `--auto` enforces every merge gate server-side, so it
  only lets a genuinely-ready PR win the release-churn race — removing per-round
  babysitting from the Director's context.

The experiential source for the last several lessons is the Trawler-tenure how-to
brief ([`director-howto-and-pdr117-gaps-2026-06-29.md`](../../reports/agentic-engineering/director-howto-and-pdr117-gaps-2026-06-29.md)).
Its **Part B (PDR-117 missing axes)** is a queued doctrine-design task — context-budget
economy as a first-class axis, takeover-verification doctrine, owner-interaction modes,
Director-as-orchestrator, arc-closeout-as-responsibility, the loss-scan axis — to be
authored on fresh context (owner-directed), with PDR-117 as the surface to amend.

## Known friction (route to tooling, not to the brief or the plan)

These are tooling gaps, not doctrine gaps — they belong in the agent-tooling
backlog (`.agent/memory/operational/frictions-register.md`), named here only so a
successor recognises them rather than rediscovers them. Register state below is
first-hand as of 2026-06-25.

- **FIXED (PR #225, `e95fb9594`) — `claims adopt` + `claims set-handoff` (F-94) and the
  watcher-presence fail-fast gate (F-95, move-1 `comms assert-watcher-live` + `claims open`
  blind-write backstop, solo-exempt) now exist.** The PDR-063 handoff primitives and the mechanical
  backing for "arm the watcher as move 1" are available — use them; no workaround needed.
- **Continuity-buffer handoff commit blocked by markdownlint** — a mid-arc handoff
  commit can hit a markdownlint wall on shared multi-agent buffers; the interim
  cure is the dedicated consolidation pass (rotate + lint, then commit), but a
  lint-incremental / per-committer scope would unblock the handoff commit without
  it. Partially captured: **F-83** (whole-tree pre-commit gate hostage on a shared
  checkout; structural cure = the worktree transition) and **F-39** (markdownlint
  MD004 wrap friction) are in the register; the specific continuity-buffer
  handoff-commit cure is not yet its own entry.
- **Comms watcher drain-step hits its 60s deadline** under high comms volume and
  needs manual re-arming across a long session — supervise or raise the deadline;
  fail-loud already works.
- **No PR monitor covers inline review comments + PR terminal state** — until one
  exists, poll `gh pr view N --json state,reviewDecision`,
  `gh api repos/.../pulls/N/comments`, and `gh pr view N --json comments` by hand.

## CURRENT HANDOFF STATE

> ### ▶ SITTING DIRECTOR: Squall wakes Apex (`459fd1`), seated 2026-07-26 at owner word (Moment-2 `f1d9a6f2`); claim `56fdd977`, role director
>
> **SUBMISSION-RESEARCH REFRESH 2026-07-28 ~12:35Z — supersedes every block
> below; verify each line live.**
>
> **THE DAY'S WORK: the two Claude directory submissions, mapped from the
> owner's own screenshots and cross-referenced against Anthropic's published
> sources.** Everything durable; nothing lives only in chat.
>
> **PERMANENT RECORDS**: `.agent/reports/claude-directory-submission-form-inventory-2026-07-28.md`
> (all 20 screenshots read; both forms field-by-field; official-source
> cross-reference). Linear: **MCP-296** (form walkthrough), **MCP-298**
> (Anthropic briefing + a corrections comment answering six owner questions).
>
> **TICKETS MINTED TODAY**: MCP-300 (tool metadata — titles + remove
> duplicated prerequisite text + make title a REQUIRED type field),
> MCP-301 (public documentation, homed in Aakesh's MCP OKR project — a
> mirror in First Major Release is still OWED), MCP-302 (build the plugin),
> MCP-303 (reviewer access pack), MCP-304 (CIMD walk-through, owner-led),
> MCP-305 (per-tool response sizes), MCP-306 (listing content + slug).
> Earlier: MCP-292/293/294/295(Done)/296.
>
> **FIVE FINDINGS THAT CHANGED THE PLAN**:
>
> 1. **The slug is a ONE-WAY DOOR** and prefills
>    `oak-curriculum-app-internal-preview` from the name. Everything else on
>    the listing is editable after submission; the slug is not.
> 2. **Tool titles**: NOT 40 missing. The codegen path emits
>    `annotations.title`; the HAND-AUTHORED path
>    (`packages/sdks/oak-curriculum-sdk/src/mcp/**`) does not. Two paths, no
>    parity enforcement. Owner ruling: make title a required field.
> 3. **The `instructions` field IS already set** (`core-endpoints.ts:92-95`,
>    generated by `generateServerInstructions()`), and already says "For
>    optimal results, call these agent support tools at conversation start".
>    The `PREREQUISITE: You MUST…` text in tool DESCRIPTIONS is a duplicate.
>    Owner ruling: remove from descriptions, keep in instructions.
> 4. **Response sizes are ALREADY MEASURED** — `handlers.ts:215-221` logs
>    `'MCP tool result size'` per tool via `measureCallToolResult`. Query,
>    don't estimate.
> 5. **THE PLUGIN DOES NOT EXIST** — no `.claude-plugin`, no manifest, no
>    workspace. Its submission is blocked on the artefact, not paperwork.
>    Source is the PRIVATE `oaknational/oak-skills` (already carries
>    `.claude-plugin/marketplace.json` naming `oak-curriculum-toolkit`);
>    copying a subset into THIS public monorepo is what satisfies
>    "plugins must link a public GitHub repo".
>
> **CLERK / CIMD (verified first-hand, read-only, all three instances)**:
> Clerk HAS CIMD with default-deny admission controls, disabled everywhere.
> `oauth_jwt_access_tokens: false` everywhere (so the ADR-115 facade
> re-points with an env swap). Owner: **no Anthropic-held credentials**;
> CIMD is the option to pursue because nothing of ours is held externally.
> Open question only Anthropic can answer: does Claude-as-client publish a
> CIMD metadata document?
>
> **OWNER RULINGS TODAY**: submission is Friday 31 July; PostHog M0 boundary
> is MCP-237+MCP-238 ("events flowing safely, and @posthog/mcp in place");
> Clerk staged **dev-first**, owner performs all Clerk writes himself;
> **we will NOT list while invite-gated — production Clerk is the blocker**;
> comms is NOT our remit; **self-limits are gated on ASKING, never silent**;
> the monitoring-cost constraint was SITUATIONAL and is LIFTED.
>
> **FLEET**: Juniper holds Tendril (3dfd3b) live — PR #603 (dev guide),
> MCP-299 routed as follow-on. Raccoon/Schooner/Altair cold-paused with
> self-contained resume blocks on the stream. #602 (MCP-238) awaits a
> six-line deletion then merges, completing the M0 PostHog stack; #576
> closes without merging at that moment.
>
> **NOTHING OWED BY ME.** The MCP-301 mirror is **DISCHARGED**: **MCP-308**
> (public documentation, release-gate mirror) now sits in _MCP App: First
> Major Release_, related to MCP-301, and both descriptions cross-link.
> **MCP-301 is canonical for scope** — the mirror explicitly defers to it,
> so the pair cannot silently diverge.
>
> **ALSO MINTED / DONE AFTER 12:35Z, not in the ticket list above**:
>
> - **MCP-307** — canonical-host self-description. Investigation first:
>   `security-config.ts` already holds the two roles APART —
>   `ALLOWED_HOSTS` (CSV) + Vercel hostnames feed `allowedHosts` (accept-list,
>   DNS-rebinding + RFC 8707 validation), while `CANONICAL_HOST` (singular)
>   feeds `canonicalOrigin` (self-description only). **Both domains already
>   serve with no code change.** The genuine open question — self-description
>   is single-valued, so a client on alpha is told its resource is the www
>   address — is ticketed with three weighed options, NOT patched.
> - **CODEOWNERS**: `@mantagen` (Matt G) added alongside `@jimCresswell` on
>   both the default rule and the CODEOWNERS-protection rule — commit
>   `8aa5be06b`, pushed.
> - **Cloud-ops blocker** recorded as a comment on **MCP-172**, with the
>   ordering chain: Cloudflare route (`oaknational/Cloud-Config#551`) → then
>   `CANONICAL_HOST` on production Vercel → then conformance re-run.
>
> **PEER STATE at 13:01Z (captured off the ephemeral stream)**:
>
> - **Raccoon turns Nocturne** compacting at owner word. The **#602 six-line
>   cure was NEVER STARTED** — the worktree is clean at pushed head
>   `153f4ef30`, so whoever picks it up applies the adjudicated deletion
>   verbatim with **zero reconciliation**. Claims `398ddef9` + `f0652d2d`
>   held through the boundary; resume block `a39bb998b` governs.
> - **Altair turns Infinity** amended its freeze record: **#570 gains one
>   resume step** — `types.ts` lines 237 + 242 still document the child exit
>   code as "never a verdict input", stale against the applied
>   operational-exit fix; re-true both TSDoc sites **in the same commit as
>   the fixes**. Worktree at wrap: ahead 112, 8 files modified, nothing
>   pushed. Its wrap record is in the napkin and a formation letter in
>   `.agent/experience/` — both **uncommitted on the primary**, explicitly
>   handed to my capture sweep.
> - **Juniper holds Tendril** live.
>
> **MERGE-WINDOW BLOCKER (Juniper, 12:45Z — capture from the ephemeral
> stream).** MCP-297 landed (PR #603, merge `5404a4aa2`, owner-merged), so
> main has moved and the coordination-branch merge window is open. Three
> items, all scope-fenced out of Juniper's lane and now MINE:
>
> 1. ~~The PRIMARY checkout holds an UNTRACKED
>    `docs/engineering/working-with-this-repo-for-devs.md`.~~ **RESOLVED —
>    and the record was STALE for hours.** The owner (13:20Z): "I think the
>    engineering doc should be deleted already." It was: the file did not
>    exist on disk. Nobody had probed it since the capture.
>
>    **THE MERGE IS DONE.** `f36fe2ade` (tree alignment) then `9d306273d`
>    (merge of `origin/main` at `4bcbdba15`), pushed under bot transport.
>    Coordination is level with main; working tree CLEAN.
>
>    **The second stale reading, worth more than the first.** The fifteen
>    "dirty" paths were carried in this record and broadcast to peers as
>    _peers' in-flight edits_ — Raccoon's held widget claim. Probed file by
>    file against `origin/main`: **all fifteen byte-identical.** They were
>    not work-in-progress at all; they were LANDED content (#597, #601,
>    #603) sitting in the working tree while this branch's HEAD lagged.
>    `git status` reporting "modified" is a statement about HEAD, never
>    about main — read as "someone is editing this" it manufactured a
>    peer-collision that did not exist, and it deterred the merge for hours.
>    Resolution was the ordinary one git names: commit them (zero new
>    content, verified), then merge.
> 2. **Latent lint drift on main's tip** — `pnpm fix` consolidates imports in
>    `apps/oak-curriculum-mcp-streamable-http/src/auth/public-resources.unit.test.ts`,
>    and the `lint:fix` output is itself prettier-non-compliant. Surfaced in
>    #603's description, deliberately not committed.
> 3. **Worktree `oak-open-curriculum-ecosystem-worktrees/mcp-297-devs-doc`**
>    carries one dirty regenerable file — NOT provably-clean, so it is left
>    for an authorised prune, not the standing provably-safe rule.
>
> **SUPERSEDED — 2026-07-27 blocks below retain merge/ruling detail.**
>
> **LATE-EVENING REFRESH 2026-07-27 ~20:00Z — superseded by the block above.**
>
> **TWENTY-ONE merges today.** Added since 19:00Z: #598 (MCP-234), #599
> (MCP-235), #600 (MCP-236) — three PostHog slices in ~60 minutes, all
> green on first CI run. Main at `b0a2f832a428`. MCP-63 stack now
> **230–236 landed; 237 next at NARROWED scope** (sink + integration test
> only), 238–244 unbuilt. #576 stays open (close condition still false).
>
> **FLEET: ONE live seat (mine).** Swallow stood down cleanly at ~19:53Z
> after SIX merges — claims closed, nothing uncommitted, two permanent
> records landed, letter at
> `.agent/experience/2026-07-27-swallow-guards-tailwind-what-the-map-does-not-know.md`.
> Raccoon last seen on PR #597 (MCP-290 widget disclaimer, settled by name,
> merge is THEIRS by executor-class — owner was mid render-review).
> Schooner silent since 17:13Z; MCP-281 and #570 carrier-less.
>
> **CUSTODY CATCH worth carrying**: Swallow reported both permanent records
> committed; both were UNTRACKED on disk. I took custody at `03eb9d9ef`
> minutes before they stood down. Same class as the orphan review's
> ADR-217 finding — custody is a state you CHECK, not a feeling.
>
> **THREE INSTANCES IN ONE SESSION of one failure class** (napkin, flagged
> as rule-graduation candidate): a tool artefact read as a fact about the
> world — my `head -12` becoming a coverage denominator, my wrap-blind grep
> manufacturing a content-loss finding, Swallow's non-matching grep reading
> as send-failure (duplicate closeout), plus the piped `$?` reporting
> tail's status. **Cure: verify against STATE, never against a filter's
> output.**
>
> **ESTATE STANDARD, new today**: settle reads derive required contexts
> from `/rules/branches/main` and check each BY NAME across BOTH
> `/commits/{sha}/check-runs` AND `/commits/{sha}/status` — Vercel is a
> required STATUS and publishes no check-run at all.
>
> **NEXT DIRECTOR ACTS**: (1) #582 base refresh is STALE (prepared at
> `7994cd782`, main has moved twice) — redo, C341 registry entry still the
> one red; (2) MCP-237 needs a seat; (3) #570 and MCP-281 need carriers;
> (4) MCP-16 and MCP-289 (ADR-217) remain seatless.
>
> **SUPERSEDED — 19:00Z evening block below; detail still useful.**
>
> **EVENING REFRESH 2026-07-27 ~19:00Z — superseded by the block above.**
>
> **OWNER AWAY** since ~17:07Z ("I will be away for a few hours, please
> continue"). Standing merge mandate in force; keep going until all
> team-doable work is complete, then pause.
>
> **THE DAY: SEVENTEEN merges.** Added since the 14:50Z block: #593, #574,
> #583, #594, #595 (MCP-254, `4d5219d17`), #596 (MCP-269, `a2317b3d2`).
> Main at `be2dd9ae6` (1.98.0). Production landing page LIVE and probed
> (three legs 200). Coordination branch merged main at `bcc425ac7` —
> the watcher old-flag dist trap is UNFLIPPED after rebuild; the sole
> conflict (the watcher rule) resolved to main's side after verifying
> wrap-insensitively that it retains every coordination-side lesson.
>
> **ORPHAN-RISK REVIEW COMPLETE** (owner-commissioned) — report committed
> at `.agent/reports/orphan-risk-review-2026-07-27.md`. Three findings
> that matter: (1) NO uncommitted work is stranded anywhere — all 24
> worktrees inspected, every retired-seat one clean, Smelter's feared
> phase-(b) work absorbed into #582's head; (2) seven seatless
> In-Progress lanes dispositioned — MCP-150/154/155/156 and MCP-159 moved
> to Backlog with restart conditions (every attached PR verified merged);
> (3) **ADR-217 never landed** — authored on the superseded landing branch,
> homed in unbuilt PR-4, MCP-128 closed Done, so the decision behind a live
> public surface exists only on an unmerged branch. Minted MCP-289;
> branch marked do-not-delete.
>
> **M0 IS NOW MECHANICALLY GATED**: MCP-106 `blockedBy` = MCP-172 +
> MCP-269(done) + MCP-143 + MCP-270 + MCP-63 + MCP-117. Submission moved
> to **Friday 31 July** at owner word; domain DECIDED
> `www.thenational.academy/mcp`; new M0 gate MCP-268 (comms sign-off).
>
> **CLERK: the estate's biggest open decision is now a button.** MCP-270
> (adopt Oak prod instance) + MCP-271 (DCR risk register) minted and
> written up; verified via `clerk` CLI that Oak prod needs exactly TWO
> additive changes (DCR on, own secret key) and that
> `oauth_jwt_access_tokens: false` on all three instances means the
> ADR-115 facade re-points with an env swap and no code change. The
> toggle is the owner's.
>
> **FLEET at 19:00Z**: Swallow (805902) LANE GO on MCP-234 — the next
> MCP-63 slice, the only M0 blocker with no seat, spec = Cutter's
> committed successor record. Raccoon (0f6caa) and Schooner (5492d7)
> BOTH WENT STALE ~18:46–18:50Z; liveness pings sent (ping-before-escalate,
> work-evidence cross-checked first, nothing lost either way). If they do
> not answer: #582's remainder (base refresh PREPARED at `7994cd782` in
> `.claude/worktrees/mcp-103-base-refresh`; one red — the C341 registry
> entry its own validator wants) and MCP-281 + #570 need carriers.
>
> **OWNER-RETURN CARD**: (1) MCP-63 scoping — does M0's "initial PostHog"
> mean the whole MCP-234–244 stack or a narrower deliverable? (carded on
> the ticket; material to Friday). (2) The Clerk DCR toggle + key mint.
> (3) `CANONICAL_HOST` on production Vercel — deliberately NOT set;
> correct order is apply Cloud-Config#551 → verify it serves → set the
> var → re-run conformance. (4) Seats: three lanes need carriers if the
> two stale seats are gone. (5) The eleven unattributed uncommitted
> widget/registry files on the primary — Swallow eliminated itself; if
> they are yours, they hold the pre-push format gate hostage (I pushed
> from a clean detached worktree rather than touch them).
>
> **SUPERSEDED BLOCK — 14:50Z compaction refresh, retained for detail
> still in force (rulings, platform facts); verify against live state.**
>
> **THE DAY'S SHAPE**: morning untangling → afternoon MERGE DRIVE.
> **FOURTEEN merges to main**: #578 #580 #584 #585 #586 #587 #588 #589
> #590 #592 #593 #574 #583 #594. React page train COMPLETE (#583 merge
> `d2f0ce477`, boot-throw cured by Schooner, serve-probe run
> independently pre-merge). Fleet gitleaks cure LANDED (#594,
> `98435630d`, 832→0) — seats pull main to clear local scan reds.
> Swallow's restricted-filter index PROMOTED at owner word (restricted
> findable 0/2,641, rollback intact).
>
> **THE MERGE DOCTRINE (owner, three same-day escalations, verbatim in
> memory `merge-drive-orchestration`)**: work has ZERO value until merged
> to main; PRs that can be safely merged MUST be; green+clean needs NO
> owner approval, and any failure it admits becomes IMMEDIATE
> cannot-recur work. Operational form practised 6× today: settled → bot
> REST merge sha-pinned + in-merge thread re-check; bot UN-DRAFTS
> green+clean drafts (pin makes it safe). Reliable token shape:
> mint + auth-probe(/installation/repositories) + act in ONE shell.
>
> **FLEET at 14:50Z**: Swallow (805902, MCP-153 legs; go-moment for live
> index routes through Director), Schooner (5492d7, MCP-254 lane-go,
> NEAR-COMPACTION — self-declared), Raccoon turns Nocturne (0f6caa,
> joined today, 3 merges already; NOW: #582 lane — assess Smelter's
> uncommitted 6-file worktree work against its evidence list, triage 2
> threads UCVfY/UCVf0, base-refresh via Director). RETIRED today:
> Peony (Copilot; exemplary handoff on the ARC channel file; work merged
> posthumously #593), Cutter+Smelter (codex credits; custody events
> f46a8a06/cc41b786 and 80757b82; farewell letters in
> .agent/experience/, committed this wrap), Dynamo (morning).
>
> **LIVE TASKS at compaction**: watcher arm 14 (b0z846hpt, OLD-flag dist
> — TRAP: coordination branch predates #587, so local dist speaks
> --max-events; after any main-merge + rebuild it flips to
> --max-events-per-drain — re-arm from `comms watch --help`, never
> memory). PRODUCTION PROBE WATCH (bwgjhc3cx) still pending the page
> deploy report — CHECK ITS OUTPUT FIRST post-compaction; the owner is
> waiting on production 200s.
>
> **OPEN PRs**: #582 (Raccoon: custody cure PUSHED at e18b6ec94,
> gate-green, BOTH threads resolved; NEXT ACT IS THE DIRECTOR'S —
> base-refresh call, .gitleaks.toml resolves by adopting MAIN wholesale,
> then settled-by-name → merge; Raccoon also compaction-prepping,
> claim 1aaae3e6 live through their boundary), #570
> (POOL: 7 adjudicated fixes, event 92af6f15, needs FRESH-context
> carrier), #576 (stays open per Cutter closeout until MCP-239..244
> successor set completes — those application successors are UNBUILT),
> #569 (coordination; merge main into coordination at next quiet
> window — also unflips the dist trap above).
>
> **OWNER-SIDE (Wednesday critical path, unchanged)**: MCP-172 execution
> legs (Cloudflare route, Clerk MCP-143, conformance re-run), MCP-117
> PostHog keys, MCP-202 operator probe.
>
> **TICKETS minted today**: 246(post-submit, blockedBy 106), 247, 248
> group (249/250/251/264 — Copilot parity, post-submit), 254(→Schooner),
> 255(High, heartbeat-claim coupling), 261, 262(High, serve-probe as
> required check — the #583 class killer), 267 (pathspec matcher).
> MCP-245 cancelled dup of 246. 227/188/232/233/128-train all Done.
>
> **The morning that reshaped the estate**: the owner ran an UNTANGLING
> session (~08:00–10:00Z) fixing the fuckups threatening Wednesday's
> submission. Landed as doctrine (commits a1c7e2081, 04b299d44,
> 6813798ab): the REVIEW-TRIAGE rule (pr-lifecycle §Phase 4, owner
> verbatim, seat-level: reject incorrect / address
> correct+relevant+proportionate / else ticket+tell-Director+CLOSE);
> §Loop Dynamics in concept-exploration (state-vs-dynamics, bidirectional
> doctrine-vs-mechanism class — SIX instances found 2026-07-27);
> proportionality skill (Dynamo-authored); ticket-management skill (the
> graph is authored, not endured); confident-seats-proceed-and-report
> rule (in-lane proceeds on recorded confidence; freeze-bound + merge
> execution still gate); design-work-for-small-prs rule (PERMANENT,
> owner bands: ~5 files normal / 10 acceptable / 20 a problem, decompose
> at DESIGN time); trigger-first amendments to bot-identity (fires at
> EVERY third-party write), never-use-git-to-remove-work (tree-state +
> command), worktree-hygiene (claim-open + first source edit); the
> principles evidence-rule scope now covers RULES and SKILLS.
>
> **Fleet at 10:20Z**: Dynamo CLOSED at owner word (mistake pattern:
> mechanism claims raced ahead of source; honest assumption LEDGER at
> closeout — verified/read-not-run/inferred/inherited/stale in the ARC
> channel rapid-comms/2026-07-27-doctrine-landing-…md; claims 5681b4f1
> (#570) + 385cf282 (#574) RETAINED for Director ROUTING, carriers
> needed — #570 has SEVEN read-not-run fixes adjudicated-unpushed at
> event 92af6f15, #574 has 2 unadjudicated threads). Schooner: LANE GO
> MCP-229 (comms-watch hardening: per-pass max-events, WATCHER EXIT
> lines, rule truing incl. x-stop-invisibility; claim 1784770c, single
> PR, merge on word). Smelter: ACTIVE on MCP-103 (c)/(d) per DIRECT
> owner rulings (one context-rich workspace; latest-main; small-story
> PRs; #582 rebases onto main + lineage repair; their watcher/heartbeat
> DELIBERATELY stopped at owner request — no peer-check fires).
> Swallow: MCP-226 (13-field gate bridge) → MCP-153 per owner
> re-sequenced chain; MCP-203 post-submission. Cutter: #576 draft by
> declared scope (transport proof + ADR-218 outstanding). Design lane
> SEATLESS (claim 68088465 retained, PR-4 pickup record
> handoffs/2026-07-27-schooner-mcp-128-pr4-pickup.md; PR-4 proceeds on
> ISLAND HYDRATION per MCP-220 adjudication, owner-override open).
>
> **THE REACT-PAGE TRAIN (owner priority, IN MOTION on the Director's
> arm)**: #578 MERGED 27e672209 (~10:10Z, bot REST, in-merge re-check;
> note the SHA-fabrication capture in napkin — carry FULL oids, never
> reconstruct). NEXT: #580 retargets to main automatically, full checks
> re-run, then the VERCEL PREVIEW PROBE gate (/, /oak-ds/styles.css,
> logo — all 200, posted as PR evidence) BEFORE its settled read → word
> → merge; then #583 retargets, FULL by-name suite fires first time →
> settled → word → merge → production deploy serves the page at
> curriculum-mcp-alpha.oaknational.dev (boot-throw makes green
> deploy = page-serves proof). PR-4..6 NOT needed for live.
>
> **Watcher truth (morning investigation, CLOSED)**: five death classes;
> budget exits are silent BY DESIGN (--max-events = lifetime EMITTED
> budget, no CLI default); owner x-stops are INVISIBLE in-session
> (calibrated — verify liveness after owner-active windows, vanished
> task = probably-owner); the contention wedge is cured (#579, drains
> ~1s at full corpus); MCP-229 carries the fixes. RE-ARM CEREMONY: check
> the MANDATORY PAIR (F-75 peer-liveness poll) — Dynamo's closing
> capture; this seat's 12 re-arms all violated it (napkin).
>
> **OWNER-SIDE QUEUE at 10:20Z**: (1) MCP-172 EXECUTION legs — domain
> SETTLED at `www.thenational.academy/mcp` (owner word ~09:15Z, verbatim
> on ticket): Cloudflare route/Worker, Clerk config intersection
> (MCP-143), conformance re-run against the new origin pre-submission.
> (2) MCP-117 PostHog key ceremony. (3) MCP-202 operator probe.
> (4) DISCHARGED 10:51Z: MCP-192 secrets-environment finding MINTED as
> MCP-245 at owner word ("Mint ticket now") — owner threat-model
> decision now lives on that ticket. (5) Carriers: owner answered
> "open 1–2 seats now"; recommended routing seat 1 → #583 boot-throw
> (NEW, owner-priority: page has NEVER served — both preview deploys
> 500 FUNCTION_INVOCATION_FAILED, zero runtime logs; Vercel checks are
> deploy-proof only, probe gate caught it), seat 2 → MCP-227 (now
> fully sharpened via Director ticket comment: block/permit table +
> fail-open hazard pin) then MCP-228; #570/#574 + orphans
> MCP-199/200/216/217/218 route as capacity frees. (6) DISCHARGED:
> bidirectional principles edit APPLIED at owner word 10:51Z.
> MCPJam creds tmp copy DELETED at wrap (custody discharged).
> (7) LIVE at compaction: fleet-wide LOCAL secrets:scan red — 807 false
> positives (token-anchor digests in Smelter's current-source-anchors.json,
> three #582 commits, cross-branch sweep); classified by Swallow 10:13Z,
> cure ROUTED to Smelter 10:15Z (allowlist-with-rationale or anchor
> re-encoding, their call); other seats' pushes may gate until cured —
> check Smelter's pickup ack on the stream at rehydrate.
> (8) DIRECTOR RULING TO RATIFY (10:35Z, event 3bbbb51f): Smelter's F-95
> live-watcher precondition vs the owner watcher-stop order collided at
> MCP-103's commit claim. Ruled: one-shot watcher pass scoped exactly to
> the claim window (open→commit→close, pass exits, no re-arm) — the stop
> order's substance holds (nothing persistent restarts) and F-95's purpose
> (claim-holder reachability) is met. Falsifier: if the stop order covers
> even bounded one-shot passes, the mechanism is dead and Smelter's
> commit windows wait for owner word.
>
> Older 2026-07-26 blocks below retain merge/bridge/ruling detail still
> in force (Codex connector bridge, settled definition, freeze list,
> platform facts). Verify against live state — sections decay.
>
> **The work directed**: the V1 release drive toward the initial submission
> (the M0 window; ALL dates and vendor timing live in Linear ONLY). Today's
> arc: the MCP-63 plan LANDED on main (PR #568, merge `ccd1c410f`);
> implementation is mid-pipeline and MID-SUCCESSION; the owner-reported
> widget bug (MCP-187) and the DCR redirect gap (MCP-188) are in flight;
> the MCPJam evidence trail (MCP-184) has its first attended runs banked.
>
> **Fleet at refresh (verify live via the mechanical check)**: TWO live
> seats. Dynamo spins Naphtha (claude-code, 2f5519) — lands PR #570 (MCP-189
> wrapper; round 1's 16 threads resolved in one adjudicated batch, checks
> re-running) and PR #572 (MCP-192 mint-scope, settled-shaped: 17/17 green,
> zero threads, security verdict in Aurora's 12:39Z handoff event, codex
> review triggered), then MCP-188 (owner word). Cutter hunts Lagoon (codex,
> 019f9e) — holds all seven MCP-63 claims after the completed owner-directed
> succession (13:27Z, cross-verified by the outgoing seat); the inherited
> final-wire blocker is CURED (test drives the real production composition;
> test-expert + code-expert both PASS; 130/130; slice accepted-uncommitted);
> lands slice-per-PR under the owner's small-PRs word; wake-path limitation
> self-cured via 10-minute polling. Swallow guards Tailwind (805902,
> claude-code/claude-fable-5) — owner-directed ~14:10Z on MCP-152/153
> (upstream API spec alignment + bulk data checks), team-start 14:23:23Z,
> directed pickup notice 14:23:45Z; ran the owner-priced exploration
> fleet under the 14:33Z exploratory-only direction. EXPLORATION COMPLETE
> 15:28Z: report at
> `.agent/reports/upstream-and-bulk-alignment-concept-exploration-2026-07-26.md`
> (commit 27aae5406). Headlines: MCP-152 is SHAPE-NOVELTY (first
> POST/requestBody/map-response, unmodelled by the generator; naive
> refresh mints an uncallable tool with readOnlyHint:true and an EXISTING
> green test would defend the defect — anti-guard class; five operations
> silently moved limit defaults/maxima); MCP-153's premise INVERTS (the
> committed bulk schema.json is read by no code and was never true of its
> own payload — required fields at 0/12,864 on the real 635MB corpus; a
> WS3-as-written check would reject 100% of real data); the
> restricted/rights concept is inexpressible in indexed documents
> (product call). Five owner-calls (P1–P5, incl. the doctrine re-point of
> verify-data-supports-shape-before-building, which currently directs
> sessions at the false artefact) are being presented to the owner
> DIRECTLY in-session by Swallow (owner present, invited); execution
> shape P6–P16 proposed (throwaway regen probe with three-bucket failure
> classification before any landing; anti-guard re-referent first).
> Phase 2 remains OWNER-GATED. RETIRED cleanly
> today: Skua weaves
> Wingspan (~13:45Z after landing #571 at owner word; MCP-183 re-routes via
> the Director, carrier = first implementer seat that frees), Kite seeks
> Crosswind (~13:28Z post-succession), Aurora turns Gravity (~12:44Z; its
> delegations are VOID — recurrences route to the Director). Seatless PRs
> land via the Director at settled (no monitor seat exists).
>
> **Board (5 open; #571 MERGED e928d5ebc, #568 MERGED ccd1c410f today)**:
> #565 RESTACK RATIFIED (owner card answer ~14:35Z 2026-07-26): the
> full-React conversion lands as a fresh stack of small focused PRs off
> current main, superseding #565; growing it in-lane is dead. Execution
> waits on the design-lane successor seat (owner-held); that seat's first
> task is authoring the fresh stack FROM the #565 branch content, and at
> value-transfer (fresh stack open and carrying the work) #565 closes and
> its branch deletes per the branch ruling — the branch stays until then
> ONLY as the source material for the restack, not as a frozen reference.
> #567 do-not-merge; discharges via the
> MCP-183 harvest then CLOSE + DELETE BRANCH (owner branch ruling). #569
> (coordination, mine, draft-by-design): CodeQL red DIAGNOSED 14:40Z,
> attribution REFINED 15:35Z (Cutter): the CodeQL workflow is GREEN; the
> red is the Advanced Security AGGREGATE — all 34 aggregate annotations
> (21 high) are design-capture alerts tracing to estate commit
> 6146669bd; the 2 research-script alerts are open separately, not on
> the aggregate; zero in product code either way; evidence comments on
> the PR (the 15:40Z one supersedes the 32+2 split). Sonar red ALSO
> diagnosed (Cutter readback 15:59Z, post-recovery): 1,668 unresolved PR
> issues, sampled page entirely under the same design-capture tree, all
> created 2026-07-25T19:50:39Z = the capture commit 6146669bd; nothing
> touches the MCP-63 report or agent docs. BOTH reds now share one
> source and the landing-gate card's evidence is COMPLETE; disposition (path-exclusion
> config vs per-alert dismissal vs prune-from-merge) is OWNER-CARDED AT
> THE LANDING GATE, not before. SonarCloud red: re-verify after the
> maintenance window clears. #570/#572 as
> per fleet above. Every open PR carries a live discharge path.
>
> **Director duties armed on triggers**: (1) AC-4b DISCHARGED 14:25Z
> 2026-07-26 — production deployed release tip 835b30465 (cut on top of
> merge e928d5ebc, which is why the predicted 68824ccd was superseded);
> served suffix abeec8bc = `sha256(deployed full SHA)[0..8]` recomputed
> locally and matching; resources/read returns the full widget HTML;
> MCPJam apps conformance 7/7 (baseline 3/7); MCP-187 closed Done with
> evidence comment. (1b) SONAR MAINTENANCE LIVE at the same boundary:
> SonarQube Cloud EU+US scheduled maintenance 12:00–16:00 UTC 2026-07-26,
> Automatic Analysis down; last project analysis 13:47:26Z; #570/#572
> settled-shaped and refused ONLY on the missing Sonar status; Dynamo
> directed (event fdf87187) to stop empty-commit re-fires and hold; a
> 5-min status-page recovery watch is armed — on SONAR-RECOVERED
> broadcast (which NAMES Cutter's PR1 alongside #570/#572 — three
> analyses expected in the recovery drain), Dynamo waits ~10 min for
> queued webhooks, then ONE re-fire per PR if needed, then merges at
> settled; overrun past ~16:30Z reassesses to the owner. Cricket run
> ~15:20Z (three perspective pairs, owner-directed): release-clock
> ON-TRACK convergent; teacher + practice lenses convergent on ONE
> drift — the watcher-failure loop absorbed by re-arms instead of a fix.
> The wedge is now DIAGNOSED (Dynamo, 15:41Z, measured): the drain is
> O(total-files) sequential reads amplified by fleet I/O contention
> (31x under a light four-job load; deadline needs ~700x from idle) —
> NOT new-event volume; three seats misread the denominator. Queue
> re-shaped cure-before-mitigation: recovery merges → Director word on
> #574 → INCREMENTAL-DRAIN cure ticket (Dynamo minting with full
> evidence trail) → MCP-185 after, as honest mitigation on independent
> merits (never recorded as wedge-cure); A/B instances + the
> wrong-denominator lesson captured in napkin; (2) MCPJam OAuth credentials file — now ALSO
> copied to `tmp/mcpjam-oauth-credentials.json` at the primary checkout
> root (0600, gitignored) as a Dynamo grant for the attended oauth leg,
> comms event 557ec43d with binding handling constraints; the Director
> DELETES that copy at expiry (original in session scratchpad, 0600)
> expires ~10:41Z 2026-07-27 — authed re-runs after that need a fresh
> owner-attended `oauth login`; (3) at MCP-183's landing, close #567 and
> delete its branch; MCP-183 itself awaits its first-freed carrier via the
> Director; (4) Copilot review is SELECTIVE, never ceremony (owner
> word 2026-07-26): request it only on a PR judged important or risky where
> the service did not run by itself; its absence is never a Director-side
> blocker (falsifier on record: #571 merged with the latest review on a
> prior tip). If a deliberate request is warranted: the generic reviewers
> endpoint silently no-ops for Copilot (200, unchanged set) — the dedicated
> request endpoint on the Director's MCP surface is the working path, and
> Bot reviewers are visible only via the GraphQL Bot fragment, not REST
> requested_reviewers.
>
> **MORNING QUEUE FOR THE OWNER (re-trued ~20:15Z 2026-07-26; both
> decision cards DISCHARGED same-evening)**: MCP-201 posture card
> ANSWERED ~19:07Z direct (Proceed Wednesday + MCP-204 urgent
> fast-follow; MCP-201 Done, contract fully discharged). MCP-103
> topology card ANSWERED ~20:12Z via Director card (ONE workspace with
> generated views; approval relayed to Smelter event d88392b0, phases
> (c)/(d) OPEN, M11 start-unblocked). REMAINING: (1) MCP-172 zone-owner
> engagement (external latency, gates submission — the time-sensitive
> one). (2) MCP-117 PostHog key ceremony (Cutter's live-proof
> approaches). (3) MCP-202 operator-run probe at M0-set confirmation.
> Also standing: MCP-190/191
> M1 homes; MCP-214/215 milestone home (Swallow proposed first post-M0,
> prose only); owner gh CLI re-auth; FYI ruled-with-rationale items —
> Skipper's 56b91576f grandfather ruling (override open until the #578
> word fires); the three-seat identity failure-mode captures with the
> trigger-first doctrine-touch candidate; MCP-220's island-hydration
> adjudication (measured: 42KB props = +70% document for one toggle;
> island recommended and PROCEEDING as PR-4's working shape — override
> open until PR-4's settled read).
>
> **NIGHT LEDGER (owner-away window, ~19:00–22:00Z)**: #581 MERGED
> 79bfe9dcc (MCP-152 Done — upstream 0.7.0 adopted, usage-licence family
> deferred behind ticketed tripwires; merge word + in-merge guards);
> MCP-203 routed to Swallow (holds its whole evidence base). MCP-103:
> phases (c)/(d) five-story sequence ACKed with three riders
> (served-bytes-unchanged as per-PR merge gate; architecture pass
> pre-open on PR2's ADR-041 amendment; bridge mechanics); PR1 open as
> #582, two review rounds adjudicated (projection-not-second-registry,
> authority/custody axes split), settling. Design stack: #583 open
> (PR-3, seven-Opus round, turbo env-declaration cache defect + 320px
> reflow cured pre-open); MCP-220..225 minted from its merge-and-ticket
> dispositions; F-116 third instance recorded on MCP-186 with
> folk-practice escalation. #576 draft stands by Cutter's explicit
> scope-incomplete declaration (transport proof + ADR-218 outstanding).
> Review-owed framing corrected at Smelter's seat before it set.
>
> **Platform fact + standing bridge (2026-07-26 16:44Z)**: the Codex
> GitHub connector refuses merge actions without DIRECT in-session owner
> authorisation — a comms-recovered Director grant does not satisfy its
> safety boundary (first instance: #575, Cutter, 16:40Z). Standing
> bridge: a Codex-seat lane at genuinely-settled routes the mechanical
> merge key-turn to the Director (bot REST path, exact-head pinned);
> settled-judgment and lane credit stay with the seat. Also: the
> Director's gh CLI token went invalid ~16:34Z — owner re-auth suggested;
> unauthenticated public-API reads bridge board monitoring; the bot
> mint-token path is unaffected (it authored the #575 merge).
>
> **Live rulings in force**: browser sessions for PostHog EU project 221775
> and the Vercel project poc-oak-open-curriculum-mcp are owner-provisioned
> for the DIRECTOR SEAT ONLY — no other agent, no other project on either
> platform (live services elsewhere); branch work is NOT preserved — merged
> work is (valuable → merge it, else delete; frozen-reference is not a
> disposition); submission-surface freeze (served surface / auth path /
> landing page land through the Director); executor class rule (a PR with a
> live implementer seat lands by that seat; freeze-bound surfaces take
> Director word whoever executes); settled = ruleset-grounded (checks green
> plus code-scanning/quality, every thread resolved; NO approving review —
> required_approving_review_count is 0 everywhere and bot reviewers only
> COMMENT; the copilot_code_review leg is satisfied by review-present state
> and is NOT per-tip — the server adjudicates it, never the Director);
> sensitivity split (no dates/vendor timing in
> repo); dependency versions FLEXIBLE, Oak behavioural/privacy contracts
> FIXED; milestones propose-and-agree, work never dangles; PRs stay SMALL
> and focused (owner word 2026-07-26: convergence to zero feedback is the
> outcome smallness buys; the #571 arc proved per-tip re-review makes size
> anti-convergent); review comments are ASSESSED, never chased (owner word
> 2026-07-26: correctness AND relevance; fix / reject / merge-and-ticket —
> merge-and-ticket is a completion for correct-but-wrong-context findings;
> a reply is optional, the assessment is not).
>
> **Owner-held at refresh**: MCP-172 canonical-domain zone-owner
> engagement (URGENT, unstarted, EXTERNAL LATENCY, gates the submission —
> the listing carries the endpoint; surfaced to the owner at the 15:0xZ
> survey; was MISSING from this list before that survey — inherited blind
> spot, now cured). The design-lane seat SUCCEEDED cleanly 20:22–20:24Z:
> Skipper tracks Abyss retired at owner word (four-section record at
> handoffs/2026-07-26-skipper-mcp-128-restack-full-handoff.md; stack
> PRs #578 + #580 open and green, #580 carrying the preview-probe merge
> gate; PR-3 ~80% frozen uncommitted-by-design, gates-before-commit);
> Schooner binds Trench (5492d7, claude/claude-fable-5) ADOPTED claim
> 68088465 in place from registered standby, record read end-to-end, own
> monitors armed on the drain-cure dist, continuing PR-3 from the
> record's REMAINING list. Original seating 18:19Z: Skipper
> (4144b4, claude/claude-fable-5), claim 68088465 adopted from Lavender,
> owner-approved six-PR linear restack plan (three review passes, 45
> findings adjudicated): PR-1 DS source → PR-2 serve-DS (copy-before-boot
> exit criterion) → PR-3 React page baked at build (CSP font cure) →
> PR-4 hydration+ThemeControl+ADR-217 → PR-5 appearance baselines
> (Playwright identity protocol) → PR-6 theme-control guards; freeze
> handshake confirmed two-way (event 9bcd3e65); #565 closes with the
> full 36-thread disposition table at value-transfer on Director word;
> thread-34 ticket home routes to Director with that round report.
> Smelter rides Temper (Codex) — owner-named ~18:55Z 2026-07-26 onto the
> MCP-103 lane (model-behaviour content workspace, M7, release blocker;
> brief delivered via owner: phase (b) workspace-shape proposal first,
> carded to owner via Director; ask-the-Director wiring explicit).
> Awaiting team-start. PLATFORM NOTE: Codex seat — the connector
> merge-block applies (first instance #575); at genuinely-settled their
> lane's merge key-turns route through the Director-proxy bridge, with
> settled-judgment and lane credit staying at the seat;
> a seat for MCP-143 stage 1 (production sign-in guard cycles — Urgent,
> M4, seatless, gate-independent, start-immediately; carded to the owner
> at the survey); the M2 guidance-pipeline date tension (target 30 Jul,
> 0%, MCP-102 unassigned — re-date or seat, propose-and-agree);
> the MCP-117 PostHog key ceremony (needed only for the MCP-63 live-proof
> acceptance; env contract documented in the app's .env.example); the
> workflows App grant enactment landed as PR #572 (in flight); milestone
> homes for MCP-190/191 (propose-and-agree); the MCP-195 settings half
> (Actions environments). The codegen-refresh seat is FILLED by owner word
> ~14:10Z 2026-07-26: Swallow guards Tailwind (805902) on MCP-152/153,
> registered 14:23Z with first-hand grounding (spec delta ADDITIVE only:
> two check-restricted endpoints + one description change); two decision
> moments pre-flagged to route to the Director — MCP-152 check-restricted
> discoverability (product call, will arrive carded with evidence) and the
> MCP-153 index-regen go-moment. Eventual-successor naming on record:
> Cutter for Kite (active now).
>
> **Standing duties that transfer**: persistent all-channels watcher
> (Monitor, --exclude-tag heartbeat, --step-timeout-ms 120000; re-arm on
> fail-loud death, sweep the gap via a seen-file COPY, peer-liveness via
> the claims freshness check); dual-surface heartbeat loop (240s); daily
> release-burndown vs Linear; comms sends --body-file always; absolute
> paths; exit codes in-band with output captured to a file (never piped,
> never muted — both failure modes hit this seat today); owner-channel
> answer-first; prose with ticket numbers for the owner; referent-narrowing
> discipline (patterns/referent-narrowing.md): name what each signal
> reports on, one independent witness per load-bearing claim.
>
> **Succession**: PDR-063/064 unchanged (two moments; the readiness gate
> above with the pasted mechanical liveness check). This section is
> refreshed by the sitting Director at every handoff or continuity boundary.
