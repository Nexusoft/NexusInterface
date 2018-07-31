import * as TYPE from "../actions/actiontypes";

const initialState = {
  loggedIn: false,
  googleanalytics:null
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
    case TYPE.SET_GOOGLEANALYTICS:
      return {
        ...state,
        googleanalytics: action.payload
      };
    default:
      return state;
  }
};
