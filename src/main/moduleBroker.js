'use strict';

import { clipboard, dialog, ipcMain, shell, webContents } from 'electron';
import log from 'electron-log';
import fs from 'fs/promises';
import path from 'path';

import {
  API_VERSION,
  CHANNELS,
  ERROR_CODES,
  METHOD_CAPABILITY,
  METHODS,
  createMethodRateLimiter,
  normalizeManifestCapabilities,
  sanitizeWalletContext,
  validateInvokeRequest,
  validateModuleOpenUrl,
} from './ipc/moduleApiV2';
import { readModuleStorage, writeModuleStorage } from './modules';
import { resolveModuleRoot } from './moduleFiles';
import { assertSafeModuleName } from './ipc/contracts';

/** @typedef {{
 *  webContentsId: number,
 *  moduleName: string,
 *  displayName: string,
 *  version: string,
 *  hash?: string,
 *  development: boolean,
 *  enabled: boolean,
 *  capabilities: string[],
 *  legacy: boolean,
 *  registeredAt: number,
 * }} ModuleGuest */

const guestsByWebContentsId = new Map();
const pendingHostRequests = new Map();
const storageWriteBuckets = new Map();
const sideEffectRateLimiter = createMethodRateLimiter();
const pendingSideEffectPrompts = new Set();
const auditLog = [];

const STORAGE_WRITE_LIMIT = 30;
const STORAGE_WRITE_WINDOW_MS = 60_000;
const HOST_REQUEST_TIMEOUT_MS = 120_000;
const MAX_AUDIT_ENTRIES = 500;

function audit(entry) {
  const record = {
    timestamp: new Date().toISOString(),
    ...entry,
  };
  auditLog.push(record);
  if (auditLog.length > MAX_AUDIT_ENTRIES) {
    auditLog.splice(0, auditLog.length - MAX_AUDIT_ENTRIES);
  }
  log.info('module-api.audit', {
    moduleId: record.moduleId,
    method: record.method,
    capability: record.capability,
    outcome: record.outcome,
    reason: record.reason,
  });
}

export function getModuleApiAuditLog() {
  return auditLog.slice();
}

function moduleError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function resultOk(value) {
  return { ok: true, value };
}

function resultErr(code, message) {
  return { ok: false, error: { code, message } };
}

async function readPackageInfo(moduleName, development) {
  const { root } = await resolveModuleRoot(moduleName);
  const fileName = development ? 'nxs_package.dev.json' : 'nxs_package.json';
  const raw = await fs.readFile(path.join(root, fileName), 'utf8');
  return JSON.parse(raw);
}

/**
 * Parse/validate module identity + capabilities from the installed manifest.
 * Call this while authorizing entry (before navigation) so guest registration
 * can complete synchronously at web-contents-created.
 *
 * @returns {Promise<Omit<ModuleGuest, 'webContentsId' | 'registeredAt'>>}
 */
export async function loadModuleGuestIdentity({
  moduleName,
  development = false,
  enabled = true,
  hash,
}) {
  const safeName = assertSafeModuleName(moduleName);
  let info;
  try {
    info = await readPackageInfo(safeName, development);
  } catch {
    throw moduleError(
      ERROR_CODES.MODULE_UNKNOWN,
      `Unable to load module package for ${safeName}`
    );
  }

  const capabilities = normalizeManifestCapabilities(info.capabilities, {
    development,
  });
  const legacy =
    development &&
    (info.legacyApi === true || capabilities.includes('legacy.api'));

  return {
    moduleName: safeName,
    displayName:
      typeof info.displayName === 'string' && info.displayName
        ? info.displayName.slice(0, 120)
        : safeName,
    version: typeof info.version === 'string' ? info.version.slice(0, 64) : '0.0.0',
    hash: typeof hash === 'string' ? hash.slice(0, 128) : undefined,
    development: !!development,
    enabled: !!enabled,
    capabilities,
    legacy: !!legacy,
  };
}

/**
 * Synchronously register a guest WebContents as a known module instance.
 * Identity must already be loaded via loadModuleGuestIdentity during entry
 * authorization — never trust renderer-supplied IDs alone.
 *
 * @param {number} webContentsId
 * @param {Omit<ModuleGuest, 'webContentsId' | 'registeredAt'>} identity
 */
