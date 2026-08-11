import { randomBytes } from 'crypto';
import { app, session } from 'electron';
import { fileURLToPath } from 'url';

import { getDomain } from './fileServer';
import { getModulePreloadPath } from './paths';
import { resolveModuleRoot } from './moduleFiles';
import {
  loadModuleGuestIdentity,
  registerModuleGuest,
  unregisterModuleGuest,
} from './moduleBroker';

const authorizedEntries = new Map();
/** @type {Map<Electron.Session, object>} */
const pendingPoliciesBySession = new Map();

function moduleUrlPrefix(moduleName) {
  return `${getDomain()}/modules/${encodeURIComponent(moduleName)}/`;
}

function isAllowedNavigation(url, policy) {
  try {
    const target = new URL(url);
    if (policy.development) {
      if (target.protocol !== 'file:') return false;
      const targetPath = fileURLToPath(target);
      return (
        targetPath === policy.root ||
        targetPath.startsWith(`${policy.root}${policy.separator}`)
      );
    }
    return target.toString().startsWith(moduleUrlPrefix(policy.moduleName));
  } catch {
    return false;
  }
}

/**
 * Authorize a module entry URL and pre-load guest identity/capabilities so
 * registration at web-contents-created is fully synchronous.
 */
export async function authorizeModuleEntry(moduleName, entryUrl) {
  const { root, development } = await resolveModuleRoot(moduleName);
  const identity = await loadModuleGuestIdentity({
    moduleName,
    development,
    enabled: true,
  });
  authorizedEntries.set(entryUrl, {
    moduleName: identity.moduleName,
    root,
    development,
    separator: process.platform === 'win32' ? '\\' : '/',
    identity,
  });
}

/**
 * Force secure WebView preferences regardless of renderer-supplied attributes.
 * Production modules always run with contextIsolation, no nodeIntegration, and sandbox.
 */
export function hardenModuleWebviews(mainWindow) {
  mainWindow.webContents.on(
    'will-attach-webview',
    (event, webPreferences, params) => {
      const policy = authorizedEntries.get(params.src);
      if (!policy) {
        event.preventDefault();
        return;
      }
      authorizedEntries.delete(params.src);

      webPreferences.nodeIntegration = false;
      webPreferences.contextIsolation = true;
      webPreferences.sandbox = true;
      webPreferences.enableRemoteModule = false;
      webPreferences.webSecurity = true;
      webPreferences.allowRunningInsecureContent = false;
      webPreferences.experimentalFeatures = false;
      webPreferences.preload = getModulePreloadPath();
      delete webPreferences.preloadURL;

      // Associate policy with a unique guest session so concurrent WebView
      // attaches cannot apply the wrong navigation/window-open restrictions.
      const partition = `nexus-module:${randomBytes(16).toString('hex')}`;
      webPreferences.partition = partition;
      pendingPoliciesBySession.set(session.fromPartition(partition), policy);
    }
  );
}

app.on('web-contents-created', (_event, contents) => {
  if (contents.getType() !== 'webview') return;
  const policy = pendingPoliciesBySession.get(contents.session);
  pendingPoliciesBySession.delete(contents.session);
  if (!policy?.identity) {
    contents.close();
    return;
  }

  // Insert guest record synchronously before the guest can navigate/invoke APIs.
  try {
    registerModuleGuest(contents.id, policy.identity);
  } catch (error) {
    console.error('Failed to register module guest', error);
    try {
      contents.close();
    } catch {
      // ignore
    }
    return;
  }

  contents.setWindowOpenHandler(() => ({ action: 'deny' }));

  contents.on('will-navigate', (event, url) => {
    if (!isAllowedNavigation(url, policy)) event.preventDefault();
  });

  contents.on('will-redirect', (event, url) => {
    if (!isAllowedNavigation(url, policy)) event.preventDefault();
  });

  contents.session.setPermissionRequestHandler((_wc, _permission, callback) => {
    callback(false);
  });

  contents.on('destroyed', () => {
    unregisterModuleGuest(contents.id);
  });
});
