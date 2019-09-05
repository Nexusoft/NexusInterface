import * as TYPE from 'consts/actionTypes';

const initialState = [];

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.MY_TRITIUM_ACCOUNTS:
      return action.payload;

    default:
      return state;
  }
};
