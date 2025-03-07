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
    parallelServerCompiles: true,
  },
  webpack: (config) => {
    config.resolve.fallback = { fs: false, path: false };
    return config;
  },
}

mergeConfig(nextConfig, userConfig)

function mergeConfig(nextConfig, userConfig) {
  if (!userConfig) {
    return
  }

  // merge the configs
  Object.keys(userConfig).forEach((key) => {
    if (key === 'webpack' && nextConfig.webpack) {
      // special case for webpack
      const originalWebpack = nextConfig.webpack
      nextConfig.webpack = (config, options) => {
        const newConfig = originalWebpack(config, options)
        return userConfig.webpack(newConfig, options)
      }
    } else {
      nextConfig[key] = userConfig[key]
    }
  })
}

export default nextConfig
