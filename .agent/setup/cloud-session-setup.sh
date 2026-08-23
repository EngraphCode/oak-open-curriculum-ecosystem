#!/bin/bash
# Per-repo cloud-session setup hook for oak-open-curriculum-ecosystem.
#
# Invoked by the shared cloud environment setup script
# (.agent/claude-harness-integrations/cloud-environment-setup.sh) with the
# repo root as the working directory, AFTER `pnpm install` has run. Same
# fail-fast contract as the caller: any failure fails session creation.
set -euo pipefail

# Playwright browsers at the repo's pinned version. PLAYWRIGHT_BROWSERS_PATH
# is deliberately inherited: turbo-spawned test:ui / e2e processes resolve
# browsers through whatever path the session environment carries (the cloud
# image presets /opt/pw-browsers), so the install must target that same path
# for install and lookup to agree — only the image's download suppression
# (PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD) is unset.
(cd apps/oak-curriculum-mcp-streamable-http \
  && env -u PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD \
     pnpm exec playwright install --with-deps chromium)
