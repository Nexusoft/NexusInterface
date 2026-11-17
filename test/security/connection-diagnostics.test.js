'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

require('@babel/register')({
  babelrc: false,
  configFile: false,
  extensions: ['.js', '.ts'],
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    '@babel/preset-typescript',
    '@babel/preset-react',
  ],
});

const {
  CORE_INFO_MAX_AGE_MS,
  getSyncState,
  isFreshCoreInfo,
} = require('../../src/shared/lib/coreHealth.ts');
const { createPeerRefresh } = require('../../src/App/Overview/peerRefresh.ts');

function fakeClock() {
  let now = 0;
  let nextId = 0;
  const timers = new Map();
  return {
    schedule(fn, delay) {
      const id = ++nextId;
      timers.set(id, { at: now + delay, fn });
      return id;
    },
    cancel(id) {
      timers.delete(id);
    },
    advance(ms) {
      const end = now + ms;
      while (true) {
        const next = [...timers.entries()]
          .filter(([, timer]) => timer.at <= end)
          .sort((a, b) => a[1].at - b[1].at)[0];
        if (!next) break;
        now = next[1].at;
        timers.delete(next[0]);
        next[1].fn();
      }
      now = end;
    },
  };
}

const flush = () => new Promise((resolve) => setImmediate(resolve));

test('Core health requires fresh data and an explicit synchronization state', () => {
  assert.equal(isFreshCoreInfo(0, 1000, false), false);
  assert.equal(isFreshCoreInfo(1000, 1000 + CORE_INFO_MAX_AGE_MS - 1, false), true);
  assert.equal(isFreshCoreInfo(1000, 1000 + CORE_INFO_MAX_AGE_MS, false), false);
  assert.equal(isFreshCoreInfo(1000, 999, false), false);
  assert.equal(isFreshCoreInfo(1000, 1001, true), false);
  assert.equal(isFreshCoreInfo(1000, 1001, false, 1000), false);
  assert.equal(isFreshCoreInfo(1001, 1001, false, 1000), true);
  assert.equal(getSyncState(undefined), 'unknown');
  assert.equal(getSyncState({}), 'unknown');
  assert.equal(getSyncState({ synchronized: true }), 'synchronized');
  assert.equal(getSyncState({ synchronizing: false }), 'synchronized');
  assert.equal(getSyncState({ syncing: false }), 'synchronized');
  assert.equal(getSyncState({ synchronizing: true }), 'synchronizing');
  assert.equal(getSyncState({ synchronized: true, syncing: {} }), 'synchronizing');
});

test('paused and failed Core queries cannot reuse or restore old information', async () => {
  const Module = require('node:module');
  const { atom, createStore } = require('jotai');
  const store = createStore();
  const resultAtom = atom({
    data: { synchronizing: false },
    dataUpdatedAt: 999,
    isError: false,
    isPlaceholderData: false,
  });
  let config;
  let resolveRequest;
  const originalLoad = Module._load;
  const originalNow = Date.now;
  const originalError = console.error;
  let now = 1000;
  Date.now = () => now;
  console.error = () => {};
  Module._load = function (request, parent, isMain) {
    if (request === 'lib/store') return { store };
    if (request === 'lib/api') return {
      callAPI: () => new Promise((resolve) => { resolveRequest = resolve; }),
    };
    if (request === 'lib/settings') return { settingAtoms: { manualDaemon: atom(false) } };
    if (request === 'utils/jotaiQuery') return (options) => {
      config = options.getQueryConfig(store.get);
      return {
        queryAtom: resultAtom,
        valueAtom: atom((get) => get(resultAtom).data),
      };
    };
    return originalLoad.call(this, request, parent, isMain);
  };
  try {
    const health = require('../../src/shared/lib/coreInfo');
    assert.equal(store.get(health.syncStateAtom), 'synchronized');
    const pending = config.queryFn();
    store.set(health.coreInfoPausedAtom, true);
    store.set(health.coreInfoPausedAtom, false);
    assert.equal(store.get(health.syncStateAtom), 'unknown');
    health.setCoreConnectionError('offline');
    resolveRequest({ synchronizing: false });
    await assert.rejects(pending, /superseded/);
    assert.equal(store.get(health.coreConnectionErrorAtom), 'offline');
    health.clearCoreConnectionError();
    assert.equal(store.get(health.syncStateAtom), 'unknown');
    now = 1001;
    store.set(resultAtom, {
      data: { synchronizing: false },
      dataUpdatedAt: now,
      isError: false,
      isPlaceholderData: false,
    });
    assert.equal(store.get(health.syncStateAtom), 'synchronized');
  } finally {
    Module._load = originalLoad;
    Date.now = originalNow;
    console.error = originalError;
  }
});

test('peer refresh observes equal-count replacements and clears errors on recovery', async () => {
  const clock = fakeClock();
  const snapshots = [
    [{ address: 'first' }],
    [{ address: 'second' }],
    new Error('peer list failed'),
    [{ address: 'third' }],
  ];
  const events = [];
  const refresh = createPeerRefresh({
    load: async () => {
      const next = snapshots.shift();
      if (next instanceof Error) throw next;
      return next;
    },
    onSuccess: (peers) => events.push(peers.map((peer) => peer.address)),
    onError: (error) => events.push(error.message),
    intervalMs: 10,
    timeoutMs: 8,
    schedule: clock.schedule,
    cancel: clock.cancel,
  });
  refresh.start();
  await flush();
  clock.advance(10);
  await flush();
  clock.advance(10);
  await flush();
  clock.advance(10);
  await flush();
  assert.deepEqual(events, [['first'], ['second'], 'peer list failed', ['third']]);
  refresh.stop();
  clock.advance(100);
  await flush();
  assert.equal(events.length, 4);
});

