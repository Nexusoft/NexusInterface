import * as TYPE from 'consts/actionTypes';

const initialState = null;

export default (state = initialState, action) => {
  switch (action.type) {
    case '@@INIT':
      return window.sessionStorage.getItem('LoggedInUsername') || null;
    case TYPE.LOGIN:
    case TYPE.SWITCH_USER:
      window.sessionStorage.setItem(
        'LoggedInUsername',
        action.payload.username
      );
      return action.payload.username;

    case TYPE.DISCONNECT_CORE:
    case TYPE.CLEAR_USER:
    case TYPE.LOGOUT:
      window.sessionStorage.removeItem('LoggedInUsername');
      return initialState;

    default:
      return state;
  }
};
