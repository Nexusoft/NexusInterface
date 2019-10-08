/**
 * Webpack base config for electron renderer process
 */

import path from 'path';
import webpack from 'webpack';
import merge from 'webpack-merge';

import baseConfig from './webpack.config.base';

export default merge.smart(baseConfig, {
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
              externalConfig: 'svgo-config.json',
            },
          },
        ],
      },
      {
        test: /\.(?:ico|gif|png|jpg|jpeg|webp)$/,
        use: 'url-loader',
      },
      {
        test: /\.MD$/,
        use: {
          loader: 'file-loader',
        },
      },
    ],
  },

  plugins: [
    new webpack.ProvidePlugin({
      __: [
        path.join(process.cwd(), 'src', 'shared', 'lib', 'intl.js'),
        'translate',
      ],
    }),
  ],
});
