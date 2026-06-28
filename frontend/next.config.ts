import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produces a self-contained build under .next/standalone — required for the
  // Docker runtime stage to run without the full node_modules tree.
  output: "standalone",
};

export default nextConfig;
