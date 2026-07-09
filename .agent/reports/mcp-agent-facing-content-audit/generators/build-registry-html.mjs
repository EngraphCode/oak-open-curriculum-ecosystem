#!/usr/bin/env node
// Generate a self-contained, WCAG 2.2 AA, filterable HTML browser over the registry.
// Usage: node build-registry-html.mjs   (run from repo root)
import { readFileSync, writeFileSync } from 'node:fs';

const REPO = process.cwd();
const DIR = `${REPO}/.agent/reports/mcp-agent-facing-content-audit`;
const reg = JSON.parse(readFileSync(`${DIR}/registry.json`, 'utf8'));
const { meta, items } = reg;

// Trim to display fields (keeps the embedded payload lean).
const rows = items.map((i) => ({
  id: i.id, f: i.file, n: i.identifier, st: i.surface_type,
  it: i.impact_tier, rd: i.review_domain, sl: i.source_locus, ek: i.extraction_kind,
  au: i.audience, fl: i.flags, s: (i.snippet || '').slice(0, 220),
}));

const eduSlice = rows.filter((r) => ['pedagogy', 'curriculum-accuracy', 'pedagogy-external'].includes(r.rd)).length;
const files = new Set(rows.map((r) => r.f)).size;

const LOCUS_LABEL = {
  'this-repo': 'this repo',
  'upstream-in-house-api': 'oak-api',
  'upstream-in-house-bulk': 'bulk export',
  'upstream-in-house-ontology': 'oak-curriculum-ontology',
  'upstream-in-house-skills': 'oak-skills',
  'external-third-party': 'EEF (external)',
};
const POINTERS = meta.upstream_pointers;

const kpi = (n, l) => `<div class="kpi"><span class="kpi-n">${n}</span><span class="kpi-l">${l}</span></div>`;
const opt = (o) => Object.entries(o).sort((a, b) => b[1] - a[1]).map(([k, v]) => `<option value="${k}">${k} (${v})</option>`).join('');

