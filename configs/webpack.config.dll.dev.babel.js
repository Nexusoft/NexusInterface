/**
 * Builds the DLL for development electron renderer process
 */

import webpack from 'webpack';
import path from 'path';
import { merge } from 'webpack-merge';

import baseConfig from './webpack.config.base';
import devConfig from './webpack.config.base.dev';
import { dependencies } from '../package.json';

const dllPath = path.resolve(process.cwd(), 'dll');

export default merge(baseConfig, devConfig, {
  context: process.cwd(),

  devtool: 'eval',

  target: 'electron-renderer',

  externals: ['fsevents', 'crypto-browserify'],

  entry: {
    renderer: Object.keys(dependencies || {}),
  },

  output: {
    library: 'renderer',
    path: dllPath,
    filename: '[name].dev.dll.js',
    libraryTarget: 'var',
  },

  plugins: [
    new webpack.DllPlugin({
      path: path.join(dllPath, '[name].json'),
      name: '[name]',
    }),

    new webpack.LoaderOptionsPlugin({
      debug: true,
      options: {
        context: path.resolve(process.cwd(), 'src'),
        output: {
          path: path.resolve(process.cwd(), 'dll'),
        },
      },
    }),
  ],
});
