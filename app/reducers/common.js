import * as TYPE from "../actiontypes";

const defaultState = {};

export default (state = defaultState, action) => {
  switch (action.type) {
    case TYPE.APP_LOAD:
      return {
        ...state,
        appLoaded: true
      };
    default:
      return state;
  }
};
