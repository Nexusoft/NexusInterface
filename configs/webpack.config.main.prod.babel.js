/**
 * Webpack config for production electron main process
 */

import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import { merge } from 'webpack-merge';

import baseMainConfig from './webpack.config.base.main.babel';
import prodConfig from './webpack.config.base.prod.babel';

export default merge(baseMainConfig, prodConfig, {
  output: {
    filename: 'main.prod.js',
  },

  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode:
        process.env.OPEN_ANALYZER === 'true' ? 'server' : 'disabled',
      openAnalyzer: process.env.OPEN_ANALYZER === 'true',
    }),
  ],
});
