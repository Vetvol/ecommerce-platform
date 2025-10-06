/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'images.unsplash.com'],
  },
  // Disable build traces completely
  experimental: {
    outputFileTracingRoot: undefined,
  },
}

module.exports = nextConfig
