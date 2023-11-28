const path = require("path")
var WebpackObfuscator = require('webpack-obfuscator');

module.exports = {
  mode: 'development',
  entry: path.resolve(__dirname, "src/index.js"),
  output: {
    path: path.resolve(__dirname, "www/js"),
    filename: "wii-sdk.js",
    library: "WI",
    libraryTarget: "umd",
  },
  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: "babel-loader",
      },
    ],
  },
}