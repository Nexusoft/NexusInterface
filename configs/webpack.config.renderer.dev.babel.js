/**
 * Webpack config for development electron renderer process
 */

import path from 'path';
import webpack from 'webpack';
import { merge } from 'webpack-merge';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';

import baseRendererConfig from './webpack.config.base.renderer.babel';
import devConfig from './webpack.config.base.dev.babel';
import { babelLoaderRenderer } from './babelLoaderConfig.babel';

const port = process.env.PORT || 1212;
const publicPath = `http://localhost:${port}/`;
const dllPath = path.resolve(process.cwd(), 'dll');
const manifest = path.resolve(dllPath, 'renderer.json');

export default merge(baseRendererConfig, devConfig, {
  entry: {
    'renderer.dev': './src/index',
    'keyboard.dev': './src/keyboard/index.js',
  },

  output: {
    publicPath,
    filename: '[name].js',
  },

  module: {
    rules: [
      babelLoaderRenderer({ hot: true }),
      {
        test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: 'url-loader',
          options: {
            mimetype: 'font/woff2',
            outputPath: 'fonts',
          },
        },
      },
    ],
  },

  plugins: [
    new webpack.DllReferencePlugin({
      context: process.cwd(),
      manifest: require(manifest),
      sourceType: 'var',
    }),

    new webpack.NoEmitOnErrorsPlugin(),

    new ReactRefreshWebpackPlugin(),
  ],

  node: {
    __dirname: false,
    __filename: false,
  },

  devServer: {
    port,
    compress: true,
    hot: true,
    headers: { 'Access-Control-Allow-Origin': '*' },
    devMiddleware: {
      publicPath,
      stats: 'errors-only',
    },
    static: [
      {
        directory: path.resolve(process.cwd(), 'assets/static'),
        publicPath: '/assets',
      },
      {
        directory: path.resolve(process.cwd(), 'dll'),

        publicPath: '/assets',
      },
    ],
  },
});
