/**
 * The `node:fs`-backed {@link ArchiveMoveIo} for the WS7 archive-move plan.
 *
 * @remarks
 * The one boundary where throwing libraries (`node:fs`, `JSON.parse`, the
 * schema-first {@link parseCommsEvent}) are translated into the repository
 * {@link Result} pattern (ADR-088): each fallible read catches and re-expresses
 * the failure as `err(message)`, keeping `archive-move.ts` IO-free and unit-
 * testable against an in-memory seam. Event reading reuses `parseCommsEvent` (the
 * canonical schema-first parser) rather than re-deriving the shape, and
 * `countEventFiles` reuses {@link isEventFile} so the byte-preservation count
 * covers event files only — never `manifest.jsonl` or `.gitkeep`.
 *
 * @packageDocumentation
 */

import { readdirSync, readFileSync } from 'node:fs';

import { err, ok } from '@oaknational/result';

import { parseCommsEvent } from '../state-parsers.js';
import { isEventFile } from './archive-move.js';
import type { ArchiveMoveIo } from './archive-move-types.js';
import { toClassifiableEvent } from './event-projection.js';

function errorMessage(cause: unknown): string {
  return cause instanceof Error ? cause.message : String(cause);
}

/** Build the `node:fs`-backed {@link ArchiveMoveIo}. */
export function createNodeArchiveMoveIo(): ArchiveMoveIo {
  return {
    listEventFilenames(commsDir) {
      try {
        return ok(readdirSync(commsDir));
      } catch (cause) {
        return err(errorMessage(cause));
      }
    },
    readEvent(path) {
      try {
        return ok(toClassifiableEvent(parseCommsEvent(readFileSync(path, 'utf8'))));
      } catch (cause) {
        return err(errorMessage(cause));
      }
    },
    countEventFiles(dir) {
      try {
        return ok(readdirSync(dir).filter(isEventFile).length);
      } catch (cause) {
        return err(errorMessage(cause));
      }
    },
  };
}
