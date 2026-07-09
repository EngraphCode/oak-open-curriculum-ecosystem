#!/usr/bin/env node
// Merge pass-1 + pass-2 audit items into the MCP agent-facing content registry.
// Deterministic enrichment: repo-relative paths, extraction_kind, review_domain, flags.
// Usage: node build-registry.mjs <pass1.output> <pass2.output>   (run from repo root)
import { readFileSync, writeFileSync } from 'node:fs';

const REPO = process.cwd();
const [pass1Path, pass2Path] = process.argv.slice(2);
const OUT = `${REPO}/.agent/reports/mcp-agent-facing-content-audit`;

const p1 = JSON.parse(readFileSync(pass1Path, 'utf8')).result.items;
const p2 = JSON.parse(readFileSync(pass2Path, 'utf8')).result.items;

const relpath = (f) => f.startsWith(REPO + '/') ? f.slice(REPO.length + 1) : f.replace(/^\/+/, '');

function extractionKind(it) {
  const f = it.file;
  if (/eef-toolkit\.external-data/.test(f)) return 'external-copy';
  if (it.provenance === 'sourced-external-possibly-exempt') return 'external-copy';
  if (/eef-interpretation|aggregated-eef-evidence/.test(f)) return 'authored-framing-of-external';
  if (it.provenance === 'codegen-metadata') return 'generated-from-openapi';
  if (it.provenance === 'generated-by-repo-code') return 'generated-from-repo-code';
  if (it.provenance === 'data-templated' || it.surface_type === 'response-format-template') return 'authored-template';
  return 'leaf-authored';
}

function reviewDomain(it) {
  const f = it.file;
  const st = it.surface_type;
  if (/eef-toolkit\.external-data/.test(f)) return 'pedagogy-external';
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
  if (st === 'tool-annotations' || st === 'discovery-or-catalog-metadata' || st === 'server-branding' || st === 'server-instructions') return 'engineering-structural';
  return 'other';
}

// --- source_locus: WHERE the content is authored, so reviewers can be pointed at it ---
// this-repo | upstream-in-house-api | upstream-in-house-bulk | upstream-in-house-ontology | upstream-in-house-skills | external-third-party
function sourceLocus(it, ek) {
  const prov = `${it.identifier} ${it.exemption_reasoning ?? ''} ${it.snippet ?? ''} ${it.behavioural_intent ?? ''}`;
  if (ek === 'external-copy') return 'external-third-party';
  // Two of the seven prompts are adapted from named oak-skills skills (verified in source docstrings).
  if (/prompt-messages\/(curriculum-mapping|lesson-planning)\.ts$/.test(it.file) && it.surface_type === 'prompt-message-template') return 'upstream-in-house-skills';
  // Knowledge-graph-derived content attributes to the Oak Curriculum Ontology repo.
  if (/OAK_KG|oak-curriculum-ontology|Oak Curriculum Ontology/i.test(prov)) return 'upstream-in-house-ontology';
  if (ek === 'generated-from-openapi') return 'upstream-in-house-api';
  if (/conceptGraph|vocab|keyword-graph/i.test(`${it.file} ${it.exemption_reasoning ?? ''}`) && /bulk/i.test(`${it.exemption_reasoning ?? ''}`)) return 'upstream-in-house-bulk';
  return 'this-repo';
}
const UPSTREAM_POINTER = {
  'this-repo': null,
  'upstream-in-house-api': 'Oak Open Curriculum API OpenAPI spec — IN-HOUSE (oaknational/oak-api). Authoritative source: https://open-api.thenational.academy/api/v0/swagger.json. Local committed snapshot reviewers can read: packages/sdks/oak-sdk-codegen/schema-cache/api-schema-original.json. Base tool/param prose is authored upstream; to change it, change the spec.',
  'upstream-in-house-bulk': 'Oak bulk download data — IN-HOUSE (Oak bulk export). Local snapshot: apps/oak-search-cli/bulk-downloads. Vocabulary/graph content derives from this pipeline at codegen time.',
  'upstream-in-house-ontology': 'Oak Curriculum Ontology — IN-HOUSE (oaknational/oak-curriculum-ontology). The formal semantic curriculum representation; knowledge-graph content and the OAK_KG attribution derive from it. Review the graph/ontology source there.',
  'upstream-in-house-skills': 'Oak Skills — IN-HOUSE (oaknational/oak-skills). This prompt workflow is DERIVED/ADAPTED from a named skill (oak-curriculum-mapper / oak-lesson-builder); the authoritative pedagogy workflow lives there. Review the source skill, and keep the two in step.',
  'external-third-party': 'EEF Teaching & Learning Toolkit — EXTERNAL third party. Cite, do not rewrite; verify citation accuracy and any Oak editorial framing wrapped around it.',
};

// --- impact_tier: gates protocol weight (owner design). high-impact => review+eval protocols required. ---
// Conservative default: anything behaviour-shaping is high-impact; only clearly-structural/UI config is simple.
// Any risk flag forces high-impact (e.g. the buggy idempotent annotation).
const SIMPLE_CONFIG_SURFACES = new Set([
  'server-branding', 'discovery-or-catalog-metadata', 'tool-annotations',
  'landing-page-html', 'widget-ui-content', 'auth-consent-copy',
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
    return {
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
    };
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
