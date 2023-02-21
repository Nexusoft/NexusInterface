import * as TYPE from 'consts/actionTypes';

const initialState = false;

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.ASK_START_STAKING:
      return true;

    case TYPE.DISCONNECT_CORE:
    case TYPE.ACTIVE_USER:
    case TYPE.CLEAR_USER:
    case TYPE.LOGOUT:
      return initialState;

    default:
      return state;
  }
};
