import * as TYPE from 'consts/actionTypes';

const initialState = false;

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.CLOSE_WALLET: {
      return true;
    }

    default:
      return state;
  }
};
