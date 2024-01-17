import { createRef, useRef, useEffect } from 'react';
import ExternalLink from 'components/ExternalLink';
import BackgroundTask from 'components/BackgroundTask';
import * as TYPE from 'consts/actionTypes';
import store, { observeStore } from 'store';
import { callAPI as callAPI } from 'lib/api';
import { showBackgroundTask, showNotification } from 'lib/ui';
import { confirm } from 'lib/dialog';
import { updateSettings } from 'lib/settings';
import listAll from 'utils/listAll';
import sleep from 'utils/promisified/sleep';
import GA from './googleAnalytics';

__ = __context('User');

export const selectActiveSession = ({ user: { session }, sessions }) => {
  if (session) return session;
  if (!sessions) return undefined;
  const sessionList = Object.values(sessions);
  if (!sessionList.length) return undefined;

  // Active session is defaulted to the last accessed session
  let lastAccessed = sessionList.reduce(
    (las, s) => (!las || s.accessed > las.accessed ? s : las),
    undefined
  );
  return lastAccessed?.session || undefined;
};

export const selectUsername = (state) => {
  const {
    user: { status, profileStatus },
    sessions,
  } = state;
  const session = selectActiveSession(state);

  return (
    profileStatus?.session?.username ||
    status?.username ||
    (session && sessions?.[session]?.username) ||
    ''
  );
};

export const refreshStakeInfo = async () => {
  try {
    const stakeInfo = await callAPI('finance/get/stakeinfo');
    store.dispatch({ type: TYPE.SET_STAKE_INFO, payload: stakeInfo });
    return stakeInfo;
  } catch (err) {
    store.dispatch({ type: TYPE.CLEAR_STAKE_INFO });
    console.error('finance/get/stakeinfo failed', err);
  }
};

// Don't refresh user status while login process is not yet done
let refreshUserStatusLock = false;
export async function refreshUserStatus() {
  if (refreshUserStatusLock) return;

  // If in multiuser mode, fetch the list of logged in sessions first
  const {
    core: { systemInfo },
  } = store.getState();
  if (systemInfo?.multiuser) {
    try {
      const sessions = await callAPI('sessions/list/local');
      store.dispatch({
        type: TYPE.SET_SESSIONS,
        payload: sessions,
      });
    } catch (err) {
      store.dispatch({ type: TYPE.CLEAR_SESSIONS });
    }
  }

  // Get the active user status
  try {
    const session = selectActiveSession(store.getState());
    if (systemInfo?.multiuser && !session) {
      store.dispatch({ type: TYPE.CLEAR_USER });
      return;
    }

    const status = await callAPI(
      'sessions/status/local',
      session ? { session } : undefined
    );

    if (store.getState().user.profileStatus?.genesis !== status.genesis) {
      const profileStatus = await callAPI('profiles/status/master', {
        genesis: status.genesis,
        session,
      });
      store.dispatch({
        type: TYPE.SET_PROFILE_STATUS,
        payload: profileStatus,
      });
    }
    store.dispatch({ type: TYPE.SET_USER_STATUS, payload: status });

    refreshStakeInfo();
    return status;
  } catch (err) {
    store.dispatch({ type: TYPE.CLEAR_USER });
    // Don't log error if it's 'Session not found' (user not logged in)
    if (err?.code !== -11) {
      console.error('Failed to get user status', err);
    }
  }
}

export const refreshProfileStatus = async () => {
  try {
    const profileStatus = await callAPI('profiles/status/master');
    store.dispatch({ type: TYPE.SET_PROFILE_STATUS, payload: profileStatus });
    return profileStatus;
  } catch (err) {
    console.error('profiles/status/master failed', err);
  }
};

export const refreshBalances = async () => {
  try {
    const balances = await callAPI('finance/get/balances');
    store.dispatch({ type: TYPE.SET_BALANCES, payload: balances });
    return balances;
  } catch (err) {
    console.error('finance/get/balances failed', err);
  }
};

