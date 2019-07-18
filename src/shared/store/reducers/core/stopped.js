// Marking if core is manually stopped by user
import * as TYPE from 'consts/actionTypes';

const initialState = false;

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.STOP_CORE:
      return true;

    case TYPE.START_CORE:
      return false;

    default:
      return state;
  }
};
