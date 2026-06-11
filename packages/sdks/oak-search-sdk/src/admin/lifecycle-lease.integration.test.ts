import { describe, it, expect, vi } from 'vitest';
import { Client, errors } from '@elastic/elasticsearch';
import type { DiagnosticResult } from '@elastic/transport';
import { ok, err } from '@oaknational/result';
import { withLifecycleLease } from './lifecycle-lease.js';
import type { AdminError } from '../types/admin-types.js';

function createResponseError(statusCode: number, message: string): errors.ResponseError {
  const diagnosticResult: DiagnosticResult = {
    statusCode,
    headers: {},
    warnings: null,
    meta: {
      context: null,
      name: 'lifecycle-lease.integration.test',
      request: {
        params: { method: 'POST', path: '/_test', querystring: '' },
        options: {},
        id: 'test-request-id',
      },
      connection: null,
      attempts: 1,
      aborted: false,
    },
  };
  const responseError = new errors.ResponseError(diagnosticResult);
  responseError.message = message;
  return responseError;
}

function setupClient(): Client {
  const client = new Client({ node: 'http://localhost:9200' });
  vi.spyOn(client.indices, 'resolveIndex').mockResolvedValue({
    indices: [{ name: 'oak_lifecycle_leases', attributes: [] }],
    aliases: [],
    data_streams: [],
  });
  vi.spyOn(client, 'index').mockResolvedValue({
    _index: 'oak_lifecycle_leases',
    _id: 'lifecycle_lease_primary',
    _version: 1,
    _shards: { total: 1, successful: 1, failed: 0 },
    _seq_no: 7,
    _primary_term: 3,
    result: 'created',
  });
  vi.spyOn(client, 'delete').mockResolvedValue({
    _index: 'oak_lifecycle_leases',
    _id: 'lifecycle_lease_primary',
    _version: 1,
    _shards: { total: 1, successful: 1, failed: 0 },
    _seq_no: 8,
    _primary_term: 3,
    result: 'deleted',
  });
  return client;
}

