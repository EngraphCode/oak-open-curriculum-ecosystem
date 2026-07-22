#!/usr/bin/env node
// Merge pass-1 + pass-2 audit items into the MCP agent-facing content registry.
// Deterministic enrichment: repo-relative paths, extraction_kind, review_domain, flags.
// Usage: node build-registry.mjs <pass1.output> <pass2.output>   (run from repo root)
//
// PROVENANCE NOTE (PR #337 review): the pass-1/pass-2 audit outputs were ephemeral
// session artefacts and are deliberately NOT committed — they embed machine-local
// absolute paths, which the repo's no-machine-local-paths rule (PII) forbids landing.
// The committed `registry.json` IS the durable snapshot and the SSOT for the views
// (registry.md / content-registry.html regenerate from it). This script is retained
// as provenance documentation of the derivation rules, not as a reproducible pipeline.
import { readFileSync, writeFileSync } from 'node:fs';

const REPO = process.cwd();
const [pass1Path, pass2Path] = process.argv.slice(2);
const OUT = `${REPO}/.agent/reports/mcp-agent-facing-content-audit`;

const p1 = JSON.parse(readFileSync(pass1Path, 'utf8')).result.items;
const p2 = JSON.parse(readFileSync(pass2Path, 'utf8')).result.items;

const relpath = (f) => f.startsWith(REPO + '/') ? f.slice(REPO.length + 1) : f.replace(/^\/+/, '');

function extractionKind(it) {
  const f = it.file;
  // Item-level provenance wins over filename (PR #337 review): the EEF external-data
  // file MIXES verbatim EEF corpus with Oak-authored framing; only the former is external-copy.
  if (it.provenance === 'sourced-external-possibly-exempt') return 'external-copy';
  if (/eef-toolkit\.external-data/.test(f)) {
    return it.provenance === 'static-authored' || it.provenance === 'data-templated'
      ? 'authored-framing-of-external'
      : 'external-copy';
  }
  if (/eef-interpretation|aggregated-eef-evidence/.test(f)) return 'authored-framing-of-external';
  if (it.provenance === 'codegen-metadata') return 'generated-from-openapi';
  if (it.provenance === 'generated-by-repo-code') return 'generated-from-repo-code';
  if (it.provenance === 'data-templated' || it.surface_type === 'response-format-template') return 'authored-template';
  return 'leaf-authored';
}

function reviewDomain(it) {
  const f = it.file;
  const st = it.surface_type;
  // Provenance-aware (PR #337 review): Oak-authored framing inside the EEF external-data
  // file routes to Oak pedagogy review; only the verbatim external corpus is pedagogy-external.
  if (/eef-toolkit\.external-data/.test(f)) {
    return it.provenance === 'sourced-external-possibly-exempt' ? 'pedagogy-external' : 'pedagogy';
  }
  if (st === 'source-attribution') return 'legal-licensing';
  if (/prompt-messages\/|mcp-prompt/.test(f)) return 'pedagogy';
  if (/eef-interpretation|aggregated-eef-evidence/.test(f)) return 'pedagogy';
  if (/ontology-data|curriculum-model/.test(f)) return 'curriculum-accuracy';
  if (st === 'orientation-content') return 'pedagogy';
  if (st === 'landing-page-html' || st === 'widget-ui-content' || st === 'auth-consent-copy') return 'ux-accessibility';
  if (st === 'error-message' || st === 'empty-or-refusal-copy' || st === 'rate-limit-or-degradation-message') return 'recovery-copy';
  if (st === 'tool-guidance') return 'tool-usability';
  if (st === 'tool-title' || st === 'tool-description' || st === 'tool-param-description') return 'tool-usability';
  if (st === 'resource-name-or-description' || st === 'resource-content') return 'tool-usability';
  if (st === 'server-instructions') return 'tool-usability'; // the initialize-response text is the top of the how-to-use-this-server funnel — content reviewers must see it (PR #337 review)
  if (st === 'tool-annotations' || st === 'discovery-or-catalog-metadata' || st === 'server-branding') return 'engineering-structural';
  // Known MCP-facing types must not fall to the catch-all (PR #337 review): prompt catalogue
  // copy is teacher-workflow framing (pedagogy); response-format templates frame every
  // successful tool result an agent reads (tool-usability).
  if (st === 'prompt-name-or-description' || st === 'prompt-message-template') return 'pedagogy';
  if (st === 'response-format-template') return 'tool-usability';
  return 'other';
}

