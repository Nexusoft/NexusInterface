import { app, Menu, shell, BrowserWindow, remote } from "electron";

import * as RPC from "./script/rpc";

export default class ContextMenuBuilder {
  defaultContext: [];

  constructor(defaultContext: []) {
    this.defaultContext = this.ReturnDefaultContextMenu();
  }

  ReturnDefaultContextMenu() {
    let template = [];
    if (process.platform === "darwin") {
      template = [
        {
          label: "Copy",
          accelerator: "Cmd+C",
          role: "copy"
        },
        {
          label: "Paste",
          accelerator: "Cmd+V",
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
    } else {
      template = [
        {
          label: "Copy",
          accelerator: "Ctrl+C",
          role: "copy"
        },
        {
          label: "Paste",
          accelerator: "Ctrl+V",
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
    }
    return template;
  }
}