test('timed out peer requests retry independently and cannot publish stale results', async () => {
  const clock = fakeClock();
  const events = [];
  let resolveFirstRequest;
  let resolveStoppedRequest;
  let calls = 0;
  const refresh = createPeerRefresh({
    load: () => {
      calls++;
      if (calls === 1) {
        return new Promise((resolve) => { resolveFirstRequest = resolve; });
      }
      if (calls === 2) return Promise.resolve('recovered');
      return new Promise((resolve) => { resolveStoppedRequest = resolve; });
    },
    onSuccess: (value) => events.push(value),
    onError: (error) => events.push(error.message),
    intervalMs: 10,
    timeoutMs: 8,
    schedule: clock.schedule,
    cancel: clock.cancel,
  });
  refresh.start();
  clock.advance(8);
  assert.deepEqual(events, ['Peer list request timed out']);
  clock.advance(10);
  await flush();
  assert.equal(calls, 2);
  assert.deepEqual(events, ['Peer list request timed out', 'recovered']);
  resolveFirstRequest('stale');
  await flush();
  assert.deepEqual(events, ['Peer list request timed out', 'recovered']);
  clock.advance(10);
  assert.equal(calls, 3);
  refresh.stop();
  resolveStoppedRequest('after stop');
  await flush();
  clock.advance(100);
  assert.equal(calls, 3);
  assert.deepEqual(events, ['Peer list request timed out', 'recovered']);
});

test('globe and settings wire failure handling and remove the misleading action', () => {
  const root = path.resolve(__dirname, '../..');
  const globe = fs.readFileSync(path.join(root, 'src/App/Overview/Globe.js'), 'utf8');
  const settings = fs.readFileSync(path.join(root, 'src/App/Settings/Core/EmbeddedCoreSettings.tsx'), 'utf8');
  assert.match(globe, /onError:[\s\S]*this\.removeAllPoints\(\)[\s\S]*peerError/);
  assert.match(globe, /this\.peerRefresh\.stop\(\)/);
  assert.doesNotMatch(globe, /this\.props\.connections/);
  assert.doesNotMatch(settings, /clearPeerConnections|clearPeers|Clear peer connections/);
});

test('globe replaces same-count peer identities and removes failed locations', async () => {
  const Module = require('node:module');
  const originalLoad = Module._load;
  const oldContext = global.__context;
  const oldTranslation = global.__;
  const oldWindow = global.window;
  const clock = fakeClock();
  const snapshots = [
    [{ address: '1.1.1.1:1000', type: 'peer', outgoing: true }],
    [{ address: '2.2.2.2:1000', type: 'peer', outgoing: false }],
    new Error('peer list failed'),
  ];
  global.__context = () => (text) => text;
  global.__ = (text) => text;
  let nextId = 0;
  class Point {
    constructor(lat, lng, params) {
      this.lat = lat;
      this.lng = lng;
      this.params = params;
      this.pillar = {
        uuid: ++nextId,
        geometry: { dispose() {} },
        material: { dispose() {} },
      };
    }
  }
  Module._load = function (request, parent, isMain) {
    if (request === './Point') return Point;
    if (request === './Curve') return class Curve {};
    if (request === 'icons/world-light-white.jpg') return 'world';
    if (request === 'three/examples/jsm/controls/OrbitControls') return {};
    if (request === 'lib/api') return {
      async callAPI() {
        const next = snapshots.shift();
        if (next instanceof Error) throw next;
        return next;
      },
    };
    return originalLoad.call(this, request, parent, isMain);
  };
  let Globe;
  try {
    Globe = require('../../src/App/Overview/Globe').default;
  } finally {
    Module._load = originalLoad;
    global.__context = oldContext;
    global.__ = oldTranslation;
  }
  const oldSetTimeout = global.setTimeout;
  const oldClearTimeout = global.clearTimeout;
  global.setTimeout = clock.schedule;
  global.clearTimeout = clock.cancel;
  let globe;
  try {
    globe = new Globe();
  } finally {
    global.setTimeout = oldSetTimeout;
    global.clearTimeout = oldClearTimeout;
  }
  globe.props = { pillarColor: 'white', archColor: 'blue' };
  globe.allPoints = { add() {}, remove() {} };
  globe.arcRegister = () => {};
  globe.setState = (state) => { globe.state = { ...globe.state, ...state }; };
  const geoLocations = [
    { address: '1.1.1.1', latitude: 1, longitude: 1 },
    { address: '2.2.2.2', latitude: 2, longitude: 2 },
  ];
  global.window = { nexusElectron: { fileAssets: { lookupGeoIp: async () => geoLocations } } };
  const oldError = console.error;
  console.error = () => {};
  try {
    globe.peerRefresh.start();
    await flush();
    assert.equal(globe.pointRegistry[0].lat, 1);
    clock.advance(10_000);
    await flush();
    assert.equal(globe.pointRegistry.length, 1);
    assert.equal(globe.pointRegistry[0].lat, 2);
    assert.equal(globe.pointRegistry[0].params.outgoing, false);
    clock.advance(10_000);
    await flush();
    assert.equal(globe.pointRegistry.length, 0);
    assert.equal(globe.state.peerError, 'peer list failed');
  } finally {
    globe.peerRefresh.stop();
    global.window = oldWindow;
    console.error = oldError;
  }
});
