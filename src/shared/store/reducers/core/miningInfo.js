import * as TYPE from 'consts/actionTypes';

const initialState = {};

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.SET_MINING_INFO:
      return action.payload;

    case TYPE.CLEAR_CORE_INFO:
    case TYPE.CLEAR_MINING_INFO:
      return initialState;

    default:
      return state;
  }
};
