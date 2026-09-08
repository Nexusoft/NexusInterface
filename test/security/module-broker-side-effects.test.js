'use strict';

const assert = require('node:assert/strict');
const Module = require('node:module');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '../..');
const handlers = new Map();
const openedUrls = [];
const copiedTexts = [];
const liveWebContents = new Map();
let showMessageBox = async () => ({ response: 0 });

const electron = {
  clipboard: {
    writeText(text) {
      copiedTexts.push(text);
    },
  },
  dialog: {
    showMessageBox(...args) {
      return showMessageBox(...args);
    },
  },
  ipcMain: {
    handle(channel, handler) {
      handlers.set(channel, handler);
    },
  },
  shell: {
    async openExternal(url) {
      openedUrls.push(url);
    },
  },
  webContents: {
    fromId(id) {
      return liveWebContents.get(id) || null;
    },
  },
};

const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === 'electron') return electron;
  if (request === 'electron-log') {
    return { info() {} };
  }
  if (request === './modules') {
    return {
      readModuleStorage: async () => ({}),
      writeModuleStorage: async () => {},
    };
  }
  if (request === './moduleFiles') {
    return { resolveModuleRoot: async () => ({ root }) };
  }
  return originalLoad.call(this, request, parent, isMain);
};

require('@babel/register')({
  configFile: path.join(root, 'configs', '.babelrc.js'),
  extensions: ['.js'],
});
const {
  registerModuleBrokerHandlers,
  registerModuleGuest,
  unregisterModuleGuest,
} = require('../../src/main/moduleBroker');
Module._load = originalLoad;

const {
  CAPABILITIES,
  CHANNELS,
  ERROR_CODES,
  METHODS,
} = require('../../src/main/ipc/moduleApiV2');

function registerGuest(id) {
  registerModuleGuest(id, {
    moduleName: `package-${id}`,
    displayName: 'Trusted Wallet\u0007',
    version: '1.0.0',
    development: true,
    enabled: true,
    capabilities: [
      CAPABILITIES.UI_OPEN_EXTERNAL,
      CAPABILITIES.UI_COPY_TEXT,
    ],
    legacy: false,
  });
  let destroyed = false;
  const sender = {
    id,
    isDestroyed: () => destroyed,
    getType: () => 'webview',
  };
  liveWebContents.set(id, sender);
  return {
    sender,
    destroy() {
      destroyed = true;
      liveWebContents.delete(id);
      unregisterModuleGuest(id);
    },
  };
}

test('module broker confirms side effects before executing them', async (t) => {
  global.mainWindow = {
    isDestroyed: () => false,
    webContents: { id: 1 },
  };
  registerModuleBrokerHandlers();
  const invoke = handlers.get(CHANNELS.invoke);
  const event = registerGuest(901);

  t.after(() => {
    unregisterModuleGuest(901);
    unregisterModuleGuest(902);
    delete global.mainWindow;
  });

  let promptOptions;
  showMessageBox = async (_window, options) => {
    promptOptions = options;
    return { response: 0 };
  };
  const deniedOpen = await invoke(event, {
    method: METHODS.UI_OPEN_EXTERNAL,
    payload: { url: 'https://example.com/denied' },
  });
  assert.equal(deniedOpen.ok, false);
  assert.equal(deniedOpen.error.code, ERROR_CODES.USER_DENIED);
  assert.deepEqual(openedUrls, []);
  assert.match(promptOptions.message, /package-901 requests permission/);
  assert.doesNotMatch(promptOptions.message, /Trusted Wallet/);

  showMessageBox = async () => ({ response: 1 });
  const approvedOpen = await invoke(event, {
    method: METHODS.UI_OPEN_EXTERNAL,
    payload: { url: 'https://example.com/approved' },
  });
  assert.equal(approvedOpen.ok, true);
  assert.deepEqual(openedUrls, ['https://example.com/approved']);

  showMessageBox = async () => ({ response: 0 });
  const deniedCopy = await invoke(event, {
    method: METHODS.UI_COPY_TEXT,
    payload: { text: 'denied' },
  });
  assert.equal(deniedCopy.ok, false);
  assert.equal(deniedCopy.error.code, ERROR_CODES.USER_DENIED);
  assert.deepEqual(copiedTexts, []);

  showMessageBox = async () => ({ response: 1 });
  const approvedCopy = await invoke(event, {
    method: METHODS.UI_COPY_TEXT,
    payload: { text: 'approved' },
  });
  assert.equal(approvedCopy.ok, true);
  assert.deepEqual(copiedTexts, ['approved']);

  const pendingEvent = registerGuest(902);
  let releasePrompt;
  showMessageBox = () =>
    new Promise((resolve) => {
      releasePrompt = resolve;
    });
  const pending = invoke(pendingEvent, {
    method: METHODS.UI_OPEN_EXTERNAL,
    payload: { url: 'https://example.com/pending' },
  });
  await new Promise((resolve) => setImmediate(resolve));

  const concurrent = await invoke(pendingEvent, {
    method: METHODS.UI_OPEN_EXTERNAL,
    payload: { url: 'https://example.com/concurrent' },
  });
  assert.equal(concurrent.ok, false);
  assert.equal(concurrent.error.code, ERROR_CODES.RATE_LIMITED);

  releasePrompt({ response: 0 });
  await pending;
  showMessageBox = async () => ({ response: 1 });
  const afterDenial = await invoke(pendingEvent, {
    method: METHODS.UI_OPEN_EXTERNAL,
    payload: { url: 'https://example.com/after-denial' },
  });
  assert.equal(afterDenial.ok, true);
  assert.deepEqual(openedUrls, [
    'https://example.com/approved',
    'https://example.com/after-denial',
  ]);

  const destroyedEvent = registerGuest(903);
  showMessageBox = () =>
    new Promise((resolve) => {
      releasePrompt = resolve;
    });
  const destroyedPending = invoke(destroyedEvent, {
    method: METHODS.UI_OPEN_EXTERNAL,
    payload: { url: 'https://example.com/destroyed' },
  });
  await new Promise((resolve) => setImmediate(resolve));
  destroyedEvent.destroy();
  releasePrompt({ response: 1 });

  const destroyedResult = await destroyedPending;
  assert.equal(destroyedResult.ok, false);
  assert.equal(destroyedResult.error.code, ERROR_CODES.UNAUTHORIZED);
  assert.deepEqual(openedUrls, [
    'https://example.com/approved',
    'https://example.com/after-denial',
  ]);
});
