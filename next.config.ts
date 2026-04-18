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
    "nextjs--mep--stormray73--snkh7hl1plq0m.pit-1.try.coder.app",
  ],
};

export default nextConfig;
