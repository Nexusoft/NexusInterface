import path from 'path';
import { merge } from 'webpack-merge';

import baseConfig from './webpack.config.base.babel';
import prodConfig from './webpack.config.base.prod.babel';
import { rendererBabelConfig } from './babelLoaderConfig.babel';

export default merge(baseConfig, prodConfig, {
  target: 'electron-preload',
  entry: {
    main_preload: './src/main/preload.js',
    keyboard_preload: './src/keyboard/preload.js',
  },
  output: {
    path: path.join(process.cwd(), 'build'),
    filename: '[name].prod.js',
  },
  module: {
    rules: [...rendererBabelConfig()],
  },
});
