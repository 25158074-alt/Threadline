import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/Threadline",
  assetPrefix: "/Threadline/",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
