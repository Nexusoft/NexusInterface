/**
 * Webpack config for development electron main process
 */

import webpack from 'webpack';
import merge from 'webpack-merge';
import { spawn, execSync } from 'child_process';

import baseConfig from './webpack.config.base.main';
import CheckNodeEnv from '../internals/scripts/CheckNodeEnv';

const port = process.env.PORT || 1212;
const publicPath = `http://localhost:${port}/dist`;

CheckNodeEnv('development');

export default merge.smart(baseConfig, {
  mode: 'development',

  devtool: 'cheap-module-eval-source-map',

  output: {
    publicPath: `http://localhost:${port}/dist/`,
    filename: 'main.dev.js',
  },

  plugins: [
    /**
     * Create global constants which can be configured at compile time.
     *
     * Useful for allowing different behaviour between development builds and
     * release builds
     *
     * NODE_ENV should be production so that modules do not perform certain
     * development checks
     */
    new webpack.DefinePlugin({
      NODE_ENV: 'development',
    }),
  ],
});
