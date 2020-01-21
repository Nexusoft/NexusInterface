/**
 * Webpack base config for electron renderer process
 */

import merge from 'webpack-merge';

import baseConfig from './webpack.config.base';

export default merge.smart(baseConfig, {
  target: 'electron-renderer',

  module: {
    rules: [
      {
        test: /\.css$/,
        use: {
          loader: 'file-loader',
        },
      },
    ],
  },
});
