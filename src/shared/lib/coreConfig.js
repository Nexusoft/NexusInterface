import fs from 'fs';
import path from 'path';
import log from 'electron-log';
import crypto from 'crypto';
import macaddress from 'macaddress';

import { coreDataDir } from 'consts/paths';

function generateDefaultPassword() {
  let randomNumbers = ['', ''];
  const ranByte = crypto
    .randomBytes(Math.ceil(10 / 2))
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

const defaultConfig = {
  ip: '127.0.0.1',
  port: '9336',
  user: 'rpcserver',
  password: generateDefaultPassword(),
  dataDir: coreDataDir,
  verbose: 2,
};

export function customConfig(config = {}) {
  const ip = config.ip || defaultConfig.ip;
  const port = config.port || defaultConfig.port;
  return {
    ip,
    port,
    host: `http://${ip}:${port}`,
    user: config.user || defaultConfig.user,
    password: config.password || defaultConfig.password,
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
  if (fs.existsSync(path.join(coreDataDir, 'nexus.conf'))) {
    log.info('nexus.conf exists. Importing username and password.');

    const configs = fs
      .readFileSync(path.join(coreDataDir, 'nexus.conf'))
      .toString()
      .split(`\n`);
    const userConfig = configs
      .map(c => /^rpcuser=(.*)/.exec(c.trim()))
      .find(c => c);
    const user = userConfig && userConfig[1];
    const passwordConfig = configs
      .map(c => /^rpcpassword=(.*)/.exec(c.trim()))
      .find(c => c);
    const password = passwordConfig && passwordConfig[1];

    return { user, password };
  } else {
    return {};
  }
}
