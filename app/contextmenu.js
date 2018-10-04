import { app, Menu, shell, BrowserWindow, remote } from "electron";

import * as RPC from "./script/rpc";

export default class ContextMenuBuilder {
  defaultContext: [];

  constructor(defaultContext: []) {
    this.defaultContext = this.ReturnDefaultContextMenu();
  }

  ReturnDefaultContextMenu() {
    const template = [
      {
        label: "Copy",
        ccelerator: "CmdOrCtrl+C",
        role: "copy"
      },
      {
        label: "Paste",
        ccelerator: "CmdOrCtrl+V",
        role: "paste"
      }
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
      //   ccelerator: "CmdOrCtrl+Y",
      //   click(item, focusedWindow) {
      //     focusedWindow.loadURL("/About");
      //     //history.push('/About');
      //   }
      // }
    ];
    return template;
  }
}
