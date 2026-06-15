/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep development chunks separate from production builds. Running
  // `next build` while a dev server is open must not corrupt its manifest.
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

module.exports = nextConfig;
