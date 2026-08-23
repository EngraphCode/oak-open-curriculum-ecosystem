#!/bin/bash
# Per-repo cloud-session setup hook for oak-open-curriculum-ecosystem.
#
# Invoked by the shared cloud environment setup script
# (.agent/claude-harness-integrations/cloud-environment-setup.sh) with the
# repo root as the working directory, AFTER `pnpm install` has run. Same
# fail-fast contract as the caller: any failure fails session creation.
set -euo pipefail

# Playwright browsers at the repo's pinned version, into the default cache
# path where turbo-spawned test:ui / e2e processes actually look. The image
# presets PLAYWRIGHT_BROWSERS_PATH and PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD for
# its own preinstalled Chromium; both must be unset so the repo-pinned
# version installs where the tests resolve it.
(cd apps/oak-curriculum-mcp-streamable-http \
  && env -u PLAYWRIGHT_BROWSERS_PATH -u PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD \
     pnpm exec playwright install --with-deps chromium)
