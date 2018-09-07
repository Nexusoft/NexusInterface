import { app, Menu, shell, BrowserWindow, remote } from "electron";

import * as RPC from "./script/rpc";
import { callbackify } from "util";

export default class MenuBuilder {
  mainWindow: remote.BrowserWindow;

  constructor(mainWindow: remote.BrowserWindow) {
    this.mainWindow = remote.getCurrentWindow();
  }

  buildMenu(self) {
    let template;

    if (process.platform === "darwin") {
      template = this.buildDarwinTemplate(self);
    } else {
      template = this.buildDefaultTemplate(self);
    }

    const menu = remote.Menu.buildFromTemplate(template);
    remote.Menu.setApplicationMenu(menu);

    return menu;
  }

  setupDevelopmentEnvironment() {
    remote.getCurrentWindow().openDevTools();

    this.mainWindow.webContents.on("context-menu", (e, props) => {
      const { x, y } = props;

      Menu.buildFromTemplate([
        {
          label: "Inspect element",
          click: () => {
            this.mainWindow.inspectElement(x, y);
          }
        }
      ]).popup(this.mainWindow);
    });
  }

  buildDarwinTemplate(self) {
    const subMenuAbout = {
      label: "Electron",
      submenu: [
        {
          label: "About ElectronReact",
          selector: "orderFrontStandardAboutPanel:"
        },
        { type: "separator" },
        { label: "Services", submenu: [] },
        { type: "separator" },
        {
          label: "Hide ElectronReact",
          accelerator: "Command+H",
          selector: "hide:"
        },
        {
          label: "Hide Others",
          accelerator: "Command+Shift+H",
          selector: "hideOtherApplications:"
        },
        { label: "Show All", selector: "unhideAllApplications:" },
        { type: "separator" },
        {
          label: "Quit",
          accelerator: "Command+Q",
          click: () => {
            app.quit();
          }
        }
      ]
    };
    const subMenuEdit = {
      label: "Edit",
      submenu: [
        { label: "Undo", accelerator: "Command+Z", selector: "undo:" },
        { label: "Redo", accelerator: "Shift+Command+Z", selector: "redo:" },
        { type: "separator" },
        { label: "Cut", accelerator: "Command+X", selector: "cut:" },
        { label: "Copy", accelerator: "Command+C", selector: "copy:" },
        { label: "Paste", accelerator: "Command+V", selector: "paste:" },
        {
          label: "Select All",
          accelerator: "Command+A",
          selector: "selectAll:"
        }
      ]
    };
    const subMenuViewDev = {
      label: "View",
      submenu: [
        {
          label: "Reload",
          accelerator: "Command+R",
          click: () => {
            this.mainWindow.webContents.reload();
          }
        },
        {
          label: "Toggle Full Screen",
          accelerator: "Ctrl+Command+F",
          click: () => {
            this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
          }
        },
        {
          label: "Toggle Developer Tools",
          accelerator: "Alt+Command+I",
          click: () => {
            this.mainWindow.toggleDevTools();
          }
        }
      ]
    };
    const subMenuViewProd = {
      label: "View",
      submenu: [
        {
          label: "Toggle Full Screen",
          accelerator: "Ctrl+Command+F",
          click: () => {
            this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
          }
        }
      ]
    };
    const subMenuWindow = {
      label: "Window",
      submenu: [
        {
          label: "Minimize",
          accelerator: "Command+M",
          selector: "performMiniaturize:"
        },
        { label: "Close", accelerator: "Command+W", selector: "performClose:" },
        { type: "separator" },
        { label: "Bring All to Front", selector: "arrangeInFront:" }
      ]
    };
    const subMenuHelp = {
      label: "Help",
      submenu: [
        {
          label: "Learn More",
          click() {
            shell.openExternal("http://electron.atom.io");
          }
        },
        {
          label: "Documentation",
          click() {
            shell.openExternal(
              "https://github.com/atom/electron/tree/master/docs#readme"
            );
          }
        },
        {
          label: "Community Discussions",
          click() {
            shell.openExternal("https://discuss.atom.io/c/electron");
          }
        },
        {
          label: "Search Issues",
          click() {
            shell.openExternal("https://github.com/atom/electron/issues");
          }
        }
      ]
    };

    const subMenuView =
      process.env.NODE_ENV === "development" ? subMenuViewDev : subMenuViewProd;

    return [subMenuAbout, subMenuEdit, subMenuView, subMenuWindow, subMenuHelp];
  }

