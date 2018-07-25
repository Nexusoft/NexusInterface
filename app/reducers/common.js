import * as TYPE from "../actions/actiontypes";

const initialState = {
  loggedIn: false
};

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.LOCK:
      return {
        ...state,
        loggedIn: false
      };
    case TYPE.UNLOCK:
      return {
        ...state,
        loggedIn: true
      };
    default:
      return state;
  }
};
