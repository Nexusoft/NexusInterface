// External
import { shell, ipcRenderer } from 'electron';
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
import confirm from 'utils/promisified/confirm';
import { walletDataDir } from 'consts/paths';
import { checkForUpdates, quitAndInstall } from 'lib/updater';
import { walletEvents } from 'lib/wallet';
import AboutModal from 'components/AboutModal';

// Because functions can't be passed through IPC messages so we have
// to preprocess menu template so that click handlers function properly
const preprocess = menuItems => {
  Object.entries(menuItems).forEach(([id, item]) => {
    // Only add id if menu item has a click handler
    if (item.click) {
      item.id = id;
      const handleClick = item.click;
      ipcRenderer.on('menu-click:' + id, (event, ...args) => {
        handleClick(...args);
      });
      item.click = true;
    }
  });
  return menuItems;
};

const menuItems = preprocess({
  separator: {
    type: 'separator',
  },
  switchLegacyMode: {
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
  },
  switchTritiumMode: {
    label: __('Switch to Tritium Mode'),
    click: () => {
      updateSettings({ legacyMode: false });
      location.reload();
    },
  },
  startCoreMenu: {
    label: __('Start Nexus Core'),
    click: startCore,
  },
  stopCoreMenu: {
    label: __('Stop Nexus Core'),
    click: stopCore,
  },
  quitNexus: {
    label: __('Quit Nexus'),
    accelerator: 'CmdOrCtrl+Q',
    click: () => {
      ipcRenderer.invoke('quit-app');
    },
  },
  about: {
    label: __('About'),
    click: () => {
      openModal(AboutModal);
    },
  },
  backupWallet: {
    label: __('Backup Wallet'),
    click: async () => {
      const state = store.getState();
      const folderPaths = await ipcRenderer.invoke('show-open-dialog', {
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
  },
  viewBackups: {
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
  },
  cut: {
    label: __('Cut'),
    accelerator: 'CmdOrCtrl+X',
    role: 'cut',
  },
  copy: {
    label: __('Copy'),
    accelerator: 'CmdOrCtrl+C',
    role: 'copy',
  },
  paste: {
    label: __('Paste'),
    accelerator: 'CmdOrCtrl+V',
    role: 'paste',
  },
  coreSettings: {
    label: __('Core'),
    click: () => {
      history.push('/Settings/Core');
    },
  },
  appSettings: {
    label: __('Application'),
    click: () => {
      history.push('/Settings/App');
    },
  },
  keyManagement: {
    label: __('Key Management'),
    click: () => {
      history.push('/Settings/Security');
    },
  },
  styleSettings: {
    label: __('Style'),
    click: () => {
      history.push('/Settings/Style');
    },
  },
  moduleSettings: {
    label: __('Modules'),
    click: () => {
      history.push('/Settings/Modules');
    },
  },
  downloadRecent: {
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
  },
  toggleFullScreen: {
    label: __('Toggle FullScreen'),
    accelerator: 'F11',
    role: 'togglefullscreen',
  },
  toggleDevTools: {
    label: __('Toggle Developer Tools'),
    accelerator: 'Alt+CmdOrCtrl+I',
    role: 'toggleDevTools',
  },
  toggleModuleDevTools: {
    label: __("Toggle Module's Developer Tools"),
    click: () => {
      store.dispatch(toggleWebViewDevTools());
    },
  },
  websiteLink: {
    label: __('Nexus Website'),
    click: () => {
      shell.openExternal('http://nexusearth.com');
    },
  },
  gitRepoLink: {
    label: __('Nexus Git Repository'),
    click: () => {
      shell.openExternal('http://github.com/Nexusoft');
    },
  },
  walletGuideLink: {
    label: __('Nexus Wallet Guide'),
    click: () => {
      shell.openExternal('https://nexusearth.com/nexus-tritium-wallet-guide/');
    },
  },
  openCoreDataDir: {
    label: __('Open Core Data Folder'),
    click: () => {
      const state = store.getState();
      shell.openItem(state.settings.coreDataDir);
    },
  },
  openInterfaceDataDir: {
    label: __('Open Interface Data Folder'),
    click: () => {
      shell.openItem(walletDataDir);
    },
  },
  updaterIdle: {
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
  },
  updaterChecking: {
    label: __('Checking for Updates...'),
    enabled: false,
  },
  updaterDownloading: {
    label: __('Update available! Downloading...'),
    enabled: false,
  },
  updaterReadyToInstall: {
    label: __('Quit and install update...'),
    enabled: true,
    click: quitAndInstall,
  },
});

/**
 * Get the Updater
 *
 * @memberof AppMenu
 */
function buildUpdaterMenu() {
  const updaterState = store.getState().updater.state;
  switch (updaterState) {
    case 'idle':
      return menuItems.updaterIdle;
    case 'checking':
      return menuItems.updaterChecking;
    case 'downloading':
      return menuItems.updaterDownloading;
    case 'downloaded':
      return menuItems.updaterReadyToInstall;
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

  const subMenuAbout = {
    label: 'Nexus',
    submenu: [
      menuItems.about,
      // If it's in manual core mode and core is not running, don't show
      // Start Core option because it does nothing
      !manualDaemon || coreConnected
        ? coreConnected
          ? menuItems.stopCoreMenu
          : menuItems.startCoreMenu
        : null,
      legacyMode ? menuItems.switchTritiumMode : menuItems.switchLegacyMode,
      menuItems.separator,
      menuItems.quitNexus,
    ].filter(e => e),
  };

  //TODO: darwin does not like null here , so I replaced it with separator which will colapse into nothing. But rework this for next build.
  const subMenuFile = {
    label: __('File'),
    submenu: [
      legacyMode ? menuItems.backupWallet : menuItems.separator,
      legacyMode ? menuItems.viewBackups : menuItems.separator,
      menuItems.separator,
      menuItems.downloadRecent,
    ],
  };
  const subMenuEdit = {
    label: __('Edit'),
    submenu: [menuItems.cut, menuItems.copy, menuItems.paste],
  };
  const subMenuView = {
    label: __('Settings'),
    submenu: [
      menuItems.appSettings,
      menuItems.coreSettings,
      legacyMode ? menuItems.keyManagement : null,
      menuItems.styleSettings,
      menuItems.moduleSettings,
    ].filter(e => e),
  };

  const subMenuWindow = {
    label: __('View'),
    submenu: [menuItems.toggleFullScreen],
  };
  if (process.env.NODE_ENV === 'development' || state.settings.devMode) {
    subMenuWindow.submenu.push(menuItems.toggleDevTools);

    if (activeAppModule) {
      subMenuWindow.submenu.push(menuItems.toggleModuleDevTools);
    }
  }

  const subMenuHelp = {
    label: __('Help'),
    submenu: [
      menuItems.websiteLink,
      menuItems.gitRepoLink,
      menuItems.walletGuideLink,
      menuItems.openCoreDataDir,
      menuItems.openInterfaceDataDir,
      menuItems.separator,
      buildUpdaterMenu(),
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

  const subMenuFile = {
    label: __('File'),
    submenu: [
      legacyMode ? menuItems.backupWallet : null,
      legacyMode ? menuItems.viewBackups : null,
      menuItems.separator,
      menuItems.downloadRecent,
      menuItems.separator,
      // If it's in manual core mode and core is not running, don't show
      // Start Core option because it does nothing
      !manualDaemon || coreConnected
        ? coreConnected
          ? menuItems.stopCoreMenu
          : menuItems.startCoreMenu
        : null,
      legacyMode ? menuItems.switchTritiumMode : menuItems.switchLegacyMode,
      menuItems.separator,
      menuItems.quitNexus,
    ].filter(e => e),
  };

  const subMenuSettings = {
    label: __('Settings'),
    submenu: [
      menuItems.appSettings,
      menuItems.coreSettings,
      legacyMode ? menuItems.keyManagement : null,
      menuItems.styleSettings,
      menuItems.moduleSettings,
    ].filter(e => e),
  };
  const subMenuView = {
    label: __('View'),
    submenu: [menuItems.toggleFullScreen],
  };
  if (process.env.NODE_ENV === 'development' || state.settings.devMode) {
    subMenuView.submenu.push(menuItems.separator, menuItems.toggleDevTools);

    if (activeAppModule) {
      subMenuView.submenu.push(menuItems.toggleModuleDevTools);
    }
  }

  const subMenuHelp = {
    label: __('Help'),
    submenu: [
      menuItems.about,
      menuItems.separator,
      menuItems.websiteLink,
      menuItems.gitRepoLink,
      menuItems.walletGuideLink,
      menuItems.openCoreDataDir,
      menuItems.openInterfaceDataDir,
      menuItems.separator,
      buildUpdaterMenu(),
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

  ipcRenderer.invoke('set-app-menu', template);
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
});
