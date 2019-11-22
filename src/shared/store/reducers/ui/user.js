import * as TYPE from 'consts/actionTypes';

const initialState = {
  lastActiveTab: 'Accounts',
  balancesShowFiat: false,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.SWITCH_USER_TAB:
      return {
        ...state,
        lastActiveTab: action.payload,
      };

    case TYPE.USERS_BALANCE_DISPLAY_FIAT:
      return {
        ...state,
        balancesShowFiat: action.payload,
      };

    default:
      return state;
  }
};