// --- source_locus: WHERE the content is authored, so reviewers can be pointed at it ---
// this-repo | upstream-in-house-api | upstream-in-house-skills | external-third-party
function sourceLocus(it, ek) {
  if (ek === 'external-copy') return 'external-third-party';
  // Two of the seven prompts are adapted from named oak-skills skills (verified in source docstrings).
  if (/prompt-messages\/(curriculum-mapping|lesson-planning)\.ts$/.test(it.file) && it.surface_type === 'prompt-message-template') return 'upstream-in-house-skills';
  // NOTE (PR #337 review): locus = where the WORDS are edited, not where underlying data comes
  // from. The OAK_KG attribution wording is authored locally (this-repo) even though the graph
  // DATA derives from oaknational/oak-curriculum-ontology — that data relationship is documented
  // in the report §4.1 prose and ADR-157, not as a word-authorship locus.
  // Likewise, generated tool ANNOTATION blocks are authored by this repo's generator
  // (emit-index.ts hard-codes the readOnly/destructive/idempotent/openWorld values) — they are
  // not upstream OpenAPI prose, so they stay this-repo.
  if (ek === 'generated-from-openapi' && it.surface_type !== 'tool-annotations') return 'upstream-in-house-api';
  return 'this-repo';
}
const UPSTREAM_POINTER = {
  'this-repo': null,
  'upstream-in-house-api': 'Oak Open Curriculum API (OCA) OpenAPI spec — IN-HOUSE (oaknational/oak-api repo). Authoritative source: https://open-api.thenational.academy/api/v0/swagger.json. Local committed snapshot reviewers can read: packages/sdks/oak-sdk-codegen/schema-cache/api-schema-original.json. Base tool/param prose is authored upstream; to change it, change the spec. NOTE: the "bulk download" is NOT a separate source — it is the same OCA data from the same repo, presented differently (different metadata focus).',
  'upstream-in-house-skills': 'Oak Skills — IN-HOUSE (oaknational/oak-skills). This prompt workflow is DERIVED/ADAPTED from a named skill (oak-curriculum-mapper / oak-lesson-builder); the authoritative pedagogy workflow lives there. Review the source skill, and keep the two in step.',
  'external-third-party': 'EXTERNAL third party — cite, do not rewrite. Most items are the EEF Teaching & Learning Toolkit corpus; others name their own provider in the item reasoning (e.g. DfE/UK statistics, upstream vendor OAuth metadata) — check per item. Verify citation accuracy and any Oak editorial framing wrapped around it.',
};

// --- impact_tier: gates protocol weight (owner design). high-impact => review+eval protocols required. ---
// Conservative default: anything behaviour-shaping is high-impact; only clearly-structural/UI config is simple.
// Any risk flag forces high-impact. simple-config is ONLY the owner's named tier — 'simple string
// config for UI or branding'. tool-annotations, auth/OAuth copy, and discovery/scope metadata are
// all behaviour-shaping (host retry/safety decisions; client re-auth flows; scope declarations)
// and stay high-impact (PR #337 review, two rounds).
const SIMPLE_CONFIG_SURFACES = new Set([
  'server-branding', 'landing-page-html', 'widget-ui-content',
]);
function impactTier(it, itemFlags) {
  if (itemFlags.length) return 'high-impact';
  return SIMPLE_CONFIG_SURFACES.has(it.surface_type) ? 'simple-config' : 'high-impact';
}

