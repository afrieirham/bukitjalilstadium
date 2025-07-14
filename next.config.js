/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  images: {
    minimumCacheTTL: 60,
  },
  async redirects() {
    return [
      {
        source: "/contribute",
        destination: "https://go.afrieirham.com/contribute",
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
