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
            key: 'Content-Security-Policy',
            value: 'frame-ancestors *',
          },
          {
            // Remove X-Frame-Options to prevent blocking
            // Note: This overrides the default DENY setting
            key: 'X-Frame-Options',
            value: 'ALLOWALL',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