function flags(it) {
  const hay = `${it.behavioural_intent} ${it.exemption_reasoning} ${it.snippet} ${it.identifier}`.toLowerCase();
  const out = [];
  if (/classnotes|interpolat|\becho\b|free[- ]text|user-supplied|injected|injection/.test(hay)) out.push('user-input-interpolation');
  if (/\bpii\b|author name|named author/.test(hay)) out.push('pii-adjacent');
  if (it.exemption_assessment === 'uncertain-needs-owner-call') out.push('boundary-owner-call');
  if (/upstream|openapi/.test(hay) && it.surface_type.startsWith('tool')) out.push('upstream-owned-base-text');
  if (/typo|kalan|the this type|\bstale\b|mismatch/.test(hay)) out.push('possible-defect-reported');
  return out;
}

// --- 2026-07-22 delta-refresh enrichment (MCP-103 phase a; PR #476) ---
// Derivation rules for workspace_scope and ruling_note, predicate-based so a rebuild
// preserves them. The D12 cut is predicated on UPSTREAM OWNERSHIP (source_locus), not
// extraction kind: the 14 in-repo codegen-authored annotation blocks stay in scope.
const workspaceScope = (locus) => (locus === 'upstream-in-house-api' ? 'out-upstream-api' : 'in');

const D11_LIVE = /find-lessons|explore-curriculum|learning-progression/;
const D11_DORMANT = /lesson-planning|adapt-lesson|curriculum-mapping|continue-progression/;
const RULING_NOTES = {
  live: 'D11 (owner, 2026-07-22): the MCP prompt primitive unregisters entirely; this workflow’s content re-homes as an agent resource — LIVE set (navigation three). Delivery: MCP-101; code still registers prompts at refresh time.',
  dormant: 'D11 (owner, 2026-07-22): the MCP prompt primitive unregisters entirely; this workflow’s content is retained DORMANT behind the MCP-101 allowlist (creation-oriented, consistent with D4’s no-creation-claims boundary). Code still registers prompts at refresh time.',
  mixed: 'D11 (owner, 2026-07-22): shared argument copy spanning a LIVE workflow (learning-progression) and DORMANT ones (curriculum-mapping, continue-progression); survives with the live set as agent-resource content. Delivery: MCP-101.',
  landing: 'D11 (owner, 2026-07-22): the landing page’s prompt-catalogue section presents a primitive that unregisters; this copy reworks or retires at MCP-101 delivery.',
  sharedPreamble: 'D11 (owner, 2026-07-22): recurring orientation preamble embedded in ALL SEVEN workflow templates — spans the LIVE navigation set and the DORMANT creation set; survives with the live set as agent-resource content. Delivery: MCP-101.',
  underTheHood: 'D2 (owner, ratified 2026-07-22): under-the-hood KEEP — this surface remains served (tool + resource pointer).',
  annotations: 'D12 refinement (PR #476 r1): the emitted file is generated and never hand-edited, but the words are authored by this repo’s generator (emit-index.ts hard-codes the hint values — source_locus this-repo, §4.1 words-vs-data note). IN workspace scope; the review path is the generator source.',
};
function rulingNote(item) {
  const { file, identifier, surface_type: st, extraction_kind: ek, source_locus: locus } = item;
  // The D2 surface is the tool file AND its registered-resource entries (identifier-matched
  // in register-resources.ts — PR #476 r2, the file predicate alone missed C337–C340).
  if (/oak-under-the-hood/.test(file) || /Under the Hood/.test(identifier)) return RULING_NOTES.underTheHood;
  if (/render-prompts-section/.test(file)) return st === 'widget-ui-content' ? undefined : RULING_NOTES.landing;
  // The all-seven-templates orientation preamble spans both D11 sets (PR #476 r2, C205).
  if (/recurring orientation preamble/.test(identifier)) return RULING_NOTES.sharedPreamble;
  if (/prompt-messages\/|register-prompts\.ts|mcp\/mcp-prompts\.ts/.test(file)) {
    const hay = `${identifier} ${file}`;
    const live = D11_LIVE.test(hay);
    const dormant = D11_DORMANT.test(hay);
    if (live && dormant) return RULING_NOTES.mixed;
    if (live) return RULING_NOTES.live;
    // Strictly total: an item naming NO ruled workflow gets NO ruling note — a future
    // unruled workflow must surface unannotated, never silently inherit D11 (PR #476 r3).
    return dormant ? RULING_NOTES.dormant : undefined;
  }
  if (ek === 'generated-from-openapi' && locus === 'this-repo') return RULING_NOTES.annotations;
  return undefined;
}

