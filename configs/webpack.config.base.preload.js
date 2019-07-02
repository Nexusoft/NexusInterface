/**
 * Webpack base config for Nexus Wallet Modules' preload script
 */

import merge from 'webpack-merge';

import baseConfig from './webpack.config.base';

export default merge.smart(baseConfig, {
  target: 'electron-renderer',

  entry: './app/module_preload',

  module: {
    rules: [
      // WOFF2 Font
      {
        test: /\.woff2$/,
        use: {
          loader: 'url-loader',
          options: {
            mimetype: 'font/woff2',
            outputPath: '../fonts',
          },
        },
      },
    ],
  },
});
