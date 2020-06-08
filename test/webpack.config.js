/* eslint-env node */

const path = require(`path`);
const webpack = require(`webpack`);

const webpackConfig = {
  entry: path.join(__dirname, `index.js`),
  output: {
    path: path.join(__dirname, `compiled`),
    filename: `tests.bundle.js`,
    pathinfo: true,
  },
  devtool: 'eval-source-map',
  mode: `development`,
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: `babel-loader`,
            options: {
              presets: [`@babel/preset-env`],
              plugins: [`@babel/plugin-transform-runtime`]
            },
          },
        ],
      },
      {
        test: /\.ts$/,
        exclude: /(node_modules)/,
        use: [
          {
            loader: `babel-loader`,
          },
          {
            loader: `ts-loader`,
            options: {
              happyPackMode: true,
            },
          },
        ],
      },
    ],
  },
  watch: !!process.env.WATCH,
};

module.exports = webpackConfig;