const REFRESH_2026_07_22 = {
  ticket: 'MCP-103 phase (a)',
  summary:
    'Delta-refresh against the 2026-07-22 owner rulings (decisions register D2/D11/D12; delivery tickets MCP-101/MCP-102). Fields added: workspace_scope (every item, predicated on upstream ownership per D12), ruling_note (ruled items only). The audit snapshot itself (item ids, classification, original counts) is unchanged; this refresh re-scopes and re-statuses it.',
  deltas: [
    'D12 scope cut, predicated on upstream ownership: the 116 items whose words are owned by the upstream Oak Open Curriculum API spec (source_locus upstream-in-house-api; all generated-from-openapi) are OUT of the model-behaviour content workspace — upstream owns those words, and generated files are never hand-edited. The 14 in-repo codegen-authored tool-annotation blocks (generated-from-openapi but source_locus this-repo; the C607 family) stay IN — their review path is the generator source. Out items stay registered with workspace_scope=out-upstream-api so the map to the owning repo is preserved (acceptance: in, or explicitly out with a reason).',
    'D11 prompt removal: the app will serve ZERO MCP prompts (the primitive unregisters). The seven workflow bodies re-home as agent resources — the navigation three (find-lessons, explore-curriculum, learning-progression) LIVE; the creation-oriented four (lesson-planning, adapt-lesson, curriculum-mapping, continue-progression) retained DORMANT behind the MCP-101 allowlist. 43 items annotated: the three prompt file groups (39 — including the all-seven-templates orientation preamble marked as spanning both sets) plus the landing-page prompt-catalogue section (4).',
    'D2 under-the-hood: ratified KEEP (2026-07-22) — the 17 under-the-hood items are annotated (13 tool-file surfaces plus the 4 registered-resource entries); the surface remains served.',
    'Getting-started guidance (MCP-102) joins as a forthcoming first-class content class: served guidance covering the Oak-branding prohibition, standards for generated materials, request-refusal criteria, and safety/safeguarding response criteria — authored by non-engineers on templated authoring surfaces, then ingested, sanitised, and served; a release gate (D5). No repo surfaces exist yet, so it carries no items; the class is registered here and its pipeline lands INTO the workspace shape.',
    'MCP-101 allowlist: live-vs-dormant is DERIVED from the visible-surface allowlist once it exists; this registry records ruled target state, not runtime truth.',
  ],
  code_state_at_refresh:
    'Prompts are still registered in the app (register-prompts.ts live; no allowlist module exists yet). The D11/MCP-101 rulings are decided but undelivered at refresh time — ruling_note fields record ruled state, dated.',
};

