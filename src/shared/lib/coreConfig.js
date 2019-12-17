import fs from 'fs';
import path from 'path';
import log from 'electron-log';
import crypto from 'crypto';
import macaddress from 'macaddress';

import { returnCoreDataDir } from 'consts/paths';

function generateDefaultPassword() {
  let randomNumbers = ['', ''];
  const ranByte = crypto
    .randomBytes(64)
    .toString('hex')
    .split('');
  for (let index = 0; index < ranByte.length; index++) {
    const element = ranByte[index];
    if (index % 2) {
      randomNumbers[0] += element.charCodeAt(0);
    } else {
      randomNumbers[1] += element.charCodeAt(0);
    }
  }
  randomNumbers[0] = parseInt(randomNumbers[0]);
  randomNumbers[1] = parseInt(randomNumbers[1]);
  const randomValue = randomNumbers[0] * randomNumbers[1];
  const secret =
    process.platform === 'darwin'
      ? process.env.USER + process.env.HOME + process.env.SHELL + randomValue
      : JSON.stringify(macaddress.networkInterfaces(), null, 2) + randomValue;
  return crypto
    .createHmac('sha256', secret)
    .update('pass')
    .digest('hex');
}

const fromKeyValues = rawContent =>
  rawContent
    ? rawContent.split('\n').reduce((obj, line) => {
        const equalIndex = line.indexOf('=');
        if (equalIndex >= 0) {
          const key = line.substring(0, equalIndex);
          const value = line.substring(equalIndex + 1);
          if (key) obj[key] = value;
        }
        return obj;
      }, {})
    : {};

const toKeyValues = obj =>
  Object.entries(obj)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

const defaultConfig = {
  ip: '127.0.0.1',
  port: '9336',
  apiPort: '8080',
  user: 'rpcserver',
  password: generateDefaultPassword(),
  apiUser: 'apiserver',
  apiPassword: generateDefaultPassword(),
  dataDir: returnCoreDataDir(),
  verbose: 2,
};

/**
 * Returns either the given config or default Config
 *
 * @export
 * @param {*} [config={}]
 * @returns
 */
export function customConfig(config = {}) {
  const ip = config.ip || defaultConfig.ip;
  const port = config.port || defaultConfig.port;
  const apiPort = config.apiPort || defaultConfig.apiPort;
  return {
    ip,
    port,
    apiPort,
    host: `http://${ip}:${port}`,
    apiHost: `http://${ip}:${apiPort}`,
    user: config.user || config.rpcuser || defaultConfig.user,
    password: config.password || config.rpcpassword || defaultConfig.password,
    apiUser: config.apiUser || config.apiuser || defaultConfig.apiUser,
    apiPassword:
      config.apiPassword || config.apipassword || defaultConfig.apiPassword,
    dataDir: config.dataDir || defaultConfig.dataDir,
    verbose:
      config.verbose || config.verbose === 0
        ? config.verbose
        : defaultConfig.verbose,
  };
}

/**
 * Load user & password from the nexus.conf file
 *
 * @returns
 */
export function loadNexusConf() {
  const confPath = path.join(returnCoreDataDir(), 'nexus.conf');
  const confContent = fs.existsSync(confPath)
    ? fs.readFileSync(confPath).toString()
    : '';
  const configs = fromKeyValues(confContent);
  log.info(
    'nexus.conf exists. Importing username and password for RPC server and API server.'
  );

  // Fallback to default values if empty
  const fallbackConf = [
    ['rpcuser', defaultConfig.user],
    ['rpcpassword', defaultConfig.password],
    ['apiuser', defaultConfig.apiUser],
    ['apipassword', defaultConfig.apiPassword],
  ];
  let updated = false;
  fallbackConf.forEach(([key, value]) => {
    // Don't replace it if value is an empty string
    if (configs[key] === undefined) {
      configs[key] = value;
      updated = true;
    }
  });

  // Save nexus.conf file if there were changes
  if (updated) {
    log.info('Filling up some missing configurations in nexus.conf');
    fs.writeFileSync(confPath, toKeyValues(configs));
  }

  return configs;
}
