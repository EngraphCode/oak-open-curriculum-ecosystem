import type { Result } from '@oaknational/result';

/** File kinds needed to prove an identity member is a real regular file. */
export type IdentityFileKind = 'directory' | 'file' | 'symlink' | 'other';

/** Low-level no-follow filesystem operations used only by the production adapter. */
export interface IdentityFileSystemPort<Handle> {
  lstat(pathValue: string): Result<IdentityFileKind | undefined, Error>;
  realpath(pathValue: string): Result<string, Error>;
  openReadNoFollow(pathValue: string): Result<Handle, Error>;
  fstat(handle: Handle): Result<IdentityFileKind, Error>;
  read(handle: Handle): Result<Uint8Array, Error>;
  close(handle: Handle): Result<void, Error>;
}

/** Lexical containment asserted for one implementation-identity member. */
export interface ContainedIdentityRead {
  readonly chainRoot: string;
  readonly ownerRoot: string;
  readonly path: string;
}

/** One immutable lstat observation in the chain from root to leaf. */
export interface IdentityPathComponentObservation {
  readonly path: string;
  readonly kind: IdentityFileKind | undefined;
}

/** Complete immutable path observation checked before open or before accept. */
export interface IdentityPathObservation {
  readonly components: readonly IdentityPathComponentObservation[];
  readonly canonicalPath: string;
}

/** Phase-specific secure operations consumed by identity-read orchestration. */
export interface IdentitySecureFilePort<Handle> {
  canonicalRealpath(pathValue: string): Result<string, Error>;
  validateBeforeOpen(input: ContainedIdentityRead): Result<void, Error>;
  openNoFollow(pathValue: string): Result<Handle, Error>;
  readRegularDescriptor(input: ContainedIdentityRead, handle: Handle): Result<Uint8Array, Error>;
  validateBeforeAccept(input: ContainedIdentityRead): Result<void, Error>;
  close(handle: Handle): Result<void, Error>;
}

/** Secure reads consumed by implementation-identity closure discovery. */
export interface IdentityReadPort {
  canonicalRealpath(pathValue: string): Result<string, Error>;
  readRegularFileNoFollow(input: ContainedIdentityRead): Result<Uint8Array, Error>;
}
