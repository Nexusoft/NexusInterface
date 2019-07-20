import { remote } from 'electron';

import rpc from 'lib/rpc';
import * as ac from 'actions/setupApp';
import * as TYPE from 'consts/actionTypes';

export const getInfo = () => async dispatch => {
  dispatch(ac.AddRPCCall('getInfo'));
  try {
    const info = await rpc('getinfo', []);
    dispatch({ type: TYPE.GET_INFO, payload: info });
  } catch (err) {
    dispatch(clearCoreInfo());
    console.error(err);
    throw err;
  }
};

export const clearCoreInfo = () => ({
  type: TYPE.CLEAR_CORE_INFO,
});

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
  await remote.getGlobal('core').stop();
  dispatch(clearCoreInfo());
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
  await remote.getGlobal('core').restart();
  dispatch(startAutoConnect());
};
