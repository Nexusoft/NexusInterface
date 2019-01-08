// External
import { shell, remote } from 'electron';
import fs from 'fs';

// Internal
import * as RPC from 'scripts/rpc';
import { GetSettings } from 'api/settings';
import core from 'api/core';
import Text from 'components/Text';
import UIController from 'components/UIController';
import * as ac from 'actions/setupAppActionCreators';
import bootstrap, { checkFreeSpace } from './bootstrap';

export default class MenuBuilder {
  constructor(store, history) {
    this.store = store;
    this.history = history;
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
          this.store.dispatch(ac.clearOverviewVariables());
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
        // BackupDir = app.getPath('documents') + '/NexusBackups';
        BackupDir = process.env.USERPROFILE + '/NexusBackups';
        BackupDir = BackupDir.replace(/\\/g, '/');
      }
      const state = this.store.getState();
      if (state.settings.settings.Folder !== BackupDir) {
        BackupDir = state.settings.settings.Folder;
      }
      let ifBackupDirExists = fs.existsSync(BackupDir);
      if (!ifBackupDirExists) {
        fs.mkdirSync(BackupDir);
      }
      RPC.PROMISE('backupwallet', [
        BackupDir + '/NexusBackup_' + now + '.dat',
      ]).then(() => {
        UIController.showNotification('Wallet Backed Up');
      });
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
      const state = this.store.getState();
      if (state.common.unlocked_until !== undefined) {
        this.history.push('/Settings/Security');
      } else {
        this.history.push('/Settings/Unencrypted');
      }
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
      if (state.settings.settings.manualDaemon) {
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

      bootstrap(this.store);
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

  buildDarwinTemplate() {
    const subMenuAbout = {
      label: 'Nexus',
      submenu: [
        this.startDaemon,
        this.stopDaemon,
        this.separator,
        this.quitNexus,
        this.about,
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
    if (
      process.env.NODE_ENV === 'development' ||
      state.settings.settings.devMode
    ) {
      subMenuWindow.submenu.push(this.toggleDevTools);
    }

    const subMenuHelp = {
      label: 'Help',
      submenu: [this.websiteLink, this.gitRepoLink],
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

  buildDefaultTemplate() {
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
    if (
      process.env.NODE_ENV === 'development' ||
      state.settings.settings.devMode
    ) {
      subMenuView.submenu.push(this.separator, this.toggleDevTools);
    }

    const subMenuHelp = {
      label: 'Help',
      submenu: [this.about, this.websiteLink, this.gitRepoLink],
    };

    return [subMenuFile, subMenuSettings, subMenuView, subMenuHelp];
  }

  buildMenu() {
    let template;

    if (process.platform === 'darwin') {
      template = this.buildDarwinTemplate();
    } else {
      template = this.buildDefaultTemplate();
    }

    const menu = remote.Menu.buildFromTemplate(template);
    remote.Menu.setApplicationMenu(menu);

    return menu;
  }
}
