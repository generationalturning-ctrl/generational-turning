import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Next.js requires unsafe-inline/unsafe-eval; Stripe JS served from js.stripe.com
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
      "style-src 'self' 'unsafe-inline'",
      // Sanity CDN for images, penblanks.ca for imported product images
      "img-src 'self' data: blob: https://cdn.sanity.io https://www.penblanks.ca",
      // Fonts are served locally by Next.js font optimisation
      "font-src 'self' data:",
      // Stripe payment iframe
      "frame-src https://js.stripe.com https://hooks.stripe.com",
      // API calls: Stripe, Sanity API + CDN
      `connect-src 'self' https://api.stripe.com https://js.stripe.com https://${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "5waq1udk"}.api.sanity.io https://${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "5waq1udk"}.apicdn.sanity.io wss://${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "5waq1udk"}.api.sanity.io`,
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io" },
      { protocol: "https", hostname: "www.penblanks.ca" },
    ],
  },
  async headers() {
    return [
      {
        // Apply security headers to all routes except /studio (Sanity Studio needs its own CSP)
        source: "/((?!studio).*)",
        headers: securityHeaders,
      },
      {
        // Sanity Studio: permissive CSP so it doesn't break
        source: "/studio/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
