import * as TYPE from 'consts/actionTypes';

const initialState = false;

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.LOCK_SCREEN: {
      return action.payload;
    }
    default:
      return state;
  }
};
