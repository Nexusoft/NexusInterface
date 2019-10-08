import * as TYPE from 'consts/actionTypes';

const initialState = null;

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.SET_ACTIVE_APP_MODULE:
      return {
        webview: action.payload.webview,
        moduleName: action.payload.moduleName,
      };

    case TYPE.UNSET_ACTIVE_APP_MODULE:
      return initialState;

    default:
      return state;
  }
};
