---
id: practice-identity-visual-disambiguator
node_type: delivery
name: "Identity visual disambiguator: prefix-anchored display token beside the session-id prefix"
overview: "Add a derived visual_disambiguator field to the PDR-027 agent-identity block so seats started in the same UUIDv7 time window stay human-distinguishable, without changing the session-search prefix, its cross-estate join-key role, or the derived-uuid anchor."
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

Revision 2 (2026-07-24): reworked after the PR's three-reviewer round.
The derivation now anchors on the UUIDv5 `id` (total for every seed
shape including override identities; alphabet pinned; head equals the
existing prefix verbatim; entropy independent of vendor UUIDv7
`rand_b` behaviour), `naming_schema_version` is untouched, the
landing order is schema-consumers-first, the prefix's PDR-125
cross-estate join-key role is preserved explicitly, and the renderer
inventory and canonical operational docs are enumerated in scope.

## Goal

Two agent seats whose session ids share the 6-character
`session_id_prefix` are distinguishable at a glance — in all but
~1-in-4096 same-window pairs, the residual §Warrant accepts for a
display field — on every renderer in the enumerated display inventory
(closed by repo-wide sweep — see acceptance 6), while
`session_id_prefix` keeps its value and BOTH its jobs — session-store search key AND the required cross-estate join key
of the inter-Practice wire protocol (PDR-125,
`inter-practice-wire.schema.json`) — and the UUIDv5 `id` keeps its job
as the collision-proof anchor. Today that glance-distinction does not
exist: on 2026-07-24 two Codex seats started 90 minutes apart (Pegasus
wakes Redshift, then Lupin turns Xylem) both derived prefix `019f93`,
because Codex thread ids are UUIDv7 and the first 6 hex characters are
purely the high bits of a millisecond timestamp.

## Warrant (the collision arithmetic)

UUIDv7 ids begin with 48 bits (12 hex chars) of Unix-epoch
milliseconds; each hex position of prefix divides the collision window
by 16:

| Prefix length | Timestamp bits | Collision window |
| ------------- | -------------- | ---------------- |
| 6 (current)   | 24             | ~4.66 hours      |
| 8             | 32             | ~65 seconds      |
| 12            | 48 (all)       | 1 ms             |

No timestamp-derived prefix can guarantee uniqueness (same-millisecond
fleet forks collide on all 12 timestamp digits), and — reviewer
finding, accepted — the UUIDv7 spec does not guarantee that a vendor
fills the trailing `rand_b` bits with independent uniform randomness
(conforming monotonic-counter constructions exist). The cure is to
take the disambiguating material from a value the estate already
controls: the **UUIDv5 `id`** is a deterministic SHA-1-derived hash of
the full seed, present on every identity block, with uniformly
distributed hex by construction. Twelve bits of it yields pairwise
collision 1/4096 for seats in the same prefix window regardless of
vendor id-generation behaviour; residual birthday risk ≈ n²/8192 for n
same-window seats (~1% at ten simultaneous forks) is acceptable for a
display field because the anchor stays the full `id` — a display
collision can never corrupt state. The guarantee is scoped to
DISTINCT identities: two override seats deliberately configured with
the same `agent_name` and prefix share the full `id` by construction
and therefore the token — by PDR-027's `(agent_name, id)` key they
ARE one identity, an identical token is the correct render, and the
estate does not guard against deliberately naming two sessions the
same thing (owner word, 2026-07-24).

## Mechanism

1. **New optional field** `visual_disambiguator` on the PDR-027
   `agent_id` block, computed at identity derivation wherever a block
   is built WITH both inputs (platform preflight and override paths
   alike). Legacy-migration constructors are the named exception:
   `comms-migration-records.ts` deliberately mints legacy blocks
   without an `id` (the original seed is unavailable), so migration
   output omits the token and renders through the legacy prefix
   fallback — a correct token cannot be fabricated there.
2. **Derivation, pinned and total**:
   `visual_disambiguator = session_id_prefix + "-" + id.slice(-3)`
   — the existing prefix VERBATIM (raw first-6, exactly the current
   field, so the token's head equals historical prefixes by
   construction, with no lowercasing or hyphen-stripping step), a
   joining dash, and the last 3 hex characters of the block's UUIDv5
   `id`. Total for every supported seed shape at DERIVATION: UUIDv4/v7
   session ids, arbitrary conversation-id seeds, and override
   identities — every derivation path has both inputs by the time the
   block exists (`deriveOverrideCollaborationIdentity` receives the
   prefix and derives the id); the item-1 legacy-migration exception
   (no `id`, no seed) is outside the derivation surface and takes the
   prefix fallback. The token is RECOMPUTED wherever a block's
   `session_id_prefix` or `id` is replaced after derivation — the
   `resolveSelfIdentity` `--session-prefix` override path is explicitly
   in scope, so the token head can never desync from the final prefix.
   Example: `019f93-b60` vs `019f93-caa`.
