/**
 * Minimal newline-delimited JSON-RPC client over a child process's stdio,
 * used by the codex mcp-server probe. Deliberately dependency-free: the
 * probe must run on a fresh checkout before any build.
 *
 * Adapts the MCP stdio transport's framing — JSON-RPC messages delimited
 * by newlines on the child's stdin/stdout, no embedded newlines — from
 * the MCP specification:
 * https://modelcontextprotocol.io/specification/2025-06-18/basic/transports#stdio
 * Divergences from the full transport: dependency-free and probe-scoped,
 * so no message batching, no logging of the server's stderr (drained and
 * discarded, see below), and no capability negotiation beyond what the
 * probe itself asserts at initialize time.
 *
 * stderr is drained and discarded — a piped-but-unconsumed stderr can fill,
 * block the child, and deadlock an otherwise valid probe run.
 */
import { spawn } from 'node:child_process';

export class McpStdioSession {
  #child;
  #buffer = '';
  #nextId = 1;
  #pending = new Map();
  #callTimeoutMs;
  #terminalReason;
  #ended;
  #endedResolve;

  constructor(command, args, cwd, callTimeoutMs) {
    this.#callTimeoutMs = callTimeoutMs;
    this.#child = spawn(command, args, { cwd, stdio: ['pipe', 'pipe', 'pipe'] });
    this.#child.stderr.resume();
    this.#child.stdout.setEncoding('utf8');
    this.#child.stdout.on('data', (chunk) => this.#onData(chunk));
    // #ended resolves on EITHER exit or error: a spawn failure (ENOENT)
    // emits 'error' and is never guaranteed a later 'exit', so a
    // dispose() awaiting 'exit' alone can hang forever on a process
    // that never started.
    this.#ended = new Promise((resolve) => {
      this.#endedResolve = resolve;
    });
    this.#child.on('exit', (code) => {
      this.#endedResolve();
      this.#failAllPending(`server exited (code ${code})`);
    });
    this.#child.on('error', (error) => {
      this.#endedResolve();
      this.#failAllPending(`server error: ${error.message}`);
    });
    // A write callback receives its own failure, but the stream ALSO
    // emits 'error' (e.g. an async EPIPE when the child closes stdin
    // between the terminal check and a write) — unhandled, that event
    // crashes the process outside the controlled PROBE FAIL path.
    this.#child.stdin.on('error', (error) => {
      this.#failAllPending(`stdin error: ${error.message}`);
    });
  }

  request(method, params) {
    if (this.#terminalReason !== undefined) {
      return Promise.reject(new Error(`session already terminal: ${this.#terminalReason}`));
    }
    const id = this.#nextId;
    this.#nextId += 1;
    const payload = JSON.stringify({ jsonrpc: '2.0', id, method, params });
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.#pending.delete(id);
        reject(new Error(`timeout after ${this.#callTimeoutMs}ms waiting for ${method}`));
      }, this.#callTimeoutMs);
      this.#pending.set(id, { resolve, reject, timer, method });
      this.#child.stdin.write(`${payload}\n`, (writeError) => {
        if (writeError !== null && writeError !== undefined && this.#pending.has(id)) {
          this.#pending.delete(id);
          clearTimeout(timer);
          reject(new Error(`stdin write failed for ${method}: ${writeError.message}`));
        }
      });
    });
  }

  /**
   * Notification writes report failure through the returned promise —
   * a fire-and-forget write to a dead child's stdin emits an unhandled
   * EPIPE that bypasses the probe's controlled PROBE FAIL path.
   */
  notify(method, params) {
    if (this.#terminalReason !== undefined) {
      return Promise.reject(new Error(`session already terminal: ${this.#terminalReason}`));
    }
    const payload = JSON.stringify({ jsonrpc: '2.0', method, params });
    return new Promise((resolve, reject) => {
      this.#child.stdin.write(`${payload}\n`, (writeError) => {
        if (writeError !== null && writeError !== undefined) {
          reject(new Error(`stdin write failed for notification ${method}: ${writeError.message}`));
          return;
        }
        resolve();
      });
    });
  }

  /**
   * Terminates the child and resolves only once it has actually ended:
   * SIGTERM first, bounded SIGKILL escalation after 5s. An unawaited
   * kill() lets a slow or SIGTERM-ignoring server outlive disposal and
   * race the workspace inspection/removal that follows it. Awaits the
   * constructor's exit-or-error promise, so a spawn-failed child (which
   * may never emit 'exit') cannot hang disposal.
   */
  async dispose() {
    this.#failAllPending('session disposed');
    if (this.#child.exitCode !== null || this.#child.signalCode !== null) {
      return;
    }
    this.#child.kill();
    const killTimer = setTimeout(() => this.#child.kill('SIGKILL'), 5_000);
    await this.#ended;
    clearTimeout(killTimer);
  }

  #onData(chunk) {
    this.#buffer += chunk;
    let newlineIndex = this.#buffer.indexOf('\n');
    while (newlineIndex !== -1) {
      const line = this.#buffer.slice(0, newlineIndex).trim();
      this.#buffer = this.#buffer.slice(newlineIndex + 1);
      if (line.length > 0) {
        this.#onLine(line);
      }
      newlineIndex = this.#buffer.indexOf('\n');
    }
  }

  #onLine(line) {
    let message;
    try {
      message = JSON.parse(line);
    } catch {
      this.#failAllPending(
        `non-protocol line on stdout (MCP stdio requires every line to be a message): ${line.slice(0, 120)}`,
      );
      return;
    }
    if (typeof message !== 'object' || message === null || !('id' in message)) {
      return;
    }
    const entry = this.#pending.get(message.id);
    if (entry === undefined) {
      return;
    }
    this.#pending.delete(message.id);
    clearTimeout(entry.timer);
    if ('error' in message && message.error !== undefined) {
      entry.reject(new Error(`${entry.method} failed: ${JSON.stringify(message.error)}`));
      return;
    }
    entry.resolve(message.result);
  }

  /**
   * Terminal transport failures persist: pending requests reject now,
   * and every LATER request rejects immediately instead of queuing
   * against a dead child until its timeout.
   */
  #failAllPending(reason) {
    this.#terminalReason = reason;
    for (const [id, entry] of this.#pending) {
      this.#pending.delete(id);
      clearTimeout(entry.timer);
      entry.reject(new Error(reason));
    }
  }
}
