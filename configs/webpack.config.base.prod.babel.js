/**
 * Webpack base config for production environment
 */

import CheckNodeEnv from './CheckNodeEnv.babel';

CheckNodeEnv('production');

export default {
  mode: 'production',

  devtool: 'source-map',

  optimization: {
    moduleIds: 'deterministic',
  },
};
