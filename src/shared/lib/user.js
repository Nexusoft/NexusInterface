import * as TYPE from 'consts/actionTypes';
import store from 'store';
import { apiPost } from 'lib/tritiumApi';
import rpc from 'lib/rpc';
import { legacyMode } from 'consts/misc';

const getStakeInfo = async () => {
  try {
    const stakeInfo = await apiPost('finance/get/stakeinfo');
    store.dispatch({ type: TYPE.SET_STAKE_INFO, payload: stakeInfo });
  } catch (err) {
    store.dispatch({ type: TYPE.CLEAR_STAKE_INFO });
    console.error('finance/get/stakeinfo failed', err);
  }
};

export const getUserStatus = async () => {
  try {
    const userStatus = await apiPost('users/get/status');
    store.dispatch({ type: TYPE.SET_USER_STATUS, payload: userStatus });
    getStakeInfo();
  } catch (err) {
    store.dispatch({ type: TYPE.CLEAR_USER_STATUS });
  }
};

export const getBalances = async () => {
  try {
    const balances = await apiPost('finance/get/balances');
    store.dispatch({ type: TYPE.SET_BALANCES, payload: balances });
  } catch (err) {
    store.dispatch({ type: TYPE.CLEAR_BALANCES });
    console.error('finance/get/balances failed', err);
  }
};

export const logOut = async () => {
  await apiPost('users/logout/user');
  store.dispatch({
    type: TYPE.CLEAR_USER_STATUS,
    payload: null,
  });
};

export const loadOwnedTokens = async () => {
  const result = await apiPost('users/list/tokens');
  console.error(result);
  store.dispatch({
    type: TYPE.SET_USER_OWNED_TOKENS,
    payload: result,
  });
};

export const loadAccounts = legacyMode
  ? // Legacy Mode
    async () => {
      const accList = await rpc('listaccounts', []);

      const addrList = await Promise.all(
        Object.keys(accList || {}).map(account =>
          rpc('getaddressesbyaccount', [account])
        )
      );

      const validateAddressPromises = addrList.reduce(
        (list, element) => [
          ...list,
          ...element.map(address => rpc('validateaddress', [address])),
        ],
        []
      );
      const validations = await Promise.all(validateAddressPromises);

      const accountList = [];
      validations.forEach(e => {
        if (e.ismine && e.isvalid) {
          const index = accountList.findIndex(ele => ele.account === e.account);
          const indexDefault = accountList.findIndex(
            ele => ele.account === 'default'
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

      accountList.forEach(acc => {
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
        const accounts = await apiPost('users/list/accounts');
        store.dispatch({ type: TYPE.SET_TRITIUM_ACCOUNTS, payload: accounts });
      } catch (err) {
        console.error('users/list/accounts failed', err);
      }
    };

export const updateAccountBalances = async () => {
  const accList = await rpc('listaccounts', []);
  store.dispatch({ type: TYPE.UPDATE_MY_ACCOUNTS, payload: accList });
};
