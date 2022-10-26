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

export const selectUsername = ({
  user: { status, session },
  sessions,
  usernameByGenesis,
}) =>
  status?.username ||
  usernameByGenesis[status?.genesis] ||
  (session && sessions[session]?.username) ||
  '';

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
export const refreshUserStatus = async () => {
  try {
    const {
      user: { session },
      core: { systemInfo },
    } = store.getState();
    if (!refreshUserStatusLock && (!systemInfo?.multiuser || session)) {
      const status = await callApi('sessions/status/local');
      store.dispatch({ type: TYPE.SET_USER_STATUS, payload: status });
      return status;
    }
  } catch (err) {
    console.error(err);
    store.dispatch({ type: TYPE.CLEAR_USER });
  }
};

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
  const result = await callApi('sessions/create/local', {
    username,
    password,
    pin,
  });
  // Stop refreshing user status
  refreshUserStatusLock = true;
  try {
    const { session, genesis } = result;
    //TODO: Remove.
    //Currently there is a race condtition that prevents the user from unlocking, just wait 8 seconds and it will be ready.
    //This is a core bug so should be fixed soon.
    await new Promise((resolve) => setTimeout(resolve, 8000));
    let [status, stakeInfo] = await Promise.all([
      callApi('sessions/status/local', { session }),
      callApi('finance/get/stakeinfo', { session }),
    ]);
    store.dispatch({
      type: TYPE.LOGIN,
      payload: { username, session, status, stakeInfo },
    });
    const unlockStaking = await shouldUnlockStaking({ stakeInfo, status });
    await unlockUser({
      pin,
      staking: unlockStaking,
    });
    if (unlockStaking) {
      status = await callApi('sessions/status/local', { session });
    }

    store.dispatch({
      type: TYPE.LOGIN,
      payload: { username, session, status, stakeInfo, genesis },
    });
    return { username, session, status, stakeInfo };
  } finally {
    // Release the lock
    refreshUserStatusLock = false;
  }
};

export const logOut = async ({ pin }) => {
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
};

export const unlockUser = async ({ pin, mining, staking, notifications }) => {
  const {
    settings: { enableMining },
    user: { status },
  } = store.getState();
  return await callApi('sessions/unlock/local', {
    pin,
    notifications:
      notifications !== undefined
        ? notifications
        : status?.unlocked?.notifications === true
        ? false
        : true,
    mining: mining !== undefined ? mining : !!enableMining,
    staking: staking !== undefined ? staking : false,
  });
};

export const switchUser = async (session) => {
  const status = await callApi('sessions/status/local', { session });
  store.dispatch({ type: TYPE.SWITCH_USER, payload: { session, status } });
};

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
        const accounts = await callApi('finance/list/account');
        accounts.forEach(processAccount);
        store.dispatch({ type: TYPE.SET_TRITIUM_ACCOUNTS, payload: accounts });
      } catch (err) {
        console.error('finance/list/account failed', err);
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

    observeStore(
      (state) => state.user.status,
      (userStatus) => {
        const {
          core: { systemInfo },
        } = store.getState();
        if (userStatus && !systemInfo.private) {
          refreshStakeInfo();
        }
      }
    );
  }
}

async function shouldUnlockStaking({ stakeInfo, status }) {
  const {
    settings: { enableStaking, dontAskToStartStaking },
    core: { systemInfo },
    user: { startStakingAsked },
  } = store.getState();

  if (
    !systemInfo?.litemode &&
    status?.unlocked.staking === false &&
    enableStaking
  ) {
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
  }

  return false;
}
