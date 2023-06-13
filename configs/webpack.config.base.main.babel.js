/**
 * Webpack base config for electron main process
 */

import path from 'path';
import webpack from 'webpack';
import { merge } from 'webpack-merge';

import baseConfig from './webpack.config.base.babel';
import { babelLoaderMain } from './babelLoaderConfig.babel';

export default merge(baseConfig, {
  target: 'electron-main',

  entry: './src/main/main.js',

  module: {
    rules: [babelLoaderMain()],
  },

  // 'main.js' in root
  output: {
    path: path.join(process.cwd(), 'build'),
  },

  /**
   * Disables webpack processing of __dirname and __filename.
   * If you run the bundle in node.js it falls back to these values of node.js.
   * https://github.com/webpack/webpack/issues/2010
   */
  node: {
    __dirname: false,
    __filename: false,
  },

  plugins: [
    new webpack.DefinePlugin({
      START_MINIMIZED: false,
    }),
  ],
});
