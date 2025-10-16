import path from 'path';
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack(config) {
    config.resolve = {
      ...(config.resolve || {}),
      alias: {
        ...(config.resolve?.alias || {}),
        '@shadcn/ui': path.resolve(__dirname, 'app/mocks/shadcn-ui')
      }
    };
    return config;
  }
};

export default nextConfig;
