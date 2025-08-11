/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['mongodb']
  },
  env: {
    CUSTOM_KEY: 'ATP_CLOUD_DASHBOARD',
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
        ]
      }
    ]
  },
  async rewrites() {
    return [
      {
        source: '/api/cloud/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010'}/api/v1/:path*`
      },
      {
        source: '/api/tenant/:path*',
        destination: `${process.env.NEXT_PUBLIC_TENANT_API_URL || 'http://localhost:3011'}/api/v1/:path*`
      },
      {
        source: '/api/analytics/:path*',
        destination: `${process.env.NEXT_PUBLIC_ANALYTICS_API_URL || 'http://localhost:3012'}/api/v1/:path*`
      }
    ]
  },
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig