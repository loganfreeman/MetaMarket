import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@metamarket/shared", "@metamarket/ui"]
};

export default nextConfig;
