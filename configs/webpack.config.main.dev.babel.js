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
  devtool: 'cheap-module-eval-source-map',

  output: {
    publicPath: `http://localhost:${port}/dist/`,
    filename: 'main.dev.js',
  },
});
