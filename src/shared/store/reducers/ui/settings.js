import * as TYPE from 'consts/actionTypes';

const initialState = {
  lastActiveTab: 'App',
  restartCoreOnSave: true,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.SWITCH_SETTINGS_TAB:
      return {
        ...state,
        lastActiveTab: action.payload,
      };

    case TYPE.SET_CORE_SETTINGS_RESTART:
      return {
        ...state,
        restartCoreOnSave: action.payload,
      };

    default:
      return state;
  }
};
