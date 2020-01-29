import * as TYPE from 'consts/actionTypes';

const initialState = [];

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.SET_INVOICES:
      return action.payload;
    default:
      return state;
  }
};
