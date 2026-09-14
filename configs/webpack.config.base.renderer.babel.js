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

export default merge(baseConfig, {
  target: 'electron-renderer',

  // The renderer's `electron` alias below points at a safe, allowlisted
  // wrapper (src/shared/lib/electronBridge.ts) around window.nexusElectron,
  // instead of the real `electron` module. Without this override, the
  // `electron-renderer` target's built-in Electron externals would
  // short-circuit webpack's module resolution and force every
  // `import ... from 'electron'` to compile to a raw `require("electron")`,
  // silently bypassing the wrapper (and breaking entirely in any window that
  // runs with contextIsolation:true, where `require` isn't defined).
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
