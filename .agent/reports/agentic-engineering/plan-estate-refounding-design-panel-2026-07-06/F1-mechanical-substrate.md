# F1 — Mechanical substrate for the Oak plan-corpus refounding

Facet owner: F1-mechanical-substrate designer (independent panel seat, PDR-123
shape). Designs ONLY the deterministic layer: the freeze rule, the denominator,
the scripted inventory, tiling arithmetic, byte-identity, batch/stable-point
structure, merge re-derivation, and the residue/orphan discrimination proof.
Where LLM reading or judgement begins, this design stops and names the
interface (F2/F3/F4/F5/F6).

Governing invariants honoured (from the ARC channel, treated as ground truth):
Basalt I1–I2, I4, I6 (verbatim tiling), I10 (gate contracts verified at author
time); Sulphur I1, I4, I5, I6. Kit items 1, 3, 4, 5, 9 land here directly.

All grounding below is first-hand, measured 2026-07-06 in this checkout.

---

## 1. Decisions

Each decision carries a warrant and a falsifier (the observation that would
overturn it).

### D1 — Every deterministic operation is a script; the mechanical layer spends zero LLM tokens

- **Decision.** Extraction nets, tiling proof, byte-identity, residue
  clustering, merge re-derivation, and batch bookkeeping are TypeScript
  programs in `agent-tools`. No worker subagent touches any of them.
- **Warrant.** Resonance measured this directly: 74 dispatches for 45
  extraction tasks, ~26 first-round rejections, 10 pulled in-session, workers
  "caught nothing the dispatcher missed", one fabrication, and the dispatcher
  recomputation was always the binding proof. Their fan-out was a live-session
  context-economics artefact with recorded reasons; a fresh run has no such
  constraint. At 618 files / 165,066 lines (37× resonance) worker extraction
  is not merely wasteful — the four-step full-set verification of ~600 worker
  replies would dominate the run. Kit item 1; Basalt Q1.1; invariant I1/I3.
- **Falsifier.** A content class the nets structurally cannot capture without
  interpretation (none identified: the nets capture verbatim lines, and
  interpretation is downstream by design).

### D2 — The freeze rule is a checked-in data artefact over surface CLASSES, never a per-file filter

- **Decision.** `refounding/freeze-rule.json` (see §2) enumerates surface
  classes with an `in`/`out`/`sweep` verdict and a recorded sub-reason for
  every non-`in` class (kit item 10 discipline). The freeze script consumes
  the rule; no script and no agent ever decides file-by-file.
- **Warrant.** Resonance named the subjective which-files-matter filter the
  single biggest conservation risk. Judgement is placed once — at rule
  authoring, owner-ratified (gate G1) — then mechanism executes (Basalt Q2:
  "judgement above the line, mechanism below").
- **Falsifier.** A surface discovered mid-run that holds conservable planning
  concepts and fits no declared class. The cure is a rule amendment (a new
  versioned rule + owner ratification), never an ad-hoc inclusion.

### D3 — One global freeze, one atomic commit, one denominator; batches are downstream

- **Decision.** The whole `in` set freezes in a single commit window
  (stable point S0): verbatim copies + manifest + denominator + inventory in
  ONE commit, staged by explicit pathspec. Batching (per plan area) applies
  to ledger/challenge work only, never to the freeze.
- **Warrant.** Every later loss claim divides by the same number. Per-batch
  freezing would let inter-batch drift open gaps the arithmetic cannot see.
  Freeze cost is trivial (~630 files, copy+hash in seconds), so there is no
  economy argument for staging it. Kit item 3 / invariant I6 demand the
  freeze and denominator be one atomic event.
- **Falsifier.** A live-lane coordination failure that makes a single commit
  window unobtainable (F4 owns the window; measured claim-registry practice
  at oak has run three concurrent seats without collisions, so this is
  expected obtainable).

### D4 — Denominator re-derivation runs at every merge and as a standing gate

- **Decision.** `refound-merge-recheck` recomputes the source set from the
  live tree per the freeze rule and diffs it against the frozen manifest
  after every merge of `main` into the working branch, and
  `refound-verify-freeze` (re-hash of every frozen byte) joins the
  `repo-validators:check` chain for the run's duration. Arrivals halt the
  affected batch at its next stable point until routed (§7).
- **Warrant.** Oak merges remediation branches to `main` daily; resonance's
  single post-freeze arrival was caught by an adversarial critic — i.e. by
  luck-shaped diligence. Recomputation catches it for free (kit 3, Basalt
  Q1.5). The standing re-hash is the freeze's read-only contract made
  mechanical rather than disciplinary (`validators-must-recompute`).
