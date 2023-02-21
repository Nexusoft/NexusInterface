import * as TYPE from 'consts/actionTypes';

const initialState = null;

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.SET_NAMESPACES:
      return action.payload;

    case TYPE.DISCONNECT_CORE:
    case TYPE.ACTIVE_USER:
    case TYPE.CLEAR_USER:
    case TYPE.LOGOUT:
      return initialState;

    default:
      return state;
  }
};
