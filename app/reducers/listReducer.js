import * as TYPE from "../actiontypes";

const initialState = {};

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.GET_TRUST_LIST:
      return {
        ...state,
        ...action.payload
      };
    default:
      return state;
  }
};
