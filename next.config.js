/** @type {import('next').NextConfig} */

async function rewrites() {
  const DOMAIN = process.env.DOMAIN_API;
  return [
    {
      source: '/api/:path*',
      destination: DOMAIN + '/api/:path*',
    },
  ];
}

const nextConfig = {
  reactStrictMode: true,
  compress: true,
  rewrites,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

module.exports = nextConfig;
