/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Only ignore during builds in production, show warnings in dev
    ignoreDuringBuilds: process.env.NODE_ENV === 'production',
  },
  typescript: {
    // Only ignore during builds in production, show errors in dev
    ignoreBuildErrors: process.env.NODE_ENV === 'production',
  },
  images: {
    unoptimized: true,
  },
  // Reduce memory usage
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
}

export default nextConfig
