import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // `@elastic/elasticsearch` is published JS with native deps — server-external.
  serverExternalPackages: ['@elastic/elasticsearch'],
};

export default nextConfig;
