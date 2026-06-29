import { readFile } from 'node:fs/promises';

import type { SessionMetadataFileSystem } from './file-system.js';

/** Production filesystem adapter — the only file here that touches `node:fs`. */
export const nodeSessionMetadataFileSystem: SessionMetadataFileSystem = {
  readFileUtf8: (absolutePath) => readFile(absolutePath, 'utf8'),
};
