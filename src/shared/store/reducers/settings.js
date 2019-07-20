import * as TYPE from 'consts/actionTypes';
import { filterValidSettings } from 'lib/settings';

const initialState = {};

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.UPDATE_SETTINGS:
      return { ...state, ...filterValidSettings(action.payload) };
    default:
      return state;
  }
};
