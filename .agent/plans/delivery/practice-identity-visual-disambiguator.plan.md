---
id: practice-identity-visual-disambiguator
node_type: delivery
name: "Identity visual disambiguator: first6-last3 display field beside the session-id prefix"
overview: "Add a derived visual_disambiguator field to the PDR-027 agent-identity block so seats started in the same UUIDv7 time window stay human-distinguishable, without changing the session-search prefix or the derived-uuid anchor."
status: sketch
ratified_by: null
ratified_date: null
ratified_where: null
serves: first-major-release
impact_areas:
  - practice-and-estate
tickets: [MCP-145]
depends_on: []
owner_gates: []
last_updated: 2026-07-24
---

# Identity visual disambiguator

Owner-directed 2026-07-24 (working session with Deimos tracks Perigee,
73e4ab): "we are going to need this enhancement in OCE", and, on its
placement: condoned into the first-major-release subtree as a
**low-priority, non-blocking** step — it "removes a minor friction to
allowing Codex instances to contribute to the work, and we absolutely
need that perspective for the OpenAI work". Priority and scheduling live
on the Linear ticket, minted at pickup (required before ratification);
born sketch per the estate contract.

Amendment (owner-ruled via Director card, 2026-07-24): the
disambiguator tail derives from the UUIDv5 anchor `id`, not from the
session-id string's own tail — the originally pinned session-id
derivation is not total over the supported seed shapes and rested on
unverified vendor `rand_b` behaviour. Visible format and the
glance-distinction goal are unchanged. See §Mechanism item 2 and
§Warrant.

## Goal

Two agent seats whose session ids share the 6-character
`session_id_prefix` are distinguishable at a glance on every
human-facing surface (comms renders, registry rows, sign-offs, log
lines), while `session_id_prefix` keeps its current value and jobs
(session-store search key; PDR-125 cross-estate join key) and the
UUIDv5 `id` keeps its job (the collision-proof anchor). Today that glance-distinction does not
exist: on 2026-07-24 two Codex seats started 90 minutes apart (Pegasus
wakes Redshift, then Lupin turns Xylem) both derived prefix `019f93`,
because Codex thread ids are UUIDv7 and the first 6 hex characters are
purely the high bits of a millisecond timestamp.

## Warrant (the collision arithmetic)

UUIDv7 ids begin with 48 bits (12 hex chars) of Unix-epoch
milliseconds; each hex position of prefix divides the collision window
by 16:

| Prefix length | Timestamp bits | Collision window            |
| ------------- | -------------- | --------------------------- |
| 6 (current)   | 24             | ~4.66 hours                 |
| 8             | 32             | ~65 seconds                 |
| 12            | 48 (all)       | 1 ms                        |

No timestamp-only prefix can guarantee uniqueness: the estate
deliberately forks fleet siblings that can start in the same
millisecond, where even all 12 timestamp digits collide. Session-id
tail characters are NOT a sound entropy source either: seeds are
arbitrary non-empty strings on some platforms (not hex, not
UUID-shaped), and RFC 9562 permits conforming UUIDv7 generators to
fill `rand_b` with monotonic counter material rather than independent
randomness. The controlled entropy source the estate already owns is
the UUIDv5 `id` (SHA-1-derived, uniform over distinct seeds), so the
disambiguator tail draws from it:

- `<prefix>-<last3-of-id>` carries the prefix's 24 timestamp bits plus
  12 bits of hash-uniform material — pairwise collision 1/4096 for
  same-window seats on EVERY platform, same-millisecond forks
  included, with no dependence on any vendor's RNG behaviour.
- Residual risk is honest and acceptable for a display field: birthday
  collision ≈ n²/8192 for n same-window seats (~1% at ten simultaneous
  forks); the anchor stays the derived uuid, so a display collision can
  never corrupt state.

## Mechanism

1. **New derived field** `visual_disambiguator` on the PDR-027
   `agent_id` block, computed at identity preflight beside the existing
   fields.
2. **Derivation, pinned exactly**: the field is the stored
   `session_id_prefix` (the raw first-6 slice of the session id,
   verbatim) + `-` + the last 3 hex characters of the canonical
   lowercase UUIDv5 `id` string (e.g. `019f93-e2b`). Every platform
   computes it identically; no per-platform cases; the derivation is
   TOTAL over every supported seed shape by construction, because the
   `id` exists on every derived write — including the operator
   override path, whose `id` derives from `<agent_name>|<prefix>` and
   which never sees the full session id at all.
3. **Field semantics, stated in PDR-027**: `id` (UUIDv5 of the seed) is
   the identity anchor; `session_id_prefix` (first 6, unchanged) keeps
   BOTH of its existing jobs — the session-store search key AND the
   cross-estate join key (PDR-125 clause 5/6 and the inter-Practice
   wire schema make it the required four-field wire minimum, because
   estates evolve without carrying new optional fields);
   `visual_disambiguator` is the human-facing display token. Three
   fields, four jobs; the prefix's join-key role is retained verbatim —
   only the "stable identity anchor" vocabulary is retired (that job
   belongs to `id`).
