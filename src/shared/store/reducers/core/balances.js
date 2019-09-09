import * as TYPE from 'consts/actionTypes';

const initialState = null;

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.SET_BALANCES:
      return action.payload;

    case TYPE.CLEAR_CORE_INFO:
    case TYPE.CLEAR_USER_STATUS:
    case TYPE.CLEAR_BALANCES:
      return initialState;

    default:
      return state;
  }
};