export function registerModuleGuest(webContentsId, identity) {
  if (!identity || typeof identity.moduleName !== 'string') {
    throw moduleError(ERROR_CODES.MODULE_UNKNOWN, 'Missing module guest identity');
  }
  if (typeof webContentsId !== 'number') {
    throw moduleError(ERROR_CODES.UNAUTHORIZED, 'Invalid module webContents id');
  }

  /** @type {ModuleGuest} */
  const guest = {
    ...identity,
    webContentsId,
    registeredAt: Date.now(),
  };

  guestsByWebContentsId.set(webContentsId, guest);
  audit({
    moduleId: guest.moduleName,
    version: guest.version,
    hash: guest.hash,
    method: 'register',
    capability: null,
    outcome: 'allow',
    reason: guest.development ? 'development-guest' : 'production-guest',
  });
  return guest;
}

export function unregisterModuleGuest(webContentsId) {
  const guest = guestsByWebContentsId.get(webContentsId);
  if (guest) {
    guestsByWebContentsId.delete(webContentsId);
    sideEffectRateLimiter.clear(webContentsId);
    pendingSideEffectPrompts.delete(webContentsId);
    audit({
      moduleId: guest.moduleName,
      version: guest.version,
      method: 'unregister',
      capability: null,
      outcome: 'allow',
      reason: 'guest-destroyed',
    });
  }
}

export function getGuestByWebContentsId(webContentsId) {
  return guestsByWebContentsId.get(webContentsId) || null;
}

function assertGuestFromEvent(event) {
  const contents = event.sender;
  if (!contents || typeof contents.id !== 'number') {
    throw moduleError(ERROR_CODES.UNAUTHORIZED, 'Missing module sender');
  }
  const guest = guestsByWebContentsId.get(contents.id);
  if (!guest) {
    throw moduleError(ERROR_CODES.UNAUTHORIZED, 'Unknown module guest');
  }
  if (!guest.enabled) {
    throw moduleError(ERROR_CODES.MODULE_DISABLED, 'Module is disabled');
  }
  // Ensure the sender is still a live webview guest.
  try {
    if (contents.isDestroyed()) {
      throw moduleError(ERROR_CODES.UNAUTHORIZED, 'Destroyed module guest');
    }
    if (typeof contents.getType === 'function' && contents.getType() !== 'webview') {
      throw moduleError(ERROR_CODES.UNAUTHORIZED, 'Sender is not a module webview');
    }
  } catch (error) {
    if (error?.code) throw error;
    throw moduleError(ERROR_CODES.UNAUTHORIZED, 'Invalid module guest');
  }
  return guest;
}

function assertCapability(guest, method) {
  const capability = METHOD_CAPABILITY[method];
  if (!capability) {
    throw moduleError(ERROR_CODES.UNKNOWN_METHOD, `Unknown method ${method}`);
  }
  if (!guest.capabilities.includes(capability)) {
    throw moduleError(
      ERROR_CODES.CAPABILITY_DENIED,
      `Module lacks capability ${capability}`
    );
  }
  return capability;
}

function consumeStorageWriteQuota(moduleName) {
  const now = Date.now();
  const bucket = storageWriteBuckets.get(moduleName) || [];
  const recent = bucket.filter((ts) => now - ts < STORAGE_WRITE_WINDOW_MS);
  if (recent.length >= STORAGE_WRITE_LIMIT) {
    throw moduleError(
      ERROR_CODES.RATE_LIMITED,
      'Module storage write rate limit exceeded'
    );
  }
  recent.push(now);
  storageWriteBuckets.set(moduleName, recent);
}

function getMainWindowContents() {
  const mainWindow = global.mainWindow;
  if (!mainWindow || mainWindow.isDestroyed()) return null;
  return mainWindow.webContents;
}

