import * as TYPE from 'consts/actionTypes';

const initialState = null;

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.SET_USER_STATUS:
      return action.payload;

    case TYPE.LOGIN:
      return action.payload.status;

    case TYPE.CLEAR_CORE_INFO:
    case TYPE.LOGOUT:
      return initialState;

    case TYPE.LOGOUT_USER:
      return initialState;
    default:
      return state;
  }
};
