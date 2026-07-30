/**
 * System-state test for local socket binding under the e2e harness
 * (MCP-403).
 *
 * The state described: a harness request reaches the app it targets even
 * when foreign processes occupy v4-loopback ports in the ephemeral range.
 * Without the loopback-pinned harness, a supertest-created server binds
 * the IPv6 any-address (`::`) while the client dials `127.0.0.1`; a
 * foreign v4-specific listener on the same port then receives the
 * request — observed live as the client parse error
 * `HPE_INVALID_CONSTANT` from a non-HTTP Java listener and as foreign
 * 400s from an HTTP one, only under concurrent-graph load.
 *
 * Red-evidence limitation, stated per the testing doctrine: the cured
 * allocator (an explicit `127.0.0.1:0` bind) skips occupied v4 ports BY
 * CONSTRUCTION, so a collision cannot be forced deterministically from
 * inside the cured harness. The red state's evidence is the recorded
 * probe: a foreign v4-specific listener and a `::` bind coexisting on one
 * port, with the exact parse-error signature on connect (MCP-403 design
 * comments, 2026-07-30). This test pins the reachability contract the
 * cure provides; the interleave/ownership behaviour tests live with the
 * helper (`src/test-helpers/loopback-request.unit.test.ts`).
 */
import { describe, it, expect } from 'vitest';
import net from 'node:net';
import { once } from 'node:events';
import express from 'express';
import { request, harnessAddress } from '../src/test-helpers/loopback-request.js';

describe('local socket binding under the e2e harness (MCP-403)', () => {
  it('reaches the targeted app while foreign v4 listeners occupy ambient loopback ports', async () => {
    // Model the resident foreign services: plain TCP listeners holding
    // v4-specific loopback binds while the harness serves.
    const foreignListeners = await Promise.all(
      Array.from({ length: 4 }, async () => {
        const foreign = net.createServer();
        foreign.listen(0, '127.0.0.1');
        await once(foreign, 'listening');
        return foreign;
      }),
    );
    try {
      const app = express();
      app.get('/marker', (_req, res) => {
        res.send('reached-the-right-server');
      });

      const res = await request(app).get('/marker');
      expect(res.status).toBe(200);
      expect(res.text).toBe('reached-the-right-server');

      // The harness owns the v4 side of its port outright: the address
      // family and host are the ones the client dials, so no foreign
      // process can hold the same (address, port) pair.
      const address = harnessAddress();
      expect(address.address).toBe('127.0.0.1');
      expect(address.family).toBe('IPv4');
    } finally {
      await Promise.all(
        foreignListeners.map(async (foreign) => {
          foreign.close();
          await once(foreign, 'close');
        }),
      );
    }
  });
});
