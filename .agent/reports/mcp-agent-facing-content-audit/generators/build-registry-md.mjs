#!/usr/bin/env node
// Generate the human-readable registry index (registry.md) from registry.json.
// Usage: node build-registry-md.mjs   (run from repo root)
import { readFileSync, writeFileSync } from 'node:fs';

const REPO = process.cwd();
const DIR = `${REPO}/.agent/reports/mcp-agent-facing-content-audit`;
const reg = JSON.parse(readFileSync(`${DIR}/registry.json`, 'utf8'));
const { meta, items } = reg;

// Escape HTML-significant characters too (PR #337 review): audited snippets are sometimes HTML
// fragments; unescaped they render as document structure instead of showing the literal string
// under review. Ampersand first so entities are not double-escaped.
const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\|/g, '\\|')
    .replace(/\n/g, ' ')
    .trim();
const table = (obj) => Object.entries(obj).sort((a, b) => b[1] - a[1]).map(([k, v]) => `| ${k} | ${v} |`).join('\n');

const DOMAIN_ORDER = ['pedagogy', 'curriculum-accuracy', 'pedagogy-external', 'tool-usability', 'recovery-copy', 'legal-licensing', 'ux-accessibility', 'engineering-structural', 'other'];
const DOMAIN_BLURB = {
  pedagogy: 'Teaching/learning framing — prompts, orientation, curriculum-model doctrine, EEF interpretation. **Primary education-expert review target.**',
  'curriculum-accuracy': 'The authored conceptual model of the curriculum — ontology (subjects, key stages, exam boards, pathways), domain concepts. **Curriculum-expert review target.**',
  'pedagogy-external': 'External EEF corpus content (exempt — we cannot change it) that is nonetheless pedagogy-relevant and carries embedded Oak editorial framing. Review for citation accuracy + framing.',
  'tool-usability': 'How an agent discovers and uses tools — titles, descriptions, param descriptions, prerequisite/orientation directives.',
  'recovery-copy': 'What the agent receives on failure/empty — validation errors, empty-state, degradation. Shapes whether it recovers or fabricates.',
  'legal-licensing': 'Attribution, licensing (OGL v3.0), trademark, EEF-citation obligations.',
  'ux-accessibility': 'Human-facing surfaces — landing page, widget UI, auth/consent copy (WCAG 2.2 AA applies).',
  'engineering-structural': 'Annotations, schemas, scopes, discovery/branding metadata — structural, engineer-owned.',
  other: 'Uncategorised / mixed.',
};

let md = `# Oak MCP agent-facing content registry

> ${meta.note}

**${meta.item_count} content items** across ${new Set(items.map((i) => i.file)).size} files. Generated from a two-pass exhaustive audit. This is a **visibility artefact** — a discoverable, auditable index of every piece of repo-controlled content that reaches an MCP consumer. It asserts *what exists and who should review it*, not whether it is good.

See [\`report.md\`](./report.md) for the analysis, the i18n/content-workspace reframe, findings, and gaps. Machine-readable source: [\`registry.json\`](./registry.json). To read the surfaces **assembled as an agent receives them** (exact or with \`{{placeholders}}\`), see [\`rendered-wholes.md\`](./rendered-wholes.md).

## How to read this

Each item has a **review domain** (which expert should audit it) and an **extraction kind** (whether it is leaf-authored content that could move to a content catalogue, or generated/external content that cannot). Item ids (\`C001\`…) are stable references into \`registry.json\`.

## Summary

### By impact tier (gates protocol weight)
| Impact tier | Items |
| --- | --- |
${table(meta.impact_tiers)}

_${meta.protocol_note}_

### By review domain (who should audit)
| Review domain | Items |
| --- | --- |
${table(meta.review_domains)}

### By extraction kind (i18n-style movability)
| Extraction kind | Items |
| --- | --- |
${table(meta.extraction_kinds)}

- **leaf-authored** — pure authored strings; catalogue-extractable (the i18n-movable core).
- **generated-from-openapi** — base tool text transformed from the upstream OpenAPI spec; would *invert* (generator reads the catalogue), not move.
- **generated-from-repo-code** — emitted by a repo generator (server instructions, per-response hint); stays generated.
- **authored-template** — authored sentence frame + interpolated data; the template extracts, the data stays.
- **authored-framing-of-external** — Oak-authored framing wrapped around external EEF corpus.
- **external-copy** — verbatim external data (EEF corpus); cannot be rewritten, only cited.

### By source locus (where to point reviewers)
| Source locus | Items |
| --- | --- |
${table(meta.source_loci)}

**Where reviewers go for non-\`this-repo\` content:**

${Object.entries(meta.upstream_pointers).filter(([, v]) => v).map(([k, v]) => `- **${k}** — ${v}`).join('\n')}

### Risk flags (heuristic — for a review look, not confirmed defects)
| Flag | Items |
| --- | --- |
${table(meta.flags)}

- \`user-input-interpolation\` is a deliberately **broad superset** flag for a safety pass; the *confirmed* unguarded interpolation is teacher free-text \`classNotes\`.
- \`upstream-owned-base-text\` marks tool text whose base prose is authored in the oak-api OpenAPI spec, not this repo.
- \`possible-defect-reported\` marks items the audit flagged for a defect check (e.g. the "Use the this type" typo, stale "lessons" wording).

---

## Index by review domain
`;

for (const dom of DOMAIN_ORDER) {
  const group = items.filter((i) => i.review_domain === dom);
  if (!group.length) continue;
  md += `\n### ${dom} — ${group.length} items\n\n${DOMAIN_BLURB[dom] || ''}\n\n`;
  const byFile = group.reduce((m, it) => { (m[it.file] ||= []).push(it); return m; }, {});
  for (const file of Object.keys(byFile).sort()) {
    md += `<details><summary><code>${file}</code> — ${byFile[file].length}</summary>\n\n`;
    for (const it of byFile[file]) {
      const imp = it.impact_tier === 'high-impact' ? ' **⚑high-impact**' : '';
      const fl = it.flags.length ? ` \`${it.flags.join('` `')}\`` : '';
      const LOCUS_MARK = { 'upstream-in-house-api': ' **↑oak-api (OCA)**', 'upstream-in-house-ontology': ' **↑oak-curriculum-ontology**', 'upstream-in-house-skills': ' **↑oak-skills**', 'external-third-party': ' **⊗EEF-external**' };
      const locus = LOCUS_MARK[it.source_locus] || '';
      md += `- **${it.id}** _[${it.surface_type} · ${it.extraction_kind}]_${imp}${locus} **${esc(it.identifier)}** — ${esc(it.snippet).slice(0, 160)}${fl}\n`;
    }
    md += `\n</details>\n`;
  }
}

md += `\n---\n\n_Generated deterministically from \`registry.json\`. Regenerate with the build scripts recorded in the report's Method section._\n`;

writeFileSync(`${DIR}/registry.md`, md);
console.log('wrote registry.md —', md.length, 'chars,', items.length, 'items indexed');
