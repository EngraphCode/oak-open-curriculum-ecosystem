import { unwrapErr } from '@oaknational/result';
import { describe, expect, it } from 'vitest';

import { validateCollaborationJsonFileText } from './collaboration-json-validation.js';

/**
 * The Result contract of the Ajv schema validator's own JSON boundary:
 * malformed text is a FAILURE VALUE, never a thrown escape from the
 * Result-typed slot. Every composed caller parses the text before this
 * validator runs, so this arm is unreachable through those paths — the pin
 * exists so the signature stays honest for the next direct caller.
 * Integration classification: the module walks to the schema directory at
 * import time and the validator reads the real schema files.
 */

describe('validateCollaborationJsonFileText', () => {
  it('returns malformed-JSON failures as Err instead of throwing past the Result channel', async () => {
    const result = await validateCollaborationJsonFileText(
      '.agent/state/collaboration/active-claims.json',
      '---\nnot json',
    );

    expect(unwrapErr(result)).toBeInstanceOf(SyntaxError);
  });
});
