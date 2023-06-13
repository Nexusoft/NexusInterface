/**
 * Webpack config for development electron main process
 */

import { merge } from 'webpack-merge';

import baseMainConfig from './webpack.config.base.main.babel';
import devConfig from './webpack.config.base.dev.babel';

export default merge(baseMainConfig, devConfig, {
  output: {
    filename: 'main.dev.js',
  },
});
