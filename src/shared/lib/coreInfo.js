import * as TYPE from 'consts/actionTypes';
import store, { observeStore } from 'store';
import { callAPI } from 'lib/api';
import { isCoreConnected, isLoggedIn } from 'selectors';
import { openModal, isModalOpen } from 'lib/ui';
import { updateSettings } from 'lib/settings';
import { bootstrap } from 'lib/bootstrap';
import { refreshUserStatus } from 'lib/user';
import LoginModal from 'components/LoginModal';
import NewUserModal from 'components/NewUserModal';

const incStep = 1000;
const maxTime = 10000;
let waitTime = 0;
let connected = false;
let timerId = null;

const getInfo = async () => {
  try {
    const systemInfo = await callAPI('system/get/info');
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
