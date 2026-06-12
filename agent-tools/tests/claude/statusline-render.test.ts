import { renderStatusline, type StatuslineParts } from '../../src/claude/statusline-render';

const RESET = '[0m';
const DIM = '[2m';
const CYAN = '[0;36m';
const BOLD_BLUE = '[1;34m';
const GREEN = '[0;32m';
const RED = '[0;31m';
const YELLOW = '[0;33m';
const MAGENTA = '[0;35m';

const SEP = `${DIM} · ${RESET}`;

const base: StatuslineParts = {
  identity: undefined,
  dir: 'repo',
  branch: undefined,
  dirty: false,
  worktree: undefined,
  usedPercentage: undefined,
  model: undefined,
};

describe('renderStatusline', () => {
  it('renders every segment, longest last, for a full linked-worktree payload', () => {
    expect(
      renderStatusline({
        identity: 'Fragrant Creeping Sapling',
        dir: 'oak-wt-eef',
        branch: 'feat/eef-explore-evidence',
        dirty: false,
        worktree: 'oak-wt-eef',
        usedPercentage: 12,
        model: 'Opus 4.7',
      }),
    ).toBe(
      `${MAGENTA}Fragrant Creeping Sapling${RESET}${SEP}` +
        `${DIM}Opus 4.7${RESET}${SEP}` +
        `${GREEN}ctx:12%${RESET}${SEP}` +
        `${BOLD_BLUE}feat/eef-explore-evidence${RESET}${SEP}` +
        `${CYAN}wt:oak-wt-eef${RESET}`,
    );
  });

  it('omits the identity segment when no identity is resolved', () => {
    expect(renderStatusline({ ...base, dir: 'repo' })).toBe(`${CYAN}repo${RESET}`);
  });

  it('shows the directory when not in a linked worktree', () => {
    const line = renderStatusline({ ...base, worktree: undefined });
    expect(line).toContain(`${CYAN}repo${RESET}`);
    expect(line).not.toContain('wt:');
  });

  it('shows the worktree name instead of the directory in a linked worktree', () => {
    const line = renderStatusline({ ...base, dir: 'repo', worktree: 'oak-wt-eef' });
    expect(line).toContain(`${CYAN}wt:oak-wt-eef${RESET}`);
    expect(line).not.toContain(`${CYAN}repo${RESET}`);
  });

  it('marks a dirty working tree with an asterisk on the branch', () => {
    expect(renderStatusline({ ...base, branch: 'main', dirty: true })).toContain(
      `${BOLD_BLUE}main${RESET}${YELLOW}*${RESET}`,
    );
  });

  it('omits the dirty mark on a clean tree', () => {
    expect(renderStatusline({ ...base, branch: 'main', dirty: false })).not.toContain('*');
  });

  it('omits the branch segment outside a repository', () => {
    expect(renderStatusline({ ...base, branch: undefined, dirty: true })).not.toContain('*');
  });

  it('renders low context usage in green, rounded to a whole number', () => {
    const line = renderStatusline({ ...base, usedPercentage: 12.6 });
    expect(line).toContain(`${GREEN}ctx:13%${RESET}`);
    expect(line).not.toContain(`${YELLOW}ctx:13%`);
    expect(line).not.toContain(`${RED}ctx:13%`);
  });

  it('renders elevated context usage in yellow from 50%', () => {
    expect(renderStatusline({ ...base, usedPercentage: 50 })).toContain(`${YELLOW}ctx:50%${RESET}`);
    expect(renderStatusline({ ...base, usedPercentage: 49.4 })).not.toContain(`${YELLOW}ctx:49%`);
  });

  it('renders high context usage in red from 70%', () => {
    expect(renderStatusline({ ...base, usedPercentage: 70 })).toContain(`${RED}ctx:70%${RESET}`);
    expect(renderStatusline({ ...base, usedPercentage: 69.4 })).toContain(
      `${YELLOW}ctx:69%${RESET}`,
    );
  });

  it('omits the context segment when usage is absent', () => {
    expect(renderStatusline({ ...base, usedPercentage: undefined })).not.toContain('ctx:');
  });
});
