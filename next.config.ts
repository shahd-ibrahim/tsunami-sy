import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
      { protocol: "https", hostname: "www.google.com" },
      { protocol: "https", hostname: "*.google.com" },
      { protocol: "https", hostname: "google.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.unsplash.com" },
      { protocol: "https", hostname: "i.imgur.com" },
      { protocol: "https", hostname: "*.imgur.com" },
      { protocol: "https", hostname: "*.cloudinary.com" },
      { protocol: "https", hostname: "*.githubusercontent.com" },
      { protocol: "https", hostname: "*.telegram.org" },
    ],
  },
  async redirects() {
    return [
      {
        source: "/root-control/:path*",
        destination: "/root-admin/:path*",
        permanent: true,
      },
      {
        source: "/root-control",
        destination: "/root-admin",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
