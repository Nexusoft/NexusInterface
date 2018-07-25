import { app, Menu, shell, BrowserWindow, remote } from "electron";

import * as RPC from "./script/rpc";

export default class ContextMenuBuilder {
  defaultContext: [];

  constructor(defaultContext:[]) {
    this.defaultContext = this.ReturnDefaultContextMenu();
  }


  ReturnDefaultContextMenu()
  {
    const template = [
      {
        label: 'File',
        submenu: [
    
          {
            label: 'Copy',
            role: 'copy',
            
          }
        ]
      },
      {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click (item, focusedWindow) {
            if (focusedWindow) focusedWindow.reload()
          }
      },
      {
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click (item, focusedWindow) {
          if (focusedWindow) focusedWindow.reload()
        }
    }
    ]
    return template;
  }
}
