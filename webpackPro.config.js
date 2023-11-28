const path = require("path")
var WebpackObfuscator = require('webpack-obfuscator');

module.exports = {
  mode: 'production',
  entry: path.resolve(__dirname, "src/index.js"),
  plugins: [
    new WebpackObfuscator({rotateStringArray: true, reservedStrings: [ '\s*' ]}, [])
  ],
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
      {
        enforce: 'post',
        use: {
          loader: WebpackObfuscator.loader,
          options: {
            reservedStrings: [ '\s*' ],
            rotateStringArray: true
          }
        }
      }
    ],
  },
}