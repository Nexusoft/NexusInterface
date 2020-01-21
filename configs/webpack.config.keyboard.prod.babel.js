/**
 * Build config for electron renderer process
 */

import path from 'path';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import merge from 'webpack-merge';
import TerserPlugin from 'terser-webpack-plugin';

import baseConfig from './webpack.config.base.renderer';
import CheckNodeEnv from '../internals/scripts/CheckNodeEnv';
import { babelLoaderRenderer } from './babelLoaderConfig';

CheckNodeEnv('production');

export default merge.smart(baseConfig, {
  entry: './src/keyboard/index.js',

  output: {
    path: path.join(process.cwd(), 'build'),
    filename: 'keyboard.prod.js',
  },

  module: {
    rules: [
      babelLoaderRenderer(),
      {
        test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000,
            mimetype: 'font/woff2',
            outputPath: 'fonts',
          },
        },
      },
    ],
  },

  optimization: {
    minimizer: process.env.E2E_BUILD
      ? []
      : [
          new TerserPlugin({
            parallel: true,
            sourceMap: false,
            cache: true,
          }),
        ],
  },

  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode:
        process.env.OPEN_ANALYZER === 'true' ? 'server' : 'disabled',
      openAnalyzer: process.env.OPEN_ANALYZER === 'true',
    }),
  ],
});
