import * as TYPE from 'consts/actionTypes';

export const setCurrentUser = username => ({
  type: TYPE.SET_CURRENT_USER,
  payload: username,
});

export const setCurrentUserGenesis = genesis => ({
  type: TYPE.SET_CURRENT_USER_GENESIS,
  payload: genesis,
});

export const logOutUser = () => ({
  type: TYPE.LOGOUT_USER,
  payload: null,
});
