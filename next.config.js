const webpack = require("webpack");

module.exports = {
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      crypto: false,
    };
    config.plugins.push(
      new webpack.ProvidePlugin({
        process: "process/browser",
      })
    );
    return config;
  },
};
