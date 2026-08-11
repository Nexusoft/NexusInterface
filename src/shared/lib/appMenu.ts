// External

// Internal
import { store, subscribe } from 'lib/store';
import {
  toggleWebViewDevTools,
  getActiveWebView,
  activeAppModuleNameAtom,
} from 'lib/modules';
import { startCore, stopCore } from 'lib/core';
import { navigate, walletLockedAtom } from 'lib/wallet';
import {
  showNotification,
  openModal,
  rqDevToolsOpenAtom,
  jotaiDevToolsOpenAtom,
} from 'lib/ui';
import { bootstrap } from 'lib/bootstrap';
import { loggedInAtom } from 'lib/session';
import { preRelease } from 'consts/misc';
import { settingsAtom, settingAtoms } from './settings';
import {
  coreInfoQuery,
  isCoreConnected,
  coreConnectedAtom,
  liteModeAtom,
} from 'lib/coreInfo';
// import { confirm } from 'lib/dialog';
import nexusEnv, { isDevelopment } from 'lib/nexusEnv';
import { checkForUpdates, quitAndInstall, updaterStateAtom } from 'lib/updater';
import AboutModal from 'components/AboutModal';

interface MenuItem {
  label: string;
  enabled?: boolean;
  accelerator?: string;
  role?: string;
  id?: string;
}

interface MenuSeparator {
  type: 'separator';
}

interface RendererMenuItem extends MenuItem {
  click?: (...args: any[]) => void;
}

interface CleanMenuItem extends MenuItem {
  click?: boolean;
  submenu?: CleanMenuItem[];
}

// Because functions can't be passed through IPC messages so we have
// to preprocess menu template so that click handlers function properly
const preprocess = (
  menuItems: Record<string, RendererMenuItem | MenuSeparator>
) => {
  const cleanMenuItems: Record<string, CleanMenuItem | MenuSeparator> = {};
  Object.entries(menuItems).forEach(([id, item]) => {
    if ('type' in item) {
      cleanMenuItems[id] = item;
      return;
    }
    const cleanItem: CleanMenuItem = { ...item, click: undefined };
    // Only add id if menu item has a click handler
    if (item.click) {
      cleanItem.id = id;
      const handleClick = item.click;
      window.nexusElectron.app.onMenuClick(id, (...args) => {
        handleClick(...args);
      });
      cleanItem.click = true;
    }
    cleanMenuItems[id] = cleanItem;
  });
  return cleanMenuItems;
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
      void window.nexusElectron.app.quit();
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
      const { manualDaemon } = store.get(settingsAtom);
      if (manualDaemon) {
        showNotification(
          __('Cannot bootstrap recent database in manual mode'),
          'error'
        );
        return;
      }

      if (!isCoreConnected()) {
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
    // Electron built-in role is all-lowercase (case-sensitive).
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
      const open = store.get(jotaiDevToolsOpenAtom);
      store.set(jotaiDevToolsOpenAtom, !open);
    },
  },
  toggleReactQueryDevTools: {
    label: __('Toggle React Query Developer Tools'),
    click: () => {
      const open = store.get(rqDevToolsOpenAtom);
      store.set(rqDevToolsOpenAtom, !open);
    },
  },
  websiteLink: {
    label: __('Nexus Website'),
    click: () => {
      void window.nexusElectron.app.openExternal('https://nexus.io');
    },
  },
  gitRepoLink: {
    label: __('Nexus Git Repository'),
    click: () => {
      void window.nexusElectron.app.openExternal('https://github.com/Nexusoft');
    },
  },
  walletGuideLink: {
    label: __('Nexus Wallet Guide'),
    click: () => {
      void window.nexusElectron.app.openExternal(
        'https://nexus.io/ResourceHub/wallet-guide'
      );
    },
  },
  reportBug: {
    label: __('Report Bug'),
    click: () => {
      void window.nexusElectron.app.openExternal(
        'https://github.com/Nexusoft/NexusInterface/issues'
      );
    },
  },
  openCoreDataDir: {
    label: __('Open Core Data Folder'),
    click: () => {
      void window.nexusElectron.app.openManagedPath('coreData');
    },
  },
  openInterfaceDataDir: {
    label: __('Open Interface Data Folder'),
    click: () => {
      void window.nexusElectron.app.openManagedPath('walletData');
    },
  },
  updaterIdle: {
    label: __('Check for Updates...'),
    enabled: true,
    click: async () => {
      await checkForUpdates();
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
      const locked = store.get(walletLockedAtom);
      if (!locked) store.set(walletLockedAtom, true);
    },
  },
});

/**
 * Get the Updater
 */
function buildUpdaterMenu() {
  const updaterState = store.get(updaterStateAtom);
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
 */
function buildDarwinTemplate() {
  const coreConnected = isCoreConnected();
  const activeWebView = getActiveWebView();
  const loggedIn = store.get(loggedInAtom);
  const coreInfo = store.get(coreInfoQuery.valueAtom);
  const { manualDaemon, devMode } = store.get(settingsAtom);

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
    submenu: [!coreInfo?.litemode ? menuItems.downloadRecent : null].filter(
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
  if (isDevelopment || devMode) {
    subMenuWindow.submenu.push(menuItems.toggleDevTools);
    if (isDevelopment) {
      subMenuWindow.submenu.push(menuItems.toggleJotaiDevTools);
      subMenuWindow.submenu.push(menuItems.toggleReactQueryDevTools);
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
 */
function buildDefaultTemplate() {
  const coreConnected = isCoreConnected();
  const activeWebView = getActiveWebView();
  const loggedIn = store.get(loggedInAtom);
  const coreInfo = store.get(coreInfoQuery.valueAtom);
  const { manualDaemon, devMode } = store.get(settingsAtom);

  const subMenuFile = {
    label: __('File'),
    submenu: [
      !coreInfo?.litemode ? menuItems.downloadRecent : null,
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
  if (isDevelopment || devMode) {
    subMenuView.submenu.push(menuItems.separator, menuItems.toggleDevTools);
    if (isDevelopment) {
      subMenuView.submenu.push(menuItems.toggleJotaiDevTools);
      subMenuView.submenu.push(menuItems.toggleReactQueryDevTools);
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
 */
function buildMenu() {
  const template =
    nexusEnv.platform === 'darwin'
      ? buildDarwinTemplate()
      : buildDefaultTemplate();
  void window.nexusElectron.app.setMenu(template);
}

let rebuildTimerId: NodeJS.Timeout | undefined;

/**
 * Rebuild the menu asynchronously so that if multiple rebuild requests come
 * at the same time, it only rebuilds once
 */
function rebuildMenu() {
  if (rebuildTimerId) return;
  rebuildTimerId = setTimeout(() => {
    buildMenu();
    rebuildTimerId = undefined;
  }, 0);
}

// Update the updater menu item when the updater state changes
// Changing menu item labels directly has no effect so we have to rebuild the whole menu
export function prepareMenu() {
  buildMenu();
  subscribe(updaterStateAtom, rebuildMenu);
  subscribe(coreConnectedAtom, rebuildMenu);
  subscribe(settingAtoms.devMode, rebuildMenu);
  subscribe(settingAtoms.manualDaemon, rebuildMenu);
  subscribe(activeAppModuleNameAtom, rebuildMenu);
  subscribe(liteModeAtom, rebuildMenu);
  subscribe(loggedInAtom, rebuildMenu);
}
