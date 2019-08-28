import * as TYPE from 'consts/actionTypes';

const initialState = {};

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.GET_STAKE_INFO:
      return action.payload;

    case TYPE.CLEAR_CORE_INFO:
    case TYPE.CLEAR_USER_STATUS:
    case TYPE.CLEAR_STAKE_INFO:
      return initialState;

    default:
      return state;
  }
};
