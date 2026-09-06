import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    // Pages removed in the 2026 audit; keep old links working.
    return [
      { source: "/findings", destination: "/", permanent: true },
      { source: "/comparison", destination: "/analysis", permanent: true },
    ];
  },
};

export default nextConfig;
