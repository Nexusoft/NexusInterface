/**
 * Webpack base config for development environment
 */

import CheckNodeEnv from './CheckNodeEnv.babel';

CheckNodeEnv('development');

export default {
  mode: 'development',

  devtool: 'cheap-module-source-map',

  optimization: {
    moduleIds: 'named',
  },
};
