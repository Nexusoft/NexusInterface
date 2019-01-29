// External
import React from 'react';
import { shell, remote } from 'electron';
import fs from 'fs';

// Internal
import * as RPC from 'scripts/rpc';
import { updateSettings } from 'actions/settingsActionCreators';
import { backupWallet } from 'api/wallet';
import core from 'api/core';
import Text from 'components/Text';
import UIController from 'components/UIController';
import * as ac from 'actions/setupAppActionCreators';
import bootstrap, { checkFreeSpace } from 'actions/bootstrap';
import updater from 'updater';

const autoUpdater = remote.getGlobal('autoUpdater');

class AppMenu {
  initialize(store, history) {
    this.store = store;
    this.history = history;

    // Update the updater menu item when the updater state changes
    // Changing menu ittem labels directly has no effect so we have to rebuild the whole menu
    updater.on('state-change', this.build);
  }

  separator = {
    type: 'separator',
  };

  startDaemon = {
    label: 'Start Daemon',
    click: () => {
      core.start();
    },
  };

  stopDaemon = {
    label: 'Stop Daemon',
    click: () => {
      const state = this.store.getState();
      if (state.settings.manualDaemon) {
        RPC.PROMISE('stop', []).then(() => {
          this.store.dispatch(ac.clearOverviewVariables());
        });
      } else {
        remote
          .getGlobal('core')
          .stop()
          .then(payload => {
            console.log(payload);
          });
      }
    },
  };

  quitNexus = {
    label: 'Quit Nexus',
    accelerator: 'CmdOrCtrl+Q',
    click: () => {
      this.store.dispatch(ac.clearOverviewVariables());
      UIController.showNotification('Closing Nexus');
      remote.getCurrentWindow().close();
    },
  };

  about = {
    label: 'About',
    click: () => {
      this.history.push('/About');
    },
  };

  backupWallet = {
    label: 'Backup Wallet',
    click: () => {
      const state = this.store.getState();
      if (state.overview.connections) {
        remote.dialog.showOpenDialog(
          {
            title: 'Select a folder',
            defaultPath: state.settings.backupDirectory,
            properties: ['openDirectory'],
          },
          async folderPaths => {
            if (folderPaths && folderPaths.length > 0) {
              this.store.dispatch(
                updateSettings({ backupDirectory: folderPaths[0] })
              );

              await backupWallet(folderPaths[0]);
              UIController.showNotification(
                <Text id="Alert.WalletBackedUp" />,
                'success'
              );
              console.log(folderPaths[0]);
            }
          }
        );
      } else {
        UIController.showNotification(<Text id="Header.DaemonNotLoaded" />);
      }
    },
  };

  viewBackups = {
    label: 'View Backups',
    click: () => {
      let BackupDir = process.env.HOME + '/NexusBackups';
      if (process.platform === 'win32') {
        BackupDir = process.env.USERPROFILE + '/NexusBackups';
        BackupDir = BackupDir.replace(/\\/g, '/');
      }
      let backupDirExists = fs.existsSync(BackupDir);
      if (!backupDirExists) {
        fs.mkdirSync(BackupDir);
      }
      shell.openItem(BackupDir);
    },
  };

  cut = {
    label: 'Cut',
    accelerator: 'CmdOrCtrl+X',
    role: 'cut',
  };

  copy = {
    label: 'Copy',
    accelerator: 'CmdOrCtrl+C',
    role: 'copy',
  };

  paste = {
    label: 'Paste',
    accelerator: 'CmdOrCtrl+V',
    role: 'paste',
  };

  coreSettings = {
    label: 'Core',
    click: () => {
      this.history.push('/Settings/Core');
    },
  };

  appSettings = {
    label: 'Application',
    click: () => {
      this.history.push('/Settings/App');
    },
  };

  keyManagement = {
    label: 'Key Management',
    click: () => {
      this.history.push('/Settings/Security');
    },
  };

  styleSettings = {
    label: 'Style',
    click: () => {
      this.history.push('/Settings/Style');
    },
  };

  downloadRecent = {
    label: 'Download Recent Database',
    click: async () => {
      const enoughSpace = await checkFreeSpace();
      if (!enoughSpace) {
        UIController.openErrorDialog({
          message: <Text id="ToolTip.NotEnoughSpace" />,
        });
        return;
      }

      const state = this.store.getState();
      if (state.settings.manualDaemon) {
        UIController.showNotification(
          'Cannot bootstrap recent database in manual mode',
          'error'
        );
        return;
      }

      if (state.overview.connections === undefined) {
        UIController.showNotification('Please wait for the daemon to start.');
        return;
      }

      this.store.dispatch(bootstrap());
    },
  };

