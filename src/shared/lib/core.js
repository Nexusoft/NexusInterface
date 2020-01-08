import { ipcRenderer } from 'electron';

import rpc from 'lib/rpc';
import * as TYPE from 'consts/actionTypes';
import store from 'store';
import { apiPost } from 'lib/tritiumApi';

const stopAutoConnect = () => ({
  type: TYPE.STOP_CORE_AUTO_CONNECT,
});

const startAutoConnect = () => ({
  type: TYPE.START_CORE_AUTO_CONNECT,
});

export const getMiningInfo = async () => {
  try {
    const miningInfo = await apiPost('ledger/get/mininginfo');
    store.dispatch({ type: TYPE.SET_MINING_INFO, payload: miningInfo });
  } catch (err) {
    store.dispatch({ type: TYPE.CLEAR_MINING_INFO });
    console.error('ledger/get/mininginfo failed', err);
  }
};

export const getDifficulty = async () => {
  const diff = await rpc('getdifficulty', []);
  store.dispatch({ type: TYPE.GET_DIFFICULTY, payload: diff });
};

export const stopCore = async () => {
  store.dispatch({ type: TYPE.CLEAR_CORE_INFO });
  await ipcRenderer.invoke('stop-core');
  const { manualDaemon } = store.getState().settings;
  if (!manualDaemon) {
    store.dispatch(stopAutoConnect());
  }
};

export const startCore = async () => {
  await ipcRenderer.invoke('start-core');
  store.dispatch(startAutoConnect());
};

export const restartCore = async () => {
  store.dispatch({ type: TYPE.CLEAR_CORE_INFO });
  await ipcRenderer.invoke('restart-core');
  store.dispatch(startAutoConnect());
};
