const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { ModuleFederationPlugin } = require("webpack").container;

const PORT = 5000;

module.exports = {
  entry: "./src/index.js",

  mode: process.env.NODE_ENV === "production"
    ? "production"
    : "development",

  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].[contenthash].js",
    publicPath: "auto",
    clean: true,
  },

  devServer: {
    port: PORT,
    headers: { "Access-Control-Allow-Origin": "*" },
    historyApiFallback: true,
  },

  resolve: {
    extensions: [".js", ".jsx"],
  },

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: "babel-loader",
        options: { rootMode: "upward" },
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },

  plugins: [
    new ModuleFederationPlugin({
      name: "host",
      filename: "remoteEntry.js",
      remotes: {
        dashboard: `dashboard@${process.env.DASHBOARD_REMOTE_URL || "http://localhost:5002"}/remoteEntry.js`,
        auth: `auth@${process.env.AUTH_REMOTE_URL || "http://localhost:5001"}/remoteEntry.js`,
        users: `users@${process.env.USERS_REMOTE_URL || "http://localhost:5003"}/remoteEntry.js`,
        analytics: `analytics@${process.env.ANALYTICS_REMOTE_URL || "http://localhost:5004"}/remoteEntry.js`,
        notifications: `notifications@${process.env.NOTIFICATIONS_REMOTE_URL || "http://localhost:5005"}/remoteEntry.js`,
      },
      shared: {
        react: { singleton: true },
        "react-dom": { singleton: true },
      },
    }),

    new HtmlWebpackPlugin({
      template: "./public/index.html",
    }),
  ],
};