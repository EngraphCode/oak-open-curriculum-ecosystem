/**
 * Shared fakes for the CLI wrapper dependency bundles.
 *
 * `withEsClient` and `withVerifiedBulkData` both take an injected
 * (logger, printers, exit-code setter) bundle (ADR-078), so both suites
 * need the same structurally-valid `Logger` and the same recording
 * printers. They live here rather than being copied per suite.
 *
 * Return types are named explicitly: exported helpers under `src/` are
 * declaration-emitted, and an inferred `vi.fn()` type is not portable.
 *
 * @example
 * ```ts
 * const deps = createFakeCliDeps();
 * await withEsClient(esClient, handler, deps);
 * expect(deps.setExitCode).toHaveBeenCalledWith(1);
 * ```
 */

import { vi, type Mock } from 'vitest';
import type { LogContextInput } from '@oaknational/logger';

/**
 * One recording `Logger` method. The rest parameter carries the
 * `error`/`fatal` overloads, which take an extra normalised-error
 * argument ahead of the context.
 */
type LoggerSpy = Mock<(message: string, ...rest: readonly unknown[]) => void>;

/** A structurally-valid `Logger` whose every method records its calls. */
export interface FakeLogger {
  readonly trace: LoggerSpy;
  readonly debug: LoggerSpy;
  readonly info: LoggerSpy;
  readonly warn: LoggerSpy;
  readonly error: LoggerSpy;
  readonly fatal: LoggerSpy;
}

/** A recording dependency bundle for the CLI wrappers. */
export interface FakeCliDeps {
  readonly logger: FakeLogger;
  readonly printError: Mock<(message: string) => void>;
  readonly printInfo: Mock<(message: string) => void>;
  readonly setExitCode: Mock<(code: number) => void>;
  readonly captureHandledError?: (error: unknown, context?: LogContextInput) => void;
}

/** Minimal fake logger satisfying the `Logger` interface. */
export function createFakeLogger(): FakeLogger {
  return {
    trace: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    fatal: vi.fn(),
  };
}

/**
 * Minimal fake dependency bundle for the CLI wrappers.
 *
 * Carries `printInfo` for `withVerifiedBulkData`; `withEsClient` ignores
 * the extra member.
 *
 * @param overrides - Supply a shared logger to assert on, or opt in to
 *   `captureHandledError` (absent by default, matching production where
 *   observability may be inactive).
 */
export function createFakeCliDeps(overrides?: {
  logger?: FakeLogger;
  captureHandledError?: (error: unknown, context?: LogContextInput) => void;
}): FakeCliDeps {
  return {
    logger: overrides?.logger ?? createFakeLogger(),
    printError: vi.fn(),
    printInfo: vi.fn(),
    setExitCode: vi.fn(),
    ...(overrides?.captureHandledError
      ? { captureHandledError: overrides.captureHandledError }
      : {}),
  };
}
