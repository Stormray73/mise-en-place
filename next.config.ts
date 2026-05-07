import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  allowedDevOrigins: [
    "nextjs--rocinante--stormray73--6vu1nsa91nhr0.pit-1.try.coder.app",
  ],
};

export default nextConfig;
