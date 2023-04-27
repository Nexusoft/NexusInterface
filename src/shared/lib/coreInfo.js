import * as TYPE from 'consts/actionTypes';
import store, { observeStore } from 'store';
import rpc from 'lib/rpc';
import { callApi } from 'lib/tritiumApi';
import { isCoreConnected, isLoggedIn } from 'selectors';
import { loadAccounts } from 'lib/user';
import { showNotification, openModal, isModalOpen } from 'lib/ui';
import { updateSettings } from 'lib/settings';
import { bootstrap } from 'lib/bootstrap';
import { refreshUserStatus } from 'lib/user';
import { showDesktopNotif } from 'utils/misc';
import LoginModal from 'components/LoginModal';
import NewUserModal from 'components/NewUserModal';
import { legacyMode } from 'consts/misc';
import EncryptionWarningModal from 'components/EncryptionWarningModal';

const incStep = 1000;
const maxTime = 10000;
let waitTime = 0;
let connected = false;
let timerId = null;
let liteModeChecked = false;

const getInfo = legacyMode
  ? // Legacy
    async () => {
      try {
        const [info, tritiumInfo] = await Promise.all([
          rpc('getinfo', []),
          callApi('system/get/info'),
        ]);
        //Paul wants us to use the number of connections from API instead of RPC, but getinfo and get/info are not one to one.
        //This is a bit of a hack.
        info.connections = tritiumInfo.connections;

        store.dispatch({ type: TYPE.GET_INFO, payload: info });
      } catch (err) {
        store.dispatch({ type: TYPE.DISCONNECT_CORE });
        console.error(err);

        // Lite mode doesn't support RPC so might be the reason the RPC call failed
        if (!liteModeChecked) {
          try {
            liteModeChecked = true;
            const systemInfo = await callApi('system/get/info');
            if (systemInfo?.litemode) {
              updateSettings({ legacyMode: false });
              location.reload();
            }
          } catch (err) {}
        }

        // Throws error so getInfo fails and refreshCoreInfo will
        // switch to using dynamic interval.
        throw err;
      }
    }
  : // Tritium
    async () => {
      try {
        const systemInfo = await callApi('system/get/info');
        store.dispatch({ type: TYPE.SET_SYSTEM_INFO, payload: systemInfo });
      } catch (err) {
        store.dispatch({ type: TYPE.DISCONNECT_CORE });
        console.error('system/get/info failed', err);
        // Throws error so getInfo fails and refreshCoreInfo will
        // switch to using dynamic interval.
        throw err;
      }
    };

/**
 *
 *
 * @export
 */
export async function refreshCoreInfo() {
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
      timerId = setTimeout(refreshCoreInfo, waitTime);
    }
  }
}

export function stopFetchingCoreInfo() {
  clearTimeout(timerId);
}

export function prepareCoreInfo() {
  if (legacyMode) {
    observeStore(
      ({ core: { info } }) => info && info.locked,
      (locked) => {
        const state = store.getState();
        if (isCoreConnected(state) && locked === undefined) {
          if (
            !state.common.encryptionModalShown &&
            !state.settings.encryptionWarningDisabled &&
            state.settings.acceptedAgreement
          ) {
            openModal(EncryptionWarningModal);
            store.dispatch({
              type: TYPE.SHOW_ENCRYPTION_MODAL,
            });
          }
        }
      }
    );

    observeStore(isCoreConnected, (connected) => {
      if (connected) {
        loadAccounts();
      }
    });

    observeStore(
      ({ core: { info } }) => info && info.txtotal,
      async (newTotal, oldTotal) => {
        if (newTotal > oldTotal) {
          // TODO: Find a more efficient way than fetching ALL the transactions
          const txList = await rpc('listtransactions', []);
          if (txList) {
            // TODO: notify ALL new transactions, not just the newest
            const mostRecentTx = txList.reduce((a, b) =>
              a.time > b.time ? a : b
            );

            switch (mostRecentTx.category) {
              case 'receive':
                showDesktopNotif('Received', mostRecentTx.amount + ' NXS');
                showNotification(__('Transaction received'), 'success');
                break;
              case 'send':
                showDesktopNotif('Sent', mostRecentTx.amount + ' NXS');
                showNotification(__('Transaction sent'), 'success');
                break;
              case 'genesis':
                showDesktopNotif('Genesis', mostRecentTx.amount + ' NXS');
                showNotification(__('Genesis transaction'), 'success');
                break;
              case 'trust':
                showDesktopNotif('Trust', mostRecentTx.amount + ' NXS');
                showNotification(__('Trust transaction'), 'success');
                break;
            }
          }
        }
      }
    );

    observeStore(
      ({ core: { info } }) => info,
      (info) => {
        const state = store.getState();
        if (
          !state.settings.bootstrapSuggestionDisabled &&
          isCoreConnected(state) &&
          state.bootstrap.step === 'idle' &&
          !state.settings.manualDaemon &&
          info.synccomplete < 50 &&
          info.synccomplete >= 0
        ) {
          bootstrap({ suggesting: true });
        }
      }
    );

    observeStore(
      ({ core: { info } }) => info && info.blocks,
      (blocks) => {
        if (blocks) {
          store.dispatch({
            type: TYPE.UPDATE_BLOCK_DATE,
            payload: new Date(),
          });
        }
      }
    );
  } else {
    // Tritium mode
    let justConnected = false;
    observeStore(
      ({ core: { systemInfo } }) => systemInfo,
      async () => {
        if (isCoreConnected(store.getState())) {
          await refreshUserStatus();
          const state = store.getState();
          // The wallet will have to refresh after language is chosen
          // So NewUser modal won't be visible now
          if (justConnected && state.settings.locale) {
            justConnected = false;
            if (
              !isLoggedIn(state) &&
              !isModalOpen(LoginModal) &&
              !isModalOpen(NewUserModal)
            ) {
              if (state.settings.firstCreateNewUserShown) {
                openModal(LoginModal);
              } else {
                openModal(NewUserModal);
                updateSettings({ firstCreateNewUserShown: true });
              }
            }
          }
        }
      }
    );
    observeStore(isCoreConnected, (coreConnected) => {
      if (coreConnected) {
        justConnected = true;
      }
    });

    observeStore(
      ({ core: { systemInfo } }) => systemInfo,
      (systemInfo) => {
        const state = store.getState();
        if (
          !state.settings.bootstrapSuggestionDisabled &&
          isCoreConnected(state) &&
          !state.core.systemInfo?.litemode &&
          state.bootstrap.step === 'idle' &&
          !state.settings.manualDaemon &&
          systemInfo?.synccomplete < 50 &&
          systemInfo?.synccomplete >= 0 &&
          !systemInfo?.private &&
          !systemInfo?.testnet
        ) {
          bootstrap({ suggesting: true });
        }
      }
    );

    observeStore(
      ({ core: { systemInfo } }) => systemInfo?.blocks,
      (blocks) => {
        if (blocks) {
          store.dispatch({
            type: TYPE.UPDATE_BLOCK_DATE,
            payload: new Date(),
          });
        }
      }
    );
  }

  // All modes
  refreshCoreInfo();
  observeStore(
    (state) => state.core.autoConnect,
    (autoConnect) => {
      if (autoConnect) refreshCoreInfo();
      else stopFetchingCoreInfo();
    }
  );
}
