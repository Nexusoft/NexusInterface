import * as TYPE from 'consts/actionTypes';

const initialState = {};

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.SET_STAKE_INFO:
      return action.payload || initialState;

    case TYPE.ACTIVE_USER:
      return action.payload.stakeInfo || initialState;

    case TYPE.DISCONNECT_CORE:
    case TYPE.CLEAR_USER:
    case TYPE.CLEAR_STAKE_INFO:
    case TYPE.LOGOUT:
      return initialState;

    default:
      return state;
  }
};
