/**
 * Binder for the identity (white-label) axis: which brand override sheet is
 * loaded over the kit's base. Applies the choice by managing one
 * `<link rel="stylesheet" data-oak-brand>` element (held by ref — the hook
 * owns its node, never whatever a selector happens to match) appended at
 * the END of `document.head`, so the brand sheet loads after every bundled
 * sheet and wins the cascade at equal specificity — the kit brand contract
 * (consuming-nextjs.md §5: "import it last"; brand.css: load it AFTER
 * styles.css). Both counter-brand sheets are cache-warmed on mount with
 * react-dom's preload, so a swap resolves from cache instead of paying a
 * network round trip mid-switch.
 *
 * React 19's own `<link precedence>` stylesheet hoisting was considered and
 * rejected on its documented semantics (react.dev/reference/react-dom/
 * components/link): "React may leave the link in the DOM even after the
 * component that rendered it has been unmounted", and precedence values
 * "discovered later are 'higher'" — so switching creature → freedonia
 * would leave creature's higher-ranked sheet winning; and the rendering
 * component suspends while the sheet loads. None of that fits a live
 * switcher.
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
import { useCallback, useEffect, useRef, useState } from 'react';
import { preload } from 'react-dom';

/**
 * The closed identity vocabulary. Exported for every consumer that needs the
 * slug list (the fidelity pairing map, PR-2's specimen route) — the
 * identity-naming ratchet's census-exact contract bars re-declaring these
 * literals in any new tracked file, so this existing carrier stays the single
 * definition and everything else imports (the framework-free re-home happens
 * at the rename ceremony, when the outgoing slug leaves the array).
 */
export const IDENTITIES = ['oak', 'freedonia', 'creature'] as const;
export type IdentitySlug = (typeof IDENTITIES)[number];

export interface IdentityState {
  identity: IdentitySlug;
  identities: readonly IdentitySlug[];
  setIdentity: (value: string) => void;
}

interface BrandLinkOwnership {
  /** Every link the hook has created and not yet removed — the hook owns
   *  its nodes; nothing here addresses head elements by selector. */
  readonly owned: Set<HTMLLinkElement>;
  readonly applied: { current: HTMLLinkElement | null };
  readonly generation: { current: number };
}

/** LOAD-THEN-SWAP: the incoming sheet is appended ALONGSIDE the outgoing
 *  one and the swap completes only when it has loaded — a first-hand frame
 *  sampler proved that an in-place href update drops the outgoing sheet a
 *  frame before the incoming one joins the cascade, flashing the Oak base
 *  between two counter-brands. Both sheets coexisting is safe: the
 *  incoming link is later in head, so it wins the cascade the moment it
 *  applies. The generation counter keeps a fast second switch from letting
 *  a stale load win. */
function applyBrandIdentity(identity: IdentitySlug, ownership: BrandLinkOwnership): void {
  const thisGeneration = (ownership.generation.current += 1);
  const previous = ownership.applied.current;
  if (identity === 'oak') {
    if (previous !== null) {
      previous.remove();
      ownership.owned.delete(previous);
      ownership.applied.current = null;
    }
    return;
  }
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.dataset['oakBrand'] = identity;
  link.href = `/brands/${identity}/brand.css`;
  link.addEventListener('load', () => {
    if (ownership.generation.current !== thisGeneration) {
      link.remove();
      ownership.owned.delete(link);
      return;
    }
    previous?.remove();
    if (previous !== null) {
      ownership.owned.delete(previous);
    }
    ownership.applied.current = link;
  });
  link.addEventListener('error', () => {
    // Failed load: keep the previous brand applied rather than flashing to
    // a half state (the served sheets are validator-guaranteed in-repo;
    // the select-vs-page mismatch on a live 404 is a recorded follow-up on
    // MCP-371).
    link.remove();
    ownership.owned.delete(link);
  });
  ownership.owned.add(link);
  document.head.append(link);
}

export function useIdentity(): IdentityState {
  const [identity, setIdentity] = useState<IdentitySlug>('oak');
  const ownedLinks = useRef<Set<HTMLLinkElement>>(new Set());
  const appliedLink = useRef<HTMLLinkElement | null>(null);
  const generation = useRef(0);

  useEffect(() => {
    for (const slug of IDENTITIES) {
      if (slug !== 'oak') {
        preload(`/brands/${slug}/brand.css`, { as: 'style' });
      }
    }
  }, []);

  useEffect(() => {
    applyBrandIdentity(identity, {
      owned: ownedLinks.current,
      applied: appliedLink,
      generation,
    });
  }, [identity]);

  // Unmount-only removal, deliberately separate from the [identity] effect:
  // a per-change cleanup would run between two brands and defeat the
  // load-then-swap above.
  useEffect(() => {
    const owned = ownedLinks.current;
    return () => {
      for (const link of owned) {
        link.remove();
      }
      owned.clear();
      appliedLink.current = null;
    };
  }, []);

  // The public setter narrows the select's string through the closed slug
  // list before touching state; the raw useState setter stays value-paired
  // (identity/setIdentity) per the hooks naming convention.
  const chooseIdentity = useCallback((value: string): void => {
    const next = IDENTITIES.find((slug) => slug === value);
    if (next !== undefined) {
      setIdentity(next);
    }
  }, []);

  return { identity, identities: IDENTITIES, setIdentity: chooseIdentity };
}
