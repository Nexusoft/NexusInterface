/**
 * Webpack config for Nexus Wallet Modules' prod-dev preload script
 */

import { merge } from 'webpack-merge';

import basePreloadConfig from './webpack.config.base.preload.babel';
import prodConfig from './webpack.config.base.prod.babel';
import { rendererBabelConfig } from './babelLoaderConfig.babel';

export default merge(basePreloadConfig, prodConfig, {
  devtool: 'eval-nosources-cheap-module-source-map',

  mode: 'production',
  output: {
    filename: 'module_preload.dev.js',
  },
  module: {
    rules: [
      ...rendererBabelConfig(),
      {
        test: /\.js$/,
        exclude: {
          and: [/node_modules/],
          not: [/s\/react\//],
        },
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
            plugins: [
              [
                ({ types: t }) => {
                  return {
                    visitor: {
                      MemberExpression(path) {
                        if (path.matchesPattern('process.env.NODE_ENV')) {
                          path.replaceWith(t.valueToNode('development'));
                          if (path.parentPath.isBinaryExpression()) {
                            const evaluated = path.parentPath.evaluate();
                            if (evaluated.confident) {
                              path.parentPath.replaceWith(
                                t.valueToNode(evaluated.value)
                              );
                            }
                          }
                        }
                      },
                    },
                  };
                },
              ],
            ],
          },
        },
      },
    ],
  },
});
