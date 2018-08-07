import * as TYPE from "../actions/actiontypes";

const initialState = {
  refundAddress: "",
  toAddress: "",
  fromAddress: "",
  availableCoins: {},
  from: "",
  to: ""
};

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.AVAILABLE_COINS:
      return {
        ...state,
        availableCoins: action.payload
      };
      break;
    case TYPE.FROM_SETTER:
      return {
        ...state,
        from: action.payload
      };
      break;
    case TYPE.TO_SETTER:
      return {
        ...state,
        to: action.payload
      };
      break;
    default:
      return state;
  }
};
