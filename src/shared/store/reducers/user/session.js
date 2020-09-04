import * as TYPE from 'consts/actionTypes';

const initialState = null;

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.LOGIN:
      return action.payload.session;

    case TYPE.LOGOUT:
      return initialState;

    default:
      return state;
  }
};
