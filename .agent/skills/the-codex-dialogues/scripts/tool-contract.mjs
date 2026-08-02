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
  for (const name of ['threadId', 'prompt']) {
    if (replyTool.inputSchema?.properties?.[name] === undefined) {
      throw new Error(`tool contract: codex-reply input schema no longer declares ${name}`);
    }
  }
  if (!(replyTool.inputSchema?.required ?? []).includes('prompt')) {
    throw new Error('tool contract: codex-reply input schema no longer requires prompt');
  }
}

/**
 * The per-call authority surface recorded in probe-record.md: if a CLI
 * removes or reshapes it, the recorded broadening-surface observation is
 * stale and the probe must fail.
 */
function assertAuthoritySurface(codexTool) {
  const properties = codexTool.inputSchema?.properties ?? {};
  for (const name of ['sandbox', 'approval-policy', 'cwd', 'model', 'config']) {
    if (properties[name] === undefined) {
      throw new Error(`tool contract: codex input schema no longer declares ${name}`);
    }
  }
  const sandboxEnum = properties.sandbox?.enum ?? [];
  for (const value of ['read-only', 'danger-full-access']) {
    if (!sandboxEnum.includes(value)) {
      throw new Error(`tool contract: sandbox enum no longer carries ${value} — record is stale`);
    }
  }
}
