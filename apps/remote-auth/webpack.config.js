const HtmlWebpackPlugin = require("html-webpack-plugin");
const { ModuleFederationPlugin } = require("webpack").container;

const PORT = 5001;

module.exports = {
  entry: "./src/index.js",
  mode: process.env.NODE_ENV === "production" ? "production" : "development",
  devServer: {
    port: PORT,
    headers: { "Access-Control-Allow-Origin": "*" },
    historyApiFallback: true,
  },
  // In production on Vercel, VERCEL_URL is the deployment's own host
  // (e.g. "nimbus-remote-auth.vercel.app"), auto-injected at build time.
  // Locally (no VERCEL_URL) this falls back to the dev server on PORT.
  output: {
    publicPath: process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}/`
      : `http://localhost:${PORT}/`,
  },
  resolve: { extensions: [".js", ".jsx"] },
  module: {
    rules: [
      { test: /\.jsx?$/, exclude: /node_modules/, loader: "babel-loader", options: { rootMode: "upward" } },
      { test: /\.css$/, use: ["style-loader", "css-loader"] },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: "auth",
      filename: "remoteEntry.js",
      exposes: {
        "./AuthStatus": "./src/AuthStatus.jsx",
        "./Login": "./src/Login.jsx",
      },
      shared: {
        react: { singleton: true, eager: false },
        "react-dom": { singleton: true, eager: false },
      },
    }),
    new HtmlWebpackPlugin({ template: "./public/index.html" }),
  ],
};
