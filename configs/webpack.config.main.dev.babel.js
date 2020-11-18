/**
 * Webpack config for development electron main process
 */

import { merge } from 'webpack-merge';

import baseConfig from './webpack.config.base.main';
import CheckNodeEnv from '../internals/scripts/CheckNodeEnv';

CheckNodeEnv('development');

export default merge(baseConfig, {
  mode: 'development',

  devtool: 'eval-source-map',

  output: {
    filename: 'main.dev.js',
  },

  optimization: {
    moduleIds: 'named',
  },
});
