/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  assetPrefix: process.env.NODE_ENV === 'production' ? '/bitcoinforum' : '',
  basePath: process.env.NODE_ENV === 'production' ? '/bitcoinforum' : '',
  trailingSlash: true,
};

module.exports = nextConfig;
