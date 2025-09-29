import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      new URL("https://launchpad-media-storage.s3.us-east-1.amazonaws.com/**"),
      new URL('https://placehold.co/**')
    ],
  },
};

export default nextConfig;
