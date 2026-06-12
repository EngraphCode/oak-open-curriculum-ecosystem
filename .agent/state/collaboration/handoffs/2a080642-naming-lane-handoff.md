# Mid-Cycle Handoff: Agent Naming Lane (claim 2a080642)

- **Retiring agent**: Swift Gliding Zephyr / claude / claude-fable-5 / `aba87a` /
  `5cad9c4d-8c71-583b-ad1c-7b0d7c2cea04` — pinned tuple per Director
  supersession event `10cb3a10`. The owner-facing roster renders this same
  seed as **"Harrier weaves Stratosphere"** (v2-era projection). One agent,
  one UUID, two renderings; that duality is the P1 below.
- **Successor (owner-named)**: Moss weaves Blossom / claude / Fable 5 /
  `10438c` / `abcbaa34-d804-5ed4-bd5e-f7d15a69674f`.
- **Claim**: `2a080642-1aef-4372-8498-7cfe2de3e3d7` (thread `agent-tooling`),
  retained for successor pickup; `handoff_record_path` points here.
- **Date**: 2026-06-11. Director: Firefly seeks Temper (`ce44ae`); governing
  events: `a8bb77fd` (directives), `92e8a48d` (merge verdict, partly
  superseded), `10cb3a10` (supersession: P1 ruling + merge withdrawal),
  follow-up routing event of 21:25:25Z.

## 1. Current edit state

- **Branch**: `feat/better_agent_naming`, HEAD `6056d48b2` (napkin entries
  commit). **Remote is one commit behind at `d5a2b1a02`** — the push of
  `6056d48b2` FAILED in the pre-push hook (failure surfaced after the
  origin/main merge abort; `.turbo/last-gate.log` shows no turbo failure, so
  suspect a non-turbo pre-push step — likely markdownlint/fitness over the
  napkin. Reproduce with `git push` and read the full hook output; fix at
  root, never `--no-verify`).
- **Working tree**: clean except `.agent/state/collaboration/active-claims.json`
  (live registry — never PR material) and untracked comms/comms-seen files
  (coordination substrate).
- **Merge state**: my `git merge origin/main` attempt was ABORTED cleanly
  (`git merge --abort`; no `MERGE_HEAD`). The napkin conflict markers Dusky
  and Cosmos observed were transient working-tree state from that attempt and
  no longer exist. **Dusky Passing Mist's napkin/continuity sections were
  never at risk** — they live in commit `6671bc6bb` on this branch.
- **ENOENT comms files** (`092eb5ba…`, `33cb52c2…`, flagged by Director):
  explained — the merge attempt materialised main-side comms event files into
  the working tree; the abort removed them again; watchers mid-drain saw them
  vanish. No data loss: both exist in `origin/main` history. The Director's
  post-merge integrity sweep should confirm once the real merge lands.
- **PR #189**: OPEN, all six checks GREEN at `d5a2b1a02` (SonarCloud included,
  after the `.sonarcloud.properties` exclusion — note Automatic Analysis does
  NOT read `sonar-project.properties`; both files now carry the
  owner-authorised wordlist exclusion). **Merge is blocked only by semantic
  conflicts vs main** (recipes in §4) **and by the Director's diagnosis gate**
  (§2). Self-merge authorisation was withdrawn (owner: "there is no default");
  the merge is yours, gated on §2 locating the defect.

## 2. Successor's FIRST claimed task (Director-ruled P1): single-valued identity

**Required outcome**: deterministic single-valued identity resolution — one
seed, exactly one name, enforced.

Evidence frozen (all verified first-hand this session):

- **Mechanism of the split**: platform SessionStart hooks derive the display
  name once and cache it in `OAK_AGENT_IDENTITY_OVERRIDE` alongside the seed.
  My session pre-dates v2 activation, so my cache holds the v1 rendering
  ("Swift Gliding Zephyr"); any fresh derivation of the same seed yields the
  v2 rendering ("Harrier weaves Stratosphere", proven via
  `OAK_AGENT_IDENTITY_OVERRIDE= pnpm agent-tools:agent-identity`). The fork
  point: I displayed the v2 rendering as an activation proof; it was adopted
  as the roster handle while comms/claims kept the cached name.