  buildDefaultTemplate(self) {
    const templateDefault = [
      {
        label: "&File",
        submenu: [
          {
            label: "Lock/Unlock/Encrypt Wallet",
            click: () => {
              if (self.props.unlocked_until !== undefined) {
                self.props.history.push("/Settings/Security");
              } else {
                self.props.history.push("/Settings/Unencrypted");
              }
            }
          },
          {
            label: "Back-up Wallet",
            click: () => {
              let now = new Date().toISOString().replace(/[^0-9]/g, "_");
              let BackupDir = process.env.HOME + "/NexusBackups";
              if (process.platform === "win32") {
                BackupDir = BackupDir.replace(/\\/g, "/");
              }
              let fs = require("fs");
              let ifBackupDirExists = fs.existsSync(BackupDir);
              if (
                ifBackupDirExists == undefined ||
                ifBackupDirExists == false
              ) {
                fs.mkdirSync(BackupDir);
              }
              RPC.PROMISE("backupwallet", [
                BackupDir + "/NexusBackup_" + now + ".dat"
              ]);
            }
          },
          {
            label: "Open Backups Folder",
            click() {
              let fs = require("fs");
              let BackupDir = process.env.HOME + "/NexusBackups";
              if (process.platform === "win32") {
                BackupDir = BackupDir.replace(/\\/g, "/");
              }
              let ifBackupDirExists = fs.existsSync(BackupDir);
              if (
                ifBackupDirExists == undefined ||
                ifBackupDirExists == false
              ) {
                fs.mkdirSync(BackupDir);
              }
              let didopen = shell.openItem(BackupDir);
            }
          },
          {
            label: "Send To Tray",
            click() {
              remote.getCurrentWindow().hide();
            }
          },
          {
            label: "Close Window Keep Daemon",
            click() {
              remote.getCurrentWindow().close();
            }
          },
          {
            label: "Close And Shutdown Daemon",
            click() {
              RPC.PROMISE("stop", []).then(payload => {
                setTimeout(() => {
                  remote.getCurrentWindow().close();
                }, 1000);
              });
            }
          }
        ]
      },
      {
        label: "Settings",
        submenu: [
          {
            label: "Core Settings",
            click() {
              self.props.history.push("/Settings/Core");
            }
          },
          {
            label: "Application Settings",
            click() {
              self.props.history.push("/Settings/App");
            }
          },
          {
            label: "Toggle &Developer Tools",
            accelerator: "Alt+Ctrl+I",
            click: () => {
              this.mainWindow.toggleDevTools();
            }
          }
          
        ]
      },
      {
        label: "&View",
        submenu:
          process.env.NODE_ENV === "development"
            ? [
                {
                  label: "&Reload",
                  accelerator: "Ctrl+R",
                  click: () => {
                    this.mainWindow.webContents.reload();
                  }
                },

                {
                  label: "Toggle &Full Screen",
                  accelerator: "F11",
                  click: () => {
                    remote
                      .getCurrentWindow()
                      .setFullScreen(!remote.getCurrentWindow().isFullScreen());
                  }
                },
                {
                  label: "Toggle &Developer Tools",
                  accelerator: "Alt+Ctrl+I",
                  click: () => {
                    this.mainWindow.toggleDevTools();
                  }
                }
              ]
            : [
                {
                  label: "Toggle &Full Screen",
                  accelerator: "F11",
                  click: () => {
                    // this.mainWindow.setFullScreen(
                    //   !this.mainWindow.isFullScreen()
                    // );
                  }
                }
              ]
      },
      {
        label: "Help",
        submenu: [
          {
            label: "About Nexus",
            click() {
              self.props.history.push("/About");
            }
          },
          {
            label: "NexusEarth",
            click() {
              shell.openExternal("http://nexusearth.com");
            }
          },
          {
            label: "Nexusoft Github",
            click() {
              shell.openExternal("http://github.com/Nexusoft");
            }
          },
          {
            label: "Electron Documentation",
            click() {
              shell.openExternal("http://electron.atom.io");
            }
          }
        ]
      }
    ];

    return templateDefault;
  }
}
