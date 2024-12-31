import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

let userConfig = undefined
try {
  userConfig = await import('./v0-user-next.config')
} catch (e) {
  // ignore error
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.json$/,
      loader: 'json-loader',
      type: 'javascript/auto'
    });
    return config;
  }
}

function mergeConfig(baseConfig, userConfig) {
  if (!userConfig) return baseConfig
  const { default: config } = userConfig
  return {
    ...baseConfig,
    ...config,
  }
}

const mergedConfig = mergeConfig(nextConfig, userConfig);
export default withNextIntl(mergedConfig);