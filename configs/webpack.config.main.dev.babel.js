/**
 * Webpack config for development electron main process
 */

import { merge } from 'webpack-merge';

import baseMainConfig from './webpack.config.base.main';
import devConfig from './webpack.config.base.dev';

export default merge(baseMainConfig, devConfig, {
  output: {
    filename: 'main.dev.js',
  },
});
