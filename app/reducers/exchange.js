import * as TYPE from "../actions/actiontypes";

const initialState = {
  refundAddress: "",
  toAddress: "",
  fromAddress: "",
  availableCoins: []
};

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.AVAILABLE_COINS:
      return {
        ...state,
        availableCoins: action.payload
      };
      break;
    default:
      return state;
  }
};
