#!/usr/bin/env node
// Render the cohesive delivered WHOLES from the built SDK (exact where deterministic,
// {{placeholder}} where a value is runtime-supplied). Faithful, not reconstructed.
// Usage: node render-wholes.mjs <abs-path-to dist/public/mcp-tools.js>   (run from repo root)
import { writeFileSync } from 'node:fs';

const REPO = process.cwd();
const OUT = `${REPO}/.agent/reports/mcp-agent-facing-content-audit/rendered-wholes.md`;
const entry = process.argv[2];

const mcp = await import(entry);
const fence = (s) => '```text\n' + String(s).replace(/```/g, '`​``') + '\n```';
const parts = [];
const problems = [];

parts.push(`# Rendered wholes — the content as an agent receives it

Companion to \`report.md\` / \`registry.json\`. Where the registry lists a cohesive delivered surface as separate authored fragments, this file shows the **assembled whole** — rendered directly from the built SDK, so it is **exact** for deterministic content and marked with \`{{placeholder}}\` where a value is supplied at runtime (a user prompt argument, or interpolated curriculum data). Regenerate with \`render-wholes.mjs\`.

`);

// 1. SERVER INSTRUCTIONS (exact, delivered once on connection)
try {
  parts.push(`## 1. Server instructions — delivered once at connection\n\nExact. This is the whole string an agent receives in the MCP \`initialize\` response.\n\n${fence(mcp.SERVER_INSTRUCTIONS)}\n`);
} catch (e) { problems.push('SERVER_INSTRUCTIONS: ' + e.message); }

// 2. Per-response context hint (exact — from source; injected into every tool response)
parts.push(`## 2. Per-response context hint — injected into every tool response\n\nExact (\`OAK_CONTEXT_HINT\`, in \`structuredContent.oakContextHint\` of every response).\n\n${fence('If you have not called get-curriculum-model yet, do so before your next tool call — it provides the domain model and tool guidance needed for accurate results.')}\n`);

// 3. Server branding / Implementation (exact — from server-branding.ts)
parts.push(`## 3. Server identity (Implementation metadata)\n\nExact. Rendered in every MCP host's server list.\n\n${fence('title: Oak National Academy\ndescription: Search, explore, download and use Oak’s free, fully sequenced and resourced curriculum resources, for KS1 to KS4.\nwebsiteUrl: https://www.thenational.academy\nicons: [light acorn #287c34, dark acorn #ffffff] (data: URIs)')}\n`);

// 4. TOOLS — assembled title + description + params + annotations (exact)
try {
  const tools = mcp.listUniversalTools(mcp.generatedToolRegistry);
  parts.push(`## 4. Tools — assembled definitions (${tools.length})\n\nExact. Each is the full \`title\` + \`description\` (base + injected PREREQUISITE/notes) + parameter descriptions + behaviour annotations the agent sees in \`tools/list\`.\n`);
  for (const t of tools) {
    const d = t.definition ?? t;
    const name = d.name ?? t.name ?? '(unknown)';
    const title = d.annotations?.title ?? d.title ?? '';
    const desc = d.description ?? '';
    const ann = d.annotations ? `readOnly=${d.annotations.readOnlyHint} destructive=${d.annotations.destructiveHint} idempotent=${d.annotations.idempotentHint} openWorld=${d.annotations.openWorldHint}` : '(none)';
    // parameter descriptions from the input schema if present
    let params = '';
    const schema = d.inputSchema ?? d.toolInputJsonSchema ?? d.inputJsonSchema;
    if (schema?.properties) {
      params = Object.entries(schema.properties).map(([k, v]) => `  - ${k}: ${v?.description ?? '(no description)'}${v?.enum ? ` [enum: ${v.enum.join(', ')}]` : ''}`).join('\n');
    }
    parts.push(`### \`${name}\`${title ? ` — ${title}` : ''}\n\n${fence(desc)}\n\nParameters:\n${params || '  (none / not exposed here)'}\n\nAnnotations: ${ann}\n`);
  }
} catch (e) { problems.push('TOOLS: ' + e.message + '\n' + (e.stack || '')); }

