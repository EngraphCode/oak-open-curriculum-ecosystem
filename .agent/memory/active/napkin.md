---
fitness_line_target: 220
fitness_line_limit: 300
fitness_char_limit: 18000
fitness_line_length: 100
drain_strategy: "Extract settled entries to permanent docs, PDRs, rules, or archived napkins"
merge_class: append-only-narrative
fitness_content_role: drainable-buffer
---

# Napkin

Current-session observations. Append below. Rotate when over ~400 lines (`consolidate-docs`
step 6): extract every behaviour-changing entry, merge into `distilled.md` or graduate to a
permanent home, verify the home, then archive and start fresh.

## Napkin rotated (2026-06-29 deep consolidation, Falcon wakes Stratus)

Second rotation of the day. Quoll's earlier rotation (`napkin-2026-06-29-quoll-consolidation.md`)
re-bloated immediately with the rotating-cast's closeout appends (Hearth, Sirius, Kayak, Seraph,
Kraken, and Quoll's own closeout) — a worked instance of *napkin re-bloats from rotating-cast
closeouts*. Those appends are now processed and preserved verbatim in
`archive/napkin-2026-06-29-falcon-consolidation.md` (byte-identical).

This deep pass (Director-rotation closeout, owner-directed) graduated the deferred team-tooling
captures to permanent homes — the commits + the homes are the record:

