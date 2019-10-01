import fs from 'fs';

import { defaultSettings } from 'lib/universal/settings';
import rpc from 'lib/rpc';

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

  return rpc('backupwallet', [backupDir + '/NexusBackup_' + now + '.dat']);
}