  toggleFullScreen = {
    label: 'Toggle FullScreen',
    accelerator: 'F11',
    click: () => {
      remote
        .getCurrentWindow()
        .setFullScreen(!remote.getCurrentWindow().isFullScreen());
    },
  };

  toggleDevTools = {
    label: 'Toggle Developer Tools',
    accelerator: 'Alt+CmdOrCtrl+I',
    click: () => {
      remote.getCurrentWindow().toggleDevTools();
    },
  };

  websiteLink = {
    label: 'Nexus Earth Website',
    click: () => {
      shell.openExternal('http://nexusearth.com');
    },
  };

  gitRepoLink = {
    label: 'Nexus Git Repository',
    click: () => {
      shell.openExternal('http://github.com/Nexusoft');
    },
  };

  updaterIdle = {
    label: 'Check for Updates...',
    enabled: true,
    click: async () => {
      const result = await autoUpdater.checkForUpdates();
      // Not sure if this is the best way to check if there's an update
      // available because autoUpdater.checkForUpdates() doesn't return
      // any reliable results like a boolean `updateAvailable` property
      if (result.updateInfo.version === APP_VERSION) {
        UIController.showNotification(
          'There are currently no updates available'
        );
      }
    },
  };

  updaterChecking = {
    label: 'Checking for Updates...',
    enabled: false,
  };

  updaterDownloading = {
    label: 'Update available! Downloading...',
    enabled: false,
  };

  updaterReadyToInstall = {
    label: 'Quit and install update...',
    enabled: true,
    click: autoUpdater.quitAndInstall,
  };

  updaterMenuItem = () => {
    switch (updater.state) {
      case 'idle':
        return this.updaterIdle;
      case 'checking':
        return this.updaterChecking;
      case 'downloading':
        return this.updaterDownloading;
      case 'downloaded':
        return this.updaterReadyToInstall;
    }
  };

  buildDarwinTemplate = () => {
    const subMenuAbout = {
      label: 'Nexus',
      submenu: [
        this.about,
        this.startDaemon,
        this.stopDaemon,
        this.separator,
        this.quitNexus,
      ],
    };
    const subMenuFile = {
      label: 'File',
      submenu: [this.backupWallet, this.viewBackups],
    };
    const subMenuEdit = {
      label: 'Edit',
      submenu: [this.cut, this.copy, this.paste],
    };
    const subMenuView = {
      label: 'Settings',
      submenu: [
        this.coreSettings,
        this.appSettings,
        this.keyManagement,
        this.styleSettings,
        this.separator,
        this.downloadRecent,
        //TODO: take this out before 1.0
      ],
    };

    const subMenuWindow = {
      label: 'View',
      submenu: [this.toggleFullScreen],
    };
    const state = this.store.getState();
    if (process.env.NODE_ENV === 'development' || state.settings.devMode) {
      subMenuWindow.submenu.push(this.toggleDevTools);
    }

    const subMenuHelp = {
      label: 'Help',
      submenu: [
        this.websiteLink,
        this.gitRepoLink,
        this.separator,
        this.updaterMenuItem(),
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
  };

  buildDefaultTemplate = () => {
    const subMenuFile = {
      label: '&File',
      submenu: [
        this.backupWallet,
        this.viewBackups,
        this.separator,
        this.startDaemon,
        this.stopDaemon,
        this.separator,
        this.quitNexus,
      ],
    };
    const subMenuSettings = {
      label: 'Settings',
      submenu: [
        this.coreSettings,
        this.appSettings,
        this.keyManagement,
        this.styleSettings,
        this.separator,
        this.downloadRecent,
      ],
    };
    const subMenuView = {
      label: '&View',
      submenu: [this.toggleFullScreen],
    };
    const state = this.store.getState();
    if (process.env.NODE_ENV === 'development' || state.settings.devMode) {
      subMenuView.submenu.push(this.separator, this.toggleDevTools);
    }

    const subMenuHelp = {
      label: 'Help',
      submenu: [
        this.about,
        this.websiteLink,
        this.gitRepoLink,
        this.separator,
        this.updaterMenuItem(),
      ],
    };

    return [subMenuFile, subMenuSettings, subMenuView, subMenuHelp];
  };

  build = () => {
    let template;

    if (process.platform === 'darwin') {
      template = this.buildDarwinTemplate();
    } else {
      template = this.buildDefaultTemplate();
    }

    const menu = remote.Menu.buildFromTemplate(template);
    remote.Menu.setApplicationMenu(menu);
    return menu;
  };
}

export default new AppMenu();
