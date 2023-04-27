/**
 * Webpack base config for electron renderer process
 */

import path from 'path';
import webpack from 'webpack';
import { merge } from 'webpack-merge';

import baseConfig from './webpack.config.base';

const intlPath = path.join(process.cwd(), 'src', 'shared', 'lib', 'intl.js');

export default merge(baseConfig, {
  target: 'electron-renderer',

  module: {
    rules: [
      {
        test: /\.svg$/,
        use: [
          {
            loader: 'svg-sprite-loader',
          },
          {
            loader: 'svgo-loader',
            options: {
              configFile: path.join(process.cwd(), 'svgo.config.js'),
            },
          },
        ],
      },
      {
        test: /\.(?:ico|gif|png|jpg|jpeg|webp)$/,
        use: 'url-loader',
      },
      {
        test: /\.(MD|css)$/,
        use: {
          loader: 'file-loader',
        },
      },
    ],
  },

  plugins: [
    new webpack.ProvidePlugin({
      __: [intlPath, 'translate'],
      ___: [intlPath, 'translateWithContext'],
      __context: [intlPath, 'withContext'],
    }),
  ],
});
