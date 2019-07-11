/**
 * Webpack config for Nexus Wallet Modules' development preload script
 */

import merge from 'webpack-merge';

import baseConfig from './webpack.config.base.preload';
import CheckNodeEnv from '../internals/scripts/CheckNodeEnv';

CheckNodeEnv('development');

export default merge.smart(baseConfig, {
  devtool: 'cheap-module-eval-source-map',

  output: {
    filename: 'module_preload.dev.js',
  },
});
