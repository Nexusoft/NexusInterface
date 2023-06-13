/**
 * Webpack base config for development environment
 */

import CheckNodeEnv from './CheckNodeEnv.babel';

CheckNodeEnv('development');

export default {
  mode: 'development',

  devtool: 'eval-source-map',

  optimization: {
    moduleIds: 'named',
  },
};
