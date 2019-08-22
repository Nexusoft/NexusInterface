import * as TYPE from 'consts/actionTypes';

export const setCurrentUser = username => ({
  type: TYPE.SET_CURRENT_USER,
  payload: username,
});
