import { describe, expect, it } from 'vitest';

import { commsWatchPathsFromHome } from '../../src/collaboration-state/comms-watch-paths';

const PRIMARY = '/workspace/oak';
const AGENT_NAME = 'Europa stirs Void';
const PRIMARY_COMMS = `${PRIMARY}/.agent/state/collaboration/comms`;
const PRIMARY_SEEN = `${PRIMARY}/.agent/state/collaboration/comms-seen/${AGENT_NAME}.json`;

describe('commsWatchPathsFromHome', () => {
  it('builds the comms directory and identity cursor from one resolved home', () => {
    expect(commsWatchPathsFromHome(PRIMARY, AGENT_NAME)).toStrictEqual({
      commsDir: PRIMARY_COMMS,
      seenFile: PRIMARY_SEEN,
    });
  });
});