async function confirmModuleSideEffect(guest, method, payload) {
  const mainWindow = global.mainWindow;
  if (!mainWindow || mainWindow.isDestroyed()) {
    throw moduleError(
      ERROR_CODES.HOST_UNAVAILABLE,
      'Wallet confirmation window is unavailable'
    );
  }
  if (pendingSideEffectPrompts.has(guest.webContentsId)) {
    throw moduleError(
      ERROR_CODES.RATE_LIMITED,
      'A module side-effect confirmation is already pending'
    );
  }

  const opensLink = method === METHODS.UI_OPEN_EXTERNAL;
  const action = opensLink ? 'Open Link' : 'Copy Text';
  const detail = opensLink
    ? payload.url
    : `Text preview: ${JSON.stringify(payload.text.slice(0, 500))}${
        payload.text.length > 500 ? '…' : ''
      }\n${payload.text.length} characters`;

  pendingSideEffectPrompts.add(guest.webContentsId);
  try {
    const { response } = await dialog.showMessageBox(mainWindow, {
      type: 'warning',
      buttons: ['Deny', action],
      defaultId: 0,
      cancelId: 0,
      noLink: true,
      title: 'Module permission request',
      message: `${guest.moduleName} requests permission to ${
        opensLink ? 'open an external link' : 'replace clipboard contents'
      }.`,
      detail,
    });
    if (response !== 1) {
      throw moduleError(
        ERROR_CODES.USER_DENIED,
        `User denied ${method} for this module`
      );
    }
    try {
      const contents = webContents.fromId(guest.webContentsId);
      if (
        guestsByWebContentsId.get(guest.webContentsId) !== guest ||
        !contents ||
        contents.isDestroyed()
      ) {
        throw moduleError(
          ERROR_CODES.UNAUTHORIZED,
          'Module guest is no longer active'
        );
      }
    } catch (error) {
      if (error?.code) throw error;
      throw moduleError(ERROR_CODES.UNAUTHORIZED, 'Invalid module guest');
    }
  } finally {
    pendingSideEffectPrompts.delete(guest.webContentsId);
  }
}

function requestHostAction(guest, action, payload) {
  const host = getMainWindowContents();
  if (!host) {
    return Promise.reject(
      moduleError(ERROR_CODES.HOST_UNAVAILABLE, 'Wallet host is unavailable')
    );
  }

  const requestId = `${guest.webContentsId}:${Date.now()}:${Math.random()
    .toString(16)
    .slice(2, 10)}`;

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      pendingHostRequests.delete(requestId);
      reject(
        moduleError(ERROR_CODES.HOST_UNAVAILABLE, 'Wallet host request timed out')
      );
    }, HOST_REQUEST_TIMEOUT_MS);

    pendingHostRequests.set(requestId, {
      resolve,
      reject,
      timer,
      moduleName: guest.moduleName,
      action,
    });

    host.send(CHANNELS.hostRequest, {
      requestId,
      action,
      moduleName: guest.moduleName,
      displayName: guest.displayName,
      payload,
    });
  });
}

export function completeHostRequest(response) {
  if (!response || typeof response !== 'object') {
    throw moduleError(ERROR_CODES.INVALID_REQUEST, 'Invalid host response');
  }
  const pending = pendingHostRequests.get(response.requestId);
  if (!pending) {
    throw moduleError(ERROR_CODES.INVALID_REQUEST, 'Unknown host response');
  }
  clearTimeout(pending.timer);
  pendingHostRequests.delete(response.requestId);
  if (response.ok === false) {
    pending.reject(
      moduleError(
        response.error?.code || ERROR_CODES.INTERNAL,
        response.error?.message || 'Host request failed'
      )
    );
    return;
  }
  pending.resolve(response.value);
}

