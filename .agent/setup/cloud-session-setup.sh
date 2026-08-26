#!/bin/bash
# Per-repo cloud-session setup hook for oak-open-curriculum-ecosystem.
#
# Invoked by the shared cloud environment setup script
# (.agent/claude-harness-integrations/cloud-environment-setup.sh) with the
# repo root as the working directory, AFTER `pnpm install` has run. Same
# fail-fast contract as the caller: any failure fails session creation.
set -euo pipefail

# Playwright browsers at the repo's pinned version. PLAYWRIGHT_BROWSERS_PATH
# is deliberately inherited so the install targets the store the cloud image
# presets (/opt/pw-browsers); only the image's download suppression
# (PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD) is unset.
(cd apps/oak-curriculum-mcp-streamable-http \
  && env -u PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD \
     pnpm exec playwright install --with-deps chromium)

# Turbo runs its tasks under strict envMode, so PLAYWRIGHT_BROWSERS_PATH does
# NOT reach turbo-spawned test:ui / test:e2e processes — Playwright inside
# them falls back to the default cache (~/.cache/ms-playwright) and reports
# "Executable doesn't exist" while the browsers sit installed in the preset
# store (worked instance 2026-08-26, fresh cloud container, pre-push gates).
# Aim the default cache at the real store so both resolution paths agree.
# Created only when absent: an existing real directory (or symlink) means a
# store is already resolvable there and is left alone.
if [ -n "${PLAYWRIGHT_BROWSERS_PATH:-}" ] \
  && [ "${PLAYWRIGHT_BROWSERS_PATH}" != "${HOME}/.cache/ms-playwright" ] \
  && [ ! -e "${HOME}/.cache/ms-playwright" ]; then
  mkdir -p "${HOME}/.cache"
  ln -s "${PLAYWRIGHT_BROWSERS_PATH}" "${HOME}/.cache/ms-playwright"
fi

# agent-tools test:e2e spawns pnpm in scratch directories with no
# packageManager pin, so Corepack resolves `pnpm@latest` — and under turbo's
# strict envMode that spawned Corepack carries neither the session proxy's
# CA nor its proxy env, so the network fetch dies on TLS (worked instance
# 2026-08-26: "self-signed certificate in certificate chain" against
# registry.npmjs.org killed test:e2e). Prime the global Corepack cache and
# last-known-good record here, where the network works, so in-session
# resolution needs no fetch. registry.npmjs.org is already probed by the
# universal preflight — no new host (probe invariant).
corepack install -g pnpm@latest
