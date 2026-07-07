#!/usr/bin/env node

import { resolveRepoRoot } from '../core/repo-root.js';
import { buildConformanceNodeIo } from '../protocol-conformance/node-io.js';
import { runProtocolConformance } from '../protocol-conformance/report.js';

// projectDir is explicitly disabled: this tool reports on the tree it runs
// inside. The CLAUDE_PROJECT_DIR leg would rebind a worktree invocation to
// the primary checkout and silently report on the wrong estate.
const repoRoot = resolveRepoRoot(import.meta.url, { projectDir: undefined });

const { report, exitCode } = runProtocolConformance(buildConformanceNodeIo(repoRoot, process.env));
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
process.exitCode = exitCode;
