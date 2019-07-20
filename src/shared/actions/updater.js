import * as TYPE from 'consts/actionTypes';

export const setUpdaterState = state => ({
  type: TYPE.SET_UPDATER_STATE,
  payload: state,
});
