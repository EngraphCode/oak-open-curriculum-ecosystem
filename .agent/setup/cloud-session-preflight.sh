#!/bin/bash
# Session-hook PREFLIGHT — the read-only twin of cloud-session-setup.sh
# under the hook-preflight contract (cloud-environment.md § Validating and
# diagnosing): this repo's session hook downloads the pinned Playwright
# Chromium, so this file falsifies the reachability of the hosts that
# download contacts, without downloading anything. Invoked as a probe by
# cloud-environment-preflight.sh; non-zero exit fails that probe with this
# output as the finding.
set -uo pipefail

failed=0
for url in \
  "https://cdn.playwright.dev/" \
  "https://playwright.download.prss.microsoft.com/"; do
  code=$(curl -sS -o /dev/null -m 30 -w '%{http_code}' "$url" 2>/dev/null) || code=000
  if [ "${code:-000}" = "000" ]; then
    # one retry: a single transient transport failure must not falsify a host
    code=$(curl -sS -o /dev/null -m 30 -w '%{http_code}' "$url" 2>/dev/null) || code=000
  fi
  echo "HTTP ${code:-000}: ${url}"
  case "${code:-000}" in
  000 | 403 | 407 | 502) failed=1 ;;
  esac
done
exit $failed
