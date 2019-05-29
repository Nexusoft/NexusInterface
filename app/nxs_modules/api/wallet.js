import fs from 'fs';

import { defaultSettings } from 'api/settings';
import * as Backend from 'scripts/backend-com';

/**
 * Backs up wallet
 *
 * @export {function} The function
 * @param {string} backupFolder The folder to backup too. 
 * @returns {Promise} RPC Promise of backup function. 
 */
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

  return Backend.RunCommand('RPC', 'backupwallet', [
    backupDir + '/NexusBackup_' + now + '.dat',
  ]);
}
