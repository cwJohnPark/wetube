const miniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require("path");

const BASE_JS = "./src/client/js";

module.exports = {
  entry: {
    main: `${BASE_JS}/main.js`,
    videoPlayer: `${BASE_JS}/videoPlayer.js`,
    recorder: `${BASE_JS}/recorder.js`,
    commentSection: `${BASE_JS}/commentSection.js`,
  },
  mode: "development",
  plugins: [
    new miniCssExtractPlugin({
      filename: "css/styles.css",
    }),
  ],
  output: {
    filename: "js/[name].js",
    path: path.resolve(__dirname, "./assets"),
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [["@babel/preset-env", { targets: "defaults" }]],
          },
        },
      },
      {
        test: /\.scss$/,
        use: [miniCssExtractPlugin.loader, "css-loader", "sass-loader"],
      },
    ],
  },
  watch: true,
  watchOptions: {
    ignored: /node_modules/,
    aggregateTimeout: 5000,
    poll: 1000,
  },
};