3. **`naming_schema_version` is untouched.** It records the
   name-derivation era (schema-registry closed enum plus `override`)
   and this field does not change name derivation. The touched STATE
   schemas, by contrast, take a coordinated additive MINOR
   `schema_version` bump — their own compatibility contract requires
   one for new fields (`active-claims.schema.json` `$comment`) so an
   older strict reader never sees a document claiming a known version
   while carrying an unknown property — with parsers, seeds, and
   fixtures updated in the same slice (owner-ruled via Director card,
   2026-07-24). The field stays additive and optional in every
   schema.
4. **Field-role doctrine (PDR-027 amendment)**: `id` — the identity
   anchor; `session_id_prefix` — session search key AND the
   inter-Practice cross-estate join key (PDR-125's join-key clause
   unchanged; the amendment cites it explicitly so no later sweep
   demotes the prefix); `visual_disambiguator` — display only, never
   a join or lookup key. PDR-125's DISPLAY clause (clause 5: every
   rendered identity surface shows `<name> (<session_id_prefix>)`) is
   amended to the token render with prefix fallback — owner-ruled via
   Director card, 2026-07-24, twin disposition
   `their-lane-owns-coordinate` (PDR-125 clause 6's enumerated
   vocabulary; the ruled substance unchanged — the sibling estate's
   own lane lands its twin, coordinated at the next exchange window).
5. **Schema updates, consumers first** (see Todos order): the
   canonical strict Zod schemas in `agent-id.ts` (read AND write —
   `collaborationAgentIdWriteSchema` gates producer paths such as
   `createIntent`), `active-claims.schema.json`,
   `closed-claims.schema.json`, `comms-event.schema.json`, and any
   sibling `agent_id` consumers found by sweep — every strict surface
   (Zod and JSON Schema alike, including `state-integrity.ts`
   validation) accepts the optional field BEFORE any producer emits
   it. The core-carried inter-Practice wire schema is deliberately
   NOT touched: `wire_identity` tolerates local extras by design
   (`additionalProperties: true`, its `$comment` naming exactly this
   case), so the token rides the wire as a tolerated local extra with
   zero wire change and no twin obligation.
