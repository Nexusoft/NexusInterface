import { app, Menu, shell, BrowserWindow, remote } from 'electron';
import log from 'electron-log';
import * as RPC from './scripts/rpc';
import { callbackify } from 'util';
import { GetSettings, SaveSettings } from './api/settings';
import core from './api/core';

export default class MenuBuilder {
  mainWindow: remote.BrowserWindow;

  constructor(mainWindow: remote.BrowserWindow) {
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
            let core = require('./api/core');
            core.start();
          },
        },
        {
          label: 'Stop Daemon',
          click() {
            let settings = GetSettings();
            if (settings.manualDaemon != true) {
              let core = require('./api/core');

              core.stop();
            } else {
              self.props.OpenModal('Manual Daemon Mode active invalid command');
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
            log.info('menu.js darwin template: close and kill');
            let settings = GetSettings();
            if (settings.manualDaemon != true) {
              RPC.PROMISE('stop', [])
                .then(payload => {
                  setTimeout(() => {
                    core.stop();
                    remote.getCurrentWindow().close();
                  }, 1000);
                })
                .catch(e => {
                  setTimeout(() => {
                    remote.getGlobal('core').stop();
                    remote.getCurrentWindow().close();
                  }, 1000);
                });
            } else {
              RPC.PROMISE('stop', []).then(payload => {
                remote.getCurrentWindow().close();
              });
            }
          },
        },
      ],
    };
    const subMenuFile = {
      label: 'File',
      submenu: [
        {
          label: 'Back-up Wallet',
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
            let fs = require('fs');
            let ifBackupDirExists = fs.existsSync(BackupDir);
            if (ifBackupDirExists == undefined || ifBackupDirExists == false) {
              fs.mkdirSync(BackupDir);
            }
            RPC.PROMISE('backupwallet', [
              BackupDir + '/NexusBackup_' + now + '.dat',
            ]);
          },
        },
        {
          label: 'View Backups',
          click() {
            let fs = require('fs');
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
          label: 'Copy',
          accelerator: 'CmdOrCtrl+C',
          role: 'copy',
        },
        {
          label: 'Paste',
          accelerator: 'CmdOrCtrl+V',
          role: 'paste',
        },
        {
          label: 'Cut',
          accelerator: 'CmdOrCtrl+X',
          role: 'cut',
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
              let configuration = require('./api/configuration');
              self.props.OpenBootstrapModal(true);
              configuration.BootstrapRecentDatabase(self);
            } else {
              self.props.OpenModal('Please let the daemon start.');
              setTimeout(() => {
                self.props.CloseModal();
              }, 3000);
            }
          },
        },
        //TODO: take this out before 1.0
      ],
    };

    const subMenuWindow = {
      label: 'View',
      submenu:
        process.env.NODE_ENV === 'development'
          ? [
              {
                label: 'Reload',
                accelerator: 'Command+R',
                click: () => {
                  this.mainWindow.webContents.reload();
                },
              },

              {
                label: 'Toggle Full Screen',
                accelerator: 'F11',
                click: () => {
                  remote
                    .getCurrentWindow()
                    .setFullScreen(!remote.getCurrentWindow().isFullScreen());
                },
              },
            ]
          : [
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
        {
          label: 'About',
          click() {
            self.props.history.push('/About');
          },
        },
        {
          label: 'Website',
          click() {
            shell.openExternal('http://nexusearth.com');
          },
        },
        {
          label: 'Github',
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
            label: 'Back-up Wallet',
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
              let fs = require('fs');
              let ifBackupDirExists = fs.existsSync(BackupDir);
              if (
                ifBackupDirExists == undefined ||
                ifBackupDirExists == false
              ) {
                fs.mkdirSync(BackupDir);
              }
              RPC.PROMISE('backupwallet', [
                BackupDir + '/NexusBackup_' + now + '.dat',
              ]).then(self.props.OpenModal('Wallet Backup'));
            },
          },

          {
            label: 'View Backups',
            click() {
              let fs = require('fs');
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
              let core = require('./api/core');
              core.start();
            },
          },
          {
            label: 'Stop Daemon',
            click() {
              let core = require('./api/core');
              core.stop();
            },
          },
          {
            type: 'separator',
          },
          {
            label: 'Quit Nexus',
            click() {
              log.info('menu.js default template: close and kill');
              let settings = GetSettings();

              if (settings.manualDaemon != true) {
                RPC.PROMISE('stop', []).then(payload => {
                  console.log('poststop');
                  core.stop();
                  setTimeout(() => {
                    remote.getCurrentWindow().close();
                  }, 1000);
                });
                remote.getCurrentWindow().close();
              }
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
                let configuration = require('./api/configuration');
                self.props.OpenBootstrapModal(true);
                configuration.BootstrapRecentDatabase(self);
              } else {
                self.props.OpenModal('Please let the daemon start.');
                setTimeout(() => {
                  self.props.CloseModal();
                }, 3000);
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
            label: 'Website',
            click() {
              shell.openExternal('http://nexusearth.com');
            },
          },
          {
            label: 'Github',
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
