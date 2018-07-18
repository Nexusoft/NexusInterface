const { remote } = require("electron");
const { Menu, MenuItem } = remote;

let menu = new Menu();
menu.append(
  new MenuItem({
    label: "File",
    submenu: [
      {
        label: "Exit Interface",
        role: "Exit"
      },
      {
        label: "Shutdown Nexus",
        role: "Shutdown"
      },
      {
        label: "Open Backups Folder",
        click() {
          require("electron").shell.openItem(
            process.env.HOME + "/NexusBackups"
          );
        }
      },
      {
        type: "separator"
      },
      {
        label: "Reload",
        accelerator: "CmdOrCtrl+R",
        click(item, focusedWindow) {
          if (focusedWindow) focusedWindow.reload();
        }
      },
      {
        label: "Toggle Developer Tools",
        accelerator:
          process.platform === "darwin" ? "Alt+Command+I" : "Ctrl+Shift+I",
        click(item, focusedWindow) {
          if (focusedWindow) focusedWindow.webContents.toggleDevTools();
        }
      }
    ]
  })
);

menu.append(
  new MenuItem({
    label: "Tools",
    submenu: [
      {
        label: "Lock/Unlock/Encrypt Wallet",
        click() {
          LOAD.Module(11, 1);
        }
      },
      {
        label: "Change Passphrase",
        click() {
          LOAD.Module(11, 1);
        }
      },
      {
        label: "Backup Wallet",
        click() {
          LOAD.Module(3, 1);
        }
      },
      {
        type: "separator"
      },
      {
        label: "Options",
        click() {
          LOAD.Module(9, 1);
        }
      }
    ]
  })
);
menu.append(
  new MenuItem({
    role: "window",
    submenu: [
      {
        label: "Minimize",
        role: "minimize"
      },
      {
        label: "Close Window",
        role: "close"
      }
    ]
  })
);
menu.append(
  new MenuItem({
    role: "help",
    submenu: [
      {
        label: "About Nexus",
        click() {
          LOAD.Module(13, 1);
        }
      },
      {
        label: "Debug Info",
        click() {
          OVERVIEW.openDebugModal();
        }
      },
      {
        label: "Nexus Earth",
        click() {
          require("electron").shell.openExternal("http://nexusearth.com");
        }
      },
      {
        label: "Nexusoft Github",
        click() {
          require("electron").shell.openExternal("http://github.com/Nexusoft");
        }
      },
      {
        label: "Electron Documentation",
        click() {
          require("electron").shell.openExternal("http://electron.atom.io");
        }
      }
    ]
  })
);

if (process.platform === "darwin") {
  const name = app.getName();
  template.unshift({
    label: name,
    submenu: [
      {
        role: "about"
      },
      {
        type: "separator"
      },
      {
        role: "services",
        submenu: []
      },
      {
        type: "separator"
      },
      {
        role: "hide"
      },
      {
        role: "hideothers"
      },
      {
        role: "unhide"
      },
      {
        type: "separator"
      },
      {
        role: "quit"
      }
    ]
  });
  // Edit menu.
  template[1].submenu.push(
    {
      type: "separator"
    },
    {
      label: "Speech",
      submenu: [
        {
          role: "startspeaking"
        },
        {
          role: "stopspeaking"
        }
      ]
    }
  );
  // Window menu.
  template[3].submenu = [
    {
      label: "Close",
      accelerator: "CmdOrCtrl+W",
      role: "close"
    },
    {
      label: "Minimize",
      accelerator: "CmdOrCtrl+M",
      role: "minimize"
    },
    {
      label: "Zoom",
      role: "zoom"
    },
    {
      type: "separator"
    },
    {
      label: "Bring All to Front",
      role: "front"
    }
  ];
}

// const menu = Menu.buildFromTemplate(menuTemp);
export default menu;
