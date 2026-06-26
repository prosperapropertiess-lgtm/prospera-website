import type { NextConfig } from "next";

const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com https://connect.facebook.net",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://picsum.photos https://images.unsplash.com https://res.cloudinary.com https://lh3.googleusercontent.com https://www.facebook.com https://hwaroazxbzgmjjasgtdb.supabase.co",
      "connect-src 'self' https://*.supabase.co https://api.anthropic.com https://api.resend.com https://www.facebook.com",
      "frame-src 'self' https://www.google.com https://maps.google.com",
      "frame-ancestors 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "hwaroazxbzgmjjasgtdb.supabase.co" },
    ],
  },
  // Bundle PDF files into the serverless function so fs.readFile works on Vercel
  outputFileTracingIncludes: {
    "/api/forms/n4": ["./public/forms/**"],
  },
  async redirects() {
    return [
      // Old WordPress URLs → current pages
      { source: "/all-listings-page", destination: "/listings", permanent: true },
      { source: "/all-listings-page/", destination: "/listings", permanent: true },
      { source: "/become-a-plus-tenant", destination: "/tenants", permanent: true },
      { source: "/become-a-plus-tenant/", destination: "/tenants", permanent: true },
      { source: "/category/blog-posts", destination: "/blog", permanent: true },
      { source: "/category/blog-posts/", destination: "/blog", permanent: true },
      { source: "/author/:slug", destination: "/about", permanent: true },
      { source: "/author/:slug/", destination: "/about", permanent: true },
      { source: "/property/:slug", destination: "/listings", permanent: true },
      { source: "/property/:slug/", destination: "/listings", permanent: true },
      { source: "/for-landlords", destination: "/landlords", permanent: true },
      { source: "/for-landlords/", destination: "/landlords", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
