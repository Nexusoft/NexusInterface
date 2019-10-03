import * as TYPE from 'consts/actionTypes';
import { apiPost } from 'lib/tritiumApi';

const getStakeInfo = () => async dispatch => {
  try {
    const stakeInfo = await apiPost('finance/get/stakeinfo');
    dispatch({ type: TYPE.SET_STAKE_INFO, payload: stakeInfo });
  } catch (err) {
    dispatch({ type: TYPE.CLEAR_STAKE_INFO });
    console.error('finance/get/stakeinfo failed', err);
  }
};

export const getUserStatus = () => async dispatch => {
  try {
    const userStatus = await apiPost('users/get/status');
    dispatch({ type: TYPE.SET_USER_STATUS, payload: userStatus });

    dispatch(getStakeInfo());
  } catch (err) {
    dispatch({ type: TYPE.CLEAR_USER_STATUS });
  }
};

export const getBalances = () => async dispatch => {
  try {
    const balances = await apiPost('finance/get/balances');
    dispatch({ type: TYPE.SET_BALANCES, payload: balances });
  } catch (err) {
    dispatch({ type: TYPE.CLEAR_BALANCES });
    console.error('finance/get/balances failed', err);
  }
};

export const listAccounts = () => async dispatch => {
  try {
    const accounts = await apiPost('users/list/accounts');
    dispatch({ type: TYPE.SET_TRITIUM_ACCOUNTS, payload: accounts });
  } catch (err) {
    console.error('users/list/accounts failed', err);
  }
};
