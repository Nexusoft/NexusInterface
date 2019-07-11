/**
 * Webpack config for Nexus Wallet Modules' production preload script
 */

import path from 'path';
import merge from 'webpack-merge';

import baseConfig from './webpack.config.base';

export default merge.smart(baseConfig, {
  target: 'electron-renderer',

  entry: './src/module_preload',

  output: {
    path: path.join(process.cwd(), 'build'),
  },

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
