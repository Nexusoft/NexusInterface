import * as TYPE from 'consts/actionTypes';

const initialState = {
  lastActiveTab: 'Balances',
};

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.SWITCH_USER_TAB:
      return {
        ...state,
        lastActiveTab: action.payload,
      };

    default:
      return state;
  }
};
