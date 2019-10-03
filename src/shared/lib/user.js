import * as TYPE from 'consts/actionTypes';
import store from 'store';
import { apiPost } from 'lib/tritiumApi';

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

    store.dispatch(getStakeInfo());
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

export const listAccounts = async () => {
  try {
    const accounts = await apiPost('users/list/accounts');
    store.dispatch({ type: TYPE.SET_TRITIUM_ACCOUNTS, payload: accounts });
  } catch (err) {
    console.error('users/list/accounts failed', err);
  }
};
