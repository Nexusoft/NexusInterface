import * as TYPE from "../actiontypes";

const defaultState = {};

export default (state = defaultState, action) => {
  switch (action.type) {
    case TYPE.APP_LOAD:
      return {
        ...state,
        appLoaded: true
      };
    case TYPE.GET_INFO_DUMP:
      return {
        ...state,
        ...action.payload
      };
    default:
      return state;
  }
};
