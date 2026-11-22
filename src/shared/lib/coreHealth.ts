import log from 'electron-log';

import { store, subscribe } from 'lib/store';
import { callAPI } from 'lib/api';
import { coreInfoQuery, coreStuckAtom, blocksAtom } from 'lib/coreInfo';
import { settingsAtom } from 'lib/settings';
import { restartCore } from 'lib/core';
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

let lastBlocks: number | undefined;
let lastChangeAt = Date.now();
let lastRestartAt = 0;
let restartGap = restartGapMinutes;
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
    if (blocks !== lastBlocks) {
      if (lastBlocks !== undefined && blocks > lastBlocks) {
        restartGap = restartGapMinutes;
        lastRestartAt = 0;
      }
      lastBlocks = blocks;
      lastChangeAt = Date.now();
      if (store.get(coreStuckAtom)) {
        store.set(coreStuckAtom, null);
      }
    }
  });
  setInterval(check, checkSeconds * 1000);
}
