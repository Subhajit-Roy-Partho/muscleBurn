/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/muscleBurn',
  assetPrefix: '/muscleBurn/',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
