/**
 * Minimal newline-delimited JSON-RPC client over a child process's stdio,
 * used by the codex mcp-server probe. Deliberately dependency-free: the
 * probe must run on a fresh checkout before any build.
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

  constructor(command, args, cwd, callTimeoutMs) {
    this.#callTimeoutMs = callTimeoutMs;
    this.#child = spawn(command, args, { cwd, stdio: ['pipe', 'pipe', 'pipe'] });
    this.#child.stderr.resume();
    this.#child.stdout.on('data', (chunk) => this.#onData(chunk));
    this.#child.on('exit', (code) => this.#failAllPending(`server exited (code ${code})`));
  }

  request(method, params) {
    const id = this.#nextId;
    this.#nextId += 1;
    const payload = JSON.stringify({ jsonrpc: '2.0', id, method, params });
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.#pending.delete(id);
        reject(new Error(`timeout after ${this.#callTimeoutMs}ms waiting for ${method}`));
      }, this.#callTimeoutMs);
      this.#pending.set(id, { resolve, reject, timer, method });
      this.#child.stdin.write(`${payload}\n`);
    });
  }

  notify(method, params) {
    this.#child.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', method, params })}\n`);
  }

  dispose() {
    this.#failAllPending('session disposed');
    this.#child.kill();
  }

  #onData(chunk) {
    this.#buffer += chunk.toString('utf8');
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

  #failAllPending(reason) {
    for (const [id, entry] of this.#pending) {
      this.#pending.delete(id);
      clearTimeout(entry.timer);
      entry.reject(new Error(reason));
    }
  }
}
