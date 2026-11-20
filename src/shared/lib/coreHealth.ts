import log from 'electron-log';

import { store, subscribe } from 'lib/store';
import { callAPI } from 'lib/api';
import { coreInfoQuery, coreStuckAtom, blocksAtom } from 'lib/coreInfo';
import { settingsAtom } from 'lib/settings';
import { restartCore } from 'lib/core';
import { showNotification } from 'lib/ui';

__ = __context('CoreHealth');

//5.1.6 can stop taking blocks while it still says synchronized, a core restart fixes it
const stuckMinutes = 6;
const stuckBehindBlocks = 5;
const checkSeconds = 30;
const restartGapMinutes = 30;

let lastBlocks: number | undefined;
let lastChangeAt = Date.now();
let lastRestartAt = 0;
let checking = false;

async function check() {
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
    //most peers answer height 0, the best one shows the network tip
    const peers = await callAPI('system/list/peers').catch(() => []);
    const network = Math.max(
      0,
      ...(Array.isArray(peers) ? peers : []).map((p) => Number(p?.height) || 0)
    );
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
    if (
      manualDaemon ||
      Date.now() - lastRestartAt < restartGapMinutes * 60000
    ) {
      return;
    }
    lastRestartAt = Date.now();
    log.warn('CoreHealth - restarting the core');
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
    if (blocks !== lastBlocks) {
      lastBlocks = blocks;
      lastChangeAt = Date.now();
      if (store.get(coreStuckAtom)) {
        store.set(coreStuckAtom, null);
      }
    }
  });
  setInterval(check, checkSeconds * 1000);
}
