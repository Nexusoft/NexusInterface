import * as TYPE from 'consts/actionTypes';

const initialState = {};

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.SET_SYSTEM_INFO:
      return action.payload;

    case TYPE.CLEAR_CORE_INFO:
      return initialState;

    default:
      return state;
  }
};
