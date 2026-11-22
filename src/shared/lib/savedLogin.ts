import { ipcRenderer } from 'electron';

export interface SavedLogin {
  username: string;
  password: string;
  pin: string;
}

//login kept encrypted by the OS (DPAPI / Keychain / keyring) in the main process
export const savedLoginAvailable = (): Promise<boolean> =>
  ipcRenderer.invoke('saved-login-available');

export const rememberLogin = (login: SavedLogin): Promise<void> =>
  ipcRenderer.invoke('saved-login-write', login);

export const readSavedLogin = (): Promise<SavedLogin | null> =>
  ipcRenderer.invoke('saved-login-read');

export const forgetLogin = (): Promise<void> =>
  ipcRenderer.invoke('saved-login-clear');
