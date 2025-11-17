/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  serverExternalPackages: ['better-sqlite3'],
  sassOptions: {
    includePaths: ['./styles']
  },
};

module.exports = nextConfig;