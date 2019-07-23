// External
import React from 'react';
import { shell, remote } from 'electron';
import fs from 'fs';

// Internal
import store, { observeStore, history } from 'store';
import { toggleWebViewDevTools } from 'actions/webview';
import { updateSettings } from 'actions/settings';
import { startCore as startCoreAC, stopCore as stopCoreAC } from 'actions/core';
import { backupWallet as backup } from 'lib/wallet';
import { showNotification, openErrorDialog } from 'actions/overlays';
import { bootstrap } from 'actions/bootstrap';
import showOpenDialog from 'utils/promisified/showOpenDialog';
import { checkForUpdates, quitAndInstall } from 'lib/updater';

const separator = {
  type: 'separator',
};

const startCore = {
  label: 'Start Nexus Core',
  click: () => {
    store.dispatch(startCoreAC());
  },
};

const stopCore = {
  label: 'Stop Nexus Core',
  click: () => {
    store.dispatch(stopCoreAC());
  },
};

const quitNexus = {
  label: 'Quit Nexus',
  accelerator: 'CmdOrCtrl+Q',
  click: () => {
    remote.app.quit();
  },
};

const about = {
  label: 'About',
  click: () => {
    history.push('/About');
  },
};

const backupWallet = {
  label: 'Backup Wallet',
  click: async () => {
    const state = store.getState();
    const folderPaths = await showOpenDialog({
      title: 'Select a folder',
      defaultPath: state.settings.backupDirectory,
      properties: ['openDirectory'],
    });

    if (state.core.info.connections === undefined) {
      store.dispatch(showNotification(_('Nexus Core is not connected')));
      return;
    }

    if (folderPaths && folderPaths.length > 0) {
      store.dispatch(updateSettings({ backupDirectory: folderPaths[0] }));

      await backup(folderPaths[0]);
      store.dispatch(
        showNotification(_('Wallet backed up'), 'success')
      );
    }
  },
};

