import React from 'react';

import store, { observeStore } from 'store';
import rpc from 'lib/rpc';
import { isCoreConnected } from 'selectors';
import { loadMyAccounts } from 'actions/account';
import { showNotification } from 'actions/overlays';
import { bootstrap } from 'actions/bootstrap';
import { checkFreeSpaceForBootstrap } from 'lib/bootstrap';
import { getInfo } from 'actions/core';
import showDesktopNotif from 'utils/showDesktopNotif';
import {
  showEncryptionWarningModal,
  SetHighestPeerBlock,
  BlockDate,
} from 'actions/setupApp';

const incStep = 1000;
const maxTime = 10000;
let waitTime = 0;
let connected = false;
let timerId = null;

/**
 *
 *
 * @export
 */
export async function autoFetchCoreInfo() {
  try {
    // Clear timeout in case this function is called again when
    // the autoFetching is already running
    clearTimeout(timerId);
    await store.dispatch(getInfo());
    connected = true;
    waitTime = maxTime;
  } catch (err) {
    if (connected) waitTime = incStep;
    else if (waitTime < maxTime) waitTime += incStep;
    else waitTime = maxTime;
    connected = false;
  } finally {
    const {
      core: { autoConnect },
    } = store.getState();
    if (autoConnect) {
      timerId = setTimeout(autoFetchCoreInfo, waitTime);
    }
  }
}

export function stopFetchingCoreInfo() {
  clearTimeout(timerId);
}

/**
 *
 *
 * @export
 */
export function initializeCoreInfo() {
  observeStore(
    ({ core: { info } }) => info && info.locked,
    locked => {
      if (store.getState().core.info && locked === undefined) {
        store.dispatch(showEncryptionWarningModal());
      }
    }
  );

  observeStore(isCoreConnected, connected => {
    if (connected) {
      store.dispatch(loadMyAccounts());
    }
  });

  observeStore(
    ({ core: { info } }) => info && info.txtotal,
    async () => {
      // TODO: Find a more efficient way than fetching ALL the transactions
      const txList = await rpc('listtransactions', []);
      if (txList) {
        // TODO: notify ALL new transactions, not just the newest
        const mostRecentTx = txList.reduce((a, b) => (a.time > b.time ? a : b));

        switch (mostRecentTx.category) {
          case 'receive':
            showDesktopNotif('Received', mostRecentTx.amount + ' NXS');
            store.dispatch(
              showNotification(<Text id="Alert.Received" />, 'success')
            );
            break;
          case 'send':
            showDesktopNotif('Sent', mostRecentTx.amount + ' NXS');
            store.dispatch(
              showNotification(<Text id="Alert.Sent" />, 'success')
            );
            break;
          case 'genesis':
            showDesktopNotif('Genesis', mostRecentTx.amount + ' NXS');
            store.dispatch(
              showNotification(<Text id="Alert.Genesis" />, 'success')
            );
            break;
          case 'trust':
            showDesktopNotif('Trust', mostRecentTx.amount + ' NXS');
            store.dispatch(
              showNotification(<Text id="Alert.TrustTransaction" />, 'success')
            );
            break;
        }
      }
    },
    (oldTotal, newTotal) => newTotal > oldTotal
  );

  observeStore(
    ({ core: { info } }) => info && info.blocks,
    async blocks => {
      const state = store.getState();

      if (blocks) {
        store.dispatch(BlockDate(new Date()));

        // TODO: Legacy method, should drop support in a few versions
        const peerresponse = await rpc('getpeerinfo', []);
        if (peerresponse) {
          const highestPeerBlock = peerresponse.reduce(
            (highest, element) =>
              element.height >= highest ? element.height : highest,
            0
          );
          store.dispatch(SetHighestPeerBlock(highestPeerBlock));

          const {
            settings: { manualDaemon, bootstrapSuggestionDisabled },
          } = state;
          // 172800 = (100 * 24 * 60 * 60) / 50
          // which is the approximate number of blocks produced in 100 days
          const isFarBehind = highestPeerBlock - blocks > 172800;
          if (
            isFarBehind &&
            !bootstrapSuggestionDisabled &&
            !manualDaemon &&
            isCoreConnected(state)
          ) {
            store.dispatch(bootstrap({ suggesting: true }));
          }
        }
      }
    }
  );

  autoFetchCoreInfo();

  observeStore(
    state => state.core.autoConnect,
    autoConnect => {
      if (autoConnect) autoFetchCoreInfo();
      else stopFetchingCoreInfo();
    }
  );
}
