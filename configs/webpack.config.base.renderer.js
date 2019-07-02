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
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        oneOf: [
          // SVG Sprite icons
          {
            test: /\.sprite.svg$/,
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
          // SVG Font
          {
            use: {
              loader: 'url-loader',
              options: {
                limit: 10000,
                mimetype: 'image/svg+xml',
              },
            },
          },
        ],
      },
      // WOFF2 Font
      {
        test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000,
            mimetype: 'font/woff2',
          },
        },
      },
      // Common Image Formats
      {
        test: /\.(?:ico|gif|png|jpg|jpeg|webp)$/,
        use: 'url-loader',
      },
    ],
  },
});
