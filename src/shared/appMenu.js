// External
import React from 'react';
import { shell, remote } from 'electron';
import fs from 'fs';

// Internal
import store, { history } from 'store';
import { isWebViewActive, toggleWebViewDevTools } from 'api/modules';
import * as RPC from 'scripts/rpc';
import { updateSettings } from 'actions/settingsActionCreators';
import { backupWallet } from 'api/wallet';
import Text from 'components/Text';
import UIController from 'components/UIController';
import { clearCoreInfo } from 'actions/coreActionCreators';
import bootstrap, { checkBootStrapFreeSpace } from 'actions/bootstrap';
import updater from 'updater';

const autoUpdater = remote.getGlobal('autoUpdater');

/**
 * Sets up the Top Menu for the App
 *
 * @class AppMenu
 */
class AppMenu {
  /**
   * Initialize the App Menu
   *
   * @memberof AppMenu
   */
  initialize() {
    // Update the updater menu item when the updater state changes
    // Changing menu item labels directly has no effect so we have to rebuild the whole menu
    updater.on('state-change', this.build);
  }

  separator = {
    type: 'separator',
  };

  startDaemon = {
    label: 'Start Daemon',
    click: () => {
      remote
        .getGlobal('core')
        .start()
        .then(payload => {
          console.log(payload);
        });
    },
  };

  stopDaemon = {
    label: 'Stop Daemon',
    click: () => {
      const state = store.getState();
      if (state.settings.manualDaemon) {
        RPC.PROMISE('stop', []).then(() => {
          store.dispatch(clearCoreInfo());
        });
      } else {
        remote
          .getGlobal('core')
          .stop()
          .then(payload => {
            store.dispatch(clearCoreInfo());
            console.log(payload);
          });
      }
    },
  };

  quitNexus = {
    label: 'Quit Nexus',
    accelerator: 'CmdOrCtrl+Q',
    click: () => {
      store.dispatch(clearCoreInfo());
      UIController.showNotification('Closing Nexus');
      remote.getCurrentWindow().close();
    },
  };

  about = {
    label: 'About',
    click: () => {
      history.push('/About');
    },
  };

  backupWallet = {
    label: 'Backup Wallet',
    click: () => {
      const state = store.getState();
      if (state.core.info.connections) {
        remote.dialog.showOpenDialog(
          {
            title: 'Select a folder',
            defaultPath: state.settings.backupDirectory,
            properties: ['openDirectory'],
          },
          async folderPaths => {
            if (folderPaths && folderPaths.length > 0) {
              store.dispatch(
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
      history.push('/Settings/Core');
    },
  };

  appSettings = {
    label: 'Application',
    click: () => {
      history.push('/Settings/App');
    },
  };

  keyManagement = {
    label: 'Key Management',
    click: () => {
      history.push('/Settings/Security');
    },
  };

  styleSettings = {
    label: 'Style',
    click: () => {
      history.push('/Settings/Style');
    },
  };

  downloadRecent = {
    label: 'Download Recent Database',
    click: async () => {
      const enoughSpace = await checkBootStrapFreeSpace();
      if (!enoughSpace) {
        console.log('in Menu');
        UIController.openErrorDialog({
          message: <Text id="ToolTip.NotEnoughSpace" />,
        });
        return;
      }

      const state = store.getState();
      if (state.settings.manualDaemon) {
        UIController.showNotification(
          'Cannot bootstrap recent database in manual mode',
          'error'
        );
        return;
      }

      if (state.core.info.connections === undefined) {
        UIController.showNotification('Please wait for the daemon to start.');
        return;
      }

      store.dispatch(bootstrap());
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

  toggleModuleDevTools = {
    label: "Toggle Module's Developer Tools",
    click: () => {
      toggleWebViewDevTools();
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

  /**
   * Get the Updater
   *
   * @memberof AppMenu
   */
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

  /**
   * Activate if Module is open
   *
   * @memberof AppMenu
   */
  setPageModuleActive = active => {
    if (this.pageModuleActive !== active) {
      this.pageModuleActive = active;
      this.build();
    }
  };

  /**
   * Build Menu for OSX
   *
   * @memberof AppMenu
   */
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
      submenu: [
        this.backupWallet,
        this.viewBackups,
        this.separator,
        this.downloadRecent,
      ],
    };
    const subMenuEdit = {
      label: 'Edit',
      submenu: [this.cut, this.copy, this.paste],
    };
    const subMenuView = {
      label: 'Settings',
      submenu: [
        this.appSettings,
        this.coreSettings,
        this.keyManagement,
        this.styleSettings,
        //TODO: take this out before 1.0
      ],
    };

    const subMenuWindow = {
      label: 'View',
      submenu: [this.toggleFullScreen],
    };
    const state = store.getState();
    if (process.env.NODE_ENV === 'development' || state.settings.devMode) {
      subMenuWindow.submenu.push(this.toggleDevTools);

      if (isWebViewActive()) {
        subMenuWindow.submenu.push(this.toggleModuleDevTools);
      }
    }

    const subMenuHelp = {
      label: 'Help',
      submenu: [
        this.websiteLink,
        this.gitRepoLink,
        // this.separator,
        // Disable checking for updates on Mac until we have the developer key
        // this.updaterMenuItem(),
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

  /**
   * Build Menu to Windows / Linux
   *
   * @memberof AppMenu
   */
  buildDefaultTemplate = () => {
    const subMenuFile = {
      label: '&File',
      submenu: [
        this.backupWallet,
        this.viewBackups,
        this.separator,
        this.downloadRecent,
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
        this.appSettings,
        this.coreSettings,
        this.keyManagement,
        this.styleSettings,
      ],
    };
    const subMenuView = {
      label: '&View',
      submenu: [this.toggleFullScreen],
    };
    const state = store.getState();
    if (process.env.NODE_ENV === 'development' || state.settings.devMode) {
      subMenuView.submenu.push(this.separator, this.toggleDevTools);

      if (isWebViewActive()) {
        subMenuView.submenu.push(this.toggleModuleDevTools);
      }
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

  /**
   * Build the menu
   *
   * @memberof AppMenu
   */
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
