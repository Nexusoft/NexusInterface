import * as TYPE from 'actions/actiontypes';
import { filterValidSettings } from 'api/settings';

const initialState = {};

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.UPDATE_SETTINGS:
      return { ...state, ...filterValidSettings(action.payload) };
    default:
      return state;
  }
};
