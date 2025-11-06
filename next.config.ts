import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // Configure headers to allow iframe embedding
  async headers() {
    return [
      {
        // Apply to all routes
        source: '/:path*',
        headers: [
          {
            // Allow embedding in iframes from any domain
            // Use 'frame-ancestors https://yourdomain.com' to restrict to specific domains
            key: 'Content-Security-Policy',
            value: 'frame-ancestors *',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
