/**
 * Webpack config for Nexus Wallet Modules' development preload script
 */

import { merge } from 'webpack-merge';

import basePreloadConfig from './webpack.config.base.preload.babel';
import devConfig from './webpack.config.base.dev.babel';

export default merge(basePreloadConfig, devConfig, {
  output: {
    filename: 'module_preload.dev.js',
  },
});
