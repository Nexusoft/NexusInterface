import { createRef } from 'react';
import MigrateAccountModal from 'components/MigrateAccountModal';
import ExternalLink from 'components/ExternalLink';
import * as TYPE from 'consts/actionTypes';
import store, { observeStore } from 'store';
import { legacyMode } from 'consts/misc';
import { callApi } from 'lib/tritiumApi';
import rpc from 'lib/rpc';
import { openModal } from 'lib/ui';
import { confirm } from 'lib/dialog';
import { updateSettings } from 'lib/settings';
import { isLoggedIn } from 'selectors';
import listAll from 'utils/listAll';

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
    const stakeInfo = await callApi('finance/get/stakeinfo');
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
      const sessions = await callApi('sessions/list/local');
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

    const status = await callApi(
      'sessions/status/local',
      session ? { session } : undefined
    );

    const {
      user: { profileStatus },
    } = store.getState();

    if (!profileStatus) {
      const profileStatus = await callApi('profiles/status/master', {
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

export const refreshBalances = async () => {
  try {
    const balances = await callApi('finance/get/balances');
    store.dispatch({ type: TYPE.SET_BALANCES, payload: balances });
    return balances;
  } catch (err) {
    store.dispatch({ type: TYPE.CLEAR_BALANCES });
    console.error('finance/get/balances failed', err);
  }
};

export const logIn = async ({ username, password, pin }) => {
  // Stop refreshing user status
  refreshUserStatusLock = true;
  try {
    const { session, genesis } = await callApi('sessions/create/local', {
      username,
      password,
      pin,
    });

    const stakeInfo = await callApi('finance/get/stakeinfo', { session });
    await unlockUser({ pin, session, stakeInfo });
    const { status } = await setActiveUser({ session, genesis, stakeInfo });

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
          callApi('sessions/terminate/local', { session });
        }),
      ]);
    } else {
      await callApi('sessions/terminate/local');
    }
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
    callApi('sessions/status/local', { session }),
    callApi('profiles/status/master', { session, genesis }),
    systemInfo?.multiuser
      ? callApi('sessions/list/local')
      : Promise.resolve(null),
    stakeInfo
      ? Promise.resolve(null)
      : callApi('finance/get/stakeinfo', { session }),
  ]);

  const result = {
    session,
    sessions,
    status,
    stakeInfo: stakeInfo || newStakeInfo,
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

function processAccount(account) {
  if (account.name?.startsWith?.('local:')) {
    account.nameIsLocal = true;
    account.name = account.name.substring(6);
  }
  if (account.ticker?.startsWith?.('local:')) {
    account.tickerIsLocal = true;
    account.ticker = account.ticker.substring(6);
  }
}

export const loadAccounts = legacyMode
  ? // Legacy Mode
    async () => {
      const accList = await rpc('listaccounts', []);

      const addrList = await Promise.all(
        Object.keys(accList || {}).map((account) =>
          rpc('getaddressesbyaccount', [account])
        )
      );

      const validateAddressPromises = addrList.reduce(
        (list, element) => [
          ...list,
          ...element.map((address) => rpc('validateaddress', [address])),
        ],
        []
      );
      const validations = await Promise.all(validateAddressPromises);

      const accountList = [];
      validations.forEach((e) => {
        if (e.ismine && e.isvalid) {
          const index = accountList.findIndex(
            (ele) => ele.account === e.account
          );
          const indexDefault = accountList.findIndex(
            (ele) => ele.account === 'default'
          );

          if (e.account === '' || e.account === 'default') {
            if (index === -1 && indexDefault === -1) {
              accountList.push({
                account: 'default',
                addresses: [e.address],
              });
            } else {
              accountList[indexDefault].addresses.push(e.address);
            }
          } else {
            if (index === -1) {
              accountList.push({
                account: e.account,
                addresses: [e.address],
              });
            } else {
              accountList[index].addresses.push(e.address);
            }
          }
        }
      });

      accountList.forEach((acc) => {
        const accountName = acc.account || 'default';
        if (accountName === 'default') {
          acc.balance =
            accList['default'] !== undefined ? accList['default'] : accList[''];
        } else {
          acc.balance = accList[accountName];
        }
      });

      store.dispatch({ type: TYPE.MY_ACCOUNTS_LIST, payload: accountList });
    }
  : // Tritium Mode
    async () => {
      try {
        const accounts = await callApi('finance/list/any');
        accounts.forEach(processAccount);
        store.dispatch({
          type: TYPE.SET_TRITIUM_ACCOUNTS,
          payload: accounts,
        });
      } catch (err) {
        console.error('account listing failed', err);
      }
    };

export const updateAccountBalances = async () => {
  const accList = await rpc('listaccounts', []);
  store.dispatch({ type: TYPE.UPDATE_MY_ACCOUNTS, payload: accList });
};

export const loadNameRecords = async () => {
  try {
    const nameRecords = await listAll('names/list/names');
    store.dispatch({ type: TYPE.SET_NAME_RECORDS, payload: nameRecords });
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
    const assets = await listAll('assets/list/assets');
    store.dispatch({ type: TYPE.SET_ASSETS, payload: assets });
  } catch (err) {
    console.error('assets/list/assets failed', err);
  }
};

export function prepareUser() {
  if (!legacyMode) {
    observeStore(isLoggedIn, async (loggedIn) => {
      if (loggedIn) {
        const {
          settings: { migrateSuggestionDisabled },
          core: { systemInfo },
        } = store.getState();
        if (!migrateSuggestionDisabled && !systemInfo?.nolegacy) {
          const coreInfo = await rpc('getinfo', []);
          const legacyBalance = (coreInfo.balance || 0) + (coreInfo.stake || 0);
          if (legacyBalance) {
            openModal(MigrateAccountModal, { legacyBalance });
          }
        }
      }
    });
  }
}

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
  await callApi('sessions/unlock/local', {
    pin,
    notifications: true,
    staking: unlockStaking,
    mining: !!enableMining,
    // passing session through because it's not saved in the store yet
    // so it wouldn't be automatically passed in all API calls
    session,
  });
}
