#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { err, isErr, ok, type Result } from '@oaknational/result';
import { z } from 'zod';

import { scanArgs, type ValueHandler } from '../core/cli-arg-parser.js';
import { parseWithSchema } from '../core/schema-parse.js';
import { resolveRepoRoot } from '../core/repo-root.js';
import { writeErrorLine, writeLine } from '../core/terminal-output.js';
import { parseJsonDocument } from '../refounding/refounding-artefacts.js';
import {
  resolveReadPathWithinRepo,
  resolveWriteTargetWithinRepo,
} from '../refounding/refound-path-resolve.js';
import { extractAuditClaimsRequired } from './plan-state-audit-adapter.js';
import { extractGateClaimsAll, type PlanFileInput } from './plan-state-gate-adapter.js';
import {
  decideGateVerdict,
  derivePlanState,
  serialisePlanStateReport,
  type PlanStateInput,
} from './plan-state-engine.js';
import {
  evidenceVerdictSchema,
  parsePlanStateTable,
  PLAN_STATE_REPORT_BASENAME,
  type ClaimRow,
  type EvidenceVerdict,
  type PlanStateReport,
  type PlanStateTable,
} from './plan-state-model.js';
import { STATUS_MAPPING_TABLE_V1 } from './status-mapping/v1.js';

/**
 * `plan-state` — the R0b recomputation gate (F5: one engine, two adapters);
 * a thin IO shell — every verdict decision is pure in `plan-state-engine.ts`.
 *
 * Modes (exactly one): `--plan <path>` (repeatable; the PERMANENT gate over
 * V0/V0.1 plan frontmatter) or `--census <path>` (the DISPOSABLE audit mode
 * over `claim-census.v1.jsonl`; r1 feeds it from the frozen artefact home).
 * `--status-mapping <path>` injects a versioned table (default: the in-code
 * `STATUS_MAPPING_TABLE_V1`, OG-2 ratification pending); `--evidence <path>`
 * injects recomputation verdicts (a JSON array — the DI seam; executors are
 * r1 machinery, deferred by design); `--report <path>` writes the byte-stable
 * report AFTER a successful derivation only; every path is repo-constrained.
 *
 * @packageDocumentation
 */

const TOOL = 'plan-state';
const repoRoot = resolveRepoRoot(import.meta.url);

const USAGE =
  'usage: plan-state (--plan <path> [--plan <path>...] | --census <path>) ' +
  `[--status-mapping <path>] [--evidence <path>] [--report <path>, e.g. ${PLAN_STATE_REPORT_BASENAME}]`;

interface PlanStateArgs {
  planPaths: string[];
  censusPath: string;
  statusMappingPath: string;
  evidencePath: string;
  reportPath: string;
}

const VALUE_OPTIONS: Readonly<Record<string, ValueHandler<PlanStateArgs>>> = {
  '--plan': (state, value) => {
    state.planPaths.push(value);
  },
  '--census': (state, value) => {
    state.censusPath = value;
  },
  '--status-mapping': (state, value) => {
    state.statusMappingPath = value;
  },
  '--evidence': (state, value) => {
    state.evidencePath = value;
  },
  '--report': (state, value) => {
    state.reportPath = value;
  },
};

/** Parse the flags; exactly one of the two modes must be selected. */
function parseArgs(argv: readonly string[]): Result<PlanStateArgs, Error> {
  const scanned = scanArgs<PlanStateArgs>(
    argv,
    { planPaths: [], censusPath: '', statusMappingPath: '', evidencePath: '', reportPath: '' },
    { flags: {}, valueOptions: VALUE_OPTIONS, helpText: USAGE },
  );
  if (!scanned.ok) {
    return err(new Error(scanned.error));
  }
  const gateMode = scanned.state.planPaths.length > 0;
  const auditMode = scanned.state.censusPath !== '';
  if (gateMode === auditMode) {
    return err(new Error(`exactly one of --plan or --census is required\n${USAGE}`));
  }
  return ok(scanned.state);
}

