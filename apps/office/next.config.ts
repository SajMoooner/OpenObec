import type { NextConfig } from "next";
const config: NextConfig = {
  devIndicators: false,
  output: "standalone",
  transpilePackages: ["@openobec/ui", "@openobec/api-client"],
  outputFileTracingRoot: new URL("../..", import.meta.url).pathname,
  experimental: { serverActions: { bodySizeLimit: "21mb" } },
};
export default config;