const seen = new Set();
let idn = 0;
const items = [...p1.map((x) => ({ ...x, pass: 1 })), ...p2.map((x) => ({ ...x, pass: 2 }))]
  .map((it) => ({ ...it, file: relpath(it.file) }))
  .filter((it) => {
    const k = `${it.file}::${it.lines}::${it.identifier}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  })
  .map((it) => {
    const ek = extractionKind(it);
    const locus = sourceLocus(it, ek);
    const itemFlags = flags(it);
    const base = {
      id: `C${String(++idn).padStart(3, '0')}`,
      file: it.file, lines: it.lines, identifier: it.identifier,
      surface_type: it.surface_type,
      impact_tier: impactTier(it, itemFlags),
      review_domain: reviewDomain(it),
      extraction_kind: ek,
      source_locus: locus,
      upstream_source: UPSTREAM_POINTER[locus],
      provenance: it.provenance, audience: it.audience, exemption: it.exemption_assessment,
      behavioural_intent: it.behavioural_intent, reasoning: it.exemption_reasoning,
      snippet: it.snippet, measurability: it.measurability,
      flags: itemFlags, source_pass: it.pass,
      workspace_scope: workspaceScope(locus),
    };
    const note = rulingNote(base);
    return note ? { ...base, ruling_note: note } : base;
  });

const tally = (key) => items.reduce((m, it) => { const v = it[key]; m[v] = (m[v] || 0) + 1; return m; }, {});
const tallyArr = (key) => items.reduce((m, it) => { for (const v of it[key]) m[v] = (m[v] || 0) + 1; return m; }, {});
const cross = (a, b) => items.reduce((m, it) => { const k = `${it[a]} | ${it[b]}`; m[k] = (m[k] || 0) + 1; return m; }, {});

const registry = {
  meta: {
    title: 'Oak MCP agent-facing content registry',
    generated_from: 'two-pass exhaustive audit (map 17 slices + pass-2 gap-fill 5 slices)',
    note: 'Visibility artefact only. No validator/guard is derived from this (shapes are not yet ratified). Curriculum DATA bytes from the Oak API/bulk export are exempt; repo-authored framing/templates/guidance are in scope.',
    item_count: items.length,
    impact_tiers: tally('impact_tier'),
    protocol_note: 'high-impact items require review + eval protocols (owner design 2026-07-09); simple-config (branding/UI/structural metadata) does not. impact_tier is orthogonal to source_locus: a high-impact item authored upstream still needs protocols, run cross-repo against the assembled output.',
    source_loci: tally('source_locus'),
    upstream_pointers: UPSTREAM_POINTER,
    review_domains: tally('review_domain'),
    extraction_kinds: tally('extraction_kind'),
    surface_types: tally('surface_type'),
    audiences: tally('audience'),
    exemption: tally('exemption'),
    flags: tallyArr('flags'),
    workspace_scope: tally('workspace_scope'),
    refresh_2026_07_22: REFRESH_2026_07_22,
  },
  items,
};
writeFileSync(`${OUT}/registry.json`, JSON.stringify(registry, null, 2));

console.log('TOTAL ITEMS:', items.length);
console.log('\nREVIEW DOMAIN:'); for (const [k, v] of Object.entries(tally('review_domain')).sort((a, b) => b[1] - a[1])) console.log(`  ${String(v).padStart(4)}  ${k}`);
console.log('\nIMPACT TIER (gates protocol weight):'); for (const [k, v] of Object.entries(tally('impact_tier')).sort((a, b) => b[1] - a[1])) console.log(`  ${String(v).padStart(4)}  ${k}`);
console.log('\nIMPACT x SOURCE_LOCUS (high-impact upstream still needs protocols):'); for (const [k, v] of Object.entries(cross('impact_tier', 'source_locus')).sort((a, b) => b[1] - a[1])) console.log(`  ${String(v).padStart(4)}  ${k}`);
console.log('\nSOURCE LOCUS (where to point reviewers):'); for (const [k, v] of Object.entries(tally('source_locus')).sort((a, b) => b[1] - a[1])) console.log(`  ${String(v).padStart(4)}  ${k}`);
console.log('\nEXTRACTION KIND:'); for (const [k, v] of Object.entries(tally('extraction_kind')).sort((a, b) => b[1] - a[1])) console.log(`  ${String(v).padStart(4)}  ${k}`);
console.log('\nFLAGS:'); for (const [k, v] of Object.entries(tallyArr('flags')).sort((a, b) => b[1] - a[1])) console.log(`  ${String(v).padStart(4)}  ${k}`);
console.log('\nEXEMPTION:'); for (const [k, v] of Object.entries(tally('exemption')).sort((a, b) => b[1] - a[1])) console.log(`  ${String(v).padStart(4)}  ${k}`);
console.log('\nREVIEW x EXTRACTION:'); for (const [k, v] of Object.entries(cross('review_domain', 'extraction_kind')).sort((a, b) => b[1] - a[1])) console.log(`  ${String(v).padStart(4)}  ${k}`);
console.log('\nwrote', `${OUT}/registry.json`.replace(REPO + '/', ''));
