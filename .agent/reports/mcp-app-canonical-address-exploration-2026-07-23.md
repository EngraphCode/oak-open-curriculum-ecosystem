# Canonical address for the MCP app — exploration record (2026-07-23)

**Status**: exploration record — findings to date and the proof design.
Not a plan; it shapes the exploration and matures into a born-sketch
delivery plan when the shape settles (owner directive, 2026-07-23).
**Ticket**: MCP-122 (blocks MCP-106 — the store listing carries the
endpoint). **Author**: Bonfire tracks Bellows (implementer seat).

## Frame

The release serves at `https://www.thenational.academy/mcp` (owner
word, 2026-07-23, release blocker). This is a **canonical-address mint
plus alpha demotion, never a "move"**: the current alpha endpoint keeps
serving through the transition and demotes to a compatibility surface
on its own clock. The why-now is M8: the store listing fossilises
whatever URL we submit, so the canonical address must exist — and be
proven — before MCP-106 submits.

One address serves three audiences by content negotiation on method +
Content-Type + Accept together (owner-set shape): POST with a JSON body
is MCP protocol; GET accepting `text/event-stream` is the SSE leg; GET
accepting `text/html` is a person and receives the app's landing page.

The work decomposes into three independently-provable layers, each with
its own instrument, sequenced proof-first:

## Layer (a) — app-level polysemy (the proof; fully ours; now)

**Finding — the triple is app code, not edge routing.** Probed
first-hand: a browser-shaped GET on `/mcp` today returns **406**
(`ensureMcpAcceptHeader` middleware rejects non-SSE Accepts), and the
human landing page lives at `/`. The negotiation triple therefore has
to be built in the app before any edge work means anything.

**Proof scope (owner-defined, on the current domain):** `/mcp` serves
the **landing page** for browser-shaped requests and the **MCP app**
for protocol-shaped requests, while the landing page **stays on the
bare `/` as well**. Red-first TDD; single-story PR under MCP-122;
mcp-expert review on the transport-adjacent change; the M5 conformance
suites are the backstop that protocol behaviour is unperturbed. The
proof demonstrates the exact mechanism the eventual edge engagement
will carry — engagement travels with a working demonstration, not a
proposal.

**Sharpened calls (lead-run exploration pass, 2026-07-23):**

- **X-Forwarded-Host stays OUT of the proof.** No proxy fronts the
  current domain, and host-header trust is a layer-(b) security change
  that belongs behind the known edge. If the landing render breaks
  without host pinning, the proof usefully surfaces it.
- **Serve, don't redirect,** for the `/mcp` html leg — default SERVE
  (owner's words; address-bar stability), with redirect-to-`/` as the
  cheap fallback if relative assets misbehave.

## Layer (b) — edge routing (engaged with proof in hand)

**Findings:**

- `www.thenational.academy/mcp` is currently 404 behind Cloudflare
  (probed; cf-ray LHR) — the path is free.
- The zone is managed as Terraform in the organisation's Cloud-Config
  infrastructure repository — the change vehicle is a **reviewable IaC
  PR, not a console request**, and opening that PR is in-scope agent
  work (owner word) with cross-repo ceremony when we get there.
- The main site is itself hosted on the same platform as the app,
  which opens a second candidate mechanism: a platform-level
  rewrite in the main site's own hosting configuration. Trade-offs
  (zone-level route: main site untouched entirely; platform rewrite:
  no edge-worker code, but a main-site-surface change) are recorded
  for the mechanism decision — an owner gate, deliberately
  open-jointed until the owner's further info lands.
- **The moved surface is larger than `/mcp*`** (probed from the route
  table): the app also serves the path-scoped RFC 9728 metadata
  (`/.well-known/oauth-protected-resource/mcp` — root-scoped on the
  domain, so the edge must route it), a root PRM variant, the
  authorization-server metadata, a stub-mode well-known, `/healthz`,
  the landing `/`, and signed asset-download paths.
- **Self-description is host-derived**: PRM and resource URLs come
  from the request Host per-request. Behind any proxy the app must
  either receive the canonical Host or gain a canonical-origin pin
  (with explicitly-enabled forwarded-host trust). This is the central
  layer-(b) design decision and pairs with whichever edge mechanism
  wins.
- **Signed asset URLs stay on the app's own origin** (working call):
  the URL factory has no path-prefix support, the links are 5-minute
  signed URLs never bookmarked, and keeping them home claims nothing
  of the main domain's namespace beyond `/mcp*` and its well-known.

**Open questions (layer b):** mechanism choice and owning-team
engagement (owner gate; more owner info imminent — this section stays
open-jointed); the deprecation-window length for the alpha endpoint;
whether any additional well-known must ride the edge route (the OAuth
walk in layer (c) proves the exact set).

## Layer (c) — identity switchover (last; M4/M5/M8)

**Findings:** the OAuth resource indicators, allowed origins, and
redirect URLs in the sign-in platform reference the serving origin —
the change list is enumerable but executes with the production sign-in
lane (MCP-67, M4), under the standing constraint that sign-in-platform
writes are owner-gated. Conformance (M5) re-runs against the canonical
origin once layers (a)+(b) stand; the listing (M8) submits the
canonical address only after all three layers hold.

**Open questions (layer c):** exact resource-indicator set after the
mint; whether the alpha origin stays registered through the
deprecation window (probed answer belongs to the MCP-67 lane's
read-only inspection).

## Sequencing

1. **This record** (shapes the exploration; owner-visible).
2. **The layer-(a) proof build** — claim + fresh worktree off main,
   red-first, single-story PR, mcp-expert review, M5 backstop.
3. **The delivery plan** — authored born-sketch only after the proof
   lands and the owner's further info settles layers (b)/(c); the
   lane branch already carries raw material for it.

## Evidence base

All probes first-hand (2026-07-23): live-domain and alpha-endpoint
negotiation probes; the app's route table and URL-construction sites
read in source (`auth-routes`, `get-prm-url`, `get-mcp-resource-url`,
`asset-download-route`, `core-endpoints`); zone and hosting facts from
the organisation's internal infrastructure pages via the lead. Full
command-level trail on MCP-122.
