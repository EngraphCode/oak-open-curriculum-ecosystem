/**
 * Deterministic per-worktree origin for the showcase's built-artefact
 * suite: sha256 of this WORKSPACE's absolute path folded into 4600-4999,
 * clear of the estate's fixed dev ports (3010 hub, 3020 showcase,
 * 3333/3334 MCP). One module owns the derivation so the Playwright
 * webServer and the suite's same-origin gate cannot drift apart (PR #637
 * review: a hostname-only gate silently admitted any port on localhost).
 * Derivation, not probing: Playwright evaluates the config once in the
 * main process and again in every worker, so the value must be stable
 * across evaluations (worked failure, MCP-384). No `process.env` access —
 * the adaptation comes from the machine, not the environment (config
 * follows the same DI principle as product code).
 */
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';

const workspaceRoot = resolve(import.meta.dirname, '..');
const digest = createHash('sha256').update(workspaceRoot).digest();

export const SHOWCASE_PORT = 4600 + (digest.readUInt16BE(0) % 400);
export const SHOWCASE_ORIGIN = `http://localhost:${SHOWCASE_PORT}`;
