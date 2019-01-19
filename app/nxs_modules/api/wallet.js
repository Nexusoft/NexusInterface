import fs from 'fs';

import config from 'api/configuration';
import normalizePath from 'utils/normalizePath';
import * as RPC from 'scripts/rpc';

export function backupWallet(backupFolder) {
  const defaultBackupDir = normalizePath(config.GetHomeDir() + '/NexusBackups');
  const backupDir = backupFolder || defaultBackupDir;

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
  }

  const now = new Date()
    .toString()
    .slice(0, 24)
    .split(' ')
    .reduce((a, b) => {
      return a + '_' + b;
    })
    .replace(/:/g, '_');

  return RPC.PROMISE('backupwallet', [
    backupDir + '/NexusBackup_' + now + '.dat',
  ]);
}
