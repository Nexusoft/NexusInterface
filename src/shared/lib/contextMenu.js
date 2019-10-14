import { remote } from 'electron';

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
  remote.Menu.buildFromTemplate(defaultMenu).popup();
}
