import { describe, expect, it } from 'vitest';

import { openerCommand } from './opener-command.js';

// A probe URL, never the product default: the test proves the mapping,
// not the configured port.
const PROBE_URL = 'http://probe.example/showcase';

describe('openerCommand', () => {
  it.each([
    ['darwin', { command: 'open', args: [PROBE_URL] }],
    ['win32', { command: 'cmd', args: ['/c', 'start', '', PROBE_URL] }],
    ['linux', { command: 'xdg-open', args: [PROBE_URL] }],
    // freebsd pins the non-darwin/non-win32 arm as a DEFAULT, not a linux
    // special case.
    ['freebsd', { command: 'xdg-open', args: [PROBE_URL] }],
  ] as const)('hands the URL to the %s default browser handler', (osPlatform, expected) => {
    expect(openerCommand(PROBE_URL, osPlatform)).toEqual(expected);
  });
});
