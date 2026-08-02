/**
 * Tool-contract assertions for the codex mcp-server probe. Every fact the
 * probe record and Sif Annex A describe is asserted here — properties AND
 * required arrays for both tools, plus the authority-bearing input surface
 * — so a CLI that changes any part of the recorded contract fails a
 * re-probe instead of silently re-ratifying stale evidence.
 */

export function assertToolContract(tools) {
  const byName = new Map((tools.tools ?? []).map((tool) => [tool.name, tool]));
  const codexTool = byName.get('codex');
  const replyTool = byName.get('codex-reply');
  if (codexTool === undefined || replyTool === undefined) {
    throw new Error(`tool contract: expected codex + codex-reply, got ${[...byName.keys()].join(', ')}`);
  }
  assertCodexShape(codexTool);
  assertReplyShape(replyTool);
  assertAuthoritySurface(codexTool);
}

function assertCodexShape(codexTool) {
  if (!(codexTool.inputSchema?.required ?? []).includes('prompt')) {
    throw new Error('tool contract: codex input schema no longer requires prompt');
  }
  const outputRequired = codexTool.outputSchema?.required ?? [];
  for (const name of ['threadId', 'content']) {
    if (codexTool.outputSchema?.properties?.[name] === undefined || !outputRequired.includes(name)) {
      throw new Error(`tool contract: codex output schema no longer requires ${name}`);
    }
  }
}

function assertReplyShape(replyTool) {
  for (const name of ['threadId', 'prompt', 'conversationId']) {
    if (replyTool.inputSchema?.properties?.[name] === undefined) {
      throw new Error(`tool contract: codex-reply input schema no longer declares ${name}`);
    }
  }
  const required = [...(replyTool.inputSchema?.required ?? [])].sort();
  if (JSON.stringify(required) !== JSON.stringify(['prompt'])) {
    throw new Error(
      `tool contract: codex-reply required set is ${JSON.stringify(required)}, record says ` +
        'exactly ["prompt"] (threadId stays optional for back-compatibility)',
    );
  }
}

/**
 * The per-call authority surface recorded in probe-record.md: if a CLI
 * removes or reshapes ANY recorded property or enum, the recorded
 * broadening-surface observation is stale and the probe must fail.
 */
function assertAuthoritySurface(codexTool) {
  const properties = codexTool.inputSchema?.properties ?? {};
  const recordedProperties = [
    'sandbox',
    'approval-policy',
    'cwd',
    'model',
    'config',
    'base-instructions',
    'developer-instructions',
    'compact-prompt',
  ];
  for (const name of recordedProperties) {
    const schema = properties[name];
    if (typeof schema !== 'object' || schema === null) {
      throw new Error(
        `tool contract: codex input schema no longer carries an object schema for ${name} ` +
          `(found ${JSON.stringify(schema)}) — key presence alone is not acceptance: a ` +
          'false/boolean/rejecting shape means the recorded broadening surface is stale',
      );
    }
  }
  assertExactEnum(properties.sandbox, ['read-only', 'workspace-write', 'danger-full-access'], 'sandbox');
  assertExactEnum(properties['approval-policy'], ['untrusted', 'on-request', 'never'], 'approval-policy');
}

function assertExactEnum(property, recorded, label) {
  const actual = property?.enum ?? [];
  if (JSON.stringify([...actual].sort()) !== JSON.stringify([...recorded].sort())) {
    throw new Error(
      `tool contract: ${label} enum is ${JSON.stringify(actual)}, record says ` +
        `${JSON.stringify(recorded)} — record is stale`,
    );
  }
}
