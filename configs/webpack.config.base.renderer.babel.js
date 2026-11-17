/**
 * Webpack base config for electron renderer process
 */

import path from 'path';
import webpack from 'webpack';
import { merge } from 'webpack-merge';

import baseConfig from './webpack.config.base.babel';

const intlPath = path.join(process.cwd(), 'src', 'shared', 'lib', 'intl.tsx');
const electronBridgePath = path.join(
  process.cwd(),
  'src',
  'shared',
  'lib',
  'electronBridge.ts'
);
const aptabaseRendererPath = path.join(
  process.cwd(),
  'src',
  'shared',
  'lib',
  'aptabaseRenderer.ts'
);

const rendererBaseConfig = { ...baseConfig, output: { ...baseConfig.output } };
delete rendererBaseConfig.output.libraryTarget;

export default merge(rendererBaseConfig, {
  target: 'web',

  output: {
    globalObject: 'self',
  },

  externalsPresets: {
    node: false,
    electron: false,
    electronRenderer: false,
  },

  resolve: {
    conditionNames: ['webpack', 'production', 'browser', 'import', 'module', 'default'],
    alias: {
      electron: electronBridgePath,
      '@aptabase/electron/renderer': aptabaseRendererPath,
    },
  },

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
