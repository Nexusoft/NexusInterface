import * as TYPE from 'consts/actionTypes';

const initialState = {};

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.GET_BALANCES:
      return action.payload;

    case TYPE.CLEAR_CORE_INFO:
      return initialState;

    case TYPE.CLEAR_BALANCES:
      return initialState;

    default:
      return state;
  }
};
