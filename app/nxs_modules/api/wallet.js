import fs from 'fs';

import { normalizePath } from 'utils';
import * as RPC from 'scripts/rpc';

export function backupWallet(backupFolder) {
  const defaultHomeDir =
    process.platform === 'win32' ? process.env.USERPROFILE : process.env.HOME;
  const defaultBackupDir = normalizePath(defaultHomeDir + '/NexusBackups');
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
