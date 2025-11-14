const webpack = require("webpack");

module.exports = {
  webpack: (config, { isServer }) => {
    // Polyfill Node.js core modules for Webpack 5 on Node 18+/22 on Vercel
    config.resolve.fallback = {
      ...config.resolve.fallback,
      crypto: require.resolve("crypto-browserify"),
      stream: require.resolve("stream-browserify"),
      path: false,
      fs: false,
    };

    config.plugins.push(
      new webpack.ProvidePlugin({
        process: "process/browser",
        Buffer: ["buffer", "Buffer"],
      })
    );

    // Use a hashing function compatible with newer OpenSSL versions
    config.output.hashFunction = "xxhash64";

    return config;
  },
};
