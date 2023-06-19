const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: 'development',
  entry: "./src/index.js",
  output: {
    filename: "index.js",
    path: path.resolve(__dirname, "dist"),
  },
  plugins: [
    new CopyWebpackPlugin([{ from: "./src/index.html", to: "index.html" }]),
    new CopyWebpackPlugin([{ from: './src/img', to: 'img' }]), 
    new CopyWebpackPlugin([{ from: './src/css', to: 'css' }]), 
    
  ],
  devServer: {
    contentBase: path.join(__dirname, "dist"),
    compress: true,
    /*headers: {
      /"Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization",
      "X-Content-Type-Options": "none",
    },
    allowedHosts: [
      'localhost',
    ],*/
  }
};
