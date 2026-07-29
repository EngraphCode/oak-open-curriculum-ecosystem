/**
 * Pure helpers for the kit-asset parity validator: the declared manifest of
 * kit files this workspace serves as tracked copies, and the local-CSS
 * dependency walker the validator uses to PROVE the manifest complete
 * (validators must recompute, not just record — a copy whose sheet pulls in
 * a sibling outside the manifest is an incomplete copy even when every
 * listed pair is byte-identical). Zero IO here: validate-kit-assets.ts owns
 * the filesystem.
 */
import { parse } from 'postcss';

export interface KitAssetPair {
  /** Path relative to the design-system package root. */
  readonly source: string;
  /** Path relative to this workspace root. */
  readonly copy: string;
}

/** The served copies and their kit sources. brand-full.css is served under
 *  the brand contract's own name (brand.css); its internal import of
 *  brand-a.css resolves against the served URL, so the sibling geometry is
 *  preserved by the copy layout. */
export const SHOWCASE_KIT_ASSETS: readonly KitAssetPair[] = [
  { source: 'oak-theme.js', copy: 'public/oak-theme.js' },
  {
    source: 'studio-source/whitelabel/freedonia/brand-full.css',
    copy: 'public/brands/freedonia/brand.css',
  },
  {
    source: 'studio-source/whitelabel/freedonia/brand-a.css',
    copy: 'public/brands/freedonia/brand-a.css',
  },
  {
    source: 'studio-source/whitelabel/creature/brand-full.css',
    copy: 'public/brands/creature/brand.css',
  },
  {
    source: 'studio-source/whitelabel/creature/brand-a.css',
    copy: 'public/brands/creature/brand-a.css',
  },
];

function localReference(raw: string): string | null {
  const cleaned = raw
    .trim()
    .replaceAll(/^url\(\s*|\s*\)$/g, '')
    .replaceAll(/^['"]|['"]$/g, '');
  if (cleaned === '' || /^(?:https?:|data:|\/\/)/.test(cleaned)) {
    return null;
  }
  return cleaned;
}

/** Every same-directory file a stylesheet pulls in: local import targets
 *  and relative url() references (remote and data URLs are skipped — the
 *  counter-brands' font/icon hosts are deliberate external references). */
export function findLocalCssDependencies(css: string): readonly string[] {
  const dependencies = new Set<string>();
  const root = parse(css);
  root.walkAtRules('import', (atRule) => {
    const reference = localReference(atRule.params.split(/\s+/)[0] ?? '');
    if (reference !== null) {
      dependencies.add(reference);
    }
  });
  root.walkDecls((decl) => {
    for (const match of decl.value.matchAll(/url\(([^)]*)\)/gi)) {
      const reference = localReference(match[1] ?? '');
      if (reference !== null) {
        dependencies.add(reference);
      }
    }
  });
  return [...dependencies];
}
