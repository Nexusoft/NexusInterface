import * as TYPE from 'consts/actionTypes';
import { filterValidSettings } from 'lib/settings';

const initialState = {};

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.UPDATE_SETTINGS:
      delete state.tempSettings;
      return { ...state, ...filterValidSettings(action.payload) };
    case TYPE.UPDATE_TEMP_SETTINGS:
      let diff = false;
      Object.keys(action.payload).forEach(element => {
        if (action.payload[element] != state[element]) {
          diff = true;
        }
      });
      if (!diff) {
        delete state.tempSettings;
        return { ...state };
      } else {
        return {
          ...state,
          tempSettings: { ...state.tempSettings, ...action.payload },
        };
      }

    default:
      return state;
  }
};