- **Falsifier.** None conditional — this is insurance priced at ~seconds per
  gate run; it earns its cost per Basalt's law (it recomputes rather than
  re-reads).

### D5 — Tiling is verified over EVERY line of every frozen text file, granularity-agnostic

- **Decision.** The tiling verifier checks that ledger block rows exactly
  cover all lines of all frozen text files — zero gaps, zero overlaps, block
  starts on anchor lines — but does not fix block granularity; block
  boundaries are survey-layer output (F2 hypothesis-grade, F3 challenged).
  Non-text and non-markdown files (38 exist under the `in` surfaces:
  `.json`, `.ts`, `.tsv`, `.txt`, `.yaml`) tile as single whole-file rows.
- **Warrant.** Resonance proved coverage mechanically and left correctness
  to the challenge layer — "coverage is proven, content is challenged". A
  granularity-agnostic verifier keeps that epistemic split clean and keeps
  the arithmetic pure (union-count parity + interval maths).
- **Falsifier.** A frozen file whose "lines" are ill-defined (e.g. a binary).
  Cure: the manifest marks it `inventory_mode: opaque` and byte-identity is
  its whole conservation obligation; the ledger still carries one row for it.

### D6 — Frozen copies (not a git tag) are the citation substrate

- **Decision.** Freeze materialises verbatim copies under
  `.agent/plans-refounding/archive/frozen-v1/…` (path segment `archive/`
  chosen deliberately — see §8 gate-contract note). Ledger rows, challenge
  briefs, and binding clauses cite `frozen path + line span`.
- **Warrant.** A git tag proves bytes but gives no in-tree surface that
  workers with file-scope-only tool grants can read, no target for a
  standing diff-gate, and no stable citation path. Frozen file+line
  citations never rot precisely because the files never change — this is
  the compatible reading of kit item 6 (line-number citations into LIVE
  documents rotted; citations into frozen ones cannot).
- **Falsifier.** Repo-size or gate-noise cost of ~167k committed lines
  proving unacceptable. (Prior: `.agent/plans-old-archive/` already carries
  571 files / 229,768 lines in-tree without incident.)

### D7 — Extraction nets never normalise; verbatim bytes or nothing

- **Decision.** Net output records each captured line's exact bytes plus a
  per-line digest. No trimming, no case-folding of captured text (matching
  may be case-insensitive; capture is verbatim), no de-duplication, no
  indentation repair. The two parallel status vocabularies and all ~30
  emergent `status:` values pass through untouched.
