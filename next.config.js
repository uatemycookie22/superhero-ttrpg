const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  cacheComponents: true,
  output: 'standalone',
  serverExternalPackages: ['better-sqlite3'],
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
    },
  },
  sassOptions: {
    includePaths: ['./styles']
  },
};

module.exports = withBundleAnalyzer(nextConfig);