import { isErr, isOk } from '@oaknational/result';
import type { Result } from '@oaknational/result';
import { describe, expect, it } from 'vitest';

import {
  checkBeginsWithMetaExport,
  checkCompilesUnderHarness,
  checkEndsWithHarnessReturn,
  checkHarnessArtefactContract,
  checkNoForbiddenTimeSources,
  checkNoModuleSystem,
  checkSandboxPurity,
  checkWithinHarnessSizeCap,
} from './output-contract.js';

/**
 * The output contract is the machine enforcement of the harness sandbox rules on every
 * emitted artefact: shape (meta-first, return-last), determinism (no wall-clock or
 * randomness), self-containment (no module system), purity (no schema-library runtime),
 * size, and harness-shaped syntax. A violation fails the build — never a launch
 * checklist.
 */

const validArtefact = [
  'export const meta = { "name": "t", "description": "d", "phases": [] };',
  'async function main() {',
  '  log("ok");',
  '  return { result: true };',
  '}',
  'return await main();',
  '',
].join('\n');

function errorMessage(result: Result<undefined, Error>): string {
  if (result.ok) {
    expect.fail('expected a contract violation, got ok');
  }
  return result.error.message;
}

describe('checkBeginsWithMetaExport', () => {
  it('accepts an artefact whose first statement is the meta export', () => {
    expect(isOk(checkBeginsWithMetaExport(validArtefact))).toBe(true);
  });

  it('rejects an artefact that does not begin with the meta export', () => {
    expect(errorMessage(checkBeginsWithMetaExport(`var x = 1;\n${validArtefact}`))).toMatch(/meta/);
  });
});

describe('checkEndsWithHarnessReturn', () => {
  it('accepts an artefact ending with the top-level return', () => {
    expect(isOk(checkEndsWithHarnessReturn(validArtefact))).toBe(true);
  });

  it('rejects an artefact missing the trailing return', () => {
    expect(
      errorMessage(checkEndsWithHarnessReturn(validArtefact.replace('return await main();', ''))),
    ).toMatch(/return await main/);
  });
});

describe('checkNoForbiddenTimeSources', () => {
  it('accepts deterministic code, including Math.imul (the FNV jitter hash)', () => {
    expect(isOk(checkNoForbiddenTimeSources('const h = Math.imul(2166136261, 16777619);'))).toBe(
      true,
    );
  });

  it.each(['Date.now()', 'new Date()', 'Math.random()'])('rejects %s', (source) => {
    expect(errorMessage(checkNoForbiddenTimeSources(`const t = ${source};`))).toMatch(/forbidden/i);
  });
});

describe('checkNoModuleSystem', () => {
  it('accepts self-contained code', () => {
    expect(isOk(checkNoModuleSystem('async function main() { return 1; }'))).toBe(true);
  });

  it('accepts prose containing the word importance (word-boundary precision)', () => {
    expect(isOk(checkNoModuleSystem('const s = "rate the importance";'))).toBe(true);
  });

  it.each([
    'import { x } from "y";',
    'const m = require("fs");',
    'const p = process.env.HOME;',
    'import("dynamic");',
    'import fs from "node:fs";',
  ])('rejects module-system / Node usage: %s', (source) => {
    expect(errorMessage(checkNoModuleSystem(source))).toMatch(/self-contained/);
  });
});

describe('checkSandboxPurity', () => {
  it('accepts an artefact free of runtime schema/result libraries', () => {
    expect(isOk(checkSandboxPurity(validArtefact))).toBe(true);
  });

  it.each(['z.strictObject({})', 'safeParse(value)', 'ZodError', '@oaknational/result'])(
    'rejects a bundle that smuggled %s',
    (token) => {
      expect(errorMessage(checkSandboxPurity(`const leak = "${token}";`))).toMatch(/purity/i);
    },
  );
});

describe('checkWithinHarnessSizeCap', () => {
  it('accepts an artefact under the harness script cap', () => {
    expect(isOk(checkWithinHarnessSizeCap(validArtefact))).toBe(true);
  });

  it('rejects an artefact over the cap, naming both sizes', () => {
    expect(errorMessage(checkWithinHarnessSizeCap('x'.repeat(524_289)))).toMatch(/524288/);
  });
});

describe('checkCompilesUnderHarness', () => {
  it('accepts the valid artefact (meta line + body with top-level return compile as an async body)', () => {
    expect(isOk(checkCompilesUnderHarness(validArtefact))).toBe(true);
  });

  it('rejects an artefact whose body is not syntactically valid', () => {
    const broken = validArtefact.replace('return { result: true };', 'return { result: true ;');
    expect(errorMessage(checkCompilesUnderHarness(broken))).toMatch(/compile/i);
  });

  it('rejects an artefact that redeclares an injected sandbox global', () => {
    const colliding = validArtefact.replace(
      'async function main() {',
      'let log = 1;\nasync function main() {',
    );
    expect(errorMessage(checkCompilesUnderHarness(colliding))).toMatch(/compile/i);
  });
});

describe('checkHarnessArtefactContract', () => {
  it('passes the valid artefact through every check', () => {
    expect(isOk(checkHarnessArtefactContract(validArtefact))).toBe(true);
  });

  it('aggregates every violation into one error', () => {
    const doublyBroken = `var x = Date.now();\n${validArtefact.replace('return await main();', '')}`;
    const result = checkHarnessArtefactContract(doublyBroken);
    expect(isErr(result)).toBe(true);
    const message = errorMessage(result);
    expect(message).toMatch(/meta/);
    expect(message).toMatch(/forbidden/i);
    expect(message).toMatch(/return await main/);
  });
});