export const logIn = async ({ username, password, pin }) => {
  // Stop refreshing user status
  refreshUserStatusLock = true;
  await sleep(500); // Let the core cycle, Possible delete this
  try {
    const { session, genesis } = await callAPI('sessions/create/local', {
      username,
      password,
      pin,
    });

    let stakeInfo = null;
    try {
      stakeInfo = await callAPI('finance/get/stakeinfo', { session });
    } catch (err) {
      if (err.code !== -70) {
        // Only ignore 'Trust account not found' error
        throw err;
      }
    }
    await unlockUser({ pin, session, stakeInfo });
    const { status } = await setActiveUser({ session, genesis, stakeInfo });

    GA.LogIn();
    return { username, session, status, stakeInfo };
  } finally {
    // Release the lock
    refreshUserStatusLock = false;
  }
};

export const logOut = async () => {
  // Stop refreshing user status
  refreshUserStatusLock = true;
  try {
    const {
      sessions,
      core: { systemInfo },
    } = store.getState();
    store.dispatch({
      type: TYPE.LOGOUT,
    });
    if (systemInfo?.multiuser) {
      await Promise.all([
        Object.keys(sessions).map((session) => {
          callAPI('sessions/terminate/local', { session });
        }),
      ]);
    } else {
      await callAPI('sessions/terminate/local');
    }
    GA.LogOut();
  } finally {
    // Release the lock
    refreshUserStatusLock = false;
  }
};

export async function setActiveUser({ session, genesis, stakeInfo }) {
  const {
    core: { systemInfo },
  } = store.getState();

  const [status, profileStatus, sessions, newStakeInfo] = await Promise.all([
    callAPI('sessions/status/local', { session }),
    callAPI('profiles/status/master', { session, genesis }),
    systemInfo?.multiuser
      ? callAPI('sessions/list/local')
      : Promise.resolve(null),
    stakeInfo
      ? Promise.resolve(null)
      : callAPI('finance/get/stakeinfo', { session }).catch((err) => {
          if (err.code !== -70) {
            // Only ignore 'Trust account not found' error
            throw err;
          }
        }),
  ]);

  const result = {
    session,
    sessions,
    status,
    stakeInfo: stakeInfo || newStakeInfo || null,
    profileStatus,
  };
  store.dispatch({
    type: TYPE.ACTIVE_USER,
    payload: result,
  });
  return result;
}

function processToken(token) {
  if (token.ticker?.startsWith?.('local:')) {
    token.tickerIsLocal = true;
    token.ticker = token.ticker.substring(6);
  }
}

export const loadOwnedTokens = async () => {
  try {
    const tokens = await listAll('finance/list/tokens');
    tokens.forEach(processToken);
    store.dispatch({
      type: TYPE.SET_USER_OWNED_TOKENS,
      payload: tokens,
    });
  } catch (err) {
    console.error('finance/list/tokens failed', err);
  }
};

// function processAccount(account) {
//   if (account.name?.startsWith?.('local:')) {
//     account.nameIsLocal = true;
//     account.name = account.name.substring(6);
//   }
//   if (account.name?.startsWith?.('user:')) {
//     account.nameIsLocal = true;
//     account.name = account.name.substring(5);
//   }
//   if (account.ticker?.startsWith?.('local:')) {
//     account.tickerIsLocal = true;
//     account.ticker = account.ticker.substring(6);
//   }
// }

export const loadAccounts = async () => {
  try {
    const accounts = await callAPI('finance/list/any');
    // accounts.forEach(processAccount);
    store.dispatch({
      type: TYPE.SET_TRITIUM_ACCOUNTS,
      payload: accounts,
    });
  } catch (err) {
    console.error('account listing failed', err);
  }
};

export const loadNameRecords = async () => {
  try {
    const nameRecords = await listAll('names/list/names');
    const unusedRecords = await listAll('names/list/inactive');
    store.dispatch({
      type: TYPE.SET_NAME_RECORDS,
      payload: [...nameRecords, ...unusedRecords],
    });
  } catch (err) {
    console.error('names/list/names failed', err);
  }
};

export const loadNamespaces = async () => {
  try {
    const namespaces = await listAll('names/list/namespaces');
    store.dispatch({ type: TYPE.SET_NAMESPACES, payload: namespaces });
  } catch (err) {
    console.error('names/list/namespaces failed', err);
  }
};

