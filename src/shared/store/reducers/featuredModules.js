import * as TYPE from 'consts/actionTypes';

const initialState = null;

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.LOAD_FEATURED_MODULES:
      return action.payload;

    default:
      return state;
  }
};
