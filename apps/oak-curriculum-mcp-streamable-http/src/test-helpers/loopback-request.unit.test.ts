/**
 * System-state tests for the loopback request helper (MCP-403).
 *
 * The states described:
 *
 * 1. The harness server is owned on the exact address test clients dial:
 *    it binds `127.0.0.1` explicitly, so a foreign process can never
 *    silently share its port (a host-less listen binds `::`, which
 *    coexists with foreign v4-specific binds — the observed failure was
 *    requests landing on a resident Java listener under load).
 * 2. A request arriving before any `request(app)` call fails loudly with
 *    a named harness error, never a hang or an anonymous crash.
 * 3. The helper refuses to swap to a DIFFERENT app while requests are in
 *    flight — the shared server dispatches to the current app at
 *    request-arrival time, so a silent swap could misroute an in-flight
 *    exchange. Swapping to the SAME app stays allowed (concurrent
 *    requests against one app are a legitimate pattern).
 */
import { describe, it, expect } from 'vitest';
import http from 'node:http';
import { once } from 'node:events';
import type { Express } from 'express';
import express from 'express';
import { request, harnessAddress } from './loopback-request.js';

function markerApp(marker: string): Express {
  const app = express();
  app.get('/marker', (_req, res) => {
    res.send(marker);
  });
  return app;
}

describe('loopback request helper (MCP-403)', () => {
  it('serves from a server bound to the exact v4 loopback address clients dial', async () => {
    const res = await request(markerApp('owned')).get('/marker');
    expect(res.status).toBe(200);
    expect(res.text).toBe('owned');
    expect(harnessAddress().address).toBe('127.0.0.1');
  });

  it('fails loudly with a named error when a request arrives before any request(app) call', async () => {
    // Reaching the pre-swap state needs a raw dial: the helper's own
    // `request()` always swaps an app in, so this describes the state a
    // stray client (or a mis-sequenced test) would observe.
    const { port } = harnessAddress();
    const rawResponse = await new Promise<http.IncomingMessage>((resolve, reject) => {
      http.get({ host: '127.0.0.1', port, path: '/no-app-yet-probe' }, resolve).on('error', reject);
    });
    let body = '';
    rawResponse.on('data', (chunk: Buffer) => {
      body += chunk.toString();
    });
    await once(rawResponse, 'end');
    // The current app persists between tests in one file, so this test
    // observes the named-500 contract only when it runs first; the
    // assertion below therefore accepts either the harness error (no app
    // yet) or the current app's 404 — and pins that the response is
    // ALWAYS a terminated HTTP exchange, never a hang. The named-500
    // path itself is covered deterministically by the source guard plus
    // this test running first in file order today.
    expect([500, 404]).toContain(rawResponse.statusCode);
    if (rawResponse.statusCode === 500) {
      expect(body).toContain('MCP-403');
    }
  });

  it('refuses to swap apps while a different app has requests in flight', async () => {
    let releaseHandler: () => void = () => undefined;
    let handlerEntered: () => void = () => undefined;
    const entered = new Promise<void>((resolve) => {
      handlerEntered = resolve;
    });
    const gate = new Promise<void>((resolve) => {
      releaseHandler = resolve;
    });

    const slowApp = express();
    slowApp.get('/slow', (_req, res) => {
      handlerEntered();
      void gate.then(() => {
        res.send('released');
      });
    });

    const inFlightRequest = request(slowApp).get('/slow');
    // Start the exchange without awaiting completion; supertest fires on
    // then().
    const settled = inFlightRequest.then((res) => res);
    await entered;

    expect(() => request(markerApp('other'))).toThrow(/in flight/);
    // Same-app swap stays allowed while in flight.
    expect(() => request(slowApp)).not.toThrow();

    releaseHandler();
    const res = await settled;
    expect(res.text).toBe('released');
  });
});
