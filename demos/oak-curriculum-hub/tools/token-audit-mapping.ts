/*
 * The Oak-specific consumer config for the token-fidelity audit: which demo
 * @theme tokens map onto which authoritative export tokens, and how each pair
 * is compared. Extracted from token-fidelity-audit.ts (the framework/consumer
 * split that file's header documents) so the tool stays within its size
 * budget.
 */
export interface TokenMapping {
  cat: string;
  demoToken: string;
  authToken: string;
  cmp: 'num' | 'px';
}

// Consumer config: demo token vs authoritative token, with how to compare.
export const MAPPING: readonly TokenMapping[] = [
  {
    cat: 'radius',
    demoToken: 'radius-ctl',
    authToken: 'border-radius-border-radius-s',
    cmp: 'num',
  },
  {
    cat: 'radius',
    demoToken: 'radius-mid',
    authToken: 'border-radius-border-radius-m',
    cmp: 'num',
  },
  {
    cat: 'radius',
    demoToken: 'radius-card',
    authToken: 'border-radius-border-radius-m2',
    cmp: 'num',
  },
  {
    cat: 'radius',
    demoToken: 'radius-large',
    authToken: 'border-radius-border-radius-l',
    cmp: 'num',
  },
  { cat: 'shadow', demoToken: 'shadow-accent-brand', authToken: 'shadow-lemon', cmp: 'px' },
  {
    cat: 'shadow',
    demoToken: 'shadow-accent-wide-brand',
    authToken: 'shadow-wide-lemon',
    cmp: 'px',
  },
  { cat: 'shadow', demoToken: 'shadow-neutral-brand', authToken: 'shadow-grey', cmp: 'px' },
];
