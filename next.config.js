const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

let apiHostname;

try {
  apiHostname = apiBaseUrl ? new URL(apiBaseUrl).hostname : undefined;
} catch {
  apiHostname = undefined;
}

/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=()',
  },
];

const nextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      ...(apiHostname
        ? [
            {
              protocol: 'https',
              hostname: apiHostname,
            },
            {
              protocol: 'http',
              hostname: apiHostname,
            },
          ]
        : []),
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

module.exports = nextConfig;
