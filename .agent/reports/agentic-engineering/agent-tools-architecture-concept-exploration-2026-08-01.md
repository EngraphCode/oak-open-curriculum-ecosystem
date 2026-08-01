# Agent-tools architecture: present-system concept exploration

**Date:** 2026-08-01

**Author:** Possum turns Nocturne (`019fbc`)

**Status:** Initial, lull-bounded concept exploration; evidence and candidate
experiments, not a target-architecture decision

**Evidence baseline:** `origin/main` at `222db4e547bc` unless a different source is
named

## Review contract

This report conserves the current architecture exploration so that later work can
start from evidence rather than reconstructing the session. Review should test four
questions:

1. Does the problem frame explain the observed failures better than a package-size
   or ADR-compliance frame?
2. Are present-system merits, counter-evidence, and historical intent represented
   fairly?
3. Does every candidate action carry both a warrant and a condition that would
   reduce or defeat it?
4. Are findings, free-play associations, decisions, and unresolved questions kept
   distinct?

The evidence standard is current source and live operational evidence where
available. Dated ADRs, PDRs, and earlier reports establish trajectory and prior
reasoning, not present correctness. This report does not authorise a package split,
schema relaxation, compatibility migration, doctrine amendment, or implementation
ticket. Successful review either accepts the frame as a useful basis for the next
experiment or identifies the specific missing evidence or contract mismatch.

## Executive synthesis

`agent-tools` presently looks more like a **modular control-plane monolith** than an
undifferentiated tooling directory. Its domain modules commonly have strict boundary
parsing, pure decision seams, guarded writes, and substantial tests. The strongest
problems observed in this pass cluster at boundaries between otherwise coherent
parts:

- the generation of code a process is executing is not observable;
- command lifecycle and activation classes exist, but are mostly implicit;
- authoritative surfaces and their derived projections are not always identified or
  mechanically connected; and
- mixed-generation recovery is explicit on some runtime surfaces but not on the
  append-only comms event stream.