const viewBackups = {
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

const cut = {
  label: 'Cut',
  accelerator: 'CmdOrCtrl+X',
  role: 'cut',
};

const copy = {
  label: 'Copy',
  accelerator: 'CmdOrCtrl+C',
  role: 'copy',
};

const paste = {
  label: 'Paste',
  accelerator: 'CmdOrCtrl+V',
  role: 'paste',
};

const coreSettings = {
  label: 'Core',
  click: () => {
    history.push('/Settings/Core');
  },
};

const appSettings = {
  label: 'Application',
  click: () => {
    history.push('/Settings/App');
  },
};

const keyManagement = {
  label: 'Key Management',
  click: () => {
    history.push('/Settings/Security');
  },
};

const styleSettings = {
  label: 'Style',
  click: () => {
    history.push('/Settings/Style');
  },
};

const downloadRecent = {
  label: 'Download Recent Database',
  click: () => {
    const state = store.getState();
    if (state.settings.manualDaemon) {
      store.dispatch(
        showNotification(
          'Cannot bootstrap recent database in manual mode',
          'error'
        )
      );
      return;
    }

    if (state.core.info.connections === undefined) {
      store.dispatch(showNotification('Please wait for Nexus Core to start.'));
      return;
    }

    store.dispatch(bootstrap());
  },
};

const toggleFullScreen = {
  label: 'Toggle FullScreen',
  accelerator: 'F11',
  click: () => {
    remote
      .getCurrentWindow()
      .setFullScreen(!remote.getCurrentWindow().isFullScreen());
  },
};

const toggleDevTools = {
  label: 'Toggle Developer Tools',
  accelerator: 'Alt+CmdOrCtrl+I',
  click: () => {
    remote.getCurrentWindow().toggleDevTools();
  },
};

const toggleModuleDevTools = {
  label: "Toggle Module's Developer Tools",
  click: () => {
    store.dispatch(toggleWebViewDevTools());
  },
};

const websiteLink = {
  label: 'Nexus Website',
  click: () => {
    shell.openExternal('http://nexusearth.com');
  },
};

const gitRepoLink = {
  label: 'Nexus Git Repository',
  click: () => {
    shell.openExternal('http://github.com/Nexusoft');
  },
};

const walletGuideLink = {
  label: 'Nexus Wallet Guide',
  click: () => {
    shell.openExternal('https://nexusearth.com/nexus-tritium-wallet-guide/');
  },
};

const updaterIdle = {
  label: 'Check for Updates...',
  enabled: true,
  click: async () => {
    const result = await checkForUpdates();
    // Not sure if this is the best way to check if there's an update
    // available because autoUpdater.checkForUpdates() doesn't return
    // any reliable results like a boolean `updateAvailable` property
    if (result.updateInfo.version === APP_VERSION) {
      store.dispatch(
        showNotification('There are currently no updates available')
      );
    }
  },
};

const updaterChecking = {
  label: 'Checking for Updates...',
  enabled: false,
};

const updaterDownloading = {
  label: 'Update available! Downloading...',
  enabled: false,
};

const updaterReadyToInstall = {
  label: 'Quit and install update...',
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
  const coreRunning = state.core.info.connections !== undefined;
  const { manualDaemon } = state.settings;
  const { webview } = state;

  const subMenuAbout = {
    label: 'Nexus',
    submenu: [
      about,
      /* may insert Start/Stop Core here */ separator,
      quitNexus,
    ],
  };
  // If it's in manual core mode and core is not running, don't show
  // Start Core option because it does nothing
  if (!manualDaemon || coreRunning) {
    subMenuAbout.submenu.splice(1, 0, coreRunning ? stopCore : startCore);
  }

  const subMenuFile = {
    label: 'File',
    submenu: [backupWallet, viewBackups, separator, downloadRecent],
  };
  const subMenuEdit = {
    label: 'Edit',
    submenu: [cut, copy, paste],
  };
  const subMenuView = {
    label: 'Settings',
    submenu: [
      appSettings,
      coreSettings,
      keyManagement,
      styleSettings,
      //TODO: take this out before 1.0
    ],
  };

  const subMenuWindow = {
    label: 'View',
    submenu: [toggleFullScreen],
  };
  if (process.env.NODE_ENV === 'development' || state.settings.devMode) {
    subMenuWindow.submenu.push(toggleDevTools);

    if (webview) {
      subMenuWindow.submenu.push(toggleModuleDevTools);
    }
  }

  const subMenuHelp = {
    label: 'Help',
    submenu: [
      websiteLink,
      gitRepoLink,
      walletGuideLink,
      // separator,
      // Disable checking for updates on Mac until we have the developer key
      // updaterMenuItem(),
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
  const coreRunning = state.core.info.connections !== undefined;
  const { manualDaemon } = state.settings;
  const { webview } = state;

  const subMenuFile = {
    label: '&File',
    submenu: [
      backupWallet,
      viewBackups,
      separator,
      downloadRecent,
      separator,
      /* may insert Start/Stop Core here */
      separator,
      quitNexus,
    ],
  };
  // If it's in manual core mode and core is not running, don't show
  // Start Core option because it does nothing
  if (!manualDaemon || coreRunning) {
    subMenuFile.submenu.splice(5, 0, coreRunning ? stopCore : startCore);
  }

  const subMenuSettings = {
    label: 'Settings',
    submenu: [appSettings, coreSettings, keyManagement, styleSettings],
  };
  const subMenuView = {
    label: '&View',
    submenu: [toggleFullScreen],
  };
  if (process.env.NODE_ENV === 'development' || state.settings.devMode) {
    subMenuView.submenu.push(separator, toggleDevTools);

    if (webview) {
      subMenuView.submenu.push(toggleModuleDevTools);
    }
  }

  const subMenuHelp = {
    label: 'Help',
    submenu: [
      about,
      websiteLink,
      gitRepoLink,
      walletGuideLink,
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
export function initializeMenu() {
  buildMenu();
  observeStore(state => state.updater.state, rebuildMenu);
  observeStore(
    state => state.core && state.core.info && state.core.info.connections,
    rebuildMenu
  );
  observeStore(state => state.settings && state.settings.devMode, rebuildMenu);
  observeStore(state => state.webview, rebuildMenu);
  observeStore(state => state.settings.manualDaemon, rebuildMenu);
}