- **The deeper datum (Director-supplied, confirmed on three tuples including
  the successor's own)**: fresh post-activation sessions ALSO record
  `naming_schema_version: "override"` — because the hook cache routes every
  session's name through the override channel, the provenance field never
  records a true era on hook-wired platforms. The ADR-195 provenance substrate
  is mis-recording on the happy path.
- **Defect location hypothesis (verify first-hand)**: NOT in PR #189's
  registry/derivation (era reproduction is test-pinned and correct) but in the
  session-cache channel design — pre-existing, exposed by the era transition.
- **Cure direction (designed, not implemented)**: hooks pin the ERA, not the
  name (`OAK_AGENT_NAMING_SCHEMA_ID=<active-at-session-start>`); the CLI
  derives through the pinned era so provenance comes out true; every
  display surface renders through the tuple's recorded era, never by fresh
  re-derivation under the active era. `override` returns to meaning only
  operator-assigned names. Touch points: `agent-tools/src/{claude,cursor,codex}/
  session-identity-hook.ts`, `bin/agent-identity-cli*.ts`,
  `collaboration-state/identity.ts`, statusline.
- **Owner context (from successor's own chat, per their event of 21:26Z)**:
  the owner is exploring alternative name shapes (possible v3). The versioned
  registry makes that cheap; the P1 cure is shape-agnostic.

## 3. Decisions made (the landed arc)

PR #189 contains, one commit per cycle, all reviewed: the digest-pinned
naming-schema registry (v1 frozen + reproducible; ADR-195 in-branch); v2
noun-verb-noun activation (owner-approved wordlists 2026-06-11; era snapshots
pin both schemas byte-identically); optional `naming_schema_version` on the
identity tuple (derivation factories stamp it; address relays omit it;
absence reads as v1 via `namingSchemaVersionOf`; canonical JSON schemas
updated); curation gates as data-driven tests; adversarial review amendments
(`4159dedb6`); Sonar exclusion (policy-amended, owner-authorised,
`f5e9038f6` + `d5a2b1a02`). Four reviewer verdicts adjudicated; two findings
refuted with grounding (knip-rejected barrel re-export; registry-as-material-
surface in tests).

## 4. Decisions deferred / remaining work (ordered)

1. **P1 identity diagnosis + cure** (§2) — your first claimed task.
2. **ADR RENUMBER (must precede merge)**: main took ADR-195
   (`195-graph-tools-first-class-tool-category.md`) and also has 196 + 197.
   Renumber my `195-naming-schema-versioning-digest-pinned-registry.md` →
   **ADR-198** (verify free at merge time): `git mv`, retitle, update every
   reference — grep `ADR-195\|195-naming-schema` over: ADR README (my index
   entry), `agent-tools/docs/agent-identity.md`, `docs/governance/
   sonar-disposition-policy.md`, `sonar-project.properties`,
   `.sonarcloud.properties`, the plan file, `agent-tools/tests/agent-identity/
   schema-registry.unit.test.ts` (comment), napkin entries. Commit messages
   stay as history.
3. **Semantic merge of origin/main** (NEVER line-merge; owner directive,
   memory `feedback_memory_state_merge_semantically`). Conflicts and recipes:
   - `.agent/memory/active/napkin.md` (2 hunks): UNION — keep ours (Dawnlit
     wave-2 + Fruited 2026-06-09 + my entries, incl. Dusky's `6671bc6bb`
     sections verbatim) AND theirs (main's "Carried forward" header + 53-line
     block). Conserve every entry; consolidation dedupes later.
   - `.agent/memory/operational/repo-continuity.md` (2 hunks): KEEP OURS both
     times — Dusky's 19:45 handoff state is fresher than main's #187/#188.
   - `.agent/memory/operational/threads/eef.next-session.md` (2 hunks): take
     THEIRS (main's 485-line evolved record) and INSERT ours' unique Dawnlit
     2026-06-11-evening block at the top of the session list; identity table =
     union of rows.
   - `.agent/state/collaboration/closed-claims.archive.json` (6 hunks): do NOT
     resolve hunks textually — parse both full sides (`git show :2:<path>`,
     `:3:<path>`), union the `claims` arrays by `claim_id`, write valid JSON
     (validator runs at commit).
   - `docs/architecture/architectural-decisions/README.md` (1 hunk): keep
     BOTH sides' entries — theirs (195-graph-tools, 196, 197) then mine
     renumbered to 198.
4. **Pre-push failure on `6056d48b2`** — diagnose via `git push` output; fix
   at root; push.
5. **Merge PR #189** (after 1–4; Director gate satisfied; fresh
   `gh pr checks` green at merge time; merge-commit method; no
   `--delete-branch` while the shared checkout sits on the branch).
6. **Post-merge**: plan → `archive/completed/` + completed-plans index row;
   consolidation pass (`/oak-consolidate-docs`); era-pinning follow-up plan if
   the P1 cure lands as its own cycle set.

## 5. In-flight reasoning worth carrying

- The per-theme wordlist files are pure data; their CPD "duplication" is a
  literal-normalisation artefact — the cross-theme disjointness curation test
  is the real anti-duplication gate. Never "fix" by merging the files.
- The wordlists froze at activation (digest pin): ANY word change is a v3
  entry, never an edit — including the owner's possible aesthetic redesign.
- Shared-checkout discipline that failed me twice: `git add` is pathspec-
  scoped but `git commit` takes the whole index — verify
  `git diff --cached --name-only` against your intended bundle immediately
  before EVERY commit (commit `3de15f01a` absorbed a peer's 4-file bundle;
  flagged in the PR body).
- Lane gate state: 1,013 tests green at `d5a2b1a02`; full pre-push chain green
  at that commit (the only later commit is the napkin one).

## 6. Shared-checkout disposition at retirement

`feat/better_agent_naming` and the primary checkout pass to **Moss weaves
Blossom** (this record's successor), under the Director's routing. No merge
in progress; no source files dirty; active-claims.json carries the live
registry including claim `2a080642` for pickup.
