/**
 * Filesystem seam for the `session-metadata` topic.
 *
 * @remarks
 * A one-method port so the composition root reads a real transcript while unit
 * and integration tests inject a fake. Only the production adapter
 * (`file-system-node.ts`) touches `node:fs`.
 *
 * @packageDocumentation
 */

/** Read-only filesystem seam for reading a session transcript. */
export interface SessionMetadataFileSystem {
  /** Read a file's UTF-8 contents; may reject with any underlying IO error. */
  readonly readFileUtf8: (absolutePath: string) => Promise<string>;
}
