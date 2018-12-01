import { app, Menu, shell, BrowserWindow, remote } from 'electron'

import * as RPC from './scripts/rpc'

export default class ContextMenuBuilder {
  defaultContext: []

  constructor(defaultContext: []) {
    this.defaultContext = this.ReturnDefaultContextMenu()
  }

  ReturnDefaultContextMenu() {
    return [
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
      // ,
      // { type: "separator" },

      //{
      //label: "Reload",
      //accelerator: "CmdOrCtrl+R",
      //click(item, focusedWindow) {
      //if (focusedWindow) focusedWindow.reload();
      //}
      //},
      // {
      //   label: "About",
      //   accelerator: "CmdOrCtrl+Y",
      //   click(item, focusedWindow) {
      //     focusedWindow.loadURL("/About");
      //     //history.push('/About');
      //   }
      // }
    ]
  }
}
