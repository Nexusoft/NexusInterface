import fs from 'fs';

import { defaultSettings } from 'api/settings';
import * as RPC from 'scripts/rpc';

export function backupWallet(backupFolder) {
  const backupDir = backupFolder || defaultSettings.backupDirectory;

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