- the `consolidate-at-third-consumer` → `consolidate-at-second-consumer` rename + slug sweep
  (the Quoll/Seraph doc-defect, **FIXED** — but the sweep was too broad: it rewrote append-only
  rapid-comms turns + a quoted corroboration record, reverted on #290 bot review); **gate-evasion /
  escape-hatch screen** →
  `patterns/fluency-is-a-failure-vector.md`; **Director craft** (Kraken's standby-burn /
  auto-update-branch-babysitter / measure-at-handoff-gate + Trawler Part-A) → `director-handoff.md`
  §Standing lessons, with the CURRENT HANDOFF STATE refreshed to a compact post-arc block;
  **timestamp-zone discipline** → `verify-dont-trust.md`; **discriminating-fixture** →
  `docs/engineering/testing-patterns.md`; repo-continuity arc-closed + Director=Falcon; the AEE
  identity row, statusline index-drift, and `data-sources-governance` index folds.

**Carry-forward (homes mapped, await an authoring pass):** the five lighter amends + Sirius's ws0
findings are staged in [`distilled.md`](distilled.md). The **PDR-117 expansion** + the **synthesis
phase** (model verdict / do-first matrix / rightsizing M1→M2 activation) are owner-routed to a
fresh-context session. **Curator-pass debt:** clear the 11 dead `commit_queue` entries + archive
the 3 stale non-team claims (Starling/Ketch/Finch); the ~2186-event comms dir awaits the
retention-gated archive-move pass.

New session observations append below.

- **MISDIAGNOSED a transient gh-auth blip as 5,000-budget exhaustion (verify-dont-trust failure;
  owner caught it).** A `gh` GraphQL call 403'd ("rate limit exceeded for IP …") then 401'd ("Requires
  authentication"); I confabulated "I exhausted the shared 5,000/hr budget by polling" — primed by the
  harness reminder's "5,000 shared" framing. The EVIDENCE in my hand refuted it: `rate_limit` showed the
  **unauthenticated signature** (`core.limit 60`, `graphql.limit 0`), and minutes later (still the same
  hour) `core 4935/5000`, `graphql 4721/5000` — I'd used ~279 graphql, ~6% of budget. The real cause was
  a **transient unauthenticated/token blip** (gh momentarily sent the request without its keyring token;
  GraphQL is unusable unauthenticated → 403/401), self-recovered. Lessons: (a) read the `rate_limit`
  SIGNATURE — `limit 60` / `graphql 0` means *unauthenticated*, NOT *budget exhausted at 5,000*; on a
  401/unauthenticated signature, check `gh auth status` and retry, do not assume volume; (b) the owner's
  "no way you hit 5,000" is the exact evidence-discipline cure — isolate the layer (auth vs volume) from
  the data in hand, don't inherit a primed framing. Tight `gh` Monitor polling is still poor hygiene, but
  it did **not** cause this.
- **NEW AGENT-TOOLING CONCEPT (owner, 2026-06-29) — a fleet-wide SHARED-RESOURCE BROKER. Do not lose
  this.** (A forward capability for *genuine* fleet shared-limit pressure — the LLM API, Sonar, a real
  many-agent `gh` load — NOT the cure for the transient-auth blip above; the two are independent.) It is
  a tool that **collates requests from multiple agents** and draws them from **shared resource pools with
  shared limits** — one fleet budget, not per-agent ceilings. Crucially: **the shared budget/pool STATE lives in the PRIMARY CHECKOUT** (the
  same coordination-home locus as `active-claims.json`, resolved via `git worktree list` per
  `resolveCoordinationHome` / the F-41/F-85 lineage), so every agent and every worktree reads and writes
  ONE shared ledger rather than each polling blind. Mechanics: request collation/queueing + batching (one
  GraphQL round-trip for checks+threads+state), jitter so fleet calls don't align, exponential backoff
  honouring `Retry-After` / `X-RateLimit-Reset`, and **budget reservation** read from the shared ledger
  (back off as the shared remaining falls, reserve headroom). It generalises **beyond `gh`** to any
  shared rate-limited resource (the LLM API, Sonar, Vercel, …) — a general fleet resource-pool primitive,
  with `gh` as the first consumer. The Monitor / `pr-watch` poll recipes consume the broker, never raw
  `gh`. Home: **F-110** (expanded); a candidate for its own plan/PDR when prioritised (it is a new
  multi-agent capability, not just a friction fix). Self-similar with this very session: the team builds
  shared-state coordination primitives while being throttled by the lack of one in real time (FRAME-1).

## Session 2026-06-30 — Titan weaves Ether (n=2 with Herring holds Jetty): curriculum-hub demo → live data + do-it-properly refactor

**Landing:** `demos/curriculum-hub-hw/oak-curriculum-hub` (Heather W's Curriculum Hub demo) wired to LIVE Oak
search + content. Branch `feat/curriculum-hub-demo`; `demos/` untracked, NOT committed. Demo's own gates GREEN:
type-check / lint (FULL strict, 0 errors) / `next build` / `pnpm dev` + live data (search "comparing fractions"
→ 9 lessons/6 units/8 threads; lesson → summary+pupilLessonOutcome+quiz(6/6)+8 assets).

**NEXT SAFE STEP (pickup):** run repo-wide `pnpm check` as the single gate-runner (live `.env` present in the
demo dir) → owner commit go-ahead → commit (stage by explicit pathspec; `demos/` untracked + 46 dirty files incl.
shared config edits). The final `pnpm check` was NOT run this session (compaction-prep; demo-level gates green).

**Team state (n=2, PDR-082):** Herring holds Jetty owns styling (Stage 4) — DONE (Tailwind v4 conversion of all
components + sub-component splits + the exported guards + accessibility baked in: visible focus ring + AA-contrast
palette, even with the a11y test-suite owner-deferred). I own data-plane/seams/config — DONE. Both lanes are
integrated and green. Nobody commits until `pnpm check` green + owner go-ahead. ARC channel:
`.agent/collaboration/rapid-comms/2026-06-30-curriculum-hub-demo-herring-holds-jetty-and-titan-weaves-ether.md`.
Two active claims (mine + Herring's) on thread `curriculum-hub-demo` — close at final closeout.

**Decisions locked (owner):** latest deps (Next 16.2.4 / React 19 / Tailwind v4 / TS 6); `demos/` = prototype-zone
(builds + type-checks + passes its OWN full-strict ESLint; exempt from repo-wide knip/format/markdownlint ONLY —
exemptions added to knip.config.ts ignoreWorkspaces + .prettierignore + .markdownlint-cli2.jsonc); asset downloads
= link OUT to thenational.academy (the API asset `url` is an AUTHENTICATED endpoint, not a browser-usable signed
URL — VERIFIED against the OpenAPI example values); a11y test-suite deferred (org WCAG-AA mandate flagged; Herring
baked in AA basics).

**TWO SYSTEM DEFECTS surfaced — proper fix is NOT in the demo (graduate → pending-graduations / report):**

1. `@oaknational/eslint-plugin-standards` `configs.react`/`configs.next` CRASH under ESLint 10
   (`eslint-plugin-react@7.37.5` version auto-detect calls a context API removed in ESLint 10). The demo is the
   FIRST React workspace to exercise these configs. Local mask: `settings.react.version` pin in the demo's
   eslint.config.ts. Proper fix: bump eslint-plugin-react in `packages/core/oak-eslint`.
2. Workspace SDKs' `development` export condition → `src/*.ts` (with ESM `.js` specifiers) is unconsumable by
   Next/Turbopack dev. Workaround: `next dev --webpack` + `resolve.extensionAlias {'.js':['.ts','.tsx']}` +
   `turbopack: {}` (so the webpack-dev hook coexists with the Turbopack production build). Proper fix: a repo
   decision on how Next workspaces consume these SDKs (or the SDK export map).

**Reusable learnings (graduate next consolidation):**

- **Client-boundary guards/validators MUST NOT live in a `server-only` module** (→ pattern candidate). A client
  component importing the runtime value pulls server-only into the client bundle → `next build` fails. Cure: put
  shared view-models + runtime guards in a non-server-only `*-types.ts`; keep SDK/secret wiring server-only.
  Worked instance: `isSearchResults` moved `search-client.ts`(server-only) → `search-types.ts`(client-safe).
- **exempt vs disable** (→ reinforces `never-disable-checks`; distilled candidate). Owner-directed SCOPE exemption
  (demos/ out of repo-wide validators, like depcruise already scopes to apps/packages/agent-tools) SURVIVES the
  decision lenses. DISABLING rules in a workspace's own eslint to dodge fixes does NOT (gate-off anti-pattern).
  Distinction: scoping a gate's purview ≠ weakening a rule's strictness.

**Collaboration behaviour-notes (mine, this session → distilled/behaviour-note):**

- Reframed the owner's "demo must pass its OWN eslint" into "disable rules to pass" — caught by the owner's
  decision-matrix challenge. Inventing a justification ("don't over-invest") to skip doctrine IS the
  no-speed-pressure failure mode. Cure: "pass X" means satisfy X, never redefine X.
- Changed a SHARED CONTRACT (reshaped lesson data to a slim view-model) WITHOUT pinging the peer who consumes it
  (Herring's lesson page) — after Herring had explicitly asked "ping before any data/prop change." Caught + reverted
  to keep the contract stable. Cure: a shared interface between two lanes is a joint surface; ping before changing
  it even when "improving."

**Grounded execution knowledge (verified first-hand — do not re-derive):**

- Search SDK `@oaknational/oak-search-sdk/read`: `createRetrievalService(esClient, {indexTarget, indexVersion?, zeroHit?})`;
  `searchLessons/searchUnits/searchThreads({query,size,highlight?})` → `Result<{results}, RetrievalError>`;
  esClient = `new Client({node: ELASTICSEARCH_URL, auth:{apiKey: ELASTICSEARCH_API_KEY}})` from `@elastic/elasticsearch`
  (peer `^9.3.4`). Index-doc fields snake_case: `lesson_title/lesson_url/subject_slug/key_stage/years(string[])/unit_titles`;
  unit nullable + `unit_title/unit_url/lesson_count`; `thread_title/thread_url?(absent for some)/subject_slugs?/unit_count`;
  `r.highlights[0]` = snippet.
- Curriculum SDK `@oaknational/curriculum-sdk`: `createOakClient(apiKey)` → `OakApiClient`;
  `client.GET('/lessons/{lesson}/summary'|'/quiz'|'/assets', {params:{path:{lesson:slug}}})` → `{data,error,response}`.
  `summary.lessonTitle/pupilLessonOutcome/oakUrl/canonicalUrl`; `quiz.starterQuiz[]/exitQuiz[]`; `assets.assets[].{type,label}/oakUrl`.
- Creds: `demos/.../oak-curriculum-hub/.env` has `ELASTICSEARCH_URL/_API_KEY/OAK_API_KEY/SEARCH_INDEX_TARGET`
  (gitignored by root .gitignore; dev port 3010). `@oaknational/logger` is a ~190-line UnifiedLogger+sink setup
  (disproportionate for a demo) — the demo deletes its logger shim and relies on Result → HTTP instead.

### Surprise (2026-06-30, Herring holds Jetty / curriculum-hub-demo): prototype is a minified multi-page React bundle; DesignSync is chat-scoped; Oak CDN icons 404
- **Context:** owner directed a full-fidelity port of the Oak Curriculum Hub prototype to the live demo (n=3 team: Herring styling, Titan data+decode, Squall joining).
- **Expected vs found:** expected a restyle of a search demo; found the prototype is a MULTI-PAGE hub (training courses, quality standards, rubrics, exemplars, wiki, pedagogy + search) shipped as a minified React bundle.
- **Lessons:** (1) Don't reverse-engineer a minified bundle — decode/render it (Titan used headless Playwright + bundle decode to produce prototype-rendered.html + screenshots + data snapshots). (2) The `DesignSync` claude.ai/design reader is CHAT-SCOPED — subagents CANNOT use it (proven 3×), so design-kit pulls route through the main agent's context; batch across turns and rely on compaction + disk persistence. (3) Oak icons are NOT curl-able from Cloudinary anymore (direct URLs 404; the cloud/path moved) and `icons.json` is only a partial map (~60 named + 14 subject examples, not all ~140). (4) n=2→n=3 teaming resolved a hard blocker: my browser extension was down; a peer's render+decode unblocked the visual target.
- **Routing:** full live plan + asset inventory in handoffs/2026-06-30-curriculum-hub-port-herring-holds-jetty.md; CI=true-on-commit already in user-memory `ci-true-required-for-git-commit-codegen-hook`.

### Director lessons (2026-07-01, Herring holds Jetty / curriculum-hub-demo, as Director)
- **No manufactured owner-approval gates.** The team (incl. me on rejoin) inherited an
  "AWAITING-OWNER-APPROVAL" frame from the plan + peers and I even escalated "plan approval" via
  AskUserQuestion. Owner correction: there IS no owner-approval step unless decisions have been
  routed through the decision matrix (principles.md §Decision Lenses) and a genuinely-constitutive
  residue remains. Cure = active firing gate: before any owner-facing question or "owner-held"
  label, run the 5 lenses and name which resolves it or why it's constitutive. "Team awaiting
  approval" is a fluent frame to TEST, not a fact to relay. (user-memory: no-manufactured-owner-approval-gates)
- **Gated first-hand verification beats a subagent workflow for content-availability.** A
  Director-run ultracode workflow to map+content-verify ~10 sections FAILED on the StructuredOutput
  retry-cap (~898K tokens, no clean output) — **even with flat schemas** (flat-schema rule is
  necessary, not sufficient). Titan answered the same "does content X exist" questions first-hand +
  gated (parsed the 199KB snapshot, compiled a typed module, asserted counts): QS=685 real →
  faithful build; training-courses=none → honest stub. "Does X exist" is a grounding question → route
  to a data-owning Implementer, not a fan-out. If a Director workflow fails, critically assess its
  partial output as unreliable and don't use it. (user-memory: gated-verification-beats-subagent-workflow-for-content-checks)
- **Never fabricate Oak content; honest-stub where nothing is decoded.** Destination-card copy +
  training/exemplars/wiki/pedagogy pages had no decoded content → neutral-factual placeholder /
  empty states, not invented Oak voice. Content-availability-verify-first is what makes this safe.
- **Appearance-match, not DOM-mirror; Lexend, not the capture-artefact serif.** Owner directive:
  idiomatic React/Next, match visual appearance not the prototype's templated DOM. The prototype
  screenshot's serif headings were a headless missing-woff2 artefact — design intent is Lexend
  (self-hosted via next/font); a headless capture of the DEMO renders correct typography.
- **DesignSync asset-supply does NOT transfer at a Director handoff** — it's chat-scoped to the
  session's design login; a successor needs their own /design-login. Split the un-transcribable
  (logos via byte-exact decode/filesystem) from the transcribable (small glyphs via DesignSync),
  and pull on-demand per section rather than bulk-pulling 140 through the Director's scarce context.
- **Routing:** Director handoff record at handoffs/2026-07-01-curriculum-hub-director-herring.md.

### Insight (2026-07-01, Squall wakes Crag / curriculum-hub-demo): match a design prototype from RENDERED screenshots, not its DOM; capture artefacts lie
- **Context:** owner directive — "where you rework the demo apply React/Next best practice, don't slavishly follow the html demo structure, but the _appearance_ must match."
- **Lessons:** (1) **Ground appearance on the rendered visual target (screenshots), not the templated DOM.** I was reconstructing appearance by extracting the prototype's `sc-if`/`sc-for` DOM — a fluency trap (the screenshots were the truth and I hadn't looked); viewing them reshaped the build (hero lemon-band + unified search) and confirmed my chrome/ResultCards already matched. (2) **Distrust capture artefacts:** the prototype screenshot's serif headings = a headless missing-woff2 fallback, NOT design intent (target = Lexend via next/font); matching the pixels naively would reproduce a bug. (3) **Idiomatic React reproduces appearance without DOM-mirroring** — tokens + layout ARE the appearance, not the div-nesting; decomposed components + next/link/image/font give pixel-match AND maintainability. (4) **Honest-stub over fabrication:** verify (first-hand) a section's content exists before shaping it; if none decoded, render an honest empty state — never invent Oak content or counts.
- **Frame lessons (homed as user-memory):** no manufactured owner-approval gates (`no-manufactured-owner-approval-gates`); an Implementer routes status/questions to the Director, not the owner (`implementer-reports-to-director-not-owner`).
- **Codification (owner-requested, routed to Director — comms 045c218f, Director owns):** reusable Oak Claude-Design demo process = one versioned kit source-of-truth + an active "build-an-Oak-demo" skill + licence-first governance + version/visual-regression for the evolving kit. Kept light (N=1).
- **Routing:** styling/UI lane handoff in handoffs/2026-07-01-curriculum-hub-styling-squall-wakes-crag.md.

## Session 2026-07-01 — Titan weaves Ether (n=3 Implementer, data plane): curriculum-hub full-fidelity port

Durable learnings from the n=3 build (Director Herring + Implementers Titan/Squall), for the next
similar demo/port:

- **Honest-scoping-by-verification.** Before building any "static" section, verify content
  availability FIRST-HAND against the real artefacts; "no data decoded" → an honest empty stub, never
  fabricated content. Worked: qsData was real (685 items → live-filterable); training-courses /
  exemplars / wiki / pedagogy-explainers were verified ABSENT (runtime-templated, not decoded) → honest
  "no content in this demo" states. A demo that matches the prototype AND tells the truth about each
  section beats one that lies convincingly. Handoff hypotheses ("content is decoded") are pointers to
  verify, not facts.

- **Proportionate boundary validation.** A vendored, profiled, build-time static JSON import is
  validated by TypeScript's compile-time type check — a runtime guard there is over-engineering (it
  tripped no-assertions / no-Record / complexity lint). strict-validation-at-boundary targets untrusted
  RUNTIME input (API responses, user input), not a controlled static asset you decoded and profiled.

- **Cross-agent file sharing is via the repo working tree.** Agents' scratchpad dirs are
  session-scoped and unreadable by peers (the path embeds the session id). Shared artefacts (decoded
  kit, the live-data contract, evidence screenshots) MUST land in the repo working tree, not scratch.

- **Seam-first coordination (data ⇄ styling).** The styling owner defines each presentational prop
  shape and pings; the data owner exposes hooks/modules to that shape. Delivering the field-by-field
  live-data contract (real values, gotchas like thread `url=""`) UP FRONT prevents the classic failure
  of designing UI around fields the API doesn't return. Reinforces [[no-manufactured-owner-approval-gates]]:
  standing by for a peer's real artefact is correct sequencing, not a manufactured gate.

Successor-session (Frigate holds Estuary, data-plane pickup of Titan's claim) operational learnings:

- **Watcher seen-file must use the agent_name verbatim (spaces and all).** `comms
  assert-watcher-live` and the watcher heartbeat file derive their path from the agent_name as
  `<agent_name>.json` (e.g. `Frigate holds Estuary.json`). Arming `comms watch --seen-file` with a
  hyphenated slug (`frigate-holds-estuary.json`) leaves the watcher running but the assert looking at
  the wrong path → false "watcher not running". Cure: pass the exact spaced basename to `--seen-file`
  (quote it). One watcher only — stop the mis-named one before re-arming (duplicate-watcher cursor race).

- **An additive optional-field widen inverts the "held-until-ping" dependency.** A reshape of a data
  contract is risky (hold it until the consumer defines the shape). An *additive optional-field* widen
  is not: it cannot break the stable contract, and the fields usually already exist at runtime (here
  `getLesson` passed the full SDK summary through; the interface only narrowed what was type-visible).
  So a piece "held until the consumer pings" actually has the arrow reversed — the consumer waits on the
  producer. Verify field shapes against the GENERATED schema (not a handoff note — it mis-stated
  `keyLearningPoints` as strings; they are `{keyLearningPoint}` objects, and unit title is nested in
  `units[]`), then DERIVE via `Partial<Pick<SdkType, ...>>` rather than hand-restating — the SDK already
  exported `SearchLessonSummary`, so a hand-projection is a shadow schema (generator-first). Deriving
  keeps the consumable shape identical (zero rework for the consumer) while making drift a compile error.

## Session 2026-07-01 — Swordfish holds Shoal (Director, curriculum-hub-demo): clean PDR-064 succession + a fluency near-miss

- **FLUENCY NEAR-MISS (own, retrospective metacognition; owner corrected).** When Herring's
  heartbeat kept firing after my Moment-2 + a stand-down nudge, I leaned toward "blind/away cron =
  false liveness" — a reading that arrived *fluently* because I'd just re-read the false-liveness
  standing lesson. I discounted a FRESH heartbeat as "just the cron" when a fresh heartbeat IS the
  liveness signal (its whole purpose); peer-liveness literally read "active" and I re-interpreted it
  to fit the lesson. Owner: "Herring is live, checking licence details." I'd drafted a wrong "stop
  your heartbeat" nudge (didn't send the correction; Herring self-closed first). **Cure:** a
  recent/persisting heartbeat is liveness evidence BY DEFAULT; "blind cron" is the exception needing
  positive evidence (session demonstrably gone), not the first read. Same failure class as the
  gh-auth misdiagnosis above (primed framing overriding the evidence in hand). Fluency is the
  tripwire to re-ground, not confirmation.
- **Director context-economy applies to my OWN verbosity, not just routine-signal silence.** Stayed
  silent on routine heartbeats (good) but routing replies ran long. Tighten to
  verdict + rationale + next-step. (behaviour-note)
- **Owner forward-asks captured, not built (N=1 guard).** Three "for later" asks (upstream-demo sync
  workflow; design-kit reconciliation workflow; demos/curriculum-hub-hw dir discipline) → via
  oak-reason: asks 1&2 are ONE upstream-reconciliation pattern (no-shared-ancestry vendored copy),
  ask 3 (dir taxonomy) is their prerequisite, all feed the reusable-demo-process codification
  proposal. Captured in `.agent/plans/curriculum-hub-demo/future/demo-maintenance-and-structure.md`;
  execution deferred. Frigate researching Claude Design (→ reports/claude-design-integration-scoping.md)
  feeds ask 2 (scope widened by owner — see next bullet).
- **COMPOUNDING FLUENCY INSTANCE (same session, minutes after logging the lesson above — a live
  PDR-089 / passive-guidance-loses confirmation).** I affirmed Frigate's "proportionate, no heavy
  fan-out — a fan-out would be evidence theatre" framing ENTHUSIASTICALLY because it matched my own
  prior read. Owner then OVERRODE it: deeper primary-source research + INNOVATE on
  repo↔Claude-Code↔Claude-Design flows (ultracode). Two errors: (a) a fluency trap — over-trusted a
  move that fit what I already thought, the EXACT failure I'd logged one entry earlier; naming it did
  NOT inoculate me; (b) a generative scope-miss — narrowed the owner's broad goal ("deep-understand +
  innovate") to inventory-to-reconcile. Cure reinforced: a smooth affirmation that matches my prior
  is itself the tripwire to re-ground the goal's real scope, hardest exactly when it feels obviously
  right. Corrected: routed Frigate the deeper acceptance bar + the 3 thread ultracode lessons (flat
  schemas / no-seed-contested-as-settled / verify sources first-hand — from the failed wf_63fbe427).
- **C7 licence gate DISSOLVED (owner-confirmed).** No new licence: root LICENCE (MIT, code) +
  LICENCE-DATA.md (OGL v3.0, curriculum content incl. quality-standards.json, attribution) + brand
  assets by MIT-non-trademark in Oak's own repo. Verified the licence files first-hand before
  relaying (didn't pass Herring's claim through). Removed redundant oak-design-kit/LICENSE.md; fixed
  PROVENANCE refs; added demo README licence section; updated the plan. Former C7 set now committable;
  push still held local (owner).
- **A negative claim needs a search CAPABLE of returning a positive — else it is not verification
  (Frigate, twice in one session).** I wrote "no `packages/design`, verified first-hand" — FALSE. My
  checks were `find packages -maxdepth 2 -name package.json` (misses depth-3 sub-packages) and
  `require('./packages/design/package.json')` (a group dir has no package.json); both empty, and I
  tagged that empty `[V] verified`. `packages/design/` in fact ships design-tokens-core +
  oak-design-tokens + oak-design-ink (React-for-Ink/terminal). Director spot-check caught it. SAME
  class as the reports/-invention miss (acting on an inadequate check): absence-of-evidence from a
  search that could not have hit ≠ evidence-of-absence. Cure: before tagging any NEGATIVE as verified,
  state the search used and confirm it would surface a positive (right glob depth, the actual artefact
  shape — nested pkg vs group dir). A `[V]`/"verified" tag on a negative asserts the search was
  adequate, not merely that it ran. Pairs with [[verify-own-explanations-against-full-source]].
- **A Claude Design canonical export is the fidelity SoT — but can contain STALE partial bundles
  alongside the current source; verify which is canonical before building (Frigate, export arc).**
  The unzipped export (demos/curriculum-hub-hw/claude-design-canonical-export) had BOTH the canonical
  `Oak Course.dc.html` (4 units/11 modules/63 sections/QS-coded callouts) AND a stale
  `Creating lessons at Oak.html` (785KB, Units 1-2 only, ZERO qs codes) — an earlier bundle. Building
  /course from the 785KB file would ship half the course. Also: the export hub is 5 cards; the 6-card
  version was only in the OLDER decoded screenshot (proto-bundle-landing.png). Two cures reinforced:
  (1) canonical export supersedes decoded-screenshot approximations, but (2) within an export, verify
  file currency (unit/section/qs-code counts), don't assume the biggest/most-obvious file is canonical.
  Reconcile mechanism (owner): pull a FRESH export + diff vs the committed one — self-contained +
  git-diffable, supersedes DesignSync get_file. I caught a near-opposite 5-card assertion of my own by
  VIEWING the screenshot + cross-checking card CTAs before flagging — disconfirming-evidence discipline.
  Homes: [[claude-design-always-full-reproduction]] (owner memory); export-diff reconcile → the research
  doc `.agent/research/claude-design-integration.md` Ask-2 (update pending).

### Session 2026-07-01 — Dolphin hunts Moorings (n=3 Implementer, styling/UI): closeout captures
- **MANUFACTURED-OWNER-GATE recurred TWICE in one session (Implementer side); owner corrected sharply
  ("why the fuck would it be deferred to me? The Director directs").** (1) Deferred a Director-GO'd
  decision (item 3) back to the owner + held for turns; (2) relayed "awaiting owner visual review" ~10×
  as an automatic gate — it was a label inside the *Director's own C6 recap* I relayed without running
  the lenses. Root spanning both: **I treat externally-supplied frames as facts, not claims to test** —
  from a direct human message OR a trusted peer/Director summary. Cure (homed + sharpened,
  [[no-manufactured-owner-approval-gates]]): ANY step labelled owner-scoped, from ANY source incl. my own
  summary, is the tripwire to run the 5 lenses first; owner direction flows downward (follow it), never
  an upward gate I manufacture; lane decisions → Lens 1 → proceed; route to the Director not the owner.
- **Visual-match discipline (styling arc, verified in-browser):** owner caught "very obvious differences"
  the team's "faithful match" missed — owner's direct comparison = ground truth. Fix pivoted on grounding
  on the AUTHORITATIVE source: cards wrong from a placeholder premise ("not decodable" — false, copy was
  in the team's own capture), then briefly right vs the OLD prototype (6 cards), finally right vs the
  FRESH canonical export (5 cards). Body font-weight 300→400 was a pervasive lightness gap. Match RENDERED
  appearance, not templated `<x-dc>` DOM (fluency trap).
- **SCOPE REALITY for successor (Laurel):** "all pages+components" = a TYPED-CONTENT RENDERING SYSTEM
  (reusable block-renderer over 15+ canonical block types; /course alone = 63 sections), the load-bearing
  architectural decision — not a set of pages. STRICT everywhere: full-strict eslint + WCAG 2.2 AA on
  every component; deferred a11y test-suite = standing risk. Detail: handoff record
  `2026-07-01-curriculum-hub-styling-dolphin-hunts-moorings.md` §SCOPE REALITY.
- **Ops:** standby→active successor pattern worked cleanly (I was Squall's successor; Laurel is mine);
  watcher+heartbeat re-arm loops self-heal through the 3600s `timeout` backstop AND the ~14s
  `agent-tools/dist` removal during a peer's `pnpm check` — one missed heartbeat = offline, not
  retirement (ping-before-escalate). Visual-target BLOCKER: can't render `.dc.html` (file:// blocked,
  loopback server denied); export screenshots headless-blank → Frigate/Polaris headless-render is the path.

### Director closeout (2026-07-01, Swordfish holds Shoal → Lantern binds Sulphur): full two-moments succession, both ends
- **Worked instance: a clean PDR-064 succession at BOTH ends in one session.** Took the seat from Herring
  (Moment-1 cdbe9fd5 → my Moment-2 af1ac14f; readiness gate + mechanical UTC liveness check; effort-scoped
  NOT the Falcon director-handoff.md lineage), directed the curriculum-hub program, then handed to Lantern
  (Moment-1 7e4575a9 + self-contained record `2026-07-01-curriculum-hub-director-swordfish.md`; retained
  authority + heartbeat until Lantern's Moment-2). Owner rotated the WHOLE generation at once (Director
  Swordfish→Lantern, styling Dolphin→Laurel, data Frigate→Polaris) — clean because each seat left a
  self-contained PDR-063/064 record.
- **My recurring failure = scope-narrowing + ungrounded endorsement.** 4+ ground-before-endorse catches
  (false-liveness read of a live peer; "proportionate research" I affirmed then owner-overrode; invented
  `reports/` path; "no packages/design" I nearly rubber-stamped); and the "honest stub" framing was a HEDGE
  the owner killed. Root: I default to the NARROWER reading of owner intent and over-trust fluent/matching
  claims. Durable cures: [[claude-design-always-full-reproduction]], ground load-bearing FACTS first-hand
  before endorsing (a Director's "yes" authorises action), no hedging vocabulary. Naming a lesson did NOT
  inoculate me (PDR-089) — re-committed the fluency class minutes after logging it; fix is structural
  (verify at the moment), not vigilance.
- **Director-economy held** (silent on routine heartbeats, acted on substance) but routing REPLIES ran long —
  tighten to verdict+rationale+next. Owner-directed excellence-agenda scope pass → plan §"Scope-completeness
  + excellence agenda" (body-reconcile, TDD on search logic, architectural placement of local-search, GATING
  visual-target render, reviewer+WCAG-AA coverage, enumerate curriculum-search integrations); handed to Lantern.

### Polaris mends Perigee (data-plane successor, curriculum-hub-demo, 2026-07-01) — loss-critical adds
Landed: owner-directed sync-mechanism correction (both durable homes); slice 1 Standards data-view (`lib/standards-view.ts`, 11/11 green) + slice 2 training courseIndex (`lib/static-training-courses.ts`, 7/7 green — fixed the false-premise empty stub). Clean Director-approved boundary relay → Eclipse turns Singularity (record path-set on fd0ee59e). New (the entry above already has the false-liveness / honest-stub / scope-narrowing class + route-to-Director):
- **Recompute your OWN numbers.** Asserted "318 blocks" (noise-inclusive `grep t:'…'` incl. `variant:`/`component:` fragments) for the Oak Course; genuine total is **214** (18 types). Per-type census right; summary total not recomputed from parts. Director caught it. Cure: recompute any total from its components before asserting — "assume nothing correct" includes your own arithmetic. Pairs [[verify-own-explanations-against-full-source]].
- **Session-length watchers run under `Monitor(persistent)`, NOT `Bash(run_in_background)`.** My comms watcher as background-bash was SIGTERM-reclaimed after ~26 min (silent loss of incoming visibility). Cure: watcher + heartbeat as persistent Monitors (auto-restart wrapper on the watcher). Also filter routine `[HEARTBEAT]` events from the watcher stream (awk block-filter) — per-heartbeat wake is noise; peer retirement = heartbeat *absence*, use `comms peer-liveness`.
- **A content-absence verdict against a SUPERSEDED source ≠ absence in the authoritative one** (the mechanism behind the parity finding). Prior "no content / honest stub" verdicts were verified against the `reference-prototype/` decode, which the plan declared superseded by the `claude-design-canonical-export`. Cure: re-verify any "no content" verdict against the CURRENT authoritative source. Feeds [[claude-design-always-full-reproduction]].
- **StructuredOutput fan-out fails on open-research/fuzzy tasks — 2nd data point.** My parity workflow's sync-research + rubrics agents died on the retry-cap (same class as wf_63fbe427); the flat-schema per-file-read parity agents all passed. Cure: fan-out for "what does this file contain"; do research/design/fuzzy-classification first-hand. Reinforces [[gated-verification-beats-subagent-workflow-for-content-checks]].
- **Design insight (Director's refinement, ADOPTED — candidate for the demo-maintenance plan / a pattern):** a content-extraction generator built **re-runnable** IS the content arm of the canonical-export sync loop (pull fresh export → diff → re-run generator → reconcile) — unifies "content extraction" + "upstream sync" into one mechanism. Applies to slice 3 (the 214-block Course generator).

### Lantern binds Sulphur (Director, curriculum-hub-demo, 2026-07-01) — Director-seat closeout → Hawthorn herds Loam
Took the seat via clean PDR-064 Moment-2 (from Swordfish); drove the n=3 team (Kite styling / Eclipse data) to a green spine (renderer + 18 block components, 42→52) + Standards data-view (11/11) + a landed AA-fix (19/19). Distinct Director-seat failures (beyond the class logged above):
- **Do NOT spawn implementer sub-agents to drive lane work when the team is owner-launched peers.** When both implementers signalled context-limit I misread it as "both relaying," adopted both claims, and spawned implementer sub-agents — one collided with a peer's still-live slice-2 work and left an orphan (`lib/hub-search.test.ts`) that broke type-check. The owner-launched peers (Kite/Eclipse) reasserted the model by adopting the claims. Cure: **owner-launched PEERS implement; the Director routes + dispatches READ-ONLY reviewers only** — never implementer sub-agents; and **a relay OFFER ("your cadence call") is NOT a stand-down** — verify each lane's ACTUAL state before any broad multi-lane action (a peer kept driving and landed slice 2 while I treated its lane as relayed). Pairs the false-liveness class.
- **Don't retire/park an implementer lane mid-session for seat-cost.** I approved Polaris's retire-for-seat-cost / PDR-063-staging; owner overrode hard: *"do not retire implementers mid-session unless all work complete; drive the work to COMPLETION."* Cure: **drive-to-completion beats seat-cost optimisation**; context-limited → relay to an IMMEDIATELY-active successor (lane never idles), never park-until-next-session. Completion must be crisply defined in the plan — if missing, author it (I added the DoD §A–I).
- **Decide-and-drive; idling for owner input is worse than deciding + correcting.** I over-escalated a pacing decision that was mine (accelerate Standards vs not) and held awaiting the owner; owner: *"you could have decided either approach... a hell of a lot better than sitting idle."* Cure: resolve anything the decision-lenses settle; surface ONLY constitutively-owner residue; the owner's scarcest resource is attention. Homed in user-memory `director-operating-model` + `route-go-no-go-to-director-not-owner`.
- **Positives that held (verify-recompute earned its keep):** the screenshot "all headless-blank" claim was a false n=1 generalisation — 3/5 were rich course renders (checked first-hand); the 214-not-318 block count; and dispatching reviewers at the spine boundary caught an AA-blocking Tabs roving-focus bug (2.4.3/4.1.2) BEFORE 63 sections of pages assembled on the spine.

### Eclipse turns Singularity (data-plane successor, curriculum-hub-demo, 2026-07-01)
Adopted fd0ee59e from Polaris via clean Director-approved relay; verified slices 1+2 green first-hand; delivered slice 3 (re-runnable Course generator + 214-block compile-time-validated typed module, census matches Polaris first-hand, TDD green) + the QS literal-union tightening. Loss-critical adds:
- **A union/schema built from SAMPLED data must be type-checked against the COMPLETE dataset before it's trusted.** The `Block` union (built during the spine from a content subset) missed 5 real fields — my first full 214-block extraction + the emitted module's `: Course` compile-time gate surfaced them all (title-less callout, callout `attrib`, flip `frontImage`, optional accordion `chip`/`badge`, accordion `img`). Nobody could find them until all content was type-checked at once. Cure: the generator's compile-time validation gate IS the check; run it over the full corpus, don't infer a schema from a sample. Pairs [[verify-own-explanations-against-full-source]].
- **Build tooling ≠ app code for eslint; route the zone to the Director, don't contort or disable.** A generator (fail-loud `throw`, `Object.keys`/`entries` deep-walk of arbitrary JSON, TS-compiler-API) + generated data (`max-lines`) collide with app-strict rules. Repo PRECEDENT: `oak-sdk-codegen/eslint.config.ts` zones `code-generation/**` + `src/types/generated/**`. Cure: route a SCOPED zone proposal (with the precedent) to the Director (standards bar) — not app-runtime idioms (Result-threading a recursive parser is worse code), not a broad disable. Refinement learned: hand-authored tooling KEEPS `max-lines` (split the file); only generated artefacts get it off.
- **`Array.isArray` does NOT narrow a `readonly T[]` union member out** (its guard is `arg is any[]`; a readonly array isn't assignable to `any[]`). Cost 2 tsc errors on a JSON walker whose `LiteralValue` used `readonly` arrays. Cure: use MUTABLE array/index types for build-time intermediate representations so `Array.isArray` narrows the negative branch.
- **A `Monitor` loop captures cwd at START; restarting a heartbeat loop after a `cd` breaks root pnpm-script calls.** My heartbeat (relabelled/restarted while cwd was the demo workspace) failed `pnpm agent-tools:collaboration-state` (root script not found) → false-liveness risk. Cure: put an explicit `cd <repo-root>` INSIDE any Monitor loop that calls a root pnpm script; never rely on inherited cwd. Sibling of Polaris's Monitor-persistent note. (Also: always use ABSOLUTE paths in Bash — cwd persists across calls and drifts silently.)
- **Standby→active flip (positive, worked as designed):** held the successor-in-waiting seat (watcher + registration, NO heartbeat/claim — PDR-078 §4 consumer-absent) while Polaris was live; flipped on the Director-approved relay (adopt + arm heartbeat) with the handoff record re-read first. Adopted WITHOUT a fresh approval ask (relay was already Director-approved = no manufactured gate), mirroring Kite's parallel styling pickup. Coordinated every shared-seam change (the tightening broke Kite's `toFilter`; pinged with the exact fix + a tested guard rather than editing Kite's live file).

### Kite holds Fogbank (styling-lane successor, curriculum-hub-demo, 2026-07-01)
Adopted `cf62bda9` from Laurel (owner-launched successor) at her clean-boundary relay; built the WHOLE `/standards` page — browse (2a: rail w/ context-counts, type/rubric chips, pagination, `#qs=` deep-link focus) + detail/exemplification (2b, faithful per Director Decision A) — §E-SIGNED-OFF DONE (first full DoD §A page with §E locked); extended the `Block` union (5 additive, unblocked Eclipse's generator). Pure view-model + thin React; 116 tests. Relayed to Linnest guards Ridge at complete boundary (PDR-063, record `2026-07-01-curriculum-hub-styling-kite-holds-fogbank.md`). Loss-critical adds (rest is homed in that record + Eclipse's block above):
- **An inherited "deferred" GATE is a risk-flag to RE-RATIFY, not a licence to skip — candidate: distilled/pattern.** Laurel's/Dolphin's handoff called the a11y test-suite deferral "a standing risk." The doctrine-by-analogy trap: read "deferred a11y" as "AA is optional for a demo." I re-ratified against first principles (org WCAG-2.2-AA mandate + owner strict-everywhere) and treated §E as the HARD gate it is — Director-dispatched adversarial review (react/a11y/type) then caught **4 REAL AA blockers** on the headline `#qs=` deep-link path (silent deep-link focus, no live region, nested `<main>`, show-more focus-drop) I'd otherwise have shipped. Cure: an inherited deferral is a hazard inherited unratified, not a settled decision — re-derive whether the gate is actually optional against the live mandate before honouring the deferral. Especially for org-mandated gates. Pairs `never-disable-checks` + AA-gate-earns-its-keep evidence.
- **AA focus management must move focus on view-change but NEVER on a filter/search keystroke** (would steal focus mid-type = its own AA failure). Mechanism that worked: a `pendingFocus` intent ref set only by view-changing actions (deep-link / pagination / open-close detail), consumed by one post-commit effect — filter/search set nothing. (Grounded exec knowledge; full detail in the styling handoff record for Linnest.)
- **Corroborates Eclipse's cwd/absolute-path note (hit the same class ~4x this lane):** additional variant — a `--body-file` arg must be the scratchpad's ABSOLUTE path; constructing a relative `../../../` traversal from the repo root up to the scratchpad is unreadable (failed twice). Pass the scratchpad's absolute path verbatim, never a traversal.
- **Difference-operation at closeout (positive):** most session knowledge was already homed (handoff record = Linnest's exec knowledge; Eclipse's napkin block = the cwd lesson; comms = coordination), so the genuine napkin residue was ~1 lesson. The `oak-reason` pass reframed closeout from "dump everything" to a difference-op (capture only non-derivable + not-already-homed) — prevented duplicating Eclipse's cwd lesson + the handoff record's exec knowledge.

### Hawthorn herds Loam (Director #4, curriculum-hub-demo, 2026-07-01) — tenure closeout → Sycamore spins Loam (standby)
Took the seat via clean PDR-064 Moment-2 from Lantern (F-44 avoided: registry-stale but comms-live — did not take the seat until the pre-position). Drove Kite+Eclipse to the Standards-page §E sign-off + slice-3 done via per-slice read-only reviewer dispatch; ratified 2 seams (block-union 5-additive schema-first; a-normalization in extractor) + the eslint tooling-zoning; then routed the whole owner-launched successor cast (Cinder data / Linnet styling / Sycamore Director-standby) after both implementers relayed clean. Most tenure lessons are already homed by the retiring agents' blocks above (F-44, don't-park-lanes, owner-peers-implement, union-from-sample, build-tooling-zoning, Monitor-cwd) — applying the difference-op, the genuine residue:
- **Comms bodies with backticks/`$`: ALWAYS `--body-file`, never inline `--body`.** Hit command-substitution 3× this tenure — a `--body "…\`fd0ee59e\`…"` routing correction had its claim IDs STRIPPED by the shell (posted a broken adoption instruction, had to repost clean). Distinct from Kite's absolute-path variant (that's the file PATH; this is the body CONTENT). The `--body-file` cure is IN the rule; I still repeated it. Cure: reflex `--body-file` for any body containing backticks or dollar signs. Candidate: distilled.
- **Verify the FULL gate scope, never a predecessor's narrow subset.** Cinder's full `eslint .` found 2 `no-throw` warnings in `lib/static-quality-standards.ts` that Eclipse's truthful-but-narrow "0/0" (`scripts/ lib/course/`) hid — and I PROPAGATED that narrow scope when I spot-checked "green". A scoped "0/0" can mask warnings elsewhere; run `eslint .` / `pnpm check` at full scope for a gate verdict. Candidate: distilled. Pairs [[verify-own-explanations-against-full-source]].
- **A reviewer's read of an actively-edited WIP tree can catch a self-resolving transient — re-verify current state before alarming.** type-expert flagged a `StandardsBrowser onOpen` tsc red; I re-ran the check and it was green (~44s-old edit, mid-wiring). The `ls -lT` local-time (BST=UTC+1) vs `date -u` gap nearly disguised how fresh the edit was. Cure: on a reviewer's out-of-scope tree-state claim, re-ground the CURRENT state first-hand (and read `…Z` vs local-clock correctly — same F-44-adjacent trap). Did NOT broadcast a false alarm to Kite because of this.
- **Applied-well (worked instances, doctrine already exists):** work-evidence cross-check (git mtimes) before pinging a "stalled"-looking Kite (it was heads-down — ping-before-escalate); relabel heartbeat on entering a long owner-wait (I initially MISSED this — heartbeat asserted a stale lane through a ~3h owner gap — then corrected; the rule already says to, so the lesson is *apply it*, cross-links liveness-heartbeat-cron); Director context-economy (silent on routine heartbeats, act on substance) over a long tenure.

> **Fitness pressure (recorded, not chased):** napkin over its 300-line limit (already over at session open; this session's rotating cast — Polaris/Lantern/Eclipse/Kite — appended four closeout blocks). Rotation is a `consolidate-docs` job, not a handoff trim; captured at full weight per the conservation invariant.

### Cinder rides Vapor (data-plane, curriculum-hub-demo, 2026-07-01) — closeout captures
Owner-directed whole-generation rotation (data Cinder→Deneb; styling Linnet→Typhoon; Director Sycamore→Panther eventual). Handoff record: `handoffs/2026-07-01-curriculum-hub-cinder-data-plane.md`. Durable learnings:

- **Generator-first is the cure for a no-throw warning on a VENDORED STATIC-DATA boundary — NOT Result-at-runtime (distilled / pattern candidate).** `qualityStandards = rawData.map(parseQualityStandard)` threw at MODULE-INIT to narrow a JSON import's widened `type`/`state` to closed unions (2 `no-throw` warnings). Result-at-boundary is the reflex fix but WRONG here: it ripples to ~5 consumers AND has no meaningful error consumer at module-init (a drifted vendored asset must fail the BUILD, not be runtime-recovered → you'd unwrap-or-throw anyway, or silently drop rows). Cure = mirror the existing generator (`generate-course`): a `scripts/generate-*.ts` validates the closed sets at GENERATE time (fail-loud, eslint-zoned `scripts/`) and emits `*.generated.ts` whose `: readonly T[]` annotation IS the compile-time gate; the runtime module becomes pure typed data — no throw, no Result, ZERO consumer ripple. The type system enforces what the throw was faking. Pairs schema-first + generator-first-mindset. Reusable for any vendored-JSON no-throw item.

- **For visual-FIDELITY (§D) checks, deterministic Playwright at an EXACT CSS width beats interactive browser tools — it caught a real delta that gates + a "faithful match" missed.** Rendering a JS-hydrated Claude-Design `.dc.html` export: it FETCHES a data file, so `file://` CORS-blocks it → blank ("headless-blank" wall); cure = serve over local HTTP + Playwright `networkidle` + `document.fonts.ready`. Capturing a `next dev` page: use `waitUntil:'domcontentloaded'` NOT `networkidle` (the HMR websocket keeps networkidle from ever firing → timeout). CSS LAYOUT width ≠ PNG pixel dims (= width×deviceScaleFactor) — comparing wrap needs BOTH captures' CSS width; a Director "width artifact" dismissal was overturned by this geometry fact → a real hero max-width delta found + fixed. `getClientRects().length` on a block element = 1, NOT the line count — VIEW the pixels. The render tool became the team's "§D-tool-of-record".

- **Corroborations (verify-first, fired structurally not as vigilance): [[verify-own-explanations-against-full-source]] + [[gated-verification-beats-subagent-workflow-for-content-checks]].** Verified live registry state before reconciling a multiply-directed lane conflict (owner→me=data vs Director→me=styling) → the team self-resolved within 3 min, my flag would've been noise. Verified (a-already-in-Course vs b-net-new) first-hand before an owner-routed "pre-build the Framework content module" → it was (a) (the Oak Course TITLE "Designing high-quality explanation…" matched `framework-img.png`) → STOPPED a duplicate build. A negative needs a search capable of returning the positive (dead-code grep; viewing screenshots vs trusting a metric). Owner-directed idle-capacity work correctly framed "verify-first, no speculative build" prevented the waste.

- **Op friction:** `comms append/direct --body '<text>'` fails (exit 2) on bodies with backticks / brackets / `<>` / em-dash (shell-quoting) — use `--body-file <realfile>`. The all-channels watcher self-heals on its 3600s `timeout` backstop (exit 124) — re-arm on the Monitor exit-notification (the `--seen-file` cursor misses nothing).
