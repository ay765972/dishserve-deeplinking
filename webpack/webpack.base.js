/**
 * COMMON WEBPACK CONFIGURATION
 */

const path = require("path");
const webpack = require("webpack");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = options => ({
  entry: options.entry,
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules|bower_components)/,
        loader: "babel-loader",
        options: {
          babelrc: false,
          presets: ["@babel/preset-env", "@babel/preset-react"],
          plugins: [
            require("@babel/plugin-proposal-class-properties"),
            require("@babel/plugin-proposal-object-rest-spread"),
            require("@babel/plugin-syntax-dynamic-import"),
            require("react-loadable/babel"),
            require("@babel/plugin-transform-runtime")
          ]
        }
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: require.resolve("css-loader"),
            options: {
              importLoaders: 1,
              modules: true,
              localIdentName: "[name]__[local]___[hash:base64:5]"
            }
          }
        ]
      }
    ]
  },
  optimization: options.optimization,
  resolve: { extensions: ["*", ".js", ".jsx"] },
  output: options.output,
  devServer: options.devServer ? options.devServer : {},
  plugins: options.plugins.concat([
    new webpack.ProvidePlugin({
      // make fetch available
      fetch: "exports-loader?self.fetch!whatwg-fetch/dist/fetch.umd"
    }),
    new webpack.NamedModulesPlugin(),
    // clearing dist folder before making new build
    new CleanWebpackPlugin([path.join(process.cwd(), "/dist")], {
      root: process.cwd()
    }),
    new MiniCssExtractPlugin({
      filename: "[name]-bundle.[hash].css",
      chunkFilename: "[name]-[hash].css"
    }),
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
        BASE_PATH: JSON.stringify(process.env.BASE_PATH),
        ASSETS_CDN_PATH: JSON.stringify(process.env.ASSETS_CDN_PATH),
        STAGE: JSON.stringify(process.env.STAGE),
        POST_API_ENCRYPTION_KEY: JSON.stringify(
          process.env.POST_API_ENCRYPTION_KEY
        ),
        API_URL: JSON.stringify(process.env.API_URL),
        CHANNEL: JSON.stringify(process.env.CHANNEL),
        PORT_SSL: JSON.stringify(process.env.PORT_SSL),
        PORT: JSON.stringify(process.env.PORT),
        BASE_PATH: JSON.stringify(process.env.BASE_PATH),
        FB_APP_ID: JSON.stringify(process.env.FB_APP_ID),
        GOOGLE_CLIENT_ID: JSON.stringify(process.env.GOOGLE_CLIENT_ID)
      }
    })
    // new BundleAnalyzerPlugin()
  ]),
  devtool: options.devtool,
  target: "web", // Make web variables accessible to webpack, e.g. window
  performance: options.performance || {}
});
