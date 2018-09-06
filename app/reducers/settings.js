import * as TYPE from "../actions/actiontypes";

const initialState = {
  manualDaemon: true,
  acceptedagreement: false,
  experimentalWarning: true,
  windowWidth: 1600,
  windowHeight: 1388,
  devMode: false
};

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.GET_SETTINGS:
      return {
        ...state,
        ...action.payload
      };
    default:
      return state;
  }
};
