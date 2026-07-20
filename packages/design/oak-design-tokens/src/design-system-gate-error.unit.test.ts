import { describe, expect, it } from 'vitest';
import {
  DESIGN_SYSTEM_GATE_SOURCE,
  formatDesignSystemGateError,
} from './design-system-gate-error.js';

describe('formatDesignSystemGateError', () => {
  it('names the offending themes and paths for orphan overrides', () => {
    const message = formatDesignSystemGateError({
      source: DESIGN_SYSTEM_GATE_SOURCE,
      stage: 'coverage',
      error: {
        kind: 'orphan_overrides',
        orphans: [
          { theme: 'dark', paths: ['semantic.surface-page', 'semantic.text-primary'] },
          { theme: 'high-contrast', paths: ['component.badge-bg'] },
        ],
      },
    });

    expect(message).toContain('orphan_overrides');
    expect(message).toContain("theme 'dark'");
    expect(message).toContain('semantic.surface-page, semantic.text-primary');
    expect(message).toContain("theme 'high-contrast'");
    expect(message).toContain('component.badge-bg');
  });

  it('names the malformed node path and theme for invalid theme nodes', () => {
    const message = formatDesignSystemGateError({
      source: DESIGN_SYSTEM_GATE_SOURCE,
      stage: 'coverage',
      error: { kind: 'invalid_theme_node', theme: 'colour-safe', path: 'bg.primary' },
    });

    expect(message).toContain('invalid_theme_node');
    expect(message).toContain("malformed node at 'bg.primary' in theme 'colour-safe'");
  });

  it('names the reserved identifier for reserved-theme errors', () => {
    const message = formatDesignSystemGateError({
      source: DESIGN_SYSTEM_GATE_SOURCE,
      stage: 'coverage',
      error: { kind: 'reserved_theme_identifier', theme: 'base' },
    });

    expect(message).toContain('reserved_theme_identifier');
    expect(message).toContain("reserved theme identifier 'base'");
  });
});