// 5. PROMPTS — rendered messages with placeholder args (representative)
try {
  const prompts = mcp.MCP_PROMPTS ?? [];
  parts.push(`## 5. Prompts — assembled workflow messages (${prompts.length})\n\nRendered with \`{{arg}}\` placeholders where the user supplies a value. This is the message injected into the conversation when the prompt fires.\n`);
  for (const p of prompts) {
    const args = {};
    for (const a of (p.arguments ?? [])) args[a.name] = `{{${a.name}}}`;
    let rendered = '';
    try {
      const msgs = mcp.getPromptMessages(p.name, args);
      rendered = (Array.isArray(msgs) ? msgs : msgs?.messages ?? []).map((m) => {
        const c = m.content;
        const text = typeof c === 'string' ? c : (c?.text ?? JSON.stringify(c));
        return `[${m.role}] ${text}`;
      }).join('\n\n');
    } catch (e2) { rendered = '(could not render: ' + e2.message + ')'; problems.push(`prompt ${p.name}: ${e2.message}`); }
    const argList = (p.arguments ?? []).map((a) => `${a.name}${a.required ? '*' : ''}`).join(', ') || '(none)';
    parts.push(`### \`${p.name}\`\n\n${p.description ?? ''}\n\nArguments: ${argList}\n\n${fence(rendered)}\n`);
  }
} catch (e) { problems.push('PROMPTS: ' + e.message); }

// 6. Getting-started doc resource (exact)
try {
  parts.push(`## 6. Resource — \`docs://oak/getting-started\` (getting-started markdown)\n\nExact.\n\n${fence(mcp.getGettingStartedMarkdown())}\n`);
} catch (e) { problems.push('getGettingStartedMarkdown: ' + e.message); }

// 7. EEF interpretation resource (exact assembled markdown; corpus values are third-party)
try {
  const eef = mcp.getEefInterpretationMarkdown();
  parts.push(`## 7. Resource — \`eef://interpretation\` (assembled)\n\nExact assembled markdown. The interpolated corpus values (strand text, caveats, named authors) are external EEF content; the scaffold + agent-reasoning layer are Oak-authored. Truncated to first 3500 chars for length.\n\n${fence(eef.slice(0, 3500) + (eef.length > 3500 ? '\n…[truncated; full length ' + eef.length + ' chars]' : ''))}\n`);
} catch (e) { problems.push('getEefInterpretationMarkdown: ' + e.message); }

// 8. Curriculum-model resource (structural representative — large, part authored + API-derived slugs)
try {
  const cm = mcp.getCurriculumModelJson();
  const s = typeof cm === 'string' ? cm : JSON.stringify(cm, null, 2);
  const top = typeof cm === 'string' ? '(string)' : Object.keys(cm).join(', ');
  parts.push(`## 8. Resource/tool — \`curriculum://model\` / \`get-curriculum-model\` (representative)\n\nThe orientation payload delivered by the priority-1.0 resource and the \`get-curriculum-model\` tool. Large (${s.length} chars). Top-level keys: \`${top}\`. First 3000 chars shown; the whole is repo-authored domain model + tool guidance (subject/key-stage slug lists are OpenAPI-derived, display metadata authored).\n\n${fence(s.slice(0, 3000) + '\n…[truncated]')}\n`);
} catch (e) { problems.push('getCurriculumModelJson: ' + e.message); }

if (problems.length) parts.push(`## Render notes\n\nItems that could not be rendered exactly (fell back to source or omitted):\n\n${problems.map((p) => '- ' + p.split('\n')[0]).join('\n')}\n`);

writeFileSync(OUT, parts.join('\n'));
console.log('wrote rendered-wholes.md —', parts.join('\n').length, 'chars');
console.log('problems:', problems.length);
if (problems.length) console.log(problems.map((p) => p.split('\n')[0]).join('\n'));
