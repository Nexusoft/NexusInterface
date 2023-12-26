/**
 * Webpack config for production electron renderer process
 */

import path from 'path';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import { merge } from 'webpack-merge';

import baseRendererConfig from './webpack.config.base.renderer.babel';
import prodConfig from './webpack.config.base.prod.babel';
import { babelLoaderRenderer } from './babelLoaderConfig.babel';

export default merge(baseRendererConfig, prodConfig, {
  entry: {
    'renderer.prod': './src/index.js',
    'keyboard.prod': './src/keyboard/index.js',
  },

  output: {
    path: path.join(process.cwd(), 'build'),
    filename: '[name].js',
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

  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode:
        process.env.OPEN_ANALYZER === 'true' ? 'server' : 'disabled',
      openAnalyzer: process.env.OPEN_ANALYZER === 'true',
    }),
  ],
});
