// Marking if the wallet should auto connect to the core
// This should be false if user has stopped the core AND remote core mode is off
import * as TYPE from 'consts/actionTypes';

const initialState = true;

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.STOP_CORE_AUTO_CONNECT:
      return false;

    case TYPE.START_CORE_AUTO_CONNECT:
      return true;

    default:
      return state;
  }
};
