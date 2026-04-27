import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  // Bundle PDF files into the serverless function so fs.readFile works on Vercel
  outputFileTracingIncludes: {
    "/api/forms/n4": ["./public/forms/**"],
  },
};

export default nextConfig;
