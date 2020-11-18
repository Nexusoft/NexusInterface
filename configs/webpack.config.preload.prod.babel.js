/**
 * Webpack config for Nexus Wallet Modules' production preload script
 */

import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import { merge } from 'webpack-merge';

import baseConfig from './webpack.config.base.preload';
import CheckNodeEnv from '../internals/scripts/CheckNodeEnv';

CheckNodeEnv('production');

export default merge(baseConfig, {
  mode: 'production',

  devtool: 'source-map',

  output: {
    filename: 'module_preload.prod.js',
  },

  optimization: {
    moduleIds: 'deterministic',
  },

  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode:
        process.env.OPEN_ANALYZER === 'true' ? 'server' : 'disabled',
      openAnalyzer: process.env.OPEN_ANALYZER === 'true',
    }),
  ],
});