The present gap is therefore not primarily physical module decomposition. It is that
operators and validators cannot always tell **which internally consistent world they
are observing**, which lifecycle contract applies, or which representation is the
authority. The worked consequences range from false health output (fixed in PR
#683) and documentation/help drift to a live coordination branch that was internally
consistent but generated from an older parser generation.

Success would mean making generation, lifecycle/recovery class, and
authority/projection relationships explicit enough to diagnose and test—without
flattening legitimate differences or splitting the package before change-cost or
bootstrap evidence justifies it.

## Scope and evidence bounds

This was a slow review performed in available lulls, not an exhaustive architecture
audit. The current snapshot contains:

- 869 TypeScript/TSX files under `agent-tools/src`;
- 94 package scripts;
- 9 scripts invoking the built unified CLI directly;
- 72 scripts containing a `tsx` invocation; and
- 7 build-first scripts matching the current `pnpm build && ...` family.

Those counts describe surfaces, not architectural quality. I inspected representative
activation, bootstrap, health, help, collaboration-state, hook-policy, protocol-wire,
and report/decision paths. I did not inspect every script or calculate the complete
module dependency/change-coupling graph. The coordination checkout and the
`origin/main`-based report worktree were not always on the same generation; claims
below name live evidence separately where that matters.

## Findings

### 1. Mixed activation is partly designed, not simply inconsistency

The June 29 architecture handoff correctly observed multiple execution shapes, but
its implication that the shapes lacked any architectural explanation no longer
stands without qualification.

Three present activation families are visible:

1. a built unified CLI snapshot (`node agent-tools/dist/src/bin/agent-tools.js`);
2. direct source execution through `tsx`; and
3. build-on-invocation commands.

There is a strong reason for the first family. Identity, collaboration, commit-queue,
context, and similar hot multi-agent tools bind to a built snapshot so an in-flight
source edit cannot change identity or coordination behaviour mid-session. The rule
in `.agent/rules/use-built-agent-tools-cli.md` records the worked incident behind
that choice. Hook runtimes make the same stability trade: `.agent/hooks/README.md`
names their prebuilt activation and explicit freshness guarantees at install and
commit time, together with safe failure semantics.

Most source-live `tsx` entries are one-shot validators or planning instruments, for
which immediate current-source behaviour is useful. That is a real lifecycle
difference, not automatically architectural debt.

The problem is that the lifecycle classes remain implicit and the boundaries have
exceptions. `claude-agent-ops`, `cursor-session-from-claude-session`, and
`codex-reviewer-resolve` are operational tools but run from source. In particular,
`claude-agent-ops health` can diagnose built infrastructure while the health process
itself is current source. The broad built-CLI rule names `claude-agent-ops` as built,
while its package script is currently `tsx`. This is interesting drift between
intent and system, but the verdict must come from the operational consequences—not
from rule non-conformance alone.

### 2. Runtime generation is not observable enough

The unified CLI's `--log-json` lifecycle record identifies `surface`, `event`,
`topic`, and completion status, but not source/build generation. The package is
private and fixed at version `0.1.0`, so its package version is not a useful runtime
identity. A clean build, dirty source, and a process already bound to an older build
can therefore each be internally coherent while describing different worlds.

A live instance supplied by Badger on 2026-08-01 makes this concrete (comms event
`8eebc08e-e024-481c-bfcd-b6455fcb631d`):

- a coordination branch had been cut before PR #682;
- its source, `dist`, and rendered read model were internally consistent on the
  pre-#682 generation (`459fd1`);
- the post-#682 checker regenerated with token format `459fd1-425`;
- the decisive byte comparison changed only token suffixes;
- no events landed during that run (`4402 == 4402`); and
- the post-#682 parser successfully read all 4,402 events.

The instance was cosmetic because the event files themselves had not changed. It is
still strong evidence for a visibility defect: the old world was green and
internally consistent, and current tooling could only distinguish the worlds by
regeneration and byte comparison. A future event-format change could make the same
shape behavioural.

### 3. Authority/projection drift is a recurring seam

The right model is not “put every list in one registry”. Policy allowlists,
executable handler registries, package aliases, help text, and explanatory prose can
have different authorities. The useful distinction is between an authoritative
choice and a derivative inventory that should be generated or validated against it.

Current examples:

- top-level unified help lists 11 topics but contains no example, while the hard
  help contract in `agent-tools/README.md` requires at least one example at every
  depth;
- the topic inventory is restated in the handler registry, `usage()` output, and
  exact tests;
- the README's unified-entrypoint paragraph names five built thin shortcuts, while
  current package scripts also include built `session-metadata`, `pr-watch`, and
  `codex-exec` shortcuts;
- the built-CLI rule says `claude-agent-ops` is a built shortcut while the package
  script runs source through `tsx`; and
- bootstrap TSDoc says `agent-tools` imports two workspace packages, while
  `WORKSPACE_DEP_DIRS` and the package manifest include three, adding
  `@oaknational/type-helpers`.

The repository already contains a better local pattern: the Codex team-alert
bootstrap has a canonical source, marked generated projection, and check. That
pattern suggests selecting authority per surface and mechanically constraining only
its true projections, rather than inventing a universal registry.

### 4. Bootstrap exposure is plausible, but no current performance defect is proven

Root `postinstall` builds the whole `agent-tools` source closure—currently 869
TypeScript/TSX files—plus three workspace dependency closures. As the package grows,
this expands the code exposed to install-time type/build failure.

Counter-evidence matters. The previously observed cold-install failure involving
`type-helpers` was fixed, the latest delivery passed CI, and this pass did not measure
an unacceptable cold-bootstrap time or failure rate. “The package is large” and
“postinstall compiles many files” do not prove that a minimal bootstrap or package
split would repay its complexity.

### 5. Compatibility should follow lifecycle, not one global strictness rule

Canonical comms events are parsed by strict Zod objects at exact schema version
`2.0.0`. `readEventFiles` reads names in stable order and throws on the first parse or
JSON-schema validation failure. Consequently, one incompatible event prevents that
reader from returning later events in the same unseen batch. Long-running watchers
and newly invoked writers can coexist across builds, so an old-reader/new-event cell
is structurally possible.

This does **not** support blanket schema loosening. Other surfaces make strictness and
recovery explicit:

- the watcher heartbeat is deliberately strict at pre-stable version `0.2.0`; a
  changed contract requires watcher re-arm; and
- the protocol-wire validator accepts the older `0.1` and newer `0.2` within-family
  shapes where compatibility is part of the contract.

The comms directory is an ignored, machine-local, append-only operational signal,
not durable storage. Its relevant requirement is backlog continuity across
coexisting processes during a team session. The unresolved architectural question
is which compatibility/recovery contract meets that requirement: version band,
migration, quarantine, loud re-arm, or another shape. The present evidence establishes
the failure mechanism, not the answer.

The July 30 succession/conscience exploration provides dated corroboration: its live
deployed-path probe found an old-reader/new-event cell that the rebuild-everything
test frame could not represent. That report is evidence of the mechanism's
recurrence, not proof that one particular compatibility policy follows.

### 6. Comms-event schema authority is ambiguous

`collaboration-state/schemas/comms-event.schema.json` describes itself as the
“Single source of truth”. `state-schemas.ts` separately defines the event shape in
Zod, and `types.ts` separately declares the TypeScript interfaces. Read/write paths
exercise both the Zod parser and AJV JSON-schema validation. Unlike the collaboration
identity schema, whose Zod authority is reused, no generator or structural parity
check was found for the event shape in the inspected paths.

No drift instance was proven between the three event representations in this pass.
The finding is narrower: authority is claimed but not mechanically evident, so the
same projection-discipline question applies here.

### 7. PR #683 is a worked boundary failure, not a package-shape failure

The `claude-agent-ops health` false report fixed in PR #683 joined repository root
directly to each Codex adapter `config_file`, although those values are relative to
`.codex/config.toml`. The fix reused the canonical resolver, preserved absolute-path
behaviour, introduced a pure decision seam, and landed in release `1.132.1`.

That incident is already durably recorded by the PR, merge, and release, so this
report does not duplicate its implementation ledger. Architecturally, it is useful
because a healthy domain implementation failed at a path-authority seam. It supports
the present frame more directly than it supports package decomposition.

## Historical decisions as trajectory, not verdict

PDR-035 and ADR-165 (2026-04-28) described the Practice-capability/repository-
phenotype boundary. The present machine-local, ignored collaboration state is not
necessarily bad drift from their point-in-time shape; ADR-165 explicitly anticipated
local operational state moving while preserving the authority boundary.

PDR-064 and PDR-066 already recognised that a new comms event kind entails reader
compatibility and migration work, and deliberately used existing narrative events
and tags where that cost was unwarranted. That choice explains the current trajectory
and is evidence that compatibility was considered. It neither proves that exact
`2.0.0` batch-abort behaviour is correct today nor makes later evolution a failure.

The June 29 agent-tools handoff similarly remains valuable dated evidence. Its
observations about invocation, errors, and dependency shapes still reproduce. Its
invented “build-free class” was already corrected in that report, and the current
system now exposes a stronger explanation for the built/source split. This report
therefore carries the earlier signal forward without inheriting its framing.

## Free-play harvest: associations, not findings

These associations were useful for generating tests and frames. They are explicitly
not evidence:

- **Kept association — operating-system distribution:** the system resembles a
  distribution of operational programs more than one user-facing CLI. Release and
  activation semantics may therefore matter more than physical directory shape.
- **Kept association — distributed split brain:** observer and observed tooling can
  inhabit different, internally consistent generations. This suggests testing a
  capability/generation handshake.
- **Kept association — documentation drift and schema drift rhyme:** both may be
  unmanaged projections of an ambiguous authority. The rhyme is a search heuristic,
  not proof of a single mechanism.
- **Kept association — poison-pill queue:** strict batch abort resembles a poison
  message stopping later delivery. Comms is not a durable queue; the association is
  retained only because it points at recovery and cursor tests.
- **Discarded association — “turn agent-tools into microservices / split it now”:**
  this was forced. Current module cohesion and the lack of measured bootstrap or
  change-coupling cost contradict making it a recommendation.
- **Discarded association — “869 compiled files means postinstall is bad”:** file
  count is an exposure proxy, not a performance or reliability result.

## Candidate next experiments

Each item is a proposal to acquire decision-quality evidence, not an accepted
workstream.

### A. Minimal runtime-generation probe

**Proposal:** prototype a build manifest or content digest and expose it through
help, lifecycle logs, and/or health output. A git SHA alone is probably insufficient
because source can be dirty or uncommitted.

**Warrant:** the live pre-/post-#682 case could not identify generation without
regeneration and byte comparison.

**Falsifier:** if every relevant process is demonstrably lifecycle-bounded and
restart-safe, and current generation is already cheaply observable through a surface
missed in this review, this drops in priority.

### B. Command lifecycle/activation inventory

**Proposal:** classify command entry points by operational lifetime, stability need,
source freshness need, recovery mode, and actual activation. Select authority per
class, then derive or validate only the genuinely derivative help, alias, Knip, and
bootstrap inventories.

**Warrant:** the current exceptions and documentation drift cannot be assessed
reliably without knowing whether each command is a long-lived control-plane surface
or a disposable validator.

**Falsifier:** if the reproduced mismatches are isolated documentation errors and a
small targeted validator prevents recurrence, do not create a broad metadata
registry.

### C. Mixed-generation comms trial

**Proposal:** preserve an old reader, write a deliberately newer compatible and/or
incompatible event, then measure failure visibility, re-arm behaviour, cursor
continuity, and delivery of following events.

**Warrant:** current code aborts a sorted unseen batch on the first incompatible
event, and deployed-path evidence shows rebuild-all tests can miss this cell.

**Falsifier:** a controlled run showing that mismatch always fails loudly, re-arms
immediately, preserves position, and delivers all subsequent events inside the
accepted operational bound would reduce the need for a compatibility band or
migration mechanism.

### D. Cold-bootstrap and change-coupling measurement

**Proposal:** measure cold bootstrap duration/failure contribution and module-level
dependency/change coupling before considering a minimal bootstrap or package split.

**Warrant:** the source closure is large and install-exposed, but no actual cost was
measured.

**Falsifier:** stable, cheap bootstrap plus cohesive change patterns makes structural
extraction low priority.

### E. Coordination-fold generation rider

**Proposal:** route the live pre-/post-#682 evidence to the owner of coordination
folding so successor-branch timing, rebuild, and re-render expectations can be made
explicit.

**Warrant:** the older coordination branch was valid on its own generation but could
not assert current-generation equivalence.

**Falsifier:** if the existing fold procedure already proves source/build/render
generation after incorporating main, the evidence belongs as a verification example
rather than a new rule.

## Decisions deliberately not made

- No package or service split is recommended.
- No command should be moved from built to source-live execution, or the reverse,
  without its lifecycle class.
- No comms schema should be loosened, version-banded, migrated, or quarantined yet.
- No generic “single registry” is proposed.
- No ADR, PDR, rule, plan, or implementation ticket is amended by this report.

The standing promise is to continue the slow review only in genuine lulls and to
promote later findings when they become decision-complete. Director Falcon hunts
Flight (`52841f`) owns routing into delivery or doctrine if an experiment survives
concept exploration.

## Unresolved evidence and blind spots

- cold-bootstrap duration and attributable failure rate;
- a complete dependency-cycle and change-coupling view across major modules;
- whether a generation manifest exists outside the searched paths;
- a controlled old-reader/new-event run with a following-event assertion;
- whether an unobserved check already guards top help or README inventory parity;
- the intended lifecycle and release expectation for every operational source-live
  CLI;
- the exact coordination-fold guarantee for main changes that land after branch cut;
- surfaces outside the representative paths inspected in this lull-bounded pass; and
- future findings that have not yet survived disconfirmation.

## Conservation and metaloss audit

The first conservation pass found two omissions in the initial outline:

1. the ignored live event corpus would not survive rotation, so the decisive Badger
   evidence is reproduced above with its event id and decision-complete substance;
2. the June 29 and July 30 reports needed explicit relationship statements so a
   future reader would neither discard their evidence nor mistake it for current
   truth.

After adding those items, a second pass over findings, counter-evidence,
associations, discarded associations, promises, ownership, historical records,
unresolved questions, and operational evidence found no new loss class. This is a
fixed point for the material examined, not a claim that the architecture exploration
is complete.

## Evidence map

- Current implementation: `agent-tools/package.json`, `agent-tools/src/bin/`,
  `agent-tools/src/bootstrap/bootstrap.ts`,
  `agent-tools/src/collaboration-state/`, and `.agent/hooks/README.md`.
- Current contracts and explanatory mirrors: `agent-tools/README.md` and
  `.agent/rules/use-built-agent-tools-cli.md`.
- Earlier architecture state:
  `.agent/reports/agentic-engineering/agent-tools-architecture-state-and-check-encoding-handoff-2026-06-29.md`.
- Deployed-path compatibility corroboration:
  `.agent/reports/agentic-engineering/succession-and-conscience-concept-exploration-capture-2026-07-30.md`.
- Historical trajectory: PDR-035, PDR-064, PDR-066, and ADR-165.
- Worked health-probe cure: PR #683, merged as
  `6f79e4fa441641b62a81c2fb70577066aa322c17`, released in `1.132.1`.
- Live generation-skew evidence: comms event
  `8eebc08e-e024-481c-bfcd-b6455fcb631d`, whose load-bearing facts are conserved
  in this report because the event store is machine-local.
