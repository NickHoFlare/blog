const basePath = '/blog'

module.exports = {
    basePath: basePath,
    // assetPrefix: '/blog/', // assetPrefix requires the trailing slash
    webpack: (config, { isServer }) => {
        if (!isServer) {
          config.resolve.fallback.fs = false;
        }
        return config;
    },
    publicRuntimeConfig: {
        // Will be available on both server and client
        basePath: basePath,
    },
}