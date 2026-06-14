#!/usr/bin/env node
/**
 * WS7 class-tiered archive-move runner — the curator-pass entrypoint of
 * ADR-199 §Decision / PDR-094.
 *
 * @remarks
 * Thin composition root over the tested {@link planArchiveMove} orchestrator. It
 * wires the `node:fs` IO, binds the fail-closed provenance gate
 * ({@link runProvenanceCheck}, composed inside the plan path), and builds the
 * bulk disposition ledger from the tier policy ({@link buildTierPolicyLedger}:
 * heartbeat → `routine`, legitimate because the cadence aggregate is conserved in
 * `.agent/reference/comms-heartbeat-cadence.md`, WS7 Task 2b; every other tier
 * surfaces as awaiting-disposition for the curator).
 *
 * **Dry-run by default**: it prints the plan (move / awaiting / blocked counts,
 * byte-preservation prediction, a manifest preview) and never mutates the
 * filesystem. The actual archive-move execution is deferred to WS7 slice 4 and is
 * owner/coordination-gated; passing `--execute` reports that and exits without
 * moving anything.
 *
 * @packageDocumentation
 */

import { join } from 'node:path';

import { buildTierPolicyLedger } from '../collaboration-state/archive/disposition-policy.js';
import { isEventFile, planArchiveMove } from '../collaboration-state/archive/archive-move.js';
import { createNodeArchiveMoveIo } from '../collaboration-state/archive/archive-move-node.js';
import { runProvenanceCheck } from '../collaboration-state/provenance/provenance-scan.js';
import { createNodeProvenanceScanIo } from '../collaboration-state/provenance/provenance-scan-node.js';
import type { ClassifiableEvent } from '../collaboration-state/archive/event-classification.js';
import { resolveRepoRoot } from '../core/repo-root.js';
import { writeErrorLine, writeLine } from '../core/terminal-output.js';

const HOUR_MS = 60 * 60 * 1000;
const RETENTION_WINDOWS = { heartbeatMs: 48 * HOUR_MS, coordinationMs: 7 * 24 * HOUR_MS };
const ROUTINE_BODY_LENGTH_THRESHOLD = 500;
const MANIFEST_PREVIEW_LIMIT = 5;

const repoRoot = resolveRepoRoot(import.meta.url);
const commsDir = join(repoRoot, '.agent/state/collaboration/comms');
const archiveDir = join(repoRoot, '.agent/state/collaboration/comms-archive');
const docRoots = [
  join(repoRoot, 'docs/architecture/architectural-decisions'),
  join(repoRoot, '.agent/practice-core/decision-records'),
  join(repoRoot, '.agent/memory/active/patterns'),
  join(repoRoot, '.agent/rules'),
  join(repoRoot, '.agent/directives'),
];
const digestPath = join(repoRoot, '.agent/reference/comms-cited-events.md');

const archiveIo = createNodeArchiveMoveIo();
const provenanceIo = createNodeProvenanceScanIo();

/** Read the live events once to build the bulk disposition ledger (fail-closed). */
function readLiveEvents(): ClassifiableEvent[] | null {
  const listed = archiveIo.listEventFilenames(commsDir);
  if (!listed.ok) {
    writeErrorLine(`comms-archive-move: FAILED — comms dir unreadable: ${listed.error}`);
    return null;
  }
  const events: ClassifiableEvent[] = [];
  for (const name of listed.value) {
    if (!isEventFile(name)) {
      continue;
    }
    const event = archiveIo.readEvent(join(commsDir, name));
    if (!event.ok) {
      writeErrorLine(`comms-archive-move: FAILED — event unreadable (${name}): ${event.error}`);
      return null;
    }
    events.push(event.value);
  }
  return events;
}

const liveEvents = readLiveEvents();
if (!liveEvents) {
  process.exitCode = 1;
} else {
  const ledger = buildTierPolicyLedger(liveEvents);
  const plan = planArchiveMove(
    {
      commsDir,
      archiveDir,
      nowMs: Date.now(),
      windows: RETENTION_WINDOWS,
      routineBodyLengthThreshold: ROUTINE_BODY_LENGTH_THRESHOLD,
      heartbeatAggregateExtracted: true,
      ledger,
    },
    archiveIo,
    (candidateEventIds) =>
      runProvenanceCheck(
        { eventDirs: [commsDir, archiveDir], docRoots, digestPath, candidateEventIds },
        provenanceIo,
      ),
  );

  if (!plan.ok) {
    writeErrorLine(`comms-archive-move: FAILED — ${plan.error.kind}`);
    process.exitCode = 1;
  } else {
    const { toMove, awaitingDisposition, blocked, bytePreservation, provenance } = plan.value;
    const blockedByReason = new Map<string, number>();
    for (const entry of blocked) {
      blockedByReason.set(entry.reason, (blockedByReason.get(entry.reason) ?? 0) + 1);
    }
    const blockedSummary =
      [...blockedByReason.entries()].map(([reason, n]) => `${reason}=${String(n)}`).join(', ') ||
      'none';

    writeLine('comms-archive-move: DRY-RUN (no files moved; --execute is deferred to WS7 slice 4)');
    writeLine(
      `  candidates moved: ${String(toMove.length)}; awaiting curator disposition: ${String(awaitingDisposition.length)}; blocked: ${String(blocked.length)} (${blockedSummary})`,
    );
    writeLine(
      `  provenance: ${String(provenance.citedEventIds.length)} cited / ${String(provenance.coveredEventIds.length)} covered / ${String(provenance.violations.length)} violations`,
    );
    writeLine(
      `  byte-preservation: ${String(bytePreservation.commsAfter)} comms + ${String(bytePreservation.archiveAfter)} archive == ${String(bytePreservation.preMoveTotal)} pre-move (${bytePreservation.balanced ? 'balanced' : 'IMBALANCED'})`,
    );
    for (const move of toMove.slice(0, MANIFEST_PREVIEW_LIMIT)) {
      writeLine(`  manifest: ${JSON.stringify(move.row)}`);
    }
    if (process.argv.includes('--execute')) {
      writeLine(
        '  --execute: archive-move execution is not yet implemented (WS7 slice 4, owner-gated).',
      );
    }
    // Only the fail-closed provenance gate (Inv-3) fails a dry-run. Blocked events
    // (e.g. body-read-required) and awaiting-disposition events are expected
    // curator work-list states — they stay live and are surfaced, not failed.
    if (provenance.violations.length > 0) {
      process.exitCode = 1;
    }
  }
}
