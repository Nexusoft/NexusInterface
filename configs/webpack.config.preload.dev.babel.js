/**
 * Build config for Nexus Wallet Modules' preload script
 */

import path from 'path';
import webpack from 'webpack';
import merge from 'webpack-merge';

import baseConfig from './webpack.config.base';
import CheckNodeEnv from '../internals/scripts/CheckNodeEnv';

CheckNodeEnv('development');

export default merge.smart(baseConfig, {
  mode: 'development',

  devtool: 'cheap-module-eval-source-map',

  target: 'electron-renderer',

  entry: './app/module_preload',

  output: {
    path: path.join(__dirname, '..', 'app/'),
    publicPath: '../',
    filename: 'module_preload.dev.js',
  },

  module: {
    rules: [
      // WOFF2 Font
      {
        test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: 'url-loader',
          options: {
            mimetype: 'font/woff2',
            outputPath: '../fonts',
          },
        },
      },
    ],
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(
        process.env.NODE_ENV || 'development'
      ),
    }),

    new webpack.LoaderOptionsPlugin({
      debug: true,
    }),
  ],
});
