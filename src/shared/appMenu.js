// External
import { shell, remote } from 'electron';
import fs from 'fs';

// Internal
import store, { observeStore } from 'store';
import { toggleWebViewDevTools } from 'lib/modules';
import { updateSettings } from 'lib/settings';
import { startCore, stopCore } from 'lib/core';
import { backupWallet as backup, history } from 'lib/wallet';
import { showNotification, openModal } from 'lib/ui';
import { bootstrap } from 'lib/bootstrap';
import { isCoreConnected } from 'selectors';
import { legacyMode } from 'consts/misc';
import showOpenDialog from 'utils/promisified/showOpenDialog';
import confirm from 'utils/promisified/confirm';
import { returnCoreDataDir, walletDataDir } from 'consts/paths';
import { checkForUpdates, quitAndInstall } from 'lib/updater';
import { tritiumUpgradeTime } from 'consts/misc';
import { walletEvents } from 'lib/wallet';
import AboutModal from 'components/AboutModal';

const separator = {
  type: 'separator',
};

const switchLegacyMode = {
  label: __('Switch to Legacy Mode'),
  click: async () => {
    const confirmed = await confirm({
      question: __('Are you sure you want to switch to Legacy Mode?'),
      skinYes: 'danger',
    });
    if (confirmed) {
      updateSettings({ legacyMode: true });
      location.reload();
    }
  },
};

const switchTritiumMode = {
  label: __('Switch to Tritium Mode'),
  click: () => {
    updateSettings({ legacyMode: false });
    location.reload();
  },
};

const startCoreMenu = {
  label: __('Start Nexus Core'),
  click: startCore,
};

const stopCoreMenu = {
  label: __('Stop Nexus Core'),
  click: stopCore,
};

const quitNexus = {
  label: __('Quit Nexus'),
  accelerator: 'CmdOrCtrl+Q',
  click: () => {
    remote.app.quit();
  },
};

const about = {
  label: __('About'),
  click: () => {
    openModal(AboutModal);
  },
};

const backupWallet = {
  label: __('Backup Wallet'),
  click: async () => {
    const state = store.getState();
    const folderPaths = await showOpenDialog({
      title: 'Select a folder',
      defaultPath: state.settings.backupDirectory,
      properties: ['openDirectory'],
    });

    if (!isCoreConnected(state)) {
      showNotification(__('Nexus Core is not connected'));
      return;
    }

    if (folderPaths && folderPaths.length > 0) {
      updateSettings({ backupDirectory: folderPaths[0] });

      await backup(folderPaths[0]);
      showNotification(__('Wallet backed up'), 'success');
    }
  },
};

