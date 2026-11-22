import * as TYPE from 'consts/actionTypes';

export default (state = false, action) => {
  switch (action.type) {
    case TYPE.DISCONNECT_CORE:
      return action.connectionFailed === true;
    case TYPE.SET_SYSTEM_INFO:
    case TYPE.START_CORE_AUTO_CONNECT:
    case TYPE.STOP_CORE_AUTO_CONNECT:
      return false;
    default:
      return state;
  }
};
