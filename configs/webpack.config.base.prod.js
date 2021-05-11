/**
 * Webpack base config for production environment
 */

import CheckNodeEnv from '../internals/scripts/CheckNodeEnv';

CheckNodeEnv('production');

export default {
  mode: 'production',

  devtool: 'source-map',

  optimization: {
    moduleIds: 'deterministic',
  },
};
