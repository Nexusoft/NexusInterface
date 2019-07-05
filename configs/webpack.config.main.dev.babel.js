/**
 * Webpack config for development electron main process
 */

import merge from 'webpack-merge';

import baseConfig from './webpack.config.base.main';
import CheckNodeEnv from '../internals/scripts/CheckNodeEnv';

CheckNodeEnv('development');

export default merge.smart(baseConfig, {
  devtool: 'cheap-module-eval-source-map',

  output: {
    filename: 'main.dev.js',
  },
});
