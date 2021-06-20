const basePath = process.env.NODE_ENV === 'production'
    ? '/blog'
    : '';

console.log(`Environment is ${process.env.NODE_ENV}`);
console.log(`basePath is ${basePath}`);

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