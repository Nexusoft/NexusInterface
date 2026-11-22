import fs from 'fs';
import path from 'path';
import { safeStorage } from 'electron';
import log from 'electron-log';

import { walletDataDir } from 'consts/paths';

const savedLoginPath = path.join(walletDataDir, 'saved-login.bin');

//linux without a keyring only obfuscates, so it does not count
export function savedLoginAvailable() {
  if (!safeStorage.isEncryptionAvailable()) return false;
  if (process.platform === 'linux') {
    const backend = safeStorage.getSelectedStorageBackend?.();
    return !!backend && backend !== 'basic_text' && backend !== 'unknown';
  }
  return true;
}

export function writeSavedLogin(login) {
  if (!savedLoginAvailable()) {
    throw new Error('Secure storage is not available on this system');
  }
  const { username, password, pin } = login || {};
  if (!username || !password || !pin) {
    throw new Error('Incomplete login');
  }
  const data = safeStorage.encryptString(
    JSON.stringify({ username, password, pin })
  );
  const tmp = savedLoginPath + '.tmp';
  fs.writeFileSync(tmp, data, { mode: 0o600 });
  fs.renameSync(tmp, savedLoginPath);
}

export function readSavedLogin() {
  try {
    if (!fs.existsSync(savedLoginPath) || !savedLoginAvailable()) return null;
    const login = JSON.parse(
      safeStorage.decryptString(fs.readFileSync(savedLoginPath))
    );
    return login?.username && login?.password && login?.pin ? login : null;
  } catch (err) {
    log.error('SavedLogin - cannot read the saved login', err);
    return null;
  }
}

export function clearSavedLogin() {
  try {
    if (fs.existsSync(savedLoginPath)) fs.unlinkSync(savedLoginPath);
  } catch (err) {
    log.error('SavedLogin - cannot delete the saved login', err);
  }
}
