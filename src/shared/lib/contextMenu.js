import { ipcRenderer } from 'electron';

export const defaultMenu = [
  {
    label: 'Copy',
    accelerator: 'CmdOrCtrl+C',
    role: 'copy',
  },
  {
    label: 'Paste',
    accelerator: 'CmdOrCtrl+V',
    role: 'paste',
  },
];

export function showDefaultMenu(e) {
  e.preventDefault();
  ipcRenderer.invoke('popup-context-menu', defaultMenu);
}
