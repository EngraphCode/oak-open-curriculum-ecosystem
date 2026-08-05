import { Buffer } from 'node:buffer';

import { err, ok, unwrapErr, unwrapOrThrow, type Result } from '@oaknational/result';
import { describe, expect, it } from 'vitest';

import {
  createIdentitySecureFilePort,
  createSecureIdentityReadPort,
  type IdentityFileKind,
  type IdentityFileSystemPort,
} from './identity-secure-read.js';

const CHECKOUT = '/checkout';
const OWNER_ROOT = '/checkout/agent-tools/dist';
const SRC_DIR = '/checkout/agent-tools/dist/src';
const MEMBER = '/checkout/agent-tools/dist/src/member.js';

interface MemoryNode {
  readonly kind: IdentityFileKind;
  readonly bytes?: Uint8Array;
  readonly realpath?: string;
}

interface MemoryDescriptor {
  readonly path: string;
}

/**
 * Fail-closed in-memory filesystem port. Descriptors are opaque handles:
 * `fstat`, `read`, and `close` on a handle that is not currently live return
 * an EBADF-style error, so use-after-close and phantom reads fail by
 * construction instead of by assertion. `driftDuringRead` models one
 * concurrent rename landing between the descriptor read and the post-read
 * observation (TOCTOU); the drift is idempotent, so repeated reads are
 * order-independent.
 */
class MemoryIdentityFileSystem implements IdentityFileSystemPort<MemoryDescriptor> {
  readonly nodes = new Map<string, MemoryNode>();
  readonly #driftDuringRead: string | undefined;
  readonly #opened: string[] = [];
  readonly #live = new Set<MemoryDescriptor>();

  constructor(driftDuringRead?: string) {
    this.#driftDuringRead = driftDuringRead;
  }

  /** Every path a descriptor was successfully created against, in mint order. */
  get openedPaths(): readonly string[] {
    return Object.freeze([...this.#opened]);
  }

  /** Paths of descriptors that were opened and never closed. */
  get openDescriptorPaths(): readonly string[] {
    return Object.freeze([...this.#live].map(({ path }) => path));
  }

  lstat(path: string): Result<IdentityFileKind | undefined, Error> {
    return ok(this.nodes.get(path)?.kind);
  }

  realpath(path: string): Result<string, Error> {
    const node = this.nodes.get(path);
    return node === undefined ? err(new Error(`missing ${path}`)) : ok(node.realpath ?? path);
  }

  openReadNoFollow(path: string): Result<MemoryDescriptor, Error> {
    if (!this.nodes.has(path)) {
      return err(new Error(`missing ${path}`));
    }
    const descriptor: MemoryDescriptor = { path };
    this.#opened.push(path);
    this.#live.add(descriptor);
    return ok(descriptor);
  }

  fstat(handle: MemoryDescriptor): Result<IdentityFileKind, Error> {
    if (!this.#live.has(handle)) {
      return err(new Error(`EBADF: descriptor for ${handle.path} is not open`));
    }
    return ok(this.nodes.get(handle.path)?.kind ?? 'other');
  }

  read(handle: MemoryDescriptor): Result<Uint8Array, Error> {
    if (!this.#live.has(handle)) {
      return err(new Error(`EBADF: descriptor for ${handle.path} is not open`));
    }
    const node = this.nodes.get(handle.path);
    if (this.#driftDuringRead !== undefined) {
      this.nodes.set(this.#driftDuringRead, { kind: 'symlink' });
    }
    return node?.bytes === undefined ? err(new Error('unreadable')) : ok(node.bytes);
  }

  close(handle: MemoryDescriptor): Result<void, Error> {
    if (!this.#live.delete(handle)) {
      return err(new Error(`EBADF: descriptor for ${handle.path} is not open`));
    }
    return ok(undefined);
  }
}

function secureFixture(
  options: { readonly driftDuringRead?: string } = {},
): MemoryIdentityFileSystem {
  const fs = new MemoryIdentityFileSystem(options.driftDuringRead);
  for (const directory of ['/checkout/agent-tools', OWNER_ROOT, SRC_DIR]) {
    fs.nodes.set(directory, { kind: 'directory' });
  }
  fs.nodes.set(MEMBER, { kind: 'file', bytes: Buffer.from('export {};\n') });
  return fs;
}

describe('secure identity read over a filesystem port', () => {
  it('returns the member bytes and leaves no descriptor open', () => {
    const fs = secureFixture();
    const reader = createSecureIdentityReadPort(createIdentitySecureFilePort(fs));

    const bytes = unwrapOrThrow(
      reader.readRegularFileNoFollow({
        chainRoot: CHECKOUT,
        ownerRoot: OWNER_ROOT,
        path: MEMBER,
      }),
    );

    expect(Buffer.from(bytes).toString()).toBe('export {};\n');
    expect(fs.openedPaths).toEqual([MEMBER]);
    expect(fs.openDescriptorPaths).toEqual([]);
  });

  it('refuses a symlink ancestor without ever opening the leaf', () => {
    const fs = secureFixture();
    fs.nodes.set(SRC_DIR, { kind: 'symlink' });
    const reader = createSecureIdentityReadPort(createIdentitySecureFilePort(fs));

    const failure = unwrapErr(
      reader.readRegularFileNoFollow({
        chainRoot: CHECKOUT,
        ownerRoot: OWNER_ROOT,
        path: MEMBER,
      }),
    );

    expect(failure.message).toContain(`'${SRC_DIR}' is a symlink`);
    expect(fs.openedPaths).toEqual([]);
  });

  it('refuses bytes when the parent becomes a symlink during the read and leaves no descriptor open', () => {
    const fs = secureFixture({ driftDuringRead: SRC_DIR });
    const reader = createSecureIdentityReadPort(createIdentitySecureFilePort(fs));

    const failure = unwrapErr(
      reader.readRegularFileNoFollow({
        chainRoot: CHECKOUT,
        ownerRoot: OWNER_ROOT,
        path: MEMBER,
      }),
    );

    expect(failure.message).toContain(`'${SRC_DIR}' is a symlink`);
    expect(fs.openedPaths).toEqual([MEMBER]);
    expect(fs.openDescriptorPaths).toEqual([]);
  });
});
