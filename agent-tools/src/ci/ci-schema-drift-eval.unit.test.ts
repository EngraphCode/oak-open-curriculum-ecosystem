import { describe, expect, it } from 'vitest';

import { evaluateSchemaDrift } from './ci-schema-drift-eval.js';

describe('evaluateSchemaDrift', () => {
  it('reports no drift when the two texts are semantically identical but byte-different (key order + whitespace)', () => {
    const cached = '{\n  "info": { "version": "0.7.0", "title": "Oak" },\n  "paths": {}\n}\n';
    const live = '{"paths":{},"info":{"title":"Oak","version":"0.7.0"}}';

    expect(evaluateSchemaDrift(cached, live)).toEqual({ drifted: false });
  });

  it('reports drift when a value differs', () => {
    const cached = '{"info":{"version":"0.7.0"}}';
    const live = '{"info":{"version":"0.8.0"}}';

    expect(evaluateSchemaDrift(cached, live)).toEqual({ drifted: true });
  });

  it('reports drift when a key is added upstream', () => {
    const cached = '{"info":{"version":"0.7.0"}}';
    const live = '{"info":{"version":"0.7.0"},"servers":[]}';

    expect(evaluateSchemaDrift(cached, live)).toEqual({ drifted: true });
  });

  it('preserves array order — a reordered array is drift, not equality', () => {
    const cached = '{"tags":["a","b"]}';
    const live = '{"tags":["b","a"]}';

    expect(evaluateSchemaDrift(cached, live)).toEqual({ drifted: true });
  });

  it('falls back to a trimmed string compare when a side is not valid JSON', () => {
    expect(evaluateSchemaDrift('not json\n', 'not json')).toEqual({ drifted: false });
    expect(evaluateSchemaDrift('not json', 'other text')).toEqual({ drifted: true });
  });
});
