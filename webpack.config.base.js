/**
 * Base webpack config used across other specific configs
 */

import path from 'path';
import webpack from 'webpack';
import { dependencies as externals } from './app/package.json';
import packageJson from './package.json';

const appVersion = packageJson.version;
const appId = packageJson.build.appId;

export default {
  externals: Object.keys(externals || {}),

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
          },
        },
      },
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
    ],
  },

  output: {
    path: path.join(__dirname, 'app'),
    filename: 'renderer.dev.js',
    // https://github.com/webpack/webpack/issues/1114
    libraryTarget: 'commonjs2',
  },

  /**
   * Determine the array of extensions that should be used to resolve modules.
   */
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
    modules: ['nxs_modules', 'node_modules'],
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(
        process.env.NODE_ENV || 'production'
      ),
      APP_VERSION: JSON.stringify(appVersion || ''),
      APP_ID: JSON.stringify(appId || ''),
    }),

    new webpack.NamedModulesPlugin(),
  ],
};
