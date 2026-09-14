import path from 'path';
import { merge } from 'webpack-merge';

import baseConfig from './webpack.config.base.babel';
import devConfig from './webpack.config.base.dev.babel';
import { rendererBabelConfig } from './babelLoaderConfig.babel';

export default merge(baseConfig, devConfig, {
  target: 'electron-preload',
  entry: {
    main_preload: './src/main/preload.js',
    keyboard_preload: './src/keyboard/preload.js',
  },
  output: {
    path: path.join(process.cwd(), 'build'),
    filename: '[name].dev.js',
  },
  module: {
    rules: [...rendererBabelConfig()],
  },
});
