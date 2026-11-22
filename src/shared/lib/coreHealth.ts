import { ipcRenderer } from 'electron';
import log from 'electron-log';

import { store, subscribe } from 'lib/store';
import { callAPI } from 'lib/api';
import {
  coreInfoQuery,
  coreStuckAtom,
  blocksAtom,
  coreInfoPausedAtom,
} from 'lib/coreInfo';
import { settingsAtom } from 'lib/settings';
import { restartCore, startCore } from 'lib/core';
import { showNotification } from 'lib/ui';

__ = __context('CoreHealth');

//5.1.6 can stop taking blocks while it still says synchronized, a core restart fixes it
//slow PCs and bad connections lag behind for minutes, so only a long stall counts
const stuckMinutes = 15;
const stuckBehindBlocks = 10;
const checkSeconds = 30;
//doubles after each restart that did not help, back to the first gap once blocks move
const restartGapMinutes = 30;
const maxRestartGapMinutes = 240;

//highest block seen, a lower height while the core reloads is not progress
let bestBlocks: number | undefined;
let lastChangeAt = Date.now();
//a long gap between checks = the PC slept, that time is not a stuck core
let lastCheckAt = Date.now();
const sleepGapMs = 3 * checkSeconds * 1000;
let lastRestartAt = 0;
let restartGap = restartGapMinutes;
let checking = false;
const restartTimes: number[] = [];
//the wallet's own core is gone and nobody stopped it (crash, or an old core exiting after an update)
const deadChecks = 2;
let deadCount = 0;
let startingDead = false;

/** When the core last got a new block */
export const lastBlockAt = () => lastChangeAt;

/** Core restarts by the wallet in the last 24 h */
export function restartsToday() {
  const since = Date.now() - 86400000;
  while (restartTimes.length && restartTimes[0] < since) restartTimes.shift();
  return restartTimes.length;
}

async function startDeadCore() {
  if (startingDead) return;
  const { manualDaemon } = store.get(settingsAtom);
  if (
    manualDaemon ||
    store.get(coreInfoPausedAtom) ||
    store.get(coreInfoQuery.valueAtom) ||
    Date.now() - lastRestartAt < 120000
  ) {
    deadCount = 0;
    return;
  }
  if (await ipcRenderer.invoke('check-core-running')) {
    deadCount = 0;
    return;
  }
  if (++deadCount < deadChecks) return;
  deadCount = 0;
  log.warn('CoreHealth - core process is not running, starting it');
  restartTimes.push(Date.now());
  startingDead = true;
  try {
    await startCore();
  } finally {
    startingDead = false;
  }
}

async function check() {
  const now = Date.now();
  if (now - lastCheckAt > sleepGapMs) {
    lastChangeAt = now;
    log.info('CoreHealth - woke from sleep, waiting for the core to catch up');
  }
  lastCheckAt = now;
  if (checking) return;
  checking = true;
  try {
    const info = store.get(coreInfoQuery.valueAtom);
    if (!info || info.syncing || info.private) {
      store.set(coreStuckAtom, null);
      return;
    }
    if (Date.now() - lastChangeAt < stuckMinutes * 60000) {
      store.set(coreStuckAtom, null);
      return;
    }
    //most peers answer height 0; take the second best so one odd peer cannot trigger a restart
    const peers = await callAPI('system/list/peers').catch(() => []);
    const heights = (Array.isArray(peers) ? peers : [])
      .map((p) => Number(p?.height) || 0)
      .filter((h) => h > 0)
      .sort((a, b) => b - a);
    const network = heights.length >= 2 ? heights[1] : 0;
    if (network - info.blocks < stuckBehindBlocks) {
      store.set(coreStuckAtom, null);
      return;
    }
    const stuck = { blocks: info.blocks, network, since: lastChangeAt };
    const was = store.get(coreStuckAtom);
    store.set(coreStuckAtom, stuck);
    if (!was) {
      log.warn(
        `CoreHealth - core stuck at ${info.blocks}, peers at ${network}, no block for ${Math.round(
          (Date.now() - lastChangeAt) / 60000
        )} min`
      );
    }

    const { manualDaemon } = store.get(settingsAtom);
    if (manualDaemon || Date.now() - lastRestartAt < restartGap * 60000) {
      return;
    }
    if (lastRestartAt) {
      restartGap = Math.min(restartGap * 2, maxRestartGapMinutes);
    }
    lastRestartAt = Date.now();
    restartTimes.push(lastRestartAt);
    log.warn(
      `CoreHealth - restarting the core, next one not before ${restartGap} min`
    );
    showNotification(
      __(
        'Nexus Core stopped at block %{blocks} while the network is at %{network}. Restarting the core...',
        { blocks: info.blocks, network }
      ),
      'work'
    );
    await restartCore();
  } catch (err) {
    log.error('CoreHealth - check failed', err);
  } finally {
    checking = false;
  }
}

/** Restarts the core once it stays stuck, at most once every 30 min */
export async function restartStuckCore() {
  lastRestartAt = Date.now();
  log.warn('CoreHealth - restart asked by the user');
  await restartCore();
}

export function prepareCoreHealth() {
  subscribe(blocksAtom, (blocks) => {
    //no answer from the core (restart, busy) is not a new block
    if (typeof blocks !== 'number') return;
    if (bestBlocks === undefined || blocks > bestBlocks) {
      if (bestBlocks !== undefined) {
        restartGap = restartGapMinutes;
        lastRestartAt = 0;
      }
      bestBlocks = blocks;
      lastChangeAt = Date.now();
      if (store.get(coreStuckAtom)) {
        store.set(coreStuckAtom, null);
      }
    }
  });
  setInterval(check, checkSeconds * 1000);
  setInterval(
    () =>
      startDeadCore().catch((err) =>
        log.error('CoreHealth - start of the stopped core failed', err)
      ),
    checkSeconds * 1000
  );
}
