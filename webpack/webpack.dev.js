/**
 * DEVELOPMENT WEBPACK CONFIGURATION
 */

const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const HtmlWebpackHarddiskPlugin = require("html-webpack-harddisk-plugin");

module.exports = require("./webpack.base")({
  // Add hot reloading in development
  entry: [
    "eventsource-polyfill", // Necessary for hot reloading with IE
    path.join(process.cwd(), "src/index.js") // Start with js/app.js
  ],
  // Don't use hashes in dev mode for better performance
  output: {
    filename: "bundle.js",
    chunkFilename: "[name].chunk.js",
    path: path.resolve(__dirname, "..", "dist"),
    publicPath: "/"
  },
  devServer: {
    contentBase: [
      path.join(process.cwd(), "dist"),
      path.join(process.cwd(), "public")
    ],
    port: 3000,
    historyApiFallback: true,
    disableHostCheck: true,
    compress: true
  },
  optimization: {
    splitChunks: {
      name: false,
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name(module) {
            // get the name. E.g. node_modules/packageName/not/this/part.js
            // or node_modules/packageName
            const packageName = module.context.match(
              /[\\/]node_modules[\\/](.*?)([\\/]|$)/
            )[1];
            // npm package names are URL-safe, but some servers don't like @ symbols
            return `npm.${packageName.replace("@", "")}`;
          },
          chunks: "all"
        }
      }
      // maxSize: 200000
    }
  },
  // Add development plugins
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    // For injecting minified html file
    new HtmlWebpackPlugin({
      title: "TCL",
      template: path.join(process.cwd(), "public/index.html"),
      inject: "body",
      filename: "index.html",
      alwaysWriteToDisk: true
    }),

    new HtmlWebpackHarddiskPlugin()
  ],

  // Emit a source map for easier debugging
  // See https://webpack.js.org/configuration/devtool/#devtool
  devtool: "eval-source-map",

  performance: {
    hints: false
  }
});
