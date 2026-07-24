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
tickets: []
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

## Goal

Two agent seats whose session ids share the 6-character
`session_id_prefix` are distinguishable at a glance on every
human-facing surface (comms renders, registry rows, sign-offs, log
lines), while `session_id_prefix` keeps its current value and job
(searching session stores by id head) and the UUIDv5 `id` keeps its job
(the collision-proof anchor). Today that glance-distinction does not
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
millisecond, where even all 12 timestamp digits collide. The trailing
characters of a UUID are random material in both UUIDv4 (Claude
session ids) and UUIDv7 (`rand_b`), so a composite of the id's two
ends adds true entropy uniformly across platforms:

- `<first6>-<last3>` carries 24 timestamp bits + 12 random bits on
  UUIDv7 (pairwise collision 1/4096 even for same-millisecond forks)
  and 36 random bits on UUIDv4 (~1 in 6.9 × 10^10).
- Residual risk is honest and acceptable for a display field: birthday
  collision ≈ n²/8192 for n same-window seats (~1% at ten simultaneous
  forks); the anchor stays the derived uuid, so a display collision can
  never corrupt state.

## Mechanism

1. **New derived field** `visual_disambiguator` on the PDR-027
   `agent_id` block, computed at identity preflight beside the existing
   fields.
2. **Derivation, pinned exactly**: take the canonical session-id
   string, lowercase it, strip hyphens; the field is the first 6 hex
   characters + `-` + the last 3 hex characters (e.g. `019f93-e2b`).
   Every platform computes it identically; no per-platform cases.
3. **Field semantics, stated in PDR-027**: `id` (UUIDv5 of the seed) is
   the identity anchor; `session_id_prefix` (first 6, unchanged) is the
   session search key; `visual_disambiguator` is the human-facing
   display token. Three fields, three jobs; the prefix is demoted from
   "stable identity anchor" to "search key" in prose.
4. **Schema updates** wherever the `agent_id` block is validated
   strictly (additional-properties-false schemas reject unknown
   fields): `active-claims.schema.json`, `closed-claims.schema.json`,
   `comms-event.schema.json`, and any sibling `agent_id` consumers
   found by sweep. Additive field; bump the block's
   `naming_schema_version`.
5. **Display surfaces** adopt the new token: comms watch render, claims
   registry render, shared-comms-log render, sign-off guidance in the
   comms/collaboration rules. Historical records are NOT rewritten —
   the new token's head equals the old prefix, so head-greps still
   match both eras.
6. **PDR-027 amendment** records the field, the derivation, the
   three-job semantics, and the incident warrant (this plan's §Warrant,
   plus the 2026-07-24 same-window instance).

## Acceptance criteria (each with a proof — required)

1. Preflight emits `visual_disambiguator` for both a UUIDv4-style and a
   UUIDv7-style seed, matching the pinned derivation — `repo-safe`:
   unit tests in the identity module with fixed seeds, including two
   same-window UUIDv7 fixtures whose disambiguators differ.
2. Same-seed determinism holds: repeated preflight yields an identical
   block including the new field — `repo-safe`: unit test.
3. Every strict `agent_id` schema accepts the new field and rejects a
   malformed one (wrong shape/casing) — `repo-safe`: schema validation
   tests per touched schema.
4. `validate-collaboration-state` and the full validator suite pass
   with a registry entry carrying the new field — `repo-safe`: the
   existing gate, cited in the landing PR.
5. Comms watch and registry renders show the disambiguator token —
   `repo-safe`: render unit tests updated with the token asserted.
6. A repo-wide sweep shows no remaining surface that treats
   `session_id_prefix` as a uniqueness anchor (vocabulary: "stable
   identity anchor") — `repo-safe`: grep evidence recorded in the
   landing PR description.

## Todos

- Mint the Linear ticket; attach this plan id.
- Identity module: derivation + tests (single slice).
- Schema trio + fixtures (single slice).
- Render surfaces + rule-text touch-ups (single slice).
- PDR-027 amendment + doctrine cross-references (single slice; lands
  last so the doctrine describes shipped behaviour).

## Out of scope

- **Changing `session_id_prefix`** — it stays 6 characters with
  unchanged derivation; it is useful precisely as a session-store
  search key.
- **Rewriting historical records** to the new token — head-matching
  keeps them greppable; retro-editing append-only history is banned
  regardless.
- **Anchor changes** — the UUIDv5 `id` derivation is untouched; this
  plan adds a display field only.
- **Per-platform special-casing** — the derivation is
  platform-independent by construction; any platform whose session id
  is not UUID-shaped still yields a well-formed token from its
  canonical string form.
