/**
 * Webpack config for Nexus Wallet Modules' development preload script
 */

import path from 'path';
import webpack from 'webpack';
import merge from 'webpack-merge';

import baseConfig from './webpack.config.base.preload';
import CheckNodeEnv from '../internals/scripts/CheckNodeEnv';

CheckNodeEnv('development');

export default merge.smart(baseConfig, {
  mode: 'development',

  devtool: 'cheap-module-eval-source-map',

  output: {
    path: path.join(process.cwd(), 'app'),
    publicPath: '../',
    filename: 'module_preload.dev.js',
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(
        process.env.NODE_ENV || 'development'
      ),
    }),
  ],
});
