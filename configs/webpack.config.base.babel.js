/**
 * Base webpack config used across other specific configs
 */

import path from 'path';
import webpack from 'webpack';
import { readFileSync } from 'fs';

import packageJson from '../package.json';

const appVersion = packageJson.version;
const buildDate = packageJson.buildDate;
const backwardCompatible = packageJson.backwardCompatible;
const appId = packageJson.build.appId;

let nexusPubKey = '';
try {
  nexusPubKey = readFileSync(
    path.resolve(process.cwd(), 'nexus_pub_key.pem')
  ).toString();
} catch (err) {
  console.error(err);
}

export default {
  output: {
    // https://github.com/webpack/webpack/issues/1114
    libraryTarget: 'commonjs2',
  },

  /**
   * Determine the array of extensions that should be used to resolve modules.
   */
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    modules: [path.join(process.cwd(), 'src/shared'), 'node_modules'],
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(
        process.env.NODE_ENV || 'production'
      ),
      APP_VERSION: JSON.stringify(appVersion || ''),
      BUILD_DATE: JSON.stringify(buildDate || ''),
      BACKWARD_COMPATIBLE_VERSION: JSON.stringify(backwardCompatible || ''),
      APP_ID: JSON.stringify(appId || ''),
      NEXUS_EMBASSY_PUBLIC_KEY: JSON.stringify(nexusPubKey),
      LOCK_TESTNET: JSON.stringify(process.env.LOCK_TESTNET || ''),
    }),
  ],
};