4. **Schema updates** wherever the `agent_id` block is validated
   strictly (additional-properties-false schemas reject unknown
   fields): `active-claims.schema.json`, `closed-claims.schema.json`,
   `comms-event.schema.json`, and any sibling `agent_id` consumers
   found by sweep. Additive optional field, landed as a coordinated
   additive minor `schema_version` bump on each touched state schema
   (their own stated contract for new fields).
   `naming_schema_version` is untouched: it is name-derivation-era
   provenance with a closed registry enum
   (`v1-adjective-verb-noun | v2-noun-verb-noun | override`), and a
   display field does not change how names are derived.
5. **Display surfaces** adopt the new token — the named set, each with
   its render test: comms watch render, claims registry render,
   shared-comms-log render, the Claude statusline identity segment
   (`statusline-indicators.ts`), the shared `formatAgent` output that
   feeds TUI comms/queue views (`active-agent-routing.ts`,
   `tui/snapshot.ts`), comms query summaries (`cli-comms-query.ts`),
   comms event formatting (`comms-event-format.ts`), commit-queue
   guard output (`commit-queue/guard.ts`), and sign-off guidance in
   the comms/collaboration rules. The repo-wide sweep (acceptance
   criterion 6) captures any remaining diagnostic formatter.
5a. **Read/write compatibility contract, explicit.** The field is
   OPTIONAL on read everywhere, forever: historical records are not
   rewritten, and relay-written identity blocks (e.g. a directed
   event's recipient block — another agent's identity, whose token the
   writer cannot know) legitimately omit it. Every renderer falls back
   to the bare `session_id_prefix` when the field is absent. Every
   preflight-DERIVED new write (env-seeded and override paths both)
   carries it. No schema ever makes it required.
6. **PDR-027 amendment** records the field, the derivation, the
   field-semantics split in item 3 (including the retained PDR-125
   join-key role, cross-referenced to PDR-125 and the inter-Practice
   wire schema so a later doctrine sweep cannot read the prefix as
   removable), and the incident warrant (this plan's §Warrant, plus
   the 2026-07-24 same-window instance). The operational identity
   documentation updates in the same slice:
   `agent-tools/docs/agent-identity.md` (the preflight block
   enumeration, the platform hook-output table, and the Codex block
   shape) and `agent-tools/README.md` (the `collaboration-state`
   quick-reference block description).

## Acceptance criteria (each with a proof — required)

1. Preflight emits `visual_disambiguator` matching the pinned
   derivation for every supported seed shape — `repo-safe`: unit tests
   in the identity module with fixed seeds covering a UUIDv4-style
   seed, a UUIDv7-style seed, a non-UUID seed (`session_01…`-shaped),
   two same-window UUIDv7 fixtures whose disambiguators differ, and an
   override-path identity (`deriveOverrideCollaborationIdentity`)
   whose token derives from its own `id`.
2. Same-seed determinism holds: repeated preflight yields an identical
   block including the new field — `repo-safe`: unit test.
3. Every strict `agent_id` schema accepts the new field and rejects a
   malformed one (wrong shape/casing) — `repo-safe`: schema validation
   tests per touched schema.
4. `validate-collaboration-state` and the full validator suite pass
   with a registry entry carrying the new field — `repo-safe`: the
   existing gate, cited in the landing PR.
5. Every named display surface in Mechanism item 5 shows the
   disambiguator token when the field is present — `repo-safe`: render
   unit tests per named surface (comms watch, registry render,
   shared-comms-log, statusline identity segment, `formatAgent`/TUI,
   comms query summaries, comms event format, commit-queue guard) with
   the token asserted.
5a. Renderers fall back to the bare `session_id_prefix` when the field
   is absent (historical event fixture + relay-block fixture) —
   `repo-safe`: fallback render unit tests.
6. A repo-wide sweep shows no remaining surface that treats
   `session_id_prefix` as a uniqueness anchor (vocabulary: "stable
   identity anchor") — `repo-safe`: grep evidence recorded in the
   landing PR description. The prefix's search-key and PDR-125
   join-key roles are NOT sweep targets; the sweep must leave them
   standing.

## Todos

- Mint the Linear ticket; attach this plan id. (Done at pickup:
  MCP-145.)
- Identity module derivation + tests AND the schema trio + fixtures as
  ONE atomic slice: the strict state schemas
  (`additionalProperties: false`, enforced on written content by
  `state-integrity.ts`) reject the new field until the schemas accept
  it, so producer emission and schema acceptance must land together —
  never emission first.
- Render surfaces (the Mechanism item 5 named set) + fallback renders
  (item 5a) + rule-text touch-ups (single slice).
- PDR-027 amendment + PDR-125 cross-references + operational identity
  docs (`agent-identity.md`, `README.md`) (single slice; lands last so
  the doctrine describes shipped behaviour).

## Out of scope

- **Changing `session_id_prefix`** — it stays 6 characters with
  unchanged raw-slice derivation; it is useful precisely as the
  session-store search key and the PDR-125 cross-estate join key, and
  the disambiguator's head IS this stored value verbatim, so
  historical head-greps keep matching both eras.
- **Rewriting historical records** to the new token — head-matching
  keeps them greppable; retro-editing append-only history is banned
  regardless.
- **Anchor changes** — the UUIDv5 `id` derivation is untouched; this
  plan adds a display field only.
- **Per-platform special-casing** — the derivation is
  platform-independent by construction; any platform whose session id
  is not UUID-shaped still yields a well-formed token from its
  canonical string form.
