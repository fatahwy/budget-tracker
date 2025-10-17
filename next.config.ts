import path from 'path';
import type { NextConfig } from 'next';

let withPWA: (config: NextConfig) => NextConfig = (cfg) => cfg;
try {
  // @ts-ignore
  withPWA = require('next-pwa');
} catch {
  // Fallback: no PWA support if next-pwa is not installed
  withPWA = (cfg) => cfg;
}

const nextConfigBase: NextConfig = {
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

const configWithPWA = withPWA({
  ...nextConfigBase,
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
});

export default configWithPWA;
