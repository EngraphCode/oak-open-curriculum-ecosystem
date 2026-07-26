/**
 * Shape tests for the widget-URI composition surface.
 *
 * `BASE_WIDGET_URI` is a module-level constant composed from
 * `process.env` at evaluation time — the one sanctioned composition
 * point for the widget URI (`no-global-state-in-tests` reserves ambient
 * reads for composition roots). Testing the constant necessarily
 * evaluates that composition, so the assertions here are
 * environment-robust: they accept both the local and the deployed
 * suffix shape. The resolver's branch logic is covered injected-only in
 * `widget-uri-suffix.unit.test.ts`.
 *
 * @see cross-domain-constants.ts — source of truth for widget constants
 */

import { describe, it, expect } from 'vitest';
import { BASE_WIDGET_URI } from './cross-domain-constants.js';

describe('BASE_WIDGET_URI', () => {
  it('follows the ui://widget/ URI scheme', () => {
    expect(BASE_WIDGET_URI).toMatch(/^ui:\/\/widget\/.+\.html$/);
  });

  it('includes a hash or local suffix for cache-busting', () => {
    // Local dev: "local", deployed: 8-char hex derived from the build identifier
    expect(BASE_WIDGET_URI).toMatch(/-(local|[a-f0-9]{8})\.html$/);
  });
});
