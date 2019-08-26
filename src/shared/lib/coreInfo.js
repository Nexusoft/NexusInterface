import store, { observeStore } from 'store';
import rpc from 'lib/rpc';
import { isCoreConnected } from 'selectors';
import { loadMyAccounts } from 'actions/account';
import { showNotification } from 'actions/overlays';
import { bootstrap } from 'actions/bootstrap';
import { updateBlockDate } from 'actions/setupApp';
import { getInfo } from 'actions/core';
import showDesktopNotif from 'utils/showDesktopNotif';
import { showEncryptionWarningModal } from 'actions/setupApp';

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
      if (isCoreConnected(store.getState()) && locked === undefined) {
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
              showNotification(__('Transaction received'), 'success')
            );
            break;
          case 'send':
            showDesktopNotif('Sent', mostRecentTx.amount + ' NXS');
            store.dispatch(showNotification(__('Transaction sent'), 'success'));
            break;
          case 'genesis':
            showDesktopNotif('Genesis', mostRecentTx.amount + ' NXS');
            store.dispatch(
              showNotification(__('Genesis transaction'), 'success')
            );
            break;
          case 'trust':
            showDesktopNotif('Trust', mostRecentTx.amount + ' NXS');
            store.dispatch(
              showNotification(__('Trust transaction'), 'success')
            );
            break;
        }
      }
    },
    (oldTotal, newTotal) => newTotal > oldTotal
  );

  observeStore(
    ({ core: { info } }) => info,
    info => {
      const state = store.getState();
      if (
        !state.settings.bootstrapSuggestionDisabled &&
        isCoreConnected(state) &&
        state.bootstrap.step === 'idle' &&
        !state.settings.manualDaemon &&
        info.synccomplete < 50 &&
        info.synccomplete >= 0
      ) {
        store.dispatch(bootstrap({ suggesting: true }));
      }
    }
  );

  observeStore(
    ({ core: { info } }) => info && info.blocks,
    blocks => {
      if (blocks) {
        store.dispatch(updateBlockDate(new Date()));
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