6. **Read/write compatibility, stated separately**: on READ the field
   is optional forever — historical records are never rewritten, and
   every renderer falls back to `session_id_prefix` when the field is
   absent. On WRITE, every newly derived identity block carries the
   field, enforced by derivation-layer unit tests — the field stays
   OPTIONAL in every schema, the write schema included. A
   required-in-write flip (the `id` contract's pattern) was considered
   and REJECTED (owner word, 2026-07-24): historical blocks
   legitimately flow through write parses at reply/relay ingestion
   (`comms-use-cases.ts` `replyToDirectedCommsMessage` parses the
   historical `source.from` through the write schema), so requiring
   the field there would demand a read-to-write promotion layer — a
   compatibility bridge, which the estate's principles disallow
   (replace, don't bridge). Test-enforced derivation replaces the
   bridge. When the field IS
   present, strict boundaries validate it by RECOMPUTATION, never
   shape alone: the Zod/`state-integrity` surfaces recompute
   `session_id_prefix + "-" + id.slice(-3)` and reject a stored or
   inbound block whose token mismatches its own source fields — a
   well-formed-but-stale token would otherwise confidently name the
   wrong seat on every renderer.
7. **Identity propagation on non-preflight producers**: surfaces that
   CONSTRUCT an `agent_id` block from parts — the commit-queue intent
   path (`commit-queue/intent.ts` builds the block from flags;
   `commit-queue/types.ts` gains the field) AND the direct-message
   recipient constructor (`cli-comms-messages.ts` `recipientAgent`
   builds the `to` block from `--to-*` flags, which already supply
   both the prefix and the id, so the token is derived at
   construction — it is a constructor, not a pass-through) and any
   sweep-found sibling — carry the token through serialisation so
   their renderers show the real token, not the legacy fallback.
8. **Display surfaces — enumerated inventory, closed by sweep**:
   comms watch render, claims registry render, shared-comms-log
   render, `cli-comms-query` summaries, `comms-event-format`,
   `commit-queue/guard` output, `active-agent-routing`/`formatAgent`
   (feeds TUI comms and queue views), `tui/snapshot`, and the Claude
   statusline (`statusline-indicators`). A repo-wide sweep for
   `session_id_prefix` render sites closes the set; any renderer found
   by the sweep joins the inventory and its test.
9. **Documentation slice**: PDR-027 amendment (field, derivation,
   role doctrine, this warrant), PLUS the canonical operational docs
   agents actually consult — `agent-tools/docs/agent-identity.md`
   (preflight block example, platform hook output, Codex block shape)
   and `agent-tools/README.md` (identity output examples) — updated in
   the same slice with their examples regenerated from the live
   derivation.

## Acceptance criteria (each with a proof — required)

1. Derivation is total and pinned: unit tests cover UUIDv4 and UUIDv7
   session-id seeds, an arbitrary non-UUID conversation-id seed, an
   uppercase/hyphen-bearing seed, and the override path (prefix-only
   input) — each yielding `<prefix>-<last3-of-id>`, with two
   same-window UUIDv7 fixtures whose tokens differ — `repo-safe`:
   identity-module unit tests with fixed seed vectors.
2. Same-seed determinism: repeated derivation yields an identical
   block including the new field; and a post-derivation
   `--session-prefix` override recomputes the token (fixed-vector test
   proving head equals the FINAL prefix) — `repo-safe`: unit tests.
2b. A newly enqueued commit-queue intent reaches the guard with the
   token intact, and a directed message's constructed `to` block
   carries the token derived from its `--to-*` prefix and id
   (propagation proofs) — `repo-safe`: commit-queue and
   directed-message round-trip tests.
3. Layered validation, each layer proving what it can express: every
   strict `agent_id` JSON schema accepts blocks WITH and WITHOUT the
   field and rejects a malformed one (SHAPE — draft 2020-12 cannot
   express cross-field derived equality) — `repo-safe`: schema tests
   per touched schema plus a legacy-block fixture; and the
   Zod/`state-integrity` boundary rejects a present-but-stale token
   (the SEMANTIC recompute-and-compare check of Mechanism item 6) —
   `repo-safe`: a desync fixture at that boundary.
4. Landing-order safety: with only the schema slice landed, existing
   producers still validate (no emission yet); with the derivation
   slice landed, every new block carries the field — `repo-safe`: the
   two slices' own gates, cited in order in the landing PRs.
5. The inter-Practice wire schema is byte-untouched, wire conformance
   is unchanged, and the prefix remains the join key; the PDR-125
   display-clause amendment carries its `their-lane-owns-coordinate`
   twin disposition recorded in the amendment text — `repo-safe`:
   existing PDR-125 wire conformance tests re-run and cited, plus the
   amendment diff showing the join-key clause untouched.
6. Every renderer in the §Mechanism-8 inventory displays the token
   with prefix-fallback for legacy blocks, and a repo-wide sweep
   recorded in the landing PR shows no render site outside the
   inventory — `repo-safe`: render unit tests per surface + the sweep
   evidence.
7. Canonical identity docs match the live derivation output —
   `repo-safe`: a generated-example drift test AUTHORED IN Slice 4
   (no such check exists today) that regenerates the
   `agent-identity.md` / README identity-block examples from the live
   derivation and diffs them against the committed docs, cited in the
   landing PR.

## Todos (ordered; each a single-story PR, default round budget)

- Slice 1 — schema consumers: canonical Zod read/write schemas in
  agent-id.ts + JSON schema trio with their coordinated minor
  schema_version bumps + parsers/seeds/fixtures (accepts optional
  field; nothing emits yet; wire schema untouched).
- Slice 2 — derivation and propagation: identity module emits the
  field on all derivation paths incl. post-derivation prefix-override
  recomputation; commit-queue intent serialisation and the
  direct-message recipient constructor carry it; migration output
  stays token-less by design (item-1 exception); the field stays
  optional in every schema (no required-in-write flip — owner word,
  2026-07-24, replace-don't-bridge) with new-write coverage enforced
  by derivation-layer unit tests; unit tests incl. non-UUID, override
  (including an identical-override fixture asserting token EQUALITY —
  same configured identity, same token), desync-rejection, a
  reply-to-pre-field-event fixture, and both round-trip fixtures.
- Slice 3 — renderers: enumerated inventory + sweep closure + render
  tests with legacy fallback.
- Slice 4 — doctrine and docs: PDR-027 amendment + the PDR-125
  display-clause amendment (twin disposition:
  their-lane-owns-coordinate) + agent-identity.md + README examples +
  the generated-example drift test of acceptance 7; lands last so
  doctrine describes shipped behaviour.

## Out of scope

- **Changing `session_id_prefix`** — value, derivation (raw first-6),
  search-key job, and PDR-125 cross-estate join-key job all unchanged.
- **Rewriting historical records** — the token's head equals the old
  prefix by construction, so head-greps match both eras; retro-editing
  append-only history is banned regardless.
- **Anchor changes** — the UUIDv5 `id` derivation is untouched; this
  plan adds a display field only.
- **Versioning machinery** — no `naming_schema_version` change and no
  new block-version field; the addition is optional-additive by
  design.
