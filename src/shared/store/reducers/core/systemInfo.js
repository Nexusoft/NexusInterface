import * as TYPE from 'consts/actionTypes';

const initialState = null;

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.SET_SYSTEM_INFO:
      return action.payload;

    case TYPE.DISCONNECT_CORE:
      return initialState;

    default:
      return state;
  }
};
