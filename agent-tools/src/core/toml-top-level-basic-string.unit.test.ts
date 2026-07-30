import { describe, expect, it } from 'vitest';

import {
  createTopLevelTomlBasicStringReader,
  readOptionalTopLevelTomlBasicString,
} from './toml-top-level-basic-string.js';

describe('createTopLevelTomlBasicStringReader', () => {
  it('distinguishes omitted, string, and present non-string values', () => {
    const readValue = createTopLevelTomlBasicStringReader(`model = "gpt-5.6-sol"
invalid_model = 42
`);

    expect(
      readOptionalTopLevelTomlBasicString(readValue, 'omitted_model', 'adapter.toml'),
    ).toBeNull();
    expect(readOptionalTopLevelTomlBasicString(readValue, 'model', 'adapter.toml')).toBe(
      'gpt-5.6-sol',
    );
    expect(() =>
      readOptionalTopLevelTomlBasicString(readValue, 'invalid_model', 'adapter.toml'),
    ).toThrow("adapter.toml TOML key 'invalid_model' must be a string when present.");
  });
});
