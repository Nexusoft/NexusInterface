import * as TYPE from 'consts/actionTypes';

const initialState = {};

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.GET_INFO:
      return action.payload;

    case TYPE.DISCONNECT_CORE:
      return initialState;

    default:
      return state;
  }
};
