/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(process.env.STANDALONE === 'true' || !process.env.VERCEL ? { output: 'standalone' } : {}),
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