const viewBackups = {
  label: __('View Backups'),
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

const cut = {
  label: __('Cut'),
  accelerator: 'CmdOrCtrl+X',
  role: 'cut',
};

const copy = {
  label: __('Copy'),
  accelerator: 'CmdOrCtrl+C',
  role: 'copy',
};

const paste = {
  label: __('Paste'),
  accelerator: 'CmdOrCtrl+V',
  role: 'paste',
};

const coreSettings = {
  label: __('Core'),
  click: () => {
    history.push('/Settings/Core');
  },
};

const appSettings = {
  label: __('Application'),
  click: () => {
    history.push('/Settings/App');
  },
};

const keyManagement = {
  label: __('Key Management'),
  click: () => {
    history.push('/Settings/Security');
  },
};

const styleSettings = {
  label: __('Style'),
  click: () => {
    history.push('/Settings/Style');
  },
};

const moduleSettings = {
  label: __('Modules'),
  click: () => {
    history.push('/Settings/Modules');
  },
};

const downloadRecent = {
  label: __('Download Recent Database'),
  click: () => {
    const state = store.getState();
    if (state.settings.manualDaemon) {
      showNotification(
        __('Cannot bootstrap recent database in manual mode'),
        'error'
      );
      return;
    }

    if (!isCoreConnected(state)) {
      showNotification(__('Please wait for Nexus Core to start.'));
      return;
    }

    bootstrap();
  },
};

const toggleFullScreen = {
  label: __('Toggle FullScreen'),
  accelerator: 'F11',
  click: () => {
    remote
      .getCurrentWindow()
      .setFullScreen(!remote.getCurrentWindow().isFullScreen());
  },
};

const toggleDevTools = {
  label: __('Toggle Developer Tools'),
  accelerator: 'Alt+CmdOrCtrl+I',
  click: () => {
    remote.getCurrentWindow().toggleDevTools();
  },
};

const toggleModuleDevTools = {
  label: __("Toggle Module's Developer Tools"),
  click: () => {
    store.dispatch(toggleWebViewDevTools());
  },
};

const websiteLink = {
  label: __('Nexus Website'),
  click: () => {
    shell.openExternal('http://nexusearth.com');
  },
};

const gitRepoLink = {
  label: __('Nexus Git Repository'),
  click: () => {
    shell.openExternal('http://github.com/Nexusoft');
  },
};

const walletGuideLink = {
  label: __('Nexus Wallet Guide'),
  click: () => {
    shell.openExternal('https://nexusearth.com/nexus-tritium-wallet-guide/');
  },
};

const openCoreDataDir = {
  label: __('Open Core Data Folder'),
  click: () => {
    shell.openItem(returnCoreDataDir());
  },
};

const openInterfaceDataDir = {
  label: __('Open Interface Data Folder'),
  click: () => {
    shell.openItem(walletDataDir);
  },
};
const updaterIdle = {
  label: __('Check for Updates...'),
  enabled: true,
  click: async () => {
    const result = await checkForUpdates();
    // Not sure if this is the best way to check if there's an update
    // available because autoUpdater.checkForUpdates() doesn't return
    // any reliable results like a boolean `updateAvailable` property
    if (result.updateInfo.version === APP_VERSION) {
      showNotification(__('There are currently no updates available'));
    }
  },
};

const updaterChecking = {
  label: __('Checking for Updates...'),
  enabled: false,
};

const updaterDownloading = {
  label: __('Update available! Downloading...'),
  enabled: false,
};

const updaterReadyToInstall = {
  label: __('Quit and install update...'),
  enabled: true,
  click: quitAndInstall,
};

/**
 * Get the Updater
 *
 * @memberof AppMenu
 */
function updaterMenuItem() {
  const updaterState = store.getState().updater.state;
  switch (updaterState) {
    case 'idle':
      return updaterIdle;
    case 'checking':
      return updaterChecking;
    case 'downloading':
      return updaterDownloading;
    case 'downloaded':
      return updaterReadyToInstall;
  }
}

/**
 * Activate if Module is open
 *
 * @memberof AppMenu
 */
// const setPageModuleActive = active => {
//   if (pageModuleActive !== active) {
//     pageModuleActive = active;
//     build();
//   }
// };

/**
 * Build Menu for OSX
 *
 * @memberof AppMenu
 */
function buildDarwinTemplate() {
  const state = store.getState();
  const coreConnected = isCoreConnected(state);
  const { manualDaemon } = state.settings;
  const { activeAppModule } = state;
  const now = Date.now();

  const subMenuAbout = {
    label: 'Nexus',
    submenu: [
      about,
      // If it's in manual core mode and core is not running, don't show
      // Start Core option because it does nothing
      !manualDaemon || coreConnected
        ? coreConnected
          ? stopCoreMenu
          : startCoreMenu
        : null,
      now < tritiumUpgradeTime
        ? null
        : legacyMode
        ? switchTritiumMode
        : switchLegacyMode,
      separator,
      quitNexus,
    ].filter(e => e),
  };

  //TODO: darwin does not like null here , so I replaced it with separator which will colapse into nothing. But rework this for next build.
  const subMenuFile = {
    label: __('File'),
    submenu: [
      legacyMode ? backupWallet : separator,
      legacyMode ? viewBackups : separator,
      separator,
      downloadRecent,
    ],
  };
  const subMenuEdit = {
    label: __('Edit'),
    submenu: [cut, copy, paste],
  };
  const subMenuView = {
    label: __('Settings'),
    submenu: [
      appSettings,
      coreSettings,
      legacyMode ? keyManagement : null,
      styleSettings,
      moduleSettings,
    ].filter(e => e),
  };

  const subMenuWindow = {
    label: __('View'),
    submenu: [toggleFullScreen],
  };
  if (process.env.NODE_ENV === 'development' || state.settings.devMode) {
    subMenuWindow.submenu.push(toggleDevTools);

    if (activeAppModule) {
      subMenuWindow.submenu.push(toggleModuleDevTools);
    }
  }

  const subMenuHelp = {
    label: __('Help'),
    submenu: [
      websiteLink,
      gitRepoLink,
      walletGuideLink,
      openCoreDataDir,
      openInterfaceDataDir,
      separator,
      updaterMenuItem(),
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

/**
 * Build Menu to Windows / Linux
 *
 * @memberof AppMenu
 */
function buildDefaultTemplate() {
  const state = store.getState();
  const coreConnected = isCoreConnected(state);
  const { manualDaemon } = state.settings;
  const { activeAppModule } = state;
  const now = Date.now();

  const subMenuFile = {
    label: __('File'),
    submenu: [
      legacyMode ? backupWallet : null,
      legacyMode ? viewBackups : null,
      separator,
      downloadRecent,
      separator,
      // If it's in manual core mode and core is not running, don't show
      // Start Core option because it does nothing
      !manualDaemon || coreConnected
        ? coreConnected
          ? stopCoreMenu
          : startCoreMenu
        : null,
      now < tritiumUpgradeTime
        ? null
        : legacyMode
        ? switchTritiumMode
        : switchLegacyMode,
      separator,
      quitNexus,
    ].filter(e => e),
  };

  const subMenuSettings = {
    label: __('Settings'),
    submenu: [
      appSettings,
      coreSettings,
      legacyMode ? keyManagement : null,
      styleSettings,
      moduleSettings,
    ].filter(e => e),
  };
  const subMenuView = {
    label: __('View'),
    submenu: [toggleFullScreen],
  };
  if (process.env.NODE_ENV === 'development' || state.settings.devMode) {
    subMenuView.submenu.push(separator, toggleDevTools);

    if (activeAppModule) {
      subMenuView.submenu.push(toggleModuleDevTools);
    }
  }

  const subMenuHelp = {
    label: __('Help'),
    submenu: [
      about,
      separator,
      websiteLink,
      gitRepoLink,
      walletGuideLink,
      openCoreDataDir,
      openInterfaceDataDir,
      separator,
      updaterMenuItem(),
    ],
  };

  return [subMenuFile, subMenuSettings, subMenuView, subMenuHelp];
}

/**
 * Build the menu
 *
 * @memberof AppMenu
 */
function buildMenu() {
  let template;

  if (process.platform === 'darwin') {
    template = buildDarwinTemplate();
  } else {
    template = buildDefaultTemplate();
  }

  const menu = remote.Menu.buildFromTemplate(template);
  remote.Menu.setApplicationMenu(menu);
  return menu;
}

let rebuildTimerId = null;

/**
 * Rebuild the menu asynchronously so that if multiple rebuild requests come
 * at the same time, it only rebuilds once
 *
 */
function rebuildMenu() {
  clearTimeout(rebuildTimerId);
  rebuildTimerId = setTimeout(buildMenu, 0);
}

// Update the updater menu item when the updater state changes
// Changing menu item labels directly has no effect so we have to rebuild the whole menu
walletEvents.once('post-render', function() {
  buildMenu();
  observeStore(state => state.updater.state, rebuildMenu);
  observeStore(isCoreConnected, rebuildMenu);
  observeStore(state => state.settings && state.settings.devMode, rebuildMenu);
  observeStore(state => state.activeAppModule, rebuildMenu);
  observeStore(state => state.settings.manualDaemon, rebuildMenu);

  const now = Date.now();
  if (now < tritiumUpgradeTime) {
    setTimeout(() => {
      rebuildMenu();
    }, tritiumUpgradeTime - now);
  }
});