export const loadAssets = async () => {
  try {
    let [assets] = await Promise.all([listAll('assets/list/assets')]);
    //TODO: Partial returns an error instead of a empty array if there are no assets found which is not the best way to do that, consider revising
    let partialAssets = [];
    try {
      partialAssets = await listAll('assets/list/partial');
    } catch (error) {
      if (error.code && error.code === -74) {
      } else throw error;
    }
    store.dispatch({
      type: TYPE.SET_ASSETS,
      payload: assets.concat(partialAssets),
    });
  } catch (err) {
    console.error('assets/list/assets failed', err);
  }
};

async function shouldUnlockStaking(stakeInfo) {
  const {
    settings: { enableStaking, dontAskToStartStaking },
    core: { systemInfo },
    user: { startStakingAsked },
  } = store.getState();

  if (systemInfo?.litemode || systemInfo?.multiuser || !enableStaking) {
    return false;
  }

  if (!stakeInfo?.new) {
    return true;
  }

  if (
    stakeInfo?.new &&
    stakeInfo?.balance &&
    !startStakingAsked &&
    !dontAskToStartStaking
  ) {
    let checkboxRef = createRef();
    const accepted = await confirm({
      question: __('Start staking?'),
      note: (
        <div style={{ textAlign: 'left' }}>
          <p>
            {__(
              'You have %{amount} NXS in your trust account and can start staking now.',
              {
                amount: stakeInfo.balance,
              }
            )}
          </p>
          <p>
            {__(
              'However, keep in mind that if you start staking, your stake amount will be locked, and the smaller the amount is, the longer it would likely take to unlock it.'
            )}
          </p>
          <p>
            {__(
              'To learn more about staking, visit <link>crypto.nexus.io/stake</link>.',
              null,
              {
                link: () => (
                  <ExternalLink href="https://crypto.nexus.io/staking-guide">
                    crypto.nexus.io/staking-guide
                  </ExternalLink>
                ),
              }
            )}
          </p>
          <div className="mt3">
            <label>
              <input type="checkbox" ref={checkboxRef} />{' '}
              {__("Don't show this again")}
            </label>
          </div>
        </div>
      ),
      labelYes: __('Start staking'),
      labelNo: __("Don't stake"),
    });
    store.dispatch({
      type: TYPE.ASK_START_STAKING,
    });
    if (checkboxRef.current?.checked) {
      updateSettings({ dontAskToStartStaking: true });
    }
    if (accepted) {
      return true;
    }
  }

  return false;
}

async function unlockUser({ pin, session, stakeInfo }) {
  const unlockStaking = await shouldUnlockStaking(stakeInfo);
  const {
    settings: { enableMining },
  } = store.getState();
  try {
    await callAPI('sessions/unlock/local', {
      pin,
      notifications: true,
      staking: unlockStaking,
      mining: !!enableMining,
      // passing session through because it's not saved in the store yet
      // so it wouldn't be automatically passed in all API calls
      session,
    });
  } catch (error) {
    if (error.code && error.code === -139) {
      showBackgroundTask(UserUnLockIndexingBackgroundTask, {
        pin,
        notifications: true,
        staking: unlockStaking,
        mining: !!enableMining,
        session,
      });
    } else throw error;
  }
}

function UserUnLockIndexingBackgroundTask({
  pin,
  notifications,
  staking,
  mining,
  session,
}) {
  const closeTaskRef = useRef();
  useEffect(
    () =>
      observeStore(
        ({ user: { status } }) => status?.indexing,
        async (isIndexing) => {
          if (!isIndexing) {
            try {
              await callAPI('sessions/unlock/local', {
                pin,
                notifications,
                staking,
                mining,
                session,
              });
            } catch (error) {
              showNotification(__('User Failed to Unlock'), 'error');
            }
            closeTaskRef.current?.();
            showNotification(__('User Unlocked'), 'success');
          }
        }
      ),
    []
  );

  return (
    <BackgroundTask
      assignClose={(close) => (closeTaskRef.current = close)}
      onClick={null}
      style={{ cursor: 'default' }}
    >
      {__('Indexing User...')}
    </BackgroundTask>
  );
}
