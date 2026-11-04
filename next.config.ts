import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep native/wasm packages out of the bundler — loaded from node_modules at runtime.
  serverExternalPackages: ["pg", "@electric-sql/pglite"],
};

export default nextConfig;
