/**
 * Webpack config for Nexus Wallet Modules' development preload script
 */

import { merge } from 'webpack-merge';

import basePreloadConfig from './webpack.config.base.preload';
import devConfig from './webpack.config.base.dev';

export default merge(basePreloadConfig, devConfig, {
  output: {
    filename: 'module_preload.dev.js',
  },
});