const html = `<title>Oak MCP agent-facing content registry</title>
<style>
:root{
  --bg:#fbfcfb;--surface:#ffffff;--surface-2:#f2f6f2;--text:#17251b;--muted:#55655b;
  --border:#d7e0d9;--accent:#1f6b2b;--accent-2:#e7f2e9;--focus:#0b5c8a;
  --chip-repo-bg:#e7f2e9;--chip-repo-tx:#1c5427;
  --chip-up-bg:#e6eefb;--chip-up-tx:#1c3f7a;
  --chip-skill-bg:#e0f1f0;--chip-skill-tx:#12554f;
  --chip-onto-bg:#eae7fb;--chip-onto-tx:#3a2f7a;
  --chip-ext-bg:#f5e9f7;--chip-ext-tx:#6a2172;
  --dom-bg:#eef1ef;--dom-tx:#33433a;
  --defect:#a11b2b;--defect-bg:#fbe7e9;--pii:#8a4b12;--pii-bg:#fbeede;
  --shadow:0 1px 2px rgba(20,40,26,.06),0 2px 8px rgba(20,40,26,.05);
}
@media (prefers-color-scheme:dark){:root{
  --bg:#0e1512;--surface:#161f1a;--surface-2:#1d2922;--text:#e7efe9;--muted:#9fb0a6;
  --border:#2a382f;--accent:#67c078;--accent-2:#17271c;--focus:#7fc7f0;
  --chip-repo-bg:#17301e;--chip-repo-tx:#88d597;
  --chip-up-bg:#152743;--chip-up-tx:#9dc0f2;
  --chip-skill-bg:#0f2f2c;--chip-skill-tx:#79cfc7;
  --chip-onto-bg:#211d3f;--chip-onto-tx:#b6acf0;
  --chip-ext-bg:#331535;--chip-ext-tx:#e2a7ea;
  --dom-bg:#1f2a24;--dom-tx:#c2cfc7;
  --defect:#f2909b;--defect-bg:#3a1116;--pii:#e6b073;--pii-bg:#3a2410;
  --shadow:none;
}}
:root[data-theme="light"]{
  --bg:#fbfcfb;--surface:#ffffff;--surface-2:#f2f6f2;--text:#17251b;--muted:#55655b;--border:#d7e0d9;--accent:#1f6b2b;--accent-2:#e7f2e9;--focus:#0b5c8a;
  --chip-repo-bg:#e7f2e9;--chip-repo-tx:#1c5427;--chip-up-bg:#e6eefb;--chip-up-tx:#1c3f7a;--chip-skill-bg:#e0f1f0;--chip-skill-tx:#12554f;--chip-onto-bg:#eae7fb;--chip-onto-tx:#3a2f7a;--chip-ext-bg:#f5e9f7;--chip-ext-tx:#6a2172;--dom-bg:#eef1ef;--dom-tx:#33433a;--defect:#a11b2b;--defect-bg:#fbe7e9;--pii:#8a4b12;--pii-bg:#fbeede;--shadow:0 1px 2px rgba(20,40,26,.06),0 2px 8px rgba(20,40,26,.05);
}
:root[data-theme="dark"]{
  --bg:#0e1512;--surface:#161f1a;--surface-2:#1d2922;--text:#e7efe9;--muted:#9fb0a6;--border:#2a382f;--accent:#67c078;--accent-2:#17271c;--focus:#7fc7f0;
  --chip-repo-bg:#17301e;--chip-repo-tx:#88d597;--chip-up-bg:#152743;--chip-up-tx:#9dc0f2;--chip-skill-bg:#0f2f2c;--chip-skill-tx:#79cfc7;--chip-onto-bg:#211d3f;--chip-onto-tx:#b6acf0;--chip-ext-bg:#331535;--chip-ext-tx:#e2a7ea;--dom-bg:#1f2a24;--dom-tx:#c2cfc7;--defect:#f2909b;--defect-bg:#3a1116;--pii:#e6b073;--pii-bg:#3a2410;--shadow:none;
}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--text);
  font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
  line-height:1.5;font-size:15px;-webkit-font-smoothing:antialiased}
.wrap{max-width:1200px;margin:0 auto;padding:32px 20px 80px}
header h1{font-size:clamp(1.5rem,1.1rem+1.6vw,2.1rem);font-weight:680;letter-spacing:-.01em;margin:0 0 6px;text-wrap:balance}
.lede{color:var(--muted);max-width:70ch;margin:0 0 4px}
.stance{display:inline-block;margin-top:12px;padding:8px 14px;border-radius:8px;background:var(--accent-2);
  color:var(--text);border:1px solid var(--border);font-size:.86rem;max-width:78ch}
.stance b{color:var(--accent)}
.kpis{display:flex;flex-wrap:wrap;gap:12px;margin:26px 0 8px}
.kpi{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:14px 18px;box-shadow:var(--shadow);min-width:120px}
.kpi-n{display:block;font-size:1.7rem;font-weight:680;font-variant-numeric:tabular-nums;letter-spacing:-.02em}
.kpi-l{display:block;font-size:.78rem;color:var(--muted);text-transform:uppercase;letter-spacing:.04em;margin-top:2px}
.controls{position:sticky;top:0;z-index:5;background:var(--bg);border-bottom:1px solid var(--border);
  padding:14px 0;margin:22px 0 6px;display:flex;flex-wrap:wrap;gap:10px 14px;align-items:end}
.field{display:flex;flex-direction:column;gap:4px}
.field label{font-size:.72rem;text-transform:uppercase;letter-spacing:.05em;color:var(--muted);font-weight:600}
.field select,.field input{font:inherit;padding:7px 10px;border:1px solid var(--border);border-radius:8px;
  background:var(--surface);color:var(--text);min-width:150px}
.field input{min-width:220px}
.count{margin-left:auto;align-self:center;color:var(--muted);font-size:.9rem;font-variant-numeric:tabular-nums}
button.reset{font:inherit;padding:7px 12px;border:1px solid var(--border);border-radius:8px;background:var(--surface);color:var(--text);cursor:pointer}
button.reset:hover{background:var(--surface-2)}
:focus-visible{outline:3px solid var(--focus);outline-offset:2px;border-radius:4px}
.tablewrap{overflow-x:auto;border:1px solid var(--border);border-radius:12px;background:var(--surface);box-shadow:var(--shadow)}
table{width:100%;border-collapse:collapse;font-size:.9rem}
caption{text-align:left;padding:12px 14px;color:var(--muted);font-size:.82rem;border-bottom:1px solid var(--border)}
th,td{text-align:left;padding:10px 12px;border-bottom:1px solid var(--border);vertical-align:top}
th{position:sticky;top:0;background:var(--surface-2);font-size:.74rem;text-transform:uppercase;letter-spacing:.04em;color:var(--muted);z-index:1}
tbody tr:hover{background:var(--surface-2)}
td.id{font-variant-numeric:tabular-nums;color:var(--muted);white-space:nowrap}
td.item .n{font-weight:600;display:block;margin-bottom:2px}
td.item .s{color:var(--muted);font-size:.85rem}
td.file code{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:.8rem;color:var(--muted);word-break:break-all}
.chip{display:inline-block;padding:2px 8px;border-radius:999px;font-size:.75rem;font-weight:600;white-space:nowrap}
.dom{background:var(--dom-bg);color:var(--dom-tx)}
.imp-high{background:var(--pii-bg);color:var(--pii);font-weight:700}
.imp-simple{background:var(--dom-bg);color:var(--muted)}
.sl-this-repo{background:var(--chip-repo-bg);color:var(--chip-repo-tx)}
.sl-upstream-in-house-api,.sl-upstream-in-house-bulk{background:var(--chip-up-bg);color:var(--chip-up-tx)}
.sl-upstream-in-house-skills{background:var(--chip-skill-bg);color:var(--chip-skill-tx)}
.sl-upstream-in-house-ontology{background:var(--chip-onto-bg);color:var(--chip-onto-tx)}
.sl-external-third-party{background:var(--chip-ext-bg);color:var(--chip-ext-tx)}
.flag{display:inline-block;font-size:.72rem;padding:1px 6px;border-radius:5px;margin:1px 2px 1px 0;border:1px solid var(--border);color:var(--muted)}
.flag.defect{background:var(--defect-bg);color:var(--defect);border-color:transparent;font-weight:600}
.flag.pii{background:var(--pii-bg);color:var(--pii);border-color:transparent;font-weight:600}
.legend{margin-top:26px;padding:18px;border:1px solid var(--border);border-radius:12px;background:var(--surface)}
.legend h2{font-size:1rem;margin:0 0 10px}
.legend dl{display:grid;grid-template-columns:max-content 1fr;gap:6px 14px;margin:0;font-size:.86rem}
.legend dt{font-weight:600}
.legend dd{margin:0;color:var(--muted)}
.empty{padding:40px;text-align:center;color:var(--muted)}
footer{margin-top:40px;color:var(--muted);font-size:.8rem;border-top:1px solid var(--border);padding-top:16px}
@media (prefers-reduced-motion:reduce){*{transition:none!important;animation:none!important}}
</style>

<div class="wrap">
<header>
  <h1>Oak MCP agent-facing content registry</h1>
  <p class="lede">Every piece of repo-controlled content that reaches an AI agent through the Oak Curriculum MCP server — the effective prompt agents receive — made discoverable and auditable, and routed to the expert who should review it.</p>
  <p class="stance"><b>Visibility only.</b> This is a snapshot for review, not a rulebook. No shape here has been ratified; nothing enforces it. It records <b>what exists and who should review it</b>, not whether it is good.</p>
  <div class="kpis">
    ${kpi(meta.item_count, 'content items')}
    ${kpi(meta.impact_tiers['high-impact'] || 0, 'high-impact (need protocols)')}
    ${kpi(eduSlice, 'education-review slice')}
    ${kpi(meta.source_loci['upstream-in-house-api'] || 0, 'from oak-api spec')}
    ${kpi(files, 'source files')}
  </div>
</header>

<div class="controls" role="search">
  <div class="field"><label for="q">Search text</label><input id="q" type="search" placeholder="identifier, snippet, file…" autocomplete="off"></div>
  <div class="field"><label for="it">Impact tier</label><select id="it"><option value="">all tiers</option>${opt(meta.impact_tiers)}</select></div>
  <div class="field"><label for="rd">Review domain</label><select id="rd"><option value="">all domains</option>${opt(meta.review_domains)}</select></div>
  <div class="field"><label for="sl">Source locus</label><select id="sl"><option value="">all sources</option>${opt(meta.source_loci)}</select></div>
  <div class="field"><label for="ek">Extraction kind</label><select id="ek"><option value="">all kinds</option>${opt(meta.extraction_kinds)}</select></div>
  <div class="field"><label for="fl">Flag</label><select id="fl"><option value="">any flag</option>${opt(meta.flags)}</select></div>
  <button class="reset" id="reset" type="button">Reset</button>
  <span class="count" id="count" aria-live="polite"></span>
</div>

<div class="tablewrap">
<table>
  <caption>Content items. Chips show the <strong>review domain</strong> (who audits) and the <strong>source locus</strong> (which repo owns the words). Sort is fixed; use the filters above.</caption>
  <thead><tr>
    <th scope="col">ID</th><th scope="col">Item</th><th scope="col">Impact</th><th scope="col">Review domain</th>
    <th scope="col">Source locus</th><th scope="col">Kind</th><th scope="col">File</th><th scope="col">Flags</th>
  </tr></thead>
  <tbody id="rows"></tbody>
</table>
</div>
<p class="empty" id="empty" hidden>No items match these filters. <button class="reset" type="button" onclick="document.getElementById('reset').click()">Clear filters</button></p>

<section class="legend" aria-labelledby="lg">
  <h2 id="lg">Where reviewers go for non-“this repo” content</h2>
  <dl>
    ${Object.entries(POINTERS).filter(([, v]) => v).map(([k, v]) => `<dt><span class="chip sl-${k}">${LOCUS_LABEL[k] || k}</span></dt><dd>${v.replace(/</g, '&lt;')}</dd>`).join('\n    ')}
  </dl>
</section>

<footer>
  Generated deterministically from <code>registry.json</code> (${meta.item_count} items, ${files} files) — two-pass exhaustive audit, adversarially verified. Curriculum data bytes from the API/bulk export are exempt; repo-authored framing/templates/guidance are in scope. Companions: <code>report.md</code> (analysis), <code>rendered-wholes.md</code> (surfaces assembled as an agent receives them).
</footer>
</div>

<script id="data" type="application/json">${JSON.stringify(rows).replace(/</g, '\\u003c')}</script>
<script>
(function(){
  var rows = JSON.parse(document.getElementById('data').textContent);
  var tb = document.getElementById('rows'), empty = document.getElementById('empty'), count = document.getElementById('count');
  var q = document.getElementById('q'), it = document.getElementById('it'), rd = document.getElementById('rd'), sl = document.getElementById('sl'), ek = document.getElementById('ek'), fl = document.getElementById('fl');
  var LOCUS = ${JSON.stringify(LOCUS_LABEL)};
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function flagHtml(f){var cls=f.indexOf('defect')>=0?'flag defect':(f.indexOf('pii')>=0?'flag pii':'flag');return '<span class="'+cls+'">'+esc(f)+'</span>'}
  function render(){
    var qs=q.value.trim().toLowerCase();
    var out=[], shown=0;
    for(var i=0;i<rows.length;i++){var r=rows[i];
      if(it.value&&r.it!==it.value)continue;
      if(rd.value&&r.rd!==rd.value)continue;
      if(sl.value&&r.sl!==sl.value)continue;
      if(ek.value&&r.ek!==ek.value)continue;
      if(fl.value&&r.fl.indexOf(fl.value)<0)continue;
      if(qs&&(r.n+' '+r.s+' '+r.f+' '+r.id).toLowerCase().indexOf(qs)<0)continue;
      shown++;
      out.push('<tr><td class="id">'+esc(r.id)+'</td>'+
        '<td class="item"><span class="n">'+esc(r.n)+'</span><span class="s">'+esc(r.s)+'</span></td>'+
        '<td><span class="chip '+(r.it==="high-impact"?"imp-high":"imp-simple")+'">'+esc(r.it)+'</span></td>'+
        '<td><span class="chip dom">'+esc(r.rd)+'</span></td>'+
        '<td><span class="chip sl-'+esc(r.sl)+'">'+esc(LOCUS[r.sl]||r.sl)+'</span></td>'+
        '<td>'+esc(r.ek)+'</td>'+
        '<td class="file"><code>'+esc(r.f)+'</code></td>'+
        '<td>'+(r.fl.length?r.fl.map(flagHtml).join(''):'<span class="s">—</span>')+'</td></tr>');
    }
    tb.innerHTML=out.join('');
    empty.hidden=shown!==0;
    count.textContent=shown+' of '+rows.length+' items';
  }
  [q,it,rd,sl,ek,fl].forEach(function(el){el.addEventListener('input',render)});
  document.getElementById('reset').addEventListener('click',function(){q.value='';it.value='';rd.value='';sl.value='';ek.value='';fl.value='';render();q.focus()});
  render();
})();
</script>`;

writeFileSync(`${DIR}/content-registry.html`, html);
console.log('wrote content-registry.html —', html.length, 'chars,', rows.length, 'rows embedded');
