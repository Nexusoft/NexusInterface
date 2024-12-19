// External
import { shell, ipcRenderer } from 'electron';

// Internal
import store, { observeStore, jotaiStore } from 'store';
import { toggleWebViewDevTools, getActiveWebView } from 'lib/modules';
import { startCore, stopCore } from 'lib/core';
import { navigate } from 'lib/wallet';
import {
  showNotification,
  openModal,
  toggleLockScreen,
  jotaiDevToolsOpenAtom,
} from 'lib/ui';
import { bootstrap } from 'lib/bootstrap';
import { isCoreConnected, isLoggedIn } from 'selectors';
import { preRelease } from 'consts/misc';
// import { confirm } from 'lib/dialog';
import { walletDataDir } from 'consts/paths';
import { checkForUpdates, quitAndInstall } from 'lib/updater';
import AboutModal from 'components/AboutModal';

// Because functions can't be passed through IPC messages so we have
// to preprocess menu template so that click handlers function properly
const preprocess = (menuItems) => {
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
      navigate('/Settings/Core');
    },
  },
  appSettings: {
    label: __('Application'),
    click: () => {
      navigate('/Settings/App');
    },
  },
  keyManagement: {
    label: __('Key Management'),
    click: () => {
      navigate('/Settings/Security');
    },
  },
  styleSettings: {
    label: __('Style'),
    click: () => {
      navigate('/Settings/Style');
    },
  },
  moduleSettings: {
    label: __('Modules'),
    click: () => {
      navigate('/Settings/Modules');
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
  reloadUI: {
    label: __('Reload wallet GUI'),
    accelerator: 'F5',
    role: 'reload',
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
    accelerator: 'Alt+Shift+I',
    click: () => {
      toggleWebViewDevTools();
    },
  },
  toggleJotaiDevTools: {
    label: __('Toggle Jotai Developer Tools'),
    click: () => {
      const open = jotaiStore.get(jotaiDevToolsOpenAtom);
      jotaiStore.set(jotaiDevToolsOpenAtom, !open);
    },
  },
  websiteLink: {
    label: __('Nexus Website'),
    click: () => {
      shell.openExternal('http://nexus.io');
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
      shell.openExternal('https://nexus.io/ResourceHub/wallet-guide');
    },
  },
  reportBug: {
    label: __('Report Bug'),
    click: () => {
      shell.openExternal('https://github.com/Nexusoft/NexusInterface/issues');
    },
  },
  openCoreDataDir: {
    label: __('Open Core Data Folder'),
    click: () => {
      const state = store.getState();
      shell.openPath(state.settings.coreDataDir);
    },
  },
  openInterfaceDataDir: {
    label: __('Open Interface Data Folder'),
    click: () => {
      shell.openPath(walletDataDir);
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
      if (result?.updateInfo.version === APP_VERSION) {
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
  lockScreen: {
    label: __('Lock Screen'),
    accelerator: 'CmdOrCtrl+L',
    click: () => {
      const state = store.getState();
      if (state.ui.locked) {
        return;
      }
      toggleLockScreen(true);
    },
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
 * Build Menu for OSX
 *
 * @memberof AppMenu
 */
function buildDarwinTemplate() {
  const state = store.getState();
  const coreConnected = isCoreConnected(state);
  const activeWebView = getActiveWebView();
  const loggedIn = isLoggedIn(state);

  const {
    settings: { manualDaemon },
    core: { systemInfo },
  } = state;

  const subMenuAbout = {
    label: 'Nexus',
    submenu: [
      menuItems.about,
      // If it's in remote core mode and core is not running, don't show
      // Start Core option because it does nothing
      !manualDaemon || coreConnected
        ? coreConnected
          ? menuItems.stopCoreMenu
          : menuItems.startCoreMenu
        : null,
      menuItems.separator,
      loggedIn ? menuItems.lockScreen : null,
      menuItems.separator,
      menuItems.quitNexus,
    ].filter((e) => e),
  };

  const subMenuFile = {
    label: __('File'),
    submenu: [!systemInfo?.litemode ? menuItems.downloadRecent : null].filter(
      (e) => e
    ),
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
      menuItems.styleSettings,
      menuItems.moduleSettings,
    ].filter((e) => e),
  };

  const subMenuWindow = {
    label: __('View'),
    submenu: [menuItems.reloadUI, menuItems.toggleFullScreen],
  };
  if (process.env.NODE_ENV === 'development' || state.settings.devMode) {
    subMenuWindow.submenu.push(menuItems.toggleDevTools);
    if (process.env.NODE_ENV === 'development') {
      subMenuWindow.submenu.push(menuItems.toggleJotaiDevTools);
    }
    if (activeWebView) {
      subMenuWindow.submenu.push(menuItems.toggleModuleDevTools);
    }
  }

  const subMenuHelp = {
    label: __('Help'),
    submenu: [
      menuItems.websiteLink,
      menuItems.gitRepoLink,
      menuItems.walletGuideLink,
      preRelease ? menuItems.reportBug : null,
      menuItems.openCoreDataDir,
      menuItems.openInterfaceDataDir,
      menuItems.separator,
      buildUpdaterMenu(),
    ].filter((e) => e),
  };

  return [
    subMenuAbout,
    subMenuFile.submenu.length ? subMenuFile : null,
    subMenuEdit,
    subMenuView,
    subMenuWindow,
    subMenuHelp,
  ].filter((e) => e);
}

/**
 * Build Menu to Windows / Linux
 *
 * @memberof AppMenu
 */
function buildDefaultTemplate() {
  const state = store.getState();
  const coreConnected = isCoreConnected(state);
  const activeWebView = getActiveWebView();
  const loggedIn = isLoggedIn(state);

  const {
    settings: { manualDaemon },
    core: { systemInfo },
  } = state;

  const subMenuFile = {
    label: __('File'),
    submenu: [
      !systemInfo?.litemode ? menuItems.downloadRecent : null,
      menuItems.separator,
      // If it's in remote core mode and core is not running, don't show
      // Start Core option because it does nothing
      !manualDaemon || coreConnected
        ? coreConnected
          ? menuItems.stopCoreMenu
          : menuItems.startCoreMenu
        : null,
      menuItems.separator,
      loggedIn ? menuItems.lockScreen : null,
      menuItems.separator,
      menuItems.quitNexus,
    ].filter((e) => e),
  };

  const subMenuSettings = {
    label: __('Settings'),
    submenu: [
      menuItems.appSettings,
      menuItems.coreSettings,
      menuItems.styleSettings,
      menuItems.moduleSettings,
    ].filter((e) => e),
  };
  const subMenuView = {
    label: __('View'),
    submenu: [menuItems.reloadUI, menuItems.toggleFullScreen],
  };
  if (process.env.NODE_ENV === 'development' || state.settings.devMode) {
    subMenuView.submenu.push(menuItems.separator, menuItems.toggleDevTools);
    if (process.env.NODE_ENV === 'development') {
      subMenuView.submenu.push(menuItems.toggleJotaiDevTools);
    }
    if (activeWebView) {
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
      preRelease ? menuItems.reportBug : null,
      menuItems.walletGuideLink,
      menuItems.openCoreDataDir,
      menuItems.openInterfaceDataDir,
      menuItems.separator,
      buildUpdaterMenu(),
    ].filter((e) => e),
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

const observeLockedState = (lockedState) =>
  lockedState
    ? window.addEventListener('beforeunload', preventReload)
    : window.removeEventListener('beforeunload', preventReload);

const preventReload = (ev) => {
  ev.returnValue = true;
};

// Update the updater menu item when the updater state changes
// Changing menu item labels directly has no effect so we have to rebuild the whole menu
export function prepareMenu() {
  buildMenu();
  observeStore((state) => state.updater.state, rebuildMenu);
  observeStore(isCoreConnected, rebuildMenu);
  observeStore(
    (state) => state.settings && state.settings.devMode,
    rebuildMenu
  );
  observeStore((state) => state.activeAppModuleName, rebuildMenu);
  observeStore((state) => state.settings.manualDaemon, rebuildMenu);
  observeStore((state) => state.core.systemInfo?.litemode, rebuildMenu);
  observeStore(isLoggedIn, rebuildMenu);
  observeStore((state) => state.ui.locked, observeLockedState); // Consider moving this to a more appropriate spot.
  // observeStore((state) => state.core.systemInfo?.nolegacy, rebuildMenu);
}
