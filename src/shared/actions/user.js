import * as TYPE from 'consts/actionTypes';

export const setUnlockedStatus = unlocked => ({
  type: TYPE.SET_UNLOCKED_STATUS,
  payload: unlocked,
});

export const logOutUser = () => ({
  type: TYPE.CLEAR_USER_STATUS,
  payload: null,
});