async function handleInvoke(guest, request) {
  const { method, payload } = validateInvokeRequest(request);
  const capability = assertCapability(guest, method);

  try {
    let value;
    switch (method) {
      case METHODS.WALLET_GET_CONTEXT: {
        value = await requestHostAction(guest, 'getContext', undefined);
        value = sanitizeWalletContext({
          ...value,
          walletVersion: value?.walletVersion,
        });
        break;
      }
      case METHODS.UI_NOTIFY: {
        await requestHostAction(guest, 'notify', payload);
        value = undefined;
        break;
      }
      case METHODS.UI_CONFIRM: {
        value = Boolean(await requestHostAction(guest, 'confirm', payload));
        break;
      }
      case METHODS.UI_OPEN_EXTERNAL: {
        const url = validateModuleOpenUrl(payload.url);
        sideEffectRateLimiter.consume(guest.webContentsId, method);
        await confirmModuleSideEffect(guest, method, { url });
        await shell.openExternal(url);
        value = undefined;
        break;
      }
      case METHODS.UI_COPY_TEXT: {
        sideEffectRateLimiter.consume(guest.webContentsId, method);
        await confirmModuleSideEffect(guest, method, payload);
        clipboard.writeText(payload.text);
        value = undefined;
        break;
      }
      case METHODS.STORAGE_GET: {
        value = await readModuleStorage(guest.moduleName);
        break;
      }
      case METHODS.STORAGE_SET: {
        consumeStorageWriteQuota(guest.moduleName);
        await writeModuleStorage(guest.moduleName, payload.value);
        value = undefined;
        break;
      }
      case METHODS.STATE_GET: {
        value = await requestHostAction(guest, 'state.get', undefined);
        break;
      }
      case METHODS.STATE_SET: {
        await requestHostAction(guest, 'state.set', payload);
        value = undefined;
        break;
      }
      case METHODS.WALLET_REQUEST_SEND: {
        await requestHostAction(guest, 'requestSend', {
          ...payload,
          originatingModule: {
            name: guest.moduleName,
            displayName: guest.displayName,
            version: guest.version,
          },
        });
        value = undefined;
        break;
      }
      default:
        throw moduleError(ERROR_CODES.UNKNOWN_METHOD, `Unhandled method ${method}`);
    }

    audit({
      moduleId: guest.moduleName,
      version: guest.version,
      hash: guest.hash,
      method,
      capability,
      outcome: 'allow',
    });
    return resultOk(value);
  } catch (error) {
    const code = error?.code || ERROR_CODES.INTERNAL;
    const message = error?.message || 'Module API request failed';
    audit({
      moduleId: guest.moduleName,
      version: guest.version,
      hash: guest.hash,
      method,
      capability,
      outcome: 'deny',
      reason: code,
    });
    return resultErr(code, message);
  }
}

/**
 * Push sanitized wallet context to a specific guest webview.
 */
export function pushContextToGuest(webContentsId, rawContext) {
  const guest = guestsByWebContentsId.get(webContentsId);
  if (!guest) return;
  let contents;
  try {
    contents = webContents.fromId(webContentsId);
  } catch {
    return;
  }
  if (!contents || contents.isDestroyed()) return;
  const context = sanitizeWalletContext(rawContext);
  contents.send(CHANNELS.contextChanged, context);
}

export function pushContextToModule(moduleName, rawContext) {
  for (const guest of guestsByWebContentsId.values()) {
    if (guest.moduleName === moduleName) {
      pushContextToGuest(guest.webContentsId, rawContext);
    }
  }
}

export function pushContextToActiveGuests(rawContext) {
  for (const guest of guestsByWebContentsId.values()) {
    pushContextToGuest(guest.webContentsId, rawContext);
  }
}

let handlersRegistered = false;

export function registerModuleBrokerHandlers() {
  if (handlersRegistered) return;
  handlersRegistered = true;

  ipcMain.handle(CHANNELS.invoke, async (event, request) => {
    try {
      const guest = assertGuestFromEvent(event);
      return await handleInvoke(guest, request);
    } catch (error) {
      const code = error?.code || ERROR_CODES.INTERNAL;
      const message = error?.message || 'Module API invoke failed';
      audit({
        moduleId: 'unknown',
        method: request?.method,
        capability: METHOD_CAPABILITY[request?.method] || null,
        outcome: 'deny',
        reason: code,
      });
      return resultErr(code, message);
    }
  });

  ipcMain.handle(CHANNELS.hostResponse, async (event, response) => {
    // Only the wallet host renderer may complete host requests.
    const main = getMainWindowContents();
    if (!main || event.sender.id !== main.id) {
      return resultErr(ERROR_CODES.UNAUTHORIZED, 'Host response sender rejected');
    }
    try {
      completeHostRequest(response);
      return resultOk(true);
    } catch (error) {
      return resultErr(
        error?.code || ERROR_CODES.INTERNAL,
        error?.message || 'Host response failed'
      );
    }
  });
}

export function getApiVersion() {
  return API_VERSION;
}
