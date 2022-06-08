import * as TYPE from 'consts/actionTypes';

const initialState = null;

export default (state = initialState, action) => {
  switch (action.type) {
    case '@@INIT':
      return (
        JSON.parse(window.sessionStorage.getItem('currentSession')) || null
      );
    case TYPE.LOGIN:
    case TYPE.SWITCH_USER:
      window.sessionStorage.setItem(
        'currentSession',
        JSON.stringify(action.payload.session)
      );
      return action.payload.session || initialState;

    case TYPE.DISCONNECT_CORE:
    case TYPE.LOGOUT:
      window.sessionStorage.removeItem('currentSession');
      return initialState;

    default:
      return state;
  }
};
