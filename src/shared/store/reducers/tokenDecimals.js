import * as TYPE from 'consts/actionTypes';

const initialState = {};

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.SET_TOKEN_DECIMALS: {
      const list = Array.isArray(action.payload)
        ? action.payload
        : [action.payload];
      const newState = { ...state };
      list.forEach(({ address, decimals }) => {
        newState[address] = decimals;
      });
      return newState;
    }

    default:
      return state;
  }
};
