import { app, Menu, shell, BrowserWindow, remote } from 'electron';
import log from 'electron-log';
import fs from 'fs';
import * as RPC from './scripts/rpc';
import { callbackify } from 'util';
import { GetSettings, SaveSettings } from './api/settings';
import core from './api/core';
import configuration from './api/configuration';

export default class MenuBuilder {
  constructor() {
    this.mainWindow = remote.getCurrentWindow();
  }

  buildMenu(self) {
    let template;

    if (process.platform === 'darwin') {
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

    this.mainWindow.webContents.on('context-menu', (e, props) => {
      const { x, y } = props;

      Menu.buildFromTemplate([
        {
          label: 'Inspect element',
          click: () => {
            this.mainWindow.inspectElement(x, y);
          },
        },
      ]).popup(this.mainWindow);
    });
  }

  buildDarwinTemplate(self) {
    const subMenuAbout = {
      label: 'Nexus',
      submenu: [
        {
          label: 'Start Daemon',
          click() {
            core.start();
          },
        },
        {
          label: 'Stop Daemon',
          click() {
            let settings = GetSettings();
            if (settings.manualDaemon != true) {
              remote
                .getGlobal('core')
                .stop()
                .then(payload => {
                  console.log(payload);
                });
            } else {
              RPC.PROMISE('stop', []).then(() => {
                self.props.clearOverviewVariables();
              });
            }
          },
        },
        {
          type: 'separator',
        },
        {
          label: 'Quit Nexus',
          accelerator: 'CmdOrCtrl+Q',
          click() {
            self.props.clearOverviewVariables();
            self.props.OpenModal('Closing Nexus');
            remote.getCurrentWindow().close();
          },
        },
        {
          label: 'About',
          click() {
            self.props.history.push('/About');
          },
        },
      ],
    };
    const subMenuFile = {
      label: 'File',
      submenu: [
        {
          label: 'Backup Wallet',
          click: () => {
            let now = new Date()
              .toString()
              .slice(0, 24)
              .split(' ')
              .reduce((a, b) => {
                return a + '_' + b;
              })
              .replace(/:/g, '_');
            let BackupDir = process.env.HOME + '/NexusBackups';
            if (process.platform === 'win32') {
              BackupDir = app.getPath('documents') + '/NexusBackups';
              BackupDir = BackupDir.replace(/\\/g, '/');
            }
            if (self.props.settings.Folder !== BackupDir) {
              BackupDir = self.props.settings.Folder;
            }
            let ifBackupDirExists = fs.existsSync(BackupDir);
            if (ifBackupDirExists == undefined || ifBackupDirExists == false) {
              fs.mkdirSync(BackupDir);
            }
            RPC.PROMISE('backupwallet', [
              BackupDir + '/NexusBackup_' + now + '.dat',
            ]).then(() => {
              self.props.OpenModal('Wallet Backup');
            });
          },
        },
        {
          label: 'View Backups',
          click() {
            let BackupDir = process.env.HOME + '/NexusBackups';

            if (process.platform === 'win32') {
              BackupDir = process.env.USERPROFILE + '/NexusBackups';
              BackupDir = BackupDir.replace(/\\/g, '/');
            }
            let ifBackupDirExists = fs.existsSync(BackupDir);
            if (ifBackupDirExists == undefined || ifBackupDirExists == false) {
              fs.mkdirSync(BackupDir);
            }
            let didopen = shell.openItem(BackupDir);
          },
        },
      ],
    };
    const subMenuEdit = {
      label: 'Edit',
      submenu: [
        {
          label: 'Cut',
          accelerator: 'CmdOrCtrl+X',
          role: 'cut',
        },
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
      ],
    };
    const subMenuView = {
      label: 'Settings',
      submenu: [
        {
          label: 'Core',
          click() {
            self.props.history.push('/Settings/Core');
          },
        },
        {
          label: 'Application',
          click() {
            self.props.history.push('/Settings/App');
          },
        },
        {
          label: 'Key Management',
          click() {
            if (self.props.unlocked_until !== undefined) {
              self.props.history.push('/Settings/Security');
            } else {
              self.props.history.push('/Settings/Unencrypted');
            }
          },
        },
        {
          label: 'Style',
          click() {
            self.props.history.push('/Settings/Style');
          },
        },
        {
          type: 'separator',
        },
        {
          label: 'Download Recent Database',
          click() {
            if (
              self.props.connections !== undefined &&
              !GetSettings().manualDaemon
            ) {
              self.props.OpenBootstrapModal(true);
              //configuration.BootstrapRecentDatabase(self);
            } else {
              self.props.OpenModal('Please let the daemon start.');
            }
          },
        },
        //TODO: take this out before 1.0
      ],
    };

    const subMenuWindow = {
      label: 'View',
      submenu: [
        {
          label: 'Toggle Full Screen',
          accelerator: 'F11',
          click: () => {
            remote
              .getCurrentWindow()
              .setFullScreen(!remote.getCurrentWindow().isFullScreen());
          },
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: 'Alt+Command+I',
          click: () => {
            this.mainWindow.toggleDevTools();
          },
        },
      ],
    };
    const subMenuHelp = {
      label: 'Help',
      submenu: [
        // {
        //   label: 'About',
        //   click() {
        //     self.props.history.push('/About');
        //   },
        // },

        {
          label: 'Nexus Earth Website',
          click() {
            shell.openExternal('http://nexusearth.com');
          },
        },
        {
          label: 'Nexus Git Repository',
          click() {
            shell.openExternal('http://github.com/Nexusoft');
          },
        },
      ],
    };

    return [
      subMenuAbout,
      subMenuFile,
      subMenuEdit,
      subMenuView,
      subMenuWindow,
      subMenuHelp,
    ];
  }

  buildDefaultTemplate(self) {
    const templateDefault = [
      {
        label: '&File',
        submenu: [
          {
            label: 'Backup Wallet',
            click: () => {
              let now = new Date()
                .toString()
                .slice(0, 24)
                .split(' ')
                .reduce((a, b) => {
                  return a + '_' + b;
                })
                .replace(/:/g, '_');

              let BackupDir = process.env.HOME + '/NexusBackups';
              if (process.platform === 'win32') {
                BackupDir = process.env.USERPROFILE + '/NexusBackups';
                BackupDir = BackupDir.replace(/\\/g, '/');
              }
              if (self.props.settings.Folder !== BackupDir) {
                BackupDir = self.props.settings.Folder;
              }
              let ifBackupDirExists = fs.existsSync(BackupDir);
              if (
                ifBackupDirExists == undefined ||
                ifBackupDirExists == false
              ) {
                fs.mkdirSync(BackupDir);
              }
              RPC.PROMISE('backupwallet', [
                BackupDir + '/NexusBackup_' + now + '.dat',
              ]).then(() => {
                self.props.OpenModal('Wallet Backup');
              });
            },
          },

          {
            label: 'View Backups',
            click() {
              let BackupDir = process.env.HOME + '/NexusBackups';
              if (process.platform === 'win32') {
                BackupDir = process.env.USERPROFILE + '/NexusBackups';
                BackupDir = BackupDir.replace(/\\/g, '/');
              }
              let ifBackupDirExists = fs.existsSync(BackupDir);
              if (
                ifBackupDirExists == undefined ||
                ifBackupDirExists == false
              ) {
                fs.mkdirSync(BackupDir);
              }
              let didopen = shell.openItem(BackupDir);
            },
          },
          {
            type: 'separator',
          },
          {
            label: 'Start Daemon',
            click() {
              core.start();
            },
          },

          {
            label: 'Stop Daemon',
            click() {
              remote
                .getGlobal('core')
                .stop()
                .then(payload => {
                  self.props.clearOverviewVariables();
                });
            },
          },
          {
            type: 'separator',
          },
          {
            label: 'Quit Nexus',
            click() {
              self.props.clearOverviewVariables();
              self.props.OpenModal('Closing Nexus');
              remote.getCurrentWindow().close();
            },
          },
        ],
      },

      {
        label: 'Settings',
        submenu: [
          {
            label: 'Core',
            click() {
              self.props.history.push('/Settings/Core');
            },
          },
          {
            label: 'Application',
            click() {
              self.props.history.push('/Settings/App');
            },
          },
          {
            label: 'Key Management',
            click() {
              if (self.props.unlocked_until !== undefined) {
                self.props.history.push('/Settings/Security');
              } else {
                self.props.history.push('/Settings/Unencrypted');
              }
            },
          },
          {
            label: 'Style',
            click() {
              self.props.history.push('/Settings/Style');
            },
          },
          {
            type: 'separator',
          },
          {
            label: 'Download Recent Database',
            click() {
              if (
                self.props.connections !== undefined &&
                !GetSettings().manualDaemon
              ) {
                self.props.OpenBootstrapModal(true);
                //configuration.BootstrapRecentDatabase(self);
              } else {
                self.props.OpenModal('Please let the daemon start.');
              }
            },
          },
        ],
      },
      {
        label: '&View',
        submenu: [
          {
            label: 'Toggle Full Screen',
            accelerator: 'F11',
            click: () => {
              remote
                .getCurrentWindow()
                .setFullScreen(!remote.getCurrentWindow().isFullScreen());
            },
          },
          {
            type: 'separator',
          },
          {
            label: 'Toggle &Developer Tools',
            accelerator: 'Alt+Ctrl+I',
            click: () => {
              this.mainWindow.toggleDevTools();
            },
          },
        ],
      },
      {
        label: 'Help',
        submenu: [
          {
            label: 'About',
            click() {
              self.props.history.push('/About');
            },
          },
          {
            label: 'Nexus Earth Website',
            click() {
              shell.openExternal('http://nexusearth.com');
            },
          },
          {
            label: 'Nexus Git Repository',
            click() {
              shell.openExternal('http://github.com/Nexusoft');
            },
          },
        ],
      },
    ];

    return templateDefault;
  }
}
