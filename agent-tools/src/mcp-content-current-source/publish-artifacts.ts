import { randomUUID } from 'node:crypto';
import { readFile, rename, rm, writeFile } from 'node:fs/promises';

export interface CurrentSourceArtifact {
  readonly path: string;
  readonly content: string;
}

export interface ArtifactPublicationFileSystem {
  readonly readText: (filePath: string) => Promise<string | null>;
  readonly stageText: (filePath: string, content: string) => Promise<string>;
  readonly replace: (stagedPath: string, targetPath: string) => Promise<void>;
  readonly remove: (filePath: string) => Promise<void>;
}

const nodeFileSystem: ArtifactPublicationFileSystem = {
  readText: async (filePath) =>
    readFile(filePath, 'utf8').catch((error: unknown) => {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'ENOENT'
      ) {
        return null;
      }
      throw error;
    }),
  stageText: async (filePath, content) => {
    const stagedPath = `${filePath}.stage-${randomUUID()}`;
    await writeFile(stagedPath, content, { encoding: 'utf8', flag: 'wx' });
    return stagedPath;
  },
  replace: rename,
  remove: (filePath) => rm(filePath, { force: true }),
};

interface StagedArtifact extends CurrentSourceArtifact {
  readonly original: string | null;
  readonly stagedPath: string;
}

async function stageArtifacts(
  artifacts: readonly CurrentSourceArtifact[],
  fileSystem: ArtifactPublicationFileSystem,
): Promise<readonly StagedArtifact[]> {
  const staged: StagedArtifact[] = [];
  try {
    for (const artifact of artifacts) {
      const original = await fileSystem.readText(artifact.path);
      const stagedPath = await fileSystem.stageText(artifact.path, artifact.content);
      staged.push({ ...artifact, original, stagedPath });
    }
    return staged;
  } catch (error: unknown) {
    await Promise.all(staged.map((artifact) => fileSystem.remove(artifact.stagedPath)));
    throw error;
  }
}

async function rollbackPublished(
  published: readonly StagedArtifact[],
  fileSystem: ArtifactPublicationFileSystem,
): Promise<void> {
  for (const artifact of [...published].reverse()) {
    if (artifact.original === null) {
      await fileSystem.remove(artifact.path);
      continue;
    }
    const rollbackPath = await fileSystem.stageText(artifact.path, artifact.original);
    await fileSystem.replace(rollbackPath, artifact.path);
  }
}

/**
 * Stages every output before publication and rolls earlier replacements back
 * when a later replacement fails.
 */
export async function publishCurrentSourceArtifacts(
  artifacts: readonly CurrentSourceArtifact[],
  fileSystem: ArtifactPublicationFileSystem = nodeFileSystem,
): Promise<void> {
  const staged = await stageArtifacts(artifacts, fileSystem);
  const published: StagedArtifact[] = [];
  try {
    for (const artifact of staged) {
      await fileSystem.replace(artifact.stagedPath, artifact.path);
      published.push(artifact);
    }
  } catch (error: unknown) {
    await rollbackPublished(published, fileSystem);
    throw error;
  } finally {
    await Promise.all(staged.map((artifact) => fileSystem.remove(artifact.stagedPath)));
  }
}
