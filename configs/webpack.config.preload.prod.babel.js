/**
 * Webpack config for Nexus Wallet Modules' production preload script
 */

import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import { merge } from 'webpack-merge';

import basePreloadConfig from './webpack.config.base.preload';
import prodConfig from './webpack.config.base.prod';

export default merge(basePreloadConfig, prodConfig, {
  output: {
    filename: 'module_preload.prod.js',
  },

  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode:
        process.env.OPEN_ANALYZER === 'true' ? 'server' : 'disabled',
      openAnalyzer: process.env.OPEN_ANALYZER === 'true',
    }),
  ],
});
