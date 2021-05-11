/**
 * Webpack base config for development environment
 */

import CheckNodeEnv from '../internals/scripts/CheckNodeEnv';

CheckNodeEnv('development');

export default {
  mode: 'development',

  devtool: 'eval-source-map',

  optimization: {
    moduleIds: 'named',
  },
};