/** Read one repo-constrained file as UTF-8. */
async function readRepoFile(flagPath: string): Promise<Result<string, Error>> {
  const resolved = resolveReadPathWithinRepo(repoRoot, flagPath);
  if (isErr(resolved)) {
    return resolved;
  }
  return ok(await readFile(resolved.value, 'utf8'));
}

/** The injected or default status-mapping table. */
async function loadTable(args: PlanStateArgs): Promise<Result<PlanStateTable, Error>> {
  if (args.statusMappingPath === '') {
    return ok(STATUS_MAPPING_TABLE_V1);
  }
  const text = await readRepoFile(args.statusMappingPath);
  if (isErr(text)) {
    return text;
  }
  const document = parseJsonDocument('status-mapping table', text.value);
  if (isErr(document)) {
    return document;
  }
  return parsePlanStateTable(document.value);
}

/** The injected evidence verdicts (empty without the flag). */
async function loadEvidence(
  args: PlanStateArgs,
): Promise<Result<readonly EvidenceVerdict[], Error>> {
  if (args.evidencePath === '') {
    return ok([]);
  }
  const text = await readRepoFile(args.evidencePath);
  if (isErr(text)) {
    return text;
  }
  const document = parseJsonDocument('evidence file', text.value);
  if (isErr(document)) {
    return document;
  }
  return parseWithSchema({
    label: 'evidence file',
    schema: z.array(evidenceVerdictSchema),
    value: document.value,
  });
}

/** The claim rows for the selected mode. */
async function loadClaims(args: PlanStateArgs): Promise<Result<readonly ClaimRow[], Error>> {
  if (args.censusPath !== '') {
    const text = await readRepoFile(args.censusPath);
    if (isErr(text)) {
      return text;
    }
    return extractAuditClaimsRequired(text.value);
  }
  const inputs: PlanFileInput[] = [];
  for (const planPath of args.planPaths) {
    const text = await readRepoFile(planPath);
    if (isErr(text)) {
      return text;
    }
    inputs.push({ path: planPath, content: text.value });
  }
  return extractGateClaimsAll(inputs);
}

/** Report one failure and set the process exit code. */
function fail(error: Error): void {
  writeErrorLine(`${TOOL}: ${error.message}`);
  process.exitCode = 1;
}

/** Load and compose the engine's full input for the selected mode. */
async function loadInputs(args: PlanStateArgs): Promise<Result<PlanStateInput, Error>> {
  const table = await loadTable(args);
  if (isErr(table)) {
    return table;
  }
  const evidence = await loadEvidence(args);
  if (isErr(evidence)) {
    return evidence;
  }
  const claims = await loadClaims(args);
  if (isErr(claims)) {
    return claims;
  }
  return ok({ claims: claims.value, evidence: evidence.value, table: table.value });
}

/** Write the report when requested — after a successful derivation only. */
async function writeReportIfRequested(
  args: PlanStateArgs,
  report: PlanStateReport,
): Promise<Result<null, Error>> {
  if (args.reportPath === '') {
    return ok(null);
  }
  const target = resolveWriteTargetWithinRepo(repoRoot, args.reportPath);
  if (isErr(target)) {
    return target;
  }
  await writeFile(target.value, serialisePlanStateReport(report), 'utf8');
  return ok(null);
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  if (isErr(args)) {
    fail(args.error);
    return;
  }
  const inputs = await loadInputs(args.value);
  if (isErr(inputs)) {
    fail(inputs.error);
    return;
  }
  const report = derivePlanState(inputs.value);
  if (isErr(report)) {
    fail(report.error);
    return;
  }
  const written = await writeReportIfRequested(args.value, report.value);
  if (isErr(written)) {
    fail(written.error);
    return;
  }
  const verdict = decideGateVerdict(report.value);
  for (const line of verdict.lines) {
    writeLine(`${TOOL}: ${line}`);
  }
  process.exitCode = verdict.exitCode;
}

/** True when this module is the process's CLI entry (repo-check.ts pattern). */
function isCliEntryPoint(): boolean {
  const entryPoint = process.argv[1];
  if (entryPoint === undefined) {
    return false;
  }
  return import.meta.url === pathToFileURL(path.resolve(entryPoint)).href;
}

if (isCliEntryPoint()) {
  await main();
}
