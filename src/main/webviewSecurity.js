import { randomBytes } from 'crypto';
import { app, session } from 'electron';

import { getDomain } from './fileServer';
import { getModulePreloadPath } from './paths';
import { resolveModuleRoot } from './moduleFiles';
import {
  loadModuleGuestIdentity,
  registerModuleGuest,
  unregisterModuleGuest,
} from './moduleBroker';
import {
  getModuleProxyConfig,
  isAllowedModuleRequest,
} from './ipc/moduleNetworkPolicy';

const authorizedEntries = new Map();
/** @type {Map<Electron.Session, object>} */
const pendingPoliciesBySession = new Map();
const pendingPolicyTimeoutMs = 30000;

function moduleUrlPrefix(moduleName) {
  return `${getDomain()}/modules/${encodeURIComponent(moduleName)}/`;
}

function isAllowedNavigation(url, policy) {
  try {
    const target = new URL(url);
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
      webPreferences.disableBlinkFeatures = 'WebRTC';
      webPreferences.preload = getModulePreloadPath();
      delete webPreferences.preloadURL;

      // Associate policy with a unique guest session so concurrent WebView
      // attaches cannot apply the wrong navigation/window-open restrictions.
      const partition = `nexus-module:${randomBytes(16).toString('hex')}`;
      webPreferences.partition = partition;
      const guestSession = session.fromPartition(partition);
      const fileServerDomain = getDomain();
      const pending = {
        policy,
        cleanupTimer: null,
        contents: null,
        proxyReady: false,
      };
      guestSession.webRequest.onBeforeRequest(
        { urls: ['<all_urls>'] },
        (details, callback) => {
          callback({
            cancel: !isAllowedModuleRequest(
              details.url,
              policy,
              fileServerDomain
            ),
          });
        }
      );
      const cleanupPending = () => {
        const currentPending = pendingPoliciesBySession.get(guestSession);
        if (currentPending !== pending) return false;
        pendingPoliciesBySession.delete(guestSession);
        guestSession.webRequest.onBeforeRequest(null);
        guestSession.setProxy({ mode: 'direct' }).catch(() => {});
        return true;
      };
      const closePendingContents = () => {
        const guestContents = pending.contents;
        if (!guestContents || guestContents.isDestroyed()) return;
        unregisterModuleGuest(guestContents.id);
        try {
          guestContents.close();
        } catch {
          // ignore
        }
      };
      const cleanupTimer = setTimeout(() => {
        if (!cleanupPending()) return;
        closePendingContents();
      }, pendingPolicyTimeoutMs);
      pending.cleanupTimer = cleanupTimer;
      cleanupTimer.unref?.();
      pendingPoliciesBySession.set(guestSession, pending);
      guestSession
        .setProxy(getModuleProxyConfig(policy, fileServerDomain))
        .then(() => {
          pending.proxyReady = true;
          if (pending.contents) {
            pendingPoliciesBySession.delete(guestSession);
          }
        })
        .catch((error) => {
          console.error('Failed to set module network proxy', error);
          if (!cleanupPending()) return;
          closePendingContents();
        });
    }
  );
}

app.on('web-contents-created', (_event, contents) => {
  if (contents.getType() !== 'webview') return;
  const pending = pendingPoliciesBySession.get(contents.session);
  if (pending) clearTimeout(pending.cleanupTimer);
  if (pending) {
    pending.contents = contents;
    if (pending.proxyReady) {
      pendingPoliciesBySession.delete(contents.session);
    }
  }
  const policy = pending?.policy;
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
  contents.session.setPermissionCheckHandler(() => false);

  contents.on('destroyed', () => {
    unregisterModuleGuest(contents.id);
  });
});
