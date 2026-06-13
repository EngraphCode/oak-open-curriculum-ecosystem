/**
 * Pure session-shape resolver for the Claude Code statusline.
 *
 * @remarks
 * Answers, from already-gathered values, the glance questions the statusline
 * session-shape indicators render: *am I in a team, what shape is it, is
 * someone directing, and is a rapid (ArcAngel) channel live for me?*
 *
 * Truth sources are deliberately exactly two cheap repo-file reads per tick —
 * the active-claims registry and the experiments-directory listing. The comms
 * corpus is structurally excluded from this path: the statusline ticks
 * constantly and the large-flat-directory scan class has a documented
 * watcher body count. The imperative adapter (`statusline-identity.ts`)
 * gathers the inputs; this module holds no I/O so the semantics are
 * unit-testable over fixture matrices.
 *
 * @packageDocumentation
 */

import { isClaimStale } from '../collaboration-state/claims.js';
import {
  type CollaborationClaim,
  type CollaborationRegistry,
} from '../collaboration-state/types.js';

/**
 * One entry of the experiments-directory listing (ArcAngel rapid channels).
 * `name` is the channel path relative to the experiments directory (so
 * per-pair participant-bearing directory names participate in matching);
 * `mtimeIso` is the file's last-modified instant in ISO 8601 UTC.
 */
export interface ExperimentsEntry {
  readonly name: string;
  readonly mtimeIso: string;
}

/** Inputs for one session-shape resolution; all values explicit, no ambient state. */
export interface SessionShapeInputs {
  /** Own PDR-027 display name (e.g. "Monsoon guards Cirrus"); undefined when identity is unavailable. */
  readonly ownAgentName: string | undefined;
  /** Parsed active-claims registry; undefined when the read or parse failed. */
  readonly registry: CollaborationRegistry | undefined;
  /** Experiments-directory listing; undefined when the directory is absent or unreadable. */
  readonly experimentsListing: readonly ExperimentsEntry[] | undefined;
  /** The resolution instant, ISO 8601 UTC. */
  readonly nowIso: string;
}

/** Resolved coordination shape for one statusline tick. */
export interface SessionShape {
  /**
   * Own session role from the first fresh own claim (by registry array
   * position) that carries one; undefined when no fresh own claim names a
   * role. An agent holding several role-bearing claims mid-transition shows
   * the earliest-registered role until the older claim closes.
   */
  readonly ownRole: string | undefined;
  /**
   * Team shape, in strict priority order: `directed` (any fresh claim whose
   * `role` is exactly the lowercase string `director` — the schema's
   * well-known values are lowercase by convention and matching is
   * case-sensitive) beats `peer` (two or more distinct fresh identities)
   * beats `solo`.
   */
  readonly teamShape: 'solo' | 'peer' | 'directed';
  /** Whether a rapid channel naming this agent was written within the ARC liveness window. */
  readonly arcActive: boolean;
}

/**
 * How recently an experiments channel must have been written to count as a
 * live ArcAngel channel. Claim freshness has its own per-claim TTL; ARC
 * channels have no recorded TTL, so mtime within this window is the proxy.
 * Thirty minutes covers the observed gap between turns in a live rapid
 * channel without keeping the wing up much past a channel quietening; a
 * false wing for a few minutes is harmless for a glance surface. The
 * comparison is inclusive: a write exactly at the window edge still counts.
 */
const ARC_ACTIVE_WINDOW_SECONDS = 1800;

/**
 * Resolve the session's coordination shape from explicit inputs.
 *
 * Stale claims (per the registry's own {@link isClaimStale} predicate) are
 * invisible: a stale director claim does not shape the icon, and a stale own
 * claim carries no role. Missing inputs degrade soft: no registry reads as
 * solo, no listing reads as no ARC wing — the statusline never fails a tick
 * over an unreadable coordination surface.
 */
export function resolveSessionShape(inputs: SessionShapeInputs): SessionShape {
  const freshClaims = (inputs.registry?.claims ?? []).filter(
    (claim) => !isClaimStale(claim, inputs.nowIso),
  );

  return {
    ownRole: resolveOwnRole(freshClaims, inputs.ownAgentName),
    teamShape: resolveTeamShape(freshClaims),
    arcActive: resolveArcActive(inputs.experimentsListing, inputs.ownAgentName, inputs.nowIso),
  };
}

function resolveOwnRole(
  freshClaims: readonly CollaborationClaim[],
  ownAgentName: string | undefined,
): string | undefined {
  if (ownAgentName === undefined) {
    return undefined;
  }
  return freshClaims.find(
    (claim) => claim.agent_id.agent_name === ownAgentName && claim.role !== undefined,
  )?.role;
}

function resolveTeamShape(freshClaims: readonly CollaborationClaim[]): SessionShape['teamShape'] {
  if (freshClaims.some((claim) => claim.role === 'director')) {
    return 'directed';
  }
  // Identity is the PDR-027 tuple (name primary, prefix disambiguating):
  // one agent holding several claims contributes one identity. A session
  // restart that changes the prefix briefly reads as two identities (a
  // transient false peer) — accepted for a glance surface; do not "fix"
  // this to name-only keying, which would hide genuine same-name peers.
  const distinctIdentities = new Set(
    freshClaims.map((claim) => `${claim.agent_id.agent_name}|${claim.agent_id.session_id_prefix}`),
  );
  return distinctIdentities.size >= 2 ? 'peer' : 'solo';
}

function resolveArcActive(
  listing: readonly ExperimentsEntry[] | undefined,
  ownAgentName: string | undefined,
  nowIso: string,
): boolean {
  if (listing === undefined || ownAgentName === undefined) {
    return false;
  }
  const ownNeedle = normaliseForFilenameMatch(ownAgentName);
  const nowMs = Date.parse(nowIso);
  return listing.some((entry) => {
    if (!normaliseForFilenameMatch(entry.name).includes(ownNeedle)) {
      return false;
    }
    // Age must fall within [0, window]. A future mtime (clock skew) yields a
    // negative age that would otherwise satisfy `<= window` and raise a false
    // wing; an unparseable mtime yields NaN, which fails both bounds.
    const ageMs = nowMs - Date.parse(entry.mtimeIso);
    return ageMs >= 0 && ageMs <= ARC_ACTIVE_WINDOW_SECONDS * 1000;
  });
}

/**
 * Normalise a display name or channel filename for participant matching:
 * lower-case with every non-alphanumeric run collapsed to a single dash, so
 * "Monsoon guards Cirrus" matches `arc-monsoon-guards-cirrus-and-fern.md`
 * regardless of the separator convention a channel author chose. Substring
 * matching suffices because the per-pair channel convention embeds each
 * participant's PDR-027 display name verbatim in the channel path.
 */
function normaliseForFilenameMatch(value: string): string {
  return value.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-');
}

/**
 * Resolve the PRIMARY checkout root from `git worktree list --porcelain`
 * output: the first `worktree <path>` line. Git documents list order as the
 * main working tree first; the statusline relies on that contract so a
 * worktree seat reads the primary checkout's live coordination registry
 * rather than its own stale copy. Returns undefined on unrecognised output
 * (soft-fail: the adapter then skips the coordination reads for the tick).
 */
export function parsePrimaryWorktreeRoot(porcelainOutput: string): string | undefined {
  const firstLine = porcelainOutput.split('\n', 1)[0] ?? '';
  if (!firstLine.startsWith('worktree ')) {
    return undefined;
  }
  const path = firstLine.slice('worktree '.length).trim();
  return path.length === 0 ? undefined : path;
}
