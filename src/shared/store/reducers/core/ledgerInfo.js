import * as TYPE from 'consts/actionTypes';

const initialState = {};

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.SET_LEDGER_INFO:
      return action.payload;

    case TYPE.DISCONNECT_CORE:
    case TYPE.CLEAR_LEDGER_INFO:
      return initialState;

    default:
      return state;
  }
};
