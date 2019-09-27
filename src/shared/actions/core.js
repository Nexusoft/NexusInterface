import { remote } from 'electron';

import rpc from 'lib/rpc';
import * as ac from 'actions/setupApp';
import * as TYPE from 'consts/actionTypes';
import { legacyMode } from 'consts/misc';
import { apiPost } from 'lib/tritiumApi';

const getSystemInfo = () => async dispatch => {
  try {
    const systemInfo = await apiPost('system/get/info');
    dispatch({ type: TYPE.SET_SYSTEM_INFO, payload: systemInfo });
  } catch (err) {
    dispatch({ type: TYPE.CLEAR_CORE_INFO });
    console.error('system/get/info failed', err);
    // Throws error so getInfo fails and autoFetchCoreInfo will
    // switch to using dynamic interval.
    throw err;
  }
};

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

export const getInfo = legacyMode
  ? // Legacy
    () => async dispatch => {
      dispatch(ac.AddRPCCall('getInfo'));
      try {
        const info = await rpc('getinfo', []);
        dispatch({ type: TYPE.GET_INFO, payload: info });
      } catch (err) {
        dispatch({ type: TYPE.CLEAR_CORE_INFO });
        console.error(err);
        throw err;
      }
    }
  : // Tritium
    getSystemInfo;

export const getBalances = () => async dispatch => {
  try {
    const balances = await apiPost('finance/get/balances');
    dispatch({ type: TYPE.SET_BALANCES, payload: balances });
  } catch (err) {
    dispatch({ type: TYPE.CLEAR_BALANCES });
    console.error('finance/get/balances failed', err);
  }
};

export const getMiningInfo = () => async dispatch => {
  try {
    const miningInfo = await apiPost('ledger/get/mininginfo');
    dispatch({ type: TYPE.SET_MINING_INFO, payload: miningInfo });
  } catch (err) {
    dispatch({ type: TYPE.CLEAR_MINING_INFO });
    console.error('ledger/get/mininginfo failed', err);
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

export const getDifficulty = () => async dispatch => {
  const diff = await rpc('getdifficulty', []);
  dispatch({ type: TYPE.GET_DIFFICULTY, payload: diff });
};

const stopAutoConnect = () => ({
  type: TYPE.STOP_CORE_AUTO_CONNECT,
});

const startAutoConnect = () => ({
  type: TYPE.START_CORE_AUTO_CONNECT,
});

export const stopCore = () => async (dispatch, getState) => {
  dispatch({ type: TYPE.CLEAR_CORE_INFO });
  await remote.getGlobal('core').stop();
  const { manualDaemon } = getState().settings;
  if (!manualDaemon) {
    dispatch(stopAutoConnect());
  }
};

export const startCore = () => async dispatch => {
  await remote.getGlobal('core').start();
  dispatch(startAutoConnect());
};

export const restartCore = () => async dispatch => {
  dispatch({ type: TYPE.CLEAR_CORE_INFO });
  await remote.getGlobal('core').restart();
  dispatch(startAutoConnect());
};
