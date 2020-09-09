import * as TYPE from 'consts/actionTypes';

const initialState = null;

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.LOGIN:
    case TYPE.SWITCH_USER:
      return action.payload.session || initialState;

    case TYPE.DISCONNECT_CORE:
    case TYPE.LOGOUT:
      return initialState;

    default:
      return state;
  }
};
