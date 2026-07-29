'use client';
/**
 * Binder for the identity (white-label) axis: which brand override sheet is
 * loaded over the kit's base. Applies the choice by managing one
 * `<link rel="stylesheet" data-oak-brand>` element appended at the END of
 * `document.head`, so the brand sheet loads after every bundled sheet and
 * wins the cascade at equal specificity — the kit brand contract
 * (brand.css: "import it last").
 *
 * Showcase-only mechanism: production identity is server-emitted, one
 * static sheet per tenant, per the kit's consuming-nextjs.md §5 ("no flash,
 * no client logic"). A cookie + router.refresh() shape would match §5 from
 * a layout, at the cost of a server round trip and dynamic rendering per
 * switch — wrong trade for a live switchboard, so the demo swaps the link
 * client-side. Identity deliberately does NOT persist across reloads:
 * persistence would need a second pre-paint bootstrap to avoid a flash of
 * Oak brand (the exact problem oak-theme.js solves for themes).
 */
import { useEffect, useState } from 'react';

const IDENTITIES = ['oak', 'freedonia', 'creature'] as const;
type IdentitySlug = (typeof IDENTITIES)[number];

export interface IdentityState {
  identity: IdentitySlug;
  identities: readonly IdentitySlug[];
  setIdentity: (value: string) => void;
}

function applyBrandLink(identity: IdentitySlug): void {
  const existing = document.head.querySelector('link[data-oak-brand]');
  if (identity === 'oak') {
    existing?.remove();
    return;
  }
  const link = existing instanceof HTMLLinkElement ? existing : document.createElement('link');
  link.rel = 'stylesheet';
  link.dataset['oakBrand'] = identity;
  link.href = `/brands/${identity}/brand.css`;
  // append() moves an already-attached node, so the link also RETURNS to
  // the end of head if anything was inserted after it.
  document.head.append(link);
}

export function useIdentity(): IdentityState {
  const [identity, setIdentityState] = useState<IdentitySlug>('oak');

  useEffect(() => {
    applyBrandLink(identity);
  }, [identity]);

  // Unmount-only removal, deliberately separate from the [identity] effect:
  // a per-change cleanup would delete the link between two brands and flash
  // the Oak base — the in-place href update above exists to prevent that.
  useEffect(() => {
    return () => {
      document.head.querySelector('link[data-oak-brand]')?.remove();
    };
  }, []);

  return {
    identity,
    identities: IDENTITIES,
    setIdentity: (value: string): void => {
      const next = IDENTITIES.find((slug) => slug === value);
      if (next !== undefined) {
        setIdentityState(next);
      }
    },
  };
}
