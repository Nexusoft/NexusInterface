import crypto from 'crypto';
import macaddress from 'macaddress';

import { coreDataDir } from 'consts/paths';

function generateDefaultPassword() {
  const secret =
    process.platform === 'darwin'
      ? process.env.USER + process.env.HOME + process.env.SHELL
      : JSON.stringify(macaddress.networkInterfaces(), null, 2);
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
