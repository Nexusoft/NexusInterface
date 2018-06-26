import * as TYPE from "../actiontypes";

const initialState = {
  acc: true
};

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.GET_TRUST_LIST:
      return {
        ...state,
        trustlist: [...action.payload]
      };
    case TYPE.TOGGLE_SORT_DIRECTION:
      return {
        ...state,
        acc: !state.acc
      };
    default:
      return state;
  }
};
