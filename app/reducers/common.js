import * as TYPE from "../actiontypes";

const initialState = {};

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.GET_INFO_DUMP:
      return {
        ...state,
        ...action.payload
      };
    default:
      return state;
  }
};