describe('withLifecycleLease', () => {
  it('returns validation error and skips ES calls for invalid TTL', async () => {
    const client = setupClient();
    const result = await withLifecycleLease(client, 'primary', async () => ok('done'), {
      ttlMs: 1_000,
      holder: 'test-holder',
    });

    expect(result.ok).toBe(false);
    expect(client.index).not.toHaveBeenCalled();
    expect(client.delete).not.toHaveBeenCalled();
  });

  it('returns acquisition error when lease is already held and not expired', async () => {
    const client = setupClient();
    vi.spyOn(client, 'index').mockRejectedValue(createResponseError(409, 'version conflict'));
    vi.spyOn(client, 'get').mockResolvedValue({
      _index: 'oak_lifecycle_leases',
      _id: 'lifecycle_lease_primary',
      found: true,
      _version: 1,
      _seq_no: 5,
      _primary_term: 3,
      _source: {
        run_id: 'other-holder-999',
        holder: 'other-holder',
        target: 'primary',
        acquired_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 60_000).toISOString(),
      },
    });

    const result = await withLifecycleLease(client, 'primary', async () => ok('done'), {
      ttlMs: 60_000,
      holder: 'test-holder',
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.type).toBe('validation_error');
      expect(result.error.message).toContain('other-holder');
    }
    expect(client.delete).not.toHaveBeenCalled();
  });

  it('fails when lease resource exists as alias instead of concrete index', async () => {
    const client = setupClient();
    vi.spyOn(client.indices, 'resolveIndex').mockResolvedValue({
      indices: [],
      aliases: [{ name: 'oak_lifecycle_leases', indices: ['other_index'] }],
      data_streams: [],
    });

    const result = await withLifecycleLease(client, 'primary', async () => ok('done'), {
      ttlMs: 60_000,
      holder: 'test-holder',
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.type).toBe('validation_error');
      expect(result.error.message).toContain('concrete index');
    }
    expect(client.index).not.toHaveBeenCalled();
  });

  it('releases lease when execution succeeds', async () => {
    const client = setupClient();
    const result = await withLifecycleLease(client, 'primary', async () => ok('done'), {
      ttlMs: 60_000,
      holder: 'test-holder',
    });

    expect(result.ok).toBe(true);
    expect(client.delete).toHaveBeenCalledOnce();
  });

  it('does not release lease when execution fails', async () => {
    const client = setupClient();
    const executionError: AdminError = {
      type: 'validation_error',
      message: 'mutation failed',
    };
    const result = await withLifecycleLease(client, 'primary', async () => err(executionError), {
      ttlMs: 60_000,
      holder: 'test-holder',
    });

    expect(result.ok).toBe(false);
    expect(client.delete).not.toHaveBeenCalled();
  });

  it('returns release error when release fails after successful execution', async () => {
    const client = setupClient();
    vi.spyOn(client, 'delete').mockRejectedValue(createResponseError(503, 'es unavailable'));

    const result = await withLifecycleLease(client, 'primary', async () => ok('done'), {
      ttlMs: 60_000,
      holder: 'test-holder',
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.type).toBe('es_error');
      expect(result.error.message).toContain('Failed to release lifecycle lease');
    }
  });

  it('returns execution result when execution succeeds but renewal fails persistently', async () => {
    const client = setupClient();
    // Causal gate, not wall-clock: renewal N+1 can only be issued after
    // renewal N's outcome has been fully processed (the renewal loop's
    // single-in-flight invariant). The gate resolving on the SECOND
    // renewal issue therefore proves the first failed renewal has been
    // recorded before the work completes, under any scheduler load.
    let renewalIssues = 0;
    let firstFailureProcessed!: () => void;
    const gate = new Promise<void>((resolve) => {
      firstFailureProcessed = resolve;
    });
    vi.spyOn(client, 'index')
      .mockResolvedValueOnce({
        _index: 'oak_lifecycle_leases',
        _id: 'lifecycle_lease_primary',
        _version: 1,
        _shards: { total: 1, successful: 1, failed: 0 },
        _seq_no: 7,
        _primary_term: 3,
        result: 'created',
      })
      .mockImplementation(() => {
        renewalIssues += 1;
        if (renewalIssues >= 2) {
          firstFailureProcessed();
        }
        return Promise.reject(createResponseError(503, 'renew failed'));
      });

    const result = await withLifecycleLease(
      client,
      'primary',
      async () => {
        await gate;
        return ok('done');
      },
      { ttlMs: 10_000, holder: 'test-holder', renewalEveryMs: 5 },
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe('done');
    }
    expect(client.delete).not.toHaveBeenCalled();
  });

  it('returns renewal error when both execution and renewal fail', async () => {
    const client = setupClient();
    // Same causal gate as the persistent-failure test above: the second
    // renewal issue proves the first failure is recorded before the work
    // returns its own error.
    let renewalIssues = 0;
    let firstFailureProcessed!: () => void;
    const gate = new Promise<void>((resolve) => {
      firstFailureProcessed = resolve;
    });
    vi.spyOn(client, 'index')
      .mockResolvedValueOnce({
        _index: 'oak_lifecycle_leases',
        _id: 'lifecycle_lease_primary',
        _version: 1,
        _shards: { total: 1, successful: 1, failed: 0 },
        _seq_no: 7,
        _primary_term: 3,
        result: 'created',
      })
      .mockImplementation(() => {
        renewalIssues += 1;
        if (renewalIssues >= 2) {
          firstFailureProcessed();
        }
        return Promise.reject(createResponseError(503, 'renew failed'));
      });

    const executionError: AdminError = {
      type: 'validation_error',
      message: 'execution also failed',
    };
    const result = await withLifecycleLease(
      client,
      'primary',
      async () => {
        await gate;
        return err(executionError);
      },
      { ttlMs: 10_000, holder: 'test-holder', renewalEveryMs: 5 },
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toContain('renewal failed');
    }
    expect(client.delete).not.toHaveBeenCalled();
  });

  it('recovers from transient renewal failure when next renewal succeeds', async () => {
    const client = setupClient();
    // The recovery contract is causal, not temporal: fail once, then a
    // successful renewal clears the failure, then the work completes and
    // the lease releases normally. The gate resolves when the SECOND
    // successful renewal is issued — which (by the renewal loop's
    // single-in-flight invariant) proves the FIRST successful renewal's
    // outcome has been fully processed, i.e. the transient failure is
    // already cleared when the work completes. The previous shape raced
    // a real 5ms renewal interval against a real 40ms work timer; under
    // full-gate CPU load only the failing renewal fitted the window and
    // the lease was deliberately left unreleased (observed as the
    // "DeleteApi called 0 times" full-tree flake, 2026-06-10).
    let successfulRenewalIssues = 0;
    let recoveryProcessed!: () => void;
    const gate = new Promise<void>((resolve) => {
      recoveryProcessed = resolve;
    });
    vi.spyOn(client, 'index')
      .mockResolvedValueOnce({
        _index: 'oak_lifecycle_leases',
        _id: 'lifecycle_lease_primary',
        _version: 1,
        _shards: { total: 1, successful: 1, failed: 0 },
        _seq_no: 7,
        _primary_term: 3,
        result: 'created',
      })
      .mockRejectedValueOnce(createResponseError(503, 'transient failure'))
      .mockImplementation(() => {
        successfulRenewalIssues += 1;
        if (successfulRenewalIssues >= 2) {
          recoveryProcessed();
        }
        return Promise.resolve({
          _index: 'oak_lifecycle_leases',
          _id: 'lifecycle_lease_primary',
          _version: 3,
          _shards: { total: 1, successful: 1, failed: 0 },
          _seq_no: 9,
          _primary_term: 3,
          result: 'updated',
        });
      });

    const result = await withLifecycleLease(
      client,
      'primary',
      async () => {
        await gate;
        return ok('done');
      },
      { ttlMs: 10_000, holder: 'test-holder', renewalEveryMs: 5 },
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe('done');
    }
    expect(client.delete).toHaveBeenCalledOnce();
  });
});
