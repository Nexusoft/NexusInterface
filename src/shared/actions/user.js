import * as TYPE from 'consts/actionTypes';

export const setCurrentUser = (username, genesis) => ({
  type: TYPE.SET_CURRENT_USER,
  payload: { username, genesis },
});

export const setCurrentUserGenesis = genesis => ({
  type: TYPE.SET_CURRENT_USER_GENESIS,
  payload: genesis,
});

export const logOutUser = () => ({
  type: TYPE.CLEAR_USER_STATUS,
  payload: null,
});