- **Warrant.** Basalt Q4.1 ("never normalise at extraction — the ledger
  conserves lines, not interpretations") and the measured worker-fidelity
  taxonomy: normalisation is judgement-leakage. Deterministic code can leak
  judgement too, via "helpful" cleaning; this decision forbids it at the
  contract level and the determinism test (§5) enforces byte-stable output.
- **Falsifier.** None — this is a conservation axiom (owner: "if they make
  judgements we lose information").

### D8 — Every detector proves it can fire before its zero is accepted

- **Decision.** The residue detector, the tiling verifier, the freeze gate,
  and the merge recheck each ship with a discrimination proof: a scripted
  mutation run (planted synthetic orphan; deliberately gapped/overlapped
  ledger fixture; a flipped byte in a frozen copy; a synthetic arrival) that
  must go red before any green from that tool is trusted. Proof transcripts
  are committed artefacts.
- **Warrant.** Invariant I4 both sides; resonance's design property 2 ("a
  zero from a detector that was never shown to fire is not a finding").
- **Falsifier.** None; the proofs are one-time scripted runs costing
  seconds.

### D9 — All scripts home in `agent-tools/src/refounding/`; all run artefacts home in `.agent/plans-refounding/`

- **Decision.** New module `agent-tools/src/refounding/` (sibling of
  `validators/`, `repo-check/`, `corpus-analysis/`), TypeScript ESM with
  colocated `*.unit.test.ts`, exposed as `agent-tools` package scripts and
  root scripts `agent-tools:refound-*`. Run artefacts (frozen tree,
  manifest, denominator, inventory, ledger, reports, run-state) are TRACKED
  files under `.agent/plans-refounding/` — never `tmp/`.
- **Warrant.** `agent-tools` is where deterministic repo-facing tooling
  already lives (repo-check, ten validators, the corpus-analysis
  instrument); `packages/*` is product surface and wrong for practice
  tooling. Tracked artefacts follow `important-state-not-in-temp-files`
  and make every stable point a committed, recomputable resume target.
- **Falsifier.** A ratified decision to generalise the substrate for the
  corpus-analysis instrument's reuse (then a shared `corpus-mechanical/`
  module could be the home; interface F6/Phase-0 owns that call).

---

## 2. The freeze rule — surface-class verdicts

`refounding/freeze-rule.json` (checked in at
`.agent/plans-refounding/freeze-rule.json`, versioned, owner-ratified at G1).
Measured sizes are first-hand, 2026-07-06.

| Surface class | Measured | Verdict | Recorded reason (kit-10 sub-reason) |
|---|---|---|---|
| `.agent/plans/**` (all files, ALL extensions) | 618 md / 165,066 lines + 20 non-md | **in** | The estate being refounded. No extension filter: extension filtering is a per-file judgement; the 20 non-md files (worklists, schemas, evidence tsv/txt) are plan-adjacent content and conserve by byte-identity + whole-file ledger rows. |
| `.agent/milestones/*.md` | 5 md / 363 lines | **in** | Intent-bearing plan-adjacent surface named by the brief; trivial cost; excluding it would need a reason where including it needs none. |
| `.agent/proposals/**` (all files) | 6 md / 1,398 lines + 18 non-md | **in** | Recorded proposals awaiting triage are exactly "conservable planning concepts"; the refounding's disposition machinery is their triage. |
| `.agent/plans-old-archive/**` | 571 md / 229,768 lines | **sweep** | Pre-relocated archive; already terminal-by-construction. Freeze source: no — (a) re-derivable from structure: it is already immutable-by-convention history with its own tree. Non-terminal concepts hiding in it are caught by the scripted Wave-0 sweep (§9); sweep hits promote via denominator amendment (§7). |
| `.agent/prompts/**` | 65 md / 11,894 lines | **sweep** | Live operational surface (session entry points); freezing would banner/perturb running-session tooling. Intent leakage is bounded and caught by the same sweep. Sub-reason (a): entry-point prose re-derives from the plans it points at once the new corpus lands. |
| `.agent/memory/operational/threads/**` | (record surface) | **sweep** | History records, not intent carriers; retirement never touches them (annotate, never rewrite — I12). Sweep catches plan-shaped intent parked in thread records. |
| `.agent/reports/**`, `.agent/research/**`, `.agent/evaluations/**` | — | **out** | Assessment inputs, not plans; the plans README already routes them as "not executable plans". Sub-reason (a): they are referenced BY plans; the ledger conserves the referencing lines, and the referenced documents stay live and untouched. |
| Everything else | — | **out** | Not a planning surface. Sub-reason (b)-adjacent: freezing non-planning surfaces would copy live doctrine/code out from under active lanes for no conservation gain. |

Schema (closed shape; unknown keys rejected — `strict-validation-at-boundary`):

```json
{
  "version": 1,
  "ratifiedBy": "<owner-gate record path>",
  "classes": [
    {
      "id": "plans",
      "globs": [".agent/plans/**"],
      "verdict": "in",
      "reason": "…"
    }
  ]
}
```

Denominator v1 (derived, to be recomputed by the script, not trusted from
this document): 629 md files / ~166,827 md lines / 38 non-md files across the
three `in` classes.

---

## 3. Artefact homes and schemas

```text
.agent/plans-refounding/
├── freeze-rule.json                  # D2; owner-ratified, versioned
├── archive/
│   └── frozen-v1/                    # verbatim copies, path-mirrored
│       ├── plans/…
│       ├── milestones/…
│       └── proposals/…
├── denominator.v1.json               # per-file {path, bytes, sha256, lines, inventory_mode}
│                                     #   + totals; THE number every proof divides by
├── inventory.v1.jsonl                # one record per captured line (§4)
├── net-diff.v1.report.json           # per-net unique captures (omission detector feed)
├── residue.v1.report.json            # anchored blocks + orphan candidates (§9)
├── proofs/
│   ├── freeze-identity.v1.json       # per-file source-sha == copy-sha at freeze time
│   ├── orphan-discrimination.v1.md   # planted-orphan transcript (§9)
│   └── detector-mutations.v1.md      # gapped-ledger / flipped-byte / synthetic-arrival transcripts
├── ledger/
│   └── <area>.ledger.jsonl           # F2/F3-produced block rows; F1 verifies tiling
├── amendments/
│   └── amendment-<n>.json            # denominator extensions (arrivals, sweep promotions)
├── sweep/
│   └── sweep-hits.v1.jsonl           # Wave-0 scripted hits (adjudication queue for F3)
└── run-state.json                    # batch registry; ALWAYS recomputed, never read as truth
```

`inventory.v1.jsonl` record (one JSON object per line, sorted by
`(file, line)` — the sort is part of the determinism contract):

```json
{
  "file": "plans/semantic-search/current/foo.plan.md",
  "line": 42,
  "nets": ["A", "C"],
  "text": "<exact bytes of the line>",
  "sha1": "<hex digest of the raw line bytes>"
}
```

`<area>.ledger.jsonl` row (produced by F2/F3; F1 owns only the fields the
tiling verifier reads, marked ▸; other fields are F2/F3 contract):

```json
{
  "block_id": "semantic-search-0417",
  "file": "plans/semantic-search/current/foo.plan.md",
  "line_start": 40,
  "line_end": 61,
  "disposition": "named-home",
  "home": "<stable destination id, F4 lane taxonomy>",
  "binding": "<frozen path + span cited as detail contract>"
}
```

▸ `block_id`, `file`, `line_start`, `line_end` are F1's verifier inputs;
`disposition` is read only to apply the whole-file rule for
`inventory_mode: whole-file` entries.

---

## 4. The scripted line-level inventory — extraction nets as deterministic code

Three deliberately overlapping nets, ported from resonance's classes to oak's
observed corpus shape. Each net is a pure function
`(filePath, lines) → capturedLineNumbers`; the union is the anchor set;
per-net sets are retained so set-differences surface single-net blind spots
(the "blind overlapping nets" omission detector, mechanised).

- **Net A — structure.** Heading lines (`/^#{1,6}\s/`); YAML frontmatter
  lines (everything between a leading `---` fence pair, inclusive); markdown
  code-fence lines (` ``` ` open/close — fences delimit content the other
  nets must not misparse, and fenced content is residue-clustered to its
  opening fence anchor).
- **Net B — rows.** List items (`/^\s*[-*+]\s/`, `/^\s*\d+[.)]\s/`),
  checkbox todos (`/^\s*[-*+]\s\[[ xX~-]\]/`), table rows (`/^\s*\|/`),
  definition-style key lines inside plan bodies (`/^\s*[A-Za-z_-]+:\s/` when
  outside code fences).
- **Net C — fixed keyword pattern.** Case-insensitive MATCH, verbatim
  CAPTURE, over a closed keyword list versioned inside the script:
  `status:`, `todo`, `next step`, `pending`, `blocked`, `depends`,
  `serves_`, `supersede`, `thread`, `gate`, `owner`, `decision`,
  `acceptance`, `definition of done`, `dod`, `follow-up`, `deferred`,
  `promotion trigger`. The list is judgement — authored once, ratified with
  the freeze rule at G1, frozen thereafter (rule-authoring is the placed
  judgement; per-line application is mechanical).

Non-goals, by contract: no interpretation of what a captured line MEANS
(F2/F3), no status normalisation (D7), no dropping of "trivial" matches.

Sizing arithmetic (prior-derived, recomputed at run time): resonance's nets
anchored 1,443 of 4,452 lines (32.4%). At 166,827 lines the anchor set is
~54,000 lines. Oak's corpus is heavier in frontmatter and tables than
resonance's, so treat 50–65k as the expected band; an anchor ratio outside
20–70% at run time is an automatic halt-and-inspect (net mis-fit signal, not
an error to push through).

---

## 5. Script catalogue

All scripts: `agent-tools/src/refounding/<name>.ts`, colocated unit tests,
built by the existing `agent-tools` tsc build, exposed as package scripts and
root `agent-tools:refound-*` aliases. All are idempotent, take no
network/git-write actions except where stated, exit 0 = proven / non-zero =
named failure with machine-readable report. Every path in every artefact is
repo-root-relative POSIX (`no-machine-local-paths`). Line = LF-split of raw
bytes; the repo's encoding gate already polices encodings.

| Script | Input contract | Output contract | Notes |
|---|---|---|---|
| `refound-freeze` | `freeze-rule.json`; clean working tree on the refounding branch | Frozen copies; `denominator.v1.json`; `proofs/freeze-identity.v1.json`. Self-check: re-hash every copy against its source before exiting; any mismatch = non-zero and NO partial commit | The S0 commit itself is staged by explicit pathspec and made by the operating agent, not the script (`stage-by-explicit-pathspec`; scripts do not commit) |
| `refound-verify-freeze` | `denominator.v1.json` (+ amendments) | Re-hash of every frozen file; fail on any diff, missing, or extra file under `frozen-*` | Joins the `repo-validators:check` chain for the run's duration (temporary entry, removed at retirement — a named step, not a lingering gate) |
| `refound-inventory` | Frozen tree + denominator | `inventory.v1.jsonl`, `net-diff.v1.report.json` | Deterministic: byte-identical output for identical input (unit-tested by double-run comparison); md files only; non-md recorded `inventory_mode: whole-file` in denominator |
| `refound-residue` | Frozen tree + inventory | `residue.v1.report.json`: anchored blocks + orphan candidates (§9 definition) | Zero orphans is accepted ONLY alongside a committed `orphan-discrimination` proof |
| `refound-plant-orphan` | Frozen tree (scratch copy in a temp workspace) | Mutation transcripts for `proofs/` | Plants (a) an anchorless preamble block, (b) a keyword-misspelt work line; asserts residue/net-diff go red on each; never touches the real frozen tree |
| `refound-tile` | `denominator` + all `ledger/*.ledger.jsonl` (or `--area <area>` subset) | Exact-tiling verdict: every line of every frozen text file covered exactly once; block starts on anchor lines; whole-file rows for non-text; first 50 violations with exact coordinates | Pure arithmetic; also ships a deliberately-gapped and a deliberately-overlapped fixture in its unit tests (D8) |
| `refound-merge-recheck` | Live tree + `freeze-rule.json` + denominator (+ amendments) | `arrivals.report.json`: files added/modified/deleted on `in` surfaces since freeze | Run after EVERY merge of `main` into the working branch and at every stable point; any arrival halts the affected batch until routed (§7) |
| `refound-sweep` | `freeze-rule.json` `sweep` classes | `sweep/sweep-hits.v1.jsonl`: verbatim hit lines for the fixed non-terminal marker set | Wave-0; hits are an F3 adjudication queue, never auto-promoted |
| `refound-banner` | Banner policy (F4-authored: wording, timing, target set) | Idempotent insert/remove of a marker block on live originals | Mechanism here, policy at F4; banners land AFTER freeze so frozen copies stay banner-free |
| `refound-batch-status` | `run-state.json` + all artefacts | Recomputed per-batch stage dashboard: for each area, which stable-point proofs currently PASS (freeze ⊂ inventoried ⊂ tiled ⊂ …) | Recomputes every claim by running the relevant verifier; `run-state.json` is a cache the tool overwrites, never a source (`validators-must-recompute`; F5 pattern applied to the run itself) |

Build order: `refound-freeze` + `refound-verify-freeze` first (nothing else
can run without a denominator), then inventory/residue/plant-orphan as one
tranche (the discrimination proof gates the inventory's acceptance), then
tile/merge-recheck/sweep/batch-status. `refound-banner` any time before its
policy needs it. Estimated build: ~10 small programs, 100–300 lines each,
reusing `core/repo-root`, `tinyglobby`, and the validators' CLI pattern; one
to two focused implementation sessions including tests and mutation fixtures.

---

## 6. Byte-identity — the proof set

Three layers, each cheap, each recomputable at any time:

1. **Freeze-time identity.** `proofs/freeze-identity.v1.json`: per file,
   `{path, source_sha256, copy_sha256, bytes}` with `source == copy`
   asserted by the script before exit. This is the committed equivalent of
   resonance's `diff` transcript, machine-readable.
2. **Standing gate.** `refound-verify-freeze` in the `repo-validators:check`
   chain: every gate run re-hashes the whole frozen tree against the
   denominator (+ amendments). The freeze's read-only contract is
   mechanical, not disciplinary.
3. **Mutation proof.** A scratch-copy run with one flipped byte must go red
   (transcript in `proofs/detector-mutations.v1.md`) before the gate's first
   green is accepted (D8).

Line-count identity rides the same artefact: `denominator.v1.json` records
per-file line counts; `refound-inventory` and `refound-tile` recompute and
cross-check them (a disagreement between hashing and line-counting layers is
a halt condition — it means an encoding or EOL surprise, which must be
understood, not absorbed).

---

## 7. Denominator amendments — arrivals and sweep promotions

The denominator is versioned and append-only. Two amendment sources:

- **Arrivals** (from `refound-merge-recheck`): a file added or modified on an
  `in` surface after S0. Routing (F3/F4 judgement, F1 mechanism): either
  (a) freeze the arrival — verbatim copy into `frozen-v1/…` under its
  mirrored path, an `amendments/amendment-<n>.json` entry with the same
  per-file identity proof, inventory extended by a scoped
  `refound-inventory --amend <n>` run — or (b) a recorded exclusion with a
  kit-10 sub-reason (e.g. a live lane's own in-flight plan, coordinated per
  F4's coexistence policy). A DELETED original is never an amendment problem
  (the frozen copy holds the bytes); it is recorded in the arrivals report
  for F3 visibility.
- **Sweep promotions**: an F3-adjudicated sweep hit whose file is promoted
  into the conservation scope. Same amendment mechanics.

All downstream arithmetic (tiling, loss checks) runs against
`denominator = v1 + all amendments`; the tiling verifier refuses to run if
any amendment lacks its identity proof. Amendments after a batch has closed
re-open ONLY that batch (the affected files name their area), never the run.

---

## 8. Gate-contract verification at author time (kit item 5, invariant I10)

Named pre-S0 step, executed once and recorded as a design fact, because two
of resonance's mid-run escalations were false beliefs about their own gates:

1. Place a sample frozen tranche (one area's copies) under
   `.agent/plans-refounding/archive/frozen-v1/` on a scratch branch and run
   the full `pnpm check`. Record every gate that fires on the verbatim
   copies.
2. Known-by-inspection facts to verify, not assume: `validate-markdown-links`
   scans `.agent/**/*.md` but ignores `**/archive/**` — the `archive/` path
   segment in D6 is chosen to ride that existing exclusion, verified not
   presumed; markdownlint, encoding, machine-local-paths, and
   blocked-content scans have their own inventories and any needed scoped
   exclusions for the frozen tree land IN the S0 commit with recorded
   reasons. Scoping a prose-style linter away from a verbatim historical
   archive is configuration of a check's intended inventory, not disabling a
   check; each exclusion is listed at owner gate G2 for visibility
   (`never-disable-checks` honoured by scope + disclosure, and the standing
   `refound-verify-freeze` gate polices the frozen tree far more strictly
   than the excluded linters would).
3. The secret scanner scans history: freezing copies of any file permanently
   adds those bytes to history. `refound-freeze` therefore runs the repo's
   secret scan over the source set BEFORE writing copies and refuses on any
   hit (a hit is an owner escalation, not a skip).
4. Dry-run every banner text and every planned literal replacement through
   the estate's validators before use (resonance's self-matching-probe
   lesson: instruction artefacts exclude themselves from their own probes by
   construction — concretely, every probe/sweep in this design excludes
   `.agent/plans-refounding/**` and `agent-tools/src/refounding/**` from its
   own scan scope by default).

---

## 9. Residue audit and the planted-synthetic-orphan discrimination proof

**Anchored-block definition (the unit definition critics must receive —
kit item 7).** For each frozen text file: an anchor is an inventory line
(union of nets). An anchored block is an anchor line plus every following
non-anchor line up to (exclusive) the next anchor or EOF. Lines before the
first anchor of a file form a `file-preamble` block. Fenced code content
clusters to its opening-fence anchor (Net A captures fences).

**Orphan candidate.** A residue block is an orphan candidate iff:
(a) it is a `file-preamble` block containing any non-blank line, or
(b) its non-blank line count exceeds a declared bound (default 25 — a prose
block that long with NO structural, row, or keyword line in it is exactly
the shape a net blind spot would take), or
(c) it belongs to a file whose anchor ratio is below a declared floor
(default 5% — a whole file the nets barely see).
The bounds are judgement, authored once, recorded in the script, ratified at
G1 with the nets.

**Adjudication.** Orphan candidates are an F3 queue with resonance's
disposition taxonomy (cure-by-amending-destination / owner-ruled-live /
register-routed / already-absorbed) — an orphan is a disposition candidate,
never an automatic loss. F1's obligation ends at deterministic detection and
the discrimination proof.

**Discrimination proof (`refound-plant-orphan`).** On a scratch copy of the
frozen tree:

1. Plant a synthetic anchorless preamble: a 30-line prose block containing
   work-bearing MEANING but no net-matching surface (keywords deliberately
   misspelt, no list markers, no headings) at the top of a real file.
   Assert: residue report gains exactly one orphan candidate at the planted
   coordinates.
2. Plant a single work line with a misspelt Net-C keyword inside an existing
   block. Assert: the line appears in residue (not inventory) and the
   per-net diff shifts by exactly one — proving the nets do not silently
   "almost-match".
3. Remove the scratch copy; commit the transcript to
   `proofs/orphan-discrimination.v1.md`.

Only after this transcript exists may a zero-orphan (or fully-adjudicated)
residue result be accepted — and the proof re-runs after any net or bound
change (a net edit invalidates prior discrimination proofs by definition).

---

## 10. Batch and stable-point structure for a multi-session run

Resonance ran ~17h wall for 1/37th of oak's line count, single-session by
owner ruling, with three ad-hoc stable-point handoffs. Oak designs the
stable points in (Basalt Q1.6). The exit criterion at every point is the
proof, never the clock (`no-speed-pressure` compatible by construction).

**Global stable points (each = one commit of recomputable artefacts):**

- **S0 — frozen.** Freeze rule ratified (G1); gate contracts verified (§8);
  atomic commit: frozen tree + denominator + identity proofs (+ any scoped
  gate exclusions). Standing gate live from this commit.
- **S1 — inventoried.** Inventory + net-diff + residue + BOTH discrimination
  proofs committed; anchor-ratio sanity band checked; orphan-candidate queue
  handed to F3. Wave-0 sweep output committed (it can run any time between
  S0 and S1; it does not gate S1 — its hits route via amendments).
- **S2 — tiled.** All 17 area batches closed (below); global
  `refound-tile` green over denominator v1 + all amendments; loss
  arithmetic complete. Downstream landings (authoring, repoint, retire) are
  F4/F6-owned phases consuming S2.

**Per-area batches (between S1 and S2).** Batch unit = plan area (17 areas;
measured md-file spread 122 / 92 / 65 / 53 / 40 / 36 / 36 / 29 / 21 / 19 /
18 / 16 / 13 / 13 / 13 / 6 / 6 / 4 / 4 / 4 + root-level files as their own
small batch). Batch ordering and the pilot area are F6's call (pilot-first
sizing per PDR-122 D4 suggests a mid-size area first, but that is F6's
design, not F1's). Each batch closes at a **batch stable point**:

1. `refound-tile --area <area>` green: every line of every frozen file in
   the area covered exactly once by that area's ledger.
2. Per-batch loss check: batch ledger row count + line coverage reconciled
   against the denominator's area slice; any arrival affecting the area
   routed (§7); `refound-merge-recheck` clean.
3. F2 verification and F3 challenge obligations for the batch discharged
   (their designs; F1 only records their PASS artefacts in the batch close).
4. One commit: the area ledger + reports. `refound-batch-status` then
   recomputes the dashboard from artefacts.

A failed per-batch loss check halts THAT batch (invariant I5); other
batches proceed — batches share no mutable state except the append-only
denominator, which is what makes parallel and multi-session execution safe.
Any fresh session resumes by running `refound-batch-status` and reading
recomputed truth, never prose.

---

## 11. Interfaces to other facets

- **F2 (worker layer).** Consumes `inventory.v1.jsonl` and frozen-tree paths
  as the ONLY reading substrate (workers never read live originals);
  produces ledger block rows conforming to §3's tiling-relevant fields.
  F1 guarantees: sorted, verbatim, digest-carrying inventory; stable frozen
  citations. F1 requires: block `line_start`/`line_end` land on frozen-file
  coordinates, blocks start on anchors.
- **F3 (judgement/error-correction).** Receives three deterministic queues:
  net-diff single-net captures (omission review), residue orphan candidates
  (disposition), sweep hits (promotion). Receives every halt signal
  (arrivals, anchor-ratio band, loss-check failure). F1's tiling verifier is
  the mechanical half of F3's per-batch loss check; F3 owns the semantic
  half (challenge). Independent recomputation of the tiling (resonance's
  critic recount) = F3 running `refound-tile` from a fresh context plus its
  own arithmetic spot-derivation — the script is shared, the fresh run is
  the independence.
- **F4 (intent layer/lanes).** Owns the S0 commit-window coordination with
  live lanes, banner policy (wording/timing consumed by `refound-banner`),
  the arrivals-routing policy for in-flight lane plans, and lane `home` ids
  the ledger's disposition rows cite. F1 provides the mechanism and the
  arrivals report.
- **F5 (recomputable state).** `refound-batch-status` is the run-scoped
  instance of F5's regenerate-and-compare pattern; F5's plan-state
  recomputation tool (kit item 9, build-first candidate) is a separate
  deliverable — F1 does not build it but its two-verdict probes consume F1's
  frozen citations and inventory digests. The standing freeze gate's
  temporary seat in `repo-validators:check` is coordinated with F5's gate
  additions so the chain grows coherently.
- **F6 (sequencing).** Consumes stable points S0–S2 as phase boundaries;
  owns batch ORDER and pilot-area choice; owns whether
  `agent-tools/src/refounding/` later generalises toward the
  corpus-analysis instrument (D9 falsifier). F1 commits to: no script
  behaviour depends on batch order.

---

## 12. Owner gates (F1-originated)

- **G1 — Freeze-rule ratification.** The surface-class verdict table (§2)
  with every exclusion's sub-reason, the Net C keyword list, and the
  residue-orphan bounds (§9). One sitting; these are the run's placed
  judgements and they freeze after ratification (changes = versioned
  amendment + re-ratification + re-run of discrimination proofs).
- **G2 — S0 landing sanction.** The atomic freeze commit's content preview:
  denominator totals, any scoped gate exclusions from §8 (each with its
  reason), the secret-scan-clean attestation, and the declared commit
  window (F4 coordinates the window; the owner sanctions the landing).
- **G3 — Amendment policy.** The arrivals-routing rule of §7 (what
  auto-freezes vs what needs a per-arrival ruling) ratified once, so
  mid-flight arrivals consume a table, not an owner interrupt each
  (batched mid-flight rulings per I11 remain available for the residue).

---

## 13. Open questions

1. Should the frozen tree live under `.agent/plans-refounding/archive/…`
   (riding existing `**/archive/**` gate exclusions, D6) or should the
   exclusions be made explicit per-gate even where the path segment already
   excludes it? Explicitness costs a few config lines and removes a silent
   coupling; §8's probe decides with evidence.
2. The ~20 non-md files under `.agent/plans/**` include a `.ts` fixture
   verifier (`sector-engagement/castr/verify-castr-fixtures.ts`) that may be
   EXECUTED by something. Whole-file conservation is safe regardless, but
   repoint/retire (F4/F6 phase) needs to know if any non-md frozen file has
   live consumers — the §8 probe should grep for invocations at S0 time.
3. Root-level `.agent/plans/*.md` files (README, high-level-plan) are
   navigation surfaces more than plans; they are `in` (mechanical rule — no
   per-file filter) but their ledger dispositions will be structure-shaped.
   Does F4 want a named `navigation-surface` disposition class? (F3/F4
   call; F1 flags it so the tiling of these files is not forced into
   content-shaped dispositions.)
4. Whether `refound-verify-freeze` joins `repo-validators:check` directly or
   via a new `refounding:check` aggregate that the chain calls once — a
   chain-growth style question for F5's coordination.

---

## 14. Rejected alternatives

- **LLM worker extraction (resonance's r2 mechanism).** Rejected on their
  own measured evidence (D1). Workers remain where reading is unavoidable —
  F2's layer — never in the mechanical substrate.
- **Per-batch or per-area freeze.** Rejected: breaks the single denominator;
  inter-batch drift becomes invisible to the arithmetic (D3).
- **Git tag / commit pin as the freeze (no copies).** Rejected: no in-tree
  citation substrate for file-scoped workers, no standing diff-gate target,
  no stable frozen line coordinates; history-only references rot against
  tools that scan the working tree (D6).
- **Sha-manifest-only freeze (hashes without copies).** Rejected: banner
  edits and live-lane changes to originals would leave cited line spans
  unreadable; conservation requires the bytes remain readable at their
  cited coordinates.
- **Freezing `.agent/prompts/**` and thread records.** Rejected with
  recorded sub-reasons (§2): live operational surfaces; sweep bounds the
  leakage at a fraction of the cost and zero operational disturbance.
- **Extension-filtered freeze (`*.md` only).** Rejected: an extension filter
  is a per-file judgement in disguise; 38 non-md files conserve by
  byte-identity + whole-file rows for near-zero cost (D5, §2).
- **"Returns nothing" acceptance probes.** Rejected per kit item 4: every
  probe in this design asserts a closed expected set (exact per-file
  hashes, exact coverage intervals, exact orphan coordinates in the
  discrimination proof), and every probe excludes the instrument's own
  artefacts from its scan scope by construction.
- **Normalising status vocabularies at extraction.** Rejected (D7);
  the versioned mapping table is F3/F5's placed judgement, applied by
  script downstream, never at capture.

---

## 15. Cost model sketch

**LLM tokens (F1 scope): ≈ 0 at run time.** The entire mechanical substrate
runs as deterministic code. Resonance spent ~1.3M+ subagent tokens on
verification waves whose binding proof was always dispatcher recomputation;
this design deletes that spend class and keeps the adversarial budget
(F3's) intact — precisely the kit's headline saving.

**Build cost (one-time):** ~10 small TypeScript programs plus unit tests and
mutation fixtures in an estate with established patterns to copy
(`validators/markdown-links` CLI shape, `core/repo-root`, `tinyglobby`).
Estimate: 1–2 focused agent sessions (order 10⁵–10⁶ tokens of implementation
work, comparable to one mid-size agent-tools feature), amortised across
every later corpus operation including WS6/WS7 of ADR-200.

**Run wall-clock (measured-scale arithmetic, ~630 files / ~167k lines):**

- freeze + hash: seconds (single-pass copy + sha256 of ~10 MB);
- inventory (3 regex nets, single pass): well under a minute;
- residue clustering + tiling verification: seconds (interval arithmetic
  over ≤55k anchors / ~8k expected ledger rows at resonance's 6.5
  lines-per-block prior — F2's granularity may differ; the verifier is
  indifferent);
- standing gate re-hash per `repo-validators:check` run: seconds, hundreds
  of times over the run — total minutes;
- merge recheck: seconds per merge, daily.

**Stable-point overhead:** S0 and S1 are each sub-hour sessions dominated by
the §8 gate probe and owner gates G1/G2, not by compute. Per-batch closes
add minutes of script time to whatever F2/F3 spend on the batch. The
substrate therefore contributes effectively nothing to the run's wall-clock
budget; the run's cost lives where it should — in F2's reading and F3's
adversarial challenge, priced by those designs.
