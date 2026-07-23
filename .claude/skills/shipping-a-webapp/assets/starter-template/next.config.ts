import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  output: "export",
  basePath: "" /* basePath beim Individualisieren setzen */,
  trailingSlash: true,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: "" /* basePath beim Individualisieren setzen */ },
};
export default nextConfig;
