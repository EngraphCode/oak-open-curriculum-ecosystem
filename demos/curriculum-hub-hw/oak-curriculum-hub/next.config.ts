import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // The workspace SDKs ship a `development` export condition pointing at raw
  // `src/*.ts` whose internal imports use ESM `.js` specifiers that resolve to
  // `.ts` files. Transpile them so the bundler processes that source.
  // `@elastic/elasticsearch` is published JS with native deps, so it stays
  // external (a package must NOT appear in both lists — Next errors on overlap).
  transpilePackages: [
    '@oaknational/oak-search-sdk',
    '@oaknational/curriculum-sdk',
    '@oaknational/result',
    '@oaknational/search-contracts',
  ],
  serverExternalPackages: ['@elastic/elasticsearch'],
  // Empty Turbopack config: `next build` runs Turbopack and resolves the SDKs'
  // built `dist` via the default export condition (works). Declaring this key
  // tells Turbopack the `webpack` hook below is intentional (for `--webpack`
  // dev), rather than erroring on a webpack-config-with-no-turbopack-config.
  turbopack: {},
  // `next dev --webpack`: map `.js` import specifiers to their `.ts` sources so
  // the transpiled SDK source (the dev export condition) resolves. Turbopack
  // build ignores this hook.
  webpack: (config) => {
    const resolve = config.resolve ?? {};
    resolve.extensionAlias = {
      ...(resolve.extensionAlias ?? {}),
      '.js': ['.ts', '.tsx', '.js'],
      '.mjs': ['.mts', '.mjs'],
    };
    config.resolve = resolve;
    return config;
  },
};

export default nextConfig;
