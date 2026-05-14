/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    const destination = backendUrl.startsWith('http') ? backendUrl : `https://${backendUrl}`;
    
    return [
      {
        source: '/api/:path*',
        destination: `${destination}/api/:path*`,
      },
    ];
  },


};

export default nextConfig;
